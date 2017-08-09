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
    n, devices = xdb.find_all("devices")

    if n > 0 then
        return devices
    else
        return "[]"
    end
end)

get('/:id', function(params)
	device = xdb.find("devices", params.id)
	if device then
		return device
	else
		return 404
	end
end)

get('/:id/members', function(params)
	n, user_devices = xdb.find_by_cond("user_devices", {device_id = params.id})
	n, users = xdb.find_all("users")
	members = {}

	for i, v in ipairs(users)
	do
		for j, x in ipairs(user_devices)
		do
			if x.user_id == v.id then
				members[j] = v
			end
		end
	end

	if user_devices then
		return members
	else
		return "{}"
	end
end)

get('/:id/remain_members', function(params)
	sql = "SELECT * from users WHERE id NOT IN (SELECT user_id from user_devices WHERE user_id is not null AND device_id = '" .. params.id .. "');"
	n, members = xdb.find_by_sql(sql)
	if n > 0 then
		return members
	else
		return '[]'
	end
end)

put('/:id', function(params)
	print(serialize(params))
	ret = xdb.update("devices", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

post('/', function(params)
	print(serialize(params))

	ret = xdb.create_return_id('devices', params.request)

	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

post('/members', function(params)
	local members = params.request

	for k, v in pairs(members) do
		if type(v) == "table" then
			xdb.create('user_devices', v)
		end
	end
	return "{}"
end)

delete('/:id', function(params)
	ret = xdb.delete("devices", params.id);

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)


delete('/members/:device_id', function(params)
	ret = xdb.delete("user_devices", {device_id = params.device_id});

	if ret >= 0 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)


delete('/member/:id/:device_id', function(params)
	ret = xdb.delete("user_devices", {device_id = params.id, user_id = params.device_id});
	print('12345678', ret)

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)
