local api = freeswitch.API()

local confname = argv[1]
local confname2 = argv[2]

ret = api:execute("conference", "list")

local function csplit(str, sep)
	local ret={}
	local n=1
	for w in str:gmatch("([^"..sep.."]*)") do
		ret[n]=ret[n] or w -- only set once (so the blank after a string is ignored)
		if w=="" then n=n+1 end -- step forwards on a blank but not a string
	end
	return ret
end

local lines = csplit(ret, "\n")
lines[1] = nil
members = ""

for k, v in pairs(lines) do
	fields = csplit(v, ";")
	members = members .. " " .. fields[1]
end

print(members)
args = confname .. " transfer " .. confname2 .. members
print(args)
ret = api:execute("conference", args)
print(ret)
