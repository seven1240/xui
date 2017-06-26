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

xtra.ignore_login('/')
xtra.ignore_login('/start')

xtra.start_session()
xtra.require_login()

content_type("application/json")
require 'xdb'
require 'utils'
xdb.bind(xtra.dbh)

function getStatus(status)
	if status == "Logged Out" then
		return "LoggedOut"
	elseif status == "On Break" then
		return "OnBreak"
	else
		return status
	end
end

function getState(state)
	if state == "In a queue call" then
		return "Active"
	else
		return state
	end
end

-- 1.1
post('/', function(params)
	login = 'cti'
	pass = params.request.password

	local user = xdb.find_one("users", {extn = login, password = pass})

	if user then
		xtra.save_session("user_id", user.id)
		return 200, {code = 200, session_id = xtra.session_uuid}
	else
		return 403
	end
end)

-- 1.2
get('/', function(params)
	return 200, {code = 200, running = true}
end)

-- 1.3
put('/start', function(params)
	return 200, {code = 200, text = "OK"}
end)

-- 1.4
put('/stop', function(params)
	return 200, {code = 200, text = "OK"}
end)

-- 1.5
put('/restart', function(params)
	return 200, {code = 200, text = "OK"}
end)

-- 1.6
get('/version', function(params)
	return {code = 200, version = '1.0.1'}
end)

-- 1.7
get('/agentState/:agent_id', function(params)
	-- local api = freeswitch.API()
	-- json = {command = "callcenter_config", data = {arguments = "agent list"}}
	-- args = utils.json_encode(json)
	-- ret = api:execute("json", args)
	-- json = utils.json_decode(ret)
	-- print(ret)

	-- if json.status == "success" then
	-- 	return json.response
	-- else
	-- 	return 500
	-- end
	local api = freeswitch.API()
	status = api:execute("callcenter_config", "agent get status " .. params.agent_id)
	return {status = getStatus(status)}
end)

-- 1.8
get('/calls', function(params)
	local api = freeswitch.API()
	ret = api:execute("show", "calls as json")
	return ret
end)

-- 1.9
get('/heldCalls', function(params)
	 local api = freeswitch.API()
	json = {command = "callcenter_config", data = {arguments = "queue list members",  queue_name = "support1@cti"}}
	args = utils.json_encode(json)
	ret = api:execute("json", args)
	json = utils.json_decode(ret)

	if json.status == "success" then
		return json.response
	else
		return 500
	end
end)

-- 1.10
get('/isProcessing/:agent_id', function(params)
	local api = freeswitch.API()
	state = api:execute("callcenter_config", "agent get state " .. params.agent_id)
	return {state = getState(state)}
end)

-- 1.11
post('/setConfig', function(params)
	return 200, {code = 200, text = "OK"}
end)

-- 1.12
post('/agentLogin', function(params)
	local api = freeswitch.API()
	local queue_name = params.request.queue_name
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " idle")
	api:execute("callcenter_config", "tier add " .. queue_name .. " " .. agent_id)
	return 200, {code = 200, text = "OK"}
end)

-- 1.13
delete('/agentLogout', function(params)
	local api = freeswitch.API()
	local queue_name = params.request.queue_name
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " Logged Out")
	api:execute("callcenter_config", "tier del " .. queue_name .. " " .. agent_id)
	return 200, {code = 200, text = "OK"}
end)

-- 1.14
put('/setReady', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " Available")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Waiting")
	return 200, {code = 200, text = "OK"}
end)

-- 1.15
put('/setNotReady', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " On Break")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Idle")
	return 200, {code = 200, text = "OK"}
end)

-- 1.16
put('/agentRest/:agent_id', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " On Break")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Idle")
	return 200, {code = 200, text = "OK"}
end)

-- 1.17
put('/answerCall', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	api:execute("uuid_phone_event", uuid .. " talk")
	return 200, {code = 200, text = "OK"}
end)

-- 1.18
put('/callInner', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	local calledAgent = params.request.calledAgent
	api:execute("bgapi", "originate user/" .. agent_id .. " "  .. calledAgent .. " XML default")
	return 200, {code = 200, text = "OK"}
end)

-- 1.19
put('/callOut', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	local callerNumber = params.request.callerNumber
	local calledNumber = params.request.calledNumber
	api:execute("bgapi", "originate user/" .. agent_id .. " set:effective_caller_id_number=" .. callerNumber .. ",set:effective_caller_id_name=" .. callerNumber .. ",transfer:" .. "'" .. calledNumber .. " XML default'")
	return 200, {code = 200, text = "OK"}
end)

-- 1.20
put('/holdCall', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	api:execute("uuid_hold", uuid)
	return 200, {code = 200, text = "OK"}
end)

-- 1.21
put('/retrieveCall', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	api:execute("uuid_hold", "off " .. uuid)
	return 200, {code = 200, text = "OK"}
end)

-- 1.22
put('/releaseCall', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	api:execute("uuid_kill", uuid)
	return 200, {code = 200, text = "OK"}
end)

-- 1.23
put('/sendDTMF/:uuid/:number', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local number = params.request.number
	api:execute("uuid_send_dtmf", uuid .. " " .. number .. " W")
	return 200, {code = 200, text = "OK"}
end)

-- 1.24
put('/muteOn', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	api:execute("uuid_audio", uuid .. " start read mute 0")
	api:execute("uuid_audio", uuid .. " start write mute 0")
	return 200, {code = 200, text = "OK"}
end)

-- 1.25
put('/muteOff', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	api:execute("uuid_audio", uuid .. " start read mute stop")
	api:execute("uuid_audio", uuid .. " start write mute stop")
	return 200, {code = 200, text = "OK"}
end)

-- 1.26
get('/CallData', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	callData = api:execute("uuid_dump", uuid .. "  json")
	return 200, {code = 200, text = "OK"}
end)

-- 1.27
put('/CallData', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local key = params.request.key
	local value = params.request.value
	api:execute("uuid_setvar", uuid .. " " .. key .. " " .. value)
	return 200, {code = 200, text = "OK"}
end)

-- 1.28
put('/transferIVR', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local accessCode = params.request.accessCode
	api:execute("uuid_transfer", uuid .. " " .. accessCode .. " XML default")
	return 200, {code = 200, text = "OK"}
end)

-- 1.29
put('/transferQueue', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local acdSkillID = params.request.acdSkillID
	api:execute("uuid_transfer", uuid .. " callcenter:" .. acdSkillID .. " inline")
	return 200, {code = 200, text = "OK"}
end)

-- 1.30
-- need use transfer_after_bridge in dialplan
put('/consultIVR', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local accessCode = params.request.accessCode
	api:execute("uuid_transfer", uuid .. " " .. accessCode .. " XML default")
	return 200, {code = 200, text = "OK"}
end)

-- 1.31
put('/transferOut', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local callerNumber = params.request.callerNumber
	local calledNumber = params.request.calledNumber
	api:execute("uuid_transfer", uuid .. " set:effective_caller_id_number=" .. callerNumber .. ",set:effective_caller_id_name=" .. callerNumber .. ",transfer:" .. "'" .. calledNumber .. " XML default'")
	return 200, {code = 200, text = "OK"}
end)

-- 1.32
put('/transferInner', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local agent_id = params.request.agent_id
	api:execute("uuid_transfer", uuid .. " bridge user/"  .. agent_id .. " inline")
	return 200, {code = 200, text = "OK"}
end)

-- 1.33
put('/consultOut', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local callerNumber = params.request.callerNumber
	local calledNumber = params.request.calledNumber
	api:execute("uuid_transfer", uuid .. " set:effective_caller_id_number=" .. callerNumber .. ",set:effective_caller_id_name=" .. callerNumber .. ",transfer:" .. "'" .. calledNumber .. " XML default'")
	return 200, {code = 200, text = "OK"}
end)

-- 1.34
put('/consultInner', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local agent_id = params.request.agent_id
	api:execute("uuid_transfer", uuid .. " bridge:user/" .. agent_id .. " inline")
	return 200, {code = 200, text = "OK"}
end)

-- 1.35
put('/consultTransfer', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local agent_id = params.request.agent_id
	api:execute("uuid_transfer", uuid .. " bind_meta_app:'1 b s execute_extension::xui_attended_xfer XML default',bridge:user/" .. agent_id .. " inline")
	return 200, {code = 200, text = "OK"}
end)

-- 1.36
put('/consultConference', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local destUUID = params.request.destUUID
	api:execute("uuid_transfer", uuid .. " answer,three_way:" .. destUUID .. " inline")
	return 200, {code = 200, text = "OK"}
end)

-- 1.37
put('/cancelConsult', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	api:execute("uuid_kill", uuid)
	return 200, {code = 200, text = "OK"}
end)

-- 1.38
put('/finishCall', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	status = api:execute("callcenter_config", "agent set status " .. agent_id .. " On Break")
	return 200, {code = 200, text = "OK"}
end)

-- 1.39
get('/allAgentStatus', function(params)
	local api = freeswitch.API()
	json = {command = "callcenter_config", data = {arguments = "agent list"}}
	args = utils.json_encode(json)
	ret = api:execute("json", args)
	json = utils.json_decode(ret)
	print(ret)

	if json.status == "success" then
		return json.response
	else
		return 500
	end
end)

-- 1.40
get('/queueWaitNum', function(params)
	local api = freeswitch.API()
	local acdSkillID = params.request.acdSkillID
	queueWaitNum = api:execute("callcenter_config", "queue count members " .. acdSkillID)
	return {queueWaitNum = queueWaitNum}
end)

-- 1.41
put('/listen', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local listenNumber = params.request.listenNumber
	api:execute("bgapi", "originate user/" .. listenNumber .. " &eavesdrop(" .. uuid .. ")")
	return 200, {code = 200, text = "OK"}
end)

-- 1.42
put('/stopListen', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	api:execute("uuid_kill", uuid)
	return 200, {code = 200, text = "OK"}
end)

-- 1.43
put('/insert', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local insertNumber = params.request.insertNumber
	api:execute("bgapi", "originate user/" .. insertNumber .. " &three_way(" .. uuid .. ")")
	return 200, {code = 200, text = "OK"}
end)

-- 1.44
put('/stopInsert', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	api:execute("uuid_kill", uuid)
	return 200, {code = 200, text = "OK"}
end)

-- 1.45
put('/forceReady', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " Available")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Waiting")
	return 200, {code = 200, text = "OK"}
end)

-- 1.46
put('/forceLogout', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " Log Out")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Idle")
	return 200, {code = 200, text = "OK"}
end)

-- 1.47
put('/forceBusy', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set state " .. agent_id .. " In a queue call")
	return 200, {code = 200, text = "OK"}
end)

-- 1.48
put('/forceLogout', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " Log Out")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Idle")
	return 200, {code = 200, text = "OK"}
end)

-- 1.49
put('/playLocalFiles', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local files = params.request.files
	if files then
		filesStr = string.gsub(files, ",", "!")
		api:execute("uuid_transfer", uuid .. " set:playback_delimiter=!,playback:'" .. filesStr .. "' inline")
		return 200, {code = 200, text = "OK"}
	else
	 return 500
	end
end)

-- 1.50
get("/recordFile", function(params)
	local recordFile = params.request.file
	if recordFile then
		file = io.open(recordFile)
		if not file then
			return 404
		end
		size = file:seek("end")
		file:seek("set")
		response_start(200)
		header("Content-Length", size)
		content_dispostiton = env:getHeader("Content-Disposition")
		if content_dispostiton then
			header("content-disposition", content_dispostiton)
		end
		content_type("application/octet-stream")
		xtra.write("")
		while size > 0 do
			local sz = size

			if size > 4096 then
				sz = 4096
			end

			x = file:read(sz)
			if (not x) then
				if (size > 0) then
					freeswitch.msleep(500)
				else
					break
				end
			else
				size = size - x:len()
				stream:raw_write(x, string.len(x))
			end
			file:close()
		end
	else
		return 404
	end
end)