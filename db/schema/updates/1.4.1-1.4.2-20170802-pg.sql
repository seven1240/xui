ALTER TABLE ticket_comments ALTER content TYPE TEXT;

UPDATE dicts SET v = '1.4.2' WHERE realm = 'XUI' and k = 'DBVER';
