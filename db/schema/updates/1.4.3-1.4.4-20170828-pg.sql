ALTER TABLE users ALTER domain SET DEFAULT 'xswitch.cn';
UPDATE dicts SET v = '1.4.4' WHERE realm = 'XUI' and k = 'DBVER';
