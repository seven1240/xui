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
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek'
import verto from './verto/verto';
import parseXML from './libs/xml_parser';

class NewRoute extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: '', dest_uuid: null, route_body: null,
			contexts: [], dest_types: []
		};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleDestTypeChange = this.handleDestTypeChange.bind(this);
	}

	handleDestTypeChange(e) {
		const _this = this;

		switch(e.target.value) {
			case 'FS_DEST_USER':
				_this.setState({dest_uuid: null, route_body: null});
				break;
			case 'FS_DEST_SYSTEM':
				_this.setState({dest_uuid: null, route_body: <FormGroup controlId="formBody">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Body" /></Col>
					<Col sm={10}> <FormControl componentClass="textarea" name="body" placeholder={"log ERR line1\nlog ERR line2"} /></Col>
				</FormGroup>});
				break;
			case 'FS_DEST_IP':
				_this.setState({dest_uuid: null, route_body: <FormGroup controlId="formBody">
					<Col componentClass={ControlLabel} sm={2}><T.span text="IP" /></Col>
					<Col sm={10}> <FormControl name="body" placeholder="192.168.0.x" /></Col>
				</FormGroup>});
				break;
			case 'FS_DEST_GATEWAY':
				xFetchJSON("/api/gateways").then((gateways) => {
					const dest_uuid = <FormGroup controlId="formDestUUID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Gateway" /></Col>
						<Col sm={10}><FormControl componentClass="select" name="dest_uuid">{
							gateways.map(function(gateway) {
								return <option key={gateway.id} value={gateway.id}>[{gateway.realm} {gateway.username}]</option>
							})
						}</FormControl></Col>
					</FormGroup>
					_this.setState({dest_uuid: dest_uuid, route_body: null});
				});
				break;
			case 'FS_DEST_IVRBLOCK':
				xFetchJSON("/api/blocks").then((blocks) => {
					const dest_uuid = <FormGroup controlId="formDestUUID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="IVR Block" /></Col>
						<Col sm={10}><FormControl componentClass="select" name="dest_uuid">{
							blocks.map(function(block) {
								return <option key={block.id} value={block.id}>{block.name}</option>
							})
						}</FormControl></Col>
					</FormGroup>

					_this.setState({dest_uuid: dest_uuid, route_body: null});
				});
				break;
			case 'FS_DEST_CONFERENCE':
				xFetchJSON("/api/conference_rooms").then((rooms) => {
					const dest_uuid = <FormGroup controlId="formDestUUID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Conference Room" /></Col>
						<Col sm={10}><FormControl componentClass="select" name="dest_uuid">{
							rooms.map(function(room) {
								return <option key={room.id} value={room.id}>{room.name}</option>
							})
						}</FormControl></Col>
					</FormGroup>

					_this.setState({dest_uuid: dest_uuid, route_body: null});
				});
				break;
			default:
				break;
		}
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var route = form2json('#newRouteForm');
		console.log("route", route);

		if (!route.name || !route.prefix) {
			_this.setState({ errmsg: "Mandatory fields left blank" });
			return;
		}

		xFetchJSON("/api/routes", {
			method: "POST",
			body: JSON.stringify(route)
		}).then((obj) => {
			_this.props.handleNewRouteAdded(obj);
		}).catch((msg) => {
			console.error("route", msg);
			_this.setState({errmsg: '' + msg});
		});
	}

	componentDidMount() {
		const _this = this;

		xFetchJSON("/api/dicts?realm=CONTEXT").then((data) => {
			_this.setState({contexts: data});
		});
		xFetchJSON("/api/dicts?realm=DEST").then((data) => {
			_this.setState({dest_types: data});
		});
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.handleNewRouteAdded;

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Route" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newRouteForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="route_to_beijing" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><FormControl type="input" name="description" placeholder="Beijing" /></Col>
				</FormGroup>

				<FormGroup controlId="formPrefix">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Prefix" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="prefix" placeholder="010" /></Col>
				</FormGroup>

				<FormGroup controlId="formContext">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Context"  className="mandatory"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="context" placeholder="select">
							{this.state.contexts.map(function(c) {
								return <option key={c.id}>{c.k}</option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formDestType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Dest Type" /></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="dest_type" onChange={this.handleDestTypeChange}>
							{this.state.dest_types.map(function(t) {
								return <option key={t.id} value={t.k}>{T.translate(t.k)}</option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>

				{this.state.dest_uuid}

				{this.state.route_body}

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

		if (!param.k) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/routes/" + _this.props.profile_id + "/params/", {
			method:"POST",
			body: JSON.stringify(param)
		}).then((obj) => {
			param.id = obj.id;
			_this.props.handleNewParamAdded(param);
		}).catch((msg) => {
			console.error("route", msg);
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
				<Modal.Title id="contained-modal-title-lg"><T.span text="Add Application" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newParamAddForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="k" placeholder="Name" /></Col>
				</FormGroup>
				<FormGroup controlId="formParam">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Param"/></Col>
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

class RoutePage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {route: {}, edit: false, dest_uuid: null, dest_body: null,
			contexts: [], dest_types: [], danger: false, params: [], formShow: false
		};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDestTypeChange = this.handleDestTypeChange.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleSort = this.handleSort.bind(this);
		this.handleToggleParam = this.handleToggleParam.bind(this);
		this.toggleHighlight = this.toggleHighlight.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleChangeValueK = this.handleChangeValueK.bind(this);
	}

	toggleHighlight() {
		this.setState({highlight: !this.state.highlight});
	}

	handleChange(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];

		console.log("change", obj);

		xFetchJSON( "/api/routes/" + this.state.route.id + "/params/" + id, {
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

		xFetchJSON( "/api/routes/" + this.state.route.id + "/params/" + id, {
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

	handleDestTypeChange(e) {
		const _this = this;

		switch(e.target.value) {
			case 'FS_DEST_USER':
				_this.setState({dest_uuid: null, route_body: null});
				break;
			case 'FS_DEST_SYSTEM':
				_this.setState({dest_uuid: null, route_body: <FormGroup controlId="formBody">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Body" /></Col>
					<Col sm={10}> <EditControl edit={_this.state.edit} componentClass="textarea" name="body" defaultValue={this.state.route.body} /></Col>
				</FormGroup>});
				break;
			case 'FS_DEST_IP':
				_this.setState({dest_uuid: null, route_body: <FormGroup controlId="formBody">
					<Col componentClass={ControlLabel} sm={2}><T.span text="IP" /></Col>
					<Col sm={10}> <EditControl edit={_this.state.edit} name="body" defaultValue={this.state.route.body} /></Col>
				</FormGroup>});
				break;
			case 'FS_DEST_GATEWAY':
				xFetchJSON("/api/gateways").then((gateways) => {
					let current_gateway = null
					const dest_options = gateways.map(function(gateway) {
						const gw_text = gateway.name + '[' + gateway.realm + ' ' + gateway.username + ']';

						if (_this.state.route.dest_uuid == gateway.id) {
							current_gateway = gw_text;
						}

						return [gateway.id, gw_text];
					});

					const dest_uuid = <FormGroup controlId="formDestUUID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Gateway" /></Col>
						<Col sm={10}><EditControl edit={_this.state.edit} componentClass="select" name="dest_uuid" text={current_gateway} defaultValue={_this.state.route.dest_uuid} options={dest_options}/></Col>
					</FormGroup>;

					_this.setState({dest_uuid: dest_uuid, route_body: null});
				});
				break;
			case 'FS_DEST_IVRBLOCK':
				xFetchJSON("/api/blocks").then((blocks) => {
					let current_block = null
					const dest_options = blocks.map(function(block) {
						const block_text = block.name + '[' + block.description + ']';
						if (_this.state.route.dest_uuid == block.id) current_block = block_text;
						return [block.id, block_text];
					});
					const dest_uuid = <FormGroup controlId="formDestUUID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="IVR Block" /></Col>
						<Col sm={10}><EditControl edit={_this.state.edit} componentClass="select" name="dest_uuid" text={current_block} defaultValue={_this.state.route.dest_uuid} options={dest_options}/></Col>
					</FormGroup>;

					_this.setState({dest_uuid: dest_uuid, route_body: null});
				});
				break;
			case 'FS_DEST_CONFERENCE':
				xFetchJSON("/api/conference_rooms").then((rooms) => {
					let current_room = "null"
					const dest_options = rooms.map(function(room) {
						const room_text = room.name + '[' + room.nbr + ']';
						console.log(_this.state.route.dest_uuid, room.id + room_text);
						if (_this.state.route.dest_uuid == room.id) current_room = room_text;
						return [room.id, room_text];
					});

					const dest_uuid = <FormGroup controlId="formDestUUID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Conference Room" /></Col>
						<Col sm={10}><EditControl edit={_this.state.edit} componentClass="select" name="dest_uuid" text={current_room} defaultValue={_this.state.route.dest_uuid} options={dest_options}/></Col>
					</FormGroup>;

					_this.setState({dest_uuid: dest_uuid, route_body: null});
				});
				break;
			default:
				break;
		}
	}

	handleParamAdded(param) {
		var params = this.state.params;
		params.push(param);
		this.setState({params: params, formShow: false});
	}

	handleToggleParam(e) {
		const _this = this;
		const data = e.target.getAttribute("data");

		xFetchJSON("/api/routes/" + this.state.route.id + "/params/" + data, {
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

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var route = form2json('#editRouteForm');

		if (!route.name || !route.prefix) {
			notify(<T.span text="Mandatory fields left blank"/>, 'error');
			return;
		}

		xFetchJSON("/api/routes/" + route.id, {
			method: "PUT",
			body: JSON.stringify(route)
		}).then((obj) => {
			_this.setState({route: route, edit: false})
			_this.handleDestTypeChange({target: {value: _this.state.route.dest_type}});
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("route", msg);
		});
	}

	handleControlClick(data) {
		console.log("data", data);

		if (data == "edit") {
			this.state.edit = !this.state.edit
			this.handleDestTypeChange({target: {value: this.state.route.dest_type}});
			this.setState({edit: this.state.edit});
		} else if (data == "new") {
			this.setState({formShow: true});
		};
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

	componentDidMount() {
		const _this = this;
		let change = 3;

		const checkDestType = function() {
			if (--change > 0) return;
			console.log("update change!");
			_this.handleDestTypeChange({target: {value: _this.state.route.dest_type}});
		}

		xFetchJSON("/api/dicts?realm=CONTEXT").then((data) => {
			_this.setState({contexts: data});
			checkDestType();
		});

		xFetchJSON("/api/dicts?realm=DEST").then((data) => {
			_this.setState({dest_types: data});
			checkDestType();
		});

		xFetchJSON("/api/routes/" + this.props.params.id + '?with_params=true').then((data) => {
			const params = data.params;
			delete data.params;
			_this.setState({route: data, params: params});
			checkDestType();
		}).catch((msg) => {
			console.log(msg);
		});
	}

	handleDelete(param_id) {
		console.log("deleting param_id", param_id);
		var _this = this;

		if (!_this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}
		xFetchJSON("/api/routes/" + _this.state.route.id + "/param/" + param_id, {
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

	render() {
		const route = this.state.route;
		var _this = this;
		let save_btn = "";
		let err_msg = "";
		let hand = { cursor: "pointer" };
		var danger = this.state.danger ? "danger" : "";
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let params = <tr></tr>;
		let formClose = () => _this.setState({ formShow: false });

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
						className={_this.state.highlight ? "editable" : ""}
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
			save_btn = <Button onClick={this.handleSubmit}><i className="fa fa-save" aria-hidden="true"></i>&nbsp;<T.span text="Save"/></Button>

			if (this.state.errmsg) {
				err_msg  = <Button><T.span text={this.state.errmsg} className="danger"/></Button>
			}
		}

		const context_options = this.state.contexts.map(function(row) {
			return [row.k, row.k];
		});

		const dest_type_options = this.state.dest_types.map(function(row) {
			return [row.k, T.translate(row.k)]
		});

		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				{ save_btn }
				<Button onClick={() => this.handleControlClick("edit")}>
					<i className="fa fa-edit" aria-hidden="true"></i>&nbsp;
					<T.span text="Edit" />
				</Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Route"/> &nbsp; <small>{route.name} {route.prefix}</small></h1>
			<hr/>

			<Form horizontal id='editRouteForm'>
				<input type="hidden" name="id" defaultValue={route.id}/>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={route.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="description" defaultValue={route.description}/></Col>
				</FormGroup>

				<FormGroup controlId="formPrefix">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Prefix" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="prefix" defaultValue={route.prefix}/></Col>
				</FormGroup>

				<FormGroup controlId="formDNC">
					<Col componentClass={ControlLabel} sm={2}><T.span text="DNC" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="dnc" defaultValue={route.dnc}/></Col>
				</FormGroup>

				<FormGroup controlId="formSDNC">
					<Col componentClass={ControlLabel} sm={2}><T.span text="SDNC" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="sdnc" defaultValue={route.sdnc}/></Col>
				</FormGroup>

				<FormGroup controlId="formContext">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Context"  className="mandatory"/></Col>
					<Col sm={10}>
						<EditControl edit={this.state.edit} componentClass="select" name="context" options={context_options} defaultValue={route.context}/>
					</Col>
				</FormGroup>

				<FormGroup controlId="formDestType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Dest Type" /></Col>
					<Col sm={10}>
						<EditControl edit={this.state.edit} componentClass="select" name="dest_type" options={dest_type_options} text={T.translate(route.dest_type)} defaultValue={route.dest_type} onChange={this.handleDestTypeChange}/>
					</Col>
				</FormGroup>

				{this.state.dest_uuid}
				{this.state.route_body}

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
				<Button onClick={() => this.handleControlClick("new")}>
					<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span onClick={this.handleControlClick} text="Add"/></Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h2><T.span text="Applications"/></h2>
			<table className="table">
				<tbody>
				<tr>
					<th style={{cursor: "pointer"}} onClick={this.handleSort.bind(this)} data="d"><T.span text="Name" data="k"/></th>
					<th><T.span text="Params"/></th>
					<th style={{cursor: "pointer"}} onClick={this.handleSort.bind(this)} data='disabled'><T.span text="Enabled" data="disabled"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{params}
				</tbody>
			</table>
			<AddNewParam show={this.state.formShow} onHide={formClose} profile_id={this.state.route.id} handleNewParamAdded={this.handleParamAdded.bind(this)}/>
		</div>
	}
}

class RoutesPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false, isSysRouterShow: false, ifShowBtName: "Show SysRoute"};

	    // This binding is necessary to make `this` work in the callback
	    this.handleControlClick = this.handleControlClick.bind(this);
	    this.handleDelete = this.handleDelete.bind(this);
	    this.handleSysRouterShow=this.handleSysRouterShow.bind(this);
	}

	handleControlClick(data) {
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		}
	}

	handleDelete(id) {
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/routes/" + id, {
			method: "DELETE",
		}).then((obj) => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			_this.setState({rows: rows});
		}).catch((msg) => {
			console.error("route", msg);
		});
	}

	handleSysRouterShow(data){
		var routershow = !this.state.isSysRouterShow;
		this.setState({isSysRouterShow: routershow});
		localStorage.setItem('xui.isSysRouterShow', routershow);
	}

	handleClick(x) {
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentDidMount() {
		var _this = this;

		let routershow = localStorage.getItem('xui.isSysRouterShow') || false;
		routershow = routershow == 'true';

		xFetchJSON("/api/routes").then((data) => {
			_this.setState({rows: data, isSysRouterShow: routershow});
		}).catch((msg) => {
			console.log("get routes ERR");
		});
	}

	handleRouteAdded(route) {
		var rows = this.state.rows;
		rows.unshift(route);
		this.setState({rows: rows, formShow: false});
    }
    handleSortClick(field){
		var rows = this.state.rows;

		var n = 1;

		if (this.state.order == 'ASC') {
			this.state.order = 'DSC';
			n = -1;
		} else {
			this.state.order = 'ASC';
		}

		rows.sort(function(a,b) {
			return a[field] < b[field] ? -1 * n : 1 * n;
		});

		this.setState({rows: rows});
    }

	render() {
	    const formClose = () => this.setState({ formShow: false });
	    const toggleDanger = () => this.setState({ danger: !this.state.danger });
		const hand = { cursor: "pointer" };

	    var _this = this;
	    var danger = this.state.danger ? "danger" : "";
	    var styleSheet = {
			"display" : "none"
		}

		const isSysRouterShowText = this.state.isSysRouterShow ? 'Hide SysRoute' : 'Show SysRoute';

		var rows = this.state.rows.map(function(row) {
			let dest = row.body;
			let sysStyle = row.dest_type == 'FS_DEST_SYSTEM' && !_this.state.isSysRouterShow ? styleSheet : null;
			switch(row.dest_type) {
				case 'FS_DEST_SYSTEM': dest = null; break;
				case 'FS_DEST_GATEWAY': dest = <Link to={`/settings/gateways/${row.dest_uuid}`}>{row.body}</Link>;break;
				case 'FS_DEST_IVRBLOCK': dest = <Link to={`/blocks/${row.dest_uuid}`}>{row.body}</Link>; break;
				default: break;
			}

			return <tr key={row.id} style={sysStyle}>
					<td>{row.id}</td>
					<td>{row.context}</td>
					<td>{row.prefix}</td>
					<td><Link to={`/settings/routes/${row.id}`}>{row.name}</Link></td>
					<td>{row.description}</td>
					<td><T.span text={row.dest_type}/></td>
					<td>{dest}</td>
					<td><T.a onClick={() => _this.handleDelete(row.id)} text="Delete" className={danger}  style={{cursor:"pointer"}}/></td>
			</tr>;
		})

		return <div>
			<ButtonToolbar className="pull-right">
				<Button onClick={() => this.handleControlClick("new")}>
					<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span text="New" />
				</Button>
				<Button onClick={() => this.handleSysRouterShow("sysRoute")}>
					<i className="fa fa-expand" aria-hidden="true"></i>&nbsp;
					<T.span data="sysRoute" text={isSysRouterShowText} />
				</Button>
			</ButtonToolbar>

			<h1><T.span text="Routes" /></h1>

			<div>
				<table className="table">
				<tbody>
				<tr>
					<th>ID</th>
					<th><T.span style={hand} text="Context" onClick={() => this.handleSortClick("context")}/></th>
					<th><T.span style={hand} text="Prefix" onClick={() => this.handleSortClick("prefix")}/></th>
					<th><T.span text="Name" /></th>
					<th><T.span text="Description" /></th>
					<th><T.span text="Dest Type" /></th>
					<th><T.span text="Dest" /></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewRoute show={this.state.formShow} onHide={formClose} handleNewRouteAdded={this.handleRouteAdded.bind(this)}/>
		</div>
	}
}

export { RoutesPage, RoutePage };
