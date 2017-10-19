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

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Nav, Modal, NavItem, MenuItem, NavDropdown, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Radio, Checkbox, Col } from 'react-bootstrap';
import 'whatwg-fetch';

class EditControl extends FormControl {
	constructor(props) {
		super(props);
	}

	render() {
		const props = Object.assign({}, this.props);
		let text = props.text;
		delete props.edit;
		delete props.text;

		if (this.props.edit) {
			if (this.props.componentClass == "select") {
				const options = props.options;
				delete props.options;
				// delete props.defaultValue;

				let options_tag = options.map(function(opt) {
					return <option key={opt[0]} value={opt[0]}>{T.translate(opt[1])}</option>
				});

				return <FormControl {...props}>{options_tag}</FormControl>
			} else if (this.props.componentClass == "checkbox") {
				delete this.props.componentClass;
				return <Checkbox {...props} />
			} else {
				return <FormControl {...props} />
			}
		}

		if (this.props.componentClass == "textarea") {
			if (props.defaultValue) return <pre>{props.defaultValue}</pre>

			return <span></span>;
		}

		if (this.props.type == "password") {
			text = "**********";
		}

		return <FormControl.Static><T.span text={text ? text : props.defaultValue}/></FormControl.Static>
	}

}

class Notice extends React.Component {
	constructor(props) {
		super(props);
		this.notice = 0;
		this.state = {msg: null, msgs: [], max: 0}; // if max > 0 then show as dropdown
		this.handleNotification = this.handleNotification.bind(this);
	}

	componentDidMount() {
		window.addEventListener("notification", this.handleNotification);
	}

	componentWillUnmount() {
		window.removeEventListener("notification", this.handleNotification);
	}

	handleNotification(e) {
		const _this = this;

		if (e.detail.level == "max") {
			this.setState({max: parseInt(e.detail.msg)});
			return;
		}else if (e.detail.level == "online" || e.detail.level == "offline") {
			this.setState({msg: e.detail.msg, level: e.detail.level});
			this.state.msgs.unshift({msg: e.detail.msg, level: e.detail.level});
			if (this.state.msgs.length > 10) {
				this.state.msgs.pop();
			}
			_this.notice++;
			let clear_notice = function() {
				if (--_this.notice == 0) _this.setState({msg: null, level: 'none'});
			};
			setTimeout(clear_notice, e.detail.timeout ? e.detail.timeout : 3000);
			return;
		}

		if (this.state.max > 0) {

			this.state.msgs.unshift({msg: e.detail.msg, level: e.detail.level});
			if (this.state.msgs.length > this.state.max) {
				this.state.msgs.pop();
			}
			this.setState({msg: e.detail.msg});
		}else {
			this.setState({msg: e.detail.msg, level: e.detail.level});
		}

		console.log("notice", e);
		this.notice++;

		const clear_notice = function() {
			if (--_this.notice == 0) _this.setState({msg: null, level: 'none'});
		};

		setTimeout(clear_notice, e.detail.timeout ? e.detail.timeout : 3000);
	}

	render() {
		let class_name = 'none';

		if (this.state.msg) class_name = 'info';
		if (this.state.level == 'error' || this.state.level == 'offline') class_name = 'error';
		if (this.state.max > 0) class_name = 'none';

 		if (this.state.msgs.length > 0) {
			return <NavDropdown id="notifications" key="notifications" eventKey="notifications" title={<span className={class_name}>{this.state.msg||""}</span>}>
			{
				this.state.msgs.map((msg, i)=> {
					return <MenuItem key={i} eventKey={i} id={i}><span style={{color: msg.level == "online" ? "green" : (msg.level == "offline") ? "red" : "#9d9d9d"}}>{msg.msg}</span></MenuItem>
				})
			}
			</NavDropdown>
		}
		return <NavItem>
			<span className={class_name} id='notification'>{this.state.msg}</span>
		</NavItem>
	}
}

function xFetch(path, options) {
	if (!options) options = {};

	options = Object.assign({credentials: 'include'}, options);

	return fetch(path, options);
}

function xFetchJSON(path, options) {
	if (!options) options = {};

	options = Object.assign({credentials: 'include'}, options);

	if (!options.headers && options.body && (
		options.method == 'POST' ||
		options.method == 'PUT'  ||
		options.method == 'PATCH'||
		options.method == 'DELETE' )) { // default body to JSON
		options.headers = {"Content-Type": "application/json"};
	}

	return fetch(path, options).then((response) => {
		if (response.status < 200 || response.status > 299) {
			return Promise.reject('[' + response.status + '] ' + response.statusText)
		}

		return response.json();
	});
}

export {EditControl, xFetch, xFetchJSON, Notice};
