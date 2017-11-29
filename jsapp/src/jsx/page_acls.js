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
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col, Radio } from 'react-bootstrap';
import { Link } from 'react-router';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek';
import { EditControl, xFetchJSON } from './libs/xtools'

class NewACL extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		console.log("submit...");
		var acl = form2json('#newACLForm');
		console.log("acl", acl);

		if (!acl.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/acls", {
			method: "POST",
			body: JSON.stringify(acl)
		}).then((obj) => {
			acl.id = obj.id;
			this.props.handleNewUserAdded(acl);
		}).catch((msg) => {
			console.error("acl:", msg);
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
			<Form horizontal id="newACLForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="new acl" /></Col>
				</FormGroup>

				<FormGroup controlId="formDefault">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Default"/></Col>
					<Col sm={10}>
						<Radio name="status" value="allow" inline><T.span text="allow"/></Radio>
						<Radio name="status" value="deny" inline><T.span text="deny"/></Radio>
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

class AddNewNode extends React.Component {
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
		xFetchJSON("/api/acls/" + _this.props.acl_id + "/nodes/", {
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
				<FormGroup controlId="formNodeType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Node Type"  className="mandatory"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="node_type" placeholder="select">
							[
								<option key="domain" value="domain"><T.span text="domain"/></option>,
								<option key="cidr" value="cidr"><T.span text="cidr"/></option>,
							]
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Value" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="v" placeholder="Value" /></Col>
				</FormGroup>

				<FormGroup controlId="formDefault">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Allow Or Deny"/></Col>
					<Col sm={10}>
						<Radio name="k" value="allow" inline><T.span text="allow"/></Radio>
						<Radio name="k" value="deny" inline><T.span text="deny"/></Radio>
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

class ACLPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {acl: {}, edit: false, danger: false, nodes: {}, formShow: false,
		selectOptions : [{id: "domain", text: "domain"}, {id: "cidr", text: "cidr"}]};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.toggleHighlight = this.toggleHighlight.bind(this);
		this.handleToggleParam = this.handleToggleParam.bind(this);
		this.handleChangeKey = this.handleChangeKey.bind(this);
		this.handleChangeValue = this.handleChangeValue.bind(this);
		this.handleChangeNodeType = this.handleChangeNodeType.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete(id) {
		console.log("deleting id", id);
		var _this = this;

		if (!_this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}
		xFetchJSON( "/api/acls/" + _this.state.acl.id + "/node/" + id, {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			var nodes = _this.state.nodes.filter(function(node) {
				return node.id != id;
			});

			_this.setState({nodes: nodes});
			console.log(_this.state.nodes)
		}).catch((msg) => {
			console.log("acls",msg)
		});
	}

	handleChangeKey(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];
		console.log("change", obj);

		xFetchJSON( "/api/acls/" + _this.state.acl.id + "/nodes/" + id, {
			method: "PUT",
			body: JSON.stringify({k: obj[id]})
		}).then((node) => {
			console.log("success!!!!", node);
			_this.state.nodes = _this.state.nodes.map(function(p) {
				if (p.id == id) {
					return node;
				}
				return p;
			});
			_this.setState({nodes: _this.state.nodes});
		}).catch((msg) => {
			console.log("update nodes", msg)
		});
	}

	handleChangeValue(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];
		console.log("change", obj);

		xFetchJSON( "/api/acls/" + _this.state.acl.id + "/nodes/" + id, {
			method: "PUT",
			body: JSON.stringify({v: obj[id]})
		}).then((node) => {
			console.log("success!!!!", node);
			_this.state.nodes = _this.state.nodes.map(function(p) {
				if (p.id == id) {
					return node;
				}
				return p;
			});
			_this.setState({nodes: _this.state.nodes});
		}).catch((msg) => {
			console.log("update nodes", msg)
		});
	}

	handleChangeNodeType(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];
		console.log("change", obj);

		xFetchJSON( "/api/acls/" + _this.state.acl.id + "/nodes/" + id, {
			method: "PUT",
			body: JSON.stringify({node_type: obj[id].text})
		}).then((node) => {
			console.log("success!!!!", node);
			_this.state.nodes = _this.state.nodes.map(function(p) {
				if (p.id == id) {
					return node;
				}
				return p;
			});
			_this.setState({nodes: _this.state.nodes});
		}).catch((msg) => {
			console.log("update nodes", msg)
		});
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

	toggleHighlight() {
		this.setState({highlight: !this.state.highlight});
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var acl = form2json('#newACLForm');
		console.log("acl", acl);

		if (!acl.name) {
			notify(<T.span text="Mandatory fields left blank"/>, "error");
			return;
		}

		xFetchJSON("/api/acls/" + acl.id, {
			method: "PUT",
			body: JSON.stringify(acl)
		}).then(() => {
			this.setState({acl: acl, edit: false})
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("acls", msg);
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

	handleParamAdded(node) {
		console.log("node", node);
		var nodes = this.state.nodes;
		nodes.unshift(node);
		this.setState({nodes: nodes, formShow: false});
	}

	componentDidMount() {
		xFetchJSON("/api/acls/" + this.props.params.id).then((data) => {
			console.log("acl", data);
			const nodes = data.params;
			delete data.params;
			this.setState({acl: data, nodes:nodes});
		}).catch((msg) => {
			console.log("get acls ERR");
			notify(<T.span text={{key: "Internal Error", msg: msg}}/>, "error");
		});
	}

	render() {
		const acl = this.state.acl;
		var _this = this;
		let save_btn = "";
		let err_msg = "";
		var danger = this.state.danger ? "danger" : "";
		const hand = { cursor: "pointer" };
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let nodes = <tr></tr>;
		let formClose = () => _this.setState({ formShow: false });

		if (_this.state.nodes && Array.isArray(_this.state.nodes)) {
			nodes = this.state.nodes.map(function(node) {
				const enabled_style = dbfalse(node.disabled) ? "success" : "default";
				const disabled_class = dbfalse(node.disabled) ? null : "disabled";

				return <tr key={node.id} className={disabled_class}>
					<td><RIEInput value={_this.state.highlight ? (node.k ? node.k : T.translate("Click to Change")) : node.k} change={_this.handleChangeKey}
						propName={node.id}
						className={_this.state.highlight ? "editable long-input" : "long-input"}
						validate={_this.isStringAcceptable}
						classLoading="loading"
						classInvalid="invalid"/>
					</td>
					<td><RIESelect value={_this.state.highlight ? (node.node_type ? {id:node.node_type, text:node.node_type} : T.translate("Click to Change")) : {id:node.node_type, text:node.node_type}} change={_this.handleChangeNodeType}
						propName={node.id}
						options={_this.state.selectOptions}
						className={_this.state.highlight ? "editable long-input" : "long-input"}
						validate={_this.isStringAcceptable}
						classLoading="loading"
						classInvalid="invalid"/>
					</td>
					<td><RIEInput value={_this.state.highlight ? (node.v ? node.v : T.translate("Click to Change")) : node.v} change={_this.handleChangeValue}
						propName={node.id}
						className={_this.state.highlight ? "editable long-input" : "long-input"}
						validate={_this.isStringAcceptable}
						classLoading="loading"
						classInvalid="invalid"/>
					</td>
					<td>
						<T.a onClick={() => _this.handleDelete(node.id)} text="Delete" className={danger} style={{cursor:"pointer"}}/>
					</td>
				</tr>
			});
		}

		if (this.state.edit) {
			save_btn = <Button onClick={this.handleSubmit}><i className="fa fa-save" aria-hidden="true"></i>&nbsp;<T.span text="Save"/></Button>
		}

		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				{err_msg} { save_btn }
				<Button onClick={this.handleControlClick} data="edit"><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;
					<T.span text="Edit"/>
				</Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="ACL"/> <small>{acl.name}</small></h1>
			<hr/>

			<Form horizontal id="newACLForm">
				<input type="hidden" name="id" defaultValue={acl.id}/>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={acl.name}/></Col>
				</FormGroup>
				<FormGroup controlId="formDefault">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Default" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="status" defaultValue={acl.status}/></Col>
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
				<Button onClick={this.handleControlClick} data="new"><i className="fa fa-plus" aria-hidden="true"></i>&nbsp;<T.span onClick={this.handleControlClick} data="new" text="Add"/></Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h2><T.span text="node"/></h2>
			<table className="table">
				<tbody>
				<tr>
					<th><T.span text="Allow Or Deny"/></th>
					<th><T.span text="Node Type"/></th>
					<th><T.span text="Value"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{nodes}
				</tbody>
			</table>
			<AddNewNode show={this.state.formShow} onHide={formClose} acl_id={this.state.acl.id} handleNewParamAdded={this.handleParamAdded.bind(this)}/>
		</div>
	}
}

class ACLsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleControlClick(e) {
		this.setState({ formShow: true});
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/acls/" + id, {method: "DELETE"}).then(() => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			this.setState({rows: rows});
		}).catch((msg) => {
			console.error("acl", msg);
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
		xFetchJSON("/api/acls").then((data) => {
			console.log("acls", data)
			this.setState({rows: data});
		}).catch((msg) => {
			console.log("get acls ERR", msg);
			notify(<T.span text={{key: "Internal Error", msg: msg}}/>, 'error');
		});
	}

	handleFSEvent(v, e) {
	}

	handleUserAdded(acl) {
		var rows = this.state.rows;
		rows.unshift(acl);
		this.setState({rows: rows, formShow: false});
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let hand = { cursor: "pointer"};
	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/acls/${row.id}`}>{row.name}</Link></td>
					<td>{row.status}</td>
					<td><T.a style={hand} onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <div>
			<ButtonToolbar className="pull-right">
				<ButtonGroup>
				<Button onClick={this.handleControlClick} data="new">
					<i className="fa fa-plus" aria-hidden="true" onClick={this.handleControlClick} data="new"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="New" />
				</Button>
				</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="ACLs"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Default"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewACL show={this.state.formShow} onHide={formClose} handleNewUserAdded={this.handleUserAdded.bind(this)}/>
		</div>
	}
}

export {ACLPage, ACLsPage};
