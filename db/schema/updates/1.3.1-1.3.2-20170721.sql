ALTER TABLE routes ADD max_length INTEGER NOT NULL DEFAULT 12;

UPDATE dicts SET v = '1.3.2' WHERE realm = 'XUI' and k = 'DBVER';
