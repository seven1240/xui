INSERT INTO ivr_menus (id, name, greet_long, greet_short, invalid_sound, exit_sound, transfer_sound, timeout, max_failures, max_timeouts, exec_on_max_failures, exec_on_max_timeouts, confirm_macro, confirm_key, tts_engine, tts_voice, confirm_attempts, digit_len, inter_digit_timeout, pin, pin_file, bad_pin_file) VALUES (1, 'cti_ivr', 'ivr/ivr-generic_greeting.wav', 'ivr/ivr-generic_greeting.wav', 'ivr/ivr-that_was_an_invalid_entry.wav', 'voicemail/vm-goodbye.wav', '', '15000', '3', NULL, NULL, NULL, NULL, '#', NULL, NULL, NULL, '18', '2000', NULL, NULL, NULL);
INSERT INTO ivr_actions (id, ivr_menu_id, digits, action, args) VALUES (1, 1, '0', 'menu-exec-app', 'transfer ivr6001 xml cti');
INSERT INTO ivr_actions (id, ivr_menu_id, digits, action, args) VALUES (2, 1, '/^([1,6][0-9]{3})$/', 'menu-exec-app', 'transfer ivr$1 xml cti');


INSERT INTO routes (name, description, prefix, max_length, context, dnc, sdnc, dest_type, dest_uuid, body, auto_record) VALUES (8, 'cti_local', '', '6', 12, 'cti', NULL, NULL, 'FS_DEST_USER', NULL, NULL, 0);
INSERT INTO routes (name, description, prefix, max_length, context, dnc, sdnc, dest_type, dest_uuid, body, auto_record) VALUES (9, 'cti_callcenter', '', '777', 12, 'cti', NULL, NULL, 'FS_DEST_SYSTEM', NULL, 
    E'answer\r\ncallcenter support@cti', 0);
INSERT INTO routes (name, description, prefix, max_length, context, dnc, sdnc, dest_type, dest_uuid, body, auto_record) VALUES (10, 'cti_ivr', '', '6753997', 7, 'cti', NULL, NULL, 'FS_DEST_SYSTEM', NULL, 
    E'answer\r\nivr cti_ivr', 0);
INSERT INTO routes (name, description, prefix, max_length, context, dnc, sdnc, dest_type, dest_uuid, body, auto_record) VALUES (12, 'call_out', '', '1', 11, 'cti', NULL, NULL, 'FS_DEST_GATEWAY', '2', 'cti', 0);
INSERT INTO routes (name, description, prefix, max_length, context, dnc, sdnc, dest_type, dest_uuid, body, auto_record) VALUES (13, 'pstn_call_in_to_callcenter', '', '86202329', 8, 'public', NULL, NULL, 'FS_DEST_SYSTEM', NULL, 
    E'answer\r\ncallcenter support@cti', 0);
INSERT INTO routes (name, description, prefix, max_length, context, dnc, sdnc, dest_type, dest_uuid, body, auto_record) VALUES (14, 'pstn_call_in_to_callcenter', '', '67116775', 8, 'public', NULL, NULL, 'FS_DEST_SYSTEM', NULL, 
    E'answer\r\ncallcenter support@cti', 0);
INSERT INTO routes (name, description, prefix, max_length, context, dnc, sdnc, dest_type, dest_uuid, body, auto_record) VALUES (15, 'call_to_pstn2', '', '0', 12, 'cti', NULL, NULL, 'FS_DEST_GATEWAY', '2', 'cti', 0);
INSERT INTO routes (name, description, prefix, max_length, context, dnc, sdnc, dest_type, dest_uuid, body, auto_record) VALUES (16, 'consult_ivr', '', 'uuid_', 41, 'cti', '', '', 'FS_DEST_SYSTEM', NULL, 
    'intercept ${destination_number:5}', 0);
INSERT INTO routes (name, description, prefix, max_length, context, dnc, sdnc, dest_type, dest_uuid, body, auto_record) VALUES (11, 'ivr_local', '', 'ivr', 20, 'cti', '', '', 'FS_DEST_SYSTEM', NULL, 
    E'set xuuid=${create_uuid()}\r\nexport nolocal:execute_on_answer=record_session $${recordings_dir}/cti/${strftime(%Y-%m-%d-%H-%M-%S)}.${xuuid}.wav\r\nbridge [origination_uuid=${xuuid}][x_agent=${destination_number:3}]user/${destination_number:3}\r\nintercept ${intercept_uuid}', 0);
INSERT INTO routes (name, description, prefix, context, dest_type, body) VALUES ('Fifo', 'Fifo', '*66', 'default', 'FS_DEST_SYSTEM',
    E'answer\r\nset a=${fifo_member(add default user/${caller_id_number})}\r\nplayback tone_stream://%(100,1000,800);loops=1\r\nplayback ivr/ivr-you_are_now_logged_in.wav');