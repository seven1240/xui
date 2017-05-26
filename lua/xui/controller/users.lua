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
xdb.bind(xtra.dbh)
require 'm_user'

get('/', function(params)
	if m_user.has_permission() then
		n, users = xdb.find_all("users")
	else
		n, users = xdb.find_by_cond("users", {id = xtra.session.user_id})
	end

	if n > 0 then
		return users
	else
		return "[]"
	end
end)

get('/bind', function(params)
	n, users = xdb.find_by_sql([[SELECT u.*, w.id AS wechat_id, openid, headimgurl, nickname
		FROM users u, wechat_users w
		WHERE u.id = w.user_id
		ORDER BY id]])

	if (users) then
			return users
	else
		return "[]"
	end
end)

get('/:id', function(params)
	user = xdb.find("users", params.id)
	if user then
		return user
	else
		return 404
	end
end)

put("/change_password", function(params)
	req = params.request
	user = xdb.find_one("users", {id = xtra.session.user_id, password = req.old_password})

	if user then
		ret = xdb.update("users", {id = user.id, password = req.password})

		if ret == 1 then
			return {}
		end
	end

	return 403
end)

put("/changepassword", function(params)
	req = params.request
	req.id = tonumber(req.id)
	user = xdb.find_one("users", {id = req.id, password = req.old_password})

	if user then
		ret = xdb.update("users", {id = user.id, password = req.password})

		if ret == 1 then
			return {}
		end
	end

	return 403
end)

put('/:id', function(params)
	print(serialize(params))
	ret = xdb.update("users", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

post('/', function(params)
	print(serialize(params))

	if not m_user.has_permission() then
		return 403
	end

	if params.request.extn then
		local user = params.request

		if (user.disabled == nil) then user.disabled = 0 end

		ret = xdb.create_return_id('users', user)

		if ret then
			return {id = ret}
		else
			return 500, "{}"
		end
	else -- import multi lines
		users = params.request
		user = table.remove(users, 1)
		if user then
			if (user.disabled == nil) then user.disabled = 0 end
			ret = xdb.create_return_id('users', user)
		end

		user = table.remove(users, 1)
		i = 0;

		while user and i < 65536 do
			xdb.create('users', user)
			user = table.remove(users, 1)
			i = i + 1
		end

		if ret then
			n, users = xdb.find_by_cond("users", "id >= " .. ret)
			return users;
		else
			return 500
		end
	end
end)

delete('/:id', function(params)
	ret = xdb.delete("users", params.id);

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

put('/:id/unbind', function(params)
	print(serialize(params))
	ret = xdb.delete("wechat_users", {user_id = params.id})
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)
