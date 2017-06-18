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

-- require 'xtra_config'

print(utils.serialize(config))

XML_STRING = [[<configuration name="odbc_cdr.conf" description="ODBC CDR Configuration">
  <settings>
    <param name="odbc-dsn" value="]] .. (config.odbc_dsn or config.dsn) .. [["/>
	<!-- global value can be "a-leg", "b-leg", "both" (default is "both") -->
	<param name="log-leg" value="a-leg"/>
    <!-- value can be "always", "never", "on-db-fail" -->
    <param name="write-csv" value="on-db-fail"/>
	<!-- location to store csv copy of CDR -->
    <param name="csv-path" value="/usr/local/freeswitch/log/odbc_cdr"/>
    <!-- if "csv-path-on-fail" is set, failed INSERTs will be placed here as CSV files otherwise they will be placed in "csv-path" -->
    <param name="csv-path-on-fail" value="/usr/local/freeswitch/log/odbc_cdr/failed"/>
    <!-- dump SQL statement after leg ends -->
	<param name="debug-sql" value="true"/>
  </settings>
  <tables>
    <table name="cdrs" log-leg="a-leg">
      <field name="caller_id_name" chan-var-name="caller_id_name"/>
      <field name="caller_id_number" chan-var-name="caller_id_number"/>
      <field name="destination_number" chan-var-name="destination_number"/>
      <field name="context" chan-var-name="context"/>
      <field name="start_stamp" chan-var-name="start_stamp"/>
      <field name="answer_stamp" chan-var-name="answer_stamp"/>
      <field name="end_stamp" chan-var-name="end_stamp"/>
      <field name="duration" chan-var-name="duration"/>
      <field name="billsec" chan-var-name="billsec"/>
      <field name="hangup_cause" chan-var-name="hangup_cause"/>
      <field name="uuid" chan-var-name="uuid"/>
      <field name="bleg_uuid" chan-var-name="bleg_uuid"/>
      <field name="account_code" chan-var-name="accountcode"/>
      <field name="sip_hangup_disposition" chan-var-name="sip_hangup_disposition"/>
      <field name="network_addr" chan-var-name="network_addr"/>
      <field name="network_port" chan-var-name="sip_network_port"/>
    </table>
  </tables>
</configuration>]]
