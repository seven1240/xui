ALTER TABLE conference_members ADD sort INTEGER;
ALTER TABLE conference_members ADD group_id INTEGER;
ALTER TABLE conference_members ADD user_id INTEGER;

UPDATE dicts SET v = '1.5.1' WHERE realm = 'XUI' and k = 'DBVER';
