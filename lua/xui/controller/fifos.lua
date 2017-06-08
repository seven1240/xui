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

get('/', function(params)

	-- local check = xdb.checkPermission('7','users','get','/')
	-- if check then
		n, fifos = xdb.find_all("fifos")

		if n > 0 then
			return fifos
		else
			return "[]"
		end
	-- else
		-- return '{}'
	-- end
end)

get('/:id', function(params)
	fifo = xdb.find("fifos", params.id)
	if fifo then
		return fifo
	else
		return 404
	end
end)

get('/:id/members', function(params)
	n, fifo_members = xdb.find_by_cond("fifo_members", {fifo_id = params.id})
	if n > 0 then
		return fifo_members
	else
		return '[]'
	end
end)

get('/:id/members/:members_id', function(params)
	n, fifo_members = xdb.find_by_cond("fifo_members", {fifo_id = params.id, id = params.members_id})
	if fifo_members then
		return fifo_members
	else
		return 404
	end
end)

put('/:id/work/:state',function(params)
	local state = params.state
	n, tickets = xdb.find_by_sql([[SELECT b.name,b.tel,b.extn
	FROM tickets AS a
	LEFT JOIN users AS b
	ON a.current_user_id = b.id
	WHERE a.id = ]] .. xdb.escape(params.id))
	local ticket = tickets[1]
	if state == 'onwork' then
		local n, check = xdb.find_by_cond("fifo_members", {extn = ticket.extn})
		if n == 0 then
			ret = xdb.create_return_id("fifo_members", {name = ticket.name, extn = ticket.extn, fifo_id = 1, dial_string = 'sofia/gateway/beijingSIP/' .. ticket.tel})
			if ret == 1 then
				api = freeswitch.API()
				api:execute("bgapi", "fifo reparse")
			end
		end
	elseif state == 'afterWork' then
		ret = xdb.delete("fifo_members", {extn = ticket.extn})
	end
	if ret == 1 then
		return {}
	else
		return 500
	end
end)

put('/:id', function(params)
	print(serialize(params))
	ret = xdb.update("fifos", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

put('/:id/members/:members_id', function(params)
	print(serialize(params))
	member = params.request
	member.fifo_id = nil
	member.id = nil
	ret = xdb.update_by_cond("fifo_members", { fifo_id = params.id, id = params.members_id}, params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

post('/', function(params)
	print(serialize(params))
	ret = xdb.create_return_id('fifos', params.request)
	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

post('/:id/members', function(params)
	print(serialize(params))
	member = params.request
	member.fifo_id = params.id
	member.fifo_name = nil
	ret = xdb.create('fifo_members', member)
	if  ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)

delete('/:id', function(params)
	ret = xdb.delete("fifos", params.id);

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

delete('/:id/members/:members_id', function(params)
	ret = xdb.delete("fifo_members",{ fifo_id = params.id, id = params.members_id});

	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

