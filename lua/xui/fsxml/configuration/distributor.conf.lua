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

build_lists = function()
	local last_realm = ""
	local lists = [[<list name="test">
      <node name="foo1" weight="1"/>
      <node name="foo2" weight="9"/>]]


	xdb.find_by_cond("dicts", "realm like 'DISTRIBUTOR/%'", "k", function(row)
		local realm = row.realm:sub(#"DISTRIBUTOR/" + 1)

		if realm ~= last_realm then
			lists = lists .. [[</list><list name="]] .. realm .. '">\n'
		end

		lists = lists .. [[    <node name="]] .. row.k .. [[" weight="]] .. row.v .. '"/>\n'

		last_realm = realm
	end)

	lists = lists .. "</list>"

	return lists
end

XML_STRING=[[<configuration name="distributor.conf" description="Distributor Configuration">
  <lists>]] .. build_lists() .. [[
  </lists>
</configuration>]]
