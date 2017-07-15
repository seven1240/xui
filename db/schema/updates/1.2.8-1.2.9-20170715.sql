ALTER TABLE routes ALTER prefix SET NOT NULL;
ALTER TABLE routes ALTER prefix SET DEFAULT '';

DROP INDEX gateways_name;
CREATE UNIQUE INDEX gateways_name ON gateways(name);

UPDATE dicts SET v = '1.2.9' WHERE realm = 'XUI' and k = 'DBVER';
