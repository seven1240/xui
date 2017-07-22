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

	n, lines = xdb.find_all("line", "line_code")

	if (n > 0) then
		return lines
	else
		return "[]"
	end
end)

get('/lines/:code/stations', function(params)
	start = env:getHeader("start")
	stop = env:getHeader("stop")
	direction = env:getHeader("direction") or '下行'
	max_order = 1
	min_order = 1
	desc_or_asc = 'desc'

	print(start)
	print(stop)

	if start and stop then
		station1 = xdb.find_one("station", {line_code = params.code, stat_name = start})
		station2 = xdb.find_one("station", {line_code = params.code, stat_name = stop})

		if station1.station_order - station2.station_order > 0 then
			direction = '上行'
			max_order = station1.station_order
			min_order = station2.station_order
			desc_or_asc = 'desc'
		else
			direction = '下行'
			max_order = station2.station_order
			min_order = station1.station_order
			desc_or_asc = 'asc'
		end
	end

	-- n, stations = xdb.find_by_cond("station", {line_code = params.code, up_down_name = direction} , 'station_order')
	sql = [[select *, (station_order<=]] .. max_order .. [[ and station_order>=]] .. min_order ..[[) as show]]
		.. [[ from station where line_code=]] .. params.code .. [[ and up_down_name = ']] .. direction .. [[']]
		.. [[ order by station_order ]] .. desc_or_asc
	print(sql)
	n, stations = xdb.find_by_sql(sql)

	if (n > 0) then
		return stations
	else
		return "[]"
	end
end)

get('/lines/:code/buses', function(params)
	sql = "SELECT * FROM traffic " ..
		"WHERE bus_line_id = " .. xdb.escape(params.code) ..
		"AND time > now() - interval '3 hours'"

	n, rows = xdb.find_by_sql(sql)

	if n > 0 then
		return rows
	else
		return '[]'
	end
end)

post('/traffic', function(params)
	local line_id = params.request.line
	-- local sql = "SELECT bus_id, prev_station_id, longitude, latitude, bus_status, speed FROM traffic WHERE bus_line_id = " ..line_id .. " and prev_station_id != 0 and time > now() - interval '30 minutes'"
	local sql = "SELECT bus_id, prev_station_id, longitude, latitude, bus_status, speed FROM traffic WHERE bus_id IN (SELECT MIN(bus_id) FROM traffic WHERE bus_line_id = " .. line_id .. " AND prev_station_id != 0 AND time > now() - interval '30 minutes' GROUP BY prev_station_id,bus_status)"
	n, rows = xdb.find_by_sql(sql)
	if n > 0 then
		return rows
	else
		return '[]'
	end
end)

post('/traffic/self', function(params)
	local line_id = params.request.line
	local xpoint = params.request.xpoint
	local ypoint = params.request.ypoint
	local sql = "SELECT station_order FROM station WHERE line_code = " .. line_id .. " ORDER BY ABS(baidu_x-" .. xpoint .. ")+ABS(baidu_y-" .. ypoint .. ") LIMIT 1"
	n, rows = xdb.find_by_sql(sql)
	if n > 0 then
		return rows
	else
		return '[]'
	end
end)

get('/station/lines', function(params)
	station_name = env:getHeader('name')

	sql = "SELECT DISTINCT line.line_code, start_station, stop_station, up_down_name " ..
		"FROM line, station " ..
		"WHERE stat_name = " .. xdb.escape(station_name) ..
		" AND station.line_code = line.line_code"

	n, rows = xdb.find_by_sql(sql)

	if n > 0 then
		return rows
	else
		return '[]'
	end
end)

get('/nearby_stations', function(params)
	r = env:getHeader('r') or '500'
	longitude = env:getHeader('longitude') or '120.395603'
	latitude = env:getHeader('latitude') or '37.325945'

	sql =  "SELECT * FROM station " ..
		"WHERE earth_box(ll_to_earth(" .. longitude .. ", " .. latitude .. "), " .. r .. ") @> ll_to_earth(stat_longitude, stat_latitude)"

	n, rows = xdb.find_by_sql(sql)

	if n > 0 then
		return rows
	else
		return '[]'
	end
end)

get('/station', function(params)
	station = env:getHeader('station')
	sql = ''
	if station then
		sql = [[select distinct stat_name from station where stat_name like '%]] .. url_decode(station) .. [[%'
		]]
	else
		sql = [[select distinct stat_name from station]]
	end
	n, res = xdb.find_by_sql(sql)
	return res
end)

get('/same_station', function(params)
	station = env:getHeader('station')
	sql = ''
	if station then
		sql = [[select distinct stat_name, baidu_x, baidu_y from station where stat_name = ']] .. url_decode(station) ..
		[[' and id in (select min(id) from station group by stat_name)]]
	else
		sql = [[select distinct stat_name, baidu_x, baidu_y from station where id in (select min(id) from station group by stat_name)]]
	end
	n, res = xdb.find_by_sql(sql)
	return res
end)

get('/points', function(params)
	lines = env:getHeader('lines')
	all_lines = env:getHeader('all_lines')
	stat_names = env:getHeader('stat_names')
	print(lines)
	print(all_lines)
	print(stat_names)
	-- if lines == 1 then
	-- elseif lines == 2 then
	-- elseif line == 3 then
	-- end
	l1 = 0
	l2 = 0
	l3 = 0
	n1 = ''
	n2 = ''
	n3 = ''
	n4 = ''
	sql = ''
	if lines == '1' or lines == 1 then
		string.gsub(all_lines, '\'(.*)-(.*)\'', function(a)
			l1=a
		end)
		string.gsub(stat_names, '\'(.*)-(.*)-(.*)\'' , function(a, b)
			n1=a
			n2=b
		end)
		sql = [[select baidu_x, baidu_y from points(]] .. l1 .. [[, ']] .. n1 .. [[', ']] .. n2 .. [[')]]
		print(sql);
	elseif lines == '2' or lines == 2 then
		string.gsub(all_lines, '\'(.*)-(.*)\'', function(a, b)
			l1=a
			l2=b
		end)
		print(l1)
		print(l2)
		string.gsub(stat_names, '\'(.*)-(.*)-(.*)\'' , function(a, b, c)
			n1=a
			n2=b
			n3=c
		end)
		print(n1)
		print(n2)
		print(n3)
		sql = [[select * from (select points(]] .. l1 .. [[, ']] .. n1 .. [[', ']] .. n2 .. [[')) as a]]
			.. [[ union all ]] ..
			[[select * from (select points(]] .. l2 .. [[, ']] .. n2 .. [[', ']] .. n3 .. [[')) as b]]
		print(sql);
	elseif lines == '3' or lines == 3 then
		string.gsub(all_lines, '\'(.*)-(.*)-(.*)\'', function(a, b, c)
			l1=a
			l2=b
			l3=c
		end)
		print(l1)
		print(l2)
		string.gsub(stat_names, '\'(.*)-(.*)-(.*)-(.*)\'' , function(a, b, c, d)
			n1=a
			n2=b
			n3=c
			n4=d
		end)
		sql = [[select * from (select points(]] .. l1 .. [[, ']] .. n1 .. [[', ']] .. n2 .. [[')) as a]]
			.. [[ union all ]] ..
			[[select * from (select points(]] .. l2 .. [[, ']] .. n2 .. [[', ']] .. n3 .. [[')) as b]]
			.. [[ union all ]] ..
			[[select * from (select points(]] .. l3 .. [[, ']] .. n3 .. [[', ']] .. n4 .. [[')) as c]]
		print(sql);
	end
	n, res = xdb.find_by_sql(sql)
	return {station=res}
end)

function add_id(obj)
	ret = obj
	for i, v in pairs(obj) do  
		ret[i].id=i
	end
	return ret
end

get('/interchange', function(params)
	start = env:getHeader('start')
	stop = env:getHeader('stop')

	start = '市政'
	stop = '公安局'

-- start
-----o------------------o-----  line1
--			            stop
	sql = [[select 1 as lines, a.line_code as line1, a.line_code as all_lines, abs(a.station_order - b.station_order) as offs, abs(a.station_order - b.station_order) as off1
	, (']] .. start .. [['||'-'||']] .. stop .. [[') as stat_names from
		(select line_code,station_order from station where stat_name=']] .. start .. [[' and up_down_name='上行' ) as a,
		(select line_code, station_order from station where stat_name=']] .. stop .. [[' and up_down_name='上行') as b
		where a.line_code=b.line_code]]
	n, res = xdb.find_by_sql(sql)
	-- utils.print_r(res)
	if n > 0 then
		return add_id(res)
	end
-- start       |
-----o---------x--------------  line1
--			   |         stop
--             |--------o-----  line2
	sql = [[select 2 as lines, * from
		(select a.line_code as line1, b.line_code as line2, a.stat_name as stat_name1, a.number as off1, b.number as off2,(a.number+b.number) as offs, (a.line_code||'-'||b.line_code) as all_lines
		, (']] .. start .. [['||'-'||a.stat_name||'-'||']] .. stop .. [[') as stat_names from
		(select a1.line_code as line_code, a1.stat_name as stat_name, abs(a1.station_order - a2.station_order) as number from (select line_code, stat_name, station_order from station where up_down_name='上行')as a1 inner join (select line_code, station_order from station where stat_name=']] .. start .. [[' and up_down_name='上行') as a2 on a1.line_code=a2.line_code) as a
		inner join
		(select a1.line_code as line_code, a1.stat_name as stat_name, abs(a1.station_order - a2.station_order) as number from (select line_code, stat_name, station_order from station where up_down_name='上行')as a1 inner join (select line_code, station_order from station where stat_name=']] .. stop .. [[' and up_down_name='上行') as a2 on a1.line_code=a2.line_code) as b
		on a.stat_name=b.stat_name and a.line_code!=b.line_code) as c
		order by c.all_lines,c.offs]]
	n, res = xdb.find_by_sql(sql)
	if n > 0 then
		return add_id(res)
	else
		-- not found, keep going, find a 3rd line that has interchange stations
-- start       |
-----o---------x--------------  line1
--			   |         stop
---------------x--------o-----  line2
--             |
--             \--------------  line3
		sql = [[select 3 as lines, a.line_code as line1, b.line_code as line2, d.line_code as line3, a.number as off1
		, abs(b.station_order - c.station_order) as off2, d.number as off3, b.stat_name as stat_name1, c.stat_name as stat_name2, (a.number + abs(b.station_order - c.station_order) + d.number) as offs, (a.line_code||'-'||b.line_code||'-'||d.line_code) as all_lines
		, (']] .. start .. [['||'-'||b.stat_name||'-'||c.stat_name||'-'||']] .. stop .. [[') as stat_names from
			(select a1.line_code as line_code, a1.stat_name as stat_name, abs(a1.station_order - a2.station_order) as number from (select line_code, stat_name, station_order from station where up_down_name='上行')as a1 inner join (select line_code, station_order from station where stat_name=']] .. start .. [[' and up_down_name='上行') as a2 on a1.line_code=a2.line_code
			) as a
			inner join
			(
				select line_code, stat_name, station_order from station where up_down_name='上行'
			) as b on a.stat_name=b.stat_name and a.line_code!=b.line_code
			inner join
			(
				select line_code, stat_name, station_order from station where up_down_name='上行'
			) as c on b.line_code=c.line_code
			inner join
			(
			select d1.line_code as line_code, d1.stat_name as stat_name, abs(d1.station_order - d2.station_order) as number from (select line_code, stat_name, station_order from station where up_down_name='上行')as d1 inner join (select line_code, station_order from station where stat_name=']] .. stop .. [[' and up_down_name='上行') as d2 on d1.line_code=d2.line_code
			) as d on c.stat_name=d.stat_name and c.line_code!=d.line_code]]
		n, res = xdb.find_by_sql(sql)
		-- utils.print_r(res)
		if n > 0 then
			return add_id(res)
		else
			return "[]"
		end
	end
end)
