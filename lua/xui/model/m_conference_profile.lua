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

m_conference_profile = {}

function create(kvp)
	template = kvp.template
	kvp.template = nil
	id = xdb.create_return_id("conference_profiles", kvp)
	-- print(id)
	if id then
		local realm = 'conference'
		local ref_id = 0
		local sql = "INSERT INTO params (realm, k, v, ref_id, disabled) SELECT 'conference', k, v, " ..
			id .. ", disabled FROM params WHERE realm = 'conference' and ref_id = 0"

		xdb.execute(sql)
	end
	return id
end

function params(profile_id)
	rows = {}
	sql = "SELECT * FROM params WHERE realm = 'conference' AND ref_id = " .. profile_id
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
		xdb.cond({realm = 'conference', ref_id = profile_id, id = param_id})
	print(sql)
	xdb.execute(sql)
	if xdb.affected_rows() == 1 then
		return xdb.find("params", param_id)
	end
	return nil
end

function update_param(profile_id, param_id, kvp)
	xdb.update_by_cond("params", {realm = 'conference', ref_id = profile_id, id = param_id}, kvp)
	if xdb.affected_rows() == 1 then
		return xdb.find("params", param_id)
	end
	return nil;
end

m_conference_profile.delete = function(profile_id)
	xdb.delete("conference_profiles", profile_id);
	if (xdb.affected_rows() == 1) then
		local sql = "DELETE FROM params WHERE " .. xdb.cond({realm = 'conference', ref_id = profile_id})
		xdb.execute(sql)
	end
	return xdb.affected_rows()
end

m_conference_profile.create = create
m_conference_profile.params = params
m_conference_profile.toggle = toggle
m_conference_profile.toggle_param = toggle_param
m_conference_profile.update_param = update_param

return m_conference_profile
