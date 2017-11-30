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
 * MariahYang <yangxiaojin@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * MariahYang <yangxiaojin@x-y-t.cn>
 *
 *
 */
]]


content_type("application/json")
require 'xdb'
xdb.bind(xtra.dbh)

xtra.ignore_login('/list')
xtra.ignore_login('/create')
xtra.ignore_login('/reset')
xtra.ignore_login('/delete')
xtra.start_session()
xtra.require_login()

function generate_key()
	local now_epoch = os.time()
	local api = freeswitch.API()
	local uuid = api:execute("create_uuid")
	return now_epoch .. uuid
end

get('/', function(params)
	n, keys = xdb.find_by_cond("user_dev_key")
	if n > 0 then
		return keys
	else
		return "[]"
	end
end)

get('/list', function(params)
	if params.request then
		username = params.request.username
		password = params.request.password
	else
		username = env:getHeader("username")
		password = env:getHeader("password")
	end

	if not username or not password then
		return 200, {code = 901, message = "err param"}
	end

	user = xdb.find_one("users", {extn = username})

	if not user then
		return 200, {code = 906, message = "err username"}
	end

	if user.password ~= password then
		return 200, {code = 906, message = "err password"}
	end

	user_key = xdb.find_one("user_dev_key", {user_id = user.id})

	if not user_key or not user_key.key then
		return 200, {code = 904, message = "user key not exists"}
	end

	return 200, {code = 200, message = "success", data = {key = user_key.key}}
end)

post('/', function(params)
	params.request.key = generate_key()
	obj = xdb.create_return_object("user_dev_key", params.request)
	if obj then
		api:execute("hash", "insert/xui/" .. obj.key .. "/" .. obj.user_id)
		return obj
	else
		return 500, "{}"
	end
end)

post('/create', function(params)
	if params.request then
		username = params.request.username
		password = params.request.password
	else
		username = env:getHeader("username")
		password = env:getHeader("password")
	end

	if not username or not password then
		return 200, {code = 901, message = "err param"}
	end

	user = xdb.find_one("users", {extn = username})

	if not user then
		return 200, {code = 906, message = "err username"}
	end

	if user.password ~= password then
		return 200, {code = 906, message = "err password"}
	end

	local data = {}
	data.key = generate_key()
	data.user_id = user.id
	obj = xdb.create_return_object("user_dev_key", data)
	if obj then
		api:execute("hash", "insert/xui/" .. obj.key .. "/" .. obj.user_id)
		return 200, {code = 200, message = "success", data = {key = obj.key}}
	else
		return 200, {code = 999, message = "unknown"}
	end
end)

post('/reset', function(params)
	if params.request then
		username = params.request.username
		password = params.request.password
	else
		username = env:getHeader("username")
		password = env:getHeader("password")
	end

	if not username or not password then
		return 200, {code = 901, message = "err param"}
	end

	user = xdb.find_one("users", {extn = username})

	if not user then
		return 200, {code = 906, message = "err username"}
	end

	if user.password ~= password then
		return 200, {code = 906, message = "err password"}
	end

	user_key = xdb.find_one("user_dev_key", {user_id = user.id})

	if not user_key or not user_key.key then
		return 200, {code = 904, message = "user key not exists"}
	end

	ret = xdb.delete("user_dev_key", {user_id = user.id})

	if ret == 1 then
		local data = {}
		local api = freeswitch.API()
		api:execute("hash", "delete/xui/" .. user_key.key)
		data.key = generate_key()
		data.user_id = user.id
		obj = xdb.create_return_object("user_dev_key", data)
		if obj then
			api:execute("hash", "insert/xui/" .. obj.key .. "/" .. obj.user_id)
			return 200, {code = 200, message = "success", data = {key = obj.key}} 
		else
			return 200, {code = 999, message = "unknown"}
		end
	else
		return 200, {code = 999, message = "unknown"}
	end
end)

post('/reset2', function(params)
	if params.request then
		user_idx = params.request.user_id
	else
		user_idx = env:getHeader("user_id")
	end

	user_key = xdb.find_one("user_dev_key", {user_id = user_idx})

	utils.log("ERR", serialize(user_key))

	if not user_key then return 500, "{}" end

	ret = xdb.delete("user_dev_key", {user_id = user_key.user_id})

	if ret == 1 then
		local api = freeswitch.API()
		api:execute("hash", "delete/xui/" .. user_key.key)
		params.request.key = generate_key()
		obj = xdb.create_return_object("user_dev_key", params.request)
		if obj then
			api:execute("hash", "insert/xui/" .. obj.key .. "/" .. obj.user_id)
			return params.request
		else
			return 500, "{}"
		end
	else
		return 500, "{}"
	end
end)

delete('/', function(params)
	if params.request then
		user_idx = params.request.user_id
	else
		user_idx = env:getHeader("user_id")
	end

	user_key = xdb.find_one("user_dev_key", {user_id = user_idx})

	utils.log("ERR", serialize(user_key))

	if not user_key then return 500, "{}" end

	ret = xdb.delete("user_dev_key", {user_id = user_key.user_id})

	if ret == 1 then
		api:execute("hash", "delete/xui/" .. user_key.key)
		return 200, {user_id = params.user_id}
	else
		return 500, "{}"
	end
end)

delete('/delete', function(params)
	if params.request then
		username = params.request.username
		password = params.request.password
	else
		username = env:getHeader("username")
		password = env:getHeader("password")
	end

	if not username or not password then
		return 200, {code = 901, message = "err param"}
	end

	user = xdb.find_one("users", {extn = username})

	if not user then
		return 200, {code = 906, message = "err username"}
	end

	if user.password ~= password then
		return 200, {code = 906, message = "err password"}
	end

	user_key = xdb.find_one("user_dev_key", {user_id = user.id})

	if not user_key or not user_key.key then
		return 200, {code = 904, message = "user key not exists"}
	end

	ret = xdb.delete("user_dev_key", {user_id = user.id})

	if ret == 1 then
		local data = {}
		local api = freeswitch.API()
		api:execute("hash", "delete/xui/" .. user_key.key)
		return 200, {code = 200, message = "success"}
	else
		return 200, {code = 999, message = "unknown"}
	end
end)
