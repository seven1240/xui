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

class NewUser extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		console.log("submit...");
		var user = form2json('#newUserForm');
		console.log("user", user);

		if (!user.extn || !user.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/users", {
			method: "POST",
			body: JSON.stringify(user)
		}).then((obj) => {
			user.id = obj.id;
			this.props.handleNewUserAdded([user]);
		}).catch((msg) => {
			console.error("user:", msg);
			this.setState({errmsg: msg});
		});
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.handleNewUserAdded;

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New User" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newUserForm">
				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Number" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="extn" placeholder="1000" /></Col>
				</FormGroup>

				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="route_to_beijing" /></Col>
				</FormGroup>

				<FormGroup controlId="formPassword">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Password" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="password" name="password" placeholder="a$veryComplicated-Passw0rd" /></Col>
				</FormGroup>

				<FormGroup controlId="formVMPassword">
					<Col componentClass={ControlLabel} sm={2}><T.span text="VM Password"/></Col>
					<Col sm={10}><FormControl type="password" name="vm_password" placeholder="12345678900" /></Col>
				</FormGroup>

				<FormGroup controlId="formContext">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Context" /></Col>
					<Col sm={10}><FormControl type="input" name="context" defaultValue="default"/></Col>
				</FormGroup>

				<FormGroup controlId="formCidName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Name"/></Col>
					<Col sm={10}><FormControl type="input" name="cid_name" placeholder="1000" /></Col>
				</FormGroup>

				<FormGroup controlId="formCidNumber">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number" /></Col>
					<Col sm={10}><FormControl type="input" name="cid_number" placeholder="11" /></Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={10}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Save" />
						</Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
				</FormGroup>
			</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>
					<i className="fa fa-times" aria-hidden="true"></i>&nbsp;
					<T.span text="Close" />
				</Button>
			</Modal.Footer>
		</Modal>;
	}
}

class ImportUser extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		console.log("submit...");
		var info = form2json('#importUserForm');
		console.log("info", info);

		if (!info.info) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		var inputInfo = info.info.split(/\r?\n/);
		var users = [];

		for (var i = 0; i < inputInfo.length; i++) {

			var inputInfoI = inputInfo[i];

			inputInfoI = inputInfoI.split("\t");

			var user = {};
			user.extn = inputInfoI[0];
			user.name = inputInfoI[1];
			user.password = inputInfoI[2];
			user.context = inputInfoI[3] || 'default';
			user.cid_name = inputInfoI[4];
			user.cid_number = inputInfoI[5];
			user.vm_password = inputInfoI[6];
			users.push(user);
		}

		xFetchJSON("/api/users",{
			method: "POST",
			body: JSON.stringify(users)
		}).then((newUsers) => {
			console.log("users created", newUsers);
			this.props.handleNewUserAdded(newUsers);
		}).then((msg) => {
			console.error("user", msg);
			this.setState({errmsg: <T.span text={{key: "Internal Error", msg: msg}}/>});
		});
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.handleNewUserAdded;

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Import New Users" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="importUserForm">
				<FormGroup controlId="formExtn">
					<Col sm={12}><FormControl componentClass="textarea" name="info" rows="5"
					placeholder={"1000\tSeven\t1234\n1001\t杜金房\t1234\tdefault\n1002\tMike\t1234\tdefault\t1002\tMike\t1002"} />
					</Col>
				</FormGroup>

				<FormGroup>
					<Col sm={12}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Import" />
						</Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
				</FormGroup>

				<FormGroup>
					<Col sm={12}>
						<T.span text="说明：导入以制表符分隔的数据，数据可以在Excel中制作，按格式直接粘贴即可导入。" />
						<br/>
						<T.span text="格式："/>
						&lt;<T.span className="mandatory" text="Extn"/>&gt;&nbsp;
						&lt;<T.span className="mandatory" text="Name"/>&gt;&nbsp;
						&lt;<T.span className="mandatory" text="Password"/>&gt;&nbsp;
						[<T.span text="Context"/>]&nbsp;
						[<T.span text="CID Number"/>]&nbsp;
						[<T.span text="CID Name"/>]&nbsp;
						[<T.span text="VM Password"/>]&nbsp;
					</Col>
				</FormGroup>
			</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>
					<i className="fa fa-times" aria-hidden="true"></i>&nbsp;
					<T.span text="Close" />
				</Button>
			</Modal.Footer>
		</Modal>;
	}
}

class UserPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {user: {}, edit: false, groups: [], wechat_user: {}, formShow: '', style1: 'none'};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleGroup = this.handleGroup.bind(this);
		this.handleUnBind = this.handleUnBind.bind(this);
		this.handleChangePassword = this.handleChangePassword.bind(this);
		this.handleControlPassword = this.handleControlPassword.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var user = form2json('#newUserForm');
		console.log("user", user);

		if (!user.extn || !user.name) {
			notify(<T.span text="Mandatory fields left blank"/>, "error");
			return;
		}

		xFetchJSON("/api/users/" + user.id, {
			method: "PUT",
			body: JSON.stringify(user)
		}).then(() => {
			this.setState({user: user, edit: false})
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("users", msg);
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	handleControlPassword(e) {
		this.setState({style1: 'block'});
	}

	handleUnBind(e) {
		xFetchJSON("/api/users/" + this.state.user.id + "/unbind", {
			method: "PUT"
		}).then((data) => {
			this.setState({formShow: 'none'});
		}).catch((msg) => {
			console.error("users", msg);
		});
	}

	handleGroup(e) {
		var group_id = e.target.value;
		var user_id = this.state.user.id;

		if (e.target.checked) {
			var gtype = "POST";
		} else {
			var gtype = "DELETE";
		}

		const user_group = {
			user_id: user_id,
			group_id: group_id
		};

		xFetchJSON("/api/user_groups", {
				method: gtype,
				body: JSON.stringify(user_group)
		}).then((data) => {
			console.info("g", data);
		}).catch((msg) => {
			console.error("err", msg);
			notify(msg, 'error');
		});
	}

	componentDidMount() {
		xFetchJSON("/api/users/" + this.props.params.id).then((data) => {
			console.log("user", data);
			this.setState({user: data});
		}).catch((msg) => {
			console.log("get user ERR");
			notify(<T.span text={{key: "Internal Error", msg: msg}}/>, "error");
		});

		xFetchJSON("/api/wechat_users/" + this.props.params.id).then((data) => {
			console.log("wechat_user", data[0]);
			if (!data.user_id) {
				this.setState({wechat_user: {}});
			};
			this.setState({wechat_user: data[0]});
		}).catch((msg) => {
			console.log("no wechat_user linked to this user");
		});

		xFetchJSON("/api/user_groups/" + this.props.params.id).then((data) => {
			console.log("groups", data)
			this.setState({groups: data});
		}).catch((e) => {
			console.log("get groups ERR");
		});
	}

	handleChangePassword() {
		var _this = this;
		console.log("submit...");
		var pass = form2json('#passwordForm');
		pass.id = _this.state.user.id;
		console.log('paasssssssssssssssssss', pass)

		if (!pass.password || !(pass.password == pass.password2)) {
			this.setState({errmsg: "Password confirmation doesn't match"});
			return;
		}

		xFetchJSON("/api/users/changepassword", {
			method: "PUT",
			body: JSON.stringify(pass)
		}).then((res) => {
			console.log("res", res);
			notify(<T.span text="Password successfully changed"/>);
		}).catch((msg) => {
			console.error("pass:", msg);
			this.setState({errmsg: msg});
		});
		this.setState({style1: "none"});
	}

	render() {
		const user = this.state.user;
		const wechat_user = this.state.wechat_user;
		let save_btn = "";
		let err_msg = "";
		let src = wechat_user.headimgurl;
		let sex = wechat_user.sex == 1 ? '男' : '女';
		const style = {width: '50px'};

		if (this.state.edit) {
			save_btn = <Button onClick={this.handleSubmit}><i className="fa fa-save" aria-hidden="true"></i>&nbsp;<T.span text="Save"/></Button>
		}

		const groups = this.state.groups.map(function(row) {
			return <Checkbox name="group" key={row.id} defaultChecked={row.checkshow} value={row.id}>{row.name}</Checkbox>
		});

		this.state.formShow = this.state.wechat_user.user_id ? 'block' : 'none';
		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				<Button onClick={this.handleControlPassword}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;
					<T.span text="Change Password"/>
				</Button>
				{err_msg} { save_btn }
				<Button onClick={this.handleControlClick}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;
					<T.span text="Edit"/>
				</Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="User"/> <small>{user.name} &lt;{user.extn}&gt;</small></h1>
			<hr/>

			<Form horizontal id="newUserForm">
				<input type="hidden" name="id" defaultValue={user.id}/>
				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Number" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="extn" defaultValue={user.extn}/></Col>
				</FormGroup>

				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={user.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formVMPassword">
					<Col componentClass={ControlLabel} sm={2}><T.span text="VM Password"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="vm_password" defaultValue={user.vm_password} type="password" /></Col>
				</FormGroup>

				<FormGroup controlId="formContext">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Context" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="context" defaultValue={user.context}/></Col>
				</FormGroup>

				<FormGroup controlId="formCidName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Name"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="cid_name" defaultValue={user.cid_name}/></Col>
				</FormGroup>

				<FormGroup controlId="formCidNumber">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="cid_number" defaultValue={user.cid_number}/></Col>
				</FormGroup>

				<FormGroup controlId="formCIDR">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CIDR" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="user_cidr" defaultValue={user.user_cidr}/></Col>
				</FormGroup>

				<FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="type" defaultValue={user.type}/></Col>
				</FormGroup>

				<FormGroup controlId="formSave">
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={10}>{save_btn}</Col>
				</FormGroup>
			</Form>

			<br/>
			<Form horizontal id="userGroupForm">
				<FormGroup onChange={this.handleGroup}>
					<Col componentClass={ControlLabel} sm={2}><T.span text="Groups"/></Col>
					<Col sm={10}>{groups}</Col>
				</FormGroup>
			</Form>

			<div style={{display: this.state.style1}}>
			<h3><T.span text="Change Password"/></h3>
			<Form horizontal id="passwordForm">
				<FormGroup controlId="formOldPassword">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Old Password" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="password" name="old_password"/></Col>
				</FormGroup>

				<FormGroup controlId="formPassword">
					<Col componentClass={ControlLabel} sm={2}><T.span text="New Password" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="password" name="password" placeholder="a$veryComplicated-Passw0rd" /></Col>
				</FormGroup>

				<FormGroup controlId="formConfirmPassword">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Confirm Password" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="password" name="password2" placeholder="a$veryComplicated-Passw0rd" /></Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={10}>
						<Button type="button" bsStyle="primary" onClick={this.handleChangePassword}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Save" />
						</Button>
						&nbsp;&nbsp;
						<T.span className="danger" text={this.state.errmsg}/>
					</Col>
				</FormGroup>
			</Form>
			</div>

			<br/>
			<Form horizontal id="WechatUserForm" style={{display: this.state.formShow}}>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				<Button onClick={this.handleUnBind}><i className="fa fa-chain-broken" aria-hidden="true"></i>&nbsp;
					<T.span text="解除微信绑定"/>
				</Button>
			</ButtonGroup>

			</ButtonToolbar>
				<br /><br />
				<input type="hidden" name="id" defaultValue={wechat_user.id}/>
				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="OpenID"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechat_user.openid}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="UnionID"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechat_user.unionid}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Headimgurl"/></Col>
					<Col sm={10}><FormControl.Static><img src={src} style={style}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Nickname"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechat_user.nickname}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Sex"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={sex}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Province"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechat_user.province}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="City"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechat_user.city}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Country"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechat_user.country}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Language"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechat_user.language}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Privilege"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechat_user.privilege}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="App_type"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={wechat_user.app_type}/></FormControl.Static></Col>
				</FormGroup>
			</Form>
		</div>
	}
}

class UsersPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false, formShow1: false};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		} else if (data == "import") {
			this.setState({ formShow1: true});
		};
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/users/" + id, {
			method: "DELETE"
		}).then((data) => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			this.setState({rows: rows});
		}).catch((msg) => {
			console.error("user", msg);
			notify(msg, 'error');
		});
	}

	handleClick(x) {
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentDidMount() {
		xFetchJSON("/api/users").then((data) => {
			console.log("users", data)
			this.setState({rows: data});
		}).catch((msg) => {
			console.log("get users ERR", msg);
			notify(<T.span text={{key: "Internal Error", msg: msg}}/>, 'error');
		});
	}

	handleFSEvent(v, e) {
	}

	handleUserAdded(users) {
		var rows = users.concat(this.state.rows);
		this.setState({rows: rows, formShow: false, formShow1: false});
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let formClose1 = () => this.setState({ formShow1: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let hand = { cursor: "pointer"};
	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/users/${row.id}`}>{row.extn}</Link></td>
					<td>{row.name}</td>
					<td>{row.context}</td>
					<td>{row.domain}</td>
					<td>{row.type}</td>
					<td>{row.cid_name}</td>
					<td>{row.cid_number}</td>
					<td><T.a style={hand} onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <div>
			<ButtonToolbar className="pull-right">
				<ButtonGroup>
					<Link to={`/settings/wechat_users`} className="btn btn-default">
						<img src="/assets/img/wechat.png" style={{width: "20px"}}/>&nbsp;
						<T.span text="Wechat User"/>
					</Link>
				</ButtonGroup>

				<ButtonGroup>
				<Button onClick={this.handleControlClick} data="new">
					<i className="fa fa-plus" aria-hidden="true" onClick={this.handleControlClick} data="new"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="New" />
				</Button>
				</ButtonGroup>

				<ButtonGroup>
				<Button onClick={this.handleControlClick} data="import">
					<i className="fa fa-plus" aria-hidden="true" onClick={this.handleControlClick} data="import"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="import" text="Import" />
				</Button>
				</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Users"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Number"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Context"/></th>
					<th><T.span text="Domain"/></th>
					<th><T.span text="Type"/></th>
					<th><T.span text="CID Name"/></th>
					<th><T.span text="CID Number"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewUser show={this.state.formShow} onHide={formClose} handleNewUserAdded={this.handleUserAdded.bind(this)}/>
			<ImportUser show={this.state.formShow1} onHide={formClose1} handleNewUserAdded={this.handleUserAdded.bind(this)}/>
		</div>
	}
}

export {UsersPage, UserPage};
