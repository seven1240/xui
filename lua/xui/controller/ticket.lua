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
 * wechat tokent and ticket
 */
]]

content_type("application/json")

require 'xwechat'

get('/token', function(params)
	grant_type = env:getHeader('grant_type')
	appid = env:getHeader('appid')
	secret = env:getHeader('secret')
	realm = env:getHeader('realm') or 'xyt'

	if config.wechat[realm] and
		config.wechat[realm]['APPID'] == appid and
		config.wechat[realm]['APPSEC'] == secret then

		api = freeswitch.API()
		ret = api:execute("hash", "select/wechat/wechat_access_token_json_" .. realm)

		if ret == '' then
			freeswitch.consoleLog('NOTICE', 'access_token not found in local catch, trying upstream ...')
			xwechat.get_token(realm, appid, secret)
			ret = api:execute("hash", "select/wechat/wechat_access_token_json_" .. realm)
		end

		return ret
	end

	return 404
end)

get('/getticket', function(params)
	local type = env:getHeader('type')
	access_token = env:getHeader('access_token')
	realm = env:getHeader('realm') or 'xyt'

	api = freeswitch.API()
	token = api:execute("hash", "select/wechat/wechat_access_token_" .. realm)

	if token == access_token then
		ret = api:execute("hash", "select/wechat/wechat_js_ticket_json_" .. realm)

		if ret == '' then
			freeswitch.consoleLog('NOTICE', 'js_ticket not found in local catch, trying upstream ...')
			xwechat.get_js_ticket(realm)
			ret = api:execute("hash", "select/wechat/wechat_js_ticket_json_" .. realm)
		end

		return ret
	end

	return 404
end)
