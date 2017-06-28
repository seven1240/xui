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
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Radio, Col } from 'react-bootstrap';
import { Link } from 'react-router';
// http://kaivi.github.io/riek/
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek'
import { EditControl, xFetchJSON } from './libs/xtools'
import verto from './verto/verto';
import parseXML from './libs/xml_parser';

class NewSIPProfile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var profile = form2json('#newSIPProfileForm');

		if (!profile.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON( "/api/sip_profiles", {
			method: "POST",
			body: JSON.stringify(profile)
		}).then((obj) => {
			profile.id = obj.id;
			_this.props.handleSIPProfileAdded(profile);
		}).catch((msg) => {
			console.error("sip_profile", msg);
			_this.setState({errmsg: '' + msg + ''});
		});
	}

	render() {
		console.log(this.props);

		const props = Object.assign({}, this.props);
		const profiles = props.profiles;
		delete props.profiles;
		delete props.handleSIPProfileAdded;

		const profiles_options = profiles.map(profile => {
			return <option value={profile.id} key={profile.id}>Profile[{profile.name}]</option>
		});

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New SIP Profile" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newSIPProfileForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="profile1" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description"/></Col>
					<Col sm={10}><FormControl type="input" name="description" placeholder="Description ..." /></Col>
				</FormGroup>

				<FormGroup controlId="formTemplate">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Template"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="template">
							<option value="default">Default</option>
							{profiles_options}
						</FormControl>
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
		xFetchJSON("/api/sip_profiles/" + _this.props.profile_id + "/params/", {
			method:"POST",
			body: JSON.stringify(param)
		}).then((obj) => {
			param.id = obj.id;
			_this.props.handleNewParamAdded(param);
		}).catch((msg) => {
			console.error("sip_profiles", msg);
			_this.setState({errmsg: '' + msg + ''});
		});
	}
	render() {
		console.log(this.props);
		const props = Object.assign({}, this.props);
		delete props.handleNewParamAdded;
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

class SIPProfilePage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {profile: {}, edit: false, params:[], order: 'ASC', running: false, danger: false, formShow: false, profileDetails: []};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleToggleParam = this.handleToggleParam.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.toggleHighlight = this.toggleHighlight.bind(this);
		this.handleSort = this.handleSort.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleChangeValueK = this.handleChangeValueK.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var profile = form2json('#newSIPProfileForm');

		if (!profile.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/sip_profiles/" + profile.id, {
			method: "PUT",
			body: JSON.stringify(profile)
		}).then((obj) => {
			_this.setState({profile: profile, edit:false});
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("route", msg);
		});
	}

	handleChangeValueK(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];

		console.log("change", obj);

		xFetchJSON( "/api/sip_profiles/" + this.state.profile.id + "/params/" + id, {
			method: "PUT",
			body: JSON.stringify({k: obj[id]})
		}).then((obj) => {
			console.log("success!!!!", obj);
			const params = _this.state.profile.params.map(function(p) {
				if (p.id == id) {
					return obj;
				}
				return p;
			});
			_this.setState({params: params});
		}).catch((msg) => {
			console.error("update params", msg);
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

	handleParamAdded(param) {
		console.log("param", param);
		var params = this.state.params;
		params.unshift(param);
		this.setState({params: params, formShow: false});
	}

	handleToggleParam(e) {
		const _this = this;
		const data = e.target.getAttribute("data");

		xFetchJSON("/api/sip_profiles/" + this.state.profile.id + "/params/" + data, {
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

	handleChange(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];

		console.log("change", obj);

		xFetchJSON("/api/sip_profiles/" + this.state.profile.id + "/params/" + id, {
			method: "PUT",
			body: JSON.stringify({v: obj[id]})
		}).then((obj) => {
			console.log("success!!!!", obj);
			const params = _this.state.profile.params.map(function(p) {
				if (p.id == id) {
					return obj;
				}
				return p;
			});
			_this.setState({params: params});
		}).catch((msg) => {
			console.error("update params", msg);
		});
	}

	toggleHighlight() {
		this.setState({highlight: !this.state.highlight});
	}

	isStringAcceptable() {
		return true;
	}

	componentDidMount() {
		var _this = this;

		xFetchJSON("/api/sip_profiles/" + this.props.params.id).then((data) => {
			_this.setState({profile: data, params: data.params});
			verto.fsAPI("sofia", "xmlstatus profile " + _this.state.profile.name, function(data) {
				const parser = new DOMParser();
				const doc = parser.parseFromString(data.message, "text/xml");
				console.log('doc', doc);

				const msg = parseXML(doc);
				console.log("msg sip", msg);

				let profile = {};

				if (isArray(msg)) {
					profile = msg[0];
				} else if (isObject(msg)) {
					profile = msg;
				}

				if (profile && _this.state.profile.name == profile.name) {
					_this.setState({running: true});
				}
			});

			verto.fsAPI("sofia", "xmlstatus profile " + this.state.profile.name, function(data) {
				if (!data.message.match('<')) {
					console.log(data);
					notify(data.message, 'error');
					return;
				}

				const parser = new DOMParser();
				const doc = parser.parseFromString(data.message, "text/xml");
				console.log('doc', doc);

				const profile = parseXML(doc);

				const rows = Object.keys(profile).map(function(k, index) {
					return {k: k, v: profile[k]};
				});

				_this.setState({profileDetails: rows});
				console.log('profileDetails', _this.state.profileDetails)
			});
		}).catch((msg) => {
			console.log("get profile/sip_profiles ERR");
		});
		verto.subscribe("FSevent.custom::sofia::profile_start", {
			handler: this.handleFSEvent.bind(this)
		});
		verto.subscribe("FSevent.custom::sofia::profile_stop", {
			handler: this.handleFSEvent.bind(this)
		});
	}

	componentWillUnmount() {
		verto.unsubscribe("FSevent.custom::sofia::profile_start");
		verto.unsubscribe("FSevent.custom::sofia::profile_stop");
	}

	handleFSEvent(v, e) {
		const _this = this;
		if (e.eventChannel == "FSevent.custom::sofia::profile_start") {
			const profile_name = e.data["profile_name"];
			console.log("profile_name",profile_name);
			if(_this.state.profile.name == profile_name) {
				_this.setState({ running : true});
			}
		} else if (e.eventChannel == "FSevent.custom::sofia::profile_stop") {
			const profile_name = e.data["profile_name"];
			if (_this.state.profile.name == profile_name) {
				_this.setState({ running : false});
			}
		}
	}

	handleStart(e){
		verto.fsAPI("sofia", "profile " + this.state.profile.name + " start");
	}

	handleStop(e){
		const _this = this;
		let name = this.state.profile.name;
		verto.fsAPI("sofia", "profile " + name + " stop", function(ret) {
			if (ret.message.match("stopping:")) {
				// trick FS has no sofia::profile_stop event
				var evt = {}
				evt.eventChannel = "FSevent.custom::sofia::profile_stop";
				evt.data = {profile_name: name}
				_this.handleFSEvent(verto, evt);
			} else {
				notify(ret.message);
			}
		});
	}

	handleRestart(e){
		const _this = this;
		let name = this.state.profile.name;
		verto.fsAPI("sofia", "profile " + name + " restart", function(ret) {
			if (ret.message.match("restarting:")) {
				notify("restarting profile ...");
			} else {
				notify(ret.message);
			}
		});
	}

	handleRescan(e){
		verto.fsAPI("sofia", "profile " + this.state.profile.name + " rescan", function(ret) {
			notify(ret.message);
		});
	}


	handleSort(e){
		const profile = this.state.profile;
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
		this.setState({profile: profile});
	}

	handleDelete(param_id) {
		console.log("deleting param_id", param_id);
		var _this = this;
		if (!_this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));
			if (!c) return;
		}

		xFetchJSON("/api/sip_profiles/" + _this.state.profile.id + "/param/" + param_id, {
			method: "DELETE",
		}).then((obj) => {
			console.log("deleted")
			var params = _this.state.params.filter(function(param) {
				return param.id != param_id;
			});
			_this.setState({params: params});
			console.log(_this.state.params)
		}).catch((msg) => {
			console.error("delete", msg);
		});
	}

	render() {
		let formClose = () => _this.setState({ formShow: false });
		const profile = this.state.profile;
		const _this = this;
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let hand = { cursor: "pointer" };
		var danger = this.state.danger ? "danger" : "";
		let save_btn = "";
		let err_msg = "";
		let params = <tr></tr>;
		let color = this.state.running ? "lime" : '#dadada';
		const running_state = {
			background : color,
		} 

		let profiles;

		let profile_params = this.state.profileDetails.map(function(p) {
			return <li key={p.k}>{p.k}: {p.v}</li>;
		})
		profiles = <ul>{profile_params}</ul>;
		if (this.state.params && Array.isArray(this.state.params)) {
			// console.log(this.state.profile.params)
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
					<td><T.a onClick={() => _this.handleDelete(param.id)} text="Delete" className={danger} style={{cursor:"pointer"}}/></td>
				</tr>
			});
		}

		if (this.state.edit) {
			save_btn = <Button onClick={this.handleSubmit}><T.span text="Save"/></Button>
		}

		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup className="block">
				<div style={running_state}></div>
			</ButtonGroup>
			<ButtonGroup>
				<Button onClick={_this.handleStart.bind(_this)}><i className="fa fa-circle" aria-hidden="true"></i>&nbsp;<T.span text="Start"/></Button>
				<Button onClick={_this.handleStop.bind(_this)}><i className="fa fa-circle-o" aria-hidden="true"></i>&nbsp;<T.span text="Stop"/></Button>
				<Button onClick={_this.handleRestart.bind(_this)}><i className="fa fa-circle-o-notch" aria-hidden="true"></i>&nbsp;<T.span text="Restart"/></Button>
				<Button onClick={_this.handleRescan.bind(_this)}><i className="fa fa-refresh" aria-hidden="true"></i>&nbsp;<T.span text="Rescan"/></Button>
			</ButtonGroup>
			<ButtonGroup>
				{ save_btn }
				<Button onClick={this.handleControlClick} data="edit">
					<i className="fa fa-edit" aria-hidden="true" onClick={this.handleControlClick} data="edit"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="edit" text="Edit"/>
				</Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1>Profile <small style={running_state}>{profile.name}</small></h1>
			<hr/>


			<Form horizontal id="newSIPProfileForm">
				<input type="hidden" name="id" defaultValue={profile.id}/>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={profile.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="description" defaultValue={profile.description}/></Col>
				</FormGroup>

				<FormGroup controlId="formSave">
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={10}>{save_btn}</Col>
				</FormGroup>				
			</Form>
			<Form horizontal id="DetailsForm">
				<FormGroup controlId="formDetails">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Details"/></Col>
					<Col sm={10}><EditControl name="details" defaultValue={profiles}/></Col>
				</FormGroup>
			</Form>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				<Button onClick={this.toggleHighlight}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;<T.span text="Edit"/></Button>
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
					<th style={{cursor: "pointer"}} onClick={this.handleSort.bind(this)} data="k"><T.span text="Name" data="k"/></th>
					<th><T.span text="Value"/></th>
					<th style={{cursor: "pointer"}} onClick={this.handleSort.bind(this)} data="disabled"><T.span text="Enabled" data="disabled"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{params}
				</tbody>
			</table>
			{this.state.profile.id ? <AddNewParam show={this.state.formShow} onHide={formClose} profile_id={this.state.profile.id} handleNewParamAdded={this.handleParamAdded.bind(this)}/> : null}
		</div>
	}
}

class SIPProfilesPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false, profileDetails: {}};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		}
	}

	handleDelete(e) {
		e.preventDefault();

		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/sip_profiles/" + id, {
			method: "DELETE",
		}).then((obj) => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			_this.setState({rows: rows});
		}).catch((msg) => {
			console.error("sip", msg);
		});
	}

	handleClick(x) {
	}

	componentWillMount() {
	}

	componentWillUnmount() {
		verto.unsubscribe("FSevent.custom::sofia::profile_start");
		verto.unsubscribe("FSevent.custom::sofia::profile_stop");
	}

	syncSofiaStatus() {
		var _this = this;

		xFetchJSON("/api/sip_profiles").then((data) => {
			_this.setState({rows: data});

			verto.fsAPI("sofia", "xmlstatus", function(data) {
				let rows = [];
				const parser = new DOMParser();
				const doc = parser.parseFromString(data.message, "text/xml");
				console.log('doc', doc);

				const msg = parseXML(doc);

				console.log('msg', msg);

				let profiles = [];

				if (msg) {
					if (isArray(msg.profile)) {
						profiles = msg.profile;
					} else if (isObject(msg.profile)) {
						profiles.push(msg.profile);
					} else if (isArray(msg)) {
						profiles = msg;
					} else if (isObject(msg)) {
						profiles.push(msg);
					}
				}

				profiles.forEach(function(profile) {
					if (profile.type != "profile") return;
					var name = profile.name;

					rows = _this.state.rows.map(function(row) {
						if (row.name == name) row.running = true;
						return row;
					});
				});
				if (rows.length) _this.setState({rows: rows});
			});
		}).catch((msg) => {
			console.log("get sip_profiles ERR",msg);
		});
	}

	componentDidMount() {
		verto.subscribe("FSevent.custom::sofia::profile_start", {
			handler: this.handleFSEvent.bind(this)
		});

		verto.subscribe("FSevent.custom::sofia::profile_stop", {
			handler: this.handleFSEvent.bind(this)
		});

		this.syncSofiaStatus();
	}

	handleFSEvent(v, e) {
		const _this = this;

		if (e.eventChannel == "FSevent.custom::sofia::profile_start") {
			const profile_name = e.data["profile_name"];

			verto.fsAPI("sofia", "xmlstatus profile " + profile_name, function(data) {
				let rows = [];
				const parser = new DOMParser();
				const doc = parser.parseFromString(data.message, "text/xml");
				console.log('doc', doc);

				const msg = parseXML(doc);
				console.log('msg', msg);

				if (msg.name == profile_name) {
					const rows = _this.state.rows.map(function(row) {
						if (row.name == profile_name) {
							row.running = true;
						}
						return row;
					});
					_this.setState({rows: rows});
				} else {
					notify("ERR, profile [" + profile_name + "] start failed!");
				}

			});

		} else if (e.eventChannel == "FSevent.custom::sofia::profile_stop") {
			const profile_name = e.data["profile_name"];

			const rows = _this.state.rows.map(function(row) {
				if (row.name == profile_name) {
					row.running = false;
				}
				return row;
			});

			_this.setState({rows: rows});
		}
	}

	handleSIPProfileAdded(route) {
		var rows = this.state.rows;
		rows.unshift(route);
		this.setState({rows: rows, formShow: false});
	}

	handleStart(e) {
		e.preventDefault();

		let name = e.target.getAttribute("data-name");
		verto.fsAPI("sofia", "profile " + name + " start");
	}

	handleStop(e) {
		e.preventDefault();
		const _this = this;

		let name = e.target.getAttribute("data-name");

		verto.fsAPI("sofia", "xmlstatus profile " + name, function(data) {
			let rows = [];
			const parser = new DOMParser();
			const doc = parser.parseFromString(data.message, "text/xml");
			console.log('doc', doc);

			const msg = parseXML(doc);
			console.log('msg', msg);

			if (msg.name == name) {
				verto.fsAPI("sofia", "profile " + name + " stop", function(ret) {
					if (ret.message.match("stopping:")) {
						// trick FS has no sofia::profile_stop event
						var evt = {}
						evt.eventChannel = "FSevent.custom::sofia::profile_stop";
						evt.data = {profile_name: name}
						_this.handleFSEvent(verto, evt);
					} else {
						notify(ret.message);
					}
				});
			} else {
				notify("ERR, profile [" + name + "] is not running!");
			}

		});
	}

	handleRestart(e) {
		e.preventDefault();
		const _this = this;

		let name = e.target.getAttribute("data-name");
		verto.fsAPI("sofia", "profile " + name + " restart", function(ret) {
			if (ret.message.match("restarting:")) {
				notify("restarting profile ...");
			} else {
				notify(ret.message);
			}
		});
	}

	handleRescan(e) {
		e.preventDefault();

		let name = e.target.getAttribute("data-name");
		verto.fsAPI("sofia", "profile " + name + " rescan", function(ret) {
			notify(ret.message);
		});
	}

	handleMore(e) {
		e.preventDefault();

		this.syncSofiaStatus();

		var _this = this;
		var profile_name = e.target.getAttribute("data-name");

		if (this.state.profileDetails.name) {
			this.setState({profileDetails: {name: undefined}});
			return;
		}

		verto.fsAPI("sofia", "xmlstatus profile " + profile_name, function(data) {
			if (!data.message.match('<')) {
				console.log(data);
				notify(data.message, 'error');
				return;
			}

			const parser = new DOMParser();
			const doc = parser.parseFromString(data.message, "text/xml");
			console.log('doc', doc);

			const profile = parseXML(doc);

			const rows = Object.keys(profile).map(function(k, index) {
				return {k: k, v: profile[k]};
			});

			_this.setState({profileDetails: {name: profile_name, rows: rows}});
		});
	}

	HandleToggleProfile(e) {
		const profile_id = e.target.getAttribute("data");
		const _this = this;

		xFetchJSON("/api/sip_profiles/" + profile_id, {
			method: "PUT",
			body: JSON.stringify({action: 'toggle'})
		}).then((profile) => {
			const rows = _this.state.rows.map(function(row) {
				if (row.id == profile.id) row.disabled = profile.disabled;
				return row;
			});

			_this.setState({rows: rows});
		}).catch((msg) => {
			console.error("sip_profile", msg);
		});
	}

	render() {
		const formClose = () => this.setState({ formShow: false });
		const toggleDanger = () => this.setState({ danger: !this.state.danger });
	    const danger = this.state.danger ? "danger" : "";

		const _this = this;

		let rows = [];
		let hand = { cursor: "pointer" };


		this.state.rows.forEach(function(row) {
			const disabled_class = dbfalse(row.disabled) ? "" : "disabled";
			const enabled_style = dbfalse(row.disabled) ? "success" : "default";
			const running_class = row.running ? "running" : null;

			rows.push(<tr key={row.id} className={disabled_class}>
					<td>{row.id}</td>
					<td><Link to={`/settings/sip_profiles/${row.id}`}>{row.name}</Link></td>
					<td>{row.description}</td>
					<td><Button onClick={_this.HandleToggleProfile.bind(_this)} bsStyle={enabled_style} data={row.id}>{dbfalse(row.disabled) ? T.translate("Yes") : T.translate("No")}</Button></td>
					<td className={running_class}>
						<T.a onClick={_this.handleStart} data-name={row.name} text="Start" href='#'/> |&nbsp;
						<T.a onClick={_this.handleStop.bind(_this)} data-name={row.name} text="Stop" href='#'/> |&nbsp;
						<T.a onClick={_this.handleRestart.bind(_this)} data-name={row.name} text="Restart" href='#'/> |&nbsp;
						<T.a onClick={_this.handleRescan.bind(_this)} data-name={row.name} text="Rescan" href='#'/> |&nbsp;
						<T.a onClick={_this.handleMore.bind(_this)} data-name={row.name} text="More" href='#'/>...
					</td>
					<td><T.a onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger} href='#'/></td>
			</tr>);

			if (_this.state.profileDetails.name == row.name) {
				var profile_params = [];
				var profiles;

				_this.state.profileDetails.rows.forEach(function(p) {
					profile_params.push(<li key={p.k}>{p.k}: {p.v}</li>);
				})

				profiles = <ul>{profile_params}</ul>

				rows.push(<tr key={row.name + '+' + row.type + '-profile-details'}>
					<td colSpan={6}>{profiles}</td>
				</tr>);
			}
		})

		return <div>
			<ButtonToolbar className="pull-right">
				<Button onClick={this.handleControlClick} data="new">
					<i className="fa fa-plus" aria-hidden="true" onClick={this.handleControlClick} data="new"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="New" />
				</Button>
			</ButtonToolbar>

			<h1><T.span text="SIP Profiles"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Enabled"/></th>
					<th><T.span text="Status"/> / <T.span text="Control"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewSIPProfile show={this.state.formShow} onHide={formClose}
				profiles = {this.state.rows}
				handleSIPProfileAdded={this.handleSIPProfileAdded.bind(this)}/>
		</div>
	}
}

export {SIPProfilesPage, SIPProfilePage};
