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

-- xtra.ignore_login('/createCTI')
-- xtra.ignore_login('/startService')

xtra.ignore_login('/login')
xtra.start_session()
xtra.require_login()

content_type("application/json")
require 'xdb'
require 'utils'
require 'm_dialstring'
xdb.bind(xtra.dbh)

local debug = true

function do_debug(key, args)
	if debug then
		freeswitch.consoleLog("debug", key .. ":" .. args .. "\n")
	end
end

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

function is_agent_uuid(uuid)
	local api = freeswitch.API()
	local ret = api:execute("hiredis_raw", "default get " .. uuid)
	if (tonumber(ret)) then
		return true
	else
		return false
	end
end

function set_record()
	local api = freeswitch.API()
	local args = ''
	local uuid = api:execute("create_uuid")
	if config.auto_record then
		local grecordings_dir = api:execute("global_getvar", "recordings_dir")
		local rtime = api:execute("strftime", "%Y-%m-%d-%H-%M-%S")
		local recording_file = grecordings_dir .. "/cti/" .. rtime .. "." .. uuid .. ".wav"
		args = "[xrecording_file='" .. recording_file .. "',execute_on_answer='record_session " .. recording_file .. "',origination_uuid=" .. uuid .. "]"
	end
	return args
end

function cancel_record(uuid, hcomma, tcomma)
	local api = freeswitch.API()
	local args = ''
	local stop_uuid = uuid
	local recording_file = api:execute("hiredis_raw", "default get record_" .. uuid)
	local guuid = string.gsub(uuid, "-", "%%-")
	if string.find(recording_file, guuid) then
		local agent_from_callcenter = api:execute("uuid_getvar", uuid .. " agent_from_callcenter")
		if agent_from_callcenter == "true" then -- mod_callcenter record_template is for caller not agent
			stop_uuid =  api:execute("hiredis_raw", "default get other_leg_" .. uuid)
		end
		args = hcomma .. "set:xvar=${uuid_record('" .. stop_uuid .. " stop " .. recording_file .. "')}" .. tcomma
	end

	do_debug("cancel_record", args)
	return args
end
-- 1.1
-- post('/createCTI', function(params)
-- 	login = 'cti'
-- 	pass = params.request.password

-- 	local user = xdb.find_one("users", {extn = login, password = pass})

-- 	if user then
-- 		xtra.save_session("user_id", user.id)
-- 		return 200, {code = 200, session_id = xtra.session_uuid}
-- 	else
-- 		return 403
-- 	end
-- end)

-- 1.2
-- get('/isServiceRunning', function(params)
-- 	return 200, {code = 200, running = true}
-- end)

-- 1.3
-- put('/startService', function(params)
-- 	login = 'cti'
-- 	pass = params.request.password

-- 	local user = xdb.find_one("users", {extn = login, password = pass})

-- 	if user then
-- 		xtra.save_session("user_id", user.id)
-- 		return 200, {code = 200, session_id = xtra.session_uuid}
-- 	else
-- 		return 403
-- 	end
-- end)

-- -- 1.4
-- put('/stopService', function(params)
-- 	return 200, {code = 200, text = "OK"}
-- end)

-- -- 1.5
-- put('/restartService', function(params)
-- 	return 200, {code = 200, text = "OK"}
-- end)

-- 1.6
-- get('/serviceVersion', function(params)
-- 	return {code = 200, version = '1.0.1'}
-- end)


post('/login', function(params)
	login = 'cti'
	pass = params.request.password

	local user = xdb.find_one("users", {extn = login, password = pass})

	if user then
		xtra.save_session("user_id", user.id)
		return 200, {code = 200, session_id = xtra.session_uuid}
	else
		return 200, {code = 403, message = "password error"}
	end
end)

delete('/logout', function(params)
	xtra.save_session("user_id")
	return 200, {code = 200, text = "OK"}
end)


-- 1.7
get('/agentState', function(params)
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
	local agent_id = params.request.agent_id
	status = api:execute("callcenter_config", "agent get status " .. agent_id)
	return {status = getStatus(status)}
end)

-- 1.8
get('/activeCallInfo', function(params)
	local api = freeswitch.API()
	local ret = api:execute("show", "calls as json")
	return ret
end)

-- 1.9
get('/heldCallInfo', function(params)
	local api = freeswitch.API()
	local queue_name = params.request.queue_name
	if queue_name == '' or queue_name == nil then
		queue_name = "support@cti"
	end
	json = {command = "callcenter_config", data = {arguments = "queue list members", queue_name = queue_name}}
	args = utils.json_encode(json)
	ret = api:execute("json", args)
	json = utils.json_decode(ret)
	local tab = {}
	if json.response then
		local ret = json.response

		for k,v in pairs(ret) do
			if type(v) == "table" then
				if v.state == "Waiting" then
					table.insert(tab, v)
				end
			end
		end
	end
	return tab
end)

-- 1.10
get('/isProcessing', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	state = api:execute("callcenter_config", "agent get state " .. agent_id)
	return {state = getState(state)}
end)

-- 1.11
post('/setConfig', function(params)
	return 200, {code = 200, text = "OK"}
end)

-- 1.12
put('/agentLogin', function(params)
	local api = freeswitch.API()
	local queue_name = params.request.queue_name
	local agent_id = params.request.agent_id
	local context = 'cti'

	if queue_name == '' or queue_name == nil then
		queue_name = "support@cti"
	end

	local dial_str = m_dialstring.build(agent_id, context)

	do_debug("agentLogin dial_str", dial_str)

	api:execute("callcenter_config", "agent add " .. agent_id .. " callback")
	api:execute("callcenter_config", "agent set contact " .. agent_id .. " {absolute_codec_string=PCMU,PCMA}{x_bridge_agent=" .. agent_id .. "}[x_agent=" .. agent_id .. "][agent_from_callcenter=true]" .. dial_str)
	api:execute("callcenter_config", "agent set status " .. agent_id .. " 'On Break'")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Idle")
	api:execute("callcenter_config", "tier add " .. queue_name .. " " .. agent_id)
	return 200, {code = 200, text = "OK"}
end)

-- 1.13
delete('/agentLogout', function(params)
	local api = freeswitch.API()
	local queue_name = params.request.queue_name
	local agent_id = params.request.agent_id

	if queue_name == '' or queue_name == nil then
		queue_name = "support@cti"
	end
	api:execute("callcenter_config", "agent set status " .. agent_id .. " 'Logged Out'")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Idle")
	api:execute("callcenter_config", "tier del " .. queue_name .. " " .. agent_id)
	api:execute("callcenter_config", "agent del " .. agent_id)
	return 200, {code = 200, text = "OK"}
end)

-- 1.14
put('/setReady', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " 'Available (On Demand)'")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Waiting")
	return 200, {code = 200, text = "OK"}
end)

-- 1.15
put('/setNotReady', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " 'On Break'")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Idle")
	return 200, {code = 200, text = "OK"}
end)

-- 1.16
put('/agentRest', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " 'On Break'")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Idle")
	return 200, {code = 200, text = "OK"}
end)

-- 1.17
put('/answerCall', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	local args = uuid .. " talk"

	do_debug("answerCall", args)
	api:execute("uuid_phone_event", args)
	return 200, {code = 200, text = "OK"}
end)

-- 1.18
put('/callInner', function(params)
	local api = freeswitch.API()
	local context = 'cti'
	local record_str = set_record()
	local agent_id = params.request.agent_id
	local calledAgent = params.request.calledAgent
	local caller_dial_str = "{absolute_codec_string=PCMU,PCMA}[x_agent=" .. agent_id .. "]" .. record_str .. m_dialstring.build(agent_id, context)
	local called_dial_str = "[x_agent=" .. calledAgent .. ",x_caller=" .. agent_id ..",x_dest=" .. calledAgent .. "]" .. m_dialstring.build(calledAgent, context)
	local args = "originate " .. caller_dial_str .. " m:^:callcenter_track:" .. agent_id .. "^export:nolocal:execute_on_answer='callcenter_track " .. calledAgent .. "'^bridge:" .. called_dial_str .. " inline"
	do_debug("callInner", args)
	api:execute("bgapi", args)
	return 200, {code = 200, text = "OK"}
end)

-- 1.19
put('/callOut', function(params)
	local api = freeswitch.API()
	local context = 'cti'
	local record_str = set_record()
	local agent_id = params.request.agent_id
	local callerNumber = params.request.callerNumber
	local calledNumber = params.request.calledNumber
	local caller_dial_str = "{absolute_codec_string=PCMU,PCMA}[x_agent=" .. agent_id .. "][xx_caller=" .. agent_id .. "]" .. record_str .. m_dialstring.build(agent_id, context)
	local args = "originate " .. caller_dial_str .. " m:^:callcenter_track:" .. agent_id .. "^export:nolocal:x_caller=" .. agent_id .. "^export:nolocal:x_dest=" .. calledNumber .. "^transfer:" .. "'" .. calledNumber .. " XML " .. context .. "' inline"
	if callerNumber ~= '' and callerNumber ~= nil then
		args = "originate " .. caller_dial_str .. " m:^:callcenter_track:" .. agent_id .. "^export:nolocal:x_caller=" .. agent_id .. "^export:nolocal:x_dest=" .. calledNumber .. "^set:effective_caller_id_number=" .. callerNumber .. "^set:effective_caller_id_name=" .. callerNumber .. "^set:cc_export_vars=xx_caller^transfer:" .. "'" .. calledNumber .. " XML " .. context .. "' inline"
	end
	do_debug("callOut", args)
	api:execute("bgapi", args)
	return 200, {code = 200, text = "OK"}
end)

-- 1.20
put('/holdCall', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	do_debug("holdCall", uuid)
	api:execute("uuid_hold", uuid)
	return 200, {code = 200, text = "OK"}
end)

-- 1.21
put('/retrieveCall', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end
	do_debug("retrieveCall", "off " .. uuid)
	api:execute("uuid_hold", "off " .. uuid)
	return 200, {code = 200, text = "OK"}
end)

-- 1.22
put('/releaseCall', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	do_debug("releaseCall", "off " .. uuid)

	api:execute("uuid_kill", uuid)
	return 200, {code = 200, text = "OK"}
end)

-- 1.23
put('/sendDTMF', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local number = params.request.number

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	do_debug("sendDTMF", uuid .. " " .. number .. " W")

	api:execute("uuid_send_dtmf", uuid .. " " .. number .. " W")
	return 200, {code = 200, text = "OK"}
end)

-- 1.24
put('/muteOn', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	do_debug("muteOn", uuid .. " start read mute -4")
	do_debug("muteOn", uuid .. " start write mute -4")

	api:execute("uuid_audio", uuid .. " start read mute -4")
	api:execute("uuid_audio", uuid .. " start write mute -4")
	return 200, {code = 200, text = "OK"}
end)

-- 1.25
put('/muteOff', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	do_debug("muteOff", uuid .. " start read mute stop")
	do_debug("muteOff", uuid .. " start write mute stop")

	api:execute("uuid_audio", uuid .. " start read mute stop")
	api:execute("uuid_audio", uuid .. " start write mute stop")
	return 200, {code = 200, text = "OK"}
end)

-- 1.26
get('/callData', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	do_debug("get callData", uuid .. "  json")

	callData = api:execute("uuid_dump", uuid .. "  json")
	return callData
end)

-- 1.27
put('/callData', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local key = params.request.key
	local value = params.request.value

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	do_debug("put callData", uuid .. " " .. key .. " " .. value)

	api:execute("uuid_setvar", uuid .. " " .. key .. " " .. value)
	return 200, {code = 200, text = "OK"}
end)

-- 1.28
put('/transferIVR', function(params)
	local api = freeswitch.API()
	local context = 'cti'
	local uuid = params.request.uuid
	local accessCode = params.request.accessCode
	local bleg = ''

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	if is_agent_uuid(uuid) then
		bleg = "-bleg"
	end

	local cancel_record_str = cancel_record(uuid, '', ",")

	local args = uuid .. "  " .. bleg .. " " .. cancel_record_str .. "transfer:'" .. accessCode .. " XML " .. context .. "' inline"

	do_debug("transferIVR", args)

	api:execute("uuid_transfer", args)
	return 200, {code = 200, text = "OK"}
end)

-- 1.29
put('/transferQueue', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local queue_name = params.request.queue_name
	local bleg = ''
	if queue_name == '' or queue_name == nil then
		queue_name = "support@cti"
	end

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	if is_agent_uuid(uuid) then
		bleg = "-bleg"
	end

	local cancel_record_str = cancel_record(uuid, ',', '')

	local args = uuid .. " " .. bleg .. " set:x_callcenter=true" .. cancel_record_str .. ",callcenter:" .. queue_name .. " inline"

	do_debug("transferQueue", args)

	api:execute("uuid_transfer", args)
	return 200, {code = 200, text = "OK"}
end)

-- 1.30
-- need use transfer_after_bridge in dialplan
put('/consultIVR', function(params)
	local api = freeswitch.API()
	local context = 'cti'
	local uuid = params.request.uuid
	local accessCode = params.request.accessCode
	local queue_name = params.request.queue_name
	local bleg = ''
	if queue_name == '' or queue_name == nil then
		queue_name = "support@cti"
	end
	local dst_nbr = api:execute("uuid_getvar", uuid .. " destination_number")

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	if is_agent_uuid(uuid) then
		bleg = "-bleg"
	end

	local args = uuid .. " playback:'local_stream://moh'/inline export:transfer_fallback_extension=1007,export:exec_after_bridge_app=intercept,set:exec_after_bridge_arg=" .. uuid .. ",transfer:'" .. accessCode .. " xml cti'/inline"
	do_debug("consultIVR", args)
	api:execute("uuid_dual_transfer", args)
	return 200, {code = 200, text = "OK"}
end)

-- 1.31
put('/transferOut', function(params)
	local api = freeswitch.API()
	local context = 'cti'
	local uuid = params.request.uuid
	local callerNumber = params.request.callerNumber
	local calledNumber = params.request.calledNumber
	local bleg = ''

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	if is_agent_uuid(uuid) then
		bleg = "-bleg"
	end


	local cancel_record_str = cancel_record(uuid, '', ",")

	local args = uuid .. " " .. bleg .. " " .. cancel_record_str .. "transfer:" .. "'" .. calledNumber .. " XML " .. context .. "' inline"
	if callerNumber ~= '' and callerNumber ~= nil then
		args = uuid .. " " .. bleg .. " " .. cancel_record_str .. "set:effective_caller_id_number=" .. callerNumber .. ",set:effective_caller_id_name=" .. callerNumber .. ",transfer:" .. "'" .. calledNumber .. " XML " .. context .. "' inline"
	end

	do_debug("transferOut", args)

	api:execute("uuid_transfer", args)
	return 200, {code = 200, text = "OK"}
end)

-- 1.32
put('/transferInner', function(params)
	local api = freeswitch.API()
	local context = 'cti'
	local uuid = params.request.uuid
	local agent_id = params.request.agent_id
	local dial_str = m_dialstring.build(agent_id, context)
	local bleg = ''

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	if is_agent_uuid(uuid) then
		bleg = "-bleg"
	end

	local cancel_record_str = cancel_record(uuid, '', ",")

	local record_str_tmp = set_record()

	local record_str = ''

	if record_str_tmp then
		record_str = string.gsub(record_str_tmp, ",", "\\,")
	end

	local args = uuid .. " " .. bleg .. " " .. cancel_record_str .. "set:x_callcenter=true,export:'nolocal:x_agent=" .. agent_id .. "',bridge:" .. record_str .. dial_str .. " inline"

	do_debug("transferInner", args)

	api:execute("uuid_transfer", args)
	return 200, {code = 200, text = "OK"}
end)

-- -- 1.33
-- put('/consultOut', function(params)
-- 	local api = freeswitch.API()
-- 	local context = 'cti'
-- 	local uuid = params.request.uuid
-- 	local callerNumber = params.request.callerNumber
-- 	local calledNumber = params.request.calledNumber
-- 	local bleg = ''

-- 	if (string.len(uuid) ~= 36) then -- uuid is a number
-- 		local ret = api:execute("hiredis_raw", "default get " .. uuid)
-- 		uuid = ret
-- 	end

-- 	if is_agent_uuid(uuid) then
-- 		bleg = "-bleg"
-- 	end

-- 	local args = uuid .. " " .. bleg .. " transfer:" .. "'" .. calledNumber .. " XML " .. context .. "' inline"
-- 	if callerNumber ~= '' and callerNumber ~= nil then
-- 		args = uuid .. " " .. bleg .. " set:effective_caller_id_number=" .. callerNumber .. ",set:effective_caller_id_name=" .. callerNumber .. ",transfer:" .. "'" .. calledNumber .. " XML " .. context .. "' inline"
-- 	end

-- 	do_debug("consultOut", args)

-- 	api:execute("uuid_transfer", args)
-- 	return 200, {code = 200, text = "OK"}
-- end)

-- -- 1.34
-- put('/consultInner', function(params)
-- 	local api = freeswitch.API()
-- 	local context = 'cti'
-- 	local uuid = params.request.uuid
-- 	local agent_id = params.request.agent_id
-- 	local dial_str = m_dialstring.build(agent_id, context)
-- 	local bleg = ''

-- 	if (string.len(uuid) ~= 36) then -- uuid is a number
-- 		local api = freeswitch.API()
-- 		ret = api:execute("hiredis_raw", "default get " .. uuid)
-- 		uuid = ret
-- 	end

-- 	if is_agent_uuid(uuid) then
-- 		bleg = "-bleg"
-- 	end


-- 	local args = uuid .. " " .. bleg .. " set:x_callcenter=true,export:'nolocal:x_agent=" .. agent_id .. "',bridge:"  .. dial_str .. " inline"

-- 	do_debug("consultInner", args)

-- 	api:execute("uuid_transfer", args)
-- 	return 200, {code = 200, text = "OK"}
-- end)

-- 1.35
put('/consultTransfer', function(params)
	local api = freeswitch.API()
	local context = 'cti'
	local uuid = params.request.uuid
	local agent_id = params.request.agent_id
	local dial_str = m_dialstring.build(agent_id, context)

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	local att_xfer_from_agent_id = api:execute("hiredis_raw", "default get " .. uuid)

	local record_str = set_record()
	local cancel_record_str_tmp = cancel_record(uuid, '', '')
	local cancel_record_str = ''

	if cancel_record_str_tmp then
		cancel_record_str = string.gsub(cancel_record_str_tmp, ":", "::")
	end

	local args = uuid .. " att_xfer::[x_agent=" .. agent_id ..",x_caller=" .. att_xfer_from_agent_id .. ",x_dest=" .. agent_id .."]" .. record_str .. dial_str

	do_debug("cancel_record_str", uuid .. " " .. cancel_record_str)
	do_debug("consultTransfer", args)

	api:execute("uuid_broadcast", uuid .. " set::transfer_ringback=$${hold_music}")
	api:execute("uuid_broadcast", uuid .. " " .. cancel_record_str)
	api:execute("uuid_broadcast", args)
	return 200, {code = 200, text = "OK"}
end)

-- 1.36
put('/consultConference', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local destUUID = params.request.destUUID
	local bleg = ''

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret1 = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret1
	end

	if is_agent_uuid(uuid) then
		bleg = "-bleg"
	end

	if (string.len(destUUID) ~= 36) then -- destUUID is a number
		local ret2 = api:execute("hiredis_raw", "default get " .. destUUID)
		destUUID = ret2
	end

	local cancel_record_str = cancel_record(uuid, '', ",")

	local args = uuid .. " " .. bleg .. " " .. cancel_record_str .. "answer,three_way:" .. destUUID .. " inline"

	do_debug("consultConference", args)

	api:execute("uuid_transfer", args)
	return 200, {code = 200, text = "OK"}
end)

-- 1.37
put('/cancelConsult', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	do_debug("cancelConsult", uuid)

	api:execute("uuid_kill", uuid)
	return 200, {code = 200, text = "OK"}
end)

-- 1.38
put('/finishCall', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Idle")
	api:execute("callcenter_config", "agent set status " .. agent_id .. " 'On Break'")
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
	local queue_name = params.request.queue_name
	if queue_name == '' or queue_name == nil then
		queue_name = "support@cti"
	end
	json = {command = "callcenter_config", data = {arguments = "queue list members", queue_name = queue_name}}
	args = utils.json_encode(json)
	ret = api:execute("json", args)
	json = utils.json_decode(ret)
	local count = 0
	if json.response then
		local ret = json.response

		for k, v in pairs(ret) do
			if type(v) == "table" then
				if v.state == "Waiting" then
					count = count + 1
				end
			end
		end
	end
	return {count = count}
end)

-- 1.41
put('/listen', function(params)
	local api = freeswitch.API()
	local context = 'cti'
	local uuid = params.request.uuid
	local listenNumber = params.request.listenNumber
	local dial_str = m_dialstring.build(listenNumber, context)

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	local args = "originate [x_agent=" .. listenNumber .. "]" .. dial_str .. " callcenter_track:" .. listenNumber .. ",eavesdrop:" .. uuid .. " inline"

	do_debug("listen", args)
	api:execute("bgapi", args)
	return 200, {code = 200, text = "OK"}
end)

-- 1.42
put('/stopListen', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	do_debug("stopListen", uuid)

	api:execute("uuid_kill", uuid)
	return 200, {code = 200, text = "OK"}
end)

-- 1.43
put('/insert', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local context = 'cti'
	local insertNumber = params.request.insertNumber
	local dial_str = m_dialstring.build(insertNumber, context)
	local record_str = set_record()

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	local args = "originate [x_agent=" .. insertNumber .. "]" .. record_str .. dial_str .. " callcenter_track:" .. insertNumber .. ",three_way:" .. uuid .. " inline"

	do_debug("insert", args)

	api:execute("bgapi", args)
	return 200, {code = 200, text = "OK"}
end)

-- 1.44
put('/stopInsert', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid

	if (string.len(uuid) ~= 36) then -- uuid is a number
		local ret = api:execute("hiredis_raw", "default get " .. uuid)
		uuid = ret
	end

	do_debug("stopInsert", uuid)

	api:execute("uuid_kill", uuid)
	return 200, {code = 200, text = "OK"}
end)

-- 1.45
put('/forceReady', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " 'Available (On Demand)'")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Waiting")
	return 200, {code = 200, text = "OK"}
end)

-- 1.46
put('/forceLogout', function(params)
	local api = freeswitch.API()
	local queue_name = params.request.queue_name
	local agent_id = params.request.agent_id

	if queue_name == '' or queue_name == nil then
		queue_name = "support@cti"
	end
	api:execute("callcenter_config", "agent set status " .. agent_id .. " 'Logged Out'")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " Idle")
	api:execute("callcenter_config", "tier del " .. queue_name .. " " .. agent_id)
	api:execute("callcenter_config", "agent del " .. agent_id)
	return 200, {code = 200, text = "OK"}
end)

-- 1.47
put('/forceBusy', function(params)
	local api = freeswitch.API()
	local agent_id = params.request.agent_id
	api:execute("callcenter_config", "agent set status " .. agent_id .. " 'On Break'")
	api:execute("callcenter_config", "agent set state " .. agent_id .. " In a queue call")
	return 200, {code = 200, text = "OK"}
end)

-- 1.48
-- put('/forceLogout', function(params)
-- 	local api = freeswitch.API()
-- 	local queue_name = params.request.queue_name
-- 	local agent_id = params.request.agent_id

-- 	if queue_name == '' or queue_name == nil then
-- 		queue_name = "support@cti"
-- 	end
-- 	api:execute("callcenter_config", "agent set status " .. agent_id .. " 'Logged Out'")
-- 	api:execute("callcenter_config", "agent set state " .. agent_id .. " Idle")
-- 	api:execute("callcenter_config", "tier del " .. queue_name .. " " .. agent_id)
-- 	api:execute("callcenter_config", "agent del " .. agent_id)
-- 	return 200, {code = 200, text = "OK"}
-- end)

-- 1.49
-- put('/xplayLocalFiles', function(params)
-- 	local api = freeswitch.API()
-- 	local uuid = params.request.uuid
-- 	local files = params.request.files
-- 	local bleg = ''

-- 	if (string.len(uuid) ~= 36) then -- uuid is a number
-- 		local ret = api:execute("hiredis_raw", "default get " .. uuid)
-- 		uuid = ret
-- 	end

-- 	if is_agent_uuid(uuid) then
-- 		bleg = "-bleg"
-- 	end

-- 	if files then
-- 		filesStr = string.gsub(files, ",", "!")

-- 		local args = uuid .. " " .. bleg .. " set:playback_delimiter=!,playback:'" .. filesStr .. "' inline"
-- 		do_debug("playLocalFiles", args)
-- 		api:execute("uuid_transfer", args)
-- 		return 200, {code = 200, text = "OK"}
-- 	else
-- 	 return 500
-- 	end
-- end)

put('/playLocalFiles', function(params)
	local api = freeswitch.API()
	local uuid = params.request.uuid
	local files = params.request.files
	local context = 'cti'
	local bleg = ''
	local args = ''

	if files then
		filesStr = string.gsub(files, ",", "!")
	else
		return 500
	end

	if (string.len(uuid) ~= 36) then -- uuid is agent number
		local dial_str = m_dialstring.build(uuid, context)
		args = "originate [x_agent=" .. uuid .. "]" .. dial_str .. " callcenter_track:" .. uuid .. ",set:playback_delimiter=!,playback:'" .. filesStr .. "' inline"
		do_debug("playLocalFiles", args)
		api:execute("bgapi", args)
	else
		if is_agent_uuid(uuid) then
			bleg = "-bleg"
		end
		args = uuid .. " " .. bleg .. " set:playback_delimiter=!,playback:'" .. filesStr .. "' inline"
		do_debug("playLocalFiles", args)
		api:execute("uuid_transfer", args)
	end
	return 200, {code = 200, text = "OK"}
end)

-- 1.50
get("/downloadRecordFile", function(params)
	local recordFile = params.request.file
	if recordFile then
		local fileName = recordFile:match( "([^/]+)$" )
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
		else
			header("Content-Disposition", "attachment; filename="  .. fileName)
		end
		content_type("application/octet-stream")
		xtra.write("")
		while size > 0 do
			local sz = size

			-- if size > 4096 then
			-- 	sz = 4096
			-- end

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
		return 200, {code = 404, message = "file not found"}
	end
	return 200, {code = 200, text = "OK"}
end)