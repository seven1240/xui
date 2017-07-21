local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)[^/]+$", "%1")

package.path = package.path .. ";/etc/xtra/?.lua"
package.path = package.path .. ";" .. cur_dir .. "?.lua"
package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"

require 'utils'
require 'xtra_config'
require 'xdb'

if config.db_auto_connect then xdb.connect(config.dsn) end

xdb.connect2("odbc://xswitch:xswitch:xswitch")

function migrate(tbl)
	n, data = xdb.find_all(tbl)

	for k,v in pairs(data) do
		xdb.create2(tbl, v)
	end
end

migrate("users")
