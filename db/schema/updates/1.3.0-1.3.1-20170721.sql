ALTER TABLE tickets ADD deadline INTEGER;

UPDATE dicts SET v = '1.3.1' WHERE realm = 'XUI' and k = 'DBVER';
