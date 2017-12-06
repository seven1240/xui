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
 * MariahYang <yangxiaojin@x-y-t.cn>s
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * MariahYang <yangxiaojin@x-y-t.cn>
 *
 *
 */
]]

require 'xdb'

m_user_dev_key = {}

function generate_key()
	local now_epoch = os.time()
	local api = freeswitch.API()
	local uuid = api:execute("create_uuid")
	return now_epoch .. uuid
end

function create(user_id)
	local data = {}
	if not user_id then return nil end

	data.user_id = user_id
	data.key = generate_key()
	obj = xdb.create_return_object("user_dev_key", data)
	if obj then
		api:execute("hash", "insert/xui/" .. obj.key .. "/" .. obj.user_id)
		return obj
	else
		return nil
	end
end

function get_admin_key()
	user = xdb.find_one("users", {exten = 'admin'})
	if not user then return nil end
	admin_key_obj = xdb.find_one("user_dev_key", {user_id = user.id})
	if not admin_key_obj then
		obj = create(user.id)
		if not obj then return nil end
		return obj.key
	else
		return admin_key_obj.key
	end
end

m_user_dev_key.create = create
m_user_dev_key.get_admin_key = get_admin_key

return m_user_dev_key
