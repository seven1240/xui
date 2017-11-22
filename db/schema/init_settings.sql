-- event socket settings

INSERT INTO params (realm, k, v, disabled) VALUES('event_socket', 'listen-ip', '127.0.0.1', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('event_socket', 'debug', '1', 1);
INSERT INTO params (realm, k, v, disabled) VALUES('event_socket', 'nat-map', 'false', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('event_socket', 'listen-port', '8021', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('event_socket', 'password', 'ClueCon', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('event_socket', 'apply-inbound-acl', 'loopback.auto', 1);
INSERT INTO params (realm, k, v, disabled) VALUES('event_socket', 'password', 'ClueCon', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('event_socket', 'stop-on-bind-error', 'true', 1);

INSERT INTO params (realm, k, v, disabled) VALUES('opus', 'use-vbr', '1', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('opus', 'complexity', '10', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('opus', 'keep-fec-enabled', '1', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('opus', 'maxaveragebitrate', '0', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('opus', 'maxplaybackrate', '0', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('opus', 'use-dtx', '10', 1);
INSERT INTO params (realm, k, v, disabled) VALUES('opus', 'packet-loss-percent', '10', 1);
INSERT INTO params (realm, k, v, disabled) VALUES('opus', 'asymmetric-sample-rates', '0', 1);
INSERT INTO params (realm, k, v, disabled) VALUES('opus', 'use-jb-lookahead', 'true', 1);
INSERT INTO params (realm, k, v, disabled) VALUES('opus', 'sprop-maxcapturerate', '0', 1);
