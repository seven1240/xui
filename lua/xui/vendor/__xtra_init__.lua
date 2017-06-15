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
]]

-- xtra in Lua init script
-- The first script that the HTTP server hit

-- Global vars from FreeSWITCH
-- env Table that has the request params in http get query string or
--     post body in application/x-www-form-urlencoded format
-- stream The output stream to write to
-- freeswitch The freeswitch object, e.g. you can use freeswitch.consoleLog()

local xtra_debug = false

if xtra_debug then
	http_uri = env:getHeader("HTTP-URI")
	http_query = env:getHeader("HTTP-QUERY")
	freeswitch.consoleLog("INFO", "xtra.http_uri: " .. http_uri .. "\n")
	if (http_query) then
		freeswitch.consoleLog("INFO", "xtra.http_query: " .. http_query .. "\n")
	end
end

local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)vendor/__xtra_init__.lua$", "%1")

package.path = package.path .. ";/etc/xtra/?.lua"
package.path = package.path .. ";" .. cur_dir .. "?.lua"
package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"
package.path = package.path .. ";" .. cur_dir .. "controller/?.lua"
package.path = package.path .. ";" .. cur_dir .. "model/?.lua"
-- freeswitch.consoleLog("INFO", package.path .. "\n");

require 'xtra_config'
require 'utils'
require 'xtra'

-- Now run the actuall controller
xtra.controller_path = string.gsub(xtra.controller_path, ".lua", "")
-- freeswitch.consoleLog("INFO", xtra.controller_path .. "\n");

require(xtra.controller_path)

if not xtra.rest_matched then
	response_start(404)
	xtra.response('{"result": "error", "code": "404", "error_text": "That\'s all we know"}')
end
