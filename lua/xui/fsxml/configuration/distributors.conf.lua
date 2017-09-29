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

function build_lists(distributor)
	local distributor_nodes = ""
	local cond = {distributor_id = distributor.id}

	xdb.find_by_cond("distribute_nodes", cond , id, function(row)
		distributor_nodes = distributor_nodes .. [[<node name="]] .. row.k ..
			[[" weight="]] .. row.v ..
			[["/>]]
	end)

	return distributor_nodes
end

function build()
	local distributors = [[<list name="test">
      <node name="foo1" weight="1"/>
      <node name="foo2" weight="9"/>]]

	xdb.find_all("distributors", 'id', function(row)
		distributors = distributors .. [[</list><list name="]] .. row.name .. [[" total-weight="]] .. row.total_weight .. [[">]] .. build_lists(row) .. '</list>\n'
	end)

	return distributors
end



XML_STRING=[[
<configuration name="distributor.conf" description="Distributor Configuration">
<lists>]] ..
	build() ..
[[</lists></configuration>
]]
