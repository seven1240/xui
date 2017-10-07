--[[
/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2017, Seven Du <dujinfang@x-y-t.cn>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is XUI - GUI for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Seven Du <dujinfang@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Seven Du <dujinfang@x-y-t.cn>
 *
 *
 */
]]

local gw_name = params:getHeader("gateway")
local profile_name = params:getHeader("profile")
local globals = {}

-- freeswitch.consoleLog("ERR", "fetching gateway " .. gw_name .. "\n")

function get_globals() -- global vars
	local api = freeswitch.API()
	local ret = api:execute("global_getvar")

	for line in ret:gmatch("[^\n]+") do
		local k, v = line:match("([^=]+)=([^=]*)")
		-- print("================= k: " .. k .. " v: " .. v)
		globals[k] = v
	end
end

function expand(s)
	e = s:gsub("%$%${[^}]+}", function(token)
		local k = token:sub(4, -2)
		-- freeswitch.consoleLog('INFO', token .. '\n')
		r = globals[k]
		if not r then
			r = token
		end
		return r
	end)
	return e
end

function build_globals() -- SOFIA global settings
	local p = ""

	xdb.find_by_cond("params", {realm = 'SOFIAGLOBALS', ref_id = 0, disabled = 0}, "id", function(row)
		p = p .. '<param name="' .. row.k .. '"' .. ' value="' .. row.v .. '"/>'
	end)
	return p
end


function build_gateways(cond)
	local gws = ""

	xdb.find_by_cond("gateways", cond, "id", function(row)
		local p = '<param name="realm"' .. ' value="' .. row.realm .. '"/>'
		p = p .. '<param name="username"' .. ' value="' .. row.username .. '"/>'
		p = p .. '<param name="password"' .. ' value="' .. row.password .. '"/>'
		p = p .. '<param name="register"' .. ' value="' .. row.register .. '"/>'

		xdb.find_by_cond("params", {realm = 'gateway', ref_id = row.id, disabled = 0}, "id", function(row)
			p = p .. '<param name="' .. row.k .. '"' .. ' value="' .. row.v .. '"/>'
		end)

		local gw = '<gateway name="' .. row.name .. '">' .. p .. '</gateway>'

		gws = gws .. gw
	end)

	return gws
end

function build_aliases(profile_name)
	return [[<alias name="internal"/>]]
end

function build_domains(profile_name)
	return [[<domain name="all" alias="true" parse="false"/>]]
end

function build_profile(profile)
	local settings = ""
	local cond = {realm = 'sip_profile', disabled = 0, ref_id = profile.id}
	local aliases = ""
	local domains = ""
	local gateways = ""

	if profile.name == 'default' then
		aliases = build_aliases(profile.name)
		domains = build_domains(profile.name)
	end

	gateways = build_gateways({profile_id = profile.id})

	xdb.find_by_cond("params", cond, 'id', function(row)
		settings = settings .. '<param name="' .. row.k .. '" value="' .. expand(row.v) .. '"/>'
	end)

	return [[<profile name="]] .. profile.name .. [["><gateways>]] ..
			gateways ..
			[[</gateways><domains>]] ..
			domains ..
			[[</domains><aliases>]] ..
			aliases ..
			[[</aliases><settings>]] ..
			settings ..
			[[</settings></profile>]]
end

function build_profiles()
	local profiles = ""
	xdb.find_by_cond("sip_profiles", {disabled = 0}, 'id', function(row)
		profiles = profiles .. build_profile(row)
	end)

	return profiles
end

if gw_name then
	local gateways
	if profile_name == nil then
		profile_name = "external"
	end

	xdb.find_by_cond("sip_profiles", {name = profile_name}, 'id', function(row)
		if gw_name == '_all_' then
			gateways = build_gateways({profile_id = row.id})
		else
			gateways = build_gateways({profile_id = row.id, name = gw_name})
		end
	end)

	XML_STRING = [[<configuration name="sofia.conf" description="sofia Endpoint">
		<profiles><profile name="]] .. profile_name ..  [["><gateways>]] .. gateways ..
		[[</gateways></profile></profiles></configuration>]]

elseif profile_name then
	local profile = nil

	xdb.find_by_cond("sip_profiles", {name = profile_name}, 'id', function(row)
		profile = row
	end)

	if (profile) then
		get_globals() -- fetch global vars so we can expand them

		XML_STRING = [[<configuration name="sofia.conf" description="sofia Endpoint">]] ..
			build_globals() ..
			[[<profiles>]] .. build_profile(profile) ..
			[[</profiles></configuration>]]
	end
else -- feed everything on module load
	get_globals() -- fetch global vars so we can expand them

	XML_STRING = [[<configuration name="sofia.conf" description="sofia Endpoint">]] ..
		build_globals() ..
		[[<profiles>]] .. build_profiles() .. [[</profiles></configuration>]]
end
