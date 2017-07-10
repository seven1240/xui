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

local do_debug = config.do_debug
do_debug = true

-- realm to support multiple wechat accounds, e.g. sipsip, xyt


get('/seven', function(params)
	print(env:serialize())
	return 	env:getHeader("echostr")
end)

get('/xyt', function(params)
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
	ORDER BY id DESC]])
	-- LIMIT ]] .. page .. [[,]] .. size .. [[
	-- ]])
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
	req = stream:read()
	xml = utils.xml(req)

	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", env:serialize())
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", req)
	end

	FromUserName = xml:val("FromUserName")
	ToUserName = xml:val("ToUserName")
	CreateTime = xml:val("CreateTime")
	MsgType = xml:val("MsgType")

	freeswitch.consoleLog("INFO", "Got " .. MsgType .. "\n")

	Reply = "收到"
	step = 0

	if MsgType == "event" then
		Event = xml:val("Event")
		EventKey = xml:val("EventKey")

		if Event == "CLICK" then
			if EventKey == "我要举报" then
				step = 1
			elseif (EventKey == "便民电话") or (EventKey == "监督电话") then
				step = 4
			end
		end
	elseif MsgType == "text" then
		Content = xml:val("Content")
		if (Content == "我要举报" or Content == "举报") then
			step = 1
		else
			step = 2
		end
	else
		step = 3
	end

	local new_ticket = false
	local ticket = xdb.find_one("tickets",
		"wechat_openid = " .. xdb.escape(FromUserName) .. " AND status <> 'TICKET_ST_DONE'",
		"created_epoch DESC")

	local isValidPhoneNumber = function(str)
		return str:match("^[1][3,4,5,7,8]%d%d%d%d%d%d%d%d%d$") or
			str:match("^%d%d%d%d%d%d%d$") or
			str:match("^%d%d%d%d%d%d%d%d$") or
			str:match("^0%d%d%d%d%d%d%d%d%d%d$")
	end

	if not ticket then
		if step > 1 then
			if step == 2 then
				if Content and isValidPhoneNumber(Content) then
					cidNumber = Content
				else
					Reply = "请输入正确的电话号码"
					step = -1
				end
			end

			ticket = xdb.create_return_object("tickets", {
				wechat_openid = FromUserName,
				cid_number = cidNumber,
				subject = '用户举报',
				status = "TICKET_ST_NEW"
			})

			if not ticket then
				Reply = '系统故障，请稍后再试...'
				step = -1
			end

			new_ticket = true -- a new ticket is just created
		end
	end

	if step == 1 then -- ask tel number
		Reply = "请点击左下角的键盘输入您的电话号码，以便我们能联系到您："
	elseif step == 2 then
		if new_ticket then
			Reply = '请输入您要举报的内容：'
		else
			if ticket.cid_number == '' then
				if isValidPhoneNumber(Content) then
					xdb.update_by_cond("tickets", {wechat_openid = FromUserName}, {
						cid_number = Content
					})

					Reply = '请输入您要举报的内容：'
				else
					Reply = '请输入正确的电话号码：'
				end
			elseif ticket.content == '' then
				xdb.update_by_cond("tickets", {wechat_openid = FromUserName}, {
					content = Content
				})

				Reply = "已收到您的举报信息，序列号为：" .. ticket.serial_number .. "。我们会妥善处理并尽快与您联系，谢谢。您也可以随时补充新的信息，如联系电话/邮件/地址等，也可上传语音/视频/图片。"
			else
				local comment = {}
				comment.content = Content
				comment.ticket_id = ticket.id
				comment.user_name = FromUserName

				xdb.create_return_object('ticket_comments', comment)

				Reply = "已收到您的举报信息，序列号为：" .. ticket.serial_number .. "。我们会妥善处理并尽快与您联系，谢谢。您也可以随时补充新的信息，如联系电话/邮件/地址等，也可上传语音/视频/图片。"
			end
		end
	elseif step == 4 then
		Reply = '0535-8078910'
	elseif MsgType == "xsssssimage" then -- image
		PicUrl = xml:val("PicUrl")

		local comment = {}
		comment.content = '上传图片'
		comment.ticket_id = ticket.id
		comment.user_name = FromUserName

		comment_id = xdb.create_return_id('ticket_comments', comment)

		if comment_id then
			local upload = {}
			upload.comment_id = params.id
			upload.type = 1
			upload.img_url = PicUrl
			local ret = xdb.create_return_id('wechat_upload', upload)
			if ret then
				v = 'wechat_interactive_upload_' .. ret
				wget = "wget -O /usr/local/freeswitch/xui/www/assets/img/wechat/big/" .. v .. ".jpg '" .. PicUrl .. "'"
				os.execute(wget)
				convert = "convert -resize 64x64! /usr/local/freeswitch/xui/www/assets/img/wechat/big/" .. v .. ".jpg /usr/local/freeswitch/xui/www/assets/img/wechat/small/" .. v .. ".jpg"
				freeswitch.consoleLog("ERR",convert)
				os.execute(convert)
			end
		end

		if new_ticket then
			Reply = "请输入您的电话号码，以便我们能联系到您："
		else
			Reply = "已收到您的举报信息，序列号为：" .. ticket.serial_number .. "。我们会妥善处理并尽快与您联系，谢谢。您也可以随时补充新的信息，如联系电话/邮件/联系地址等。"
		end
	elseif MsgType == "image" or MsgType == "voice" or MsgType == "video" then
		MediaId = xml:val("MediaId")

		local comment = {}

		if MsgType == "image" then
			comment.content = '上传图片'
		elseif MsgType == "voice" then
			comment.content = '上传音频'
		elseif MsgType == "video" then
			comment.content = '上传视频'
		end

		comment.ticket_id = ticket.id
		comment.user_name = FromUserName

		comment_id = xdb.create_return_id('ticket_comments', comment)

		if do_debug then
			utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", comment_id)
		end

		if comment_id then
			wechat = m_dict.get_obj('WECHAT/' .. params.realm)
			xwechat.get_token(params.realm, wechat.APPID, wechat.APPSEC)

			url = xwechat.download_image_url(params.realm, v)
			ext = "amr"
			prefix = "wechat-voice-"

			if MsgType == "image" then
				prefix = "wechat-image-"
				ext = "jpg"
			elseif MsgType == "video" then
				prefix = "wechat-video-"
				ext = "mp4"
			end

			rel_path = prefix .. os.date('%Y%m%d%H%M%S-') .. MediaId .. "." .. ext
			local_path = config.upload_path .. "/" .. rel_path
			wget = "wget -O " .. local_path .. " '" .. url .. "'"
			os.execute(wget)

			local f = io.open(local_path, "rb")

			if f then
				local size = assert(f:seek("end"))
				local rec = {}

				rec.name = xml:val("MsgId")
				rec.mime = "audio/amr"
				rec.ext = "amr"

				if MsgType == "image" then
					rec.mime = "image/jpeg"
					rec.ext = "jpg"
				elseif MsgType == "video" then
					rec.mime = "video/mp4"
					rec.ext = "mp4"
				end

				rec.abs_path = local_path
				rec.file_size = "" .. size
				rec.type = "WECHAT"
				rec.description = "WECHAT"
				rec.dir_path = config.upload_path
				-- rec.channel_uuid = uuid
				rec.original_file_name = rec.name
				rec.rel_path = rel_path

				media_file_id = xdb.create_return_id('media_files', rec)

				if media_file_id then
					local link = {}
					link.comment_id = comment_id
					link.media_file_id = media_file_id

					xdb.create('ticket_comment_media', link)
				end
			end
		end

		if new_ticket then
			Reply = "请输入您的电话号码，以便我们能联系到您："
		else
			Reply = "已收到您的举报信息，序列号为：" .. ticket.serial_number .. "。我们会妥善处理并尽快与您联系，谢谢。您也可以随时补充新的信息，如联系电话/邮件/联系地址等。"
		end
	end

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

