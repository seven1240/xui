INSERT INTO dicts (realm, k, v) VALUES ('MENUS', 'Monitor', '/monitor');
INSERT INTO dicts (realm, k, v) VALUES ('MENUS', 'Conference', '/conferences');
INSERT INTO dicts (realm, k, v) VALUES ('MENUS', 'Tickets', '/tickets');
INSERT INTO dicts (realm, k, v) VALUES ('MENUS', 'CDR', '/cdrs');
INSERT INTO dicts (realm, k, v) VALUES ('MENUS', 'About', '/about');

INSERT INTO dicts (realm, k, v) VALUES ('RMENUS', 'Settings', '/settings');

UPDATE dicts SET v = '1.2.1' WHERE realm = 'XUI' and k = 'DBVER';
