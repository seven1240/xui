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
 * Mariah Yang <yangxiaojin@x-y-t.cn>
 *
 *
 */
]]

require 'xdb'
require 'utils'
xdb.bind(xtra.dbh)

xtra.start_session()

content_type("application/json")

post('/', function(params)

	if params.request then
		login = params.request.login
		pass = params.request.password
	else
		login = env:getHeader("login")
		pass = env:getHeader("password")
	end

	local user = xdb.find_one("users", {extn = login, password = pass})

	if user then
		xtra.save_session("user_id", user.id)
		return 200, {code = 200, session_id = xtra.session_uuid}
	else
		return 403, {code = 403, text = "Wrong username or password"}
	end
end)

post('/create', function(params)

	if params.request then
		username = params.request.username
		pass = params.request.password
	else
		username = env:getHeader("username")
		pass = env:getHeader("password")
	end

	if not username or not password then
		return 200, {code = 901, message = "err param"}
	end

	local user = xdb.find_one("users", {extn = username})

	if user then
		if user.password == pass then
			return 200, {code = 0, message = "sucess", data = {session_id = xtra.session_uuid}}
		else
			return 200, {code = 903, message = "err password"}
		end
	else
		return 200, {code = 904, message = "user not exist"}
	end
end)

delete('/', function(params)
	if not xtra.session.user_id then
		-- hack me?
		return 500
	end

	xtra.save_session("user_id")
	return 200, {code = 200, text = "OK"}
end)
