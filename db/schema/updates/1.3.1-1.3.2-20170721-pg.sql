ALTER TABLE routes RENAME length TO max_length;
ALTER TABLE routes ALTER max_length SET DEFAULT 12;
UPDATE routes set max_length = 12 WHERE max_length IS NULL;
ALTER TABLE routes ALTER max_length SET NOT NULL;

UPDATE dicts SET v = '1.3.2' WHERE realm = 'XUI' and k = 'DBVER';
