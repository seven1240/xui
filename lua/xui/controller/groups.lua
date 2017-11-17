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

function build_group_options_tree(groups, options_tab)
	if (next(groups) ~= nil) then
		for k, v in pairs(groups) do
			if type(v) == "table" then
				local spaces = ""
				child_groups = {}
				option_tab = {}

				if (tonumber(v.level) ~= 0 ) then
					spaces = string.rep("  ", tonumber(v.level) *2) .. "|" .. "---"
				end

				option_tab["name"] = spaces .. v.name
				option_tab["value"] = v.id

				table.insert(options_tab, option_tab)
				n, child_groups = xdb.find_by_cond("groups", {group_id = v.id})
				build_group_options_tree(child_groups, options_tab)
			end
		end
	end
end

function build_group_options_tree_t(groups, options_tab, id)
	if (next(groups) ~= nil) then
		for k, v in pairs(groups) do
			if type(v) == "table" then
				local spaces = ""
				child_groups = {}
				option_tab = {}

				if (tonumber(v.level) ~= 0 ) then
					spaces = string.rep("  ", tonumber(v.level) *2) .. "|" .. "---"
				end

				option_tab["name"] = spaces .. v.name
				option_tab["value"] = v.id

				table.insert(options_tab, option_tab)
				n, child_groups = xdb.find_by_cond("groups", "group_id = " .. v.id .. " AND id <> " .. id)
				build_group_options_tree_t(child_groups, options_tab, id)
			end
		end
	end
end

function build_group_tree(groups, groups_tab)
	if (next(groups) ~= nil) then
		for k, v in pairs(groups) do
			if type(v) == "table" then
				local spaces = ""
				child_groups = {}

				if (tonumber(v.level) ~= 0 ) then
					spaces = string.rep("  ", tonumber(v.level) *2) .. "|" .. "---"
				end

				v["spaces"] = spaces

				table.insert(groups_tab, v)
				n, child_groups = xdb.find_by_cond("groups", {group_id = v.id})
				build_group_tree(child_groups, groups_tab)
			end
		end
	end
end

get('/', function(params)
	n, groups = xdb.find_all("groups")

	if (n > 0) then
		return groups
	else
		return "[]"
	end
end)

get('/build_group_tree', function(params)
	parent_groups = {}
	groups_tab  = {}
	n, parent_groups = xdb.find_by_cond("groups", "group_id IS NULL", "sort")

	if n > 0 then
		build_group_tree(parent_groups, groups_tab)
	else
		return "[]"
	end

	return groups_tab
end)

get('/build_group_options_tree', function(params)
	parent_groups = {}
	options_tab  = {}
	n, parent_groups = xdb.find_by_cond("groups", "group_id IS NULL")

	if n > 0 then
		build_group_options_tree(parent_groups, options_tab)
	else
		return "[]"
	end

	return options_tab
end)

get('/build_group_options_tree/:id', function(params)
	parent_groups = {}
	n, parent_groups = xdb.find_by_cond("groups", "group_id IS NULL AND id <> " .. params.id)
	options_tab  = {}

	build_group_options_tree_t(parent_groups, options_tab, params.id)

	return options_tab
end)

get('/:id/remain_members', function(params)
	sql = " SELECT * from users WHERE id NOT IN (SELECT user_id from user_groups WHERE user_id is not null AND group_id = " .. params.id .. ");"
	n, members = xdb.find_by_sql(sql)
	if n > 0 then
		return members
	else
		return '[]'
	end
end)

get('/:id/members', function(params)
	sql = "SELECT ug.id, ug.user_id, ug.group_id, ug.sort, u.name, u.extn, u.domain from user_groups ug LEFT JOIN users u ON ug.user_id = u.id WHERE ug.group_id = " .. params.id .. " ORDER BY sort"
	n, members = xdb.find_by_sql(sql)
	if n > 0 then
		return members
	else
		return '[]'
	end
end)

get('/group_users', function(params)
	group_users = {}
	ungrouped_users = {}
	grouped_users = {}
	sql1 = 'SELECT id AS "userID", name AS "userName", extn AS "userExten", domain AS "userDomain", \'ungrouped\' AS "groupID" FROM users ' ..
		' WHERE id NOT IN (SELECT user_id FROM user_groups)'
	sql2 = 'SELECT u.id as "userID", u.name AS "userName", u.extn AS "userExten", domain AS "userDomain", g.id AS "groupID", g.name AS "groupName" ' ..
		' FROM users u JOIN user_groups ug ON u.id = ug.user_id JOIN groups g ON ug.group_id = g.id ' ..
		' ORDER BY g.id'

	n1, ungrouped_users = xdb.find_by_sql(sql1)
	n2, grouped_users = xdb.find_by_sql(sql2)
	group_users = ungrouped_users

	if n2 > 0 then
		for k, v in ipairs(grouped_users) do
			table.insert(group_users, v)
		end
	end

	return group_users
end)

get('/:id', function(params)
	group = xdb.find("groups", params.id)
	if group then
		if group.group_id and tonumber(group.group_id) then
			pgroup = xdb.find("groups", group.group_id)
			group.parent_name = pgroup.name
		end
		return group
	else
		return 404
	end
end)

put('/:id', function(params)
	print(serialize(params))
	ret = xdb.update("groups", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

put('/:id/members', function(params)
	print(serialize(params))

	ret = xdb.update("groups", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

put('/drag/:start_id/:end_id', function(params)
	dragstart = {}
	dragend = {}
	n, group_id = xdb.find_by_sql("SELECT group_id FROM user_groups WHERE id = " .. params.start_id);
	n, start_sort = xdb.find_by_sql("SELECT sort FROM user_groups WHERE id = " .. params.start_id);
	m, end_sort = xdb.find_by_sql("SELECT sort FROM user_groups WHERE id = " .. params.end_id);

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

	ret = xdb.update_by_cond('user_groups', where, set)
	ret2 = xdb.update("user_groups", {id = dragstart.id, sort = dragend.sort})
	if ret == num and ret2 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

post('/', function(params)
	-- print(serialize(params))

	local group = params.request

	if group.group_id == "" then
		group.group_id = nil
	else
		n, level = xdb.find_by_sql("SELECT level FROM groups WHERE id = " .. group.group_id)
		n, sort = xdb.find_by_sql("SELECT sort FROM groups WHERE group_id = " .. group.group_id .. " ORDER BY sort DESC LIMIT 1;")
		group.level = tonumber(level[1].level) + 1
		if next(sort) == nil then
			group.sort = 1
		else 
			group.sort = tonumber(sort[1].sort + 1)
		end
	end

	ret = xdb.create_return_id('groups', group)

	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

post('/members', function(params)
	local members = params.request
	n, max = xdb.find_by_sql("SELECT sort FROM user_groups WHERE group_id = " .. members[1].group_id .. " ORDER BY sort DESC LIMIT 1;")

	if n == 0 then
		max = 0
	else
		max = max[1].sort		
	end

	for k, v in pairs(members) do
		if type(v) == "table" then
			v.sort = max + k
			xdb.create('user_groups', v)
		end
	end

	return "{}"
end)

post('/:id/member', function(params)
	print(serialize(params))
	local member = params.request
	member.group_id = params.id
	ret = xdb.create_return_id('user_groups', member)

	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

delete('/members/:group_id', function(params)
	ret = xdb.delete("user_groups", {group_id=params.group_id});
	if ret >= 0 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

delete('/members/:group_id/:member_id', function(params)
	ret = xdb.delete("user_groups", {group_id=params.group_id, user_id=params.member_id});
	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)


delete('/:id', function(params)
	n, child_groups = xdb.find_by_cond("groups", {group_id = params.id})

	if (n > 0) then
		return 400, "{group is being deleted has " .. n .. " children}"
	else
		ret = xdb.delete("groups", params.id);
		if ret == 1 then
			return 200, "{}"
		else
			return 500, "{}"
		end
	end

end)
