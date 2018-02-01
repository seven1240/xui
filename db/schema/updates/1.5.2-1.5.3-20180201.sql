ALTER TABLE cdrs ADD account_code VARCHAR;
ALTER TABLE cdrs ADD realm VARCHAR;
UPDATE dicts SET v = '1.5.3' WHERE realm = 'XUI' and k = 'DBVER';
