HASH=$(shell git rev-parse HEAD | cut -b 1-8)

all:
	cd jsapp && make

githash:
	cd jsapp && make githash

watch:
	cd jsapp && make watch

wewatch:
	cd jsapp && make wewatch

webuild:
	cd jsapp && make webuild

livereload:
	cd jsapp && make livereload

grunt:
	cd jsapp && grunt

xui: init

init:
	cd jsapp/src/jsx && ln -sf xui.js index.js

setup: init
	cd jsapp && \
	npm install #&& \
#	bower install

link:
	ln -sf /usr/local/freeswitch/storage/* www/

td:
	cd jsapp/src/jsx && ln -sf td/index.js index.js

csetup:
	cd jsapp && \
	cnpm install && \
	bower install

release:
	cd jsapp && make release

clean:
	rm -f www/assets/js/jsx/*
	rm -rf www/assets/css/xui*.css
	rm -f www/recording
	rm -f www/recordings
	rm -f www/upload
	rm -f www/voicemail
	rm -f out/*


out:
	mkdir out

tar: out
	echo $(HASH)
	$(shell date +xui-1.3.0-%Y%m%d%H%M%S-$(HASH) > VERSION)
	cd .. && tar cvzf xui/out/`cat xui/VERSION`.tar.gz --exclude xui/lua/xui/xtra_config.lua xui/www xui/lua xui/db xui/VERSION
	ls out

ready: clean release tar
	echo "Done"

sync:
	rsync -raz www/ $(path)

xswitch:
	scp -r lua www root@xswitch.cn:/usr/local/freeswitch/xui/

sqlite-init:
	make -C db/schema init

pg-init:
	make -C db/schema initpg
