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

require 'm_dialstring'

function build_dial_params(var, val)
	if not val then return "" end
	if var == "ignore_early_media" and val == "true" then
		return ""
	elseif var == "callback_url" then
		return "{x_httpd_callback_url='" .. val .. "'," ..
			"session_in_hangup_hook=true," ..
			"api_hangup_hook='lua do_callback.lua'}"
	else
		if not val then val = "true" end
	end

	return "{" .. var .. "=" .. "'" .. val .. "'}"
end

function build_dialstr(destNumber)
	if (config.prefix_table) then
		return "prefix/" .. config.prefix_table .. "/" .. destNumber
	end

	return m_dialstring.build(destNumber)

	-- return "user/" .. destNumber
end

function build_application(params)
	appstr = " "
	if params.app then
		appstr = appstr .. params.app

		if params.args then
			if params.app == "speak" then
				params.args = "tts_commandline|alex|" .. params.args
			end
			appstr = appstr .. ":'" .. params.args .. "'"
		end
	elseif params.apps then
		-- print(serialize(params.apps))
		comma = ""
		for i, v in pairs(params.apps) do
			if v.app == "speak" then
				v.args = "tts_commandline|alex|" .. v.args
			elseif v.app == "say_number" then
				v.app = "say"
				v.args = "en NUMBER ITERATED " .. v.args
			end

			appstr = appstr .. comma .. v.app .. ":'" .. v.args .. "'"
			comma = ","
		end
	else
		appstr = appstr .. "park"
	end

	appstr = appstr .. " inline"
	-- print(appstr)

	return appstr
end

function execute(cmd, args)
	api = freeswitch.API()
	ret = api:execute(cmd, args)
	if ret:match("^%+OK") then
		result = {code = 200, msg = ret:sub(5):sub(1, -2)}
	elseif ret:match("^%-ERR") then
		result = {code = 400, msg = ret:sub(6):sub(1, -2)}
	else
		result = {code = 200, msg = ret}
	end

	return result
end

post("/", function(params)
	if next(params) == nil then
		-- try to get params from env, which is from the query string body
		request = {}
		request.name = env:getHeader("async")
	else
		request = params.request
	end

	return {code = 200, msg = "+OK", data = request.name}
end)

post("/:name", function(params)
	req = params.request
	ret = "+OK"

	print(serialize(params))

	if (req and req.to) then
		cidNumber = req.from
		if (req.cidNumber) then cidNumber = req.cidNumber end
		-- print("cidNumber: " .. cidNumber)
		dialstr = build_dial_params("origination_caller_id_number", cidNumber) ..
			build_dial_params("origination_caller_id_name", req.cidName) ..
			build_dial_params("origination_callee_id_name", req.cidName) ..
			build_dialstr(req.to)
		-- print(dialstr)
		ret = execute("bgapi", "conference " .. params.name .. " dial " .. dialstr)

	elseif(req and req.participants) then
		for i, v in ipairs(req.participants) do
			cidNumber = v.from
			if (v.cidNumber) then cidNumber = v.cidNumber end
			-- print("cidNumber: " .. cidNumber)
			dialstr = build_dial_params("origination_caller_id_number", cidNumber) ..
				build_dialstr(v.to)
			-- print(dialstr)
			ret = execute("conference", params.name .. " bgdial " .. dialstr)
		end
	end

	return {code = 200, msg = ret, data = params.name}
end)

put("/:name/:memberID", function(params)
	action = params.request.action

	return execute("conference", params.name .. " " .. action .. " " .. params.memberID)
end)

put("/:name/:memberID/:action", function(params)
	action = params.action
	return execute("conference", params.name .. " " .. action .. " " .. params.memberID)
end)

delete("/:name/:memberID", function(params)
	return execute("conference", params.name .. " hup " .. params.memberID)
end)

delete("/:name", function(params)
	return execute("conference", params.name .. " hup all")
end)

get("/", function(params)
	return execute("conference", "list")
end)
