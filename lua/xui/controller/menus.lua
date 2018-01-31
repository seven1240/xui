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
-- xtra.require_login()

content_type("application/json")
require 'xdb'
require 'm_user'
xdb.bind(xtra.dbh)

get('/', function(params)
	realm = env:getHeader('realm')

	local n, dicts = xdb.find_by_cond("dicts", {realm = realm})
	local menus = {}
	local is_conf_man = m_user.is_conf_man

	if (n > 0) then
		for k,v in pairs(dicts) do
			local menu = {id = v.id, description = v.k, data = v.v}
			if v.v == 'DROPDOWN' then
				n, drops = xdb.find_by_cond('dicts', {realm = "MENUS_" .. v.k});
				if n > 0 then
					menu.items = {}
					for i,d in pairs(drops) do
						if is_conf_man then
							table.insert(menu.items, {id = d.id, description = d.k, data = d.v})
						end
					end
				end
			end
			table.insert(menus, menu)
		end
		return menus
	else
		return "[]"
	end
end)
