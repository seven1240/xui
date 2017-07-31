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

	Catch Event in Lua: lua.conf.xml

	<hook event="CUSTOM" subclass="fifo::info" script="/usr/local/freeswitch/xui/lua/xui/catch-event.lua"/>
]]

print(event:serialize())

cidName=event:getHeader("Caller-Caller-ID-Name")
cidNumber=event:getHeader("Caller-ANI")
destNumber=event:getHeader("Other-Leg-Destination-Number") or event:getHeader("Caller-Destination-Number")
fifoAction = event:getHeader("FIFO-Action")
httpFifoNotificationURL = nil -- "http://localhost:9999/"

local ticket_id = ''
if fifoAction == "push" or fifoAction == "abort" or fifoAction == "pre-dial" or fifoAction == "bridge-caller-start" or fifoAction == "bridge-caller-stop" or fifoAction == "consumer_stop" then

	local cur_dir = debug.getinfo(1).source;
	cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)[^/]+$", "%1")

	package.path = package.path .. ";/etc/xtra/?.lua"
	package.path = package.path .. ";" .. cur_dir .. "?.lua"
	package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"

	require 'utils'
	require 'xtra_config'
	require 'xdb'

	config.fifo_ticket = true

	if config.db_auto_connect then xdb.connect(config.fifo_cdr_dsn or config.dsn) end

	httpFifoNotificationURL = config.httpFifoNotificationURL

	uuid = event:getHeader("Unique-ID")
	fifo_name = event:getHeader("Fifo-Name")
	record_path = event:getHeader("variable_fifo_record_template")
	record_name = event:getHeader("variable_fifo_timestamp")
	
	if fifoAction == "push" then
		rec = {}
		rec.channel_uuid = uuid
		rec.fifo_name = fifo_name
		rec.ani = cidNumber
		rec.dest_number = destNumber
		rec.started_at = os.date('%Y-%m-%d %H:%M:%S')
		xdb.create('fifo_cdrs', rec)

		if config.fifo_ticket then -- create a ticket
			ticket = {}
			ticket.user_id = 0
			ticket.channel_uuid = uuid
			ticket.cid_number = cidNumber
			ticket.status = 'TICKET_ST_NEW'
			ticket.type = 'TICKET_TYPE_1'
			ticket.subject = cidNumber
			ticket.content = cidNumber .. '来电'
			ticket_id = xdb.create_return_id('tickets', ticket);
		end

	elseif fifoAction == "pre-dial" then
	elseif fifoAction == "bridge-caller-start" then
		rec = {}
		rec.bridged_number = destNumber
		rec.bridged_at = os.date('%Y-%m-%d %H:%M:%S')

		xdb.update_by_cond('fifo_cdrs', {channel_uuid = uuid}, rec)
	elseif fifoAction == "bridge-caller-stop" then
		rec = {}
		rec.ended_at = os.date('%Y-%m-%d %H:%M:%S')
		
		xdb.update_by_cond('fifo_cdrs', {channel_uuid = uuid}, rec)
	elseif fifoAction == "abort" then
		rec = {}
		rec.ended_at = os.date('%Y-%m-%d %H:%M:%S')

		xdb.update_by_cond('fifo_cdrs', {channel_uuid = uuid}, rec)
	elseif fifoAction == "consumer_stop" then
		uuid = event:getHeader("variable_bridge_uuid")
		rec = {}

		filename = string.match(record_path, ".*/(fifo%-record%-.*)$")
		ext = filename:match("^.+(%..+)$")

		local f = assert(io.open(record_path),"rb")
		local size = assert(f:seek("end"))

		rec.name = 'fifo-' .. cidNumber .. '-' .. destNumber
		if ext == ".wav" then
			rec.mime = "audio/wave"
			rec.ext = "wav"
		else
			rec.mime = "audio/mp3"
			rec.ext = "mp3"
		end
		rec.abs_path = record_path
		rec.file_size = "" .. size
		rec.type = "FIFO"
		rec.description = fifo_name
		rec.dir_path = config.fiforecord_path
		rec.channel_uuid = uuid
		rec.created_at = os.date('%Y-%m-%d %H:%M:%S')
		rec.original_file_name = filename
		rec.rel_path = filename
		media_file_id = xdb.create_return_id('media_files', rec)
		xdb.update_by_cond('fifo_cdrs', {channel_uuid = uuid}, {media_file_id = media_file_id})
		if config.fifo_ticket then
			xdb.update_by_cond('tickets', {id = ticket_id}, {media_file_id = media_file_id})
		end
		if config.fifo_ticket then -- update ?
			rec = {}
			rec.media_file_id = media_file_id
			media_file = xdb.find("media_files", media_file_id)
			if media_file then
				rec.record_path = media_file.rel_path
			end
			xdb.update_by_cond('tickets', {channel_uuid = uuid}, rec)
		end
	end
end

if httpFifoNotificationURL and fifoAction == "bridge-caller-start" then
	api = freeswitch.API()
	local url = httpFifoNotificationURL .. fifoAction .. "/" .. cidNumber .. "/" .. destNumber
	local args = "curl " .. url
	-- print(args)
	api:execute("bgapi", args)
end
