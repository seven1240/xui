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

xtra.start_session()
xtra.require_login()

local prefix = config.block_path .. "/blocks-"
require 'xdb'
xdb.bind(xtra.dbh)

get('/', function(params)
	n, blocks = xdb.find_all("blocks")

	if (n > 0) then
		return blocks
	else
		return "[]"
	end
end)

get('/:id', function(params)
	block = xdb.find("blocks", params.id)

	if block then
		local xml_file = prefix .. params.id .. ".xml"

		file = io.open(xml_file, "r")
		if file then
			xml = file:read("*a")
			file:close()

			block.xml = xml
		end

		return block
	else
		return 404
	end
end)

get('/file/:id', function(params)
	local xml_file = prefix .. params.id .. ".xml"
	file = io.open(xml_file, "r")
	local t = file:read("*all")
	file:close()

	-- content_type("text/xml")
	content_type("text/plain")
	return t
end)

post('/', function(params)
	print(serialize(params))

	ret = xdb.create_return_id('blocks', params.request)

	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

put('/:id', function(params)
	-- print(serialize(params))
	-- print(env:serialize())

	-- local xml = env:getHeader("xml");
	-- local js_code = env:getHeader("js_code");
	-- local lua_code = env:getHeader("lua_code");

	local xml = params.request.xml;
	local js = params.request.js;
	local lua = params.request.lua;

	local ret = xdb.update("blocks", params.request)

	if (xml and js and lua) then
		local xml_file = prefix .. params.id .. ".xml"
		local js_file  = prefix .. params.id .. ".js"
		local lua_file = prefix .. params.id .. ".lua"

		-- freeswitch.consoleLog("ERR", xml_file .. "\n");
		-- freeswitch.consoleLog("ERR", js_file  .. "\n");
		-- freeswitch.consoleLog("ERR", lua_file .. "\n");

		-- freeswitch.consoleLog("ERR", params.request.xml .. "\n");
		-- freeswitch.consoleLog("ERR", params.request.js  .. "\n");
		-- freeswitch.consoleLog("ERR", params.request.lua .. "\n");

		file = io.open(xml_file, "w")
		file:write(xml, "\n")
		file:close()

		file = io.open(js_file, "w")
		file:write(js, "\n")
		file:close()

		file = io.open(lua_file, "w")
		file:write(lua, "\n")
		file:close()
	end

	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

delete('/:id', function(params)
	ret = xdb.delete("blocks", params.id);

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)
