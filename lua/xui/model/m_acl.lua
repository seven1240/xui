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

require 'xdb'
xdb.bind(xtra.dbh)

m_acl = {}

function create(kvp)
	template = kvp.template
	kvp.template = nil

	id = xdb.create_return_id("acls", kvp)
	freeswitch.consoleLog('err',id)
	-- print(id)
	if id then
		local realm = 'acl'
		local ref_id = 0
		if not (template == "default") then
			realm = 'acl' -- the table name
			ref_id = template
		end

		local sql = "INSERT INTO params (realm, k, v, ref_id, disabled) SELECT 'acl', k, v, " ..
			id .. ", disabled From params" ..
			xdb.cond({realm = realm, ref_id = ref_id})

		xdb.execute(sql)
	end
	return id
end

function createParam(kvp)
	id = xdb.create_return_id("acl_nodes", kvp)
	return id
end

function params(acl_id)
	rows = {}
	sql = "SELECT * from acl_nodes WHERE acl_id = " .. acl_id
	print(sql)
	xdb.find_by_sql(sql, function(row)
		table.insert(rows, row)
	end)
	-- print(serialize(rows))
	return rows
end

function toggle_param(rt_id, param_id)
	sql = "UPDATE acl_nodes SET " ..
		xdb.cond({acl_id = rt_id, id = param_id})
	print(sql)
	xdb.execute(sql)
	if xdb.affected_rows() == 1 then
		return xdb.find("acl_nodes", param_id)
	end
	return nil
end

function update_param(rt_id, param_id, kvp)
	xdb.update_by_cond("acl_nodes", {acl_id = rt_id, id = param_id}, kvp)
	if xdb.affected_rows() == 1 then
		return xdb.find("acl_nodes", param_id)
	end
	return nil;
end

m_acl.delete = function(rt_id)
	xdb.delete("acls", rt_id);
	local sql = "DELETE FROM acl_nodes " .. xdb.cond({acl_id = rt_id})
	xdb.execute(sql)
	return xdb.affected_rows()
end

m_acl.delete_node = function(id, node_id)
	local sql = "DELETE FROM acl_nodes WHERE acl_id = " .. id .. " AND id = " .. node_id
	xdb.execute(sql)
	return xdb.affected_rows()
end

m_acl.create = create
m_acl.params = params
m_acl.toggle_param = toggle_param
m_acl.update_param = update_param
m_acl.createParam = createParam

return m_acl
