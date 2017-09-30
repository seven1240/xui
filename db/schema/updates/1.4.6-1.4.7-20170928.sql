CREATE TABLE distributors (
	id INTEGER PRIMARY KEY,
	name VARCHAR NOT NULL,
	total_weight VARCHAR NOT NULL,

	created_at DATETIME DEFAULT (DATETIME('now', 'localtime')),
	updated_at DATETIME DEFAULT (DATETIME('now', 'localtime')),
	deleted_at DATETIME
);

CREATE UNIQUE INDEX distributors_name ON distributors(name);

CREATE TRIGGER t_distributor AFTER UPDATE ON distributors
BEGIN
	UPDATE distributors set updated_at = DATETIME('now', 'localtime') WHERE id = NEW.id;
END;

CREATE TABLE distributor_nodes (
	id INTEGER PRIMARY KEY,
	k VARCHAR NOT NULL,
	v VARCHAR,
	distributor_id INTEGER,

	created_at DATETIME DEFAULT (DATETIME('now', 'localtime')),
	updated_at DATETIME DEFAULT (DATETIME('now', 'localtime')),
	deleted_at DATETIME
);

UPDATE dicts SET v = '1.4.7' WHERE realm = 'XUI' and k = 'DBVER';
