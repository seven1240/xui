ALTER TABLE groups ADD sort INTEGER;
ALTER TABLE user_groups ADD sort INTEGER;

UPDATE dicts SET v = '1.5.2' WHERE realm = 'XUI' and k = 'DBVER';
