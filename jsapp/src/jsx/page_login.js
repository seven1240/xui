/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2017, Seven Du <dujinfang@x-y-t.cn>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is XUI - GUI for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Seven Du <dujinfang@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Seven Du <dujinfang@x-y-t.cn>
 *
 *
 */

import React from 'react'
import T from 'i18n-react';
import ReactDOM from 'react-dom';
import { Row, Col, Button } from 'react-bootstrap';
import { Router, Route, IndexRoute, Link, hashHistory, Redirect } from 'react-router'
import MainMenu from './main-menu';
import { Home } from "./index.js";
import verto from "./verto/verto";
import {verto_params, verto_callbacks} from "./verto";
import { xFetchJSON, Footer } from './libs/xtools';

class LoginPage extends React.Component {
	render() {
		var menus = [{id: "MM_LOGIN", description: <T.span text={{ key: "Login"}} />, data: '/'}];
		return <div><MainMenu menus = {menus} rmenus = {[]}/>
			<div id='main'>{this.props.children}</div>
			<Footer/>
		</div>
	}
};

class LoginBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {login_err: false}
		this.handleClick = this.handleClick.bind(this);
		this.handleVertoLogin = this.handleVertoLogin.bind(this);
		this.handleVertoLoginError = this.handleVertoLoginError.bind(this);
		this.handleLogin = this.handleLogin.bind(this);
	}

	handleClick () {
		let username = this.refs.username.value;
		let password = this.refs.password.value;
		localStorage.setItem('xui.username', username);
		localStorage.setItem('xui.password', password);

		if (username) {
			xFetchJSON("/api/users/getID?username=" + username).then((data) => {
				if (data.type == "CONFMAN") {
					localStorage.setItem('xui.user_type', "CONFMAN");
				}
			}).catch((msg) => {
				console.log("ERR", msg)
			});
		}
		// verto.loginData(verto_params());

		verto.connect(verto_params());
		verto.login();
	}

	componentDidMount () {
		window.addEventListener("verto-login", this.handleVertoLogin);
		window.addEventListener("verto-login-error", this.handleVertoLoginError);
	}

	componentWillUnmount () {
		window.removeEventListener("verto-login", this.handleVertoLogin);
		window.removeEventListener("verto-login-error", this.handleVertoLoginError);
	}

	handleVertoLogin (e) {
		console.log("page_login.js: login", e);
		ReactDOM.render(<Home/>, document.getElementById('body'))
	}

	handleVertoLoginError (e) {
		this.setState({login_err: true});
	}

	handleLogin (e){
		var event = e || window.event;
		if (event.keyCode == 13) {
			console.log(event);
			this.handleClick();
		};
	}

	render() {
		var errmsg = this.state.login_err ? "Invalid username or password" : "";
		return <div id='loginbox'>
			<br/><T.span text={errmsg} className="danger"/>
			<h1><T.span text="Login with username and password"/></h1>
			<p><input id='username' name='username' placeholder='username' ref="username"/></p>
			<p><input id='password' name='password' type='password' onKeyDown= {this.handleLogin} placeholder='password' ref="password"/></p>
			<Button bsStyle="primary" onClick={this.handleClick}><T.span text={{ key:"Login"}}/></Button>
		</div>
	}
};

class Login extends React.Component {
	render() {
		return <Router history={hashHistory}>
			<Route path="/" component={LoginPage}>
				<IndexRoute component={LoginBox}/>
				<Redirect from="/logout" to="/"/>
				<Route path="/:any" component={LoginBox}/>
				<Route path="/:any/:more" component={LoginBox}/>
				<Route path="/:any/:more/:more" component={LoginBox}/>
				<Route path="/:any/:more/:more/:more" component={LoginBox}/>
				<Route path="/:any/:more/:more/:more/:more" component={LoginBox}/>
			</Route>
		</Router>
	}
};

ready(function() {
	verto.connect(verto_params(), verto_callbacks);
	ReactDOM.render(<Login/>, document.getElementById('body'));
});

export { Login, LoginBox };
