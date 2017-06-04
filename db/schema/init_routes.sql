INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('Echo', 'Echo Test', '9196', 'default', 'FS_DEST_SYSTEM', 'answer' || x'0a' || 'echo');
INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('Conference', 'Conference', '30', 'default', 'FS_DEST_SYSTEM', 'conference ${destination_number}-$${domain}');
INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('User', 'Local Users', '1', 'default', 'FS_DEST_USER', NULL);
INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('User', 'Local Users', '1', 'public', 'FS_DEST_USER', NULL);
INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('Record', 'Record', '*991234', 'default', 'FS_DEST_SYSTEM', 'answer' || x'0a' || 'lua xui/audio_record.lua');

INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('Fifo', 'Fifo', '*66', 'default', 'FS_DEST_SYSTEM',
	'answer' || x'0a' || 'set a=${fifo_member(add default user/${caller_id_number})}' || x'0a' || 'playback tone_stream://%(100,1000,800);loops=1' || x'0a' || 'playback ivr/ivr-you_are_now_logged_in.wav');

INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('Fifo', 'Fifo', '*67', 'default', 'FS_DEST_SYSTEM',
	'answer' || x'0a' || 'set a=${fifo_member(add default user/${caller_id_number})}' || x'0a' || 'playback tone_stream://%(100,1000,800);loops=1' || x'0a' || 'playback ivr/ivr-you_are_now_logged_out.wav');
