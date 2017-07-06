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
require 'xwechat'
require 'm_dict'
require 'xtra_config'
xdb.bind(xtra.dbh)

get('/:id', function(params)
	n, img_urls = xdb.find_by_sql([[SELECT img_url
	FROM wechat_upload WHERE comment_id =
	(SELECT comment_id
	FROM wechat_upload
	]] .. xdb.cond({img_url = params.id}) .. [[
	)
	]])
	if (n > 0) then
		return {base_url = config.wechat_base_url, img_urls = img_urls}
	else
		return "[]"
	end
end)

get('/base_url', function(params)
	return config.wechat_base_url
end)

post('/:realm/:id/comments', function(params)
	local upload = {}
	upload.user_id = xtra.session.user_id
	upload.comment_id = params.id

	serverIds = params.request.serverIds

	wechat = m_dict.get_obj('WECHAT/' .. params.realm)
	xwechat.get_token(params.realm, wechat.APPID, wechat.APPSEC)

	for i,v in pairs(serverIds) do
		url = xwechat.download_image_url(params.realm, v)
		prefix = "wechat-js-upload-"
		rel_path = prefix .. os.date('%Y%m%d%H%M%S-') .. v .. ".jpg"
		thumb_rel_path = "thumb-" .. rel_path
		local_path = config.upload_path .. "/" .. rel_path
		thumb_path = config.upload_path .. "/" .. thumb_rel_path

		wget = "wget -O " .. local_path .. " '" .. url .. "'"
		os.execute(wget)

		convert = "convert -resize 64x64! " .. local_path .. " " .. thumb_path
		-- freeswitch.consoleLog("ERR",convert)
		os.execute(convert)

		local f = io.open(local_path, "rb")

		if f then
			local size = assert(f:seek("end"))

			local rec = {}

			rec.name = v
			rec.mime = "image/jpeg"
			rec.ext = "jpg"

			rec.abs_path = local_path
			rec.file_size = "" .. size
			rec.type = "WECHAT"
			rec.description = "WECHAT"
			rec.dir_path = config.upload_path
			-- rec.channel_uuid = uuid
			rec.original_file_name = rec.name
			rec.rel_path = rel_path
			rec.thumb_path = thumb_rel_path

			media_file_id = xdb.create_return_id('media_files', rec)

			if media_file_id then
				local link = {}
				link.comment_id = params.id
				link.media_file_id = media_file_id

				xdb.create('ticket_comment_media', link)
			end
		end
	end
	return {}
end)
