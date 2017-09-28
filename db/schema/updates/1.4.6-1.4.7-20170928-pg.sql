CREATE TABLE distributors (
	id SERIAL PRIMARY Key,
	name VARCHAR NOT NULL,
	total_weight VARCHAR NOT NULL,

	created_at TIMESTAMP(0) DEFAULT now(),
	updated_at TIMESTAMP(0) DEFAULT now(),
	deleted_at TIMESTAMP(0)
);

CREATE UNIQUE INDEX distributors_name ON distributors(name);

CREATE TABLE distributor_nodes (
	id SERIAL PRIMARY KEY,
	k VARCHAR NOT NULL,
	v VARCHAR,
	distributor_id INTEGER,

	created_at TIMESTAMP(0) DEFAULT now(),
	updated_at TIMESTAMP(0) DEFAULT now(),
	deleted_at TIMESTAMP(0)
);

CREATE TRIGGER t_auto_update_updated_at_on_distributors BEFORE UPDATE ON distributors FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();
CREATE TRIGGER t_auto_update_updated_at_on_distributor_nodes BEFORE UPDATE ON distributor_nodes FOR EACH ROW EXECUTE PROCEDURE auto_update_updated_at();

UPDATE dicts SET v = '1.4.7' WHERE realm = 'XUI' and k = 'DBVER';
