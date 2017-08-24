# the XUI Project

This project is in active development and is not ready for production use.

## Design

Use the built-in HTTP server in mod_verto, no depends on anything except FreeSWITCH.

Use SQLite by default, PostgreSQL is in TODO list.

Follow the morden https://freeswitch.org/stash/projects/FS/repos/fs18configs/browse config layouts, old configs layouts should also work with trival changes. The goals is to remove all static XML configs and store everything in DB and dynamically serve with lua or xml_curl bindings.

### xTra

A Sintra like micro MVC framework called xTra is made in vendor for easier backend development.

xdb is included as a simple ORM.

xtra_config.lua for sample configurations.

xTra will search xtra_config.lua first in /etc/xtra/ and then in a dir including vendor. e.g. if you want to edit xtra_config.lua to include custom configs, do

    cd vendor
    cp xtra_config.lua ..
    cd ..
    vi xtra_config.lua


## ToDo

* Make more todos ...

## Coding Style:

C: 4 spaces TAB
CSS/JS/HTML: https://github.com/felixge/Node-style-guide

## run


### Install npm (optional)

* Linux

Debian 8/9

need recent version of npm, check <https://docs.npmjs.com/getting-started/what-is-npm> for more info.

    curl -sL https://deb.nodesource.com/setup_4.x | bash -
    apt-get install -y nodejs

* Mac

    brew install npm

### Install npm tools

Optionally use the taobao mirror would be faster if you are in China

    npm config set registry https://registry.npm.taobao.org

    npm install -g jshint
    npm install -g watch
    npm install -g wiredep-cli
    npm install -g usemin-cli
    npm install -g watchify
    npm install -g babel-cli
    npm install -g uglifyjs

    cd jsapp
    npm install


Alternatively can use cnpm see <https://npm.taobao.org/> for more info.

    cnpm install -g jshint
    cnpm install -g watch
    cnpm install -g wiredep-cli
    cnpm install -g usemin-cli
    cnpm install -g watchify
    cnpm install --save-dev babel-cli

    cd jsapp
    cnpm install
    

## Development

init db:

    cd db/schema && make

or, if your freeswitch is not installed in /usr/local/freeswitch

    cd db/schema && cat sqlite.sql init*.sql | sqlite3 /usr/local/freeswitch/db/xui.db

prepare:

    mkdir /usr/local/freeswitch/storage/{recordings,upload}
    make setup

on terminal 1: // ONLY if needed, skip this one if not working or you don't know what is it

    make livereload

on terminal 2:

    make watch

build:

    make

It's not required but sometimes the following command is helpful, don't ask why:

    make init

Enjoy!

* <http://getbootstrap.com/2.3.2/index.html>
* <http://www.bootcss.com/>
* <http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/>
* <http://react-bootstrap.github.io/getting-started.html>
* <https://github.com/lukehoban/es6features>

## config

1) backup old config files and use our recommended ones:

    mv /usr/local/freeswitch/conf /usr/local/freeswitch/conf.old
    cp -R conf/xui /usr/local/freeswitch/conf

2) or you can edit existing configs following the examples:

conf/samples/verto-directory-conf.xml
conf/samples/lua.conf.xml
conf/samples/verto.conf.xml

enable livearry-sync on conference profile:

    <param name="conference-flags" value="livearray-sync"/>

then goto https://your-ip:8082 or http://your-ip:8081

only Chrome is tested but you could try other browsers and report back.

# Update

If you pull/update code from github chances are we added new npm packages, so make sure `cd jsapp && npm install` if you see wired erros.

More:

* <https://facebook.github.io/react/>
* <http://react-bootstrap.github.io/>
* <https://www.npmjs.com/package/i18n-react>
* <https://github.com/ReactTraining/react-router>
* <http://stackoverflow.com/questions/35687353/react-bootstrap-link-item-in-a-navitem>
* <https://github.com/bradwestfall/CSS-Tricks-React-Series>
* <https://github.com/kaivi/riek>
* <http://tutorials.pluralsight.com/ruby-ruby-on-rails/building-a-crud-interface-with-react-and-ruby-on-rails>
* Verto Docs: <http://evoluxbr.github.io/verto-docs/>
* <https://github.com/okonet/react-dropzone>
* <https://github.com/github/fetch>

# Pull request

Please talk to us (by submit an issue) before you want to make a pull request.

Have fun!
