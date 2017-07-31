local sounds_dir = config.sounds_dir
local default_stream =
  [[<directory name="default" path="]] .. sounds_dir .. [[/music/8000">]] .. "\n" ..
  [[  <param name="rate" value="8000"/>]] .. "\n" ..
  [[  <param name="shuffle" value="true"/>]] .. "\n" ..
  [[  <param name="channels" value="1"/>]] .. "\n" ..
  [[  <param name="interval" value="20"/>]] .. "\n" ..
  [[  <param name="timer-name" value="soft"/>]] .. "\n" ..
  [[</directory>]] .. "\n\n" ..

  [[<directory name="moh/8000" path="]] .. sounds_dir .. [[/music/8000">]] .. "\n" ..
  [[  <param name="rate" value="8000"/>]] .. "\n" ..
  [[  <param name="shuffle" value="true"/>]] .. "\n" ..
  [[  <param name="channels" value="1"/>]] .. "\n" ..
  [[  <param name="interval" value="20"/>]] .. "\n" ..
  [[  <param name="timer-name" value="soft"/>]] .. "\n" ..
  [[</directory>]] .. "\n\n" ..

  [[<directory name="moh/16000" path="]] .. sounds_dir .. [[/music/16000">]] .. "\n" ..
  [[  <param name="rate" value="16000"/>]] .. "\n" ..
  [[  <param name="shuffle" value="true"/>]] .. "\n" ..
  [[  <param name="channels" value="1"/>]] .. "\n" ..
  [[  <param name="interval" value="20"/>]] .. "\n" ..
  [[  <param name="timer-name" value="soft"/>]] .. "\n" ..
  [[</directory>]] .. "\n\n" ..

  [[<directory name="moh/32000" path="]] .. sounds_dir .. [[/music/32000">]] .. "\n" ..
  [[  <param name="rate" value="32000"/>]] .. "\n" ..
  [[  <param name="shuffle" value="true"/>]] .. "\n" ..
  [[  <param name="channels" value="1"/>]] .. "\n" ..
  [[  <param name="interval" value="20"/>]] .. "\n" ..
  [[  <param name="timer-name" value="soft"/>]] .. "\n" ..
  [[ </directory>]] .. "\n\n" ..

  [[<directory name="moh/48000" path="]] .. sounds_dir .. [[/music/48000">]] .. "\n" ..
  [[  <param name="rate" value="48000"/>]] .. "\n" ..
  [[  <param name="shuffle" value="true"/>]] .. "\n" ..
  [[  <param name="channels" value="1"/>]] .. "\n" ..
  [[  <param name="interval" value="10"/>]] .. "\n" ..
  [[  <param name="timer-name" value="soft"/>]] .. "\n" ..
  [[</directory>]] .. "\n"

local mcast_stream = ""

xdb.find_all("mcasts", nil, function(row)
	local rel_path = row.name .. "/" .. row.sample_rate
	local p =
		[[<directory name="]] .. rel_path .. [[" path="]] .. config.upload_path .. "/" .. rel_path .. '">\n' ..
		[[  <param name="rate" value="]] .. row.sample_rate ..[["/>]] .. "\n" ..
		[[  <param name="shuffle" value="true"/>]] .. "\n" ..
		[[  <param name="channels" value="]] .. row.channels .. [["/>]] .. "\n" ..
		[[  <param name="interval" value="10"/>]] .. "\n" ..
		[[  <param name="timer-name" value="soft"/>]] .. "\n" ..
		[[</directory>]] .. "\n\n"

	mcast_stream = mcast_stream .. p
end)


XML_STRING =
	[[<configuration name="local_stream.conf" description="stream files from local dir">]] .. "\n" ..
	default_stream .. "\n" .. mcast_stream .. "\n" .. [[</configuration>]]
