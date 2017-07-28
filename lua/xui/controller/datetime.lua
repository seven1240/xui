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
 * Liyang <liyang@x-y-t.cn>
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

get('/', function(params)
	print(serialize(params))
	local t = io.popen('date "+%Y-%m-%d %H:%M:%S"')
	local a = t:read("*all")
	io.close(t)
	print(a)
	return {datetime = a}
end)

put('/manual_sync', function(params)
	print(serialize(params))
	--local t = io.popen('sudo date -s ' .. params.request.datetime)
	local a = t:read("*all")
	io.close(t)
	print(a)
	t = io.popen('sudo clock -w')
	a = t:read("*all")
	io.close(t)
	print(a)
	api:execute("fsctl", "sync_clock")
	t = io.popen('date "+%Y-%m-%d %H:%M:%S"')
	a = t:read("*all")
	io.close(t)
	print(a)
	return 200, {datetime = a}
end)

put('/ntp_sync', function(params)
	print(serialize(params))
	local t = io.popen('sudo ntpdate ' .. params.request.ntp_server)
	local a = t:read("*all")
	io.close(t)
	print(a)
	api:execute("fsctl", "sync_clock")
	t = io.popen('date "+%Y-%m-%d %H:%M:%S"')
	a = t:read("*all")
	io.close(t)
	print(a)
	return 200, {datetime = a}
end)
