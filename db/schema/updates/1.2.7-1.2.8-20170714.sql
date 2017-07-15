ALTER TABLE users ADD weblogin_disabled BOOLEAN NOT NULL DEFAULT 0 CHECK(weblogin_disabled IN (0, 1, '0', '1'));

UPDATE dicts SET v = '1.2.8' WHERE realm = 'XUI' and k = 'DBVER';