ALTER TABLE cdrs ADD network_addr VARCHAR;
ALTER TABLE cdrs ADD network_port VARCHAR;

CREATE INDEX cdrs_uuid ON cdrs(uuid);
CREATE INDEX start_stamp ON cdrs(start_stamp);

UPDATE dicts SET v = '1.2.2' WHERE realm = 'XUI' and k = 'DBVER';
