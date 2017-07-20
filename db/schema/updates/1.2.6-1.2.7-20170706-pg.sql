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

CREATE OR REPLACE FUNCTION auto_sub_ticket() RETURNS TRIGGER AS
$$
DECLARE
BEGIN
	INSERT INTO subscriptions (realm, ref_id, user_id)
		SELECT 'TICKET', NEW.id, NEW.user_id WHERE NEW.user_id IS NOT NULL
		ON CONFLICT DO NOTHING;

	RETURN NULL;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_sub_ticket1() RETURNS TRIGGER AS
$$
DECLARE
BEGIN
	INSERT INTO subscriptions (realm, ref_id, user_id)
		SELECT 'TICKET', NEW.id, NEW.current_user_id
			WHERE NEW.current_user_id IS NOT NULL AND NEW.user_id <> NEW.current_user_id
		ON CONFLICT DO NOTHING;
	RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_sub_ticket2() RETURNS TRIGGER AS
$$
DECLARE
BEGIN
	INSERT INTO subscriptions (realm, ref_id, user_id)
		SELECT 'TICKET', NEW.ticket_id, NEW.user_id WHERE NEW.user_id IS NOT NULL
		ON CONFLICT DO NOTHING;
	RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER t_auto_sub_ticket AFTER INSERT ON tickets FOR EACH ROW EXECUTE PROCEDURE auto_sub_ticket();
CREATE TRIGGER t_auto_sub_ticket1 AFTER UPDATE ON tickets FOR EACH ROW EXECUTE PROCEDURE auto_sub_ticket1();
CREATE TRIGGER t_auto_sub_ticket2 AFTER INSERT ON ticket_comments FOR EACH ROW EXECUTE PROCEDURE auto_sub_ticket2();

INSERT OR IGNORE INTO subscriptions (realm, ref_id, user_id) SELECT DISTINCT 'TICKET', id, user_id FROM tickets;
INSERT OR IGNORE INTO subscriptions (realm, ref_id, user_id) SELECT DISTINCT 'TICKET', id, current_user_id FROM tickets;
INSERT OR IGNORE INTO subscriptions (realm, ref_id, user_id) SELECT DISTINCT 'TICKET', ticket_id, user_id FROM ticket_comments;
