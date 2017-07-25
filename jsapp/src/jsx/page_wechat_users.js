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
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { EditControl, xFetchJSON } from './libs/xtools'

class WechatUserPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = { wechatuser: {} };
	}

	componentDidMount() {
		xFetchJSON("/api/wechat_users/" + this.props.params.id).then((data) => {
			console.log("wechatuser", data);
			this.setState({wechatuser: data});
		}).catch((msg) => {
			console.log("get wechatuser ERR");
			notify(<T.span text={{key: "Internal Error", msg: msg}}/>, "error");
		});
	}

	render() {
		const wechatuser = this.state.wechatuser;
		let err_msg = "";
		let src = wechatuser.headimgurl;
		let sex;
		if (wechatuser.sex == 1) {
			sex = '男';
		} else if (wechatuser.sex == 2) {
			sex = '女';
		} else {
			sex = '未知';
		};

		const style = { width: '50px' };
		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				{err_msg}
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Wechat User"/> <small>{wechatuser.nickname}</small></h1>
			<hr/>

			<Form horizontal id="newWechatUserForm">
				<input type="hidden" name="id" defaultValue={wechatuser.id}/>
				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Nickname"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechatuser.nickname}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Country"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechatuser.country}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Province"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechatuser.province}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="City"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechatuser.city}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Sex"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={sex}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Language"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechatuser.language}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Privilege"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechatuser.privilege}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Headimgurl"/></Col>
					<Col sm={10}><FormControl.Static><img src={src} style={style}/></FormControl.Static></Col>
				</FormGroup>
			</Form>
		</div>
	}
}

class WechatUsersPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {rows: [], danger: false};

		// This binding is necessary to make `this` work in the callback
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/wechat_users/" + id, {
			method: "DELETE"
		}).then((data) => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			this.setState({rows: rows});
		}).catch((msg) => {
			console.error("wechatuser", msg);
			notify(msg, 'error');
		});
	}

	componentDidMount() {
		xFetchJSON("/api/wechat_users").then((data) => {
			console.log("wechatusers", data)
			this.setState({rows: data});
		}).catch((msg) => {
			console.log("get wechatusers ERR", msg);
			notify(<T.span text={{key: "Internal Error", msg: msg}}/>, 'error');
		});
	}

	render() {
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let hand = { cursor: "pointer"};
	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		var rows = this.state.rows.map(function(row) {
			let sex;
			if (row.sex == 1) {
				sex = T.translate("Male");
			} else if (row.sex == 2) {
				sex = T.translate("Female");
			} else {
				sex = T.translate("Unknown");
			};

			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/wechat_users/${row.id}`}>{row.nickname}</Link></td>
					<td>{row.user_name}</td>
					<td>{row.city}</td>
					<td>{sex}</td>
					<td><T.a style={hand} onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <div>
			<h1><T.span text="Wechat Users"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Nickname"/></th>
					<th><T.span text="Username"/></th>
					<th><T.span text="City"/></th>
					<th><T.span text="Sex"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>
		</div>
	}
}

export {WechatUsersPage, WechatUserPage};
