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

function build_members(fifo)
	member = ""
	xdb.find_by_cond("fifo_members", {fifo_id = fifo.id}, id, function(row)
		fifo_record_template = ''
		if fifo.auto_record == '1' then
			if not (fifo.record_template == "") then
				fifo_record_template = fifo.record_template
			else
				fifo_record_template = [[fifo_record_template=$${base_dir}/storage/recordings/]] .. "fifo-record-" .. '${strftime(%Y%m%d-%H%M%S)}' .. "-" .. '${create_uuid()}' .. '.mp3,'
			end
		end

		dial_string = fifo_record_template .. [[fifo_member_wait=nowait]]

		if row.dial_string == "" then
			dial_string = '{' .. dial_string .. "}user/" .. row.extn .. "@$${domain}"
		else
			dial_string = '{' .. dial_string .. "}" .. row.dial_string
		end

		member = member .. [[<member timeout="]] .. row.timeout .. [[" simo="]] ..
			row.simo .. [[" lag="]] .. row.lag .. [[">]] .. dial_string .. [[</member>]] .. "\n"
	end)
	return member
end

function build_fifos()
	local fifos = ""

	xdb.find_all("fifos", 'id', function(row)
		fifos = fifos .. '<fifo name="' .. row.name ..
			'" importance="' .. row.importance ..
			'" outbound_per_cycle="' .. row.outbound_per_cycle ..
			'" outbound_per_cycle_min="' .. row.outbound_per_cycle_min ..
			'" outbound_name="' .. row.outbound_name ..
			'" outbound_strategy="' .. row.outbound_strategy ..
			'" outbound_priority="' .. row.outbound_priority ..
			'">' ..
			build_members(row) .. '</fifo>\n'
	end)

	return fifos
end


fifo_params = ""

xdb.find_by_cond("dicts", {realm = 'FIFO'}, nil, function(row)
	fifo_params = fifo_params .. [[<param name="]] .. row.k .. [[" value="]] .. row.v .. [["/>]] .. "\n"
end)


XML_STRING=[[
<configuration name="fifo.conf" description="FIFO Configuration">
<settings>]] ..
	fifo_params ..
[[</settings>
<fifos> ]] ..
	build_fifos() ..
	[[</fifos>
</configuration>
]]
