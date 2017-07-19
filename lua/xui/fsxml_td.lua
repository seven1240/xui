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
 *
 *
 */
]]

function __FILE__() return debug.getinfo(2,'S').source end
function __LINE__() return debug.getinfo(2, 'l').currentline end
function __FUNC__() return debug.getinfo(1).name end

local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)[^/]+$", "%1")

xtra.start_session()
xtra.require_login()

content_type("text/xml")

require 'xdb'
xdb.bind(xtra.dbh)

-- freeswitch.consoleLog("INFO", xtra.session.user_id .. "\n")

function xml_handler(params)
	XML_STRING = "<xml></xml>"

	if next(params) == nil or not params.request then
		section =   env:getHeader("section")
		tag_name =  env:getHeader("tag_name")
		key_name =  env:getHeader("key_name")
		key_value = env:getHeader("key_value")
	else
		section =   params.request.section
		tag_name =  params.request.tag_name
		key_name =  params.request.key_name
		key_value = params.request.key_value
	end

	if section and tag_name and key_name and key_value and section == "configuration" and key_value == "portaudio.conf" then
		package.path = package.path .. ";/etc/xtra/?.lua"
		package.path = package.path .. ";" .. cur_dir .. "?.lua"
		package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"
		package.path = package.path .. ";" .. cur_dir .. "fsxml/td/" .. tag_name .. "/?.lua"

		require 'utils'
		require 'xdb'
		require 'xtra_config'

		local do_debug = config.do_debug

		if do_debug then
			print("section: " .. section)
			print("tag_name: " .. tag_name)
			print("key_name: " .. key_name)
			print("key_value: " .. key_value)
		end

		pkg = cur_dir .. "fsxml/td/" .. tag_name .. "/" .. key_value .. ".lua"

		if do_debug then
			utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", pkg)
		end

		f, e = loadfile(pkg)
		if f then
			f()
			if XML_STRING then
				XML_STRING = [[<document type="freeswitch/xml">]] .. "\n" ..
					[[<section name="]] .. section .. [[">]] .. "\n" ..
						XML_STRING .. [[</section>]] .. "\n" ..
				[[</document>]]
			else
				XML_STRING = "<xml></xml>"
			end

		else
			if not e:match("No such file") then
				freeswitch.consoleLog("ERR", e .. "\n")
			end
			XML_STRING = "<xml></xml>"
		end
	end

	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", XML_STRING)
	end

	return 200, XML_STRING

end

post('/', function(params)
	return xml_handler(params)
end)
