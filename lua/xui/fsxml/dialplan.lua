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

function __FILE__() return debug.getinfo(2,'S').source end
function __LINE__() return debug.getinfo(2, 'l').currentline end
function __FUNC__() return debug.getinfo(1).name end

do_debug = true

if do_debug then
	require 'utils'
	utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", params:serialize())
end

require 'sqlescape'
local escape = sqlescape.EscapeFunction()

local actions = ""
local dest = params:getHeader("Hunt-Destination-Number")
local context = params:getHeader("Hunt-Context")
local actions_table = {}
local sql = "SELECT * FROM routes WHERE context = '" .. context .. "' AND " .. escape(dest) .. " LIKE prefix || '%' ORDER BY length(prefix) DESC LIMIT 1"
local found = false


if do_debug then
	utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", sql)
end

local function csplit(str, sep)
	local ret={}
	local n=1
	for w in str:gmatch("([^"..sep.."]*)") do
		ret[n]=ret[n] or w -- only set once (so the blank after a string is ignored)
		if w=="" then n=n+1 end -- step forwards on a blank but not a string
	end
	return ret
end

function nilstr(s)
	-- print(s)
	if not s then return '' end
	return s
end

function build_actions(t)
	for k, v in pairs(t) do
		actions = actions .. '<action application="' .. v.app .. '" data="' .. nilstr(v.data) .. '"/>'
	end
end

xdb.find_by_sql(sql, function(row)
	found = true

	if row.dnc and not (row.dnc == '') then
		dest = utils.apply_dnc(dest, row.dnc)
		table.insert(actions_table, {app = "set", data = "dnc=" .. row.dnc})
		table.insert(actions_table, {app = "set", data = "dnc_number=" .. dest})
	end

	if row.sdnc and not (row.sdnc == '') then
		local cid_number = params:getHeader("Caller-Caller-ID-Number")
		local sdnc_number = utils.apply_dnc(cid_number, row.sdnc)
		table.insert(actions_table, {app = "set", data = "sdnc=" .. row.sdnc})
		table.insert(actions_table, {app = "set", data = "sdnc_number=" .. sdnc_number})
		table.insert(actions_table, {app = "set", data = "effective_caller_id_number=" .. sdnc_number})
	end

	local auto_record

	if row.auto_record == "1" then
		auto_record = "true"
		table.insert(actions_table, {app = "set", data = "auto_record=true"})
	else
		auto_record = params:getHeader("variable_auto_record")
	end

	if auto_record == "true" then
		local record_path = config.recording_path .. "/auto-record-" .. '${strftime(%Y%m%d-%H%M%S)}' .. "-" .. '${uuid}' .. '.wav'
		table.insert(actions_table, {app = "set", data = "auto_record_path=" .. record_path})
		table.insert(actions_table, {app = "record_session", data = record_path})
		table.insert(actions_table, {app = "set", data = "api_hangup_hook=lua xui/record_record.lua"})
	end

	xdb.find_by_cond("params", {realm = "route", ref_id = row.id}, "id", function(app)
		table.insert(actions_table, {app = app.k, data = app.v})
	end)

	if (row.dest_type == 'FS_DEST_SYSTEM') then
		lines = csplit(row.body, "\n")
		for k, v in pairs(lines) do
			local r = string.find(v, "\r")

			if (r) then
				v = v:sub(1, r - 1)
			end

			local t = csplit(v, ' ')
			local app = table.remove(t, 1)
			local data = table.concat(t, ' ')
			if app and (not (app == '') and (not (app:sub(1,1) == '#'))) then
				table.insert(actions_table, {app = app,  data = data})
			end
		end
	elseif (row.dest_type == 'FS_DEST_USER') then
		table.insert(actions_table, {app = "bridge", data = "user/" .. dest})
	elseif (row.dest_type == 'FS_DEST_GATEWAY') then
		table.insert(actions_table, {app = "bridge", data = "sofia/gateway/" .. row.body .. "/" .. dest})
	elseif (row.dest_type == 'FS_DEST_IP') then
		table.insert(actions_table, {app = "bridge", data = "sofia/public/" .. dest .. "@" .. row.body})
	elseif (row.dest_type == 'FS_DEST_IVRBLOCK') then
		local block_prefix = config.block_path .. "/blocks-"
		table.insert(actions_table, {app = "lua", data = block_prefix .. row.dest_uuid .. ".lua"})
	elseif (row.dest_type == 'FS_DEST_CONFERENCE') then
		local cidNumber = params:getHeader('Hunt-Caller-ID-Number')
		local room = xdb.find("conference_rooms", row.dest_uuid)
		local flags = ""

		if cidNumber == room.moderator then
			flags = "+flags{join-vid-floor|moderator}"
		end

		local profile_name = "default"

		if room.profile_id then
			profile = xdb.find("conference_profiles", room.profile_id)
			if profile then
				profile_name = profile.name
			end
		end

		if room then
			conf_name = room.nbr
		else
			conf_name = row.body
		end

		table.insert(actions_table, {app = "conference", data = conf_name .. "-$${domain}@" .. profile_name .. flags})
	elseif (row.dest_type == 'FS_DEST_CONFERENCE_CLUSTER') then
		lines1 = csplit(row.body, "\n")
		local ip = nil
		local lines = {}
		local count = 0
		local index = 0

		for k, v in ipairs(lines1) do
			if not (v == '') then
				table.insert(lines, v)
				count = count + 1
			end
		end

		if count == 0 then
			table.insert(actions_table, {app = "hangup", data = "NO_ROUTE_DESTINATION"})
		elseif count == 1 then
			index = 1
		elseif count == 2 then
			index = os.time() % 2 + 1
		else
			math.randomseed(tostring(os.time()):reverse():sub(1,6))
			index = math.random(count)
		end

		ip = lines[index]

		if index == 1 then -- the first one always join our own
			conf_name = dest
			profile_name = "default"
			flags = ""
			table.insert(actions_table, {app = "conference", data = conf_name .. "-$${domain}@" .. profile_name .. flags})
		elseif index > 1 then
			conf_name = dest
			profile_name = "default"
			flags=""
			table.insert(actions_table, {app = "set", data = "bypass_media=true"})
			table.insert(actions_table, {app = "bridge", data = "sofia/public/" .. conf_name .. '@' .. ip})
		end
	end
end)

if found then
	build_actions(actions_table)
	XML_STRING = [[<context name="]] .. context .. [[">
		<extension name="LUA Dialplan">
			<condition>]] .. actions .. [[</condition>
		</extension>
	</context>]]
end
