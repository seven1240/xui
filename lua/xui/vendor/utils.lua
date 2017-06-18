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

utils = {}

function utils.isModuleAvailable(name)
	if package.loaded[name] then
		return true
	else
		for _, searcher in ipairs(package.searchers or package.loaders) do
			local loader = searcher(name)
			if type(loader) == 'function' then
				package.preload[name] = loader
				return true
			end
		end
		return false
	end
end

function init_json_func()
	if false and utils.isModuleAvailable("cjson") then
		local json = require("cjson")
		if json.encode_empty_table_as_object then
			json.encode_empty_table_as_object(false)
		end
		utils.json_encode = json.encode
		utils.json_decode = json.decode
	else
		local json = require("JSON")
		utils.json_encode = function(...) return json.encode(json, ...) end
		utils.json_decode = function(...) return json.decode(json, ...) end
	end
end

init_json_func()

function strjoin(list, delimiter, quote)
	d = ""
	string = ""

	if not delimiter then delimiter = "," end

	for k,v in pairs(list) do
		if quote then v = "'" .. v .. "'" end

		string = string .. d .. v
		d = delimiter
	end
	return string
end

-- Split text into a list consisting of the strings in text,
-- separated by strings matching delimiter (which may be a pattern).
-- example: strsplit(",%s*", "Anna, Bob, Charlie,Dolores")
function strsplit(delimiter, text)
  local list = {}
  local pos = 1
  if strfind("", delimiter, 1) then -- this would result in endless loops
    error("delimiter matches empty string!")
  end
  while 1 do
    local first, last = strfind(text, delimiter, pos)
    if first then -- found?
      tinsert(list, strsub(text, pos, first-1))
      pos = last+1
    else
      tinsert(list, strsub(text, pos))
      break
    end
  end
  return list
end

utils.apply_dnc = function(number, dnc)
	if not dnc then return end

	if dnc:sub(1,1) == '/' then -- regexp
		local api=freeswitch.API()
		return api:execute("regex", "m:/" .. number .. dnc)
	end

	if dnc:sub(1,1) == 'r' then
		local n = tonumber(dnc:sub(2,2))
		local r = dnc:sub(3)
		return r .. number:sub(n + 1)
	end

	if dnc:sub(1,1) == 'R' then
		local n = tonumber(dnc:sub(2,2))
		local r = dnc:sub(3)
		if number:len() < n then
			return r
		else
			return number:sub(1, number:len() - n) .. r
		end
	end

	dnc:gsub("([+-][^+-]+)", function(prefix)
		-- print(prefix)
		if prefix:sub(1,1) == '-' then
			prefix = prefix:sub(2)
			local pos = 2
			local s, e = string.find(number, prefix)
			if (s == 1) then
				pos = 1 + e
			end
			number = number:sub(pos)
		elseif prefix:sub(1,1) == '+' then
			number = prefix:sub(2) .. number
		end
	end)
	return number
end

function check_dir_exit(dir)
	-- body
	local file, err = io.open(dir, "r")
	
	if err then
		os.execute("mkdir -p " .. dir)
	end
end

utils.absname = function(filename, dir)
	if not dir then dir = config.upload_path end

	check_dir_exit(dir)

	return dir .. "/" .. filename
end

utils.tmpname = function(prefix, ext)
	if not prefix then prefix = '' end

	local api = freeswitch.API()
	local uuid = api:execute("create_uuid")
	filename = prefix .. os.date("%Y%m%d%H%M%S") .. "-" .. uuid
	if ext then
		filename = filename .. "." .. ext
	end
	return utils.absname(filename)
end

-- print table
utils.print_r = function(t)
    local print_r_cache={}
    local function sub_print_r(t,indent)
        if (print_r_cache[tostring(t)]) then
            print(indent.."*"..tostring(t))
        else
            print_r_cache[tostring(t)]=true
            if (type(t)=="table") then
                for pos,val in pairs(t) do
                    if (type(val)=="table") then
                        print(indent.."["..pos.."] => "..tostring(t).." {")
                        sub_print_r(val,indent..string.rep(" ",string.len(pos)+8))
                        print(indent..string.rep(" ",string.len(pos)+6).."}")
                    elseif (type(val)=="string") then
                        print(indent.."["..pos..'] => "'..val..'"')
                    else
                        print(indent.."["..pos.."] => "..tostring(val))
                    end
                end
            else
                print(indent..tostring(t))
            end
        end
    end
    if (type(t)=="table") then
        print(tostring(t).." {")
        sub_print_r(t,"  ")
        print("}")
    else
        sub_print_r(t,"  ")
    end
    print()
end

utils.log = function(level, msg)
	if not msg then msg = '' end
	freeswitch.consoleLog(level, msg);
end

utils.xlog = function(line, level, msg)
	if not msg then msg = '' end
	freeswitch.consoleLog(level, line .. ' ' .. msg .. '\n');
end

utils.xml = function(text)
	local doc = require("xmlSimple").newParser()
	xml = doc:ParseXmlText(req)
	xml = xml.xml
	xml.val = function(xml, key)
		v =  xml[key]:value()
		if (v:sub(1,9) == '<![CDATA[') then
			v = v:sub(10, -4)
			-- remove <![CDATA[]]>
		end
		return v
	end

	return xml
end

-- 判断utf8字符byte长度
-- 0xxxxxxx - 1 byte
-- 110yxxxx - 192, 2 byte
-- 1110yyyy - 225, 3 byte
-- 11110zzz - 240, 4 byte
local function chsize(char)
	if not char then
		print("not char")
		return 0
	elseif char > 240 then
		return 4
	elseif char > 225 then
		return 3
	elseif char > 192 then
		return 2
	else
		return 1
	end
end

function url_decode(str)
	str = string.gsub (str, "+", " ")
	str = string.gsub (str, "%%(%x%x)",
	function(h) return string.char(tonumber(h,16)) end)
	str = string.gsub (str, "\r\n", "\n")
	return str
end

function url_encode(str)
	if (str) then
		str = string.gsub (str, "\n", "\r\n")
		str = string.gsub (str, "([^%w %-%_%.%~])",
		function (c) return string.format ("%%%02X", string.byte(c)) end)
		str = string.gsub (str, " ", "+")
	end
	return str
end

utils.url_encode = url_encode
utils.url_decode = url_decode

-- 计算utf8字符串字符数, 各种字符都按一个字符计算
-- 例如utf8len("1你好") => 3
function utf8len(str)
	local len = 0
	local currentIndex = 1
	while currentIndex <= #str do
		local char = string.byte(str, currentIndex)
		currentIndex = currentIndex + chsize(char)
		len = len +1
	end
	return len
end

-- 截取utf8 字符串
-- str:			要截取的字符串
-- startChar:	开始字符下标,从1开始
-- numChars:	要截取的字符长度
function utf8sub(str, startChar, numChars)
	local startIndex = 1
	while startChar > 1 do
		local char = string.byte(str, startIndex)
		startIndex = startIndex + chsize(char)
		startChar = startChar - 1
	end

	local currentIndex = startIndex

	while numChars > 0 and currentIndex <= #str do
		local char = string.byte(str, currentIndex)
		currentIndex = currentIndex + chsize(char)
		numChars = numChars -1
	end
	return str:sub(startIndex, currentIndex - 1)
end

utils.utf8len = utf8len
utils.utf8sub = utf8sub


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

utils.serialize = serialize

-- input: ISO date string like 2017-06-18, output: ISO date string
-- diff: integer, days diff, can be negtive

utils.date_diff = function(d, diff)
	local y,m,d = d:match('(20[0-9][0-9])-([01][0-9])-([0-3][0-9])')
	local endTime = os.time({year = y, month = m, day = d}) + 24 * 60 * 60
	return os.date('%Y-%m-%d', endTime)
end

return utils
