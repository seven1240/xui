HASH=$(shell git rev-parse HEAD | cut -b 1-8)

all:
	cd jsapp && make

githash:
	cd jsapp && make githash

watch:
	cd jsapp && make watch

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
	rm -f out/*


out:
	mkdir out

tar: out
	echo $(HASH)
	cd .. && tar cvzf xui/out/xui-1.2.0.$(HASH).tar.gz xui/www xui/lua xui/db/schema
	ls out

sync:
	rsync -raz www/ $(path)

xswitch:
	scp -r lua www root@xswitch.cn:/usr/local/freeswitch/xui/
