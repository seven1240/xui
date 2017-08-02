print("test start ... \n")

local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(cur_dir, "^@(.+)/test/test_send_msg.lua$", "%1")
package.path = package.path .. ";" .. cur_dir .. "/?.lua"
package.path = package.path .. ";" .. cur_dir .. "/vendor/?.lua"
package.path = package.path .. ";" .. cur_dir .. "/model/?.lua"

-- stream:write(package.path)
-- stream:write("test start\n")

require 'xdb'
require 'xwechat'
require 'm_dict'
require 'xtra_config'
require 'utils'

if config.db_auto_connect then xdb.connect(config.dsn) end

realm   = argv[1]
extn    = argv[2]
subject = argv[3]
content = argv[4]
user = xdb.find_one("users", {extn = extn})

local weuser = xdb.find_one("wechat_users", {
	user_id = user.id
})

if weuser then
	local wechat = m_dict.get_obj('WECHAT/' .. realm)
	token = xwechat.access_token('realm')
	freeswitch.consoleLog("ERR", xwechat.access_token(realm))

	redirect_uri = config.wechat_base_url .. "/api/wechat/" .. realm .. "/tickets/0"
	redirect_uri = xwechat.redirect_uri(wechat.APPID, redirect_uri, "200")

		if config.wechat_name == "xyt" then
			ret = xwechat.send_xyt_ticket_notification(realm, weuser.openid, redirect_uri, subject, content)
		elseif config.wechat_name == "zyjt"
			ret = xwechat.send_zyjt_ticket_notification(realm, weuser.openid, redirect_uri, subject, content)
		end
	stream:write(ret)
end
