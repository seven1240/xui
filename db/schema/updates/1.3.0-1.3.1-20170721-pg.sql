ALTER TABLE tickets ADD deadline TIMESTAMP(0);

UPDATE dicts SET v = '1.3.1' WHERE realm = 'XUI' and k = 'DBVER';
