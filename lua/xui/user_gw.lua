--[[
	Call a group of gateways registered like users
	Hunt a user by mod_distributor
	Filter out unregistered users
	Works both in Dialplan and in API

	Usage: user_gw_group.lua <list_name> <dest_number>

	In dialplan:
		bridge ${user_gw_group.lua(listname ${destination_number})}
		lua user_gw_group.lua listname ${destination_number}
]]

api = freeswitch.API()

i = 10
found = 0

while (i > 0) do
	user = api:execute("distributor", argv[1])
	contact = api:execute("sofia_contact", user)

	if not contact == "error/user_not_registered" then
		found = 1
		break
	end

	i = i - 1
end

if found then
	new_contact = contact:gsub("^(.+)sip:(.+)@(.+)", "%1sip:" .. argv[2] .. "@%3")

	if session then
		session:execute("bridge", new_contact)
	else
		stream:write(new_contact)
	end
else
	if not session then
		stream:write(contact)
	end
end
