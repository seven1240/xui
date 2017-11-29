INSERT INTO acl_nodes (k, v, acl_id, node_type) VALUES('allow', '$${domain}', 1, 'domain');
INSERT INTO acls (name, status) VALUES ('domains', 'deny');