--[[
/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2013-2017, Seven Du <dujinfang@x-y-t.cn>
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

-- xtra in Lua
-- To run xtra like scripts run in Lua in FreeSWITCH
-- Inspired by https://github.com/nrk/mercury, thanks.
-- Author: Seven Du <dujinfang@gmail.com>
-- Contributors:

-- module('xtra', package.seeall)
-- print(env:serialize())

function __FILE__() return debug.getinfo(2,'S').source end
function __LINE__() return debug.getinfo(2, 'l').currentline end
function __FUNC__() return debug.getinfo(1).name end

xtra = {}
-- xtra.http_uri = env:getHeader("HTTP-URI")
xtra.http_uri = env:getHeader("HTTP-Request-URI")
xtra.http_query = env:getHeader("HTTP-QUERY")
xtra.rest_matched = false

xtra.method = env:getHeader("Request-Method")

if xtra.method == "PUT" then
	if env:getHeader("delete") == "true" then
		xtra.method = "DELETE"
	else
		xtra.method = env:getHeader("Request-Method")
	end
else
	if xtra.method == "POST" then
		local browser_method = env:getHeader("X-HTTP-Method-Override")

		if (browser_method) then
			xtra.method = browser_method
		end
	end
end

xtra.rest_path = nil
xtra.debug = xtra.debug or false
xtra.log = freeswitch.consoleLog
xtra.request_content_type = env:getHeader("Content-Type")
xtra.request_content_length = env:getHeader("Content-Length")
if xtra.request_content_length then
	xtra.request_content_length = tonumber(xtra.request_content_length)
end
xtra.default_content_type = "text/html"
xtra.content_type_sent = false
xtra.status = 200
xtra.response_state = 0 -- 0:INIT 1:HEADER 2: BODY
xtra.session = {}
xtra.cookies = {}
xtra.write = function(s)
	if xtra.response_state == 0 then
		response_start(xtra.status)
	end

	if xtra.response_state == 1 then
		if not xtra.content_type_sent then
			stream:write("Content-Type: " .. xtra.default_content_type .. "\r\n")
		end
		stream:write("\r\n")
		xtra.response_state = 2
	end

	stream:write(s)
end

xtra.response = function(s)
	if xtra.response_state == 0 then
		response_start(xtra.status)
	end

	if xtra.response_state == 1 then
		if not xtra.content_type_sent then
			stream:write("Content-Type: " .. xtra.default_content_type .. "\r\n")
		end
		stream:write("Content-Length: " .. string.len(s) .. "\r\n")
		stream:write("\r\n")
		xtra.response_state = 2
	end

	stream:write(s)
end

xtra.authReply = ""

HTTPPHRASE = {
	[100] = "Continue",
	[101] = "Switching Protocols",
	[200] = "OK",
	[201] = "Created",
	[202] = "Accepted",
	[203] = "Non-Authoritative Information",
	[204] = "No Content",
	[205] = "Reset Content",
	[206] = "Partial Content",
	[300] = "Multiple Choices",
	[301] = "Moved Permanently",
	[302] = "Moved Temporarily",
	[303] = "See Other",
	[304] = "Not Modified",
	[305] = "Use Proxy",
	[400] = "Bad Request",
	[401] = "Unauthorized",
	[402] = "Payment Required",
	[403] = "Forbidden",
	[404] = "Not Found",
	[405] = "Method Not Allowed",
	[406] = "Not Acceptable",
	[407] = "Proxy Authentication Required",
	[408] = "Request Timeout",
	[409] = "Conflict",
	[410] = "Gone",
	[411] = "Length Required",
	[412] = "Precondition Failed",
	[413] = "Request Entity Too Large",
	[414] = "Request-URI Too Long",
	[415] = "Unsupported Media Type",
	[422] = "Unprocessable Entity",
	[429] = "Too Many Requests",
	[499] = "Client has closed connection - Nginx",
	[500] = "Internal Server Error",
	[501] = "Not Implemented",
	[502] = "Bad Gateway",
	[503] = "Service Unavailable",
	[504] = "Gateway Timeout",
	[505] = "HTTP Version Not Supported"
}

-- single char string splitter, sep *must* be a single char pattern
-- *probably* escaped with % if it has any special pattern meaning, eg "%." not "."
-- so good for splitting paths on "/" or "%." which is a common need

local function csplit(str, sep)
	local ret={}
	local n=1
	for w in str:gmatch("([^"..sep.."]*)") do
					ret[n]=ret[n] or w -- only set once (so the blank after a string is ignored)
					if w=="" then n=n+1 end -- step forwards on a blank but not a string
	end
	return ret
end

local function method_handler(method, path, func)
	if xtra.rest_matched then return end
	if not (xtra.method == method) then return end

	local pattern = compile_url_pattern(path)
	-- print(path)
	-- print(pattern.pattern)
	local match, params = url_match(pattern, xtra.rest_path)

	if match then
		xtra.rest_matched = true

		if xtra.request_content_type and
			xtra.request_content_type:match("^application/json") and
			xtra.request_content_length and
			xtra.request_content_length > 0 then
			-- JSON request in Body
			local received = 0
			local json_text = ""

			while received < xtra.request_content_length do
				x = stream:read()
				received = received + x:len()
				-- print("received " .. received)
				if not x or x:len() == 0 then break end -- read eof
				json_text = json_text .. x
			end
			-- print(json_text)
			if string.len(json_text) then
				params.request = (utils.json_decode(json_text))
			end
		end

		-- execute the controller
		output, text = func(params)

		output_type = type(output)

		if output_type == 'string' then
			xtra.response(output)
		elseif output_type == 'number' then
			response_start(output)
			if type(text) == 'table' then
				xtra.response(utils.json_encode(text))
			elseif type(text) == 'string' then
				xtra.response(text)
			else
				xtra.response("")
			end
		elseif output_type == 'table' then
			local datatype = output[1]

			if datatype == "render" then
				local view = output[2]
				local args = output[3]
				require 'lutem'
				local tmplate = lutem:new()
				ret,errmsg = tmplate:load(view, config.view_path)
				if ret == 0 then
					result = tmplate:render(args)
					xtra.response(result)
				else
					xtra.write("Error")
				end
			else
				-- a generic table
				xtra.response(utils.json_encode(output))
			end
		elseif output_type == 'function' then
			-- not implemented
			return coroutine.wrap(output)
		elseif type(text) == 'nil' then
			-- do nothing, for background style controllers
			-- controller calls xtra.response first finish the http session and
			-- do whatever in background and then return nil finally
		end
	end
end

get = function(path, func) method_handler('GET', path, func) end
post = function(path, func) method_handler('POST', path, func) end
put = function(path, func) method_handler('PUT', path, func) end
delete = function(path, func) method_handler('DELETE', path, func) end

function compile_url_pattern(pattern)
	local compiled_pattern = {
		original = pattern,
		params   = { },
	}

	-- Lua pattern matching is blazing fast compared to regular expressions,
	-- but at the same time it is tricky when you need to mimic some of
	-- their behaviors.
	pattern = pattern:gsub("[%(%)%.%%%+%-%%?%[%^%$%*]", function(char)
		if char == '*' then return ':*' else return '%' .. char end
	end)

	pattern = pattern:gsub(':([%w_%*]+)(/?)', function(param, slash)
		if param == '*' then
			table.insert(compiled_pattern.params, 'splat')
			return '(.-)' .. slash
		else
			table.insert(compiled_pattern.params, param)
			return '([^/?&#]+)' .. slash
		end

	end)

	if pattern:sub(-1) ~= '/' then pattern = pattern .. '/' end
	compiled_pattern.pattern = '^' .. pattern .. '?$'

	return compiled_pattern
end

local function escape(str)
	return str:gsub("'", "''")
end

local url_decode = utils.url_decode

-- parse querystring into table. urldecode tokens
function parse(str, sep, eq)
	if not sep then sep = '&' end
	if not eq then eq = '=' end
	local vars = {}
	for pair in string.gmatch(tostring(str), '[^' .. sep .. ']+') do
		if not string.find(pair, eq) then
			vars[url_decode(pair)] = ''
		else
			local key, value = string.match(pair, '([^' .. eq .. ']*)' .. eq .. '(.*)')
			if key and key ~= 'action' and key ~= 'sessionid' and key ~= 'users' and key ~= 'conference_name' and
				key ~= 'moderator' and key ~= 'files' and key ~= 'reminded_time' and key ~= 'update_str' then
				vars[url_decode(key)] = escape(url_decode(value))
			end
		end
	end
	return vars
end

-- parse querystring into table. urldecode tokens
function parse1(str, sep, eq)
	if not sep then sep = '&' end
	if not eq then eq = '=' end
	local vars = {}
	for pair in string.gmatch(tostring(str), '[^' .. sep .. ']+') do
		if not string.find(pair, eq) then
			vars[url_decode(pair)] = ''
		else
			local key, value = string.match(pair, '([^' .. eq .. ']*)' .. eq .. '(.*)')
			if key then
				vars[url_decode(key)] = escape(url_decode(value))
			end
		end
	end
	return vars
end

function extract_parameters(pattern, matches)
	local params = { }
	for i,k in ipairs(pattern.params) do
		if (k == 'splat') then
			if not params.splat then params.splat = {} end
			table.insert(params.splat, url_decode(matches[i]))
		else
			params[k] = url_decode(matches[i])
			params[k] = matches[i]
		end
	end
	return params
end

function url_match(pattern, path)
	local matches = { string.match(path, pattern.pattern) }
	if #matches > 0 then
		return true, extract_parameters(pattern, matches)
	else
		return false, nil
	end
end

function response_100_continue()
	if not (xtra.response_state == 0) then return end
	stream:write("HTTP/1.1 100 Continue\r\n\r\n")
	-- xtra.response_state = 1
end

function response_start(code, phrase)
	if xtra.response_state ~= 0 then return end
	if not code then code = 200 end
	if not phrase then
		phrase = HTTPPHRASE[code] or "UNKNOWN"
	end
	stream:write("HTTP/1.1 " .. code .. " " .. phrase .. "\r\n")
	stream:write("Connection: close\r\n")
	stream:write("Date: " .. env:getHeader("Event-Date-GMT") .. "\r\n")
	stream:write("Server: FreeSWITCH\r\n")
	stream:write("Access-Control-Allow-Origin: *\r\n")

	if next(xtra.cookies) ~= nil then
		local c = "Set-Cookie: "

		for k, v in pairs(xtra.cookies) do
			-- xtra.log("ERR", k)
			-- xtra.log("ERR", v)
			c = c .. k .. "=" .. v .. ";path=/"
		end
		stream:write(c .. "\r\n");
	end
	xtra.response_state = 1
end

function header(k, v)
	if xtra.response_state == 0 then
		response_start(xtra.status, "OK")
	end

	if xtra.response_state ~= 1 then return end

	stream:write(k .. ": " .. v .. "\r\n")
end

function content_type(ctype)
	xtra.default_content_type = ctype
end

function redirect(to)
	response_start(302, "Moved")
	header("Location", to)
	xtra.write("")

	get = function(path, func) end
	put = get
	post = get
	delete = get
end

-- functinon to insert to xtra to do custom auth
local function controller_auth_function()
	if (not config.auth) then return true end
	local api = freeswitch.API()
	local sessionid = env:getHeader("X-Session-ID")
	local user_id = env:getHeader("X-User-ID")

	if not sessionid or not user_id then return false end
	xtra.authReply = api:executeString("http_rest_auth " .. sessionid .. " " .. string.gsub(user_id, "user%-", ""))
	local authReply = xtra.authReply
	if authReply and authReply ~= "false" then
		return true
	else
		return false
	end
end

function xtra.require_auth()
	if config.auth and controller_auth_function and ( not controller_auth_function()) then
		get = function(path, func)
			if xtra.response_state ~= 0 then return end
			content_type("application/json")
			response_start(403)
			xtra.write('{"result": "error", "code": "403", "error_text": "Not Authorized"}')
		end
		post = get
		put = get
		delete = get
		xtra.rest_matched = true
	end
end

function xtra.require_login()
	if config.auth and not xtra.session.user_id then
		get = function(path, func)
			if xtra.response_state ~= 0 then return end
			content_type("application/json")
			response_start(403)
			xtra.write('{"result": "error", "code": "403", "error_text": "Not Authorized"}')
		end
		post = get
		put = get
		delete = get
		xtra.rest_matched = true
	end
end

function xtra.create_uuid()
	local api = freeswitch.API()
	return api:execute("create_uuid")
end

function serialize(o)
	s = ""

	if type(o) == "number" then
		s = s .. o
	elseif type(o) == "string" then
		s = s .. string.format("%q", o)
	elseif type(o) == "table" then
		s = s .. "{\n"
		for k, v in pairs(o) do
			s = s .. '  ' .. k .. ' = '
			s = s .. serialize(v)
			s = s .. ",\n"
		end
		s = s .. "}"
	elseif type(o) == "boolean" then
		if o then
			s = s .. "true"
		else
			s = s .. "false"
		end
	else
		s = s .. " [" .. type(o) .. "]"
	end

	return s
end

xtra.serialize = serialize

function xtra.start_session()
	print(__FILE__() .. ':' .. __LINE__() .. " start session")
	cookie = env:getHeader("Cookie")

	if not cookie then
		local sessid = env:getHeader("X-XTRA-AUTH-ID")
		if not sessid then
			xtra.session_uuid = xtra.create_uuid()
		else
			xtra.session_uuid = sessid
		end
	else
		xtra.session_uuid = cookie:match("freeswitch_xtra_session_id=([^;]*).*$")
		-- print(xtra.session_uuid)
		if not xtra.session_uuid then
			xtra.session_uuid = xtra.create_uuid()
		end
	end

	xtra.cookies["freeswitch_xtra_session_id"] = xtra.session_uuid

	if config.auth == "hash" then
		api = freeswitch.API()
		xtra.session.user_id = api:execute("hash", "select/xui/" .. xtra.session_uuid)
		if (xtra.session.user_id == "") then
			xtra.session.user_id = nil
		end
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", xtra.session.user_id)
	else
		filename = config.session_path .. "/lua-session-" .. xtra.session_uuid
		conf = loadfile(filename)
		if conf then conf() end
	end
end

function xtra.save_session(k, v)
	if k then xtra.session[k] = v end

	if config.auth == "hash" and k == "user_id" then
		api = freeswitch.API()
		if (v) then
			api:execute("hash", "insert/xui/" .. xtra.session_uuid .. "/" .. v)
		else
			api:execute("hash", "delete/xui/" .. xtra.session_uuid)
		end
	else
		filename = config.session_path .. "/lua-session-" .. xtra.session_uuid
		file = io.open(filename, "w")
		file:write("xtra.session = " .. serialize(xtra.session))
		file:close()
	end
end

function xtra.flash(msg)
	xtra.save_session("flash_message", msg)
end

function connect_db(dsn, user, pass)
    dsn = dsn or config.dsn
    user = user or config.db_user
    pass = pass or config.db_pass

    -- dbh = freeswitch.Dbh(dsn .. ":" .. user .. ":" .. pass)
    dbh = freeswitch.Dbh(dsn)
    assert(dbh:connected())
    return dbh
end

(function()
	local t = csplit(xtra.http_uri, "/")
	table.remove(t, 1) -- remove ""
	table.remove(t, 1) -- remove "/rest/"
	-- print(table.concat(t, "/"))
	xtra.controller = table.remove(t, 1) -- remove "$controller"
	xtra.rest_path = "/" .. table.concat(t, "/")

	if not xtra.controller or xtra.controller == "" then
		xtra.controller = "index"
	end

	xtra.controller_path = xtra.controller

	if xtra.debug then
		xtra.log("INFO", "method=" .. xtra.method ..
			" xtra.controller=" .. xtra.controller ..
			" rest_path=" .. xtra.rest_path ..
			" controller_path=" .. xtra.controller_path .. "\n")
	end

	if config.db_auto_connect then xtra.dbh = connect_db() end
end)()
