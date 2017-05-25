XML_STRING=[[
<configuration name="cdr_sqlite.conf" description="SQLite CDR">
	<settings>
		<param name="db-name" value="xui"/>
		<param name="db-table" value="cdrs"/>
		<param name="legs" value="a"/>
		<param name="default-template" value="example"/>
		<!--<param name="debug" value="true"/>-->
	</settings>
	<templates>
		<!-- Note that field order must match SQL table schema, otherwise insert will fail -->
		<template name="example">"${caller_id_name}","${caller_id_number}","${destination_number}","${context}","${start_stamp}","${answer_stamp}","${end_stamp}",${duration},${billsec},"${hangup_cause}","${uuid}","${bleg_uuid}","${accountcode}","${sip_hangup_disposition}"</template>
	</templates>
</configuration>
]]
