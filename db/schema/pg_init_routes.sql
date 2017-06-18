INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('Echo', 'Echo Test', '9196', 'default', 'FS_DEST_SYSTEM', E'answer\r\necho');
INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('Record', 'Record', '*991234', 'default', 'FS_DEST_SYSTEM', E'answer\r\nlua xui/audio_record.lua');
INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('Conference', 'Conference', '30', 'default', 'FS_DEST_SYSTEM', 'conference ${destination_number}-$${domain}');
INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('User', 'Local Users', '1', 'default', 'FS_DEST_USER', NULL);
INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('User', 'Local Users', '1', 'public', 'FS_DEST_USER', NULL);

INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('Fifo', 'Fifo', '*66', 'default', 'FS_DEST_SYSTEM',
	E'answer\r\nset a=${fifo_member(add default user/${caller_id_number})}\r\nplayback tone_stream://%(100,1000,800);loops=1\r\nplayback ivr/ivr-you_are_now_logged_in.wav');

INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('Fifo', 'Fifo', '*67', 'default', 'FS_DEST_SYSTEM',
	E'answer\r\nset a=${fifo_member(add default user/${caller_id_number})}\r\nplayback tone_stream://%(100,1000,800);loops=1\r\nplayback ivr/ivr-you_are_now_logged_out.wav');
