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
require 'm_distributor'

get('/', function(params)
	n, distributors = xdb.find_all("distributors")
	if (n > 0)	then
		return distributors
	else
		return "[]"
	end
end)

get('/:id', function(params)
	distributor = xdb.find("distributors", params.id)
	if distributor then
		p_params = m_distributor.params(params.id)
		distributor.params = p_params
		return distributor
	else
		return 404
	end
end)

post('/', function(params)
	print(serialize(params))

	distributor = xdb.create_return_object('distributors', params.request)

	if distributor then
		return distributor
	else
		return 500, "{}"
	end
end)

put('/:id', function(params)
	ret = xdb.update("distributors", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

delete('/:id', function(params)
	ret = m_distributor.delete(params.id)

	if ret >= 0 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

post('/:distributor_id/nodes/', function(params)
	params.request.distributor_id = params.distributor_id
	ret = m_distributor.createParam(params.request)
	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

delete('/', function(params)
	id = tonumber(env:getHeader('id'))
	ret = m_distributor.delete(id)

	if ret >= 0 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

put('/:id/nodes/:param_id', function(params)
	print(serialize(params))
	ret = nil;

	if params.request.action and params.request.action == "toggle" then
		ret = m_distributor.toggle_param(params.id, params.param_id)
	else
		ret = m_distributor.update_param(params.id, params.param_id, params.request)
	end

	if ret then
		return ret
	else
		return 404
	end
end)
