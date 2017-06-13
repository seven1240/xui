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
content_type("application/json")
require 'xdb'
xdb.bind(xtra.dbh)

post('/', function(params)
	print(serialize(params))
	params = params.request
	freeswitch.consoleLog("err", params.address)

	local filename = "/etc/network/interfaces"
	local change = "auto lo" .. "\n" ..
		"iface lo inet loopback" .. "\n" ..
		"auto eth0" .. "\n" .. 
		"iface eth0 inet static" .. "\n" ..
		"address " .. params.address .. "\n" ..  
		"netmask " .. params.netmask ..  "\n" .. 
		"gateway " .. params.gateway .. "\n" 

	local f = assert(io.open(filename, 'w'), "open file error")
	f:write(change)
	f:close()
	
	os.execute("ifconfig eth0 " .. params.address .. " netmask "  .. params.netmask .. " gateway " .. params.gateway)
	
	rec = {}
	rec.v = params.address
	xdb.update_by_cond('params', {k = 'sip-ip'}, rec)
	xdb.update_by_cond('params', {k = 'rtp-ip'}, rec)

	--os.execute("ifup eth0")
	os.execute("freeswitch -stop")

	return 200

end)
