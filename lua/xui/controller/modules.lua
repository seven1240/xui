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
require 'm_modules'

get('/', function(params)
	n, modules = m_modules.find_all()

	if (n > 0) then
		return modules
	else
		return "[]"
	end
end)

put('/:param_id', function(params)
	print(serialize(params))
	ret = nil;

	if params.request.action and params.request.action == "toggle" then
		ret = m_modules.toggle_param(params.param_id)
	else
		ret = m_modules.update_param(params.param_id, params.request)
	end

	if ret then
		return ret
	else
		return 404
	end
end)

post('/', function(params)
	params.realm = 'modules'
	params.request.realm = params.realm
	ret = m_modules.create(params.request)

	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)
