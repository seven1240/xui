ALTER TABLE conference_members ADD route VARCHAR;

ALTER TABLE conference_rooms ADD canvas_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE conference_rooms ADD video_mode VARCHAR;
ALTER TABLE conference_rooms ADD call_perm VARCHAR;

INSERT INTO dicts (realm, k, v) VALUES ('CONF_VIDEO_MODE', 'CONF_VIDEO_MODE_PASSTHROUGH', 'passthrough');
INSERT INTO dicts (realm, k, v) VALUES ('CONF_VIDEO_MODE', 'CONF_VIDEO_MODE_TRANSCODE', 'transcode');
INSERT INTO dicts (realm, k, v) VALUES ('CONF_VIDEO_MODE', 'CONF_VIDEO_MODE_MUX', 'mux');

INSERT INTO dicts (realm, k, v) VALUES ('CONF_CALL_PERM', 'CONF_CP_NO_CHECK', 'CONF_CP_NO_CHECK');
INSERT INTO dicts (realm, k, v) VALUES ('CONF_CALL_PERM', 'CONF_CP_CHECK_CID', 'CONF_CP_CHECK_CID');
INSERT INTO dicts (realm, k, v) VALUES ('CONF_CALL_PERM', 'CONF_CP_AUTH_USER', 'CONF_CP_AUTH_USER');

INSERT INTO dicts (realm, k) VALUES('LAYOUT','1x1');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','2x2');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','3x3');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','4x4');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','5x5');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','6x6');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','8x8');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','1-1-1');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','1x2');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','2x1');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','2x1-zoom');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','3x1-zoom');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','5-grid-zoom');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','3x2-zoom');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','7-grid-zoom');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','4x2-zoom');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','1x1+2x1');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','1up_top_left+5');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','1up_top_left+7');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','1up_top_left+9');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','2up_top+8');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','2up_middle+8');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','2up_bottom+8');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','3up+4');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','3up+9');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','2x1-presenter-zoom');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','presenter-dual-vertical');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','presenter-dual-horizontal');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','presenter-overlap-small-top-right');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','presenter-overlap-small-bot-right');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','presenter-overlap-large-top-right');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','presenter-overlap-large-bot-right');
INSERT INTO dicts (realm, k) VALUES('LAYOUT','overlaps');

UPDATE dicts SET v = '1.2.5' WHERE realm = 'XUI' and k = 'DBVER';
