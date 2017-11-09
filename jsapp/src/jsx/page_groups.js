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
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';
import Select from 'react-select';
import { Link } from 'react-router';
import { EditControl, xFetchJSON } from './libs/xtools'

class GroupMembers extends React.Component {
	constructor(props) {
		super(props);
		this.state = {members: [], danger: false, select_value: [], users: [], max: 0, startsort: 0};
		this.handleDragSortStart = this.handleDragSortStart.bind(this);
		this.handleDragSortDrop = this.handleDragSortDrop.bind(this);
	}

	handleGetGroupMembers() {
		xFetchJSON("/api/groups/" + this.props.group_id + "/members").then((data) => {
			let max = this.state.max;
			if(data.length) {
				max = data[0].sort;
				data.map((d) => {
					max = max < d.sort ? d.sort : max;
				})
			} else {
				max = 0;
			}

			this.setState({members: data, max: max});
		});
	}

	handleGetReaminMembers() {
		xFetchJSON("/api/groups/" + this.props.group_id + "/remain_members").then((data) => {
			this.setState({users: data});
		}).catch((msg) => {
			console.log("get remain users ERR", msg);
		});
	}

	handleMembersAdded() {
		const group_id = this.props.group_id;
		let members = this.state.select_value.map(function(select) {
			return {group_id: group_id, user_id: select.value}
		});
		let max = this.state.max;

		members.map((member, index) => {
			member.sort = parseInt(max) + parseInt(index) + 1;
		});

		members = JSON.stringify(members);

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
			this.handleGetGroupMembers();

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

	handleDragSortStart (e) {
		let startsort = e.target.parentNode.getAttribute("value");
		this.state.startsort = startsort;
	}

	handleDragSortDrop (e) {
		e.preventDefault();
		const _this = this;
		let row = e.target.parentNode;
		row.setAttribute('style', 'border-top: 1px solid #ddd; background-color: #fff');
		let startsort = parseInt(this.state.startsort);
		let dropsort = parseInt(row.getAttribute("value"));

		xFetchJSON("/api/groups/drag/" + startsort + "/" + dropsort, {
			method: "PUT"
		}).then((obj) => {
			_this.handleGetGroupMembers();
		}).catch((msg) => {
			console.error("group", msg);
			this.setState({errmsg: '' + msg + ''});
		}); 
	}

	handleDragSortEnter(e) {
		let row = e.target.parentNode;
		row.setAttribute('style', 'border: 2px dashed #3f3f3f; background-color: #f5f5f5');
	}

	handleDragSortOver(e) {
		e.preventDefault();
	}

	handleDragSortLeave (e) {
		let row = e.target.parentNode;
		row.setAttribute('style', 'border: 0; background-color: #fff');
	}

	render() {
		const toggleDanger = () => this.setState({ danger: !this.state.danger });
		const danger = this.state.danger ? "danger" : null;
		const member_options = this.state.users.map(function(member) {
			return {label: member.name + "|" + member.extn, value: member.id}
		});

		const _this = this;
		var members = this.state.members.map(function(member) {
			return <tr key={member.id} value={member.id}>
					<td draggable={"true"}
						onDragStart={_this.handleDragSortStart}
						onDragEnter={_this.handleDragSortEnter.bind(this)}
						onDragLeave={_this.handleDragSortLeave.bind(this)}
						onDragOver={_this.handleDragSortOver.bind(this)} 
						onDrop={_this.handleDragSortDrop}>{member.sort}</td>
					<td draggable={"true"}
						onDragStart={_this.handleDragSortStart}
						onDragEnter={_this.handleDragSortEnter.bind(this)}
						onDragLeave={_this.handleDragSortLeave.bind(this)}
						onDragOver={_this.handleDragSortOver.bind(this)} 
						onDrop={_this.handleDragSortDrop}><Link to={`/settings/users/${member.user_id}`}>{member.extn}</Link></td>
					<td draggable={"true"}
						onDragStart={_this.handleDragSortStart}
						onDragEnter={_this.handleDragSortEnter.bind(this)}
						onDragLeave={_this.handleDragSortLeave.bind(this)}
						onDragOver={_this.handleDragSortOver.bind(this)} 
						onDrop={_this.handleDragSortDrop}>{member.name}</td>
					<td draggable={"true"}
						onDragStart={_this.handleDragSortStart}
						onDragEnter={_this.handleDragSortEnter.bind(this)}
						onDragLeave={_this.handleDragSortLeave.bind(this)}
						onDragOver={_this.handleDragSortOver.bind(this)} 
						onDrop={_this.handleDragSortDrop}>{member.domain}</td>
					<td draggable={"true"}
						onDragStart={_this.handleDragSortStart}
						onDragEnter={_this.handleDragSortEnter.bind(this)}
						onDragLeave={_this.handleDragSortLeave.bind(this)}
						onDragOver={_this.handleDragSortOver.bind(this)} 
						onDrop={_this.handleDragSortDrop} style={{textAlign: "right"}}>
						<T.a onClick={_this.handleDelete.bind(_this)} data-id={member.user_id} text="Delete" className={danger} href="#"/>
					</td>
			</tr>;
		})

		return <div>
			<h2><T.span text="Group Members"/></h2><br/>
			<ButtonToolbar>
				<Select style={{ minWidth:"160px", maxWidth:"300px"}} name="multi-select" multi={true} className="pull-left" value={this.state.select_value} placeholder={T.translate('Please Select')} options={member_options} onChange={this.handleSelectChange.bind(this)}/>
				<Button bsStyle="primary" onClick={this.handleMembersAdded.bind(this)} className="pull-left">{T.translate("Add Member(s)")}</Button>
				<Button bsStyle="danger" className="pull-right" onClick={this.handleDeleteMembers.bind(this)}>{T.translate("Remove All Member(s)")}</Button>
			</ButtonToolbar>
			<br/>
			<table className="table">
				<tbody>
				<tr>
					<th><T.span text="Sort"/></th>
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

		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {

		console.log("submit...");
		var group = form2json('#newGroupForm');
		console.log("group", group);
		let max = this.props.max;

		if (!group.name || !group.realm) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		if(group.group_id == ''){
			group.sort = parseInt(max) + 1;
		}

		xFetchJSON("/api/groups", {
			method: "POST",
			body: JSON.stringify(group)
		}).then((obj) => {
			group.id = obj.id;
			this.props.handleNewGroupAdded(group);
		}).catch((msg) => {
			console.error("group", msg);
			this.setState({errmsg: '' + msg + ''});
		}); 
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.handleNewGroupAdded;
		const the_group_options = this.props.group_options;
		delete props.group_options;

		const group_options = the_group_options.map(function(option){
			let text = option.name.replace(/ /g, String.fromCharCode(160))
			return <option key={option.value} value={option.value}>{text}</option>
		});

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

		this.state = {group: {}, edit: false, permissions: [], group_options: []};

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

	handleSubmit(e) {

		console.log("submit...");
		var group = form2json('#newGroupForm');
		console.log("group", group);

		if (!group.name || !group.realm) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		if (group.group_id == '') {
			group.group_id = null;
		}

		xFetchJSON("/api/groups/" + group.id, {
			method: "PUT",
			body: JSON.stringify(group)
		}).then(() => {
			this.setState({group: group, edit: false});
			this.handleGetGroupOptionsTree();
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch(() => {
			console.error("group", msg);
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
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

		this.handleGetGroupOptionsTree();
	}

	render() {
		const group = this.state.group;

		const group_options = this.state.group_options.map(function(option) {
			return [option.value, option.name.replace(/ /g, String.fromCharCode(160))];
		});


		group_options.unshift(["", ""]);

		let save_btn = "";
		let err_msg = "";

		if (this.state.edit) {
			save_btn = <Button onClick={this.handleSubmit}><i className="fa fa-save" aria-hidden="true"></i>&nbsp;<T.span text="Save"/></Button>
		}

		var permissions = this.state.permissions.map(function(row) {
			return <Checkbox key="row" name="permissions" defaultChecked={row.checkshow} value={row.id}><T.span text="action:"/><T.span text={row.action}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<T.span text="type:"/><T.span text={row.method}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<T.span text="param:"/><T.span text={row.param}/></Checkbox>
		})
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
					<Col sm={10}><EditControl edit={this.state.edit} componentClass="select" name="group_id" options={group_options} defaultValue={group.parent_name}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="description" defaultValue={group.description}/></Col>
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
		this.state = { formShow: false, rows: [], danger: false,
				formShow1: false, group_options: [], max: 0};

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
				var c = confirm(T.translate("Can't Delete Because The Child Group Exist!"));
				if (!c) return;
			});
	}

	handleGetGroupOptionsTree() {
		xFetchJSON("/api/groups/build_group_options_tree").then((data) => {
			this.setState({group_options: data});
		}).catch((e) => {
			console.log("get group_options ERR");
		});
	}

	handleGetGroupsTree() {
		xFetchJSON("/api/groups/build_group_tree").then((data) => {
			let max = this.state.max;
			if(data.length) {
				max = data[0].sort;
				data.map((d) => {
					if(d.level == 0) {
						max = max < d.sort ? d.sort : max;
					}
				})
			} else {
				max = 0;
			}

			this.setState({rows: data, max: max});
		}).catch((e) => {
			console.log("get group_tree ERR");
		});
	}

	componentDidMount() {
		this.handleGetGroupsTree();
		this.handleGetGroupOptionsTree();
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
					<td>{row.sort}</td>
					<td>{row.spaces.replace(/ /g, String.fromCharCode(160))}<Link to={`/settings/groups/${row.id}`}>{row.name}</Link></td>
					<td>{row.realm}</td>
					<td>{row.description}</td>
					<td><T.a onClick={() => _this.handleDelete(row.id, row)} text="Delete" className={danger} style={{cursor: 'pointer'}}/></td>
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
					<th><T.span text="Sort"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Realm"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Delete" className={danger} onClick={toggleDanger} style={{cursor: 'pointer'}} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewGroup show={this.state.formShow} max={this.state.max} onHide={formClose} handleNewGroupAdded={this.handleGroupAdded.bind(this)} group_options={this.state.group_options}/>
		</div>
	}
}

export {GroupsPage, GroupPage};
