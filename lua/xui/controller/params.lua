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
require 'm_user'
require 'm_param'

get('/', function(params)

	-- if not m_user.has_permission() then
	-- return "[]"
	-- end

	realm = env:getHeader('realm')

	k = env:getHeader('k')

	if realm and k then
		n, module_params = xdb.find_by_cond("params", { realm = realm, k = k })
	elseif realm then
		n, module_params = xdb.find_by_cond("params", { realm = realm })
	else
		if not m_user.has_permission() then
			n = 0
		else
			n, module_params = xdb.find_all("params")
		end
	end

	if (n > 0) then
		return module_params
	else
		return "[]"
	end
end)

get('/:id', function(params)
	module_param = xdb.find("params", params.id)
	if module_param then
		return module_param
	else
		return 404
	end
end)

put('/:id', function(params)
	print(serialize(params))

	if params.request.action and params.request.action == "toggle" then
		profile = m_param.toggle(params.id)

		if (profile) then
			return profile
		end
	else
		ret = xdb.update("params", params.request)
		if ret then
			return 200, "{}"
		end
	end

	return 500
end)

post('/', function(params)
	print(serialize(params))

	ret = xdb.create_return_id('params', params.request)

	if ret then
		return { id = ret }
	else
		return 500, "{}"
	end
end)

delete('/:id', function(params)
	ret = xdb.delete("params", params.id);

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)
