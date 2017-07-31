local cur_dir = debug.getinfo(1).source
cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)[^/]+$", "%1")

package.path = package.path .. ";/etc/xtra/?.lua"
package.path = package.path .. ";" .. cur_dir .. "?.lua"
package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"

require 'utils'
require 'xtra_config'
require 'xdb'

if config.db_auto_connect then xdb.connect(config.dsn) end

xdb.connect2("odbc://xui:xui:xui")

function migrate(tbl)
	stream:write("migrating table " .. tbl .. "\n")

	n,data = xdb.find_all(tbl)
	for k,v in pairs(data) do
		v.deleted_epoch = nil

		if v.answer_stamp == "" then
			v.answer_stamp = nil
		end
		if v.current_user_id == "" then
			 v.current_user_id = nil
		end
		if v.comment_id == "" then
			v.comment_id = nil
		end
		if v.user_id == "" then
			v.user_id =  nil
		end
		if v.media_file_id == "" then
			v.media_file_id = nil
		end
		if v.completed_epoch == "" then
			v.completed_epoch = nil
		end
		if v.deadline == "" then
			v.deadline = nil
		end
		if v.ref_id == "" then
			v.ref_id = nil
		end
		if v.sample_rate == "" then
			v.sample_rate = nil
		end
		if v.bit_rate == "" then
			v.bit_rate = nil
		end
		if v.duration == "" then
			v.duration = nil
		end
		if v.file_size == "" then
			v.file_size = nil
		end
		if v.channels == "" then
			v.channels = nil
		end
		if v.group_id == "" then
			v.group_id = nil
		end
		if v.o == "" then
			v.o = nil
		end
		if v.capacity == "" then
			v.capacity = nil
		end
		if v.profile_id == "" then
			v.profile_id = nil
		end
		if v.cluster == "" then
			v.cluster = nil
		end
		if v.end_epoch == "" then
			v.end_epoch = nil
		end
		if v.bridge_epoch == "" then
			v.bridge_epoch = nil
		end
		if v.token_expire == "" then
			v.token_expire = nil
		end

		v.length = nil
		v.INTEGER = nil
		v.appraise = nil

		if tbl == 'media_files' then
			if tonumber(v.created_epoch) then
				v.created_epoch = os.date('%Y-%m-%d %H:%M:%S', v.created_epoch)
			end
		end

		if tbl == 'fifo_cdrs' then
			if tonumber(v.start_epoch) then
				v.start_epoch = os.date('%Y-%m-%d %H:%M:%S', v.start_epoch)
			end

			if tonumber(v.bridge_epoch) then
				v.bridge_epoch = os.date('%Y-%m-%d %H:%M:%S', v.bridge_epoch)
			end

			if tonumber(v.end_epoch) then
				v.end_epoch = os.date('%Y-%m-%d %H:%M:%S', v.end_epoch)
			end
		end

		if tbl == 'tickets' then
			if tonumber(v.completed_epoch) then
				v.completed_epoch = os.date('%Y-%m-%d %H:%M:%S', v.completed_epoch)
			end
		end

		if tbl == "ticket_comments" then
			if v.ticket_id == '' then
				v.ticket_id = nil
			elseif v.ticket_id == 'undefined' then
				v.ticket_id = nil
			end
		end

		if v.created_epoch then
			v.created_at = v.created_epoch
			v.created_epoch = nil
		end

		if v.updated_epoch then
			v.updated_at = v.updated_epoch
			v.updated_epoch = nil
		end

		if v.deleted_epoch then
			v.deleted_at = v.deleted_epoch
			v.deleted_epoch = nil
		end

		if v.completed_epoch then
			v.completed_at = v.completed_epoch
			v.completed_epoch = nil
		end

		if v.start_epoch then
			v.started_at = v.start_epoch
			v.start_epoch = nil
		end

		if v.bridge_epoch then
			v.bridged_at = v.bridge_epoch
			v.bridge_epoch = nil
		end

		if v.end_epoch then
			v.ended_at = v.end_epoch
			v.end_epoch = nil
		end

		xdb.create2(tbl, v)
	end
end

migrate("users")
migrate("groups")
migrate("user_groups")
migrate("routes")
migrate("dicts")
migrate("extn_groups")
migrate("gateways")
migrate("params")
migrate("sip_profiles")
migrate("media_files")
migrate("conference_rooms")
migrate("conference_members")
migrate("devices")
migrate("user_devices")
migrate("fifo_cdrs")
migrate("fifos")
migrate("fifo_members")
migrate("mcasts")
migrate("mfile_mcasts")
migrate("permissions")
migrate("group_permissions")
migrate("conference_profiles")
migrate("ivr_menus")
migrate("acls")
migrate("acl_nodes")
migrate("ivr_actions")
migrate("tickets")
migrate("ticket_comments")
migrate("ticket_comment_media")
migrate("wechat_users")
migrate("wechat_upload")
migrate("cdrs")
migrate("subscriptions")
