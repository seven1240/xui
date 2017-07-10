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
require 'm_gateway'
require 'm_user'

get('/', function(params)
	if not m_user.has_permission() then
		return "[]"
	end

	n, gateways = xdb.find_all("gateways")

	if (n > 0) then
		for k,v in ipairs(gateways) do
			gateways[k].password = nil
		end

		return gateways
	else
		return "[]"
	end
end)

get('/:id', function(params)
	gw = xdb.find("gateways", params.id)
	if gw then
		gw.password = nil
		p_params = m_gateway.params(params.id)
		gw.params = p_params
		return gw
	else
		return 404
	end
end)

put('/:id', function(params)
	print(serialize(params))
	ret = xdb.update("gateways", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

put('/:id/params/:param_id', function(params)
        print(serialize(params))
        ret = nil;

        if params.request.action and params.request.action == "toggle" then
                ret = m_gateway.toggle_param(params.id, params.param_id)
        else
                ret = m_gateway.update_param(params.id, params.param_id, params.request)
        end

        if ret then
                return ret
        else
                return 404
        end
end)

post('/', function(params)
	ret = m_gateway.create(params.request)

	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

post('/:ref_id/params/', function(params)
	params.request.ref_id = params.ref_id
	params.realm = 'gateway'
	params.request.realm = params.realm
	ret = m_gateway.createParam(params.request)

	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

delete('/:id', function(params)
	ret = m_gateway.delete(params.id)

	if ret >= 0 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

delete('/:id/param/:param_id', function(params)
	id = params.id
	param_id = params.param_id
	ret = m_gateway.delete_param(id, param_id)

	if ret >= 0 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

put('/:id/control', function(params)
	print(utils.serialize(params))

	gateway = xdb.find("gateways", params.id)
	action = params.request.action

	if gateway then
		profile = xdb.find("sip_profiles", gateway.profile_id)
		profile_name = profile.name or 'public'

		api = freeswitch.API()
		args = "profile " .. profile_name .. ' ' .. action .. ' ' .. gateway.name

		print(args)

		ret = api:execute("sofia", args)

		if ret:match('%+OK') then
			return {code = 200, text=ret}
		else
			return {code = 500, text=ret}
		end
	else
		return 404
	end
end)

put('/control/gateways/:name', function(params)
	print(utils.serialize(params))
	profile_name = params.request.profile_name
	action = params.request.action

	api = freeswitch.API()
	args = "profile " .. profile_name .. ' ' .. action .. ' ' .. params.name

	print(args)

	ret = api:execute("sofia", args)

	if ret:match('%+OK') then
		return {code = 200, text=ret}
	else
		return {code = 500, text=ret}
	end

end)
