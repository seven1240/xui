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
 * Liyang <liyang@x-y-t.cn>
 *
 *
 */
]]

xtra.start_session()
xtra.require_login()

content_type("application/json")
require 'xdb'
xdb.bind(xtra.dbh)

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
 * Liyang <liyang@x-y-t.cn>
 *
 *
 */
]]

xtra.start_session()
xtra.require_login()

content_type("application/json")
require 'xdb'
xdb.bind(xtra.dbh)

function remove_files(mcast_id, mfile_id)
	if mfile_id then
		local sql = "SELECT mf.original_file_name AS fname, mc.name AS mname, mc.sample_rate FROM mfile_mcasts mm"
					 .. " LEFT JOIN media_files mf ON mm.mfile_id = mf.id "
					 .. " LEFT JOIN mcasts mc ON mm.mcast_id = mc.id "
					 .. " WHERE mm.mcast_id = " .. mcast_id .. " AND mm.mfile_id = " .. mfile_id

		xdb.find_by_sql(sql, function(row)
			if row.mname and row.mname ~= "" then
				os.execute("rm " .. config.upload_path .. "/" .. row.mname .. "/" .. row.sample_rate .. "/" .. row.fname)
			end
		end)
	else
		xdb.find_by_cond("mcasts", {id = mcast_id}, nil, function(row)
			if row.name and row.name ~= "" then
				os.execute("rm -r " .. config.upload_path .. "/" .. row.name)
			end
		end)
	end
end

function add_files(mcast_id, mfile_id)
	local sql = "SELECT mf.original_file_name AS fname, mf.abs_path, mc.name AS mname, mc.sample_rate FROM mfile_mcasts mm " ..
				" LEFT JOIN media_files mf ON mm.mfile_id = mf.id " ..
				" LEFT JOIN mcasts mc ON mm.mcast_id = mc.id " ..
				" WHERE mm.mcast_id = " .. mcast_id .. " AND mm.mfile_id = " .. mfile_id

	xdb.find_by_sql(sql, function(row)
		if row.mname and row.mname ~= "" then
			local dir_path = config.upload_path .. "/" .. row.mname .. "/" .. row.sample_rate
			local file = io.open(dir_path, "r")
			if file then
				file:close()
			else
				os.execute("mkdir -p " .. dir_path)
			end
			os.execute("ln -sf " .. row.abs_path .. " " .. dir_path .. "/" .. row.fname)
		end
	end)
end

get('/:id/remain_files', function(params)
	sql = "SELECT * FROM media_files WHERE description = 'UPLOAD' AND mime LIKE 'audio/%' AND id NOT IN (SELECT mfile_id FROM mfile_mcasts WHERE mfile_id is not null AND mcast_id = " .. params.id .. ");"
	n, members = xdb.find_by_sql(sql)
	if n > 0 then
		return members
	else
		return '[]'
	end
end)

get('/:id', function(params)
	sql = "SELECT mf.* FROM mfile_mcasts mm LEFT JOIN media_files mf ON mm.mfile_id = mf.id WHERE mm.mcast_id = " .. params.id
	n, mfiles = xdb.find_by_sql(sql)
	if n > 0 then
		return mfiles
	else
		return '[]'
	end
end)

post('/', function(params)
	local req = params.request
	for k, v in pairs(req) do
		if type(v) == "table" then
			xdb.create('mfile_mcasts', v)
			add_files(v.mcast_id, v.mfile_id)
		end
	end

	return "{}"
end)

delete('/:mcast_id', function(params)
	remove_files(params.mcast_id)
	ret = xdb.delete("mfile_mcasts", {mcast_id=params.mcast_id});
	if ret >= 0 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

delete('/:mcast_id/:mfile_id', function(params)
	remove_files(params.mcast_id, params.mfile_id)
	ret = xdb.delete("mfile_mcasts", {mcast_id=params.mcast_id, mfile_id=params.mfile_id});
	if ret == 1 then
		return 200, "{}"
	else
		return 500, "{}"
	end
end)
