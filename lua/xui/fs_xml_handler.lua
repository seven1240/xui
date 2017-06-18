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


section =   XML_REQUEST["section"]
tag_name =  XML_REQUEST["tag_name"]
key_name =  XML_REQUEST["key_name"]
key_value = XML_REQUEST["key_value"]


local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)[^/]+$", "%1")

package.path = package.path .. ";/etc/xtra/?.lua"
package.path = package.path .. ";" .. cur_dir .. "?.lua"
package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"
package.path = package.path .. ";" .. cur_dir .. "fsxml/" .. tag_name .. "/?.lua"

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


if config.db_auto_connect then xdb.connect(config.dsn) end

if section == "directory" then
	pkg = cur_dir .. "fsxml/directory.lua"
elseif section == "dialplan" then
	pkg = cur_dir .. "fsxml/dialplan.lua"
else
	pkg = cur_dir .. "fsxml/" .. tag_name .. "/" .. key_value .. ".lua"
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

