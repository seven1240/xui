ALTER TABLE conference_rooms ADD user_id INTEGER;

UPDATE dicts SET v = '1.4.4' WHERE realm = 'XUI' and k = 'DBVER';
