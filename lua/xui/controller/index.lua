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

-- print(env:serialize())

xtra.start_session()
-- xtra.require_login()
-- content_type("application/json")
require 'xdb'
xdb.bind(xtra.dbh)

get("/", function()
	args = {}

	if not xtra.session.user_id then
        if xtra.session.flash_message then
            args["flash"] = xtra.session.flash_message
            xtra.save_session("flash_message", nil)
        end
        return {"render", "login.html", args}
	end

	return {"render", "index.html", args}
end)

get("/login", function()
	if xtra.session.user_id then
		redirect("/")
		return
	end

	args = {}

	if xtra.session.flash_message then
		local msg = xtra.session.flash_message
		xtra.save_session("flash_message", nil)
		args["flash"] = msg
	end

	return {"render", "login.html", args}
end)

get("/logout", function()
	xtra.flash("您已退出登录")
	xtra.save_session("user_id", nil)
	redirect("/login")
end)

post("/", function(params)
	login = env:getHeader("login")
	pass = env:getHeader("pass")

    freeswitch.consoleLog("ERR", login)
    freeswitch.consoleLog("ERR", pass)

    if (not login) and (not pass) then
        xtra.flash("您已退出登录")
        xtra.save_session("user_id", nil)
        redirect("/")   
        return; 
    end

	if (login == "7" and pass == "7") then
		xtra.save_session("user_id", login)
		redirect("/")
	else
		xtra.flash("密码错误")
		redirect("/")
	end
end)
