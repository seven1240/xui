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

m_modules = {}


function find_all()
	return xdb.find_by_cond('params', {realm = 'modules'})
end

function toggle_param(param_id)
	sql = "UPDATE params SET disabled = 1 - disabled" ..
		xdb.cond({realm = 'modules', id = param_id})
	print(sql)
	xdb.execute(sql)
	if xdb.affected_rows() == 1 then
		return xdb.find("params", param_id)
	end
	return nil
end

function update_param(param_id, kvp)
	xdb.update_by_cond("params", {realm = 'modules',id = param_id}, kvp)
	if xdb.affected_rows() == 1 then
		return xdb.find("params", param_id)
	end
	return nil;
end

function createParam(kvp)
	id = xdb.create_return_id("params", kvp)
	-- print(id)
	if id then
		local realm = 'modules'
		local sql = "INSERT INTO params (id, realm,  k) values (" .. id .. ", '" .. realm .. "' , '" .. kvp.k .. "')"
		xdb.execute(sql)
	end

	return id
end

m_modules.find_all = find_all
m_modules.toggle_param = toggle_param
m_modules.update_param = update_param
m_modules.createParam = createParam

return m_modules
