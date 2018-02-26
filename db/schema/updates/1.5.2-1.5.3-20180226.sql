ALTER TABLE acl_nodes ADD node_type VARCHAR;

UPDATE dicts SET v = '1.5.3' WHERE realm = 'XUI' and k = 'DBVER';