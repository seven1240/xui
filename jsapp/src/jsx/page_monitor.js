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
 * Mariah Yang <yangxiaojin@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Mariah Yang <yangxiaojin@x-y-t.cn>
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import verto from './verto/verto';
import { Link } from 'react-router';
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox } from 'react-bootstrap';
import { Grid, Tab, Row, Col, Nav, NavItem, NavDropdown} from 'react-bootstrap';
import { EditControl, xFetchJSON } from './libs/xtools';
import parseXML from './libs/xml_parser';


class TabContent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: ''};
		this.handleToggleSelect = this.handleToggleSelect.bind(this);
		this.handleCall = this.handleCall.bind(this);
	}

	handleCall() {
		let user = this.props.user;
		let currentLoginUser = this.props.currentLoginUser;
		if (user.channelCallState == "idle" && user.registerState == "registered" && currentLoginUser.channelCallState == "idle") {
			fire_event("xui-phone-change-dest-number", user.userExten)

			let curCall = verto.newCall({
				destination_number: user.userExten,
				caller_id_name: currentLoginUser.userName,
				caller_id_number: currentLoginUser.userExten,
				useVideo: false,
				useStereo: false
			});

			this.props.handleCall(curCall);
		}
	}

	handleToggleSelect() {
		let user = this.props.user;
		this.props.handleToggleSelect(user);
	}

	render() {
		const props = Object.assign({}, this.props);
		const user = props.user;
		delete props.user;
		delete props.handleToggleSelect;
		delete props.handleCall;
		let activeStyle = "user-selected";
		let registerState = "unregistered";
		let channelCallState = user.channelCallState ? user.channelCallState : "idle";
		let userCallStateStyle = "";
		let userTextStyle = "";
		let userImageUrl = user.registerState == "registered" ? "/assets/img/phone-green.png" : "/assets/img/phone-grey.png";

		let userSelectedClass = user.selectedState == "selected" ? "user-selected" : "";
		let userCallClass = channelCallState!= "idle" ? "use-sate-" + channelCallState : "";
		let textClass = channelCallState!= "idle" ? "user-text" : "text-default";
		let divClass = userSelectedClass + userCallClass + " user-item btn btn-default";

		return (
			<div className={divClass}>
				<div className="pull-left user-state-area">
					<div><img src={userImageUrl} onClick={this.handleCall}/></div>
					<div>
						<div className={textClass}>{"Offline"}</div>
						<div className={textClass}>{"Idle"}</div>
					</div>
				</div>

				<div className="pull-right user-info-area" onClick={this.handleToggleSelect}><br/>
					<div className={textClass}>{user.userName}</div>
					<div className={textClass}>{user.extn}</div>
				</div>
			</div>
		)
	}
}

class MonitorPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg:'', group_users:{}, users:[], currentLoginUser:{}, activeKey: "0", navItems:[], tabContentObj:{}, tabPanesMounted: {}, curCall: null};
		this.handleCall = this.handleCall.bind(this);
		this.handleCallButton = this.handleCallButton.bind(this);
		this.handleAnswer = this.handleAnswer.bind(this);
		this.handleHangup = this.handleHangup.bind(this);
		this.handleTabSelect = this.handleTabSelect.bind(this);
		this.handleToggleSelect = this.handleToggleSelect.bind(this);
		this.handleSelectAll = this.handleSelectAll.bind(this);
		this.handleDeselectAll = this.handleDeselectAll.bind(this);
		this.handleToggleSelectAll = this.handleToggleSelectAll.bind(this);
	}

	handleCall(curCall) {
		if (curCall) this.setState({curCall: curCall});
	}

	handleCallButton() {
		let users = this.state.users;
		let activeKey = this.state.activeKey;
		let currentLoginUser = this.state.currentLoginUser;
		for (let i = 0; i < 1; i++) { // only call the first selected user
			if (users[i].groupID == activeKey && users[i].selectedState == "selected" &&
				users[i].registerState == "registered" && users[i].channelCallState == "idle"
				&& currentLoginUser.channelCallState == "idle") {

				fire_event("xui-phone-change-dest-number", users[i].userExten)
				let curCall = verto.newCall({
					destination_number: users[i].userExten,
					caller_id_name: currentLoginUser.userName,
					caller_id_number: currentLoginUser.userExten,
					useVideo: false,
					useStereo: false
				});

				if (curCall) {
					this.setState({curCall: curCall});
				}
				break;
			}
		}
	}

	handleAnswer() {
		const ds = getXUIDeviceSettings();

		this.state.curCall.answer({
			useMic: ds.audioInDevice,
			useSpeak: ds.audioOutDevice
		});
	}

	handleHangup() {
		this.state.curCall.hangup();
	}

	handleTabSelect(selectedKey) {
		var _this = this;
		let users = this.state.group_users[selectedKey].users;
		let tabContentObj = this.state.tabContentObj;
		let tabPanesMounted = this.state.tabPanesMounted;

		if (!tabPanesMounted[selectedKey]) {
			let tabPanes = users.map(function(u) {
				return <TabContent user={u} currentLoginUser={_this.state.currentLoginUser} handleCall={_this.handleCall} handleToggleSelect={_this.handleToggleSelect}/>
			})

			tabContentObj[selectedKey] = <Tab.Pane eventKey={selectedKey}>{tabPanes}</Tab.Pane>;
			tabPanesMounted[selectedKey] = true;

			this.setState({tabContentObj: tabContentObj});
			this.setState({tabPanesMounted: tabPanesMounted});
		}

		this.setState({activeKey: selectedKey});
	}

	handleSelectAll() {
		let activeKey = this.state.activeKey;
		let users = this.state.users;

		users.map(function(user) {
			if (activeKey == user.groupID) {
				user.selectedState = "selected";
			}
			return user;
		})

		this.setState({users: users});
	}

	handleDeselectAll() {
		let activeKey = this.state.activeKey;
		let users = this.state.users;

		users.map(function(user) {
			if (activeKey == user.groupID) {
				user.selectedState = "unselected";
			}
			return user;
		});

		this.setState({users: users});
	}

	handleToggleSelectAll() {
		let users = this.state.users;
		let activeKey = this.state.activeKey;

		users.map(function(user) {
			if (user.selectedState == "selected") {
				user.selectedState = "unselected";
			} else if (user.selectedState == "unselected") {
				user.selectedState = "selected";
			}
			return user;
		})

		this.setState({users: users});
	}

	handleToggleSelect(user) {
		let users = this.state.users;
		let activeKey = this.state.activeKey;
		for (let i = 0; i < users.length; i++) {
			if (users[i].groupID == activeKey && users[i].userID == user.userID) {
				if (users[i].selectedState == "selected") {
					users[i].selectedState = "unselected";
				} else if (users[i].selectedState == "unselected") {
					users[i].selectedState = "selected";
				}
				break;

			}
		}
		this.setState({users: users});
	}

	handleFSEventRegister(v, e) {
		let registerState = "unregistered";
		let users = this.state.users;
		let usersChanged = false;
		if (e.eventChannel == "FSevent.custom::sofia::register") {
			registerState = "registered";
		}

		users.forEach(function(u) {
			if (u.userExten == e.data.username) {
				usersChanged = true;
				u.registerState = registerState;
			}
		})

		dbtrue(usersChanged) ? this.setState(users: users) : "ignore";

	}

	handleFSEventChannel(v, e) {
		let callDirection = e.data["Call-Direction"];
		let callerNumber = e.data["Caller-Caller-ID-Number"];
		let calleeNumber = e.data["Caller-Destination-Number"];
		let channelUUID = e.data["Unique-ID"];
		let channelCallState = e.data["Channel-Call-State"];
		let currentLoginUser = this.state.currentLoginUser;
		let users = this.state.users;
		let currentLoginUserChanged = false;
		let usersChanged = false;

		if (callerNumber == "0000000000") return;

		if (channelCallState == "RINGING") {
			channelCallState = "ringing";
		} else if (channelCallState == "ACTIVE") {
			channelCallState = "active";
		} else if (channelCallState == "HANGUP") {
			channelCallState = "idle";
		}

		if (callDirection == "inbound") {
			if (currentLoginUser.userExtn == callerNumber) {
				currentLoginUser.channelUUID = channelUUID;
				currentLoginUser.channelCallState = channelCallState;
				currentLoginUser.callDirection = callDirection;
				currentLoginUserChanged = true;
			} else {
				users.forEach(function(user) {
					if (user.extn == callerNumber) {
						user.channelUUID == channelUUID;
						user.channelCallState = channelCallState;
						user.callDirection = callDirection;
						usersChanged = true;
					}
				})

			}
		} else if (callDirection == "outbound") {
			if (currentLoginUser.userExtn == calleeNumber) {
				currentLoginUser.channelUUID = channelUUID;
				currentLoginUser.channelCallState = channelCallState;
				currentLoginUser.callDirection = callDirection;
				currentLoginUserChanged = true;
			} else {
				users.forEach(function(user) {
					if (user.extn == calleeNumber) {
						user.channelUUID == channelUUID;
						user.channelCallState = channelCallState;
						user.callDirection = callDirection;
						usersChanged = true;
					}
				})
			}
		}

		if (currentLoginUserChanged) this.setState({currentLoginUser: currentLoginUser});

		if (usersChanged) this.setState({users: users});
	}

	handleVertoDialogState(e) {
		let d = e.detail;
		let users = this.state.users;
		let currentLoginUser = this.state.currentLoginUser;
		console.log(JSON.stringify(d.state.name));
		console.log("state", d.direction);

	}

	syncUserRegisterStatus() {
		let _this = this;

		verto.fsAPI("show", "registrations as xml", function(data) {
			let users = [];
			const parser = new DOMParser();
			const doc = parser.parseFromString(data.message, "text/xml");
			console.log('doc', doc);

			const msg = parseXML(doc);

			console.log('msg', msg);

			let registrations = [];

			if (msg) {
				if (isArray(msg.row)) {
					registrations = msg.row;
				} else if (isObject(msg.row)) {
					registrations.push(msg.row);
				} else if (isArray(msg)) {
					registrations = msg;
				} else if (isObject(msg)) {
					registrations.push(msg);
				}
			}

			registrations.forEach(function(r) {
				users = _this.state.users.map(function(u) {
					if (u.userExten == r.reg_user) {
						u.registerState = "registered";
					}
					return u;
				});
			});

			if (users.length) _this.setState({users: users});

		});
	}

	componentDidMount() {
		let xuiUsername = localStorage.getItem('xui.username');
		let group_users = {};
		let users = [];
		let currentLoginUser = {};
		let navItems = [];
		let tabContentObj = {};
		let tabPanesMounted = {};
		let count = 0;
		let defaultActiveKey;
		let _this = this;

		xFetchJSON("/api/groups/group_users").then((data) => {
			console.log("user_groups", data);

			data.forEach(function(d) {
				let user = {};
				let groupName = d.groupName;
				if (!groupName) groupName = "ungrouped";
				if (!group_users[d.groupID]) {
					user = {groupID:d.groupID, groupName:groupName,  userExten:d.userExten, userID:d.userID, userName:d.userName, userDomain:d.userDomain};
					if (d.userName != xuiUsername && d.userExten != "admin") {
						group_users[d.groupID] = {groupID: d.groupID, groupName:groupName, users:[user]};
					} else if (d.userName == xuiUsername) {
						currentLoginUser = user;
					}
				} else {
					user = {groupID:d.groupID, userExten:d.userExten, userID:d.userID, userName:d.userName, userDomain:d.userDomain};
					if (d.userName != xuiUsername && d.userExten != "admin") {
						group_users[d.groupID].users.push(user);
					} else if (d.userName == xuiUsername) {
						currentLoginUser = user;
					}
				}
				user.registerState = "unregistered";
				currentLoginUser.registerState = "registered";
				user.selectedState = currentLoginUser.selectedState = "unselected";
				user.channelCallState = currentLoginUser.channelCallState = "idle";
				user.channelUUID = currentLoginUser.channelUUID = null;
				user.callDirection = currentLoginUser.callDirection = null;
				users.push(user);
			})

			this.setState({group_users: group_users});
			this.setState({users: users});
			this.setState({currentLoginUser: currentLoginUser});

			if (group_users["ungrouped"]) {
				defaultActiveKey = group_users["ungrouped"].groupID;
			} else {
				for (let id in group_users) {
					defaultActiveKey = id;
					break;
				}
			}

			navItems.push(<NavItem eventKey={group_users[defaultActiveKey].groupID} key={group_users[defaultActiveKey].groupID}>{group_users[defaultActiveKey].groupName}</NavItem>);
			for (let id in group_users) {
				let tabPanes = [];
				if (id == defaultActiveKey) {
					tabPanes = group_users[defaultActiveKey].users.map(function(u) {
						return <TabContent user={u} currentLoginUser={currentLoginUser} handleCall={_this.handleCall} handleToggleSelect={_this.handleToggleSelect}/>
					})
					tabPanesMounted[id] = true;
				} else {
					navItems.push(<NavItem eventKey={group_users[id].groupID} key={group_users[id].groupID}>{group_users[id].groupName}</NavItem>);
					tabPanesMounted[id] = false;
				}

				tabContentObj[id] = <Tab.Pane eventKey={id}>{tabPanes}</Tab.Pane>;
			}

			this.setState({navItems: navItems});
			this.setState({tabContentObj: tabContentObj});
			this.setState({tabPanesMounted: tabPanesMounted});
			this.setState({activeKey: defaultActiveKey});
			this.syncUserRegisterStatus();

		}).catch((e) => {
			console.log("get group_users ERR");
		});

		verto.subscribe("FSevent.custom::sofia::register", {handler: this.handleFSEventRegister.bind(this)});
		verto.subscribe("FSevent.custom::sofia::unregister", {handler: this.handleFSEventRegister.bind(this)});
		verto.subscribe("FSevent.channel_callstate", {handler: this.handleFSEventChannel.bind(this)});
		window.addEventListener("verto-dialog-state", this.handleVertoDialogState.bind(this));
	}

	componentWillUnmount() {
		verto.unsubscribe("FSevent.custom::sofia::register");
		verto.unsubscribe("FSevent.custom::sofia::unregister");
		verto.unsubscribe("FSevent.channel_create");
		verto.unsubscribe("FSevent.channel_progress");
		verto.unsubscribe("FSevent.channel_answer");
		verto.unsubscribe("FSevent.channel_hangup");
	}

	render() {
		let callButtonDisabled = true;
		let hangupButtonDisabled = true;
		let answerButtonDisabled = true;
		let refuseButtonDisabled = true;

		let callButtonStyle = "default";
		let hangupButtonStyle = "default";
		let answerButtonStyle = "default";
		let refuseButtonStyle = "default";

		let currentLoginUser = this.state.currentLoginUser;
		let users = this.state.users;
		let activeKey = this.state.activeKey;

		if (currentLoginUser.channelCallState == "ringing" && currentLoginUser.callDirection == "outbound") {
			answerButtonDisabled = false;
			refuseButtonDisabled = false;
			answerButtonStyle = "danger";
			refuseButtonDisabled = "danger";
		} else if (currentLoginUser.channelCallState == "active" || (currentLoginUser.channelCallState == "ringing"
			&& currentLoginUser.callDirection == "inbound")) {
			hangupButtonDisabled = false;
			answerButtonStyle = "danger";
			hangupButtonStyle = "danger";
		}

		for (let i = 0; i < users.length; i++) {
			if (users[i].groupID == activeKey && users[i].selectedState == "selected") {
				if (users[i].registerState == "registered" && users[i].channelCallState == "idle") {
					callButtonDisabled = false;
					callButtonStyle = "primary";
					break;
				} else if (users[i].channelCallState != "idle") {
					hangupButtonDisabled = false;
					hangupButtonStyle = "danger";
					break;
				}
			}
		}

		let tabContentObj = this.state.tabContentObj;
		let tabContent = [];
		for (let id in tabContentObj) {
			tabContent.push(tabContentObj[id]);
		}

		return <Grid>
			<Row className="show-grid">
				<Col sm={1}>
					<div className="sidebar">
						<ButtonGroup vertical>
							<Button bsStyle={callButtonStyle} disabled={callButtonDisabled} onClick={this.handleCallButton}>{T.translate("Make Call")}</Button><br/>
							<Button bsStyle={hangupButtonStyle} disabled={hangupButtonDisabled} onClick={this.handleHangup}>{T.translate("Hangup Call")}</Button><br/>
							<Button bsStyle={answerButtonStyle} disabled={answerButtonDisabled} onClick={this.handleAnswer}>{T.translate("Answer Call")}</Button><br/>
							<Button bsStyle={refuseButtonStyle} disabled={refuseButtonDisabled} onClick={this.handleHangup}>{T.translate("Refuse Call")}</Button><br/>
							<Button bsStyle="primary" onClick={this.handleSelectAll}>{T.translate("Select All")}</Button><br/>
							<Button bsStyle="primary" onClick={this.handleDeselectAll}>{T.translate("Deselect All")}</Button><br/>
							<Button bsStyle="primary" onClick={this.handleToggleSelectAll}>{T.translate("Toggle Select")}</Button>
						</ButtonGroup>
					</div>
				</Col>
				<Col sm={11}>
					<Tab.Container id="group_tabs" onSelect={this.handleTabSelect} activeKey={this.state.activeKey}>
						<Row className="clearfix">
							<Col sm={12}><Nav bsStyle="tabs">{this.state.navItems}</Nav><br/></Col>
							<Col sm={12}><Tab.Content animation>{tabContent}</Tab.Content></Col>
						</Row>
					</Tab.Container>
				</Col>
			</Row>
		</Grid>
	}
};

export default MonitorPage;
