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

local do_debug = config.do_debug
-- do_debug = true

function __FILE__() return debug.getinfo(2,'S').source end
function __LINE__() return debug.getinfo(2, 'l').currentline end
function __FUNC__() return debug.getinfo(1).name end

content_type("application/json")

require 'xdb'
require 'xwechat'
require 'm_dict'
require 'utils'
require 'm_ticket'
require 'm_user'
require 'xtra_config'
xdb.bind(xtra.dbh)

get('/', function(params)
	startDate = env:getHeader('startDate')
	last = tonumber(env:getHeader('last'))
	status = env:getHeader('status')

	if not startDate then
		if not last then last = 7 end

		local sdate = os.time() - last * 24 * 60 * 60
		startDate = os.date('%Y-%m-%d', sdate)
		cond = " created_epoch > '" .. startDate .. "'"
	else
		local endDate = env:getHeader('endDate')
		local id = env:getHeader('id')
		local cid_number = env:getHeader('cid_number')		

		endDate = utils.date_diff(endDate, 1)

		cond = xdb.date_cond("created_epoch", startDate, endDate) ..
					xdb.if_cond("id", id) ..
					xdb.if_cond("cid_number", cid_number) ..
					xdb.if_cond("status", status)
	end

	if m_user.has_permission() then
		n, tickets = xdb.find_by_cond("tickets", cond, "id desc")
	else
		local condo = "user_id = " .. xtra.session.user_id .. " or current_user_id = " .. xtra.session.user_id
		cond = cond .. " AND " .. condo
		n, tickets = xdb.find_by_cond("tickets", cond, "id desc")
	end

	if (n > 0) then
		return tickets
	else
		return "[]"
	end
end)

get('/url', function(params)
	return '{"url":"' .. config.url .. '"}'
end)

get('/download', function(params)
	n, tickets = xdb.find_all("tickets")
	content_type("application/vnd.ms-excel;charset=utf-8")
	header("Content-Disposition", 'attachment; filename="download_tickets_filename.csv"')
	xtra.write(string.char(0xef, 0xBB, 0xbf))
	xtra.write('工单ID,' .. '序列号,' .. '主叫号码,' .. '类型,' .. '主题,' .. '内容,' .. '状态,' .. '指派人\n')
	for i, v in pairs(tickets) do
		local type = xdb.find_one('dicts', {realm = 'TICKET_TYPE', k = v.type})
		v.type = type.v
		local status = xdb.find_one('dicts', {realm = 'TICKET_STATE', k = v.status})
		v.status = status.v
		local user = xdb.find_one('users', {id = v.user_id})
		v.user_id = user.name

		v.content = string.gsub(v.content, '\n', '。')

		xtra.write(v.id .. "," .. v.serial_number .. "," .. v.cid_number .. "," .. v.type .. "," ..
		v.subject .. "," .. v.content .. "," .. v.status .. "," .. v.user_id .. "," .. v.current_user_id .. "\n")
	end
end)

get('/onetype', function(params)
	local theType = env:getHeader('theType')
	if theType then
		if m_user.has_permission() then
			n, tickets = xdb.find_by_cond("tickets", {type = theType}, "id desc")
		else
			local cond = "type = '" .. theType .. "' AND (user_id = " .. xtra.session.user_id .. " or current_user_id = " .. xtra.session.user_id .. ")"
			n, tickets = xdb.find_by_cond("tickets", cond, "id desc")
		end
	end
	if n > 0 then
		return tickets
	else
		return '[]'
	end
end)

get('/get_amount', function(params)
	n0, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_1'})
	n1, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_2'})
	n2, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_3'})
	n3, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_4'})
	n4, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_5'})
	n5, tickets = xdb.find_all("tickets")
	s0, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_1', satisfied='1'})
	s1, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_2', satisfied='1'})
	s2, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_3', satisfied='1'})
	s3, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_4', satisfied='1'})
	s4, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_5', satisfied='1'})
	s5, tickets = xdb.find_by_cond("tickets", {satisfied='1'})
	new0, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_1', status='TICKET_ST_NEW'})
	new1, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_2', status='TICKET_ST_NEW'})
	new2, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_3', status='TICKET_ST_NEW'})
	new3, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_4', status='TICKET_ST_NEW'})
	new4, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_5', status='TICKET_ST_NEW'})
	new5, tickets = xdb.find_by_cond("tickets", {status='TICKET_ST_NEW'})
	p0, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_1', status='TICKET_ST_PROCESSING'})
	p1, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_2', status='TICKET_ST_PROCESSING'})
	p2, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_3', status='TICKET_ST_PROCESSING'})
	p3, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_4', status='TICKET_ST_PROCESSING'})
	p4, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_5', status='TICKET_ST_PROCESSING'})
	p5, tickets = xdb.find_by_cond("tickets", {status='TICKET_ST_PROCESSING'})
	d0, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_1', status='TICKET_ST_DONE'})
	d1, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_2', status='TICKET_ST_DONE'})
	d2, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_3', status='TICKET_ST_DONE'})
	d3, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_4', status='TICKET_ST_DONE'})
	d4, tickets = xdb.find_by_cond("tickets", {type='TICKET_TYPE_5', status='TICKET_ST_DONE'})
	d5, tickets = xdb.find_by_cond("tickets", {status='TICKET_ST_DONE'})
	local amount = {n0, n1, n2, n3, n4 ,n5}
	local satisfied_amount = {s0, s1, s2, s3, s4, s5}
	local tsn = {new0, new1, new2, new3, new4, new5}
	local tsp = {p0, p1, p2, p3, p4, p5}
	local tsd = {d0, d1, d2, d3, d4, d5}
	return {amount, satisfied_amount, tsn, tsp, tsd}
end)

get('/:id', function(params)
	local ticket = {}
	local pid = params.id
	n, tickets = xdb.find_by_sql([[SELECT u.*, w.v as dtype
	FROM tickets as u left join dicts as w
	ON u.type = w.k
	WHERE u.id = 
	]] .. xdb.escape(pid))
	ticket = tickets[1]
	if ticket then
		local user = xdb.find("users", ticket.user_id)
		if user then
			ticket.user_name = user.name
		end

		if (ticket.current_user_id == '') then
			cname = "待定"
		else
			local curr_user = xdb.find("users", ticket.current_user_id)
			if curr_user then
				ticket.current_user_name = cname
			end
		end

		media_file = xdb.find_one("media_files", {id = ticket.media_file_id})

		if media_file then
			ticket.original_file_name = media_file.original_file_name
		end

		ticket.wechat_userid = xtra.session.user_id

		return ticket
	else
		return 404
	end
end)

get('/:id/comments/media_files', function(params)
	n, mfiles = xdb.find_by_cond("ticket_comment_media",
		[[comment_id IN (SELECT id
			FROM ticket_comments
			WHERE ticket_id = ]] .. xdb.escape(params.id) ..
		")",
		"comment_id"
	)

	if n > 0 then
		return mfiles
	else
		return "[]"
	end
end)

get('/:id/comments/media_files_object', function(params)
	n, mfiles = xdb.find_by_cond("ticket_comment_media",
		[[comment_id IN (SELECT id
			FROM ticket_comments
			WHERE ticket_id = ]] .. xdb.escape(params.id) ..
		")",
		"comment_id"
	)

	if n > 0 then
		obj = {}
		for i, v in pairs(mfiles) do
			local comment_id = v.comment_id
			if not obj[comment_id] then
				obj[comment_id] = {}
			end
			v.comment_id = nil
			table.insert(obj[comment_id], v)
		end
		return obj
	else
		return "{}"
	end
end)

get('/:id/comments', function(params)
	n, comments = xdb.find_by_cond("ticket_comments", {ticket_id = params.id}, "created_epoch DESC")
	local comments_res = {}
	for i, v in pairs(comments) do
		local n, users = xdb.find_by_cond("wechat_users", {user_id = v.user_id})
		local user = users[1]
		local n, imgs = xdb.find_by_cond("wechat_upload", {comment_id = v.id, type = 1})
		v.imgs = imgs
		-- v.avatar_url = user.headimgurl
		table.insert(comments_res,v)
	end
	if (n > 0) then
		return comments_res
	else
		return "[]"
	end
end)

post('/comments', function(params)
	freeswitch.consoleLog("ERR", "deprecated call to /api/comments!!")

	local comment = {}
	comment.content = env:getHeader("content")
	comment.ticket_id = env:getHeader("ticket_id")
	comment.user_id = env:getHeader("user_id")
	comment.user_name = env:getHeader("user_name")
	freeswitch.consoleLog("ERR", utils.serialize(comment))

	local ret = xdb.create_return_object('ticket_comments',comment)
	return ret
end)

put('/:id/satisfied', function(params)
	local ticket_id = params.id
	local satisfied = params.request.satisfied

	ret = xdb.update("tickets", {id = ticket_id, satisfied = satisfied})

	if ret == 1 then
		return satisfied
	else
		return 500
	end
end)

post('/hb', function(params)
	tids = env:getHeader("tids")
	tid_t = utils.json_decode(tids)
	local tid = ''
	for i, v in pairs(tid_t) do
		if(tid == '') then
			tid = tid .. v
		else
			tid = tid .. ',' .. v
			--加个事务？
			--n, check = xdb.find_by_sql("select * from tickets where id in(" .. tid .. ")")
			--检查check内，当前一个与上一个比较，如果电话、用户相同，则执行delete
			xdb.delete("tickets", v);
			--事务结束
		end
	end
	for i, v in pairs(check) do
		freeswitch.consoleLog("ERR",utils.json_encode(v.cid_number))
	end
	sql = "UPDATE ticket_comments SET ticket_id = " .. tid_t[1] .. " WHERE ticket_id IN (" .. tid .. ")";
	n, ret = xdb.find_by_sql(sql)
	if (n > 0) then
		return '{"res":"ok"}'
	else
		return '{}'
	end
end)

put('/:id/close',function(params)
	ret = m_ticket.close(params.id)

	if ret == 1 then
		return {id = params.id}
	else
		return 500
	end
end)

put('/:id/assign/:dest_id',function(params)
	local pid = params.id
	local dest_id = params.dest_id
	ret = xdb.update_by_cond("tickets", { id = pid }, { current_user_id = dest_id })
	if ret == 1 then
		ticket = xdb.find_one("tickets", { id = pid })
		dest_user = xdb.find("users", dest_id)
		if dest_user then
			ticket.current_user_name = dest_user.name
			realm = config.wechat_realm
			redirect_uri = config.wechat_base_url .. "/api/wechat/" .. realm .. "/tickets/" .. pid
			freeswitch.consoleLog("ERR",serialize(ticket))
			result = m_ticket.send_wechat_notification(realm, dest_id, redirect_uri, ticket.subject, ticket.current_user_name, ticket.content)
			if result then
				local user = xdb.find("users", xtra.session.user_id)
				local weuser = xdb.find_one("wechat_users", {
					user_id = xtra.session.user_id
				})
				local comment = {}
				comment.ticket_id = pid
				comment.user_id = xtra.session.user_id
				comment.content = "我把此工单指派给了" .. dest_user.name
				comment.user_name = user.name
				if weuser then
					comment.avatar_url = weuser.headimgurl
				end
				ret = xdb.create_return_object("ticket_comments", comment)
			end
		end
		return ticket
	else
		return 500
	end
end)

post('/:id/comments', function(params)
	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(params))
	end

	local user = xdb.find("users", xtra.session.user_id)
	local weuser = xdb.find_one("wechat_users", {
		user_id = xtra.session.user_id
	})

	utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(xtra.session))
	utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(user))
	utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(weuser))

	local comment = {}
	comment.ticket_id = params.id
	comment.user_id = xtra.session.user_id
	comment.content = params.request.content
	comment.user_name = user.name
	comment.action = params.request.action

	if weuser then
		comment.avatar_url = weuser.headimgurl
	end

	ret = xdb.create_return_object("ticket_comments", comment)

	ticket = xdb.find("tickets", params.id)

	if do_debug then
		utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(ticket))
	end

	xdb.update_by_cond("tickets",
		"id = " .. ticket.id .. " AND status = 'TICKET_ST_NEW'",
		{status = 'TICKET_ST_PROCESSING'})

	if config.wechat_realm and (comment.action ~= 'TICKET_ACTION_CHAT') then
		realm = config.wechat_realm
		if ticket then
			-- todo, send to all users subscribed to this ticket ?
			redirect_uri = config.wechat_base_url .. "/api/wechat/" .. realm .. "/tickets/" .. params.id
			content = '[回复] ' .. user.name .. ": " .. params.request.content

			if ticket.user_id then
				result = m_ticket.send_wechat_notification(realm, ticket.user_id, redirect_uri, ticket.subject, user.name, content)

				if do_debug then
					utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(result))
				end
			end

			if ticket.current_user_id and ticket.current_user_id ~= ticket.user_id then
				result = m_ticket.send_wechat_notification(realm, ticket.current_user_id, redirect_uri, ticket.subject, user.name, content)

				if do_debug then
					utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", serialize(result))
				end
			end
		end
	end

	if ret then
		return ret
	else
		return 500, "{}"
	end
end)

post('/:id/appoint', function(params)
	ticket = {}
	ticket.id = params.id
	ticket.current_user_id = params.request.current_user_id
	if ticket.current_user_id then
		xdb.update("tickets", ticket)
	end
end)

delete('/:id', function(params)
	ret = xdb.delete("tickets", params.id);
	if ret == 1 then
		xdb.delete("ticket_comments", {ticket_id = params.id});
		return 200, "{}"
	else
		return 500, "{}"
	end
end)

post('/', function(params)
	if do_debug then
		print(serialize(params))
	end

	local ticket = params.request
	ticket.status = 'TICKET_ST_NEW'
	ticket.user_id = xtra.session.user_id

	if not ticket.type then
		ticket.type = 'TICKET_TYPE_1'
	end

	if not ticket.emergency then
		ticket.emergency = 'URGENT'
	end

	ticket = xdb.create_return_object('tickets', ticket)

	if ticket then
		if config.wechat_realm then
			realm = config.wechat_realm

			user = xdb.find("users", xtra.session.user_id)
			redirect_uri = config.wechat_base_url .. "/api/wechat/" .. realm .. "/tickets/" .. ticket.id
			result = m_ticket.send_wechat_notification(realm, ticket.user_id, redirect_uri, ticket.subject, user.name, ticket.content)

			if do_debug then
				utils.xlog(__FILE__() .. ':' .. __LINE__(), "INFO", result)
			end
		end

		return ticket
	else
		return 500, "{}"
	end
end)

put('/:id', function(params)
	print(serialize(params))
	ret = xdb.update("tickets", params.request)
	if ret then
		return 200, "{}"
	else
		return 500
	end
end)

put('/:id/appraise', function(params)
	local ticket_id = params.id
	local appraise = params.request.appraise

	ret = xdb.update("tickets", {id = ticket_id, appraise = appraise})
	
	if ret == 1 then
		return '{"appraise":"' .. appraise .. '"}'
	else
		return 500
	end
end)

get('/:id/record', function(params)
	file_id = env:getHeader('file_id')
	file = xdb.find_one("media_files", {id = file_id})
	if (file) then
		return file
	else
		return 404
	end
end)
