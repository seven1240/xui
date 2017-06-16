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

XML_STRING = [[<configuration name="abstraction.conf" description="Abstraction">
  <apis>
    <api name="user_name" description="Return Name for extension" syntax="<exten>" parse="(.*)" destination="user_data" argument="$1@default var effective_caller_id_name"/>
    <api name="sip" description="Sofia" syntax="<exten>" parse="(.*)" destination="sofia" argument="$1"/>
    <api name="select" description="" syntax="select" parse="(.*)" destination="lua" argument="xui/db.lua select $1"/>
    <api name="ifconfig" description="" syntax="select" parse="(.*)" destination="system" argument="ifconfig $1"/>
  </apis>
</configuration>]]
