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

get('/', function(params)

	-- if not m_user.has_permission() then
		-- return "[]"
	-- end

	realm = env:getHeader('realm')

	k = env:getHeader('k')

	if realm and k then
		n, dicts = xdb.find_by_cond("dicts", {realm = realm, k = k})
	elseif realm then
		n, dicts = xdb.find_by_cond("dicts", {realm = realm})
	else
		if not m_user.has_permission() then
			n = 0
		else
			n, dicts = xdb.find_all("dicts")
		end
	end

	if (n > 0) then
		return dicts
	else
		return "[]"
	end
end)

get('/:id', function(params)
	dict = xdb.find("dicts", params.id)
	if dict then
		return dict
	else
		return 404
	end
end)

put('/:id', function(params)
	print(serialize(params))
	ret = xdb.update("dicts", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)



post('/', function(params)
	print(serialize(params))

	ret = xdb.create_return_id('dicts', params.request)

	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

delete('/:id', function(params)
	ret = xdb.delete("dicts", params.id);

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)
