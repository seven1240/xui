--[[
/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2013-2017, Seven Du <dujinfang@x-y-t.cn>
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

function build_dial_params(var, val, quote)
	if quote then
		quote = "'"
	else
		quote = ""
	end

	if var == "earlyMedia" then
		if val == "true" then
			return ""
		else
			return "{ignore_early_media=true}"
		end
	end

	if not val then return "" end

	if var == "callbackUrl" then
		return "{x_httpd_callback_url='" .. val .. "'," ..
			"session_in_hangup_hook=true," ..
			"api_hangup_hook='lua do_callback.lua'}"
	else
		if not val then val = "true" end
	end

	return "{" .. var .. "=" .. quote .. val .. quote .. "}"
end

function build_x_params(req)
	local ret = ""
	for k, v in pairs(req) do
		if (k:sub(1,1) == 'x') then
			ret = ret .. "{" .. k .. "=" .. "'" .. v .. "'}"
		end
	end
	return ret
end

function build_dialstr(destNumber)
	if (config.prefix_table) then
		return "prefix/" .. config.prefix_table .. "/" .. destNumber
	end

	return "user/" .. destNumber
end

function build_application(params)
	appstr = ""

	if params.args then
		if params.app == "speak" then
			appstr = appstr .. params.app .. ":tts_commandline|alex|" .. params.args
		elseif params.app == "transfer" then
			cid = request.cidNumber2 or request.cidNumber

			if cid then
				appstr = "set:effective_caller_id_number=" .. cid .. ","
			end
			appstr = appstr .. params.app .. ":'" .. params.args .. " XML default'"
		elseif params.app == "bridge" then
			params.args = build_dial_params("origination_caller_id_number", request.cidNumber2 or request.cidNumber, false) ..
				build_dialstr(params.args)
			appstr = appstr .. params.app .. ":" .. params.args
		else
			appstr = appstr .. params.app .. ":" .. params.args
		end
	end

	return appstr
end

function build_applications(params)
	appstr = " "
	if params.app then
		appstr = appstr .. build_application(params)
	elseif params.apps then
		print(serialize(params.apps))
		comma = ""
		for i, v in pairs(params.apps) do
			appstr = appstr .. comma .. build_application(v)
			comma = ","
		end
	else
		appstr = appstr .. "park"
	end

	appstr = appstr .. " inline"
	print(appstr)

	return appstr
end

function execute(cmd, args)
	api = freeswitch.API()
	ret = api:execute(cmd, args)
	if ret:match("^%+OK") then
		result = {result = "ok", uuid = ret:sub(5):sub(1, -2)}
	else
		result = {result = "error", reason = ret:sub(5):sub(1, -2)}
	end

	return result
end

post("/", function(params)
	if next(params) == nil then
		-- try to get params from env, which is from the query string body
		request = {}
		request.destNumber = env:getHeader("destNumber")
		request.cidName = env:getHeader("cidName")
		request.cidNumber = env:getHeader("cidNumber")
		request.earlyMedia = env:getHeader("earlyMedia")
		request.app = env:getHeader("app")
		request.args = env:getHeader("args")
		request.async = env:getHeader("async")
	else
		request = params.request
	end

	print(serialize(params))

	dialstr = build_dial_params("origination_caller_id_name", request.cidName, true) ..
		build_dial_params("origination_caller_id_number", request.cidNumber, true) ..
		build_dial_params("earlyMedia", request.earlyMedia, true) ..
		build_dial_params("sip_auto_answer", request.autoAnswer, true) ..
		build_x_params(request) ..
		build_dialstr(request.destNumber) ..
		build_applications(request)

	print(dialstr)
	freeswitch.consoleLog('INFO', dialstr)

	api = freeswitch.API()

	if request.async == "true" then
		ret = api:execute("bgapi", "originate " .. dialstr)
		result = {result = "ok", jobUUID = ret:sub(15):sub(1, -2)}
	else
		ret = api:execute("originate", dialstr)
		if ret:match("^%+OK") then
			result = {result = "ok", uuid = ret:sub(5):sub(1, -2)}
		else
			result = {result = "error", reason = ret:sub(5):sub(1, -2)}
		end
	end

	return result
end)

delete("/:channel_uuid", function(params)
	cmd = "uuid_kill"
	args = params.channel_uuid

	print(serialize(params))
	print(args)

	if (params.request and params.request.hangupCause) then
		args = args .. " " .. params.request.hangupCause
	end
	return execute(cmd, args)
end)

put("/:channel_uuid", function(params)
	print(params.request.action)
	local action = params.request.action
	if action == "mediaOn" then
		return execute("uuid_media", params.channel_uuid .. " on")
	elseif action == "mediaOff" then
		return execute("uuid_media", params.channel_uuid .. " off")
	end
	return {result = "ok", reason = params.request.action}
end)

get("/", function(params)
	cmd = "show"
	args = "channels as json"

	api = freeswitch.API()
	ret = api:execute(cmd, args)

	if env:getHeader("native") == "true" then
	else
		-- remove leading {"row_count":2,"rows": and ending } from result
		start,stop = ret:find('{"row_count": 0}')
		if start then
			return "[]"
		else
			start,stop = ret:find(',"rows":')
			ret = ret:sub(stop+1, -2)
		end
	end

	return ret
end)

get("/:channel_uuid", function(params)
	cmd = "uuid_dump"
	args = params.channel_uuid .. " json"

	api = freeswitch.API()
	ret = api:execute(cmd, args)

	if ret:match("^%-") then
		return 404
	else
		return ret
	end
end)

--[[

curl -0 seven.local:8081/api/channels
curl -0 seven.local:8081/api/channels | python -m json.tool

curl -0 -XPOST -d "destNumber=1001&app=endless_playback&args=/wav/vacation.wav" seven.local:8081/api/channels

curl -0 -XDELETE seven.local:8081/api/channels/

]]
