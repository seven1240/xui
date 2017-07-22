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
 * Mariah Yang <yangxiaojin@x-y-t.cn>
 * Liyang <liyang@x-y-t.cn>
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';
import Select from 'react-select';
import { Link } from 'react-router';
import { EditControl, xFetchJSON } from '../libs/xtools'

class GroupMembers extends React.Component {
	constructor(props) {
		super(props);
		this.state = {members: [], danger: false, select_value: [], users: []};
	}

	handleGetGroupMembers() {
		xFetchJSON("/api/groups/" + this.props.group_id + "/members").then((data) => {
			this.setState({members: data});
		});
	}

	handleGetReaminMembers() {
		xFetchJSON("/api/groups/" + this.props.group_id + "/remain_members").then((data) => {
			console.log("remain users:", data)
			this.setState({users: data});
		}).catch((msg) => {
			console.log("get remain users ERR", msg);
		});
	}

	handleMembersAdded() {
		const group_id = this.props.group_id;
		const members = JSON.stringify(this.state.select_value.map(function(select) {
			return {group_id: group_id, user_id: select.value}
		}));

		xFetchJSON("/api/groups/members", {
			method: "POST",
			body: members
		}).then((obj) => {
			this.handleGetGroupMembers();
			this.handleGetReaminMembers();
			this.setState({select_value: []});
		}).catch((msg) => {
			console.error("member", msg);
		});
	}

	handleSelectChange(value) {
		this.setState({select_value: value});
		console.log('select_value', value);
	}


	handleDelete(e) {
		e.preventDefault();

		var user_id = e.target.getAttribute("data-id");
		console.log("deleting id", user_id);

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/groups/members/" + this.props.group_id + "/" + user_id, {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			var members = this.state.members.filter(function(m) {
				return m.user_id != user_id;
			});

			this.setState({members: members});
			this.handleGetReaminMembers();

		}).catch((msg) => {
			console.error("groups member ", msg);
		});
	}

	handleDeleteMembers(e) {

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/groups/members/" + this.props.group_id, {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			this.handleGetGroupMembers();
			this.handleGetReaminMembers();

		}).catch((msg) => {
			console.error("groups members ", msg);
		});
	}

	componentDidMount() {
		this.handleGetGroupMembers();
		this.handleGetReaminMembers();
	}

	render() {
		const toggleDanger = () => this.setState({ danger: !this.state.danger });
		const danger = this.state.danger ? "danger" : null;
		const member_options = this.state.users.map(function(member) {
			return {label: member.name + "|" + member.extn, value: member.id}
		});

		const _this = this;
		var members = this.state.members.map(function(member) {
			return <tr key={member.id}>
					<td><Link to={`/settings/users/${member.user_id}`}>{member.extn}</Link></td>
					<td>{member.name}</td>
					<td>{member.domain}</td>
					<td style={{textAlign: "right"}}>
						<T.a onClick={_this.handleDelete.bind(_this)} data-id={member.user_id} text="Delete" className={danger} href="#"/>
					</td>
			</tr>;
		})

		return <div>
			<h2><T.span text="Group Members"/></h2><br/>
			<ButtonToolbar>
				<Select style={{ minWidth:"160px", maxWidth:"300px"}} name="multi-select" multi="true" className="pull-left" value={this.state.select_value} placeholder={T.translate('Please Select')} options={member_options} onChange={this.handleSelectChange.bind(this)}/>
				<Button bsStyle="primary" onClick={this.handleMembersAdded.bind(this)} className="pull-left">{T.translate("Add Member(s)")}</Button>
				<Button bsStyle="danger" className="pull-right" onClick={this.handleDeleteMembers.bind(this)}>{T.translate("Remove All Member(s)")}</Button>
			</ButtonToolbar>
			<br/>
			<table className="table">
				<tbody>
				<tr>
					<th><T.span text="Number" data="k"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Domain"/></th>
					<th style={{textAlign: "right"}}>
						<T.span style={{cursor: "pointer"}} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/>
					</th>
				</tr>
				{members}
				</tbody>
			</table>
		</div>
	}
}

class NewGroup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			errmsg: '',
			remain_music_mcasts: [],
			remain_realtime_mcasts: []
		};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleGetRemainMusicMcasts = this.handleGetRemainMusicMcasts.bind(this);
		this.handleGetRemainRealtimeMcasts = this.handleGetRemainRealtimeMcasts.bind(this);
	}

	handleSubmit(e) {

		console.log("submit...");
		var group = form2json('#newGroupForm');
		console.log("group", group);

		if (!group.name || !group.realm) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}
		xFetchJSON("/api/groups", {
			method: "POST",
			body: JSON.stringify(group)
		}).then((obj) => {
			group.id = obj.id;
			this.props.handleNewGroupAdded(group);
			this.handleGetRemainRealtimeMcasts();
		}).catch((msg) => {
			console.error("group", msg);
			this.setState({errmsg: '' + msg + ''});
		});
	}

	handleGetRemainMusicMcasts() {
		var _this = this;

		xFetchJSON("/api/mcasts/remain_music_mcasts").then((data) => {
			console.log("remain music mcasts:", data)
			_this.setState({remain_music_mcasts: data});
		}).catch((msg) => {
			console.log("get remain music mcasts ERR", msg);
		});
	}

	handleGetRemainRealtimeMcasts() {
		var _this = this;

		xFetchJSON("/api/mcasts/remain_realtime_mcasts").then((data) => {
			console.log("remain realtime mcasts:", data)
			_this.setState({remain_realtime_mcasts: data});
		}).catch((msg) => {
			console.log("get remain realtime mcasts ERR", msg);
		});
	}

	componentDidMount() {
		this.handleGetRemainRealtimeMcasts();
		this.handleGetRemainMusicMcasts();
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.handleNewGroupAdded;
		const the_group_options = this.props.group_options;
		delete props.group_options;

		const group_options = the_group_options.map(function(option){
			var text = option.name.replace(/ /g, String.fromCharCode(160))
			return <option key={option} value={option.value}>{text}</option>
		});

		const enable_options = [[1, "Yes"], [0, "No"]];

		var realtime_mcast_options = this.state.remain_realtime_mcasts.map(function(o){
			return <option key={o.id} value={o.id}><T.span text={o.name}/></option>
		})

		var music_mcast_options = this.state.remain_music_mcasts.map(function(o){
			return <option key={o.id} value={o.id}><T.span text={o.name}/></option>
		})

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Group" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newGroupForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" /></Col>
				</FormGroup>

				<FormGroup controlId="formParentGroup">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Parent Group"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="group_id">
							<option value=""></option>
							{ group_options }
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formUniqueAttribution">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Unique Attribution"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="unique_attribution">
							{enable_options.map(function(o) {
								return <option key={o[0]} value={o[0]}><T.span text={o[1]}/></option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formRealtimeMcast">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realtime Multicast Channel"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="realtime_mcast_id">
							<option value=""></option>
							{ realtime_mcast_options }
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formMusicMcast">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Music Multicast Channel"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="music_mcast_id">
							<option value=""></option>
							{ music_mcast_options }
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realm" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="realm" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><FormControl type="input" name="description" /></Col>
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

class GroupPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			errmsg: '',
			group: {},
			edit: false,
			permissions: [],
			group_options: [],
			mcasts: [],
			remain_music_mcasts: [],
			remain_realtime_mcasts: []
		};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handlePermissions = this.handlePermissions.bind(this);
	}

	handleGetGroupOptionsTree() {
		xFetchJSON("/api/groups/build_group_options_tree/" + this.props.params.id).then((data) => {
			console.log("group_options", data);
			this.setState({group_options: data});
		}).catch((e) => {
			console.log("get group_options ERR");
		});
	}

	handleGetRemainMusicMcasts() {
		var _this = this;

		xFetchJSON("/api/mcasts/remain_music_mcasts").then((data) => {
			console.log("remain music mcasts:", data)
			_this.setState({remain_music_mcasts: data});
		}).catch((msg) => {
			console.log("get remain music mcasts ERR", msg);
		});
	}

	handleGetRemainRealtimeMcasts() {
		var _this = this;

		xFetchJSON("/api/mcasts/remain_realtime_mcasts").then((data) => {
			console.log("remain realtime mcasts:", data)
			_this.setState({remain_realtime_mcasts: data});
		}).catch((msg) => {
			console.log("get remain realtime mcasts ERR", msg);
		});
	}

	handleSubmit(e) {

		console.log("submit...");
		var group = form2json('#newGroupForm');
		console.log("group", group);

		if (!group.name || !group.realm) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/groups/" + group.id, {
			method: "PUT",
			body: JSON.stringify(group)
		}).then(() => {
			this.setState({
				group: group,
				errmsg: {key: "Saved at", time: Date()},
				edit: false
			});
			this.handleGetGroupOptionsTree();
			this.handleGetRemainRealtimeMcasts();
		}).catch(() => {
			console.error("submit group error", msg);
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
		this.handleGetRemainRealtimeMcasts();
		this.handleGetRemainMusicMcasts();
	}

	handlePermissions(e) {
		var group_id = this.state.group.id;
		var permission_id = e.target.value;
		if (e.target.checked) {
			var gtype = "POST";
		} else {
			var gtype = "DELETE";
		}
		xFetchJSON("/api/permissions", {
			method: gtype,
			body: '{"permission_id":"'+permission_id+'","group_id":"'+group_id+'"}'
		}).then((data) => {
			console.error("www", data);
		}).catch((msg) => {
			console.error("err", msg);
		});
	}

	componentDidMount() {
		xFetchJSON("/api/groups/" + this.props.params.id).then((data) => {
			console.log("group", data);
			this.setState({group: data});
		}).catch((e) => {
			console.log("get group ERR");
		});

		xFetchJSON("/api/permissions/" + this.props.params.id).then((data) => {
			console.log("permissions", data);
			this.setState({permissions: data});
		}).catch((e) => {
			console.log("get permissions ERR");
		});

		xFetchJSON("/api/mcasts").then((data) => {
			this.setState({mcasts: data});
		}).catch((e) => {
			console.log("get mcasts ERR");
		});

		this.handleGetGroupOptionsTree();
	}

	render() {
		const group = this.state.group;
		const mcasts = this.state.mcasts;
		const enable_options = [[1, "Yes"], [0, "No"]];
		var unique_att_default_value = "No";
		var real_mcast_default_value = "";
		var music_mcast_default_value = "";

		const group_options = this.state.group_options.map(function(option) {
			return [option.value, option.name.replace(/ /g, String.fromCharCode(160))];
		});

		var realtime_mcast_options = this.state.remain_realtime_mcasts.map(function(o){
			return [o.id, o.name];
		})


		var music_mcast_options = this.state.remain_music_mcasts.map(function(o){
			return [o.id, o.name];
		})

		mcasts.map(function(m) {
			if (m.id == group.realtime_mcast_id) {
				real_mcast_default_value = m.name;
				realtime_mcast_options.push([m.id, m.name]);
			}

			if (m.id == group.music_mcast_id) music_mcast_default_value = m.name;
		});

		let save_btn = "";
		let err_msg = "";

		if (this.state.edit) {
			save_btn = <Button onClick={this.handleSubmit}><i className="fa fa-save" aria-hidden="true"></i>&nbsp;<T.span text="Save"/></Button>
			if (this.state.errmsg) {
				err_msg  = <Button><T.span text={this.state.errmsg} className="danger"/></Button>
			}
		}

		var permissions = this.state.permissions.map(function(row) {
			return <Checkbox key="row" name="permissions" defaultChecked={row.checkshow} value={row.id}><T.span text="action:"/><T.span text={row.action}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<T.span text="type:"/><T.span text={row.method}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<T.span text="param:"/><T.span text={row.param}/></Checkbox>
		})

		enable_options.map(function(o){
			if (o[0] == group.unique_attribution) unique_att_default_value = o[1];
		});

		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				{err_msg} { save_btn }
				<Button onClick={this.handleControlClick}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;<T.span text="Edit"/></Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Groups"/></h1>
			<hr/>

			<Form horizontal id="newGroupForm">
				<input type="hidden" name="id" defaultValue={group.id}/>

				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={group.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realm" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="realm" defaultValue={group.realm}/></Col>
				</FormGroup>

				<FormGroup controlId="formParentGroup">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Parent Group" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} componentClass="select" name="group_id" options={group_options} defaultValue={group.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="description" defaultValue={group.description}/></Col>
				</FormGroup>

				<FormGroup controlId="formUniqueAttribution">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Unique Attribution"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} componentClass="select" options={enable_options} name="unique_attribution" defaultValue={ouog_default_value}/></Col>
				</FormGroup>

				<FormGroup controlId="formRealtimeMcast">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realtime Multicast Channel"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} componentClass="select" options={realtime_mcast_options} name="realtime_mcast_id" defaultValue={real_mcast_default_value}/></Col>
				</FormGroup>

				<FormGroup controlId="formMusicMcast">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Music Multicast Channel"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} componentClass="select" options={music_mcast_options} name="music_mcast_id" defaultValue={music_mcast_default_value}/></Col>
				</FormGroup>

				<FormGroup controlId="formSave">
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={10}>{save_btn}</Col>
				</FormGroup>
			</Form>

			<br/>
			<FormGroup onChange={this.handlePermissions}>
				<Col componentClass={ControlLabel} sm={2}><T.span text="Permissions"/></Col>
				<Col sm={10}>{permissions}</Col>
			</FormGroup>
			<br/>
			<hr/>
			{group.id ? <GroupMembers group_id={group.id} /> : null}

		</div>
	}
}

class GroupsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			formShow: false,
			rows: [],
			danger: false,
			formShow1: false,
			group_options: []
		};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleControlClick(data) {
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		} else if (data == "import") {
			this.setState({ formShow1: true});
		};
	}

	handleDelete(id) {
		console.log("deleting id ", id);

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/groups/" + id, {
				method: "DELETE"
			}).then(() => {
				console.log("deleted")
				this.handleGetGroupsTree();
				this.handleGetGroupOptionsTree();
			}).catch((msg) => {
				console.error("group", msg);
			});
	}

	handleClick(x) {
	}

	handleGetGroupOptionsTree() {
		xFetchJSON("/api/groups/build_group_options_tree").then((data) => {
			console.log("group_options", data);
			this.setState({group_options: data});
		}).catch((e) => {
			console.log("get group_options ERR");
		});
	}

	handleGetGroupsTree() {
		xFetchJSON("/api/groups/build_group_tree").then((data) => {
			console.log("group_tree", data);
			this.setState({rows: data});
		}).catch((e) => {
			console.log("get group_tree ERR");
		});
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentDidMount() {
		this.handleGetGroupsTree();
		this.handleGetGroupOptionsTree();
	}

	handleFSEvent(v, e) {
	}

	handleGroupAdded(group) {
		this.handleGetGroupsTree();
		this.setState({formShow: false});
		this.handleGetGroupOptionsTree();

	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let formClose1 = () => this.setState({ formShow1: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td>{row.spaces.replace(/ /g, String.fromCharCode(160))}<Link to={`/settings/groups/${row.id}`}>{row.name}</Link></td>
					<td>{row.realm}</td>
					<td>{row.description}</td>
					<td><T.a onClick={() => _this.handleDelete(row.id)} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <div>
			<ButtonToolbar className="pull-right">
				<ButtonGroup>
				<Button onClick={() => this.handleControlClick("new")}>
					<i className="fa fa-plus" aria-hidden="true" onClick={() => this.handleControlClick("new")}></i>&nbsp;
					<T.span onClick={() => this.handleControlClick("new")} text="New" />
				</Button>
				</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Groups"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Realm"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewGroup show={this.state.formShow} onHide={formClose} handleNewGroupAdded={this.handleGroupAdded.bind(this)} group_options={this.state.group_options}/>
		</div>
	}
}

export {GroupsPage, GroupPage};
