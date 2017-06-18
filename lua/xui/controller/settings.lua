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

get('/event_socket', function(params)
        n, events = xdb.find_by_cond('params', {realm = 'event_socket'})

        if (n > 0) then
                return events
        else
                return "[]"
        end
end)


put('/event_socket/:id', function(params)
	print(serialize(params))
	ret = nil;

	if params.request.action and params.request.action == "toggle" then
		sql = "UPDATE params SET disabled = 1 - disabled" ..
			xdb.cond({realm = 'event_socket', id = params.id})
		print(sql)
		xdb.execute(sql)
		if xdb.affected_rows() == 1 then
			return xdb.find("params", params.id)
		end
	else
		xdb.update_by_cond("params", {realm = 'event_socket', id = params.id}, params.request)
		if xdb.affected_rows() == 1 then
			return xdb.find("params", params.id)
		end
	end

	if true then return 404 end
end)
