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
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox } from 'react-bootstrap';
import { Tab, Row, Col, Nav, NavItem } from 'react-bootstrap';
import ConferencePage from './page_conferences';
import { xFetchJSON } from './libs/xtools';

class NewRoom extends React.Component {
	propTypes: {handleNewRoomAdded: React.PropTypes.func}

	constructor(props) {
		super(props);

		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var room = form2json('#newRoom');
		console.log("room", room);

		if (!room.name || !room.nbr) {
			this.setState({ errmsg: "Mandatory fields left blank" });
			return;
		}

		room.realm = domain;
		xFetchJSON("/api/conference_rooms", {
			method: "POST",
			body: JSON.stringify(room)
		}).then((obj) => {
			console.log(obj);
			room.id = obj.id;
			_this.props.onNewRoomAdded(room);
		}).catch((msg) => {
			console.error("room", msg);
			_this.setState({errmsg: '' + msg});
		});
	}

	render() {
		console.log(this.props);
		const props = Object.assign({}, this.props);
		delete props.onNewRoomAdded;

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Room" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newRoom">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="Seven's Room" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><FormControl type="input" name="description" placeholder="A Test Room" /></Col>
				</FormGroup>

				<FormGroup controlId="fromNumber">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Number" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="nbr" placeholder="3000" /></Col>
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

class Conferences extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			formShow: false,
			rows: []
		};
	}

	handleControlClick(data) {
		if (data == "new") {
			this.setState({ formShow: true});
		}
	}

	handleNewRoomAdded(room) {
		let rows = this.state.rows;
		rows.push(room);
		this.setState({rows: rows, formShow: false})
	}

	componentDidMount() {
		const _this = this;
		xFetchJSON("/api/conference_rooms").then((rows) => {
			console.log('conferences', rows);
			_this.setState({rows: rows});
		});
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		const defaultActiveKey = this.state.rows.length > 0 ? this.state.rows[0].id : 0;

		let items = this.state.rows.map(function(room) {
			return <NavItem eventKey={room.id} key={room.id} title={room.description}>{room.name}<br/><small>{room.nbr}</small></NavItem>;
		});

		let panes = this.state.rows.map(function(room) {
			let name = room.nbr + "-" + domain;
			return <Tab.Pane eventKey={room.id} key={room.id} unmountOnExit><ConferencePage room = {room} name={name} room_id={room.id} room_nbr={room.nbr}/></Tab.Pane>;
		});

		return <Tab.Container id="conference-tabs" defaultActiveKey={defaultActiveKey}>
			<Row className="clearfix">
				<Col sm={2}>
					<br />
					<Nav bsStyle="pills" stacked>
						{ items }
					</Nav>

					<hr/>

					<Button onClick={() => this.handleControlClick("new")}>
						<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
						<T.span text="New" />
					</Button>

					<NewRoom show={this.state.formShow} onHide={formClose} onNewRoomAdded={this.handleNewRoomAdded.bind(this)}/>
				</Col>
				<Col sm={10} className="leftBar">
					<Tab.Content animation>
						{ panes }
					</Tab.Content>
				</Col>
			</Row>
		</Tab.Container>;
	}
}

export default Conferences;
