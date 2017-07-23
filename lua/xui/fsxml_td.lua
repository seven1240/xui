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
 * Liyang <liyang@x-y-t.cn>
 * MariahYang <yangxiaojin@x-y-t.cn>
 *
 *
 */
]]


function __FILE__() return debug.getinfo(2,'S').source end
function __LINE__() return debug.getinfo(2, 'l').currentline end
function __FUNC__() return debug.getinfo(1).name end

if XML_REQUEST then
	section =   XML_REQUEST["section"]
	tag_name =  XML_REQUEST["tag_name"]
	key_name =  XML_REQUEST["key_name"]
	key_value = XML_REQUEST["key_value"]
elseif env then
	section =     env:getHeader("section")
	tag_name =    env:getHeader("tag_name")
	key_name =    env:getHeader("key_name")
	key_value =   env:getHeader("key_value")
	from_client = env:getHeader("from_client")
end

local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)[^/]+$", "%1")

package.path = package.path .. ";/etc/xtra/?.lua"
package.path = package.path .. ";" .. cur_dir .. "?.lua"
package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"

if from_client then
	package.path = package.path .. ";" .. cur_dir .. "fsxml/td/" .. tag_name .. "/?.lua"

	require 'xtra'

	xtra.start_session()
	xtra.require_login()
	content_type("text/xml")
else
	package.path = package.path .. ";" .. cur_dir .. "fsxml/" .. tag_name .. "/?.lua"
end

require 'utils'
require 'xdb'
require 'xtra_config'

local do_debug = config.do_debug
-- do_debug = true

if do_debug then
	print("section: " .. section)
	print("tag_name: " .. tag_name)
	print("key_name: " .. key_name)
	print("key_value: " .. key_value)
	if params then print(params:serialize()) end
end


if not from_client or (from_client and section == "configuration" and key_value == "portaudio.conf") then
	if config.db_auto_connect then xdb.connect(config.dsn) end

	if section == "directory" then
		if params then
			action = params:getHeader("action")
			user = params:getHeader("user")
		elseif env then
			action = env:getHeader("action")
			user = env:getHeader("user")
		end

		pkg = cur_dir .. "fsxml/td/directory.lua"

		if (action == "jsonrpc-authenticate" or action == "sip_auth") and (user and user ~= "admin") then
			api = freeswitch.API()
			if action == "jsonrpc-authenticate" then
				ret = api:execute("verto_contact", user)
			else
				ret = api:execute("sofia_contact", user)
			end

			if string.find(ret, "error/user_not_registered") then
				ret1 = api:execute("mips", "get licence_user")
				ret2 = api:execute("show", "registrations count")

				licence_user = ret1:match("%d+")
				registrations = ret2:match("%d+")
				if tonumber(registrations) >= tonumber(licence_user) then
					if params then
						params:addHeader("invalid_user", "true")
					elseif env then
						env:addHeader("invalid_user", "true")
					end
				end
			end

		end

	elseif section == "dialplan" then
		pkg = cur_dir .. "fsxml/dialplan.lua"
	else
		if from_client then
			pkg = cur_dir .. "fsxml/td/" .. tag_name .. "/" .. key_value .. ".lua"
		else
			pkg = cur_dir .. "fsxml/" .. tag_name .. "/" .. key_value .. ".lua"
		end

	end

	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", pkg)
	end

	f, e = loadfile(pkg)
	if f then
		f()
		if XML_STRING then
			XML_STRING = [[<document type="freeswitch/xml">
				<section name="]] .. section .. [[">]] ..
					XML_STRING .. [[
				</section>
			</document>]]
		else
			XML_STRING = "<xml></xml>"
		end

	else
		if not e:match("No such file") then
			freeswitch.consoleLog("ERR", e .. "\n")
		end
		XML_STRING = "<xml></xml>"
	end

	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", XML_STRING)
	end
else
	XML_STRING = "<xml></xml>"
end

if from_client then
	post('/', function(params)
		return XML_STRING
	end)
end