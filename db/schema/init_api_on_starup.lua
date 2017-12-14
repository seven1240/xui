INSERT INTO params (realm, k, v, disabled) VALUES('API_ON_STARTUP', 'sofia', 'recover', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('API_ON_STARTUP', 'fifo', 'reparse', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('API_ON_STARTUP', 'lua', 'xui/init_dev_key.lua', 0);
INSERT INTO params (realm, k, v, disabled) VALUES('API_ON_STARTUP', 'system', E'date \+\'aFreeSWITCH starting %Y-%m-%d %H:%M:%S on $${switchname}\' | mail -s \'FreeSWITCH starting on $${switchname}\' -b -c dev@x-y-t.cn', 0);