-- XUI tables

CREATE TABLE routes (
	id INTEGER PRIMARY KEY,
	name VARCHAR NOT NULL,
	description VARCHAR,
	prefix VARCHAR NOT NULL DEFAULT '',
	length, INTEGER,
	context VARCHAR,
	dnc VARCHAR,
	sdnc VARCHAR,
	dest_type VARCHAR,
	dest_uuid VARCHAR,
	body TEXT,
	auto_record BOOLEAN NOT NULL DEFAULT 0 CHECK(auto_record IN (0, 1, '0', '1')),

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE INDEX routes_deleted_epoch ON routes(deleted_epoch);

CREATE TRIGGER tg_routes AFTER UPDATE ON routes
BEGIN
	UPDATE routes set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE users (
	id INTEGER PRIMARY KEY,
	extn VARCHAR,
	name VARCHAR NOT NULL,
	cid_number VARCHAR,
	cid_name VARCHAR,
	context VARCHAR,
	domain VARCHAR,
	password VARCHAR,
	vm_password VARCHAR,
	user_cidr VARCHAR,
	login VARCHAR,
	email VARCHAR,
	type VARCHAR,
	tel VARCHAR,
	auto_record BOOLEAN NOT NULL DEFAULT 0 CHECK(auto_record IN (0, 1, '0', '1')),
	disabled BOOLEAN NOT NULL DEFAULT 0 CHECK(disabled IN (0, 1, '0', '1')),
	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE UNIQUE INDEX users_extn ON users(domain, extn);
CREATE INDEX users_deleted_epoch ON users(deleted_epoch);

CREATE TRIGGER tg_users AFTER UPDATE ON users
BEGIN
	UPDATE users set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE blocks (
	id INTEGER PRIMARY KEY,
	name VARCHAR NOT NULL,
	description VARCHAR,
	ver TEXT,
	xml TEXT,
	js TEXT,
	lua TEXT,
	ivr_menu_id VARCHAR,  -- link to a IVR block

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE INDEX blocks_deleted_epoch ON blocks(deleted_epoch);

CREATE TRIGGER tg_blocks AFTER UPDATE ON blocks
BEGIN
	UPDATE blocks set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE dicts (
	id INTEGER PRIMARY KEY,
	realm VARCHAR NOT NULL,
	k VARCHAR NOT NULL, -- key
	v VARCHAR, -- value
	d VARCHAR, -- description
	o INTEGER, -- order
	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE INDEX dicts_realm ON dicts(realm);
CREATE INDEX dicts_k ON dicts(k);
CREATE UNIQUE INDEX dicts_realm_k ON dicts(realm, k);

CREATE TRIGGER tg_dicts AFTER UPDATE ON dicts
BEGIN
	UPDATE dicts set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE groups (
	id INTEGER PRIMARY KEY,
	realm VARCHAR NOT NULL,           -- a key in dicts
	name VARCHAR NOT NULL,
	level integer DEFAULT 0,
	description VARCHAR,
	group_id INTEGER,        -- nested groups
	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE INDEX groups_deleted_epoch ON groups(deleted_epoch);

CREATE TRIGGER tg_groups AFTER UPDATE ON groups
BEGIN
	UPDATE groups set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TRIGGER tg_groups_after_insert_group AFTER INSERT ON groups
BEGIN
	UPDATE groups SET level = ifnull((select level + 1 FROM groups WHERE id  = NEW.group_id), 0) WHERE id = NEW.id;
END;

CREATE TRIGGER tg_groups_after_update_group AFTER UPDATE ON groups
BEGIN
	UPDATE groups SET level = ifnull((select level + 1 FROM groups WHERE id  = NEW.group_id), 0) WHERE id = NEW.id;
	UPDATE groups SET level = ifnull((select level + 1 FROM groups WHERE id  = NEW.id), 0) WHERE group_id = NEW.id;
END;

CREATE TABLE user_groups (
	id INTEGER PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE UNIQUE INDEX user_group_u_g_id ON user_groups(user_id, group_id);

CREATE TRIGGER tg_user_group AFTER UPDATE ON user_groups
BEGIN
	UPDATE user_groups set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE extn_groups (
	id INTEGER PRIMARY KEY,
	user_id INTEGER NOT NULL,
	group_id INTEGER NOT NULL,
	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE INDEX extn_group_e_g_id ON extn_groups(user_id, group_id);

CREATE TRIGGER tg_extn_groups AFTER UPDATE ON extn_groups
BEGIN
	UPDATE extn_groups set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE gateways (
	id INTEGER PRIMARY KEY,
	name VARCHAR NOT NULL,
	realm VARCHAR NOT NULL,
	username VARCHAR,
	password VARCHAR,
	register VARCHAR NOT NULL DEFAULT 'true',
	profile_id INTEGER,
	description VARCHAR,
	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE UNIQUE INDEX gateways_name ON gateways(name);
CREATE INDEX gateways_deleted_epoch ON gateways(deleted_epoch);

CREATE TRIGGER tg_gateways AFTER UPDATE ON gateways
BEGIN
	UPDATE gateways set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE params (
	id INTEGER PRIMARY KEY,
	realm VARCHAR NOT NULL, -- e.g. sip_profiles or gateways
	k VARCHAR NOT NULL,
	v VARCHAR,
	ref_id INTEGER, -- e.g. sip_profiles.id or gateway.id
	disabled BOOLEAN NOT NULL DEFAULT 0 CHECK(disabled IN (0, 1, '0', '1')),
	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE INDEX params_realm ON params(realm);
CREATE INDEX params_rrk ON params(realm, ref_id, k);
CREATE INDEX params_deleted_epoch ON params(deleted_epoch);

CREATE TRIGGER tg_params AFTER UPDATE ON params
BEGIN
	UPDATE params set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE sip_profiles (
	id INTEGER PRIMARY KEY,
	name VARCHAR NOT NULL,
	description VARCHAR,
	disabled BOOLEAN NOT NULL DEFAULT 0 CHECK(disabled IN (0, 1, '0', '1')),
	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE UNIQUE INDEX sip_profiles_name ON sip_profiles(name);
CREATE INDEX sip_profiles_deleted_epoch ON sip_profiles(deleted_epoch);

CREATE TRIGGER tg_sip_profiles AFTER UPDATE ON sip_profiles
BEGIN
	UPDATE sip_profiles set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;


CREATE TABLE media_files (
	id INTEGER PRIMARY KEY,
	type VARCHAR,          -- FAX, PDF, AUDIO, VIDEO, AUDIO_CONF, VIDEO_CONF
	name VARCHAR NOT NULL,
	description VARCHAR,
	file_name VARCHAR,
	ext VARCHAR,
	mime VARCHAR,
	file_size INTEGER,
	channels INTEGER,
	sample_rate INTEGER,
	bit_rate INTEGER,
	duration INTEGER,
	original_file_name VARCHAR,
	dir_path VARCHAR, -- dir
	abs_path VARCHAR, -- absolute path
	rel_path VARCHAR, -- relative path
	thumb_path VARCHAR,
	meta TEXT,
	geo_position VARCHAR,
	user_id INTEGER,
	channel_uuid VARCHAR,
	processing_flag INTEGER DEFAULT 0, -- 0 - unprocessed, 1 - processed, 2 - whatever

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE INDEX media_files_created_epoch ON media_files(created_epoch);
CREATE INDEX media_files_type ON media_files(type);

CREATE TRIGGER tg_media_files AFTER UPDATE ON media_files
BEGIN
	UPDATE media_files set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE conference_rooms (
	id INTEGER PRIMARY KEY,
	name VARCHAR,
	description VARCHAR,
	nbr VARCHAR,  -- conference number
	capacity integer,
	realm VARCHAR,
	pin VARCHAR,
	profile_id INTEGER,
	moderator VARCHAR,
	canvas_count INTEGER,
	video_mode VARCHAR,
	call_perm VARCHAR,
	cluster TEXT,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE TRIGGER tg_conference_rooms AFTER UPDATE ON conference_rooms
BEGIN
	UPDATE conference_rooms set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE conference_members (
	id INTEGER PRIMARY KEY,
	room_id INTEGER NOT NULL,
	name VARCHAR,
	description VARCHAR,
	num VARCHAR,
	route VARCHAR,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE TRIGGER tg_conference_members AFTER UPDATE ON conference_members
BEGIN
	UPDATE conference_members set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE devices (
	id INTEGER PRIMARY KEY,
	name VARCHAR,
	type VARCHAR,
	vendor VARCHAR,
	mac VARCHAR,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE TRIGGER tg_devices AFTER UPDATE ON devices
BEGIN
	UPDATE devices set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE user_devices (
	id INTEGER PRIMARY KEY,
	user_id INTEGER NOT NULL,
	mac_id VARCHAR NOT NULL,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE TRIGGER tg_user_devices AFTER UPDATE ON user_devices
BEGIN
	UPDATE user_devices set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE fifo_cdrs (
	id INTEGER PRIMARY KEY,
	channel_uuid VARCHAR NOT NULL,
	fifo_name VARCHAR NOT NULL,
	ani VARCHAR,                -- the original caller id number
	dest_number VARCHAR,        -- the original dest number
	bridged_number VARCHAR,     -- bridged_number
	media_file_id INTEGER,
	
	start_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	bridge_epoch INTEGER,
	end_epoch INTEGER
);

CREATE INDEX fifo_cdrs_start_epoch ON fifo_cdrs(start_epoch);
CREATE INDEX fifo_cdrs_channel_uuid ON fifo_cdrs(channel_uuid);

CREATE TABLE fifos (
	id INTEGER PRIMARY KEY,
	name VARCHAR NOT NULL,
	description VARCHAR,
	importance INTEGER DEFAULT 0,
	outbound_per_cycle INTEGER DEFAULT 1,
	outbound_per_cycle_min INTEGER DEFAULT 1,
	outbound_name VARCHAR,
	outbound_strategy VARCHAR DEFAULT 'ringall',
	outbound_priority INTEGER DEFAULT 5,
	retry_delay INTEGER DEFAULT 0,
	auto_record BOOLEAN NOT NULL DEFAULT 0 CHECK(auto_record IN (0, 1, '0', '1')),
	record_template VARCHAR,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE TRIGGER tg_fifos AFTER UPDATE ON fifos
BEGIN
	UPDATE fifos set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE INDEX fifo_name ON fifos(name);



CREATE TABLE fifo_members (
	id INTEGER PRIMARY KEY,
	fifo_id INTEGER,
	name VARCHAR,
	description VARCHAR,
	fifo_name VARCHAR,
	timeout INTEGER DEFAULT 60,
	simo INTEGER DEFAULT 1,
	lag INTEGER DEFAULT 2,
	wait VARCHAR DEFAULT 'nowait',
	extn VARCHAR,
	dial_string VARCHAR,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE TRIGGER tg_fifo_members AFTER UPDATE ON fifo_members
BEGIN
	UPDATE fifo_members set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE INDEX fifo_member_fifo_name ON fifo_members(fifo_name);

CREATE TABLE mcasts (
	id INTEGER PRIMARY KEY,
	name VARCHAR NOT NULL,
	source VARCHAR,
	codec_name VARCHAR,
	codec_ms INTEGER,
	channels VARCHAR DEFAULT '1',
	mcast_ip VARCHAR,
	mcast_port VARCHAR,
	sample_rate VARCHAR,
	enable BOOLEAN NOT NULL DEFAULT 0 CHECK(enable IN (0, 1, '0', '1')),
	auto_mode BOOLEAN NOT NULL DEFAULT 0 CHECK(enable IN (0, 1, '0', '1')),
	auto_start_time INTEGER DEFAULT (STRFTIME('%H:%M', 'now', 'localtime')),
	auto_stop_time INTEGER DEFAULT (STRFTIME('%H:%M', 'now', 'localtime')),

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE UNIQUE INDEX mcasts_name ON mcasts(name);
CREATE UNIQUE INDEX mcasts_maddress_mport ON mcasts(mcast_ip, mcast_port);

CREATE INDEX mcasts_deleted_epoch ON mcasts(deleted_epoch);

CREATE TRIGGER tg_mcasts AFTER UPDATE ON mcasts
BEGIN
	UPDATE mcasts set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE mfile_mcasts (
	id INTEGER PRIMARY KEY,
	mfile_id INTEGER NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
	mcast_id INTEGER NOT NULL REFERENCES mcasts(id) ON DELETE CASCADE,
	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE UNIQUE INDEX mfile_mcast_m_m_id ON mfile_mcasts(mfile_id, mcast_id);

CREATE TABLE permissions (
	id INTEGER PRIMARY KEY,
	action VARCHAR,
	method VARCHAR,
	param VARCHAR,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE TRIGGER tg_permissions AFTER UPDATE ON permissions
BEGIN
	UPDATE permissions set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE group_permissions (
	id INTEGER PRIMARY KEY,
	group_id INTEGER,
	permission_id INTEGER,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE TRIGGER tg_group_permissions AFTER UPDATE ON group_permissions
BEGIN
	UPDATE group_permissions set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;


CREATE TABLE conference_profiles (
	id INTEGER PRIMARY KEY,
	name VARCHAR NOT NULL,
	description VARCHAR,
	disabled BOOLEAN NOT NULL DEFAULT 0 CHECK(disabled IN (0, 1, '0', '1')),

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE UNIQUE INDEX conference_profiles_name ON conference_profiles(name);
CREATE INDEX conference_profiles_deleted_epoch ON conference_profiles(deleted_epoch);
CREATE TRIGGER tg_conference_profiles AFTER UPDATE ON conference_profiles
BEGIN
	UPDATE conference_profiles set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE ivr_menus (
	id INTEGER PRIMARY KEY,
	name VARCHAR NOT NULL,
	greet_long VARCHAR,
	greet_short VARCHAR,
	invalid_sound VARCHAR,
	exit_sound VARCHAR,
	transfer_sound VARCHAR,
	timeout VARCHAR,
	max_failures VARCHAR,
	max_timeouts VARCHAR,
	exec_on_max_failures VARCHAR,
	exec_on_max_timeouts VARCHAR,
	confirm_macro VARCHAR,
	confirm_key VARCHAR,
	tts_engine VARCHAR,
	tts_voice VARCHAR,
	confirm_attempts VARCHAR,
	digit_len VARCHAR,
	inter_digit_timeout VARCHAR,
	pin VARCHAR,
	pin_file VARCHAR,
	bad_pin_file VARCHAR,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE UNIQUE INDEX ivr_menu_name ON ivr_menus(name);

CREATE TRIGGER t_ivr_menus AFTER UPDATE ON ivr_menus
BEGIN
	UPDATE ivr_menus set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE acls (
	id INTEGER PRIMARY Key,
	name VARCHAR NOT NULL,
	status VARCHAR NOT NULL,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE UNIQUE INDEX acls_name ON acls(name);

CREATE TRIGGER t_acls AFTER UPDATE ON acls
BEGIN
	UPDATE acls set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE acl_nodes (
	id INTEGER PRIMARY KEY,
	k VARCHAR NOT NULL,
	v VARCHAR,
	acl_id INTEGER,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE TABLE ivr_actions (
	id INTEGER PRIMARY Key,
	ivr_menu_id INTEGER,
	digits VARCHAR,
	action VARCHAR,
	args VARCHAR,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE TRIGGER t_ivr_actions AFTER UPDATE ON ivr_actions
BEGIN
	UPDATE ivr_actions set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE tickets (
	id INTEGER PRIMARY Key,
	serial_number VARCHAR,
	cid_number VARCHAR,
	type VARCHAR DEFAULT 'TICKET_TYPE_1',
	subject VARCHAR,
	content TEXT,
	status VARCHAR DEFAULT 'TICKET_ST_NEW',
	channel_uuid VARCHAR,
	media_file_id INTEGER,
	record_path VARCHAR,
	user_id INTEGER,            -- the user created this ticket
	current_user_id INTEGER,    -- the user processing this ticket
	wechat_openid VARCHAR,
	emergency VARCHAR,
	privacy VARCHAR DEFAULT 'TICKET_PRIV_PRIVATE',
	rate VARCHAR,
	deadline INTEGER,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER,
	completed_epoch INTEGER
);

CREATE TRIGGER t_tickets AFTER UPDATE ON tickets
BEGIN
	UPDATE tickets set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TRIGGER t_tickets_serial AFTER INSERT ON tickets
BEGIN
	UPDATE tickets set serial_number = (
		SELECT strftime('%Y%m%d', created_epoch) || substr('00000000' || id, -8, 8)
		FROM tickets
		WHERE id = New.id
	) WHERE id = NEW.id;
END;

CREATE TABLE ticket_comments (
	id INTEGER PRIMARY Key,
	ticket_id INTEGER,
	user_id INTEGER,
	user_name VARCHAR,
	avatar_url VARCHAR,
	action VARCHAR,
	subject VARCHAR,
	content VARCHAR,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE TRIGGER t_ticket_comments AFTER UPDATE ON ticket_comments
BEGIN
	UPDATE ticket_comments set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE ticket_comment_media (
	id INTEGER PRIMARY Key,
	comment_id INTEGER,
	media_file_id INTEGER,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime'))
);

CREATE INDEX ticket_comment_media_cid_fid ON ticket_comment_media(comment_id, media_file_id);

CREATE TABLE wechat_users (
	id INTEGER PRIMARY Key,
	user_id INTEGER,
	openid VARCHAR,
	unionid VARCHAR,
	headimgurl VARCHAR,
	nickname VARCHAR,
	sex INTEGER,
	province VARCHAR,
	city VARCHAR,
	country VARCHAR,
	language VARCHAR,
	privilege VARCHAR,

	app_type VARCHAR, -- jsapp | weapp

	watermark_appid VARCHAR,
	watermark_timestamp VARCHAR,

	code VARCHAR,         -- jsapi code
	access_token VARCHAR, -- jsapi access_token
	refresh_token VARCHAR,
	token_expire INTEGER,

	session_key VARCHAR,  -- weapp session key
	session_3rd VARCHAR,  -- 3rd_session

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE INDEX wechat_users_user_id ON wechat_users(user_id);
CREATE UNIQUE INDEX wechat_users_openid ON wechat_users(openid);
CREATE UNIQUE INDEX wechat_users_code ON wechat_users(code);

CREATE TRIGGER t_wechat_users AFTER UPDATE ON wechat_users
BEGIN
	UPDATE wechat_users set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE wechat_upload (
	id INTEGER PRIMARY Key,
	comment_id INTEGER,
	img_url VARCHAR,
	type INTEGER,
	user_id INTEGER,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE TRIGGER t_wechat_upload AFTER UPDATE ON wechat_upload
BEGIN
	UPDATE wechat_upload set updated_epoch = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

-- cdrs could be auto generated when load mod_cdr_sqlite, but, we want to create it with more fields
CREATE TABLE cdrs (
	caller_id_name VARCHAR,
	caller_id_number VARCHAR,
	destination_number VARCHAR,
	context VARCHAR,
	start_stamp DATETIME,
	answer_stamp DATETIME,
	end_stamp DATETIME,
	duration INTEGER,
	billsec INTEGER,
	hangup_cause VARCHAR,
	uuid VARCHAR,
	bleg_uuid VARCHAR,
	account_code VARCHAR
);

ALTER TABLE cdrs ADD sip_hangup_disposition VARCHAR;
ALTER TABLE cdrs ADD network_addr VARCHAR;
ALTER TABLE cdrs ADD network_port VARCHAR;

CREATE INDEX cdrs_uuid ON cdrs(uuid);
CREATE INDEX start_stamp ON cdrs(start_stamp);

CREATE TABLE subscriptions (
	realm VARCHAR NOT NULL,  -- what to sub
	ref_id VARCHAR NOT NULL, -- which to sub
	user_id INTEGER NOT NULL,

	created_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	updated_epoch INTEGER DEFAULT (DATETIME('now', 'localtime')),
	deleted_epoch INTEGER
);

CREATE UNIQUE INDEX subscriptions_realm_ref_id_user_id ON subscriptions (realm, ref_id, user_id);

CREATE TRIGGER t_auto_sub_ticket AFTER INSERT ON tickets
BEGIN
	INSERT OR IGNORE INTO subscriptions (realm, ref_id, user_id)
		SELECT 'TICKET', NEW.id, NEW.user_id WHERE NEW.user_id IS NOT NULL;

	INSERT OR IGNORE INTO subscriptions (realm, ref_id, user_id)
		SELECT 'TICKET', NEW.id, NEW.current_user_id WHERE NEW.current_user_id IS NOT NULL AND NEW.user_id <> NEW.current_user_id;
END;

CREATE TRIGGER t_auto_sub_ticket1 AFTER UPDATE ON tickets
BEGIN
	INSERT OR IGNORE INTO subscriptions (realm, ref_id, user_id)
		SELECT 'TICKET', NEW.id, NEW.current_user_id WHERE NEW.current_user_id IS NOT NULL AND NEW.user_id <> NEW.current_user_id;
END;

CREATE TRIGGER t_auto_sub_ticket2 AFTER INSERT ON ticket_comments
BEGIN
	INSERT OR IGNORE INTO subscriptions (realm, ref_id, user_id)
		SELECT 'TICKET', NEW.ticket_id, NEW.user_id WHERE NEW.user_id IS NOT NULL;
END;

-- END
