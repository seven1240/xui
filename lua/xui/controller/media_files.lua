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
require 'xdb'
xdb.bind(xtra.dbh)

get('/', function(params)
	local client = env:getHeader("client")
	local uuid = env:getHeader("uuid")

	if client == "BLOCKLY" then
		n, mfiles = xdb.find_by_cond("media_files", "type IN ('RECORD', 'UPLOAD', 'BLOCKLY')", "id", nil, 100)
	else
		if uuid then
			n, mfiles = xdb.find_by_cond("media_files", {channel_uuid = uuid}, "id DESC", nil, 100)
		else
			n, mfiles = xdb.find_all("media_files", "id DESC", nil, 5000) -- todo fix hardcoded limit
		end
	end

	if (n > 0) then
		return mfiles
	else
		return "[]"
	end
end)

get('/:id', function(params)
	mfile = xdb.find("media_files", params.id)
	if mfile then
		return mfile
	else
		return 404
	end
end)

put('/:id', function(params)
	print(serialize(params))
	ret = xdb.update("media_files", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

post('/', function(params)
	print(serialize(params))

	mfile = xdb.create_return_id('media_files', params.request)

	if mfile then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

delete('/:id', function(params)
	local sql = "SELECT abs_path from media_files where id = " .. params.id
	xdb.find_by_sql(sql, function(row)
		os.remove(row.abs_path)
		freeswitch.consoleLog('err',row.abs_path)
	end)
	ret = xdb.delete("media_files", params.id)
	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)
