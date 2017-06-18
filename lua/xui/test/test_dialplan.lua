print("test start ... \n")

if not argv[1] then
	freeswitch.consoleLog("ERR", "Usage: " .. argv[0] .. " <dest> [context]\n")
	return
end

local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(cur_dir, "^@(.+)/test/test_dialplan.lua$", "%1")
package.path = package.path .. ";" .. cur_dir .. "/?.lua"
package.path = package.path .. ";" .. cur_dir .. "/vendor/?.lua"
package.path = package.path .. ";" .. cur_dir .. "/model/?.lua"

-- stream:write(package.path)
-- stream:write("test start\n")

require 'xdb'
require 'xtra_config'
require 'utils'

XML_REQUEST = {
	section = "dialplan",
	tag_name = "dialplan",
	key_name = "dialplan",
	key_value = "dialplan"
}

params = {}
params["Hunt-Destination-Number"] = argv[1] or '7777777'
params["Hunt-Context"] = argv[2] or "default"
params.serialize = function(p)
	return utils.serialize(p)
end
params.getHeader = function(p, header)
	return p[header]
end

local do_debug = config.do_debug
-- do_debug = true

require 'fs_xml_handler'
print(XML_STRING)
