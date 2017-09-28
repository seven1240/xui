CREATE TABLE distributors (
	id SERIAL PRIMARY Key,
	name VARCHAR NOT NULL,
	total_weight VARCHAR NOT NULL,

	created_at TIMESTAMP(0) DEFAULT now(),
	updated_at TIMESTAMP(0) DEFAULT now(),
	deleted_at TIMESTAMP(0)
);

CREATE UNIQUE INDEX distributors_name ON distributors(name);

CREATE TRIGGER t_distributor AFTER UPDATE ON distributor
BEGIN
	UPDATE distributor set updated_at = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE distributor_nodes (
	id SERIAL PRIMARY KEY,
	k VARCHAR NOT NULL,
	v VARCHAR,
	distributor_id INTEGER,

	created_at TIMESTAMP(0) DEFAULT now(),
	updated_at TIMESTAMP(0) DEFAULT now(),
	deleted_at TIMESTAMP(0)
);

UPDATE dicts SET v = '1.4.7' WHERE realm = 'XUI' and k = 'DBVER';
