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

-- start       |
-----o---------x--------------  line1
--			   |         stop
--             |--------o-----  line2


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

	if n > 0 then
		return res
	else
		-- not found, keep going, find a 3rd line that has interchange stations

-- start       |
-----o---------x--------------  line1
--			   |         stop
---------------x--------o-----  line2
--             |
--             \--------------  line3

		line1 = {line_code = '1'}
		line2 = {line_code = '2'}

		range = " ('" .. line1.line_code .. "', '" .. line2.line_code .. "') "

		sql = [[SELECT DISTINCT line_code
			FROM station
			WHERE line_code NOT IN ]] .. range .. [[
			AND stat_name IN (SELECT stat_name FROM station WHERE line_code IN ]] .. range .. ")"

		freeswitch.consoleLog("info", sql)

		n, line = xdb.find_by_sql(sql)

		freeswitch.consoleLog("info", utils.serialize(line))

		if n > 0 then
			line = line[1]
		end

		if line then -- found a 3rd line
			sql1 = [[SELECT DISTINCT stat_name
				FROM station
				WHERE line_code = ]] .. line1.line_code .. [[
				AND stat_name IN (SELECT stat_name FROM station WHERE line_code = ]] .. line.line_code .. ')'

			sql2 = [[SELECT DISTINCT stat_name
				FROM station
				WHERE line_code = ]] .. line2.line_code .. [[
				AND stat_name IN (SELECT stat_name FROM station WHERE line_code = ]] .. line.line_code .. ')'


			n1, res1 = xdb.find_by_sql(sql1)
			n2, res2 = xdb.find_by_sql(sql2)

			if n1 > 0 and n2 > 0 then
				return {0, res1, res2}
			end
		else
			return "[]"
		end
	end
end)

get('/test', function(params)

	sql = "select distinct a.station_order, a.stat_name from station a, station b where a.line_code = 6 and b.line_code = 9 and a.stat_name = b.stat_name order by a.station_order"

	n, res = xdb.find_by_sql(sql)

	return res
end)
