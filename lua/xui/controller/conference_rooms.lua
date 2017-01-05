--[[
/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2016, Seven Du <dujinfang@x-y-t.cn>
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

local prefix = config.block_path .. "/blocks-"
require 'xdb'
xdb.bind(xtra.dbh)

get('/', function(params)
	n, rooms = xdb.find_all("conference_rooms")

	if (n > 0) then
		return rooms
	else
		return "[]"
	end
end)

get('/:id', function(params)
	room = xdb.find("conference_rooms", params.id)
	if room then
		return room
	else
		return 404
	end
end)

post('/', function(params)
	print(serialize(params))

	ret = xdb.create_return_id('conference_rooms', params.request)

	if ret then
		return {id = ret}
	else
		return 500, "{}"
	end
end)
