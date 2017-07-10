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
api = freeswitch.API()

function tts_token_request()
	local ret = api:execute("tts_token", "")

	if ret and string.find(ret, "OK") then
		return string.gsub(ret, "+OK ", "")
	else
		n, dicts = xdb.find_by_cond("dicts", {realm = 'BAIDU'})
		local obj = {}

		if (n > 0) then
			for key, val in pairs(dicts) do
				obj[val.k] = val.v
			end
		end

		local url = "https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&" ..
			"&client_id=" .. obj.APPKEY ..
			"&client_secret=" .. obj.SECKEY

		print(url)

		ret = api:execute("curl", url .. " timeout 3")
		print(ret)

		local response = utils.json_decode(ret)

		utils.print_r(response)
		return response.access_token
	end
end

put("/acckey", function(params)
	local dict = {}

	local access_token = tts_token_request()
	dict.v = access_token

	print(serialize(dict))

	ret = xdb.update_by_cond("dicts", {realm = 'BAIDU', k = 'ACCTOKEN'}, dict)

	if ret == 1 then
		dict.k = "ACCTOKEN"
		return dict
	else
		return 500
	end
end)

post("/tts", function(params)
	print(serialize(params))
	local access_token = tts_token_request()
	local url = "http://tsn.baidu.com/text2audio?tex=" .. params.request.input ..
				"&lan=" .. "zh" ..
				"&cuid=" .. "78-0C-B8-C7-52-F9" ..
				"&ctp=" .. "1" ..
				"&tok=" .. access_token
	local filename = utils.tmpname('tts-')

	os.execute("curl -q '" .. url .. "'> "..filename..".mp3")

	local f = assert(io.open(filename..".mp3"),"rb")
	local size = assert(f:seek("end"))
	local record = {}
	record.name = params.request.input
	record.mime = "audio/mp3"
	record.abs_path = filename..".mp3"
	record.file_size = "" .. size        
	record.description = 'TTS'
	record.dir_path = config.upload_path
	record.channel_uuid = env:getHeader("Core-UUID")
	record.created_epoch = "" .. os.time()

	local media_file = xdb.create_return_object('media_files', record)
	return media_file
end)
