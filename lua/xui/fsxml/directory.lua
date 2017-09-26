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

local do_debug = config.do_debug
-- do_debug = true

function __FILE__() return debug.getinfo(2,'S').source end
function __LINE__() return debug.getinfo(2, 'l').currentline end
function __FUNC__() return debug.getinfo(1).name end

if do_debug then
	require 'utils'
	utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", params:serialize())
end

if not params then
	XML_STRING = [[<domain name="]] .. '$${domain}' .. [[">]]

	xdb.find_by_cond("users", {disabled = 0}, "extn", function(row)
		XML_STRING = XML_STRING .. [[<users><user id="]] .. row.extn .. [[">]] ..
		[[<variables>]] ..
		[[<variable name="user_context" value="default"/>]] ..
		[[<variable name="effective_caller_id_name" value="]] .. row.extn .. [["/>]] ..
		[[<variable name="effective_caller_id_number" value="]] .. row.extn .. [["/>]] ..
		[[</variables>]] ..
		[[</user></users>]]
	end)

	XML_STRING = XML_STRING .. [[</domain>]]
	return XML_STRING
end

local user = params:getHeader("user")
local domain = params:getHeader("domain")
local purpose = params:getHeader("purpose")
local action = params:getHeader("action")
local vars = ""
local pars = ""
local found = false
local user_id = nil

if do_debug and purpose then
	utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", "purpose:" .. purpose .. "\n")
end

if purpose == "network-list" then
	XML_STRING = [[<domain name="]] .. domain .. [[">]]

	xdb.find_by_cond("users", "user_cidr IS NOT NULL AND user_cidr <> ''", nil, function(row)
		XML_STRING = XML_STRING .. [[<user id="]] .. row.extn .. [[" cidr="]] .. row.user_cidr .. [["/>]]
	end)

	XML_STRING = XML_STRING .. [[</domain>]]
	return XML_STRING
end

if user then
	xdb.find_by_cond("users", {extn = user, disabled = 0}, nil, function(row)
		if action == "jsonrpc-authenticate" and row.weblogin_disabled == '1' then
			return
		end

		found = true
		user_id = row.id

		cid_name = row.cid_name
		cid_number = row.cid_number

		if cid_name == '' then
			cid_name = row.name
		end

		if cid_number == '' then
			cid_number = row.extn
		end

		local dial_string = "{^^:sip_invite_domain=${dialed_domain}:presence_id=${dialed_user}@${dialed_domain}}${sofia_contact(*/${dialed_user}@${dialed_domain})},${verto_contact(${dialed_user}@${dialed_domain})}";

		if row.type == 'HK' then -- Hai Kang
			dial_string = "{^^!sip_h_Subject=" .. user .. ":0,34020000001320009999:0!absolute_codec_string=PS}" .. dial_string
		end

		pars= 	'<param name="vm-password" value="' .. row.vm_password .. '"/>' ..
				'<param name="dial-string" value="' .. dial_string .. '"/>'

		if config.password_use_a1_hash then
			pars = pars .. '<param name="a1-hash" value="' .. row.password .. '"/>'
		else
			pars = pars .. '<param name="password" value="' .. row.password .. '"/>'
		end

		vars =  '<variable name="user_context" value="' .. row.context .. '"/>' ..
				'<variable name="accountcode" value="' .. row.extn .. '"/>'

		if row.cid_name ~= 'PASS' then
			vars = vars ..
				'<variable name="caller_id_name" value="' .. cid_name .. '"/>' ..
				'<variable name="effective_caller_id_name" value="' .. cid_name .. '"/>' ..
				'<variable name="effective_caller_id_number" value="' .. cid_number .. '"/>'
		end

		if row.auto_record == "1" then
			vars = vars .. '\n<variable name="auto_record" value="true"/>\n'
		end
	end)
end

function is_admin(user_id)
	return user_id == 1 or user_id == "1"
end

if (found) then

	local fsapis = "console_complete,log,version,help,conference,uuid_phone_event,status,show,jsapi,list_users,callcenter_config,jsjson,originate,rtp_mcast,fifo,distributor,mips"
	if is_admin(user_id) then
		fsapis = fsapis .. ",lua,unload,reload,load,bgapi,sofia,uuid_kill,select,ifconfig,sip,distributor_ctl"
	end

	XML_STRING = [[<domain name="]] .. domain .. [[">
		<user id="]] .. user .. [[">
			<params>
				<!-- These are required for Verto to function properly -->
				<param name="jsonrpc-allowed-methods" value="verto.subscribe,verto,txtapi,jsapi,xmlapi,makeCall,callcenter_config"/>
				<param name="jsonrpc-allowed-jsapi" value="cti,mips,fsapi,show,status,jsjson,lua,luarun"/>
				<param name="jsonrpc-allowed-fsapi" value="]] .. fsapis .. [["/>
				<param name="jsonrpc-allowed-event-channels" value="demo,conference,conference-liveArray,conference-chat,conference-mod,presence,cti,FSevent,FSLog"/>
				]] .. pars .. [[
			</params>
			<variables>
				<variable name="record_stereo" value="true"/>
				<variable name="transfer_fallback_extension" value="operator"/>
				<variable name="toll_allow" value="domestic,international,local"/>
				<variable name="outbound_caller_id_name" value="FSXUI"/>
				<variable name="outbound_caller_id_number" value="0000000"/>
				<variable name="callgroup" value="techsupport"/>
				]] .. vars .. [[
			</variables>
		</user>
	</domain>]]
end

if (not found) and (action == "voicemail-lookup") then
	XML_STRING = [[<domain name="]] .. domain .. [[">
		<user id="]] .. user .. [[">
			<params>
				<param name="vm-password" value="1000"/>
			</params>
		</user>
	</domain>]]
end

if do_debug then
	utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", XML_STRING)
end
