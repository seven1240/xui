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
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Radio, Col, HelpBlock } from 'react-bootstrap';
import { Link } from 'react-router';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek'
import { EditControl,xFetchJSON } from './libs/xtools';
import verto from './verto/verto';
import parseXML from './libs/xml_parser';

class NewGateway extends React.Component {
	constructor(props) {
		super(props);
		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var gw = form2json('#newGatewayForm');
		console.log("gw", gw);

		if (!gw.name || !gw.realm) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/gateways", {
			method:"POST",
			body: JSON.stringify(gw)
		}).then((obj) => {
			gw.id = obj.id;
			_this.props.handleNewGatewayAdded(gw);
		}).catch((msg) => {
			console.error("gateway", msg);
			_this.setState({errmsg: '' + msg + ''});
		});
	}

	render() {
		console.log(this.props);

		const props = Object.assign({}, this.props);
		const gateways = props.gateways;
		const sip_profiles = props.sip_profiles;
		delete props.gateways;
		delete props.sip_profiles;
		delete props.handleNewGatewayAdded;
		let defaultProfileID = 2;

		const gateways_options = gateways.map(gw => {
			return <option value={gw.id} key={gw.id}>Gateway[{gw.name}]</option>
		});

		sip_profiles.forEach((profile) => {
			if (profile.name == 'public') { // default to public if exists
				defaultProfileID = profile.id;
			}
		});

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Gateway" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newGatewayForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="gw1" /></Col>
				</FormGroup>

				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Server" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="realm" placeholder="example.com" /></Col>
				</FormGroup>

				<FormGroup controlId="formUsername">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Username" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="username" placeholder="username" /></Col>
				</FormGroup>

				<FormGroup controlId="formPassword">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Password" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="password" name="password" placeholder="a$veryComplicated-Passw0rd" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description"/></Col>
					<Col sm={10}><FormControl type="input" name="description" placeholder="Description ..." /></Col>
				</FormGroup>

				<FormGroup controlId="formSipProfile">
					<Col componentClass={ControlLabel} sm={2}><T.span text="SIP Profile"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="profile_id" defaultValue={defaultProfileID}>
							{
								sip_profiles.map((profile) => {
									return <option key = {profile.id} value={profile.id}>[{profile.name}] {profile.description}</option>
								})
							}
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formTemplate">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Template"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="template">
							<option value="default">Default</option>
							{gateways_options}
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formRegister">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Register"/></Col>
					<Col sm={10}>
						<Radio name="register" value="yes" inline defaultChecked><T.span text="yes"/></Radio>
						<Radio name="register" value="no" inline><T.span text="no"/></Radio>
					</Col>
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

class AddNewParam extends React.Component {
	constructor(props) {
		super(props);
		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var param = form2json('#newParamAddForm');
		console.log("param", param);

		if (!param.k || !param.v) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}
		xFetchJSON("/api/gateways/" + _this.props.profile_id + "/params/", {
			method:"POST",
			body: JSON.stringify(param)
		}).then((obj) => {
			param.id = obj.id;
			_this.props.handleNewParamAdded(param);
		}).catch((msg) => {
			console.error("gateway", msg);
			_this.setState({errmsg: '' + msg + ''});
		});
	}

	render() {
		console.log(this.props);

		const props = Object.assign({}, this.props);
		delete props.handleNewParamAdded;
		delete props.profile_id;

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Add Param" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newParamAddForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="k" placeholder="Name" /></Col>
				</FormGroup>

				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Value" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="v" placeholder="Value" /></Col>
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

class GatewayPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: '', gw: {}, edit: false, params:[], sip_profiles: [], sip_profile: [], danger: false, formShow: false, class_name: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleSort = this.handleSort.bind(this);
		this.toggleHighlight = this.toggleHighlight.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleToggleParam = this.handleToggleParam.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleChangeValueK = this.handleChangeValueK.bind(this);
		this.handleFSEvent = this.handleFSEvent.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		var gw = form2json('#gatewayForm');

		if (!gw.realm || !gw.name || !gw.username) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		if (gw.password == "") delete gw.password;

		xFetchJSON( "/api/gateways/" + gw.id, {
			method: "PUT",
			body: JSON.stringify(gw)
		}).then((obj) => {
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
			_this.setState({gw: gw, edit: false})
		}).catch((msg) => {
			console.log("", msg)
		});
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);

		if (data == "edit") {
			this.setState({edit: !this.state.edit});
		} else if (data == "new") {
			this.setState({formShow: true});
		};
	}

	componentWillUnmount() {
		verto.unsubscribe("FSevent.custom::sofia::gateway_delete");
		verto.unsubscribe("FSevent.custom::sofia::gateway_add");
		verto.unsubscribe("FSevent.custom::sofia::gateway_state");
	}

	componentDidMount() {
		var _this = this;

		xFetchJSON( "/api/gateways/" + this.props.params.id, {
		}).then((data) => {
			const params = data.params;
			delete data.params;

			if (data.profile_id) {
				xFetchJSON("/api/sip_profiles/" + data.profile_id).then((obj) => {
					_this.setState({sip_profile: obj});
					data.profile_name = obj.name;
				});
			}

			if (!isString(data.profile_name) || !data.profile_name.length) data.profile_name = "public";
			_this.setState({gw: data, params: params});
		}).catch((msg) => {
			console.log("get gw ERR");
		});

		xFetchJSON( "/api/sip_profiles").then((data) => {
			_this.setState({sip_profiles: data});
		});

		verto.subscribe("FSevent.custom::sofia::gateway_delete", {handler: this.handleFSEvent});
		verto.subscribe("FSevent.custom::sofia::gateway_add", {handler: this.handleFSEvent});
		verto.subscribe("FSevent.custom::sofia::gateway_state", {handler: this.handleFSEvent});
	}

	handleFSEvent(v, e) {
		console.log('FSevent', e);
		let class_name = "";

		if (e.eventChannel == "FSevent.custom::sofia::gateway_add") {
			console.log("gateway_add", e.data.Gateway);
			class_name = "NOREG"
		} else if (e.eventChannel == "FSevent.custom::sofia::gateway_delete") {
			console.log("gateway_delete", e.data.Gateway);
			class_name = "NONE"
		} else if (e.eventChannel == "FSevent.custom::sofia::gateway_state") {
			class_name = e.data.State;
		}

		this.setState({class_name: class_name});
	}

	handleSort(e){
		var params = this.state.params;

		var field = e.target.getAttribute('data');
		var n = 1;

		if (this.state.order == 'ASC') {
			this.state.order = 'DSC';
			n = -1;
		} else {
			this.state.order = 'ASC';
		}

		params.sort(function(a,b) {
			return a[field].toUpperCase() < b[field].toUpperCase() ? -1 * n : 1 * n;
		});

		this.setState({params: params});
	}

	toggleHighlight() {
		this.setState({highlight: !this.state.highlight});
	}

	isStringAcceptable() {
		return true;
	}

	handleChange(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];

		console.log("change", obj);

		xFetchJSON( "/api/gateways/" + this.state.gw.id + "/params/" + id, {
			method: "PUT",
			body: JSON.stringify({v: obj[id]})
		}).then((param) => {
			console.log("success!!!!", param);
			_this.state.params = _this.state.params.map(function(p) {
				if (p.id == id) {
					return param;
				}
				return p;
			});
			_this.setState({params: _this.state.params});
		}).catch((msg) => {
			console.log("update params",msg)
		});
	}

	handleChangeValueK(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];

		console.log("change", obj);

		xFetchJSON( "/api/gateways/" + this.state.gw.id + "/params/" + id, {
			method: "PUT",
			body: JSON.stringify({k: obj[id]})
		}).then((param) => {
			console.log("success!!!!", param);
			_this.state.params = _this.state.params.map(function(p) {
				if (p.id == id) {
					return param;
				}
				return p;
			});
			_this.setState({params: _this.state.params});
		}).catch((msg) => {
			console.error("update params", msg);
		});
	}

	handleToggleParam(e) {
		const _this = this;
		const data = e.target.getAttribute("data");

		xFetchJSON("/api/gateways/" + this.state.gw.id + "/params/" + data, {
			method: "PUT",
			body: JSON.stringify({action: "toggle"})
		}).then((param) => {
			const params = _this.state.params.map(function(p) {
					if (p.id == data) {
						p.disabled = param.disabled;
					}
					return p;
				});
			_this.setState({params: params});
		}).catch((msg) => {
			console.error("toggle params", msg);
		});
	}

	handleReg(e) {
		verto.fsAPI("sofia", "profile " + this.state.gw.profile_name + " register " + this.state.gw.name);
	}

	handleUnreg(e) {
		verto.fsAPI("sofia", "profile " + this.state.gw.profile_name + " unregister " + this.state.gw.name);
	}

	handleStart(e) {
		verto.fsAPI("sofia", "profile " + this.state.gw.profile_name + " startgw " + this.state.gw.name);
		// verto.fsAPI("sofia", "profile " + this.state.gw.profile_name + " rescan");
	}

	handleStop(e) {
		verto.fsAPI("sofia", "profile " + this.state.gw.profile_name + " killgw " + this.state.gw.name);
	}

	handleDelete(param_id) {
		console.log("deleting param_id", param_id);
		var _this = this;

		if (!_this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}
		xFetchJSON("/api/gateways/" + _this.state.gw.id + "/param/" + param_id, {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			var params = _this.state.params.filter(function(param) {
				return param.id != param_id;
			});

			_this.setState({params: params});
			console.log(_this.state.params)
		}).catch((msg) => {
			console.log("getways",msg)
		});
	}

	handleParamAdded(param) {
		console.log("param", param);
		var params = this.state.params;
		params.unshift(param);
		this.setState({params: params, formShow: false});
	}

	render() {
		const gw = this.state.gw;
		const _this = this;
		let formClose = () => _this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let hand = { cursor: "pointer" };
		var danger = this.state.danger ? "danger" : "";
		let params = <tr></tr>;
		let save_btn = "";
		let register = gw.register == "yes" ? "yes" : "no";

		const sip_profile_options = this.state.sip_profiles.map(function(row) {
			return [row.id, row.name];
		});

		register = <FormControl.Static><T.span text={register}/></FormControl.Static>

		if (this.state.params && Array.isArray(this.state.params)) {
			params = this.state.params.map(function(param) {
				const enabled_style = dbfalse(param.disabled) ? "success" : "default";
				const disabled_class = dbfalse(param.disabled) ? null : "disabled";

				return <tr key={param.id} className={disabled_class}>
					<td><RIEInput value={_this.state.highlight ? (param.k ? param.k : T.translate("Click to Change")) : param.k} change={_this.handleChangeValueK}
						propName={param.id}
						className={_this.state.highlight ? "editable" : ""}
						validate={_this.isStringAcceptable}
						classLoading="loading"
						classInvalid="invalid"/>
					</td>
					<td><RIEInput value={_this.state.highlight ? (param.v ? param.v : T.translate("Click to Change")) : param.v} change={_this.handleChange}
						propName={param.id}
						className={_this.state.highlight ? "editable long-input" : "long-input"}
						validate={_this.isStringAcceptable}
						classLoading="loading"
						classInvalid="invalid"/>
					</td>
					<td>
						<Button onClick={_this.handleToggleParam} data={param.id} bsStyle={enabled_style}>
							{dbfalse(param.disabled) ? T.translate("Yes") : T.translate("No")}
						</Button>
					</td>
					<td>
						<T.a onClick={() => _this.handleDelete(param.id)} text="Delete" className={danger} style={{cursor:"pointer"}}/>
					</td>
				</tr>
			});
		}

		if (this.state.edit) {
			save_btn = <Button onClick={this.handleSubmit}><T.span onClick={this.handleSubmit} text="Save"/></Button>

			if (gw.register == "yes") {
				register = <span>
					<Radio name="register" value="yes" inline defaultChecked><T.span text="yes"/></Radio>
					<Radio name="register" value="no" inline><T.span text="no"/></Radio>
				</span>
			} else {
				register = <span>
					<Radio name="register" value="yes" inline><T.span text="yes"/></Radio>
					<Radio name="register" value="no" inline defaultChecked><T.span text="no"/></Radio>
				</span>
			}
		}

		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				<Button onClick={_this.handleReg.bind(_this)} ><i className="fa fa-square" aria-hidden="true"></i>&nbsp;<T.span text="Reg" /></Button>
				<Button onClick={_this.handleUnreg.bind(_this)} ><i className="fa fa-square-o" aria-hidden="true"></i>&nbsp;<T.span text="Unreg" /></Button>
				<Button onClick={_this.handleStart.bind(_this)} ><i className="fa fa-circle" aria-hidden="true"></i>&nbsp;<T.span text="Start" /></Button>
				<Button onClick={_this.handleStop.bind(_this)} ><i className="fa fa-circle-o" aria-hidden="true"></i>&nbsp;<T.span text="Stop" /></Button>
			</ButtonGroup>
			<ButtonGroup>
				{ save_btn }
				<Button onClick={this.handleControlClick} data="edit">
					<i className="fa fa-edit" aria-hidden="true" onClick={this.handleControlClick} data="edit"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="edit" text="Edit"/>
				</Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Gateway"/><small className={this.state.class_name}>&nbsp;{gw.name} {gw.username}</small></h1>
			<hr/>

			<Form horizontal id="gatewayForm">
				<input type="hidden" name="id" defaultValue={gw.id}/>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={gw.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realm" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="realm" defaultValue={gw.realm}/></Col>
				</FormGroup>

				<FormGroup controlId="formUsername">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Username" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="username" defaultValue={gw.username}/></Col>
				</FormGroup>

				<FormGroup controlId="formPassword">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Password"/></Col>
					<Col sm={10}>
						<EditControl edit={this.state.edit} name="password" type="password"/>
						{
							!this.state.edit ? null :
							<HelpBlock><T.span text="Leave black if you do not want to change the password"/></HelpBlock>
						}
					</Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="description" defaultValue={gw.description}/></Col>
				</FormGroup>

				<FormGroup controlId="formProfileID">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Sip Profile"/></Col>
					<Col sm={10}>
						<EditControl edit={this.state.edit} componentClass="select" name="profile_id" options={sip_profile_options} text={_this.state.sip_profile.name} defaultValue={gw.profile_id}/>
					</Col>
				</FormGroup>

				<FormGroup controlId="formRegister">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Register" /> ?</Col>
					<Col sm={10}>{register}</Col>
				</FormGroup>

				<FormGroup controlId="formSave">
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={10}>{save_btn}</Col>
				</FormGroup>
			</Form>

			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				<Button onClick={this.toggleHighlight}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;<T.span onClick={this.toggleHighlight} text="Edit"/></Button>
			</ButtonGroup>
			<ButtonGroup>
				<Button onClick={this.handleControlClick} data="new">
					<i className="fa fa-plus" aria-hidden="true" onClick={this.handleControlClick} data="new"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="Add"/>
				</Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h2><T.span text="Params"/></h2>
			<table className="table">
				<tbody>
				<tr>
					<th style={{cursor: "pointer"}} onClick={this.handleSort.bind(this)} data="d"><T.span text="Name" data="k"/></th>
					<th><T.span text="Value"/></th>
					<th style={{cursor: "pointer"}} onClick={this.handleSort.bind(this)} data='disabled'><T.span text="Enabled" data="disabled"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{params}
				</tbody>
			</table>
			{this.state.sip_profile.id ? <AddNewParam show={this.state.formShow} onHide={formClose} profile_id={this.state.gw.id} handleNewParamAdded={this.handleParamAdded.bind(this)}/> : null}
		</div>
	}
}

class GatewaysPage extends React.Component {
	constructor(props) {
		super(props);
		this.gwstatus = {};
		this.state = { formShow: false, rows: [], sip_profiles: [], danger: false};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleFSEvent = this.handleFSEvent.bind(this);
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		}
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/gateways/" + id , {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			_this.setState({rows: rows});
		}).catch((msg) => {
			console.error("gateway", msg);
		});
	}

	componentWillUnmount() {
		verto.unsubscribe("FSevent.custom::sofia::gateway_delete");
		verto.unsubscribe("FSevent.custom::sofia::gateway_add");
		verto.unsubscribe("FSevent.custom::sofia::gateway_state");
	}

	componentDidMount() {
		var _this = this;

		xFetchJSON("/api/gateways").then((data) => {
			_this.setState({rows: data.map(function(row) {
				row.class_name = _this.gwstatus[row.name] ? _this.gwstatus[row.name] : 'NONE';
				return row;
			})});
		}).catch((msg) => {
			console.log("get gateways ERR");
		});

		xFetchJSON("/api/sip_profiles").then((data) => {
			_this.setState({sip_profiles: data});
		});

		verto.subscribe("FSevent.custom::sofia::gateway_delete", {handler: this.handleFSEvent});
		verto.subscribe("FSevent.custom::sofia::gateway_add", {handler: this.handleFSEvent});
		verto.subscribe("FSevent.custom::sofia::gateway_state", {handler: this.handleFSEvent});

		verto.fsAPI("sofia", "xmlstatus gateway", function(data) {
			const parser = new DOMParser();
			const doc = parser.parseFromString(data.message, "text/xml");
			console.log('doc', doc);
			const msg = parseXML(doc);
			console.log('msg', msg);

			let gateways = [];

			if (msg) {
				if (isArray(msg)) {
					gateways = msg;
				} else if (isObject(msg)) {
					gateways.push(msg);
				}
			}

			gateways.forEach(function(gw) {
				console.log("gw", gw);
				_this.gwstatus[gw.name] = gw.state;
			});

			let rows = _this.state.rows.map(function(row) {
				row.class_name = _this.gwstatus[row.name];
				console.log('class_name', class_name);
				return row;
			});

			_this.setState({rows: rows});
		});

	}

	handleFSEvent(v, e) {
		console.log('FSevent', e);
		let class_name = "";

		if (e.eventChannel == "FSevent.custom::sofia::gateway_add") {
			console.log("gateway_add", e.data.Gateway);
			class_name = "NOREG"
		} else if (e.eventChannel == "FSevent.custom::sofia::gateway_delete") {
			console.log("gateway_delete", e.data.Gateway);
			class_name = "NONE"
		} else if (e.eventChannel == "FSevent.custom::sofia::gateway_state") {
			class_name = e.data.State;
		}

		let rows = this.state.rows.map(function(row) {
			if (row.name == e.data.Gateway) {
				row.class_name = class_name;
			}
			return row;
		});

		this.setState({rows: rows});
	}

	handleReg(e) {
		e.preventDefault();

		let pname = e.target.getAttribute("data-pname");
		let gname = e.target.getAttribute("data-gname");

		verto.fsAPI("sofia", "profile " + pname + " register " + gname);
	}

	handleUnreg(e) {
		e.preventDefault();

		let pname = e.target.getAttribute("data-pname");
		let gname = e.target.getAttribute("data-gname");

		if (!isString(pname) || !pname.length) pname = "public";
		verto.fsAPI("sofia", "profile " + pname + " unregister " + gname);
	}

	handleStart(e) {
		e.preventDefault();

		let pname = e.target.getAttribute("data-pname");
		let gname = e.target.getAttribute("data-gname");

		if (!isString(pname) || !pname.length) pname = "public";
		verto.fsAPI("sofia", "profile " + pname + " startgw " + gname);
		// verto.fsAPI("sofia", "profile " + pname + " rescan");
	}

	handleStop(e) {
		e.preventDefault();

		let pname = e.target.getAttribute("data-pname");
		let gname = e.target.getAttribute("data-gname");

		if (!isString(pname) || !pname.length) pname = "public";
		verto.fsAPI("sofia", "profile " + pname + " killgw " + gname);
	}

	handleGatewayAdded(gateway) {
		var rows = this.state.rows;
		gateway.class_name = 'NONE';
		rows.unshift(gateway);
		this.setState({rows: rows, formShow: false});
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let hand = { cursor: "pointer"};
	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		_this.state.rows.forEach(function(gw) {
			_this.state.sip_profiles.map(function(profile) {
				if (gw.profile_id == profile.id) {
					gw.profile_name = profile.name;
					return gw;
				}
			})
		});


		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id} className={row.class_name}>
					<td>{row.id}</td>
					<td><Link to={`/settings/gateways/${row.id}`}>{row.name}</Link></td>
					<td>{row.realm}</td>
					<td>{row.username}</td>
					<td><T.span text={row.register}/></td>
					<td>
						<T.a onClick={_this.handleReg} data-gname={row.name} data-pname={row.profile_name} text="Reg" href='#'/> |&nbsp;
						<T.a onClick={_this.handleUnreg} data-gname={row.name} data-pname={row.profile_name} text="Unreg" href='#'/> |&nbsp;
						<T.a onClick={_this.handleStart} data-gname={row.name} data-pname={row.profile_name} text="Start" href='#'/> |&nbsp;
						<T.a onClick={_this.handleStop} data-gname={row.name} data-pname={row.profile_name} text="Stop" href='#'/> |&nbsp;
						<span>{row.class_name}</span>
					</td>
					<td><T.a style={hand} onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <div>
			<ButtonToolbar className="pull-right">
				<Button onClick={this.handleControlClick} data="new">
					<i className="fa fa-plus" aria-hidden="true" onClick={this.handleControlClick} data="new"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="New" />
				</Button>
			</ButtonToolbar>

			<h1><T.span text="Gateways"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Server"/></th>
					<th><T.span text="Username"/></th>
					<th><T.span text="Register"/></th>
					<th><T.span text="Control"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewGateway show={this.state.formShow} onHide={formClose} gateways = {this.state.rows} sip_profiles = {this.state.sip_profiles} handleNewGatewayAdded={this.handleGatewayAdded.bind(this)}/>
		</div>
	}
}

export {GatewaysPage, GatewayPage};
