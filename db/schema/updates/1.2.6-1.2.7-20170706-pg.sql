ALTER TABLE tickets ADD privacy VARCHAR DEFAULT 'TICKET_PRIV_PUBLIC';

CREATE TABLE subscriptions (
	id INTEGER PRIMARY Key,
	realm VARCHAR NOT NULL,  -- what to sub
	ref_id INTEGER,          -- which to sub
	user_id INTEGER,

	recv_wechat_notification INTEGER DEFAULT 1,
	recv_weapp_notification INTEGER DEFAULT 1,
	recv_email_notification INTEGER DEFAULT 0,

	created_epoch TIMESTAMP(0) DEFAULT now(),
	updated_epoch TIMESTAMP(0) DEFAULT now(),
	deleted_epoch TIMESTAMP(0)
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

INSERT OR IGNORE INTO subscriptions (realm, ref_id, user_id) SELECT DISTINCT 'TICKET', id, user_id FROM tickets;
INSERT OR IGNORE INTO subscriptions (realm, ref_id, user_id) SELECT DISTINCT 'TICKET', id, current_user_id FROM tickets;
INSERT OR IGNORE INTO subscriptions (realm, ref_id, user_id) SELECT DISTINCT 'TICKET', ticket_id, user_id FROM ticket_comments;
