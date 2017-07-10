alter table line add start_station varchar;
alter table line add stop_station varchar;

update line set start_station = (select stat_name from station where line_code = line.line_code and station_order = 1 limit 1);
update line set stop_station = (select stat_name from station where line_code = line.line_code and station_order = (select max(station_order) from station where line_code = line.line_code) limit 1);

CREATE EXTENSION cube;
CREATE EXTENSION earthdistance;
