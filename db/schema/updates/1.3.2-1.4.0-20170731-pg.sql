ALTER TABLE routes RENAME created_epoch TO created_at;
ALTER TABLE users RENAME created_epoch TO created_at;
ALTER TABLE blocks RENAME created_epoch TO created_at;
ALTER TABLE dicts RENAME created_epoch TO created_at;
ALTER TABLE groups RENAME created_epoch TO created_at;
ALTER TABLE user_groups RENAME created_epoch TO created_at;
ALTER TABLE extn_groups RENAME created_epoch TO created_at;
ALTER TABLE gateways RENAME created_epoch TO created_at;
ALTER TABLE params RENAME created_epoch TO created_at;
ALTER TABLE sip_profiles RENAME created_epoch TO created_at;
ALTER TABLE media_files RENAME created_epoch TO created_at;
ALTER TABLE conference_rooms RENAME created_epoch TO created_at;
ALTER TABLE conference_members RENAME created_epoch TO created_at;
ALTER TABLE devices RENAME created_epoch TO created_at;
ALTER TABLE user_devices RENAME created_epoch TO created_at;
ALTER TABLE fifos RENAME created_epoch TO created_at;
ALTER TABLE fifo_members RENAME created_epoch TO created_at;
ALTER TABLE mcasts RENAME created_epoch TO created_at;
ALTER TABLE mfile_mcasts RENAME created_epoch TO created_at;
ALTER TABLE permissions RENAME created_epoch TO created_at;
ALTER TABLE group_permissions RENAME created_epoch TO created_at;
ALTER TABLE conference_profiles RENAME created_epoch TO created_at;
ALTER TABLE ivr_menus RENAME created_epoch TO created_at;
ALTER TABLE acls RENAME created_epoch TO created_at;
ALTER TABLE acl_nodes RENAME created_epoch TO created_at;
ALTER TABLE ivr_actions RENAME created_epoch TO created_at;
ALTER TABLE tickets RENAME created_epoch TO created_at;
ALTER TABLE ticket_comments RENAME created_epoch TO created_at;
ALTER TABLE ticket_comment_media RENAME created_epoch TO created_at;
ALTER TABLE wechat_users RENAME created_epoch TO created_at;
ALTER TABLE wechat_upload RENAME created_epoch TO created_at;
ALTER TABLE subscriptions RENAME created_epoch TO created_at;
ALTER TABLE tickets RENAME completed_epoch TO completed_at;

ALTER TABLE routes RENAME updated_epoch TO updated_at;
ALTER TABLE users RENAME updated_epoch TO updated_at;
ALTER TABLE blocks RENAME updated_epoch TO updated_at;
ALTER TABLE dicts RENAME updated_epoch TO updated_at;
ALTER TABLE groups RENAME updated_epoch TO updated_at;
ALTER TABLE user_groups RENAME updated_epoch TO updated_at;
ALTER TABLE extn_groups RENAME updated_epoch TO updated_at;
ALTER TABLE gateways RENAME updated_epoch TO updated_at;
ALTER TABLE params RENAME updated_epoch TO updated_at;
ALTER TABLE sip_profiles RENAME updated_epoch TO updated_at;
ALTER TABLE media_files RENAME updated_epoch TO updated_at;
ALTER TABLE conference_rooms RENAME updated_epoch TO updated_at;
ALTER TABLE conference_members RENAME updated_epoch TO updated_at;
ALTER TABLE devices RENAME updated_epoch TO updated_at;
ALTER TABLE user_devices RENAME updated_epoch TO updated_at;
ALTER TABLE fifos RENAME updated_epoch TO updated_at;
ALTER TABLE fifo_members RENAME updated_epoch TO updated_at;
ALTER TABLE mcasts RENAME updated_epoch TO updated_at;
ALTER TABLE mfile_mcasts RENAME updated_epoch TO updated_at;
ALTER TABLE permissions RENAME updated_epoch TO updated_at;
ALTER TABLE group_permissions RENAME updated_epoch TO updated_at;
ALTER TABLE conference_profiles RENAME updated_epoch TO updated_at;
ALTER TABLE ivr_menus RENAME updated_epoch TO updated_at;
ALTER TABLE acls RENAME updated_epoch TO updated_at;
ALTER TABLE acl_nodes RENAME updated_epoch TO updated_at;
ALTER TABLE ivr_actions RENAME updated_epoch TO updated_at;
ALTER TABLE tickets RENAME updated_epoch TO updated_at;
ALTER TABLE ticket_comments RENAME updated_epoch TO updated_at;
ALTER TABLE ticket_comment_media RENAME updated_epoch TO updated_at;
ALTER TABLE wechat_users RENAME updated_epoch TO updated_at;
ALTER TABLE wechat_upload RENAME updated_epoch TO updated_at;
ALTER TABLE subscriptions RENAME updated_epoch TO updated_at;

ALTER TABLE routes RENAME deleted_epoch TO deleted_at;
ALTER TABLE users RENAME deleted_epoch TO deleted_at;
ALTER TABLE blocks RENAME deleted_epoch TO deleted_at;
ALTER TABLE dicts RENAME deleted_epoch TO deleted_at;
ALTER TABLE groups RENAME deleted_epoch TO deleted_at;
ALTER TABLE user_groups RENAME deleted_epoch TO deleted_at;
ALTER TABLE extn_groups RENAME deleted_epoch TO deleted_at;
ALTER TABLE gateways RENAME deleted_epoch TO deleted_at;
ALTER TABLE params RENAME deleted_epoch TO deleted_at;
ALTER TABLE sip_profiles RENAME deleted_epoch TO deleted_at;
ALTER TABLE media_files RENAME deleted_epoch TO deleted_at;
ALTER TABLE conference_rooms RENAME deleted_epoch TO deleted_at;
ALTER TABLE conference_members RENAME deleted_epoch TO deleted_at;
ALTER TABLE devices RENAME deleted_epoch TO deleted_at;
ALTER TABLE user_devices RENAME deleted_epoch TO deleted_at;
ALTER TABLE fifos RENAME deleted_epoch TO deleted_at;
ALTER TABLE fifo_members RENAME deleted_epoch TO deleted_at;
ALTER TABLE mcasts RENAME deleted_epoch TO deleted_at;
ALTER TABLE mfile_mcasts RENAME deleted_epoch TO deleted_at;
ALTER TABLE permissions RENAME deleted_epoch TO deleted_at;
ALTER TABLE group_permissions RENAME deleted_epoch TO deleted_at;
ALTER TABLE conference_profiles RENAME deleted_epoch TO deleted_at;
ALTER TABLE ivr_menus RENAME deleted_epoch TO deleted_at;
ALTER TABLE acls RENAME deleted_epoch TO deleted_at;
ALTER TABLE acl_nodes RENAME deleted_epoch TO deleted_at;
ALTER TABLE ivr_actions RENAME deleted_epoch TO deleted_at;
ALTER TABLE tickets RENAME deleted_epoch TO deleted_at;
ALTER TABLE ticket_comments RENAME deleted_epoch TO deleted_at;
ALTER TABLE ticket_comment_media RENAME deleted_epoch TO deleted_at;
ALTER TABLE wechat_users RENAME deleted_epoch TO deleted_at;
ALTER TABLE wechat_upload RENAME deleted_epoch TO deleted_at;
ALTER TABLE subscriptions RENAME deleted_epoch TO deleted_at;

ALTER TABLE fifo_cdrs RENAME start_epoch TO started_at;
ALTER TABLE fifo_cdrs RENAME bridge_epoch TO bridged_at;
ALTER TABLE fifo_cdrs RENAME end_epoch TO ended_at;


CREATE OR REPLACE FUNCTION auto_update_ticket_serial() RETURNS TRIGGER AS
$$
BEGIN
	UPDATE tickets SET serial_number = to_char(NEW.created_at, 'YYYYMMDD') || lpad(NEW.id::varchar, 8, '0')
		WHERE id = NEW.id;
	RETURN NULL;
END;
$$
LANGUAGE plpgsql;

DROP FUNCTION auto_update_updated_epoch() cascade;

CREATE OR REPLACE FUNCTION auto_update_updated_at() RETURNS TRIGGER AS
$$
DECLARE
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER t_auto_update_updated_at_on_routes BEFORE UPDATE ON routes FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_blocks BEFORE UPDATE ON blocks FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_dicts BEFORE UPDATE ON dicts FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_groups BEFORE UPDATE ON groups FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_user_groups BEFORE UPDATE ON user_groups FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_extn_groups BEFORE UPDATE ON extn_groups FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_gateways BEFORE UPDATE ON gateways FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_params BEFORE UPDATE ON params FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_sip_profiles BEFORE UPDATE ON sip_profiles FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_media_files BEFORE UPDATE ON media_files FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_conference_rooms BEFORE UPDATE ON conference_rooms FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_conference_members BEFORE UPDATE ON conference_members FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_devices BEFORE UPDATE ON devices FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_user_devices BEFORE UPDATE ON user_devices FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_fifos BEFORE UPDATE ON fifos FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_fifo_members BEFORE UPDATE ON fifo_members FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_mcasts BEFORE UPDATE ON mcasts FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_mfile_mcasts BEFORE UPDATE ON mfile_mcasts FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_permissions BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_group_permissions BEFORE UPDATE ON group_permissions FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_conference_profiles BEFORE UPDATE ON conference_profiles FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_ivr_menus BEFORE UPDATE ON ivr_menus FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_acls BEFORE UPDATE ON acls FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_acl_nodes BEFORE UPDATE ON acl_nodes FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_ivr_actions BEFORE UPDATE ON ivr_actions FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_tickets BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_ticket_comments BEFORE UPDATE ON ticket_comments FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_ticket_comment_media BEFORE UPDATE ON ticket_comment_media FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_wechat_users BEFORE UPDATE ON wechat_users FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_wechat_upload BEFORE UPDATE ON wechat_upload FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();

UPDATE dicts SET v = '1.4.0' WHERE realm = 'XUI' and k = 'DBVER';
