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

m_distributor = {}

function create(kvp)

	id = xdb.create_return_id("distributors", kvp)
	freeswitch.consoleLog('err',id)
	-- print(id)
	if id then
		local realm = 'distributors'
		local ref_id = 0
		local sql = "INSERT INTO params (realm, k, v, ref_id, disabled) SELECT 'distributors', k, v, " ..
			id .. ", disabled From params" ..
			xdb.cond({realm = realm, ref_id = ref_id})

		xdb.execute(sql)
	end
	return id
end

function createParam(kvp)
	id = xdb.create_return_id("distributor_nodes", kvp)
	-- print(id)
	if id then
		local distributor_id = kvp.distributor_id
		local sql = "INSERT INTO distributor_nodes (id, k, v, distributor_id) values (" .. id .. ", '" .. kvp.k .. "' , '" .. kvp.v .. "', " .. distributor_id .. ")"
		freeswitch.consoleLog('err',sql)
		xdb.execute(sql)
	end

	return id
end

function params(distributor_id)
	rows = {}
	sql = "SELECT * from distributor_nodes WHERE distributor_id = " .. distributor_id
	print(sql)
	xdb.find_by_sql(sql, function(row)
		table.insert(rows, row)
	end)
	-- print(serialize(rows))
	return rows
end

function toggle_param(rt_id, param_id)
	sql = "UPDATE distributor_nodes SET " ..
		xdb.cond({distributor_id = rt_id, id = param_id})
	print(sql)
	xdb.execute(sql)
	if xdb.affected_rows() == 1 then
		return xdb.find("distributor_nodes", param_id)
	end
	return nil
end

function update_param(rt_id, param_id, kvp)
	xdb.update_by_cond("distributor_nodes", {distributor_id = rt_id, id = param_id}, kvp)
	if xdb.affected_rows() == 1 then
		return xdb.find("distributor_nodes", param_id)
	end
	return nil;
end

m_distributor.delete = function(rt_id)
	xdb.delete("distributors", rt_id);
	local sql = "DELETE FROM distributor_nodes " .. xdb.cond({distributor_id = rt_id})
	xdb.execute(sql)
	return xdb.affected_rows()
end

m_distributor.create = create
m_distributor.params = params
m_distributor.toggle_param = toggle_param
m_distributor.update_param = update_param
m_distributor.createParam = createParam

return m_distributor
