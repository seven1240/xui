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

xtra.start_session();

content_type("text/html")
require 'xdb'
require 'xwechat'
require 'm_dict'
require 'utils'
require 'xtra_config'
xdb.bind(xtra.dbh)

function __FILE__() return debug.getinfo(2,'S').source end
function __LINE__() return debug.getinfo(2, 'l').currentline end
function __FUNC__() return debug.getinfo(1).name end

do_debug = true

-- realm to support multiple wechat accounds, e.g. sipsip, xyt


get('/seven', function(params)
	print(env:serialize())
	return 	env:getHeader("echostr")
end)

get('/anyway/:realm', function(params)
	return 	env:getHeader("echostr")
end)

get('/:realm/all/:page', function(params)
	freeswitch.consoleLog("ERR", "asdajsldkjal")
	local user_id = xtra.session.user_id
	local size = 6
	local page = params.page * size
	n, tickets = xdb.find_by_sql([[SELECT u.*, w.v as dtype
	FROM tickets as u left join dicts as w
	ON u.type = w.k
	ORDER BY id DESC
	LIMIT ]] .. page .. [[,]] .. size .. [[
	]])
	return tickets
end)

get('/:realm/setting', function(params)
	local user_id = xtra.session.user_id
	sql = "select a.id,a.headimgurl,a.nickname,b.extn,b.password from wechat_users as a left join users as b on a.user_id = b.id where a.user_id = '" .. user_id .. "'"
	n, users = xdb.find_by_sql(sql)
	return users[1]
end)


get('/:realm/tickets/:id', function(params)
	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", env:serialize())
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(params))
	end

	content_type("text/html")
	realm = params.realm
	code = env:getHeader("code")
	wechat = m_dict.get_obj('WECHAT/' .. realm)

	if not code then
		-- redirect_uri = "http://" .. env:getHeader("Host") .. env:getHeader("HTTP-Request-URI")
		redirect_uri = config.wechat_base_url .. "/api/wechat/" .. params.realm .. "/tickets/" .. params.id
		redirect_uri = xwechat.redirect_uri(wechat.APPID, redirect_uri, "200")
		if do_debug then
			utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", redirect_uri)
		end
		redirect(redirect_uri)
	else
		ret = xwechat.get_js_access_token(realm, wechat.APPID, wechat.APPSEC, code)
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", ret)

		jret = utils.json_decode(ret)

		if jret.openid then
			wechat_user = xdb.find_one("wechat_users", {openid = jret.openid})
			if wechat_user then
				xtra.save_session("user_id", wechat_user.user_id)
			end
		else -- on page refresh, we got a code already used error
			wechat_user = xdb.find_one("wechat_users", {code = code})
		end

		if wechat_user then
			-- we already have the wechat userinfo in our db
			local u = wechat_user
			-- print(serialize(u))
			if jret.openid then -- catch the code for later use, e.g. refresh
				user1 = {
					id = u.id,
					code = code
				}

				xdb.update("wechat_users", user1)
			end

			if u.user_id and not (u.user_id == '') then
				return {"render", "wechat/tickets1.html", {ticket_id = params.id}}
			else
				u.ticket_id = params.id
				u.login_url = config.wechat_base_url .. "/api/wechat/" .. params.realm .. "/login"
				utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", "render login:" .. serialize(u));
				return {"render", "wechat/login.html", u}
			end
		else
			-- find the wechat userinfo and save to our db
			ret = xwechat.get_sns_userinfo(jret.openid, jret.access_token)
			-- print(ret)
			user_info = utils.json_decode(ret)
			user_info.privilege = nil
			user_info.language = nil
			user_info.app_type = 'jsapp'
			wechat_user_id = xdb.create_return_id("wechat_users", user_info)
			wechat_user = {
				id = wechat_user_id,
				nickname = user_info.nickname,
				headimgurl = user_info.headimgurl
			}

			wechat_user.ticket_id = params.id
			wechat_user.login_url = config.wechat_base_url .. "/api/wechat/" .. params.realm .. "/login"
			return {"render", "wechat/login.html", wechat_user}
		end
	end
end)

get('/:realm/jsapi_ticket', function(params)
	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", env:serialize())
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(params))
	end
	url = env:getHeader("url")
	sha1 = require("sha1")
	local timestamp = os.time()
	local nonceStr = 'AbEfgh' .. timestamp
	wechat = m_dict.get_obj('WECHAT/' .. params.realm)
	access_token = xwechat.get_token(params.realm, wechat.APPID, wechat.APPSEC)
	local ticket = xwechat.get_js_ticket(params.realm)
	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(ticket))
	end
	local str = "jsapi_ticket=" .. ticket .. "&noncestr=" .. nonceStr .. "&timestamp=" .. timestamp .. "&url=" .. url
	local signature = sha1(str)
	utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", signature)
	return {appId = wechat.APPID, nonceStr = nonceStr, timestamp = timestamp, url = url, signature = signature, ticket = ticket}
end)

post('/:realm/login', function(params) -- login

	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", env:serialize())
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(params))
	end

	wechat = m_dict.get_obj('WECHAT/' .. params.realm)
	appid = wechat.APPID

	login = env:getHeader("login")
	pass = env:getHeader("pass")
	wechat_user_id = env:getHeader("id")
	ticket_id = env:getHeader("ticket_id") or "0"

	user = xdb.find_one("users", {extn = login, password = pass})

	if user then
		wechat_users = {
			id = wechat_user_id,
			user_id = user.id
		}
		xdb.update("wechat_users", wechat_users)

		-- xtra.start_session()
		xtra.save_session("user_id", user.id)

		redirect_uri = config.wechat_base_url .. "/api/wechat/" .. params.realm .. "/tickets/" .. ticket_id
		redirect_uri = xwechat.redirect_uri(wechat.APPID, redirect_uri, "200")
		redirect(redirect_uri)
	else
		wechat_user = xdb.find("wechat_users", wechat_user_id)

		if wechat_user then
			wechat_user.errmsg = '用户名/密码错误'
			wechat_user.ticket_id = ticket_id
			wechat_user.login_url = config.wechat_base_url .. "/api/wechat/" .. params.realm .. "/login"
			return {"render", "wechat/login.html", wechat_user}
		else -- hacking me? just fail!
			return 403
		end
	end
end)

post('/:realm/link', function(params)
	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", env:serialize())
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(params))
	end

	local cond = {}

	cond.extn = params.request.username
	cond.password = params.request.password

	user = xdb.find_one("users", cond)

	if user then
		wechat = m_dict.get_obj('WECHAT/' .. params.realm)
		session = xwechat.get_wx_openid(wechat.APPID, wechat.APPSEC, params.request.code)

		if do_debug then
			utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", 'session' .. session)
		end

		session = utils.json_decode(session)

		if session.session_key then
			session_3rd = xtra.create_uuid()
			utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", 'session_3rd: ' .. session_3rd)

			obj = {
				wechat_type = 'weapp',
				user_id = user.id,
				session_3rd = session_3rd,
				session_key = session.session_key,
				openid = session.openid,
				nickname = params.request.userInfo.nickName,
				sex = params.request.userInfo.gender,
				language = params.request.userInfo.language,
				city = params.request.userInfo.city,
				province = params.request.userInfo.province,
				country = params.request.userInfo.country
			}

			xdb.create("wechat_users", obj)

			utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(obj))

			xtra.session_uuid = session_3rd
			xtra.save_session("user_id", user.id)

			return session_3rd;
		elseif session.errcode == 40163 then -- been used
			utils.xlog(__FILE__() .. ':' .. __LINE__(), "ERR", serialize(session))
			return 403
		end
	else
		return 403
	end
end)

post('/:realm/wxsession', function(params)
	wechat = m_dict.get_obj('WECHAT/' .. realm)
	session = xwechat.get_wx_openid(wechat.APPID, wechat.APPSEC, params.code)
	print(serialize(session))
	return "KEY"
end)

get('/:realm', function(params)
	signature = env:getHeader("signature")
	timestamp = env:getHeader("timestamp")
	nonce = env:getHeader("nonce")
	echostr = env:getHeader("echostr")

	-- wechat = m_dict.get_obj(params.realm)
	wechat = m_dict.get_obj('WECHAT')

	print(serialize(wechat))

	obj = {}

	print(env:serialize())

	table.insert(obj, wechat.TOKEN)
	table.insert(obj, nonce)
	table.insert(obj, timestamp)

	table.sort(obj, function(a, b)
		return a < b
	end)

	print(serialize(obj))

	str = obj[1] .. obj[2] .. obj[3]
	sha1 = require("sha1")
	sha = sha1(str)
	print(sha)

	if (sha == signature) then
		return echostr
	else
		return 500
	end
end)

post('/:realm', function(params)
	print(serialize(params))
	print(env:serialize())
	req = stream:read()
	print(req)
	xml = utils.xml(req)

	FromUserName = xml:val("FromUserName")
	ToUserName = xml:val("ToUserName")
	CreateTime = xml:val("CreateTime")
	MsgType = xml:val("MsgType")
	Content = xml:val("Content")

	Reply = "OK"

	content_type("text/xml")

	response = "<xml>" ..
		"<ToUserName><![CDATA[" .. FromUserName .. "]]></ToUserName>" ..
		"<FromUserName><![CDATA[" .. ToUserName .. "]]></FromUserName>" ..
		"<CreateTime>" .. CreateTime .. "</CreateTime>" ..
		"<MsgType><![CDATA[text]]></MsgType>" ..
		"<Content><![CDATA[" .. Reply .. "]]></Content>" ..
		"<FuncFlag>0</FuncFlag>" ..
		"</xml>"
	return response
end)

