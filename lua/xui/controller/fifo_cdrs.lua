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
	missed = env:getHeader('missed')
	startDate = env:getHeader('startDate')
	last = env:getHeader('last')
	pageNum = tonumber(env:getHeader('pageNum'))
	fifocdrsRowsPerPage = tonumber(env:getHeader('fifocdrsRowsPerPage'))

	local fifocdrs = {}
	local rowCount = 0

	fifocdrs.pageCount = 0
	fifocdrs.rowCount = 0
	fifocdrs.curPage = 0
	fifocdrs.data = {}

	pageNum = tonumber(pageNum)
	fifocdrsRowsPerPage = tonumber(fifocdrsRowsPerPage)

	if not pageNum or pageNum < 0 then
		pageNum = 1
	end

	if not fifocdrsRowsPerPage then
		fifocdrsRowsPerPage = 1000
	end

	if missed == "1" then
		cond = "bridged_number is null"
	else
		if not startDate then
			if (not last or last == 'undefined') then last = 7 end

			local sdate = os.time() - last * 24 * 60 * 60
			startDate = os.date('%Y-%m-%d', sdate)
			cond = " started_at > '" .. startDate .. "'"
			print(cond)
		else
			local endDate = env:getHeader('endDate')
			local ani = env:getHeader('ani')
			local dest_number = env:getHeader('dest_number')
			local bridged_number = env:getHeader('bridged_number')

			endDate = utils.date_diff(endDate, 1)

			cond = xdb.date_cond("started_at", startDate, endDate) ..
						xdb.if_cond("ani", ani) ..
						xdb.if_cond("dest_number", dest_number) ..
						xdb.if_cond("bridged_number", bridged_number)
		end
	end

	local cb = function(row)
		rowCount = tonumber(row.count)
	end

	xdb.find_by_sql("SELECT count(1) as count FROM fifo_cdrs WHERE " .. cond, cb)

	if rowCount > 0 then
		local offset = 0
		local pageCount = 0

		pageCount = math.ceil(rowCount / fifocdrsRowsPerPage);

		if pageNum == 0 then
			-- It means the last page
			pageNum = pageCount
		end

		offset = (pageNum - 1) * fifocdrsRowsPerPage

		local found, fifocdrsData = xdb.find_by_cond("fifo_cdrs", cond, "started_at DESC", nil, fifocdrsRowsPerPage, offset)

		if (found > 0) then
			fifocdrs.rowCount = rowCount
			fifocdrs.data = fifocdrsData
			fifocdrs.curPage = pageNum
			fifocdrs.pageCount = pageCount
		end
	end

	return fifocdrs
end)

get('/:channel_uuid', function(params)
	n1, fifocdrs = xdb.find_by_cond("fifo_cdrs", {channel_uuid = params.channel_uuid}, "started_at", nil, 1)

	sql = "select name from media_files where channel_uuid = '" .. params.channel_uuid .. "'"
	n2, result = xdb.find_by_sql(sql)

	if n1 > 0 then
		return {fifocdrs = fifocdrs, result = result}
	else
		return 404
	end
end)
