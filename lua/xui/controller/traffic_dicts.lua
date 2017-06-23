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

require 'multipart_parser'
require 'xdb'
require 'utils'

content_type("application/json")
xdb.bind(xtra.dbh)

post('/', function(params)
	print(env:serialize())
	local api = freeswitch.API()
	local ctype = utils.url_decode(env:getHeader("Content-Type"))
	local content_length = tonumber(env:getHeader("Content-Length"))

	print("ctype: "..ctype.." content_length: "..content_length.."\n");

	local max_body_size = 100 * 1024 * 1024

	if content_length == 0 or content_length > max_body_size then
		print("Max body size " .. max_body_size)
		return 413, {error = "Max body size " .. max_body_size}
	end

	local multipart = string.find(ctype, "multipart")
	local size = tonumber(content_length)
	local filename
	local file
	local received = 0
	local files = {}
	local boundary
	local parser
	local uploaded_files = {}
	local found = 0
	local times = 10

	-- print(multipart)

	expect = env:getHeader("expect")

	if expect and expect:match("100%-continue") then
		-- response_100_continue()
		print("run");
		stream:write("HTTP/1.1 100 Continue\r\n")
		-- stream:write("X-IM-FileID: " .. filename .. "\r\n\r\n")
	end

	boundary=string.gsub(ctype, "^.*boundary=([^;]+).*$", "%1")
	print("boundary: " .. boundary)

	if (not multipart) then
		filename = utils.tmpname('upload-')
		file = assert(io.open(filename, "w"))
	end

	while received < size do
		local x = stream_read()
		local len = x:len()
		received = received + len

		print("received= " .. len .. " total= " .. received .. " size= " .. size)
		
		if not parser then parser = multipart_parser(boundary) end

		if multipart then
			ret = parser:parse(x)
		else
			file:write(x)
		end

		if (len == 0) then
			times = times + 1
			os.execute("sleep " .. 1)
		else
			times = 0
		end

		if ((len == 0 and times > 10) or received == size) then -- read eof
			print("EOF")

			if parser and parser.parts then
				xdb.bind(xtra.dbh)
				utils.print_r(parser.parts)
				for k, v in pairs(parser.parts) do
					local record = {}
					record.name = v.filename
					record.ext = v.ext
					record.original_file_name = v.filename
					record.mime = v.content_type
					record.type = 'TRAFFICDICT'
					record.description = 'TRAFFICDICT'
					record.abs_path = v.abs_filename
					record.dir_path = config.upload_path
					record.rel_path = string.sub(record.abs_path, string.len(record.dir_path) + 2)
					record.file_size = "" .. v.file_size .. ""

					local media_file = xdb.create_return_object('media_files', record)

					if media_file then
						table.insert(uploaded_files, media_file)
					end
				end
			end

			if (not multipart) then
				local record = {}
				record.mime = ctype
				record.description = boundary
				record.abs_path = filename
				record.dir_path = config.upload_path
				record.rel_path = string.sub(record.abs_path, string.len(record.dir_path) + 2)
				record.file_size = "" .. size .. ""
				record.channel_uuid = env:getHeader("Core-UUID")
				record.created_epoch = "" .. os.time() .. ""
				record.updated_epoch = record.created_epoch

				table.insert(files, record)

				local media_file = xdb.create_return_object('media_files', record)

				if media_file then
					table.insert(uploaded_files, media_file)
				end
			end

			break
		end
		-- freeswitch.msleep(1000) -- emulate slow network upload
	end

	if file then file:close() end

	if found then
		return uploaded_files
	else
		return "[]"
	end
end)

get('/', function(params)
	n, mfiles = xdb.find_by_cond("media_files", {type = 'TRAFFICDICT'})

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
