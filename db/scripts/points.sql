create or replace function points(l_code bigint, stat_name1 varchar, stat_name2 varchar) returns setof holder as
$body$
DECLARE
	order1 bigint;
	order2 bigint;
	result holder%rowtype;
BEGIN
	 select station_order into order1 from station where stat_name=stat_name1 and line_code=l_code;
	 select station_order into order2 from station where stat_name=stat_name2 and line_code=l_code;

	 if order1>order2 then
		for result in select baidu_x,baidu_y from station where station_order>=order2 and station_order<=order1 and line_code=l_code and up_down_name='上行' order by station_order desc loop
			return next result;
		end loop;
	 else
		for result in select baidu_x,baidu_y from station where station_order>=order1 and station_order<=order2 and line_code=l_code and up_down_name='上行' order by station_order asc loop
			return next result;
		end loop;
	 end if;

	 return;
END
$body$
LANGUAGE 'plpgsql' VOLATILE;
