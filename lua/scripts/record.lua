local dest = session:getVariable("dnc_number")
local recording_dir = '/usr/local/freeswitch/storage/upload'
local uuid = session:get_uuid()
local date=os.date('%Y%m%d%H%M%S')
local recording_filename = string.format('%s/record-%s-%s.wav', recording_dir, date, uuid)

session:execute("record_session", recording_filename)
dial_string = "sofia/gateway/default" .. "/" .. dest
session:execute("bridge", dial_string)

local f = assert(io.open(recording_filename, "rb"))
local len = assert(f:seek("end"))
f:close()
session:consoleLog("err", '--------file len=--------------' .. len .. "\n")

local data = {}
data.type = "audio"
data.name = "Record-" .. session:getVariable("caller_id_number")
data.description = "audio record"
data.file_name = recording_filename
data.file_size = len
data.mime = "audio/wave"
data.ext = "wav"
data.abs_path = recording_filename
data.dir_path = recording_dir
data.rel_path = string.sub(data.abs_path, string.len(data.dir_path) + 2)

local comma = ""
local keys = ""
local values = ""
for k, v in pairs(data) do
    keys =  keys .. comma .. k
    if type(v) == "string" then
        values = values .. comma .. '"' .. v .. '"'
    else 
        values = values .. comma .. v
    end
    comma = ","
end
local sql = 'insert into media_files(' .. keys .. ') values(' .. values .. ')'
session:consoleLog("err", '--------sql command--------------' .. sql .. "\n")

local dbh = freeswitch.Dbh("sqlite://xui")
dbh:query(sql)
dbh:release()

