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
require 'm_route'
require 'm_user'

local block_prefix = config.block_path .. "/blocks-"

get('/', function(params)
	if m_user.has_permission() then
		n, routes = xdb.find_all("routes")
	else
		return "[]"
	end

	if (n > 0)	then
		return routes
	else
		return "[]"
	end
end)

get('/download', function(params)
	n, routes = xdb.find_all("routes")
	content_type("application/vnd.ms-excel;charset=utf-8")
	header("Content-Disposition", 'attachment; filename="download_routes.csv"')
	xtra.write(string.char(0xef, 0xBB, 0xbf))

	xtra.write('路由ID,' .. '名称,' .. '描述,' .. '起始号码,' .. '呼叫源,' .. '目的地类型,' .. '自动录音\n')
	for i, v in pairs(routes) do
		v.auto_record = v.auto_record == '1' and '是' or '否'
		xtra.write(v.id .. "," .. v.name .. "," .. v.description .. "," .. v.prefix .. "," ..
		v.context .. "," .. v.dest_type .. "," .. v.auto_record .. "\n")
	end
end)

get('/:id', function(params)
	with_params = env:getHeader("with_params")
	route = xdb.find("routes", params.id)
	if route then
		if with_params == "true" then
			n, route_params = m_route.params(params.id)
			route.params = route_params
		end
		return route
	else
		return 404
	end
end)

get('/:id/params', function(params)
	n, route_params = m_route.params(params.id)

	if n > 0 then
		return route_params
	else
		return "[]"
	end
end)

post('/', function(params)
	print(serialize(params))

	if params.request.dest_type == 'FS_DEST_GATEWAY' then
		gw = xdb.find("gateways", params.request.dest_uuid)
		params.request.body = gw.name
	elseif params.request.dest_type == 'IVRBLOCK' then
		block = xdb.find("blocks", params.request.dest_uuid)
		params.request.body = block.name
	elseif params.request.dest_type == 'FS_DEST_CONFERENCE' then
		room = xdb.find("conference_rooms", params.request.dest_uuid)
		params.request.body = room.nbr
	end

	route = xdb.create_return_object('routes', params.request)

	if route then
		return route
	else
		return 500, "{}"
	end
end)

put('/:id', function(params)
	if params.request.dest_type == 'FS_DEST_GATEWAY' then
		gw = xdb.find("gateways", params.request.dest_uuid)
		params.request.body = gw.name
	elseif params.request.dest_type == 'FS_DEST_IVRBLOCK' then
		block = xdb.find("blocks", params.request.dest_uuid)
		params.request.body = block.name
	elseif params.request.dest_type == 'FS_DEST_CONFERENCE' then
		room = xdb.find("conference_rooms", params.request.dest_uuid)
		params.request.body = room.nbr
	end

	ret = xdb.update("routes", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

delete('/:id', function(params)
	ret = m_route.delete(params.id)

	if ret >= 0 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

post('/:ref_id/params/', function(params)
	params.request.ref_id = params.ref_id
	params.realm = 'route'
	params.request.realm = params.realm
	ret = m_route.createParam(params.request)
	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

delete('/:id/param/:param_id', function(params)
	id = params.id
	param_id = params.param_id
	ret = m_route.delete_param(id, param_id)
	
	if ret >= 0 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

put('/:id/params/:param_id', function(params)
	print(serialize(params))
	ret = nil;

	if params.request.action and params.request.action == "toggle" then
		ret = m_route.toggle_param(params.id, params.param_id)
	else
		ret = m_route.update_param(params.id, params.param_id, params.request)
	end

	if ret then
		return ret
	else
		return 404
	end
end)
