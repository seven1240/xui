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

require 'xdb'

m_user = {}

m_user.is_admin = function(user_id)
	if not user_id then
		user_id = xtra.session.user_id
	end
	return user_id == 1 or user_id == "1"
end

m_user.is_conf_man = function(user_id)
	if not user_id then
		user_id = user_id or xtra.session.user_id
	end

	user = xdb.find("users", user_id)
	if user and user.type == "CONFMAN" then
		return true
	else
		return false
	end

end

m_user.has_permission = function(user_id, action, method, param)
	user_id = user_id or xtra.session.user_id

	if m_user.is_admin(user_id) then
		return true
	else
		return false
	end

	action = action or xtra.controller
	method = method
	param  = param or xtra.rest_path

	-- the below code has sql injection
	local sql = "select * from permissions where action = '" .. action .. "' and method = '" .. method .. "' and param = '" .. param .. "' and id in(select permission_id from group_permissions where group_id in(select group_id from user_groups where user_id = " .. user_id .. "))"
	xdb.dbh:query(sql, function(row)
		r = row
	end)
	return r
end

return m_user
