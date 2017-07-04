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

xtra.start_session()
content_type("application/json;charset=UTF-8")

require 'xdb'
xdb.bind(xtra.dbh)

get('/lines', function(params)
	n, lines = xdb.find_all("line", nil, line_code)

	if (n > 0) then
		return lines
	else
		return "[]"
	end
end)

get('/interchange', function(params)
	start = '市政'
	stop = '公安局'

	line1 = xdb.find_one("station", {stat_name = start})
	line2 = xdb.find_one("station", {stat_name = stop})

	sql = [[SELECT DISTINCT a.stat_name,
		a.line_code AS line1,
		b.line_code AS line2,
		abs(a.station_order - ]] .. line1.station_order .. [[) AS aoff,
		abs(b.station_order - ]] .. line2.station_order .. [[) AS boff
		FROM station a, station b
		WHERE a.line_code = ]] .. line1.line_code .. [[
			AND b.line_code = ]] .. line2.line_code .. [[
			AND a.stat_name = b.stat_name
		ORDER BY aoff]]

	n, res = xdb.find_by_sql(sql)

	return res
end)

get('/test', function(params)

	sql = "select distinct a.station_order, a.stat_name from station a, station b where a.line_code = 6 and b.line_code = 9 and a.stat_name = b.stat_name order by a.station_order"

	n, res = xdb.find_by_sql(sql)

	return res
end)
