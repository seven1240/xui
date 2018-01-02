function build_rtmp_conf(event)
	local settings = ""
	local cond = {realm = 'RTMP', disabled = 0}

	xdb.find_by_cond("params", cond, 'id', function (row)
		settings = settings .. '<param name ="' .. row.k .. '" value="' .. row.v .. '"/>'
	end)

	return [[<settings>]] .. settings .. [[</settings>]]
end

XML_STRING = [[<configuration name="rtmp.conf" description="Event rtmp Server">]] ..
                build_rtmp_conf(event) .. [[</configuration>]]
