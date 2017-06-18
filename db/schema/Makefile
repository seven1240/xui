init:
	cat sqlite.sql init*.sql sqlite_init*.sql | sqlite3 /usr/local/freeswitch/db/xui.db

initpg:
	cat pg.sql init*.sql pg_init*.sql | psql xui
