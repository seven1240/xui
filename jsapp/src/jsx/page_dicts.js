/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2016, Seven Du <dujinfang@x-y-t.cn>
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
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Radio, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { EditControl } from './xtools'

class NewDict extends React.Component {
	propTypes: {handleNewDictAdded: React.PropTypes.func}

	constructor(props) {
		super(props);

		this.last_id = 0;
		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var dt = form2json('#newDictForm');
		console.log("dt", dt);

		if (!dt.realm || !dt.key) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		$.ajax({
			type: "POST",
			url: "/api/dicts",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(dt),
			success: function (obj) {
				dt.id = obj.id;
				_this.props["data-handleNewDictAdded"](dt);
			},
			error: function(msg) {
				console.error("dict", msg);
			}
		});
	}

	render() {
		console.log(this.props);

		return <Modal {...this.props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Dict" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newDictForm">
				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realm" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="realm" placeholder="realm1" /></Col>
				</FormGroup>

				<FormGroup controlId="formKey">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Key" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="key" placeholder="key" /></Col>
				</FormGroup>

				<FormGroup controlId="formValue">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Value"/></Col>
					<Col sm={10}><FormControl type="input" name="value" placeholder="value" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description"/></Col>
					<Col sm={10}><FormControl type="input" name="description" placeholder="description" /></Col>
				</FormGroup>

				<FormGroup controlId="formOrder">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Order"/></Col>
					<Col sm={10}><FormControl type="input" name="order" placeholder="order" /></Col>
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

class DictPage extends React.Component {
	propTypes: {handleNewDictAdded: React.PropTypes.func}

	constructor(props) {
		super(props);

		this.state = {errmsg: '', dt: {}, edit: false};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var dt = form2json('#newDictForm');
		console.log("dt", dt);

		if (!dt.realm || !dt.key) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		$.ajax({
			type: "POST",
			url: "/api/dicts/" + dt.id,
			headers: {"X-HTTP-Method-Override": "PUT"},
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(dt),
			success: function () {
				_this.setState({dt: dt, errmsg: {key: "Saved at", time: Date()}})
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	componentDidMount() {
		var _this = this;
		$.getJSON("/api/dicts/" + this.props.params.id, "", function(data) {
			console.log("dt", data);
			_this.setState({dt: data});
		}, function(e) {
			console.log("get dt ERR");
		});
	}

	render() {
		const dt = this.state.dt;
		let save_btn = "";
		let err_msg = "";
		let register = dt.register == "true" ? "Yes" : "No";

		if (this.state.edit) {
			save_btn = <Button><T.span onClick={this.handleSubmit} text="Save"/></Button>

			if (dt.register == "true") {
				register = <span>
					<Radio name="register" value="true" inline defaultChecked>Yes</Radio>
					<Radio name="register" value="false" inline>No</Radio>
				</span>
			} else {
				register = <span>
					<Radio name="register" value="true" inline>Yes</Radio>
					<Radio name="register" value="false" inline defaultChecked>No</Radio>
				</span>
			}

			if (this.state.errmsg) {
				err_msg  = <Button><T.span text={this.state.errmsg} className="danger"/></Button>
			}
		}

		return <div>
			<ButtonGroup className="controls">
				{err_msg} { save_btn }
				<Button><T.span onClick={this.handleControlClick} text="Edit"/></Button>
			</ButtonGroup>

			<h1>{dt.realm} <small>{dt.extn}</small></h1>
			<hr/>

			<Form horizontal id="newDictForm">
				<input type="hidden" name="id" defaultValue={dt.id}/>
				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realm" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="realm" defaultValue={dt.realm}/></Col>
				</FormGroup>

				<FormGroup controlId="formKey">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Key" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="key" defaultValue={dt.key}/></Col>
				</FormGroup>

				<FormGroup controlId="formValue">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Value"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="value" defaultValue={dt.value}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="description" defaultValue={dt.description}/></Col>
				</FormGroup>

				<FormGroup controlId="formOrder">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Order"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="order" defaultValue={dt.order}/></Col>
				</FormGroup>

				
			</Form>
		</div>
	}
}

class DictsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false};

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
		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		$.ajax({
			type: "DELETE",
			url: "/api/dicts/" + id,
			success: function () {
				console.log("deleted")
				var rows = _this.state.rows.filter(function(row) {
					return row.id != id;
				});

				_this.setState({rows: rows});
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	handleClick(x) {
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentDidMount() {
		var _this = this;
		$.getJSON("/api/dicts", "", function(data) {
			console.log("dt", data)
			_this.setState({rows: data});
		}, function(e) {
			console.log("get dicts ERR");
		});
	}

	handleFSEvent(v, e) {
	}

	handleDictAdded(route) {
		var rows = this.state.rows;
		rows.push(route);
		this.setState({rows: rows, formShow: false});
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/dicts/${row.id}`}>{row.realm}</Link></td>
					<td>{row.key}</td>
					<td>{row.value}</td>
					<td>{row.description}</td>
					<td>{row.order}</td>
					<td><T.a onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <div>
			<div className="controls">
				<Button>
					<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="New" />
				</Button>
			</div>

			<h1><T.span text="Dicts"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Realm"/></th>
					<th><T.span text="Key"/></th>
					<th><T.span text="Value"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Order"/></th>
					<th><T.span text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewDict show={this.state.formShow} onHide={formClose} data-handleNewDictAdded={this.handleDictAdded.bind(this)}/>
		</div>
	}
}

export {DictsPage, DictPage};
