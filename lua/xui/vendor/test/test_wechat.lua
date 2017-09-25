print("test start ... \n")

local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/vendor)/test/test_wechat.lua$", "%1")
package.path = package.path .. ";" .. cur_dir .. "/?.lua"
package.path = package.path .. ";" .. cur_dir .. "/../model/?.lua"

stream:write(package.path)
stream:write("test start\n")

require 'xdb'
require 'xwechat'
require 'm_dict'
require 'xtra_config'
require 'utils'

if config.db_auto_connect then xdb.connect(config.dsn) end

local wechat = m_dict.get_obj('WECHAT')

token = xwechat.access_token('sipsip', wechat.APPID, wechat.APPSEC)
print(token)
print(xwechat.access_token('sipsip'))

-- xwechat.get_callback_ip()

print(xwechat.sign('sipsip', "a", "b", "c"))

json = {}
json.button = {}

button = {
	type = "click",
	name = "test",
	key  = "test"
}

table.insert(json.button, button)
button.name="test1"
table.insert(json.button, button)

json_text = utils.json_encode(json)
ret = xwechat.create_menu('sipsip', json_text)

print(json_text)
print(ret)

stream:write("test done\n")
