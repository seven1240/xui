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

 Conference CDR
]]


local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)[^/]+$", "%1")

package.path = package.path .. ";/etc/xtra/?.lua"
package.path = package.path .. ";" .. cur_dir .. "?.lua"
package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"

require 'utils'
require 'xtra_config'
require 'xdb'

function __FILE__() return debug.getinfo(2,'S').source end
function __LINE__() return debug.getinfo(2, 'l').currentline end
function __FUNC__() return debug.getinfo(1).name end

local do_debug = config.do_debug
do_debug = true

if config.db_auto_connect then xdb.connect(config.fifo_cdr_dsn or config.dsn) end

local filename = argv[1]
local file, err = io.open(filename, "r")

local p = filename:find(".cdr.xml")
local conference_uuid = filename:sub(1, p - 1)

if file and not err then
	local data = file:read("*a")

	io.close(file)

	data = (string.gsub(data, 'name', "confname"))

	local doc = require("xmlSimple").newParser()

	xml = doc:ParseXmlText(data)

	local rec = {}
	local pos = string.find(xml.cdr.conference.confname:value(), "-")

	rec.uuid = conference_uuid
	rec.num = string.sub(xml.cdr.conference.confname:value(), 0, pos-1)
	rec.name =  xml.cdr.conference.confname:value()
	rec.started_at = os.date('%Y-%m-%d %H:%M:%S', xml.cdr.conference.start_time:value())
	rec.completed_at = os.date('%Y-%m-%d %H:%M:%S', xml.cdr.conference.end_time:value())
	rec.hostname  = xml.cdr.conference.hostconfname:value()
	rec.rate = xml.cdr.conference.rate:value()
	rec.interval = xml.cdr.conference.interval:value()

	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", rec.num)
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", rec.name)
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", rec.started_at)
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", rec.completed_at)
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", rec.hostname)
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", rec.rate)
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", rec.interval)
	end

	local cdr_id = xdb.create_return_id("conference_cdrs", rec)

	if not cdr_id then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "ERR", "Create Conference CDR ERR")
	else
		for k, member in pairs(xml.cdr.conference.members:children()) do
			rec = {}
			rec.conference_cdr_id = cdr_id
			rec.joined_at          = os.date('%Y-%m-%d %H:%M:%S', member.join_time:value())
			rec.left_at            = os.date('%Y-%m-%d %H:%M:%S', member.leave_time:value())
			rec.is_moderator       = (member.flags.is_moderator:value() == "true") and 1 or 0
			rec.end_conference     = (member.flags.end_conference:value() == "true") and 1 or 0
			rec.was_kicked         = (member.flags.was_kicked:value() == "true") and 1 or 0
			rec.is_ghost           = (member.flags.is_ghost:value() == "true") and 1 or 0
			rec.username           = member.caller_profile.userconfname:value()
			rec.dialplan           = member.caller_profile.dialplan:value()
			rec.caller_id_name     = member.caller_profile.caller_id_confname:value()
			rec.caller_id_number   = member.caller_profile.caller_id_number:value()
			rec.callee_id_name     = member.caller_profile.callee_id_confname:value()
			rec.callee_id_number   = member.caller_profile.callee_id_number:value()
			rec.ani                = member.caller_profile.ani:value()
			rec.aniii              = member.caller_profile.aniii:value()
			rec.network_addr       = member.caller_profile.network_addr:value()
			rec.rdnis              = member.caller_profile.rdnis:value()
			rec.destination_number = member.caller_profile.destination_number:value()
			rec.uuid               = member.caller_profile.uuid:value()
			rec.source             = member.caller_profile.source:value()
			rec.context            = member.caller_profile.context:value()
			rec.chan_name          = member.caller_profile.chan_confname:value()

			xdb.create_return_id("conference_cdr_members", rec)
		end
	end
else
	print(err)
end
