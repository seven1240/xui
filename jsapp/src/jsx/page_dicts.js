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
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek'
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

		if (!dt.realm || !dt.k) {
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
					<Col sm={10}><FormControl type="input" name="k" placeholder="key" /></Col>
				</FormGroup>

				<FormGroup controlId="formValue">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Value"/></Col>
					<Col sm={10}><FormControl type="input" name="v" placeholder="value" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description"/></Col>
					<Col sm={10}><FormControl type="input" name="d" placeholder="description" /></Col>
				</FormGroup>

				<FormGroup controlId="formOrder">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Order"/></Col>
					<Col sm={10}><FormControl type="input" name="o" defaultValue="0" /></Col>
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

		if (!dt.realm || !dt.k) {
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
			success: function (data) {
				console.log(data.ress);
				_this.setState({dt: dt, errmsg: {key: "Saved at", time: Date()}})
			},
			error: function(msg) {
				console.error("dict", msg);
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

			<h1>{dt.realm} <small>{dt.k}</small></h1>
			<hr/>

			<Form horizontal id="newDictForm">
				<input type="hidden" name="id" defaultValue={dt.id}/>
				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realm" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="realm" defaultValue={dt.realm}/></Col>
				</FormGroup>

				<FormGroup controlId="formKey">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Key" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="k" defaultValue={dt.k}/></Col>
				</FormGroup>

				<FormGroup controlId="formValue">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Value"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="v" defaultValue={dt.v}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="d" defaultValue={dt.d}/></Col>
				</FormGroup>

				<FormGroup controlId="formOrder">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Order"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="o" defaultValue={dt.o}/></Col>
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
		this.toggleHighlight = this.toggleHighlight.bind(this);
		this.handleChange = this.handleChange.bind(this);
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

		var realm = this.props.location.query.realm;
		console.log(realm);
		let url = "/api/dicts";

		if (realm) url = url + "?realm=" + realm;

        $.getJSON(url, "", function(data) {
			console.log("dt", data)
			_this.setState({rows: data});
		}, function(e) {
			console.log("get dicts ERR");
		});
	}

	handleRealmClick(e) {
		const _this = this;
		console.log("realm clicked", e.target);
		var realm = e.target.getAttribute("data");

		console.log(realm);
		let url = "/api/dicts";

		if (realm) url = url + "?realm=" + realm;

        $.getJSON(url, "", function(data) {
			console.log("dt", data)
			_this.setState({rows: data});
		}, function(e) {
			console.log("get dicts ERR");
		});
	}

	handleDictAdded(route) {
		var rows = this.state.rows;
		rows.unshift(route);
		this.setState({rows: rows, formShow: false});
	}

	toggleHighlight() {
		this.setState({highlight: !this.state.highlight});
	}

	handleChange(obj) {
		const _this = this;
		const id = parseInt(Object.keys(obj)[0]);
		const value = Object.values(obj)[0];

		var rows = _this.state.rows;

		var row = {};

		row.id = id;
		row.realm = rows[id - 1].realm;
		row.k = rows[(id - 1)].k;
		row.v = value;		
		row.d = rows[(id - 1)].d;
		row.o = rows[(id - 1)].o;

		console.log("row", row);

		$.ajax({
			type: "PUT",
			url: "/api/dicts/" + (row.id - 1),
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(row),
			success: function (data) {
				console.log("update success");
				_this.setState({rows: _this.state.rows});
			},
			error: function(msg) {
				console.error("failed", msg);
			}
		});
	}

	isStringAcceptable() {
		return true;
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/dicts?realm=${row.realm}`} onClick={_this.handleRealmClick.bind(_this)} data={row.realm}>{row.realm}</Link></td>
					<td><Link to={`/settings/dicts/${row.id}`}>{row.k}</Link></td>
					<td>
						<RIEInput value={row.v} change={_this.handleChange}
						propName={row.id}
						className={_this.state.highlight ? "editable" : ""}
						validate={_this.isStringAcceptable}
						classLoading="loading"
						classInvalid="invalid"/>
					</td>
					<td>{row.d}</td>
					<td>{row.o}</td>
					<td><T.a onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <div>
			<div className="controls">
				<Button>
					<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="New" />
				</Button>
				&nbsp;&nbsp;
				<Button>
					<T.span onClick={this.toggleHighlight} text="Edit" />
				</Button>
			</div>

			<h1><T.span text="Dicts"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Realm" onClick={this.handleSortClick.bind(this)} data="realm" /></th>
					<th><T.span text="Key" onClick={this.handleSortClick.bind(this)} data="key" /></th>
					<th><T.span text="Value"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Order" onClick={this.handleSortClick.bind(this)} data="order" /></th>
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
