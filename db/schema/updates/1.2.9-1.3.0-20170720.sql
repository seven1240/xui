ALTER TABLE tickets ALTER privacy SET DEFAULT 'TICKET_PRIV_PRIVATE';
ALTER TABLE tickets ADD rate VARCHAR;

UPDATE dicts SET v = '1.3.0' WHERE realm = 'XUI' and k = 'DBVER';
