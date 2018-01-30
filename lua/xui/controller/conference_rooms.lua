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

function extract_ip(host)
	local c = string.find(host, ":")

	if (c) then
		return host:sub(1, c - 1)
	end

	return host
end

require 'xdb'
require 'm_conference_profile'
require 'm_user'
xdb.bind(xtra.dbh)

get('/', function(params)
	n, rooms = xdb.find_all("conference_rooms")

	if m_user.has_permission() then
		n, rooms = xdb.find_all("conference_rooms")
	else
		-- n, rooms = xdb.find_by_cond("conference_rooms", {user_id = xtra.session.user_id}, 'id')
		n, rooms = xdb.find_by_sql("SELECT * FROM conference_rooms WHERE realm = (SELECT domain FROM users WHERE id = " .. xtra.session.user_id .. ")")
	end

	if (n > 0) then
		for i,v in pairs(rooms) do
			if v.cluster then -- turn JSON string to a JSON Object
				rooms[i].cluster = utils.json_decode(v.cluster)
			end
		end

		return rooms
	else
		return "[]"
	end
end)

get('/:id', function(params)
	room = xdb.find("conference_rooms", params.id)
	if room then
		if room.cluster then -- turn JSON string to a JSON Object
			room.cluster = utils.json_decode(room.cluster)
		end

		if room.banner and room.banner ~= '' then
			room.banner = utils.json_decode(room.banner)
		else
			room.banner = {
				fgColor = '#FFFFFF',
				bgColor = '#000000',
				fontFace='/usr/local/freeswitch/fonts/SimHei.ttf',
				fontScale = '2',
				text = ''
			}
		end
		return room
	else
		return 404
	end
end)

get('/:id/params', function(params)
	n, conference_params = m_conference_profile.params_font(params.id)

	if n > 0 then
		return conference_params
	else
		return "[]"
	end
end)

get('/:id/member_groups', function(params)

	n,members = xdb.find_by_sql("SELECT * FROM groups" ..
		" WHERE exists (SELECT group_id FROM conference_members " ..
		"   WHERE group_id = groups.id AND" ..
		"   room_id = " .. xdb.escape(params.id) ..
		")")

	if n > 0 then
		return members
	else
		return '[]'
	end
end)

get('/:id/members', function(params)
	local api = freeswitch.API()
	local local_ip_v4 = api:execute("global_getvar", "local_ip_v4")

	n,members = xdb.find_by_sql("SELECT cm.*, g.name AS group_name " .. 
		" FROM conference_members cm LEFT JOIN groups g " ..
		" ON cm.group_id = g.id WHERE cm.room_id = " .. params.id ..
		" ORDER BY group_id asc, sort asc;")
	room = xdb.find("conference_rooms", params.id)

	if room and room.cluster and room.cluster:sub(1,1) == "[" then -- turn JSON string to a JSON Object
		cluster = utils.json_decode(room.cluster)
		for k, node in pairs(cluster) do
			local host = extract_ip(node.host)
			if host ~= local_ip_v4 then
				table.insert(members, {id = 0 - n, name = host, description = "Node", num = host, route = 'None'})
				n = n + 1
			end
		end
	end

	if n > 0 then
		return members
	else
		return '[]'
	end
end)

get('/:id/members/:group_id/max', function(params)
	print("3366", serialize(params))
	 n, max = xdb.find_by_sql("SELECT sort FROM conference_members WHERE group_id= " .. params.group_id .. " ORDER BY sort DESC LIMIT 1;")

	 if max then
	 	return max
	 else
	 	return 0
	 end
end)


get('/:id/remain_members/:group_id', function(params)
	sql = "SELECT ug.id, ug.user_id, ug.group_id, u.name, u.extn, u.domain".. 
	" FROM user_groups ug LEFT JOIN users u ON ug.user_id = u.id "..
	" WHERE ug.group_id = " .. params.group_id .." AND user_id NOT IN "..
	" (SELECT user_id FROM conference_members WHERE user_id is not null AND room_id = " .. params.id .. ");"
	n, users = xdb.find_by_sql(sql)
	if n > 0 then
		return users
	else
		return '[]'
	end
end)

get('/select/users', function(params)
	n, users = xdb.find_by_sql("SELECT id, extn, name FROM users WHERE type = 'CONFMAN' ORDER BY extn")

	if n > 0 then
		return users
	else
		return '[]'
	end
end)

post('/', function(params)
	ret = xdb.create_return_id('conference_rooms', params.request)

	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

post('/:id/members', function(params)
	local members = params.request
	if members[1] then 
		g_id = members[1].group_id
	else
		g_id = -1
	end

	n, max = xdb.find_by_sql("SELECT sort FROM conference_members WHERE group_id = " .. g_id .. " ORDER BY sort DESC LIMIT 1;")

	if n == 0 then
		max = 0
	else
		max = max[1].sort		
	end

	if members[1] then
		for k, v in pairs(members) do
			if type(v) == "table" then
				v.sort = max + k
				ret = xdb.create('conference_members', v)
			end
		end
	else
		members.group_id = g_id
		members.sort = max + 1
		ret = xdb.create('conference_members', members)
	end
	return "{}"
end)

post('/:ref_id/params/', function(params)
	params.request.ref_id = params.ref_id
	params.realm = 'conference'
	params.request.realm = params.realm
	ret = m_conference_profile.createParam(params.request)
	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

put('/:id', function(params)
	print(serialize(params))
	params.request.id = params.id

	local cluster = params.request.cluster

	if cluster then
		params.request.cluster = utils.json_encode(cluster);
	end

	if params.request.user_id == "" then
		params.request.user_id = nil
	end

	ret = xdb.update("conference_rooms", params.request)
	if ret == 1 then
		return 200, "{}"
	else
		return 500
	end
end)

put('/:id/members/:member_id', function(params)
	ret = xdb.update_by_cond("conference_members", {id = params.member_id, room_id = params.id}, params.request)

	if ret == 1 then
		return 200, "{}"
	else
		return 500
	end
end)

put('/:id/params/:param_id', function(params)
	print(serialize(params))
	ret = nil;

	if params.request.action and params.request.action == "toggle" then
		ret = m_conference_profile.toggle_param(params.id, params.param_id)
	else
		ret = m_conference_profile.update_param(params.id, params.param_id, params.request)
	end

	if ret then
		return ret
	else
		return 404
	end
end)

put('/drag/:start_id/:end_id', function(params)
	dragstart = {}
	dragend = {}
	n, group_id = xdb.find_by_sql("SELECT group_id FROM conference_members WHERE id = " .. params.start_id);
	n, start_sort = xdb.find_by_sql("SELECT sort FROM conference_members WHERE id = " .. params.start_id);
	m, end_sort = xdb.find_by_sql("SELECT sort FROM conference_members WHERE id = " .. params.end_id);

	dragstart = { id = params.start_id, sort = start_sort[1].sort, group_id = group_id[1].group_id }
	dragend = {id = params.end_id, sort = end_sort[1].sort, group_id = group_id[1].group_id }

	if tonumber(dragstart.sort) < tonumber(dragend.sort) then
		where = 'group_id =' .. dragstart.group_id .. ' AND sort < ' .. dragend.sort + 1 .. ' AND sort > ' .. dragstart.sort
		set = 'sort = sort - 1'
		num = tonumber(dragend.sort) - tonumber(dragstart.sort)
	else
		where = 'group_id =' .. dragstart.group_id .. ' AND sort < ' .. dragstart.sort .. ' AND sort > ' .. dragend.sort - 1
		set = 'sort = sort + 1'
		num = tonumber(dragstart.sort) - tonumber(dragend.sort)
	end

	ret = xdb.update_by_cond('conference_members', where, set)
	ret2 = xdb.update("conference_members", {id = dragstart.id, sort = dragend.sort})
	if ret == num and ret2 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

delete('/:id', function(params)
	ret = xdb.delete("conference_rooms", params.id);

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

delete('/:id/members/:member_id', function(params)
	n, value = xdb.find_by_sql("SELECT sort, group_id FROM conference_members WHERE id = " .. params.member_id)
	m, ret2 = xdb.update_by_cond("conference_members", "group_id = " .. value[1].group_id .. " AND sort > " .. value[1].sort, "sort = sort - 1")
	ret = xdb.delete("conference_members", {id = params.member_id})
	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

delete('/:id/param', function(params)
	id = params.id
	param_id = params.param_id
	ret = m_conference_profile.delete_param(id, param_id)
	
	if ret >= 0 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)
