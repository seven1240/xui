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

function get_xml_curl()
	params = ""
	local cond = {realm = 'cURL', ref_id = 0, disabled = 0}
	xdb.find_by_cond("params", cond, "id", function(row)
		params = params .. '<param name="' .. row.k .. '"' .. ' value="' .. row.v .. '"/>'
	end)
	return params
end

xXML_STRING=[[
<configuration name="curl.conf" description="mod curl config">
<settings>]] ..
        get_xml_curl() ..
[[</settings></configuration>
]]

freeswitch.consoleLog("NOTICE", "ROWS: " .. xXML_STRING)