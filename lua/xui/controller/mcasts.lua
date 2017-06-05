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
 * Mariah Yang <yangxiaojin@x-y-t.cn>
 *
 *
 */
]]

xtra.start_session()
xtra.require_login()

content_type("application/json")
require 'xdb'
require 'm_mcast'
xdb.bind(xtra.dbh)

get('/', function(params)
	n, mcasts = xdb.find_all("mcasts")

	if (n > 0) then
		return mcasts
	else
		return "[]"
	end
end)

get('/:id', function(params)
	mcast = xdb.find("mcasts", params.id)
	if mcast then
		return mcast
	else
		return 404
	end
end)

put('/:id', function(params)
	print(serialize(params))

	if params.request.action == "toggle" then
		mcast = m_mcast.toggle(params.id)

		if (mcast) then
			return mcast
		end
	else
		ret = xdb.update("mcasts", params.request)

		if ret then
			return 200, "{}"
		end
	end

	return 500
end)

post('/', function(params)
	print(serialize(params))

	params.request.source = "local_stream://".. params.request.name .. "/" .. params.request.sample_rate
	ret = xdb.create_return_id('mcasts', params.request)

	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

delete('/:id', function(params)
	ret = xdb.delete("mcasts", params.id);

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)
