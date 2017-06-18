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

require 'xtra_config'

local do_debug = config.do_debug
-- do_debug = true

if do_debug then
	require 'utils'
end

m_dialstring = {}

require 'xdb'
xdb.bind(xtra.dbh)

require 'sqlescape'
local escape = sqlescape.EscapeFunction()

local context = "default"

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
	print(s)
	if not s then return '' end
	return s
end

function build(dest, context, cid_number)
	local dialstr = "error/no_route_destination"

	if not context then context = "default" end

	local sql = "SELECT * FROM routes WHERE context = '" .. context .. "' AND " .. escape(dest) .. " LIKE prefix || '%' ORDER BY length(prefix) DESC LIMIT 1"
	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", sql)
	end

	xdb.find_by_sql(sql, function(row)
		if row.dnc and not (row.dnc == '') then
			dest = utils.apply_dnc(dest, row.dnc)
		end

		if do_debug then
			utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", row.dest_type)
		end

		if cid_number and row.sdnc and not (row.sdnc == '') then
			cid_number = utils.apply_dnc(cid_number, row.sdnc)
		end

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
				if app == "bridge" then
					return data
				end
			end
			return "loopback/" .. dest
		elseif (row.dest_type == 'FS_DEST_USER') then
			dialstr = "user/" .. dest
		elseif (row.dest_type == 'FS_DEST_GATEWAY') then
			dialstr = "sofia/gateway/" .. row.body .. "/" .. dest
		elseif (row.dest_type == 'FS_DEST_IP') then
			dialstr = "sofia/default/" .. dest .. "@" .. row.body
		elseif (row.dest_type == 'FS_DEST_IVRBLOCK') then
			local block_prefix = config.block_path .. "/blocks-"
			dialstr = "loopback/app=lua:" .. block_prefix .. row.dest_uuid .. ".lua"
		elseif (row.dest_type == 'FS_DEST_CONFERENCE') then
			dialstr = "loopback/" .. dest
		end
	end)

	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", dialstr)
	end

	return dialstr
end

m_dialstring.build = build
