-- print("test start ... \n")

local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(cur_dir, "^@(.+)/get_token.lua$", "%1")

package.path = package.path .. ";/etc/xtra/?.lua"
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

realm = argv[1] or 'xyt'

local wechat = m_dict.get_obj('WECHAT/' .. realm)
if (not wechat.APPID) or (not wechat.APPSEC) then
	stream:write("APPID/APPSEC NOT CONFIGURED!")
else
	token = xwechat.get_token(realm, wechat.APPID, wechat.APPSEC)
	stream:write(os.date("%Y-%m-%d %H:%M:%S") .. " token: " .. token .. "\n")
end
