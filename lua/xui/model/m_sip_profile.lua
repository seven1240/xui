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

m_sip_profile = {}

function create(kvp)
	template = kvp.template
	kvp.template = nil

	id = xdb.create_return_id("sip_profiles", kvp)
	-- print(id)
	if id then
		local realm = 'SOFIA'
		local ref_id = 0
		if not (template == "default") then
			realm = 'sip_profile' -- the table name
			ref_id = template
		end

		local sql = "INSERT INTO params (realm, k, v, ref_id, disabled) SELECT 'sip_profile', k, v, " ..
			id .. ", disabled From params" ..
			xdb.cond({realm = realm, ref_id = ref_id})

		xdb.execute(sql)
	end
	return id
end

function createParam(kvp)
	id = xdb.create_return_id("params", kvp)
	return id
end

function params(profile_id)
	rows = {}
	sql = "SELECT * from params WHERE realm = 'sip_profile' AND ref_id = " .. profile_id
	print(sql)
	xdb.find_by_sql(sql, function(row)
		table.insert(rows, row)
	end)
	-- print(serialize(rows))
	return rows
end

function toggle(profile_id)
	sql = "UPDATE sip_profiles SET disabled = 1 - disabled" ..
		xdb.cond({id = profile_id})
	print(sql)

	xdb.execute(sql)
	if xdb.affected_rows() == 1 then
		return xdb.find("sip_profiles", profile_id)
	end
	return nil
end

function toggle_param(profile_id, param_id)
	sql = "UPDATE params SET disabled = 1 - disabled" ..
		xdb.cond({realm = 'sip_profile', ref_id = profile_id, id = param_id})
	print(sql)
	xdb.execute(sql)
	if xdb.affected_rows() == 1 then
		return xdb.find("params", param_id)
	end
	return nil
end

function update_param(profile_id, param_id, kvp)
	xdb.update_by_cond("params", {realm = 'sip_profile', ref_id = profile_id, id = param_id}, kvp)
	if xdb.affected_rows() == 1 then
		return xdb.find("params", param_id)
	end
	return nil;
end

m_sip_profile.delete = function(profile_id)
	xdb.delete("sip_profiles", profile_id);
	local sql = "DELETE FROM params " .. xdb.cond({realm = 'sip_profile', ref_id = profile_id})
	xdb.execute(sql)
	return xdb.affected_rows()
end

function delete_param(id, param_id)
	local sql = "DELETE FROM params WHERE id = " .. param_id .. " AND ref_id = " .. id
	xdb.execute(sql)
	return xdb.affected_rows()
end

m_sip_profile.create = create
m_sip_profile.params = params
m_sip_profile.toggle = toggle
m_sip_profile.toggle_param = toggle_param
m_sip_profile.update_param = update_param
m_sip_profile.createParam = createParam
m_sip_profile.delete_param = delete_param

return m_sip_profile
