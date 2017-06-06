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

content_type("application/json")
require 'xdb'
require 'xwechat'
require 'm_dict'
require 'xtra_config'
xdb.bind(xtra.dbh)

get('/:id', function(params)
	n, tels = xdb.find_by_sql([[SELECT a.tel
	FROM users AS a 
	INNER JOIN tickets AS b 
	ON a.id = b.user_id OR a.id = b.current_user_id
	WHERE b.id = ]] .. params.id)
	if (n > 1) then
		freeswitch.consoleLog("ERR",serialize(tels))
		api = freeswitch.API()
		--网关不好用，所以先用话机号测试
		api:execute("bgapi", "originate user/" .. tels[1].tel .. " &bridge(user/" .. tels[2].tel .. ")")
		return {}
	end
end)
