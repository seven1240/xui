ALTER TABLE conference_rooms ADD banner VARCHAR;

UPDATE dicts SET v = '1.4.1' WHERE realm = 'XUI' and k = 'DBVER';
