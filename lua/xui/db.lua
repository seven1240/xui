--[[
/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2013-2017, Seven Du <dujinfang@x-y-t.cn>
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

	Catch Event in Lua: lua.conf.xml

	<hook event="CUSTOM" subclass="fifo::info" script="/usr/local/freeswitch/xui/lua/xui/catch-event.lua"/>
]]

local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)[^/]+$", "%1")

package.path = package.path .. ";/etc/xtra/?.lua"
package.path = package.path .. ";" .. cur_dir .. "?.lua"
package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"

require 'utils'
require 'xtra_config'
require 'xdb'

if config.db_auto_connect then xdb.connect(config.dsn) end

local first = true

local sql = table.concat(argv, " ")

xdb.find_by_sql(sql, function(row)
	local comma = ""
	if first then
		for k,v in pairs(row) do
			stream:write(comma .. k)
			comma = ","
		end
	end
	first = false

	comma = ""
	for k,v in pairs(row) do
		stream:write(comma .. v)
		comma = ","
	end
	stream:write("\n")
end)

stream:write("\n")
stream:write("rows: " .. xdb.affected_rows() .. "\n")
