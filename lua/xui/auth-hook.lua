--[[
	<hook event="CUSTOM" subclass="verto::login" script="/usr/local/freeswitch/xui/lua/xui/auth-hook.lua"/>
]]

-- do_debug = true

function __FILE__() return debug.getinfo(2,'S').source end
function __LINE__() return debug.getinfo(2, 'l').currentline end
function __FUNC__() return debug.getinfo(1).name end

if do_debug then
	freeswitch.consoleLog("INFO", event:serialize() .. "\n")
end

sessid = event:getHeader("verto_sessid")
login  = event:getHeader("verto_login")
success= event:getHeader("verto_success")

if (login and success == "1") then
	local cur_dir = debug.getinfo(1).source;
	cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)[^/]+$", "%1")

	package.path = package.path .. ";/etc/xtra/?.lua"
	package.path = package.path .. ";" .. cur_dir .. "?.lua"
	package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"

	require 'utils'
	require 'xtra_config'
	require 'xdb'

	if config.db_auto_connect then xdb.connect(config.dsn) end

	user, domain = string.match(login, "(.*)@(.*)")

	user = xdb.find_one("users", {extn = user})

	if user then
		api = freeswitch.API()
		api:execute("hash", "insert/xui/" .. sessid .. "/" .. user.id)
	end

	if do_debug then
		freeswitch.consoleLog("INFO", sessid .. " Logged in\n")
	end
end
