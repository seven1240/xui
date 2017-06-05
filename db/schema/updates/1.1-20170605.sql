alter table users add auto_record BOOLEAN NOT NULL DEFAULT 0 CHECK(auto_record IN (0, 1, '0', '1')),;
alter table routes add auto_record BOOLEAN NOT NULL DEFAULT 0 CHECK(auto_record IN (0, 1, '0', '1')),;
alter table media_files add processing_flag INTEGER DEFAULT 0;
