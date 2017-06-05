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
 * Internal functions
 */
]]

require 'xdb'
require 'utils'
require 'xtra_config'
xdb.bind(xtra.dbh)


post('/test', function(params)
	-- send response to finish the request at the client side and keep doing heavy jobs
	xtra.response("OK")

	limit = params.limit or 2

	xdb.find_by_cond("media_files", {mime = 'audio/wave', processing_flag = 0}, "id", function(row)
		freeswitch.consoleLog('ERR', row.id .. '\n')

		wav = row.abs_path
		mp3 = wav:gsub(".wav$", ".mp3")

		freeswitch.consoleLog('ERR', 'converting ' .. wav .. ' to ' .. mp3 .. '\n')

		local cmd = "lame --quiet " .. wav .. " " .. mp3
		freeswitch.consoleLog('INFO', cmd .. '\n')

		-- local ret = os.execute(cmd)

		api = freeswitch.API()
		ret = api:execute('system', cmd)
		-- freeswitch.consoleLog('INFO', ret .. '\n')

		if ret then
			freeswitch.consoleLog('INFO', 'convertion done: ' .. mp3 .. '\n')
			xdb.update("media_files", {id = row.id, processing_flag = '1'})
			row.id = nil
			row.created_at = nil
			row.updated_at = nil
			row.mime = 'audio/mp3'
			row.ext = 'mp3'
			-- row.size =
			xdb.create("media_files", row)
		else
			freeswitch.consoleLog('ERR', 'convertion Error ' .. mp3 .. '\n')
		end

	end, limit)

	-- nothing to do
	return nil
end)
