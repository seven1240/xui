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

function user_reg_data(uxml)
	local tuser = {}
	tuser.call_id = uxml.call_id:value()
	tuser.user = uxml.user:value()
	tuser.contact = uxml.contact:value()
	tuser.agent = uxml.agent:value()
	tuser.status = uxml.status:value()
	tuser.ping_status =uxml.ping_status:value()
	tuser.ping_time = uxml.ping_time:value()
	tuser.host = uxml.host:value()
	tuser.network_ip = uxml.network_ip:value()
	tuser.network_port = uxml.network_port:value()
	tuser.sip_auth_user = uxml.sip_auth_user:value()
	tuser.sip_auth_realm = uxml.sip_auth_realm:value()
	tuser.mwi_account = uxml.mwi_account:value()

	return tuser
end

function list_reg_user(sip_profiles, extn)
	api = freeswitch.API()
	doc = require("xmlSimple").newParser()
	local users = {regs = {}}

	for _, profile in pairs(sip_profiles) do
		ret = api:execute("sofia", "xmlstatus profile " .. profile.name .. " reg " .. extn)
		data = string.gsub(ret:gsub("-", "_"), "(</?)name(>)", "%1user_name%2")
		xml = doc:ParseXmlText(data)

		if not xml.profile then break end
		if not xml.profile.registrations then break end

		local xml_registrations = xml.profile.registrations

		if xml_registrations.registration and #xml_registrations.registration == 0 then
			local tuser = {}
			tuser = user_reg_data(xml_registrations.registration)

			if next(tuser) then
				tuser.reg_profile = profile.name
			end
			table.insert(users.regs, tuser)
		elseif xml_registrations.registration and #xml_registrations.registration > 0 then
			for i = 1, #xml_registrations.registration do
				local tuser = {}
				tuser = user_reg_data(xml_registrations.registration[i])
				if next(tuser) then
					tuser.reg_profile = profile.name
					table.insert(users.regs, tuser)
				end
			end
		end
	end
	return users
end

function xml2tab(data, _all_)
	local users = string.gsub(data:gsub("-", "_"), "(</?)name(>)", "%1user_name%2")
	local doc = require("xmlSimple").newParser()
	local xml = doc:ParseXmlText(users)
	if not xml.profile then return {} end
	if not xml.profile.registrations then return {} end

	local xml_registrations = xml.profile.registrations
	if _all_ == "all" then
		local users = {}
		if #xml_registrations.registration == 0 and xml_registrations.registration then
			local tuser = {}
			tuser.user =  xml_registrations.registration.user:value()
			tuser.status = xml_registrations.registration.status:value()
			table.insert(users, tuser)
		elseif #xml_registrations.registration > 0 then
			for i = 1, #xml_registrations.registration do
				local tuser = {}
				tuser.user = xml_registrations.registration[i].user:value()
				tuser.status = xml_registrations.registration[i].status:value()

				table.insert(users, tuser)
			end
		end
		return users
	else
		local tuser = {}

		if xml and xml_registrations.registration then
			local user = {}
			tuser.call_id = xml_registrations.registration.call_id:value()
			tuser.user = xml_registrations.registration.user:value()
			tuser.contact = xml_registrations.registration.contact:value()
			tuser.agent = xml_registrations.registration.agent:value()
			tuser.status = xml_registrations.registration.status:value()
			tuser.ping_status = xml_registrations.registration.ping_status:value()
			tuser.ping_time = xml_registrations.registration.ping_time:value()
			tuser.host = xml_registrations.registration.host:value()
			tuser.network_ip = xml_registrations.registration.network_ip:value()
			tuser.network_port = xml_registrations.registration.network_port:value()
			tuser.sip_auth_user = xml_registrations.registration.sip_auth_user:value()
			tuser.sip_auth_realm = xml_registrations.registration.sip_auth_realm:value()
			tuser.mwi_account = xml_registrations.registration.mwi_account:value()
		end
		return tuser
	end
end

get('/', function(params)
	last = tonumber(env:getHeader('last'))
	pageNum = tonumber(env:getHeader('pageNum'))
	usersRowsPerPage = tonumber(env:getHeader('usersRowsPerPage'))

	local users = {}
	local rowCount = 0

	users.pageCount = 0
	users.rowCount = 0
	users.curPage = 0
	users.data = {}

	pageNum = tonumber(pageNum)
	usersRowsPerPage = tonumber(usersRowsPerPage)

	if not pageNum or pageNum < 0 then
		pageNum = 1
	end

	if not usersRowsPerPage then
		usersRowsPerPage = 200
	end

	local cb = function(row)
		rowCount = tonumber(row.count)
	end

	xdb.find_by_sql("SELECT count(1) as count FROM users", cb)

	if rowCount > 0 then
		local offset = 0
		local pageCount = 0

		pageCount = math.ceil(rowCount / usersRowsPerPage);

		if pageNum == 0 then
			-- It means the last page
			pageNum = pageCount
		end

		offset = (pageNum - 1) * usersRowsPerPage

		if m_user.has_permission() then
			found, usersData = xdb.find_by_cond("users", nil, 'id', nil, usersRowsPerPage, offset)
		else
			found, usersData = xdb.find_by_cond("users", {id = xtra.session.user_id}, 'id', nil, usersRowsPerPage, offset)
		end
		if (found) then
			users.rowCount = rowCount
			users.data = usersData
			users.curPage = pageNum
			users.pageCount = pageCount
		end
	end

	return users
end)

get('/wechat', function(params)
	freeswitch.consoleLog("WARNING", "/users/wechat is Deprecated!!, use /users/:id/wechat_users")
	users = xdb.find_one("users", {id = xtra.session.user_id})

	if users then
		return users
	else
		return "[]"
	end
end)

get('/list', function(params)
	local lists = {}
	if params.request then
		exten = params.request.extn
	else
		exten = env:getHeader("extn")
	end

	profile_count, sip_profiles = xdb.find_all("sip_profiles")

	if not exten then
		user_count, users = xdb.find_all("users")
		if user_count <= 0 then return 200, {code = 0, message = "success", data = {}} end
		if profile_count <= 0 then return 200, {code = 0, message = "success", data = users} end
		-- freeswitch.consoleLog("ERR", "iiiii" .. serialize(users))
		for _, user in pairs(users) do
			-- freeswitch.consoleLog("ERR", "iiiii" .. user.extn)
			local list = {extn = user.extn, status = "offline"}
			local data = list_reg_user(sip_profiles, user.extn)
			if next(data.regs) then
				list.status = "online"
			end
			table.insert(lists, list)
		end
		return 200, {code = 0, message = "success", data = lists}
	else
		user = xdb.find_one("users", {extn = exten})
		if user then
			local list = list_reg_user(sip_profiles, exten)
			if next(list)  then
				for k, v in pairs(user) do
					list[k] = v
				end
				return 200, {code = 0, message = "success", data = list}
			else
				return 200, {code = 0, message = "success", data = user}
			end
		else
			return 200, {code = 904, message = "user not exists"}
		end
	end
end)

get('/list1',function(params)
	api = freeswitch.API()
	profile_name = "internal"

	if params.request then
		profile_name = params.request.profile_name or "internal"
	end

	if params.request and params.request.extn then
		user = xdb.find_one("users", {extn = params.request.extn})
		if user then
			args = "xmlstatus profile " ..  profile_name .. " reg " .. user.extn
			print(args)

			ret = api:execute("sofia", args)
			if ret then
				local data = xml2tab(ret, nil)
				if next(data) then
					utils.tab_merge(user, data)
					return 200, {code = 200, text = data}
				else
					return 200, {code = 484, text = ret}
				end
			else
				return 200, {code = 404, text="User Not Found"}
			end
		else
			return 200, {code = 404, text="User Not Found"}
		end
	else
		args = "xmlstatus profile " .. profile_name .. " reg"
		print(args)
		ret = api:execute("sofia", args)
		local data = xml2tab(ret, "all")
		return 200, {code = 200, text = data}
	end
end)

get('/getID', function(params)
	local username = env:getHeader('username')
	user = xdb.find_one("users", {extn = username})

	if user then
		wechat_user = xdb.find_one("wechat_users", {user_id = user.id})
		if wechat_user then
			user.headimgurl = wechat_user.headimgurl
		end
		freeswitch.consoleLog("err",serialize(user))
		if user then
			return user
		else
			return 404
		end
	else
		return 404
	end
end)

get('/cur_user/:username', function(params)
	local username = params.username
	user = xdb.find_one("users", {extn = username})
	if user then
		return user
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

get('/download', function(params)
	n, users = xdb.find_all("users")
	content_type("application/vnd.ms-excel;charset=utf-8")
	header("Content-Disposition", 'attachment; filename="download_users_filename.csv"')
	xtra.write(string.char(0xef, 0xBB, 0xbf))

	xtra.write('用户ID,' .. '号码,' .. '名称,' .. '密码,' .. '呼叫源,' .. '主叫名称,' .. '主叫号码,' .. '电话号码,' .. '主动录音\n')
	for i, v in pairs(users) do
		xtra.write(v.id .. "," .. v.extn .. "," .. v.name .. "," .. v.password .. "," .. v.context .. "," ..
		v.cid_name .. "," .. v.cid_number .. "," .. v.tel .. "," .. v.auto_record .. "\n")
	end
end)

get('/:id', function(params)
	user = xdb.find("users", params.id)
	if user then
		user.password = nil
		return user
	else
		return 404
	end
end)

get('/:id/wechat_users', function(params)
	if not m_user.is_admin() and (params.id ~= xtra.session.user_id) then
		return 404
	end

	n, we_users = xdb.find_by_cond("wechat_users", {user_id = params.id})
	if n > 0 then
		return we_users
	else
		return "[]"
	end
end)

put("/chgpwd", function(params)
	if params.request then
		extn = params.request.extn
		newpwd = params.request.newpwd
	else
		extn = env:getHeader("extn")
		newpwd = env:getHeader("newpwd")
	end

	if not extn or not newpwd then
		return 200, {code = 901, message = "err param"}
	end

	user = xdb.find_one("users", {extn = extn})

	if user then
		ret = xdb.update("users", {id = user.id, password = newpwd})
		if ret >= 1 then
			return 200, {code = 0, message = "success"}
		else
			return 200, {code = 999, message = "unknown"}
		end
	else
		return 200, {code = 904, message = "extn not exists"}
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
	if params.request then
		params.request.id = params.id
	end

	ret = xdb.update("users", params.request)
	if ret then
		return 200, {id = params.id}
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

post('/create', function(params)
	local user = {}
	if params.request then
		user.extn = params.request.extn
		user.password = params.request.password
		user.name = params.request.name
		user.vm_password = params.request.vm_password or "1234"
		user.context = params.request.context or "default"
		user.cid_name = params.request.cid_name
		user.cid_number = params.request.cid_number
		user.disabled = params.request.disabled or 0
	else
		user.extn = env:getHeader("extn")
		user.password = env:getHeader("password")
		user.name = env:getHeader("name")
		user.vm_password = env:getHeader("vm_password") or "1234"
		user.context = env:getHeader("context") or "default"
		user.cid_name = env:getHeader("cid_name")
		user.cid_number = env:getHeader("cid_number")
		user.disabled = env:getHeader("disabled") or 0
	end


	if not user.extn or not user.password or not user.name then
		return 200, {code = 901, message = "err param"}
	end

	n, ur = xdb.find_by_cond("users", {extn = user.extn})

	if n >= 1 then return 200, {code = 905, message = "user exists"} end

	ret = xdb.create('users', user)

	if ret then
		return 200, {code = 0, message = "success"}
	else
		return 200, {code = 999, message = "unknown"}
	end

end)

delete('/delete', function(params)
	if params.request then
		exten = params.request.extn
	else
		exten = env:getHeader("extn")
	end

	if not exten then
		return 200, {code = 901, message = "err param"}
	end

	ur = xdb.find_one("users", {extn = exten})

	if not ur then return 200, {code = 904, message = "extn not exists"} end

	ret = xdb.delete("users", ur.id)

	xdb.update_by_cond("wechat_users", {user_id = ur.id}, {user_id = ""})

	if ret >= 1 then
		return 200, {code = 0, message = "success"}
	else
		return 200, {code = 999, message = "unknown"}
	end
end)

delete('/:id', function(params)
	ret = xdb.delete("users", params.id);
	xdb.update_by_cond("wechat_users", {user_id = params.id}, {user_id = ""})

	if ret == 1 then
		return 200, {id = params.id}
	else
		return 500, "{}"
	end
end)

delete('/:id/wechat_users/:wechat_user_id', function(params)
	print(serialize(params))

	if not m_user.is_admin() then
		return 500
	end

	ret = xdb.update("wechat_users", {user_id = 'NULL', id = params.wechat_user_id})

	if ret then
		return 200, "{}"
	else
		return 500
	end
end)
