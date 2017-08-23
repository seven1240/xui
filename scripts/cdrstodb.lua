#!/usr/bin/lua
local pgsql = require 'pgsql'
if #arg > 1 then
local param = arg[1]

local filename = arg[2]

local conn = pgsql.connectdb(param)

if conn:status()  == pgsql.CONNECTION_OK then

        print('connection is ok')
        local file,err = io.open(filename, "r")
        if file and not err then


				local data = file:read("*a")

				io.close(file)

				data = (string.gsub(data,'name',"confname"))

				local doc = require("xmlSimple").newParser()

				xml = doc:ParseXmlText(data)

				

				local   pos = string.find(xml.cdr.conference.confname:value(),"-")
				local   conference_number = string.sub(xml.cdr.conference.confname:value(),0,pos-1)
				local   conference_name =  xml.cdr.conference.confname:value()
				local   conference_start_time =  xml.cdr.conference.start_time:value()
				local   conference_end_time   = xml.cdr.conference.end_time:value()
				local   conference_hostname    = xml.cdr.conference.hostconfname:value()
				local   conference_rate = xml.cdr.conference.rate:value()
				local   conference_interval =xml.cdr.conference.interval:value()

				print(conference_number)
				print(conference_name)
				print(conference_start_time)
				print(conference_end_time)
				print(conference_hostname)
				print(conference_rate)
				print(conference_interval)

				local membernum = xml.cdr.conference.members:numChildren()


				local res1 = conn:execParams('insert into conference_infos(conference_number ,conference_name ,conference_start_time , conference_end_time   , conference_hostname   , conference_rate , conference_interval ) values ($1,$2,$3::timestamp,$4::timestamp,$5,$6,$7)', conference_number,conference_name,os.date("!%c",conference_start_time),os.date("!%c",conference_end_time),conference_hostname,conference_rate,conference_interval
				)

				local res2 = conn:exec('select Max(conferenceid) from conference_infos')
				local maxid = res2:getvalue(1,1)
				for i=1, membernum,1 do



				local   member_join_time                =                  xml.cdr.conference.members.member[i].join_time:value()
				local   member_leave_time               =                  xml.cdr.conference.members.member[i].leave_time:value()
				local   member_is_moderator             =                  xml.cdr.conference.members.member[i].flags.is_moderator:value()
				local   member_end_conference           =                  xml.cdr.conference.members.member[i].flags.end_conference:value()
				local   member_was_kicked               =                  xml.cdr.conference.members.member[i].flags.was_kicked:value()
				local   member_is_ghost                 =                  xml.cdr.conference.members.member[i].flags.is_ghost:value()
				local   member_username                 =                  xml.cdr.conference.members.member[i].caller_profile.userconfname:value()
				local   member_dialplan                 =                  xml.cdr.conference.members.member[i].caller_profile.dialplan:value()
				local   member_caller_id_name           =                  xml.cdr.conference.members.member[i].caller_profile.caller_id_confname:value()
				local   member_caller_id_number         =                  xml.cdr.conference.members.member[i].caller_profile.caller_id_number:value()
				local   member_callee_id_name           =                  xml.cdr.conference.members.member[i].caller_profile.callee_id_confname:value()
				local   member_callee_id_number         =                  xml.cdr.conference.members.member[i].caller_profile.callee_id_number:value()
				local   member_ani                      =                  xml.cdr.conference.members.member[i].caller_profile.ani:value()
				local   member_aniii                    =                  xml.cdr.conference.members.member[i].caller_profile.aniii:value()
				local   member_network_addr             =                  xml.cdr.conference.members.member[i].caller_profile.network_addr:value()
				local   member_rdnis                    =                  xml.cdr.conference.members.member[i].caller_profile.rdnis:value()
				local   member_destination_number       =                  xml.cdr.conference.members.member[i].caller_profile.destination_number:value()
				local   member_uuid                     =                  xml.cdr.conference.members.member[i].caller_profile.uuid:value()
				local   member_source                   =                  xml.cdr.conference.members.member[i].caller_profile.source:value()
				local   member_context                  =                  xml.cdr.conference.members.member[i].caller_profile.context:value()
				local   member_chan_name                =                  xml.cdr.conference.members.member[i].caller_profile.chan_confname:value()

				local res2 = conn:execParams('insert into conference_cdrs(conferenceid, member_join_time , member_leave_time ,  member_is_moderator , member_end_conference , member_was_kicked , member_is_ghost , member_username , member_dialplan , member_caller_id_name ,member_caller_id_number,member_callee_id_name , member_callee_id_number,member_ani  ,member_aniii ,member_network_addr ,member_rdnis , member_destination_number ,     member_uuid ,  member_source , member_context , member_chan_name) values ($1::integer,$2::timestamp,$3::timestamp,$4::boolean,$5::boolean,$6::boolean,$7::boolean,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)', maxid,os.date("!%c",member_join_time)      ,    os.date("!%c",member_leave_time)         ,member_is_moderator       ,member_end_conference     ,member_was_kicked         ,member_is_ghost           ,member_username           ,member_dialplan           ,member_caller_id_name     ,member_caller_id_number   ,member_callee_id_name     ,member_callee_id_number   ,member_ani                ,member_aniii              ,member_network_addr       ,member_rdnis              ,member_destination_number ,member_uuid               ,member_source             ,member_context            ,member_chan_name          
				)


				end






				print(conn:errorMessage())

				conn:finish()
		else
			print(err)
		end


else

        print('connection is not ok')

        print(conn:errorMessage())

end


else
	print("please input dbsql and filename")
end


