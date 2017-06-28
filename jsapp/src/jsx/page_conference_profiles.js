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
 * blocks.jsx - Blocks Page
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import ReactDOM from 'react-dom';
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox } from 'react-bootstrap';
import { Tab, Row, Col, Nav, NavItem } from 'react-bootstrap';
import { Link } from 'react-router';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek';
import { EditControl, xFetchJSON } from './libs/xtools';

class NewProfile extends React.Component {
	propTypes: {handleNewProfileAdded: React.PropTypes.func}

	constructor(props) {
		super(props);

		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var profile = form2json('#newProfile');
		console.log("profile", profile);

		if (!profile.name) {
			_this.setState({errmsg: <T.span text="Mandatory fields left blank"/>});
			return;
		}

		xFetchJSON("/api/conference_profiles", {
			method: "POST",
			body: JSON.stringify(profile)
		}).then((obj) => {
			console.log(obj);
			profile.id = obj.id;
			_this.props.onNewProfileAdded(profile);
		}).catch((msg) => {
			console.error("profile", msg);
			_this.setState({errmsg: '' + msg});
		});
	}

	render() {
		console.log(this.props);
		const props = Object.assign({}, this.props);
		delete props.onNewProfileAdded;

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Conference Profile" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newProfile">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="default" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><FormControl type="input" name="description" placeholder="A Test Profile" /></Col>
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

class ConferenceProfilePage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {profile: {}, params:[], edit: false};
		this.handleChange = this.handleChange.bind(this);
		this.handleSort = this.handleSort.bind(this);
		this.handleToggleParam = this.handleToggleParam.bind(this);
		this.toggleHighlight = this.toggleHighlight.bind(this);
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
	
	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var profile = form2json('#editProfileForm');

		if (!profile.name) {
			notify(<T.span text="Mandatory fields left blank"/>, 'error');
			return;
		}
		xFetchJSON("/api/conference_profiles/" + profile.id, {
			method: "PUT",
			body: JSON.stringify(profile)
		}).then((obj) => {
			_this.setState({profile: profile, edit: false})
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("profile", msg);
		});
	}
	
	handleToggleParam(e) {
		const _this = this;
		const data = e.target.getAttribute("data");
		xFetchJSON("/api/conference_profiles/" + this.state.profile.id + "/params/" + data, {
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
		xFetchJSON("/api/conference_profiles/" + this.state.profile.id + "/params/" + id, {
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
			console.error("update params", msg);
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	isStringAcceptable() {
		return true;
	}

	toggleHighlight() {
		this.setState({highlight: !this.state.highlight});
	}

	componentDidMount() {
		const _this = this;
		xFetchJSON("/api/conference_profiles/" + this.props.params.id).then((data) => {
			const params = data.params;
			_this.setState({profile: data, params: params});
		}).catch((msg) => {
			console.error("get conference profile ERR", msg);
		});
	}

	render() {
		const profile = this.state.profile;
		let save_btn = null;
		let err_msg = null;
		let params = <tr></tr>;
		var _this = this;
		if (this.state.params && Array.isArray(this.state.params)) {
			params = this.state.params.map(function(param) {
				const enabled_style = dbfalse(param.disabled) ? "success" : "default";
				const disabled_class = dbfalse(param.disabled) ? null : "disabled";

				return <tr key={param.id} className={disabled_class}>
					<td>{param.k}</td>
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
				</tr>
			});
		}
		
		
		if (this.state.edit) {
			save_btn = <Button><T.span onClick={this.handleSubmit.bind(this)} text="Save"/></Button>
		}

		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				{ save_btn }
				<Button onClick={this.handleControlClick.bind(this)}>
				<i className="fa fa-edit" aria-hidden="true"></i>&nbsp;
				<T.span text="Edit"/>
				</Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1>{profile.name} <small>{profile.nbr}</small></h1>
			<hr/>

			<Form horizontal id='editProfileForm'>
				<input type="hidden" name="id" defaultValue={profile.id}/>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={profile.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="description" defaultValue={profile.description}/></Col>
				</FormGroup>

			</Form>
			
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				<Button onClick={this.toggleHighlight}>
				<i className="fa fa-edit" aria-hidden="true"></i>&nbsp;
				<T.span text="Edit"/>
				</Button>
			</ButtonGroup>
			</ButtonToolbar>
			<h2><T.span text="Params"/></h2>
			<table className="table">
				<tbody>
				<tr>
					<th onClick={this.handleSort.bind(this)} data="d"><T.span text="Name" data="k"/></th>
					<th><T.span text="Value"/></th>
					<th onClick={this.handleSort.bind(this)} data='disabled'><T.span text="Enabled" data="disabled"/></th>
				</tr>
				{params}
				</tbody>
			</table>
		</div>
	}
}

class ConferenceProfilesPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false};
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
		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!_this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON( "/api/conference_profiles/" + id, {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			_this.setState({rows: rows});
		}).catch((msg) => {
			console.error("conference_profiles", msg);
		});
	}

	handleSortClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);
		var rows = this.state.rows;

		if (data == "realm") {
			rows.sort(function(a,b){
				return (a.realm[0].toLowerCase().charCodeAt() - b.realm[0].toLowerCase().charCodeAt());
			})

			this.setState({rows: rows});
		}

		if (data == "key") {
			rows.sort(function(a,b){
				return (a.k[0].toLowerCase().charCodeAt() - b.k[0].toLowerCase().charCodeAt());
			})

			this.setState({rows: rows});
		}

		if (data == "order") {
			rows.sort(function(a,b){
				return parseInt(b.o) - parseInt(a.o);
			})

			this.setState({rows: rows});
		};
	}

	handleClick(x) {
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentDidMount() {
		var _this = this;
		let url = "/api/conference_profiles";

		xFetchJSON(url).then((data) => {
			console.log("profiles", data)
			_this.setState({rows: data});
		}).catch((msg) => {
			console.log("get profiles ERR");
		});
	}

	handleProfileAdded(route) {
		var rows = this.state.rows;
		rows.unshift(route);
		this.setState({rows: rows, formShow: false});
	}

	render() {
		const row = this.state.rows;
		let formClose = () => this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let hand = { cursor: "pointer" };
	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/conference_profiles/${row.id}`}>{row.name}</Link></td>
					<td>{row.description}</td>
					<td><T.a onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger} /></td>
			</tr>;
		})

		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				<Button onClick={this.handleControlClick.bind(this)} data="new">
					<i className="fa fa-plus" aria-hidden="true" data="new"></i>&nbsp;
					<T.span text="New" data="new"/>
				</Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Conference Profiles"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name" onClick={this.handleSortClick.bind(this)} data="name" /></th>
					<th><T.span text="Description" /></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewProfile show={this.state.formShow} onHide={formClose} onNewProfileAdded={this.handleProfileAdded.bind(this)}/>
		</div>
	}
}

export { ConferenceProfilesPage, ConferenceProfilePage };
