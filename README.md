# the XUI Project

This project is in active development and is not ready for production use.

## Design

Use the built-in HTTP server in mod_verto, no depends on anything except FreeSWITCH.

Use SQLite by default, PostgreSQL is in TODO list.

Follow the morden https://freeswitch.org/stash/projects/FS/repos/fs18configs/browse config layouts, old configs layouts should also work with trival changes. The goals is to remove all static XML configs and store everything in DB and dynamically serve with lua or xml_curl bindings.


## ToDo

* PostgreSQL support
* Mixed HTTP & Websocket Authentication suport

## Coding Style:

C: 4 spaces TAB
CSS/JS/HTML: https://github.com/felixge/Node-style-guide

## run


### Install npm (optional)

need recent version of npm, check <https://docs.npmjs.com/getting-started/what-is-npm> for more info.

    curl -sL https://deb.nodesource.com/setup_4.x | bash -
    apt-get install -y nodejs


### Install npm tools

    npm install -g jshint
    npm install -g browserify
    npm install -g watch
    npm install -g wiredep-cli
    npm install -g usemin-cli
    npm install -g watchify
    npm install -g babel-cli
    npm install -g uglifyjs

    cd jsapp
    npm install
   
   

or if you are in China, use taobao mirror would be faster

    npm config set registry https://registry.npm.taobao.org

or use cnpm see <https://npm.taobao.org/> for more info

    cnpm install -g jshint
    cnpm install -g browserify
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

    make setup

or if you are in China:

    make csetup

on terminal 1:

    make livereload

on terminal 2:

    make watch

build:

    make

Enjoy!

* <http://getbootstrap.com/2.3.2/index.html>
* <http://www.bootcss.com/>
* <http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/>
* <http://react-bootstrap.github.io/getting-started.html>
* <https://github.com/lukehoban/es6features>

## config

see: conf/samples/verto-directory-conf.xml

enable livearry-sync on conference profile:

    <param name="conference-flags" value="livearray-sync"/>

ref: conf/verto.conf.xml, then https://your-ip:8082

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
