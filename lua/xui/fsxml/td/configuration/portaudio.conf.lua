XML_STRING =
[[<configuration name="portaudio.conf" description="Soundcard Endpoint">]] .. "\n" ..
[[  <settings>]] .. "\n" ..
[[    <param name="indev" value=""/>]] .. "\n" ..
[[    <param name="outdev" value=""/>]] .. "\n" ..
[[    <param name="hold-file" value="$${hold_music}"/>]] .. "\n" ..
[[    <param name="dialplan" value="XML"/>]] .. "\n" ..
[[    <param name="cid-name" value="$${outbound_caller_name}"/>]] .. "\n" ..
[[    <param name="cid-num" value="$${outbound_caller_id}"/>]] .. "\n" ..
[[    <param name="sample-rate" value="8000"/>]] .. "\n" ..
[[    <param name="codec-ms" value="20"/>]] .. "\n" ..
[[    <param name="mcast-sample-rate" value="48000"/>]] .. "\n" ..
[[    <param name="mcast-codec-ms" value="20"/>]] .. "\n" ..
[[    <param name="multicast-address" value="224.222.222.222:4598"/>]] .. "\n" ..
[[    <param name="listen-multicast" value="true"/>]] .. "\n" ..
[[    <param name="codec-name" value="L16"/>]] .. "\n" ..
[[    <param name="channels" value="1"/>]] .. "\n" ..
[[    <param name="jitterBuffer-msec" value="60:200:20"/>]] .. "\n" ..
[[  </settings>]] .. "\n" .. "\n" ..
[[  <streams>]] .. "\n" ..
[[    <stream name="usb1">]] .. "\n" ..
[[      <param name="indev" value="#2" />]] .. "\n" ..
[[      <param name="outdev" value="#2" />]] .. "\n" ..
[[      <param name="sample-rate" value="8000" />]] .. "\n" ..
[[      <param name="channels" value="2" />]] .. "\n" ..
[[    </stream>]] .. "\n" .. "\n" ..
[[    <stream name="default">]] .. "\n" ..
[[      <param name="indev" value="#0" />]] .. "\n" ..
[[      <param name="outdev" value="#1" />]] .. "\n" ..
[[      <param name="sample-rate" value="8000" />]] .. "\n" ..
[[      <param name="codec-ms" value="10" />]] .. "\n" ..
[[      <param name="channels" value="1" />]] .. "\n" ..
[[    </stream>]] .. "\n" .. "\n" ..
[[  </streams>]] .. "\n" .. "\n" ..
[[  <endpoints>]] .. "\n" .. "\n" ..
[[    <endpoint name="default">]] .. "\n" ..
[[      <param name="instream" value="default:0" />]] .. "\n" ..
[[      <param name="outstream" value="default:0" />]] .. "\n" ..
[[    </endpoint>]] .. "\n" .. "\n" ..
[[    <endpoint name="usb1out-left">]] .. "\n" ..
[[      <param name="outstream" value="usb1:0" />]] .. "\n" ..
[[    </endpoint>]] .. "\n" .. "\n" ..
[[    <endpoint name="usb1out-right">]] .. "\n" ..
[[      <param name="outstream" value="usb1:1" />]] .. "\n" ..
[[    </endpoint>]] .. "\n" .. "\n" ..
[[    <endpoint name="usb1in-left">]] .. "\n" ..
[[      <param name="outstream" value="usb1:0" />]] .. "\n" ..
[[    </endpoint>]] .. "\n" .. "\n" ..
[[    <endpoint name="usb1in-right">]] .. "\n" ..
[[      <param name="outstream" value="usb1:1" />]] .. "\n" ..
[[    </endpoint>]] .. "\n" .. "\n" ..
[[    <endpoint name="usb1-left">]] .. "\n" ..
[[      <param name="instream" value="usb1:0" />]] .. "\n" ..
[[      <param name="outstream" value="usb1:0" />]] .. "\n" ..
[[    </endpoint>]] .. "\n" .. "\n" ..
[[    <endpoint name="usb1-right">]] .. "\n" ..
[[      <param name="instream" value="usb1:1" />]] .. "\n" ..
[[      <param name="outstream" value="usb1:1" />]] .. "\n" ..
[[    </endpoint>]] .. "\n" .. "\n" ..
[[  </endpoints>]] .. "\n" .. "\n" ..
[[</configuration>]] .. "\n"
