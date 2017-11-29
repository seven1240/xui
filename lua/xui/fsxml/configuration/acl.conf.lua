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

function build_lists(acl)
	local acls = ""
	local cond = {acl_id = acl.id}

	xdb.find_by_cond("acl_nodes", cond , id, function(row)
		if row.node_type == "domain" then
			acls = acls .. [[<node type="]] .. row.k ..
				[[" domain="]] .. row.v ..
				[["/>]]
		else
			acls = acls .. [[<node type="]] .. row.k ..
			[[" cidr="]] .. row.v ..
			[["/>]]
		end
	end)

	return acls
end

function build()
	acl_nodes = ""

	xdb.find_all("acls", 'id', function(row)
		acl_nodes = acl_nodes .. [[<list name="]] .. row.name .. [[" default="]] .. row.status .. [[">]] .. build_lists(row) .. '</list>\n'
	end)
	
	return acl_nodes
end



XML_STRING=[[
<configuration name="acl.conf" description="Network Lists">
<network-lists>]] ..
	build() ..
[[</network-lists></configuration>
]]
