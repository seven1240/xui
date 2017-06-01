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
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { EditControl, xFetchJSON } from './libs/xtools';

class NewTicket extends React.Component {
	constructor(props) {
		super(props);
		this.state = {errmsg: '', types: [], tem: null, modal: true};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChangeTemplate = this.handleChangeTemplate.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var ticket = form2json('#newTicketForm');
		console.log("ticket", ticket);

		if (!ticket.cid_number || !ticket.subject) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/tickets", {
			method:"POST",
			body: JSON.stringify(ticket)
		}).then((obj) => {
			_this.props.handleNewTicketAdded(obj);
		}).catch((msg) => {
			console.error("ticket", msg);
			_this.setState({errmsg: '' + msg + ''});
		});
	}

	handleChangeTemplate(e) {
		this.setState({modal: !this.state.modal});
	}

	componentDidMount() {
		const _this = this;
		xFetchJSON("/api/dicts?realm=TICKET_TYPE").then((data) => {
			_this.setState({types: data});
		});
	}

	render() {
		console.log(this.props);

		const props = Object.assign({}, this.props);
		delete props.handleNewTicketAdded;
		let value = "联系人:" + "\n" + "投诉电话:" + "\n" + "事故地点:"; 

		let tem = this.state.modal ? 
			<div><FormGroup controlId="formCIDNumber">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="cid_number" /></Col>
				</FormGroup>
				<FormGroup controlId="formSubject">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Subject" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="subject" placeholder="" /></Col>
				</FormGroup>
				<FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>

					<Col sm={10}>
						<FormControl componentClass="select" name="type">
							{this.state.types.map(function(t) {
								return <option key={t.id} value={t.v}>{T.translate(t.v)}</option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>
				<FormGroup controlId="formContent">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Content"/></Col>
					<Col sm={10}><FormControl componentClass="textarea" rows="5" name="content" placeholder="" /></Col>
				</FormGroup>
			</div> : 
			<div><FormGroup controlId="formCIDNumber">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="cid_number" value="1000"/></Col>
				</FormGroup>
				<FormGroup controlId="formSubject">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Subject" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="subject" /></Col>
				</FormGroup>
				<FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>

					<Col sm={10}>
						<FormControl componentClass="select" name="type">
							{this.state.types.map(function(t) {
								return <option key={t.id} value={t.v}>{T.translate(t.v)}</option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>
				<FormGroup controlId="formContent">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Content"/></Col>
					<Col sm={10}><FormControl componentClass="textarea" rows="5" name="content" value={value} /></Col>
				</FormGroup>
			</div>

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Ticket" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newTicketForm">
				{tem}
				<FormGroup>
					<Col smOffset={2} sm={2}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Save" />
						</Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
					<Col smOffset={6} sm={2}>
						<Button type="button" bsStyle="primary" onClick={this.handleChangeTemplate}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Template" />
						</Button>
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

class TicketPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {ticket: {}, users: [], user_options: null, ticket_comments: [], deal_user: null, edit: false, types: []};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleCommit = this.handleCommit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleSubmitChange = this.handleSubmitChange.bind(this);
		this.handleControlClose = this.handleControlClose.bind(this);
	}

	handleControlClose () {
		let _this = this;
		let ticket = this.state.ticket;
		console.log('ticket', ticket)
		let id = this.state.ticket.id;
		xFetchJSON("/api/tickets/" + id  + "/close", {
			method: "PUT"
		}).then(() => {
			ticket.status = "TICKET_ST_DONE";
			_this.setState({ticket: ticket});
			notify(<T.span text={{key:"Closed at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("ticket", msg);
		});
	} 

	handleSubmit(e) {
		var _this = this;
		var ticket = form2json('#ticketAppointForm');

		xFetchJSON("/api/tickets/" + this.state.ticket.id + "/assign/" + ticket.current_user_id, {
			method: "PUT",
			body: JSON.stringify(ticket)
		}).then(() => {
			console.log('appoint successfully')
		}).catch((err) => {
			console.error("ticket", err);
			notify(err, "error");
		});
	}

	handleCommit(e) {
		var _this = this;
		var ticket = form2json('#ticketProcessingForm');

		xFetchJSON("/api/tickets/" + this.state.ticket.id + "/comments", {
			method: "POST",
			body: JSON.stringify(ticket)
		}).then((obj) => {
			var rows = this.state.ticket_comments;
			rows.unshift(obj);
			this.setState({ticket_comments: rows, deal_user: null,hidden_user: null});
		}).catch((err) => {
			console.error("ticket", err);
			notify(err, "error");
		});
	}

	handleSubmitChange(e) {
		var _this = this;

		console.log("submit...");
		var ticket = form2json('#ticketForm');
		console.log("ticket", ticket);

		if (!ticket.cid_number || !ticket.subject) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/tickets/" + ticket.id, {
			method: "PUT",
			body: JSON.stringify(ticket)
		}).then((data) => {
			_this.setState({ticket: ticket, errmsg: {key: "Saved at", time: Date()}, edit: !_this.state.edit});
		}).catch((msg) => {
			console.error("ticket", msg);
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	componentDidMount() {
		var _this = this;
		xFetchJSON("/api/tickets/" + _this.props.params.id).then((data) => {
			console.log("ticket", data);
			_this.setState({ticket: data});
		}).catch((e) => {
			console.error("get ticket", e);
		});

		xFetchJSON("/api/users/bind").then((data) => {
			this.setState({users: data});
		});

		xFetchJSON("/api/tickets/" + _this.props.params.id + '/comments').then((data) => {
			console.log('addddd', data)
			this.setState({ticket_comments: data});
		});

		xFetchJSON("/api/dicts?realm=TICKET_TYPE").then((data) => {
			_this.setState({types: data});
		});
	}

	render() {
		let savebtn = "";
		if (this.state.edit) {
			savebtn = <Button onClick={this.handleSubmitChange}><i className="fa fa-save" aria-hidden="true"></i>&nbsp;<T.span text="Save"/></Button>
		}

		const ticket_comments = this.state.ticket_comments.map(function(row) {
			let src = row.avatar_url;
			let style = {width: '40px'};
			return <Row key={row.id}>
				<Col componentClass={ControlLabel} sm={1} smOffset={2}><img src={src} style={style}/></Col>
				<Col sm={6}> <strong>{row.user_name}</strong>&nbsp;<small>{row.created_epoch}</small>
					<br/><br/><p>{row.content}</p>
				</Col>
			</Row>
		})

		const ticket = this.state.ticket;

		var status = '';
		var style = null;
		if(ticket.status == "TICKET_ST_NEW"){
			style = {color: 'red'};
		}
		if(ticket.status == 'TICKET_ST_DONE'){
			style = {color: 'green'};
		}

		let save_btn = "";
		let commit_btn = "";
		let hidden_user = "";
		const users = this.state.users;
		let deal_user = <FormControl componentClass="select" name="current_user_id">{
				users.map(function(row) {
					return <option key={row.id} value={row.id}>{row.name} ({row.extn}) {row.nickname}</option>
				})
			}
		</FormControl>;
		if(ticket.current_user_id){
			users.map(function(row) {
				if(row.id == ticket.current_user_id){
					deal_user = <FormControl type="input" readOnly="readonly" value={row.name}/>
					hidden_user = <FormControl type="hidden" name="current_user_id" value={row.id}/>
				}
			})
		}

		this.state.deal_user = deal_user;
		this.state.hidden_user = hidden_user;

		save_btn = <Button onClick={this.handleSubmit}><T.span text="指派"/></Button>
		commit_btn = <Button onClick={this.handleCommit}><T.span text="评论"/></Button>

		const options = <FormGroup>
			<Col componentClass={ControlLabel} sm={2}><T.span text="处理人" /></Col>
			<Col sm={8}>
				{this.state.deal_user}
			</Col>
		</FormGroup>;

		if (ticket.record_path) {
			const src = "http://118.89.102.147:8081/" + ticket.record_path;
			let Audio = <audio src={src} controls="controls" />;
		} else {
			let Audio = <div></div>;
		};
		let FORM;
		if (this.state.edit == false) {
			FORM = <FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="type" defaultValue={ticket.type}/></Col>
				</FormGroup>;
		} else {
			FORM = <FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="type">
							{this.state.types.map(function(t) {
								if (t.v == ticket.type) {
									return <option key={t.id} value={t.v} selected="selected">{T.translate(t.v)}</option>;
								} else {
									return <option key={t.id} value={t.v}>{T.translate(t.v)}</option>;
								};								
							})}
						</FormControl>
					</Col>
				</FormGroup>;
		};
		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				<Button onClick={this.handleControlClose}><i className="fa fa-check-square" aria-hidden="true"></i>&nbsp;<T.span text="Close"/></Button>
				{ savebtn }
				<Button onClick={this.handleControlClick}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;<T.span text="Edit"/></Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="工单"/></h1>
			<hr/>
			<Form horizontal id="ticketForm">
				<input type="hidden" name="id" defaultValue={ticket.id}/>
				<FormGroup controlId="formCIDNumber">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="cid_number" defaultValue={ticket.cid_number}/></Col>
				</FormGroup>

				<FormGroup controlId="formCreated_epoch">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Created At"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="created_epoch" defaultValue={ticket.created_epoch}/></Col>
				</FormGroup>

				{FORM}				

				<FormGroup controlId="formStatus">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Status"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={ticket.status} style={style}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formUser">
					<Col componentClass={ControlLabel} sm={2}><T.span text="派单人"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={ticket.user_id}/></FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formCaller_id_name">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Record"/></Col>
					<Col sm={10}>{Audio}</Col>
				</FormGroup>

				<FormGroup controlId="formSubject">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Subject"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="subject" defaultValue={ticket.subject}/></Col>
				</FormGroup>

				<FormGroup controlId="formContent">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Content"/></Col>
					<Col sm={8}><EditControl componentClass="textarea" edit={this.state.edit} name="content" defaultValue={ticket.content}/></Col>
				</FormGroup>
			</Form>
			<br/>
			<Form horizontal id="ticketAppointForm">				
				{options}
				{this.state.hidden_user}
				<FormGroup>
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={10}>{save_btn}</Col>
				</FormGroup>
			</Form>
			<Form horizontal id="ticketProcessingForm">
				<FormGroup>
					<Col componentClass={ControlLabel} sm={2}><T.span text="内容"/></Col>
					<Col sm={8}>
						<FormControl componentClass="textarea" name="content" placeholder="内容" />
					</Col>
				</FormGroup>
				<FormGroup>
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={10}>{commit_btn}</Col>
				</FormGroup>
			</Form>

			<hr/>
			{ticket_comments}
		</div>
	}
}

class TicketsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {rows: [], danger: false, formShow: false};
		this.handleDelete = this.handleDelete.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
	}
	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		var _this = this;
		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}
		xFetchJSON("/api/tickets/" + id, {method: "DELETE"}).then(() => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			this.setState({rows: rows});
		}).catch((msg) => {
			console.error("user", msg);
			notify(msg, 'error');
		});
	}
	componentWillMount () {
	}

	componentWillUnmount () {
	}

	componentDidMount () {
		xFetchJSON("/api/tickets").then((data) => {
			this.setState({rows: data});
		});
	}

	handleTicketAdded(ticket) {
		var rows = this.state.rows;
		rows.unshift(ticket);
		this.setState({rows: rows, formShow: false});
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		}
	}

	render () {
		var _this = this;
		let hand = { cursor: "pointer"};
		var danger = this.state.danger ? "danger" : "";
		let formClose = () => this.setState({ formShow: false });
		var rows = _this.state.rows.map(function(row) {
			var status = '';
			var style = null;
			if(row.status == "TICKET_ST_NEW"){
				style = {color: 'red'};
			}
			if(row.status == 'TICKET_ST_DONE'){
				style = {color: 'green'};
			}
			return <tr key={row.id}>
				<td>{row.id}</td>
				<td>{row.cid_number}</td>
				<td>{row.subject}</td>
				<td>{row.created_epoch}</td>
				<td><T.span text={row.status} style={style}/></td>
				<td><Link to={`/tickets/${row.id}`}><T.span text="开始处理"/></Link> | <T.a style={hand} onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>
		})
		return <div>
			<ButtonToolbar className="pull-right">
				<Button onClick={this.handleControlClick} data="new">
					<i className="fa fa-plus" aria-hidden="true" onClick={this.handleControlClick} data="new"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="New" />
				</Button>
			</ButtonToolbar>

			<h1><T.span text="Tickets" /></h1>

			<table className="table">
				<tbody>
					<tr>
						<th><T.span text="ID"/></th>
						<th><T.span text="CID Number"/></th>
						<th><T.span text="Subject"/></th>
						<th><T.span text="Created At"/></th>
						<th><T.span text="Status"/></th>
						<th><T.span text="Action"/></th>
					</tr>
					{rows}
				</tbody>
			</table>
			<NewTicket show={this.state.formShow} onHide={formClose} handleNewTicketAdded={this.handleTicketAdded.bind(this)}/>
		</div>
	}
}

export {TicketPage, TicketsPage};
