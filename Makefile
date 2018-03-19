HASH=$(shell git rev-parse HEAD | cut -b 1-8)
PLUGINS := $(wildcard jsapp/plugins/*)

all:
	cd jsapp && make

githash:
	cd jsapp && make githash

watch:
	cd jsapp && make watch

webuild:
	cd jsapp && make webuild

livereload:
	cd jsapp && make livereload

grunt:
	cd jsapp && grunt

xui: init

init:
	cd jsapp/src/jsx && ln -sf xui.js index.js
	ln -sf /usr/local/freeswitch/xui/lua/xui /usr/local/freeswitch/scripts/

setup: init
	cd jsapp && \
	npm install

link:
	ln -sf /usr/local/freeswitch/storage/* www/

td:
	cd jsapp/src/jsx && ln -sf td/index.js index.js

csetup: init
	cd jsapp && \
	cnpm install #&& \
#	bower install

release:
	cd jsapp && make release

clean:
	rm -f www/assets/js/jsx/*
	rm -f www/assets/js/plugins/*
	rm -rf www/assets/css/xui*.css
	rm -f www/recording
	rm -f www/recordings
	rm -f www/upload
	rm -f www/voicemail
	rm -f out/*

plugins-init:
	$(foreach N,$(PLUGINS),make -C $(N) init;)
plugins-watch:
	$(foreach N,$(PLUGINS),make -C $(N) watch;)
plugins-release:
	$(foreach N,$(PLUGINS),make -C $(N) release;)
plugins-clean:
	$(foreach N,$(PLUGINS),make -C $(N) clean;)
plugins:
	$(foreach N,$(PLUGINS),make -C $(N) release;)
plugin-init:
ifeq ($(plugin),)
	@echo "you should add plugin args, eg:plugin=conference"
else
	cd jsapp/plugins/${plugin} && make init
endif
plugin-release:
ifeq ($(plugin),)
	@echo "you should add plugin args, eg:plugin=conference"
else
	cd jsapp/plugins/${plugin} && make release
endif
plugin-clean:
ifeq ($(plugin),)
	@echo "you should add plugin args, eg:plugin=conference"
else
	cd jsapp/plugins/${plugin} && make clean
endif

out:
	mkdir out

tar: out
	echo $(HASH)
	$(shell date +xui-1.3.0-%Y%m%d%H%M%S-$(HASH) > VERSION)
	cd .. && tar cvzf xui/out/`cat xui/VERSION`.tar.gz --exclude xui/lua/xui/xtra_config.lua xui/www xui/lua xui/db xui/VERSION
	ls out

ready: clean plugins-init plugins-release release tar
	echo "Done"

sync:
	rsync -raz www/ $(path)

xswitch:
	scp -r lua www root@xswitch.cn:/usr/local/freeswitch/xui/

sqlite-init:
	make -C db/schema init

pg-init:
	make -C db/schema initpg


docker/conf:
	cp -R conf/docker docker/conf

docker-dev-init: docker/conf
	cp docker/env.example docker/env

docker-dev-start:
	docker-compose -f docker/dev.yml up -d

docker-dev-bash:
	docker exec -it docker_xswitch_1 bash

docker-dev-stop:
	docker-compose -f docker/dev.yml stop

docker-dev-down:
	docker-compose -f docker/dev.yml down

docker-dev-cli:
	docker exec -it docker_xswitch_1 bash -c "/usr/local/freeswitch/bin/fs_cli"
