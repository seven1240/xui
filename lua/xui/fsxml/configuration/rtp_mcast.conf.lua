local mcast_name = nil
if params then
	mcast_name = params:getHeader("mcast_name")
end

function build_mcasts(mcast_name)
	local mcasts = ""
	local cond = nil

	if mcast_name then
		cond = {name = mcast_name}
	end

	xdb.find_by_cond("mcasts", cond, "id", function(row)
		local sql = "SELECT mf.* FROM mfile_mcasts mm LEFT JOIN media_files mf ON mm.mfile_id = mf.id WHERE mm.mcast_id = " .. row.id
		local p = '<param name="codec-name"' .. ' value="' .. row.codec_name .. '"/>'
		p = p .. '<param name="sample-rate"' .. ' value="' .. row.sample_rate .. '"/>'
		p = p .. '<param name="codec-ms"' .. ' value="' .. row.codec_ms .. '"/>'
		p = p .. '<param name="channels"' .. ' value="' .. row.channels .. '"/>'
		p = p .. '<param name="mcast-ip"' .. ' value="' .. row.mcast_ip .. '"/>'
		p = p .. '<param name="mcast-port"' .. ' value="' .. row.mcast_port .. '"/>'
		p = p .. '<param name="enable"' .. ' value="' .. row.enable .. '"/>'
		p = p .. '<param name="auto-mode"' .. ' value="' .. row.auto_mode .. '"/>'
		p = p .. '<param name="auto-start-time"' .. ' value="' .. row.auto_start_time .. '"/>'
		p = p .. '<param name="auto-stop-time"' .. ' value="' .. row.auto_stop_time .. '"/>'
		p = p .. '<param name="shuffle"' .. ' value="' .. 'false' .. '"/>'

		p = p .. '<source>'

		xdb.find_by_sql(sql, function(row2)
			p = p .. '<param name="' .. row2.name .. '"' .. ' value="' .. row2.abs_path .. '"/>'
		end)
		p = p .. '</source>'

		local mcast = '<mcast name="' .. row.name .. '">' .. p .. '</mcast>'

		mcasts = mcasts .. mcast
	end)

	return mcasts
end


mcasts = build_mcasts(mcast_name)

XML_STRING = [[<configuration name="rtp_mcast.conf" description="rtp mcast"><mcasts>]] .. mcasts .. [[</mcasts></configuration>]]
