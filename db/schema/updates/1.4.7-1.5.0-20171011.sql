ALTER TABLE conference_rooms ADD fps VARCHAR;
ALTER TABLE conference_rooms ADD bandwidth VARCHAR;

UPDATE dicts SET v = '1.5.0' WHERE realm = 'XUI' and k = 'DBVER';
