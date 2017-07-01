ALTER TABLE conference_members ADD route VARCHAR;

ALTER TABLE conference_rooms ADD canvas_count INTEGER;
ALTER TABLE conference_rooms ADD video_mode VARCHAR;
ALTER TABLE conference_rooms ADD call_perm VARCHAR;

INSERT INTO dicts (realm, k, v) VALUES ('CONF_VIDEO_MODE', 'CONF_VIDEO_MODE_PASSTHROUGH', 'passthrough');
INSERT INTO dicts (realm, k, v) VALUES ('CONF_VIDEO_MODE', 'CONF_VIDEO_MODE_TRANSCODE', 'transcode');
INSERT INTO dicts (realm, k, v) VALUES ('CONF_VIDEO_MODE', 'CONF_VIDEO_MODE_MUX', 'mux');

INSERT INTO dicts (realm, k, v) VALUES ('CONF_CALL_PERM', 'CONF_CP_NO_CHECK', 'CONF_CP_NO_CHECK');
INSERT INTO dicts (realm, k, v) VALUES ('CONF_CALL_PERM', 'CONF_CP_CHECK_CID', 'CONF_CP_CHECK_CID');
INSERT INTO dicts (realm, k, v) VALUES ('CONF_CALL_PERM', 'CONF_CP_AUTH_USER', 'CONF_CP_AUTH_USER');

UPDATE dicts SET v = '1.2.5' WHERE realm = 'XUI' and k = 'DBVER';
