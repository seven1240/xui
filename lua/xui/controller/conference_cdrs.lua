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
xdb.bind(xtra.dbh)

get('/', function(params)
	startDate = env:getHeader('startDate')
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

	if not startDate then
		if not last then last = 7 end

		local sdate = os.time() - last * 24 * 60 * 60
		startDate = os.date('%Y-%m-%d', sdate)
		cond = " started_at > '" .. startDate .. "'"
	else
		local endDate = env:getHeader('endDate')
		local cidNumber = env:getHeader('cidNumber')
		local destNumber = env:getHeader('destNumber')

		-- endDate + 1 day so we never missing records in the current day
		endDate = utils.date_diff(endDate, 1)

		cond = xdb.date_cond("started_at", startDate, endDate) ..
					xdb.if_cond("caller_id_number", cidNumber) ..
					xdb.if_cond("destination_number", destNumber)
	end

	local rowCount = xdb.count("conference_cdrs", cond)

	if rowCount > 0 then
		local offset = 0
		local pageCount = 0

		pageCount = math.ceil(rowCount / cdrsRowsPerPage);

		if pageNum == 0 then
			-- It means the last page
			pageNum = pageCount
		end

		offset = (pageNum - 1) * cdrsRowsPerPage

		local found, cdrsData = xdb.find_by_cond("conference_cdrs", cond, "started_at DESC", nil, cdrsRowsPerPage, offset)

		if (found > 0) then
			cdrs.rowCount = rowCount
			cdrs.data = cdrsData
			cdrs.curPage = pageNum
			cdrs.pageCount = pageCount
		end
	end

	return cdrs

end)

get('/:id', function(params)
	cdr = xdb.find("conference_cdrs", params.id)

	if cdr then
		return cdr
	else
		return 404
	end
end)

get('/:id/members', function(params)
	n, members = xdb.find_by_cond("conference_cdr_members", {conference_cdr_id = params.id})

	if n > 0 then
		return members
	else
		return '[]'
	end
end)
