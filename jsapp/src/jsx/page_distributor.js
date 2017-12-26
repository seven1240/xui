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

class NewDistributor extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: ''};
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var distributor = form2json('#newDistributor');

		if (!distributor.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/distributors", {
			method: "POST",
			body: JSON.stringify(distributor)
		}).then((obj) => {
			distributor.id = obj.id;
			this.props.handleNewDistributorAdded(distributor);
		}).catch((msg) => {
			console.error("distributor:", msg);
			this.setState({errmsg: msg});
		});
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.handleNewDistributorAdded;

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New User" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newDistributor">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="name" /></Col>
				</FormGroup>

				<FormGroup controlId="formTotalWeight">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="total_weight" placeholder="total weight" /></Col>
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

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var node = form2json('#newNodeAddForm');

		if (!node.k || !node.v) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}
		xFetchJSON("/api/distributors/" + _this.props.id + "/nodes/", {
			method:"POST",
			body: JSON.stringify(node)
		}).then((obj) => {
			node.id = obj.id;
			_this.props.handleNewNodeAdded(node);
		}).catch((msg) => {
			console.error("gateway", msg);
			_this.setState({errmsg: '' + msg + ''});
		});
	}

	componentWillUnmount() {
		const props = Object.assign({}, this.props);
		delete props.handleNewNodeAdded;
		delete props.profile_id;
	}

	render() {

		const props = Object.assign({}, this.props);

		delete props.handleNewNodeAdded;

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Add Param" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newNodeAddForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="k" placeholder="Name" /></Col>
				</FormGroup>

				<FormGroup controlId="formWeight">
					<Col componentClass={ControlLabel} sm={2}><T.span text="weight" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="v" placeholder="weight" /></Col>
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

class DistributorPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {distributor: {}, edit: false, danger: false, nodes: {}, formShow: false};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.toggleHighlight = this.toggleHighlight.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleChangeValueK = this.handleChangeValueK.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	componentDidMount() {
		xFetchJSON("/api/distributors/" + this.props.params.id).then((data) => {
			const nodes = data.params;
			delete data.params;
			this.setState({distributor: data, nodes: nodes});
		}).catch((msg) => {
			notify(<T.span text={{key: "Internal Error", msg: msg}}/>, "error");
		});
	}

	handleDelete(id) {
		var _this = this;

		if (!_this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}
		xFetchJSON( "/api/distributors/nodes/" + id, {
			method: "DELETE"
		}).then((obj) => {
			var nodes = _this.state.nodes.filter(function(node) {
				return node.id != id;
			});
			_this.setState({nodes: nodes});
		}).catch((msg) => {
			console.log("distributors delete",msg)
		});
	}

	handleChange(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];

		xFetchJSON( "/api/distributors/" + _this.state.distributor.id + "/nodes/" + id, {
			method: "PUT",
			body: JSON.stringify({v: obj[id]})
		}).then((node) => {
			_this.state.nodes = _this.state.nodes.map(function(p) {
				if (p.id == id) {
					return node;
				}
				return p;
			});
			_this.setState({nodes: _this.state.nodes});
		}).catch((msg) => {
			notify(msg);
		});
	}

	handleChangeValueK(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];

		xFetchJSON( "/api/distributors/" + _this.state.distributor.id + "/nodes/" + id, {
			method: "PUT",
			body: JSON.stringify({k: obj[id]})
		}).then((node) => {
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


	toggleHighlight() {
		this.setState({highlight: !this.state.highlight});
	}

	handleSubmit(e) {
		var _this = this;

		var distributor = form2json('#newDistributor');

		if (!distributor.name || !distributor.total_weight) {
			notify(<T.span text="Mandatory fields left blank"/>, "error");
			return;
		}

		xFetchJSON("/api/distributors/" + distributor.id, {
			method: "PUT",
			body: JSON.stringify(distributor)
		}).then(() => {
			this.setState({distributor: distributor, edit: false})
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("distributors", msg);
		});
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");

		if (data == "edit") {
			this.setState({edit: !this.state.edit});
		} else if (data == "new") {
			this.setState({formShow: true});
		};
	}

	handleNodeAdded(node) {
		var nodes = this.state.nodes;
		nodes.unshift(node);
		this.setState({nodes: nodes, formShow: false});
	}

	render() {
		const distributor = this.state.distributor;
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
					<td>{node.id}</td>
					<td><RIEInput value={_this.state.highlight ? (node.k ? node.k : T.translate("Click to Change")) : node.k} change={_this.handleChangeValueK}
						propName={node.id}
						className={_this.state.highlight ? "editable long-input" : "long-input"}
						validate={_this.isStringAcceptable}
						classLoading="loading"
						classInvalid="invalid"/>
					</td>
					<td><RIEInput value={_this.state.highlight ? (node.v ? node.v : T.translate("Click to Change")) : node.v} change={_this.handleChange}
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
				<Button onClick={this.handleControlClick} data="edit">
					<i data="edit" className="fa fa-edit" aria-hidden="true"></i>&nbsp;
					<T.span data="edit" text="Edit"/>
				</Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Distributors"/> <small>{distributor.name}</small></h1>
			<hr/>

			<Form horizontal id="newDistributor">
				<input type="hidden" name="id" defaultValue={distributor.id}/>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={distributor.name}/></Col>
				</FormGroup>
				<FormGroup controlId="formTotalWeight">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Total Weight" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="total_weight" defaultValue={distributor.total_weight}/></Col>
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
					<i data="new" className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span data="new" onClick={this.handleControlClick} data="new" text="Add"/>
				</Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h2><T.span text="node"/></h2>
			<table className="table">
				<tbody>
				<tr>
					<th><T.span text="id"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="weight"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{nodes}
				</tbody>
			</table>
			<AddNewNode show={this.state.formShow} onHide={formClose} id={this.state.distributor.id} handleNewNodeAdded={this.handleNodeAdded.bind(this)}/>
		</div>
	}
}

class DistributorsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false,
			distributorDetails: [], detailsFormShow: false, detailsMsg: []
	};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleShowDistributors = this.handleShowDistributors.bind(this);
	}

	handleControlClick(e) {
		this.setState({ formShow: true});
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));
			if (!c) return;
		}

		xFetchJSON("/api/distributors/" + id, {
			method: "DELETE"
		}).then((data) => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			this.setState({rows: rows});
		}).catch((msg) => {
			console.error("distributor delete err", msg);
			notify(msg, 'error');
		});
	}

	componentDidMount() {
		xFetchJSON("/api/distributors").then((data) => {
			this.setState({rows: data});
		}).catch((msg) => {
			notify(<T.span text={{key: "Internal Error", msg: msg}}/>, 'error');
		});
	}

	handleDistributorAdded(distributor) {
		var rows = this.state.rows;
		rows.unshift(distributor);
		this.setState({rows: rows, formShow: false});
	}

	hanldeReload() {
		verto.fsAPI("reload", "mod_distributor", function(r) {
			notify(<T.span text="Distributor reloaded"/>);
		});
	}

	handleShowDistributors() {
		let detailsFormShow = !this.state.detailsFormShow;
		this.setState({detailsFormShow: detailsFormShow});
		if(detailsFormShow == false) {
			return;
		}
		var _this = this;
		let msg_data = [];
		let str = '';
		this.state.rows.map((row) => {
			verto.fsAPI("distributor_ctl", "dump " + row.name, (data) => {
				msg_data.push({name: row.name, msg: data.message});
				this.setState({detailsMsg: msg_data})
			})
		})
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let hand = { cursor: "pointer"};
		let detailsMsg = this.state.detailsMsg;

		let dis_params = this.state.distributorDetails.map(function(p) {
			return <li key={p.k}>{p.k}: {p.v}</li>;
		})

		let distributors = <ul>{dis_params}</ul>;

		let details_params = detailsMsg.map((msg, index) => {
			return <li key={index}>{msg.msg}</li>
		})
		let detail_rows = <ul>{details_params}</ul>


	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/distributors/${row.id}`}>{row.name}</Link></td>
					<td>{row.total_weight}</td>
					<td><T.a style={hand} onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <div>
			<ButtonToolbar className="pull-right">
				<ButtonGroup>
				<Button onClick={this.hanldeReload.bind(this)}>
					<i className="fa fa-refresh" aria-hidden="true"></i>&nbsp;
					<T.span text="Reload"/>
				</Button>
				<Button onClick={this.handleControlClick} data="new">
					<i className="fa fa-plus" aria-hidden="true" onClick={this.handleControlClick} data="new"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="New" />
				</Button>
				</ButtonGroup>
				<ButtonGroup>
					<Button onClick={_this.handleShowDistributors}><i className="fa fa-list-ul" aria-hidden="true"></i>&nbsp;<T.span text={this.state.detailsFormShow ? "Hide Details" : "Show Details"}/></Button>
				</ButtonGroup>
			</ButtonToolbar>
			<h1><T.span text="Distributors"/></h1>

			<Form horizontal id="DetailsForm" style={{display: this.state.detailsFormShow ? "block" : "none"}}>
				<FormGroup controlId="formDetails">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Details"/></Col>
					<Col sm={10}>{detail_rows}</Col>
				</FormGroup>
			</Form>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Total Weight"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewDistributor show={this.state.formShow} onHide={formClose} handleNewDistributorAdded={this.handleDistributorAdded.bind(this)}/>
		</div>
	}
}

export {DistributorPage, DistributorsPage};
