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
require 'm_acl'

get('/', function(params)
	n, acls = xdb.find_all("acls")
	if (n > 0) then
		return acls
	else
		return "[]"
	end
end)

get('/:id', function(params)
	acl = xdb.find("acls", params.id)
	if acl then
		p_params = m_acl.params(params.id)
		acl.params = p_params
		return acl
	else
		return 404
	end
end)

post('/', function(params)
	print(serialize(params))

	acl = xdb.create_return_object('acls', params.request)

	if acl then
		return acl
	else
		return 500, "{}"
	end
end)

put('/:id', function(params)
	ret = xdb.update("acls", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

post('/:acl_id/nodes/', function(params)
	params.request.acl_id = params.acl_id
	ret = m_acl.createParam(params.request)
	if ret then
		utils.reload_acl()
		return {id = ret}
	else
		return 500, "{}"
	end
end)

put('/:id/nodes/:param_id', function(params)
	print(serialize(params))
	ret = nil;

	if params.request.action and params.request.action == "toggle" then
		ret = m_acl.toggle_param(params.id, params.param_id)
	else
		ret = m_acl.update_param(params.id, params.param_id, params.request)
		utils.reload_acl()
	end

	if ret then
		return ret
	else
		return 404
	end
end)


delete('/:id', function(params)
	ret = m_acl.delete(params.id)

	if ret >= 0 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

delete('/:id/node/:node_id', function(params)
	id = params.id
	node_id = params.node_id
	ret = m_acl.delete_node(id, node_id)
	utils.reload_acl()

	if ret >= 0 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)
