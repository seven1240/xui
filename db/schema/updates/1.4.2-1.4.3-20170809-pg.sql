ALTER TABLE user_devices RENAME COLUMN mac_id TO device_id;

UPDATE dicts SET v = '1.4.3' WHERE realm = 'XUI' and k = 'DBVER';
