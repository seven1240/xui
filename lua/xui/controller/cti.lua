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

xtra.ignore_login('/')
xtra.ignore_login('/start')

xtra.start_session()
xtra.require_login()

content_type("application/json")
require 'xdb'
require 'utils'
xdb.bind(xtra.dbh)

-- 1.1
post('/', function(params)
	login = 'cti'
	pass = params.request.password

	local user = xdb.find_one("users", {extn = login, password = pass})

	if user then
		xtra.save_session("user_id", user.id)
		return 200, {code = 200, session_id = xtra.session_uuid}
	else
		return 403
	end
end)

-- 1.2
get('/', function(params)
	return {code = 200, running = true}
end)

-- 1.3
put('/start', function(params)
	login = 'cti'
	pass = params.request.password

	if pass == 'cti' then
		return 200, {code = 200, session_id = xtra.session_uuid}
	else
		return 403
	end
end)

put('/stop', function(params)
	return 200, {code = 200, text = "OK"}
end)

put('/restart', function(params)
	return 200, {code = 200, text = "OK"}
end)

get('/version', function(params)
	return {code = 200, version = '1.0.1'}
end)

get('/agentState/:agent', function(params)
	local api = freeswitch.API()
	json = {command = "callcenter_config", data = {arguments = "agent list"}}
	args = utils.json_encode(json)
	ret = api:execute("json", args)
	json = utils.json_decode(ret)
	print(ret)

	if json.status == "success" then
		return json.response
	else
		return 500
	end
end)

get('/calls', function(params)
	return "[]"
end)

