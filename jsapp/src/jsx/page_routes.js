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
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { EditControl } from './xtools'

class NewRoute extends React.Component {
	propTypes: {handleNewRouteAdded: React.PropTypes.func}

	constructor(props) {
		super(props);

		this.state = {errmsg: '', dest_uuid: null, route_body: null};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleDestTypeChange = this.handleDestTypeChange.bind(this);
	}

	handleDestTypeChange(e) {
		const _this = this;

		console.log(e.target);
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
				$.getJSON("/api/gateways", function(gateways) {
					const dest_options = gateways.map(function(gateway) {
						return <option key={gateway.id} value={gateway.id}>{gateway.name} [{gateway.realm} {gateway.username}]</option>;
					});

					const dest_uuid = <FormGroup controlId="formDestUUID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Gateway" /></Col>
						<Col sm={10}><FormControl componentClass="select" name="dest_uuid">{dest_options}</FormControl></Col>
					</FormGroup>;

					_this.setState({dest_uuid: dest_uuid, route_body: null});
				});
				break;
			case 'FS_DEST_IVRBLOCK':
				$.getJSON("/api/blocks", function(blocks) {
					const dest_options = blocks.map(function(block) {
						return <option key={block.id} value={block.id}>{block.name} [{block.description}]</option>;
					});

					const dest_uuid = <FormGroup controlId="formDestUUID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="IVR Block" /></Col>
						<Col sm={10}><FormControl componentClass="select" name="dest_uuid">{dest_options}</FormControl></Col>
					</FormGroup>;

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
			notify(<T.span text="Mandatory fields left blank"/>);
			return;
		}

		$.ajax({
			type: "POST",
			url: "/api/routes",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(route),
			success: function (obj) {
				route.id = obj.id;
				_this.props["data-handleNewRouteAdded"](route);
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	render() {
		console.log(this.props);

		return <Modal {...this.props} aria-labelledby="contained-modal-title-lg">
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

				<FormGroup controlId="fromPrefix">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Prefix" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="prefix" placeholder="010" /></Col>
				</FormGroup>

				<FormGroup controlId="formContext">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Context"  className="mandatory"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="context" placeholder="select">
							<option value="default"><T.span text="default" /></option>
							<option value="public"><T.span text="public" /></option>
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formDestType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Dest Type" /></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="dest_type" onChange={this.handleDestTypeChange}>
							<option value="FS_DEST_USER">Local User</option>
							<option value="FS_DEST_GATEWAY">Gateway</option>
							<option value="FS_DEST_IP">IP</option>
							<option value="FS_DEST_IVRBLOCK">IVR Block</option>
							<option value="FS_DEST_SYSTEM">System</option>
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

class RoutePage extends React.Component {
	propTypes: {handleNewRouteAdded: React.PropTypes.func}

	constructor(props) {
		super(props);

		this.state = {route: {}, edit: false, dest_uuid: null, dest_body: null};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDestTypeChange = this.handleDestTypeChange.bind(this);
	}

	handleDestTypeChange(e) {
		const _this = this;

		console.log(e.target);
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
				$.getJSON("/api/gateways", function(gateways) {
					let current_gateway = null
					const dest_options = gateways.map(function(gateway) {
						const gw_text = gateway.name + '[' + gateway.realm + ' ' + gateway.username + ']';
						if (_this.state.route.dest_uuid == gateway.id) {
							current_gateway = gw_text;
							return <option key={gateway.id} value={gateway.id} selected>{gw_text}</option>;
						} else {
							return <option key={gateway.id} value={gateway.id}>{gw_text}</option>;
						}
					});

					const dest_uuid = <FormGroup controlId="formDestUUID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Gateway" /></Col>
						<Col sm={10}><EditControl edit={_this.state.edit} componentClass="select" name="dest_uuid" defaultValue={current_gateway} options={dest_options}/></Col>
					</FormGroup>;

					_this.setState({dest_uuid: dest_uuid, route_body: null});
				});
				break;
			case 'FS_DEST_IVRBLOCK':
				$.getJSON("/api/blocks", function(blocks) {
					let current_block = null
					const dest_options = blocks.map(function(block) {
						const block_text = block.name + '[' + block.description + ']';
						if (_this.state.route.dest_uuid == block.id) {
							current_block = block_text;
							return <option key={block.id} value={block.id} selected>{block_text}</option>;
						} else {
							return <option key={block.id} value={block.id}>{block_text}</option>;
						}
					});

					const dest_uuid = <FormGroup controlId="formDestUUID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="IVR Block" /></Col>
						<Col sm={10}><EditControl edit={_this.state.edit} componentClass="select" name="dest_uuid" defaultValue={current_block} options={dest_options}/></Col>
					</FormGroup>;

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
		var route = form2json('#editRouteForm');

		if (!route.name || !route.prefix) {
			notify(<T.span text="Mandatory fields left blank"/>, 'error');
			return;
		}

		$.ajax({
			type: "PUT",
			url: "/api/routes/" + route.id,
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(route),
			success: function () {
				_this.setState({route: route, edit: false})
				_this.handleDestTypeChange({target: {value: _this.state.route.dest_type}});
				notify(<T.span text={{key:"Saved at", time: Date()}}/>);
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	handleControlClick(e) {
		this.state.edit = !this.state.edit
		this.handleDestTypeChange({target: {value: this.state.route.dest_type}});
		this.setState({edit: this.state.edit});
	}

	componentDidMount() {
		var _this = this;
		$.getJSON("/api/routes/" + this.props.params.id, "", function(data) {
			_this.setState({route: data});
			_this.handleDestTypeChange({target: {value: data.dest_type}});
		}, function(e) {
			console.log("get gw ERR");
		});
	}

	render() {
		const route = this.state.route;
		let save_btn = "";
		let err_msg = "";

		if (this.state.edit) {
			save_btn = <Button><T.span onClick={this.handleSubmit} text="Save"/></Button>

			if (this.state.errmsg) {
				err_msg  = <Button><T.span text={this.state.errmsg} className="danger"/></Button>
			}
		}

		const contexts = [
			{name:'default'},
			{name:'public'}
		];

		const context_options = contexts.map(function(row) {
			if (row.name == route.context) {
				return <option value={row.name} key={row.name} selected>{row.name}</option>
			} else {
				return <option value={row.name} key={row.name}>{row.name}</option>
			}
		});

		const dest_types = [
			{name:'Local User', value:'FS_DEST_USER'},
			{name:'Gateway', value:'FS_DEST_GATEWAY'},
			{name:'IP', value:'FS_DEST_IP'},
			{name:'System', value:'FS_DEST_SYSTEM'},
			{name:'IVR Block', value:'FS_DEST_IVRBLOCK'}
		];

		const dest_type_options = dest_types.map(function(row) {
			if (row.value == route.dest_type) {
				return <option value={row.value} key={row.value} selected>{row.name}</option>
			} else {
				return <option value={row.value} key={row.value}>{row.name}</option>
			}
		});

		return <div>
			<ButtonGroup className="controls">
				{ save_btn }
				<Button><T.span onClick={this.handleControlClick} text="Edit"/></Button>
			</ButtonGroup>

			<h1>{route.name} <small>{route.extn}</small></h1>
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

				<FormGroup controlId="fromPrefix">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Prefix" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="prefix" defaultValue={route.prefix}/></Col>
				</FormGroup>
{/*
				<FormGroup controlId="formLength">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Length" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="length" defaultValue={route.length}/></Col>
				</FormGroup>
*/}
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
			</Form>
		</div>
	}
}

class RoutesPage extends React.Component {
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
			url: "/api/routes/" + id,
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
		$.getJSON("/api/routes", "", function(data) {
			_this.setState({rows: data});
		}, function(e) {
			console.log("get routes ERR");
		});
	}

	handleFSEvent(v, e) {
	}

	handleRouteAdded(route) {
		var rows = this.state.rows;
		rows.push(route);
		this.setState({rows: rows, formShow: false});
    }

	render() {
	    let formClose = () => this.setState({ formShow: false });
	    let toggleDanger = () => this.setState({ danger: !this.state.danger });
	    var _this = this;
	    var danger = this.state.danger ? "danger" : "";

		var rows = this.state.rows.map(function(row) {
			let dest = row.body;
			switch(row.dest_type) {
				case 'FS_DEST_SYSTEM': dest = null; break;
				case 'FS_DEST_GATEWAY': dest = <Link to={`/settings/gateways/${row.dest_uuid}`}>{row.body}</Link>;break;
				case 'FS_DEST_IVRBLOCK': dest = <Link to={`/blocks/${row.dest_uuid}`}>{row.body}</Link>; break;
				default: break;
			}

			return <tr key={row.id}>
					<td>{row.id}</td>
					<td>{row.context}</td>
					<td>{row.prefix}</td>
					<td><Link to={`/settings/routes/${row.id}`}>{row.name}</Link></td>
					<td>{row.description}</td>
					<td><T.span text={row.dest_type}/></td>
					<td>{dest}</td>
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

			<h1><T.span text="Routes" /></h1>

			<div>
				<table className="table">
				<tbody>
				<tr>
					<th>ID</th>
					<th><T.span text="Context" /></th>
					<th><T.span text="Prefix" /></th>
					<th><T.span text="Name" /></th>
					<th><T.span text="Description" /></th>
					<th><T.span text="Dest Type" /></th>
					<th><T.span text="Dest" /></th>
					<th><T.span text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewRoute show={this.state.formShow} onHide={formClose} data-handleNewRouteAdded={this.handleRouteAdded.bind(this)}/>
		</div>
	}
}

export { RoutesPage, RoutePage };
