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
import Select from 'react-select';
import { Tab, Row, Col, Nav, NavItem } from 'react-bootstrap';
import { Link } from 'react-router';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek';
import { EditControl, xFetchJSON } from './libs/xtools';

class NewMember extends React.Component {
	constructor(props) {
		super(props);
		// This binding is necessary to make `this` work in the callback
		this.state = {errmsg: ''};
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var member = form2json('#newMember');
		console.log("member", member);

		if (!member.name || !member.num) {
			_this.setState({ errmsg: "Mandatory fields left blank" });
			return;
		}
		console.log("pick2", member);
		xFetchJSON("/api/conference_rooms/" + this.props.room_id + '/members', {
			method: "POST",
			body: JSON.stringify(member)
		}).then((obj) => {
			console.log(obj);
			member.id = obj.id;
			_this.props.onNewMemberAdded(member);
		}).catch((msg) => {
			console.error("member", msg);
		});
	}

	render() {
		// console.log(this.props);
		const props = Object.assign({}, this.props);
		delete props.onNewMemberAdded;
		delete props.room_id;

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Add New Member" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newMember">
				<input type="hidden" name="route" value=''/>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="Seven Du" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><FormControl type="input" name="description" placeholder="Seven Du" /></Col>
				</FormGroup>

				<FormGroup controlId="fromNumber">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Number" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="num" placeholder="7777" /></Col>
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

class GroupBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {groups: [], users: []}
	}

	handleGroupChange(e) {
		const _this = this;

		xFetchJSON("/api/groups/" + e.value + '/members').then((users) => {
			_this.setState({users: users});
		}).catch((msg) => {
			console.error("get group users err", msg);
		});
	}

	componentDidMount() {
		const _this = this;

		xFetchJSON("/api/groups").then((groups) => {
			_this.setState({groups: groups});
		}).catch((msg) => {
			console.error("get group err", msg);
		});
	}

	handleCheckGroup(e) {
		const rows = this.state.users.map((user) => {
			user.checked = e.target.checked;
			return user;
		});

		this.setState({users: rows});
	}

	handleCheckUser(e) {
		const rows = this.state.users.map((user) => {
			if (user.id == e.target.value) user.checked = e.target.checked;
			return user;
		});

		this.setState({users: rows});
	}

	batchAddMember() {
		const _this = this;
		this.state.users.forEach((user) => {
			if (user.checked) {
				const member = {
					name: user.name,
					description: '',
					num: user.extn,
					route: ''
				};
				console.log("pick1", member)

				xFetchJSON("/api/conference_rooms/" + this.props.room_id + '/members', {
					method: "POST",
					body: JSON.stringify(member)
				}).then((obj) => {
					console.log(obj);
					member.id = obj.id;
					_this.props.onNewMemberAdded(member);
				}).catch((msg) => {
					console.error("member", msg);
				});
			}
		});
	}

	render() {
		const groups_options = this.state.groups.map(function(group) {
			return {label: group.id + "-" + group.name, value: group.id, key: group.id}
		});
		return <div style={{padding: "20px", border: "1px solid #ddd", borderRadius: "4px"}}>
			<h4><T.span text="Select Groups"/></h4>
			<hr/>
			<Select style={{ minWidth:"130px", maxWidth:"200px"}}
				placeholder={T.translate('Please Select')}
				options={groups_options}
				onChange={this.handleGroupChange.bind(this)}/>
			<ul style={{listStyle: "none"}}>
				<Checkbox onClick={this.handleCheckGroup.bind(this)} inline><T.span text="Select All"/></Checkbox>
				{
					this.state.users.map((user) => {
						return <li key={user.id}>
							<Checkbox checked={user.checked} onClick={this.handleCheckUser.bind(this)} value={user.id}>
								{user.extn} - {user.name}
							</Checkbox>
						</li>
					})
				}
			</ul>

			<br/>
			<Button onClick={this.batchAddMember.bind(this)} bsStyle="primary"><T.span text="Add Member(s)"/></Button>
		</div>
	}

}

class RoomMembers extends React.Component {
	constructor(props) {
		super(props);
		this.state = {members: [], memberFormShow: false, danger: false,
			highlight: false, batchAddmemberShow: false, groups: []}
	}

	handleMemberAdded(member) {
		var members = this.state.members;
		members.unshift(member);
		console.log("mmmmmmm", members);
		this.setState({members: members, memberFormShow: false});
	}

	handleSetAsModerator(e, num) {
		e.preventDefault();

		const _this = this;
		const data = {
			moderator: num
		}

		xFetchJSON("/api/conference_rooms/" + this.props.room.id, {
			method: "PUT",
			body: JSON.stringify(data)
		}).then((ret) => {
			_this.props.handleModeratorSet(num);
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch((err) => {
			notify(<T.span text="Error Set Moderator"/>, 'error');
		})
	}

	handleDelete(e) {
		e.preventDefault();

		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!_this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/conference_rooms/" + this.props.room.id + "/members/" + id, {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			var members = _this.state.members.filter(function(m) {
				return m.id != id;
			});

			_this.setState({members: members});
			
		}).catch((msg) => {
			console.error("conference membe", msg);
		});
	}

	clearRoute() {
		const members = this.state.members.map((m) => {
			m.route = '';
			return m;
		});

		this.setState({members: members});
	}

	autoCalcRoute() {
		console.log(this.props.room);

		const nodes = this.props.room.cluster;
		let total_weight = 0;
		let total_members = this.state.members.length;

		if (!nodes) reuturn;

		nodes.forEach((node) => {
			total_weight += parseInt(node.weight);
		});

		let x = total_members / total_weight;

		let i = 0;
		let count = 0;

		console.log("x", x);

		const members = this.state.members.map((m) => {
			if (m.name.indexOf('.') == -1) {
				m.route = nodes[i].host;
				m.unsaved = true;

				if (++count >= nodes[i].weight * x && i < nodes.length - 1) {
					i++;
					count = 0;
				}
			}

			return m;
		});

		this.setState({members: members});
	}

	handleSaveRoute() {
		const _this = this;

		this.state.members.forEach((member) => {
			// if (!member.route) return;

			xFetchJSON("/api/conference_rooms/" + this.props.room.id + "/members/" + member.id, {
				method: 'PUT',
				body: JSON.stringify({route: member.route})
			}).then((ret) => {
				const members = this.state.members.map((m) => {
					m.unsaved = false;
					return m;
				});

				this.setState({members: members});
				notify(<T.span text={{key:"Saved at", time: Date()}}/>);
			}).catch((err) => {
				console.error("Save route ERR");
			});
		});
	}

	componentDidMount() {
		const _this = this;

		xFetchJSON("/api/conference_rooms/" + _this.props.room.id + "/members").then((data) => {
			_this.setState({members: data});
		});
	}

	handleChange(id, obj) {
		const _this = this;

		xFetchJSON("/api/conference_rooms/" + _this.props.room.id + "/members/" + id, {
			method: 'PUT',
			body: JSON.stringify(obj)
		}).then((data) => {
			const members = this.state.members.map((m) => {
				if (m.id == id) m = Object.assign(m, obj);

				return m;
			})
			_this.setState({members: members});
		});
	}

	render() {
		const memberFormClose = () => this.setState({ memberFormShow: false });
		const toggleDanger = () => this.setState({ danger: !this.state.danger });
		const danger = this.state.danger ? "danger" : null
		const _this = this;

		return <div>
			<ButtonToolbar className="pull-right">

			<ButtonGroup>
				<Button onClick={() => _this.setState({highlight: !this.state.highlight})}>
					<i className="fa fa-edit" aria-hidden="true"></i>&nbsp;
					<T.span text="Edit"/>
				</Button>
			</ButtonGroup>

			<ButtonGroup>
				<Button onClick={this.autoCalcRoute.bind(this)}>
					<i className="fa fa-calculator" aria-hidden="true"></i>&nbsp;
					<T.span text="Auto Calc Route" />
				</Button>

				<Button onClick={this.clearRoute.bind(this)}>
					<i className="fa fa-trash" aria-hidden="true"></i>&nbsp;
					<T.span text="Clear Route" />
				</Button>

				<Button onClick={this.handleSaveRoute.bind(this)}>
					<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
					<T.span text="Save Route" />
				</Button>
			</ButtonGroup>

			<ButtonGroup>
				<Button onClick={() => this.setState({ memberFormShow: true })}>
					<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span text="Add Member" />
				</Button>

				<Button onClick={() => this.setState({ batchAddmemberShow: !this.state.batchAddmemberShow })}>
					<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span text="Batch" />
					<T.span text="Add Member" />
				</Button>

			</ButtonGroup>
			</ButtonToolbar>
			<h2><T.span text="Members"/></h2>

			{
				!this.state.batchAddmemberShow ? null :
				<GroupBox room_id={this.props.room.id} onNewMemberAdded={this.handleMemberAdded.bind(this)}/>
			}

			<table className="table">
				<tbody>
				<tr>
					<th><T.span text="Name" data="k"/></th>
					<th><T.span text="Number"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Route"/></th>
					<th style={{textAlign: "right"}}>
						<T.span style={{cursor: "pointer"}} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/>
					</th>
				</tr>
				{
					this.state.members.map(function (m){
						return <tr key={m.id}>
							<td><RIEInput value={_this.state.highlight ? (m.name ? m.name : T.translate("Click to Change")) : m.name} change={(obj) => _this.handleChange(m.id, obj)}
								propName="name"
								className={_this.state.highlight ? "editable" : ""}
								validate={_this.isStringAcceptable}
								classLoading="loading"
								classInvalid="invalid"/>
							</td>
							<td><RIEInput value={m.num} change={(obj) => _this.handleChange(m.id, obj)}
								propName="num"
								className={_this.state.highlight ? "editable" : ""}
								validate={_this.isStringAcceptable}
								classLoading="loading"
								classInvalid="invalid"/>
							</td>
							<td><RIEInput value={_this.state.highlight ? (m.description ? m.description : T.translate("Click to Change")) : m.description} change={(obj) => _this.handleChange(m.id, obj)}
								propName="description"
								className={_this.state.highlight ? "editable" : ""}
								validate={_this.isStringAcceptable}
								classLoading="loading"
								classInvalid="invalid"/>
							</td>
							<td style={m.unsaved ? {color: "red"} : {}}><RIEInput value={_this.state.highlight ? (m.route ? m.route : T.translate("Click to Change")) : m.route} change={(obj) => _this.handleChange(m.id, obj)}
								propName="route"
								className={_this.state.highlight ? "editable" : ""}
								validate={_this.isStringAcceptable}
								classLoading="loading"
								classInvalid="invalid"/>
							</td>
							<td style={{textAlign: "right"}}>
								<T.a onClick={(e) => _this.handleSetAsModerator(e, m.num)} text="Set As Moderator" href="#"/> |&nbsp;
								<T.a onClick={_this.handleDelete.bind(_this)} data-id={m.id} text="Delete" className={danger} href="#"/>
							</td>
						</tr>
					})
				}
				</tbody>
			</table>

			<NewMember room_id = {this.props.room.id}
				show={this.state.memberFormShow} onHide={memberFormClose}
				onNewMemberAdded={this.handleMemberAdded.bind(this)}/>
		</div>
	}
}

class NewRoom extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: '', profiles: []};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var room = form2json('#newRoom');
		console.log("room", room);

		if (!room.name || !room.nbr) {
			_this.setState({ errmsg: "Mandatory fields left blank" });
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

	componentDidMount() {
		const _this = this;
		xFetchJSON("/api/conference_profiles").then((data) => {
			_this.setState({profiles: data});
		}).catch((msg) => {
			console.error("get conference profile ERR", msg);
			_this.setState({errmsg: 'Get conference profile ERR'});
		});
	}

	render() {
		console.log(this.props);
		const props = Object.assign({}, this.props);
		delete props.onNewRoomAdded;

		const profiles_options = this.state.profiles.map(profile => {
			return <option value={profile.id} key={profile.id}>[{profile.name}] {profile.description}</option>
		});

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

				<FormGroup controlId="formProfile">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Template"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="profile_id">
							<option value="0">{T.translate("Default")}</option>
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

class ConferenceRoom extends React.Component {
	constructor(props) {
		super(props);

		this.state = {room: { banner: {}}, params:[], profiles:[], video_modes:[], users:[{id: 0, extn: '----', name: ''}],
			call_perms:[], edit: false, fonty: [], paramId: [], bgColor: [], fgColor: [] };
		this.handleSort = this.handleSort.bind(this);
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
		var room = form2json('#editRoomForm');
		var videoBanner = {fontFace: this.state.room.banner.fontFace, fontScale: room.fontScale,
			bgColor: room.bg, fgColor: room.fg, text: room.text};

		if (!room.name || !room.nbr) {
			notify(<T.span text="Mandatory fields left blank"/>, 'error');
			return;
		}

		if (room.cluster) {
			let cluster = [];
			let line = 1;
			let errors = "";
			const rows = room.cluster.split(/\r?\n/).map((row) => {
				let item = row.split(' ');

				if (!item[0]) return null;

				if (!item[0].match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:?(\d{2,5})?$/)) {
					errors += "error line: " + line + "\n";
				}

				if (!item[1]) item[1] = "1";

				cluster.push({host: item[0], weight: item[1]});
				line++;
			});

			console.log(cluster);

			if (errors) {
				alert(errors);
				return;
			}

			if (cluster.length) {
				room.cluster = cluster;
			} else {
				delete room.cluster;
			}
		}

		room.banner = JSON.stringify(videoBanner)
		delete(room.fg)
		delete(room.bg)
		delete(room.text)
		delete(room.fontScale)

		xFetchJSON("/api/conference_rooms/" + room.id, {
			method: "PUT",
			body: JSON.stringify(room)
		}).then((obj) => {
			room.banner = videoBanner;
			_this.setState({room: room, edit: false})
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("room", msg);
			notify(msg, "error");
		});

	}
	
	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	isStringAcceptable() {
		return true;
	}

	handleModeratorSet(num) {
		this.state.room.moderator = num;
		this.setState({room: this.state.room});
	}

	componentDidMount() {
		const _this = this;

		xFetchJSON("/api/conference_rooms/" + this.props.params.id).then((data) => {
			_this.setState({room: data, fgColor: data.banner.fgColor, bgColor: data.banner.bgColor});
		}).catch((msg) => {
			console.log("get room ERR");
		});


		xFetchJSON("/api/conference_room_profiles/" + this.props.params.id).then((data) => {
			_this.setState({profiles: data});
		}).catch((msg) => {
			console.log("get room profile ERR");
		});

		xFetchJSON("/api/dicts?realm=CONF_VIDEO_MODE").then((data) => {
			_this.setState({video_modes: data});
		});

		xFetchJSON("/api/dicts?realm=CONF_CALL_PERM").then((data) => {
			_this.setState({call_perms: data});
		});

		xFetchJSON("/api/conference_rooms/select/users").then((data) => {
			data.unshift({id: 0, extn: '----', name: ''});
			_this.setState({users: data});
		});
	}

	handleChange (e) {
		if(e.target.name=="bg")
			this.setState({bgColor: e.target.value});
		else
			this.setState({fgColor: e.target.value});
	}

	render() {
		const room = this.state.room;
		let save_btn = null;
		let err_msg = null;
		let _this = this;
		let current_profile = null;
		let current_video_mode = null;
		let current_call_perm = null;
		let cluster = '';
		let current_user = null;

		const conference_user_options = this.state.users.map(function(row) {
			if (row.id == room.user_id) {
				current_user = '[' + row.extn + '] ' + row.name;
			}
			return [row.id, '[' + row.extn + ']' + row.name];
		});

		const profile_options = this.state.profiles.map(function(row) {
			if (row.id == room.profile_id) {
				current_profile = '[' + row.name + '] ' + row.description;
			}
			return [row.id, '[' + row.name + ']' + row.description];
		});

		const video_mode_options = this.state.video_modes.map(function(row) {
			if (row.k == room.video_mode) {
				current_video_mode = T.translate(row.k);
			}
			return [row.k, T.translate(row.k)];
		});

		const call_perm_options = this.state.call_perms.map(function(row) {
			if (row.k == room.call_perm) {
				current_call_perm = T.translate(row.k);
			}
			return [row.k, T.translate(row.k)];
		});

		if (this.state.edit) {
			save_btn = <Button onClick={this.handleSubmit.bind(this)}>
				<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
				<T.span text="Save"/>
			</Button>
		}

		if (room.cluster) {
			room.cluster.forEach((c) => {
				cluster += c.host + ' ' + c.weight + '\n';
			});
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

			<h1>{room.name} <small>{room.nbr}</small></h1>
			<hr/>
			<Form horizontal id='editRoomForm'>
				<input type="hidden" name="id" defaultValue={room.id}/>
				<FormGroup className="xrowb">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={4}><EditControl edit={this.state.edit} name="name" defaultValue={room.name}/></Col>
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={4}><EditControl edit={this.state.edit} id="formDescription" name="description" defaultValue={room.description}/></Col>
				</FormGroup>

				<FormGroup className="xrowb">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Number" className="mandatory"/></Col>
					<Col sm={4}><EditControl edit={this.state.edit} name="nbr" defaultValue={room.nbr}/></Col>
					<Col componentClass={ControlLabel} sm={2}><T.span text="PIN"/></Col>
					<Col sm={4}><EditControl edit={this.state.edit} id="formPIN" name="pin" defaultValue={room.pin}/></Col>
				</FormGroup>

				<FormGroup className="xrowb">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Capacity"/></Col>
					<Col sm={4}><EditControl edit={this.state.edit} name="capacity" defaultValue={room.capacity}/></Col>
					<Col componentClass={ControlLabel} sm={2}><T.span text="Moderator" /></Col>
					<Col sm={4}><EditControl edit={this.state.edit} id="formMOD" name="moderator" defaultValue={room.moderator}/></Col>
				</FormGroup>

				<FormGroup className="xrowb">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Canvas Count"/></Col>
					<Col sm={4}><EditControl edit={this.state.edit} name="canvas_count" defaultValue={room.canvas_count}/></Col>
					<Col componentClass={ControlLabel} sm={2}><T.span text="Video Mode" /></Col>
					<Col sm={4}>
						<EditControl edit={this.state.edit} componentClass="select" id="formVideoMode" name="video_mode"
							text={current_video_mode} defaultValue={room.video_mode}
							options={video_mode_options}>
						</EditControl>
					</Col>
				</FormGroup>

				<FormGroup className="xrowb">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realm" /></Col>
					<Col sm={4}><EditControl edit={this.state.edit} name="realm" defaultValue={room.realm}/></Col>
					<Col componentClass={ControlLabel} sm={2}><T.span text="Conference Profile"/></Col>
					<Col sm={4}>
						<EditControl edit={this.state.edit} componentClass="select" id="formConfProfile" name="profile_id"
							text={current_profile} defaultValue={room.profile_id}
							options={profile_options}></EditControl>
					</Col>
				</FormGroup>

				<FormGroup className="xrowb">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Call Permission" /></Col>
					<Col sm={4}>
						<EditControl edit={this.state.edit} componentClass="select" id="formCallPerm" name="call_perm"
							text={current_call_perm} defaultValue={room.call_perm}
							options={call_perm_options}>
						</EditControl>
					</Col>
					<Col componentClass={ControlLabel} sm={2}><T.span text="Cluster" /></Col>
					<Col sm={4}><EditControl edit={this.state.edit} componentClass="textarea" name="cluster" defaultValue={cluster} placeholder="ip:port weight"/></Col>
				</FormGroup>
				<FormGroup className="xrowb">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Conference Banner Text"/></Col>
					<Col sm={4}><EditControl edit={this.state.edit} name="text" defaultValue={this.state.room.banner.text}/></Col>
					<Col componentClass={ControlLabel} sm={2}><T.span text="Conference Banner Scale" /></Col>
					<Col sm={4}><EditControl edit={this.state.edit} name="fontScale" defaultValue={this.state.room.banner.fontScale}/></Col>
				</FormGroup>
				<FormGroup className="xrowb">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Conference User" /></Col>
					<Col sm={4}>
						<EditControl edit={this.state.edit} componentClass="select" id="formConfUser" name="user_id"
							text={current_user} defaultValue={room.user_id}
							options={conference_user_options}></EditControl>
					</Col>
					<Col componentClass={ControlLabel} sm={2}><T.span text="Conference Banner Color" /></Col>
					<Col sm={4}>
						<input type="color" name="bg" value={_this.state.bgColor} onChange = {_this.handleChange.bind(this)}/>
						&nbsp;&nbsp;
						<input type="color" name="fg" value={_this.state.fgColor} onChange = {_this.handleChange.bind(this)}/>
						&nbsp;&nbsp;
						<span style={{color: _this.state.fgColor, backgroundColor: _this.state.bgColor}}>{this.state.room.banner.text ? this.state.room.banner.text : "Banner Text"}</span>
					</Col>
				</FormGroup>
			</Form>
			<br/>

			{room.id ? <RoomMembers room={this.state.room} handleModeratorSet={this.handleModeratorSet.bind(this)}/> : null}
		</div>
	}
}

class ConferenceRooms extends React.Component {
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
		e.preventDefault();

		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!_this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/conference_rooms/" + id, {
			method: "DELETE",
		}).then((obj) => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});
			_this.setState({rows: rows});
		}).catch((msg) => {
			console.error("conference_rooms", msg);
		});

		xFetchJSON("/api/conference_rooms/" + id + "/param", {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			console.log(obj);
		}).catch((msg) => {
			console.log("fonty", msg)
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

		let url = "/api/conference_rooms";

		xFetchJSON(url).then((data) => {
			console.log("rooms", data)
			_this.setState({rows: data});
		}).catch((msg) => {
			console.log("get rooms ERR");
		});
	}

	handleRoomAdded(route) {
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
					<td><Link to={`/settings/conference_rooms/${row.id}`}>{row.name}</Link></td>
					<td>{row.description}</td>
					<td>{row.nbr}</td>
					<td>{row.realm}</td>
					<td>{row.capacity}</td>
					<td><T.a onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger} href="#"/></td>
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

			<h1><T.span text="Conference Rooms"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name" onClick={this.handleSortClick.bind(this)} data="name" /></th>
					<th><T.span text="Description" /></th>
					<th><T.span text="Number" onClick={this.handleSortClick.bind(this)} data="number" /></th>
					<th><T.span text="Realm" onClick={this.handleSortClick.bind(this)} data="realm" /></th>
					<th><T.span text="Capacity"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewRoom show={this.state.formShow} onHide={formClose} onNewRoomAdded={this.handleRoomAdded.bind(this)}/>
		</div>
	}
}

export { ConferenceRooms, ConferenceRoom };
