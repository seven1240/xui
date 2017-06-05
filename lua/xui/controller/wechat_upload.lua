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
	FROM wechat_upload where comment_id = 
	(SELECT comment_id
	FROM wechat_upload
	WHERE img_url = ']]..params.id..[[')
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
	upload.type = 1
	wechat = m_dict.get_obj('WECHAT/' .. params.realm)
	xwechat.get_token(params.realm, wechat.APPID, wechat.APPSEC)
	for i,v in pairs(serverIds) do
		url = xwechat.down_load_image(params.realm, v)
		upload.img_url = v
		local ret = xdb.create_return_id('wechat_upload',upload)
		if ret then
			wget = "wget -O /usr/local/freeswitch/xui/www/assets/img/wechat/big/" .. v .. ".jpg '" .. url .. "'"
			os.execute(wget)
			convert = "convert -sample 20%x20% /usr/local/freeswitch/xui/www/assets/img/wechat/big/" .. v .. ".jpg /usr/local/freeswitch/xui/www/assets/img/wechat/small/" .. v .. ".jpg"
			os.execute(convert)
		end
	end
	return {}
end)
