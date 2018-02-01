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
xtra.require_login()

content_type("application/json")

require 'xdb'
require 'm_user'
xdb.bind(xtra.dbh)

-- freeswitch.consoleLog("INFO", xtra.session.user_id .. "\n")

get('/', function(params)

	startDate = env:getHeader('startDate')
	startbillsec = env:getHeader('startbillsec')
	endbillsec = env:getHeader('endbillsec')
	last = tonumber(env:getHeader('last'))
	pageNum = tonumber(env:getHeader('pageNum'))
	cdrsRowsPerPage = tonumber(env:getHeader('cdrsRowsPerPage'))

	local cdrs = {}
	local rowCount = 0

	cdrs.pageCount = 0
	cdrs.rowCount = 0
	cdrs.curPage = 0
	cdrs.data = {}

	pageNum = tonumber(pageNum)
	cdrsRowsPerPage = tonumber(cdrsRowsPerPage)

	if not pageNum or pageNum < 0 then
		pageNum = 1
	end

	if not cdrsRowsPerPage then
		cdrsRowsPerPage = 1000
	end

	if m_user.has_permission() then
		realm = nil
	else
		login_user = xdb.find("users", xtra.session.user_id)
		if next(login_user) then
			if m_user.is_conf_man() then
				realm = login_user.domain
			else
				realm = login_user.domain
				account_code = login_user.extn
			end
		else
			return cdrs
		end
	end


	if not startDate then
		if not last then last = 7 end

		local sdate = os.time() - last * 24 * 60 * 60
		startDate = os.date('%Y-%m-%d', sdate)
		cond = " start_stamp > '" .. startDate .. "'" ..
			xdb.if_cond("realm", realm) ..
			xdb.if_cond("account_code", account_code)
	else

		local endDate = env:getHeader('endDate')
		local cidNumber = env:getHeader('cidNumber')
		local destNumber = env:getHeader('destNumber')
		endDate = utils.date_diff(endDate, 1)

		if not (startbillsec == nil or startbillsec == '') then
			startbillsec = tostring(startbillsec * 60)
			endbillsec = tostring(endbillsec * 60)

			cond = xdb.date_cond("start_stamp", startDate, endDate) .. " and " ..
						xdb.date_cond("billsec", startbillsec, endbillsec) ..
						xdb.if_cond("caller_id_number", cidNumber) ..
						xdb.if_cond("destination_number", destNumber) ..
						xdb.if_cond("realm", realm) ..
						xdb.if_cond("account_code", account_code)
		else
			cond = xdb.date_cond("start_stamp", startDate, endDate) ..
						xdb.if_cond("caller_id_number", cidNumber) ..
						xdb.if_cond("destination_number", destNumber) ..
						xdb.if_cond("realm", realm) ..
						xdb.if_cond("account_code", account_code)
		end

		if cond then
			utils.log("DEBUG", "cdrs query cond:" .. cond .. "\n")
		end

	end

	local cb = function(row)
		rowCount = tonumber(row.count)
	end

	xdb.find_by_sql("SELECT count(1) as count FROM cdrs WHERE " .. cond, cb)

	if rowCount > 0 then
		local offset = 0
		local pageCount = 0

		pageCount = math.ceil(rowCount / cdrsRowsPerPage);

		if pageNum == 0 then
			-- It means the last page
			pageNum = pageCount
		end

		offset = (pageNum - 1) * cdrsRowsPerPage

		local found, cdrsData = xdb.find_by_cond("cdrs", cond, "start_stamp, billsec DESC", nil, cdrsRowsPerPage, offset)

		if (found > 0) then
			cdrs.rowCount = rowCount
			cdrs.data = cdrsData
			cdrs.curPage = pageNum
			cdrs.pageCount = pageCount
		end
	end

	return cdrs

end)

get('/:uuid', function(params)
	n, cdrs = xdb.find_by_cond("cdrs", {uuid = params.uuid}, "start_stamp", nil, 1)

	if n > 0 then
		return cdrs[1]
	else
		return 404
	end
end)
