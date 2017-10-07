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

if env then -- api_hangup_hook
	uuid = env:getHeader("uuid")
	xdb.update_by_cond("conference_cdr_members", {uuid = uuid}, {left_at = os.date('%Y-%m-%d %H:%M:%S')})
else -- App with session
	cdr = xdb.find_one("conference_cdrs", {num = argv[1]}, 'id DESC')

	if not cdr then
		local rec = {}
		local api = freeswitch.API()

		rec.uuid = api:execute("create_uuid")
		rec.num = argv[1]
		rec.name =  argv[1]
		rec.started_at = os.date('%Y-%m-%d %H:%M:%S')
		-- rec.completed_at = os.date('%Y-%m-%d %H:%M:%S')
		rec.hostname  = 'localhost'
		rec.rate = 0
		rec.interval = 0

		local cdr_id = xdb.create_return_id("conference_cdrs", rec)

		if not cdr_id then
			utils.xlog(__FILE__() .. ':' .. __LINE__(), "ERR", "Create Conference CDR ERR")
		else
			cdr = rec
			cdr.id = cdr_id
		end
	end

	if cdr then
		rec = {}
		rec.conference_cdr_id = cdr.id
		rec.joined_at          = os.date('%Y-%m-%d %H:%M:%S')
		-- rec.left_at            = os.date('%Y-%m-%d %H:%M:%S')
		rec.username           = session:getVariable("username")
		rec.dialplan           = session:getVariable("dialplan")
		rec.caller_id_name     = session:getVariable("caller_id_name")
		rec.caller_id_number   = session:getVariable("caller_id_number")
		rec.callee_id_name     = session:getVariable("callee_id_name")
		rec.callee_id_number   = session:getVariable("callee_id_number")
		rec.ani                = session:getVariable("ani")
		rec.aniii              = session:getVariable("aniii")
		rec.network_addr       = session:getVariable("network_addr")
		rec.rdnis              = session:getVariable("rdnis")
		rec.destination_number = dest
		rec.uuid               = session:getVariable("uuid")
		rec.source             = session:getVariable("source")
		rec.context            = session:getVariable("context")
		rec.chan_name          = session:getVariable("channel_name")

		xdb.create("conference_cdr_members", rec)
	end
end
