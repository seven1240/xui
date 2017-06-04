session:answer()

-- warning tone
-- session:speak('Please say, what you say will be recorded')

session:streamFile("silence_stream://1000")
session:streamFile("tone_stream://%(250,0,1000)")

local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)[^/]+$", "%1")

package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"

require 'utils'
require 'xtra_config'
require 'xdb'

if config.db_auto_connect then xdb.connect(config.dsn) end

-- record
local recording_dir = config.recording_path
local uuid = session:get_uuid()
local date=os.date('%Y%m%d%H%M%S')
local recording_filename = string.format('%s/record-%s-%s.wav', recording_dir, date, uuid)

local data = {}
data.type = "audio"
data.name = "Record-" .. session:getVariable("caller_id_number")
data.type = "RECORD"
data.description = "Audio Record"
data.file_name = recording_filename
data.mime = "audio/wave"
data.ext = "wav"
data.abs_path = recording_filename
data.dir_path = recording_dir
data.rel_path = string.sub(data.abs_path, string.len(data.dir_path) + 2)

local event = freeswitch.Event("custom", "xui::record_start");
for k, v in pairs(data) do
	event:addHeader(k, v)
end
event:fire()

session:setVariable("auto_record", "false")
session:recordFile(recording_filename, 6000, 50, 5)

-- get file len
local f = assert(io.open(recording_filename, "rb"))
local len = assert(f:seek("end"))
f:close()
-- session:consoleLog("err", '--------file len=--------------' .. len .. "\n")
data.file_size = len


xdb.create("media_files", data)

event = freeswitch.Event("custom", "xui::record_complete");
for k, v in pairs(data) do
	event:addHeader(k, v)
end
event:fire()
