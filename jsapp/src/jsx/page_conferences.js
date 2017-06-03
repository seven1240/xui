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
import { ButtonToolbar, ButtonGroup, Button, ProgressBar, Thumbnail } from 'react-bootstrap';
import verto from './verto/verto';
import { VertoLiveArray } from './verto/verto-livearray';
import VertoConfMan from './verto/verto-confman';
import { xFetchJSON } from './libs/xtools';

// translate conference member
function translateMember(member) {
	let status;
	let email;
	if (member[1][4].indexOf("audio") < 0) { // old 1.4
		status = {};
		status.audio = {};
		status.audio.talking = false;
		status.audio.deaf = false,
		status.audio.muted = false,
		status.audio.onHold = false;
		status.audio.energyScore = 0;
		email = member[1][5];
	} else {
		status = JSON.parse(member[1][4]);
		email = member[1][5].email;
	}

	const m = {
		'uuid': member[0],
		'memberID': member[1][0],
		'cidNumber': member[1][1],
		'cidName': member[1][2],
		'codec': member[1][3],
		'status': status,
		'email': email,
		'active': false
	};

	// console.log("m", m);
	return m;
}

class Member extends React.Component {
	propTypes: {
		onMemberClick: React.PropTypes.func,
	}

	constructor(props) {
		super(props);
		this.state = {active: false};
		this.handleClick = this.handleClick.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
	}

	// allow the parent to set my state
	componentWillReceiveProps(props) {
		// console.log("props", props);
		this.setState(props.member);
	}

	handleClick(e, member_id) {
		const active = !this.state.active;
		this.setState({active: active});
		this.props.onMemberClick(member_id, active);
	}

	handleControlClick(e, data) {
		console.log("data", data);
		e.stopPropagation();
		const member = this.props.member;

		if (data == "call") {
			xFetchJSON("/api/conferences/" + member.conference_name, {
				method: "POST",
				body: JSON.stringify({
					from: member.cidNumber,
					to: member.cidNumber
				})
			}).catch((msg) => {
				console.error("err call", msg);
			});

			return;
		} else if (data == "floor") {
			console.log(member.conference_name + " vid-floor " + member.memberID + " force")
			verto.fsAPI("conference", member.conference_name + " vid-floor " + member.memberID + " force");
			return;
		}

		verto.fsAPI("conference", member.conference_name + " " + data + " " + member.memberID);
	}

	render() {
		const _this = this;
		const member = this.props.member;
		var className = this.state.active ? "member active selected" : "member";
		const which_floor = member.status.video ? member.status.video : member.status.audio;

		const floor_color   = which_floor.floor ? "red"   : "#777" ;
		const video_color  = member.status.video && member.status.video.visible ? "green" : "#ccc";
		const muted_color   = member.status.audio.muted   ? "#ccc"   : "green";
		const talking_color = member.status.audio.talking ? "green"  : "#777" ;
		const deaf_color    = member.status.audio.deaf    ? "#ccc"   : "green";
		const hold_color    = member.status.audio.onHold  ? "blue"   : "#ccc" ;

		const video_class   = member.status.video && member.status.video.visible ? "conf-control fa fa-video-camera" : "conf-control fa fa-video-camera";
		const muted_class   = member.status.audio.muted   ? "conf-control fa fa-microphone-slash" : "conf-control fa fa-microphone";
		const deaf_class    = member.status.audio.deaf    ? "conf-control fa fa-bell-slash-o" : "conf-control fa fa-bell-o";
		const hold_class    = member.status.audio.onHold  ? "fa fa-pause" : "fa fa-circle-thin";

		if (this.props.displayStyle == 'table') {

			return <tr className={className} onClick={(e) => _this.handleClick(e, member.memberID)} key={member.uuid}>
					<td>{member.memberID}</td>
					<td>"{member.cidName}" &lt;{member.cidNumber}&gt;</td>
					<td><div className='inlineleft'>
						<a className="conf-control fa fa-star" style={{color: floor_color}} aria-hidden="true" onClick={(e) => {
							if (!which_floor.floor) {
								_this.handleControlClick(e, "floor");
							} else {
								e.stopPropagation();
								return false;
							}
						}}></a> |&nbsp;
						<i className="fa fa-volume-up" style={{color: talking_color}} aria-hidden="true"></i> |&nbsp;
						<a className={deaf_class} style={{color: deaf_color}} aria-hidden="true" onClick={(e) => _this.handleControlClick(e, member.status.audio.deaf ? "undeaf" : "deaf")}></a> |&nbsp;
						<a className={muted_class} style={{color: muted_color}} aria-hidden="true" onClick={(e) => _this.handleControlClick(e, member.status.audio.muted ? "unmute" : "mute")}></a> |&nbsp;
						<a className={video_class} style={{color: video_color}} aria-hidden="true" onClick={(e) => _this.handleControlClick(e, member.status.video && member.status.video.visible ? "vmute" : "unvmute")}></a> |&nbsp;
						<i className={hold_class} style={{color: hold_color}} aria-hidden="true"></i> |&nbsp;
						{
							member.memberID > 0 ?
								<a className="conf-control fa fa-close" style={{color: "green"}} aria-hidden="true" onClick={(e) => _this.handleControlClick(e, "hup")}></a> :
								<a className="conf-control fa fa-phone" style={{color: "green"}} aria-hidden="true" onClick={(e) => _this.handleControlClick(e, "call")}></a>
						}
						&nbsp;|&nbsp;
						</div>
						<div className="inline"><ProgressBar active bsStyle="success" now={member.status.audio.energyScore/50} /></div>
					</td>
					<td>{member.email}</td>
			</tr>;
		} else if (this.props.displayStyle == 'list') {
			const imgClass = which_floor.floor ? "conf-avatar conf-avatar-1" : ((parseInt(member.memberID) < 0) ? "conf-avatar conf-avatar-3" : "conf-avatar conf-avatar-2");

			return  <div  className={className} onClick={(e) => _this.handleClick(e, member.memberID)} style={{width: "185px", height: "90px", marginTop:"30px", marginRight:"20px", border:"1px solid #c0c0c0", display:"inline-block"}}>
				<div style={{float:"left"}}>
					<div className={imgClass}></div>
					<div style={{textAlign: "center"}}>{member.memberID}</div>
				</div>
				<div style={{float: "left", marginLeft: "5px", marginTop: "5px"}}>
					<div className="conf-member-cidname">{member.cidName}</div>
					<div className="conf-member-cidnumber">{member.cidNumber}</div>
					<div style={{marginTop: "23px"}}>
						<a className="conf-control fa fa-star" style={{color: floor_color}} aria-hidden="true" onClick={(e) => _this.handleControlClick(e, "floor")}></a>&nbsp;
						<i className="fa fa-volume-up" style={{color: talking_color}} aria-hidden="true"></i>&nbsp;
						<a className={deaf_class} style={{color: deaf_color}} aria-hidden="true" onClick={(e) => _this.handleControlClick(e, member.status.audio.deaf ? "undeaf" : "deaf")}></a>&nbsp;
						<a className={muted_class} style={{color: muted_color}} aria-hidden="true" onClick={(e) => _this.handleControlClick(e, member.status.audio.muted ? "unmute" : "mute")}></a>&nbsp;
						<a className={video_class} style={{color: video_color}} aria-hidden="true" onClick={(e) => _this.handleControlClick(e, member.status.video && member.status.video.visible ? "vmute" : "unvmute")}></a>&nbsp;
						<i className={hold_class} style={{color: hold_color, display: "none"}} aria-hidden="true"></i>&nbsp;
						<a className="conf-control fa fa-phone" style={{color: "green"}} aria-hidden="true" onClick={(e) => _this.handleControlClick(e, "call")}></a>
					</div>
				</div>
			</div>
		}
	}
};

class ConferencePage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: this.props.name, rows: [], static_rows: [], la: null,
			last_outcall_member_id: 0, outcall_rows: [],
			outcallNumber: '', outcallNumberShow: false,
			displayStyle: 'table', toolbarText: false
		};

		this.la = null;
		this.activeMembers = {};

		this.getChannelName = this.getChannelName.bind(this);
		this.handleOutcallNumberChange = this.handleOutcallNumberChange.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleVertoLogin = this.handleVertoLogin.bind(this);
		this.handleConferenceEvent = this.handleConferenceEvent.bind(this);
		this.handleMemberClick = this.handleMemberClick.bind(this);
	}

	getChannelName(what) { // liveArray chat mod
		return "conference-" + what + "." + this.props.name + "@" + domain;
	}

	handleOutcallNumberChange(e) {
		this.setState({outcallNumber: e.target.value});
	}

	handleControlClick(data) {
		console.log("data", data);

		if (data == "lock") {
			verto.fsAPI("conference", this.props.name + " lock");
		} else if (data == "unlock") {
			verto.fsAPI("conference", this.props.name + " unlock");
		} else if (data == "select") {
			var _this = this;
			if (this.state.rows.length > 0) {
				var active = !this.state.rows[0].active;

				const rows = this.state.rows.map(function(row) {
					row.active = active;
					_this.activeMembers[row.memberID] = active;
					return row
				});

				this.setState({rows: rows});
			}
			return;
		} else if (data == "call") {
			if (!this.state.outcallNumberShow) {
				this.setState({outcallNumberShow: true});
				this.outcallNumberInput.focus();
				return;
			}

			if (this.state.outcallNumber == '') {
				// this.outcallNumberInput.focus();
				this.setState({outcallNumberShow: false});
				return;
			}

			this.state.last_outcall_member_id--;

			let member = {
				uuid: this.state.last_outcall_member_id,
				memberID: this.state.last_outcall_member_id,
				cidNumber: this.state.outcallNumber,
				cidName: this.state.outcallNumber,
				codec: null,
				status: {audio: {energyScore: 'Calling ...'}, video: {}},
				email: null,
				active: false
			};

			let rows = this.state.outcall_rows;
			rows.unshift(member);
			this.setState({outcall_rows: rows});

			xFetchJSON("/api/conferences/" + this.state.name, {
				method: "POST",
				body: JSON.stringify({
					from: member.cidNumber,
					to: member.cidNumber
				})
			}).catch((msg) => {
				console.error("err call", msg);
			});
			return;
		} else if (data == "toolbarText") {
			this.setState({toolbarText: !this.state.toolbarText});
			return;
		} else if (data == "table" || data == "list") {
			this.setState({displayStyle: data});
			localStorage.setItem("xui.conference.displayStyle", data);
			return;
		}

		for(var memberID in this.activeMembers) {
			if (this.activeMembers[memberID] == true) {
				var args = this.props.name + " " + data + " " + memberID;
				// console.log("args", args);
				verto.fsAPI("conference", args);
				// this.cman.modCommand(data, memberID);
			}
		}
	}

	handleMemberClick(member_id, isActive) {
		console.log('isActive', isActive)
		this.activeMembers[member_id] = isActive;
	}

	componentWillMount () {
	}

	componentWillUnmount () {
		if (this.la) this.la.destroy();
		if (this.cman) this.cman.destroy();
		if (this.binding) verto.unsubscribe(this.binding);
	}

	componentDidMount () {
		const _this = this;
		console.log("conference name:", this.props.name);
		window.addEventListener("verto-login", this.handleVertoLogin);

		const displayStyle = localStorage.getItem("xui.conference.displayStyle") || "table";
		this.setState({displayStyle: displayStyle});

		xFetchJSON("/api/conference_rooms/" + this.props.room_id + "/members").then((members) => {
			_this.state.static_rows = members.map(function(m) {
				const audio = {
					talking: false,
					deaf: false,
					muted: false,
					onHold: false,
					energyScore: 0
				}

				return {
					'uuid': m.id - 10000,
					'memberID': m.id - 10000,
					'cidNumber': m.num,
					'cidName': m.name,
					'codec': null,
					'status': {audio: audio},
					'email': null,
					'active': false
				};
			});

			const use_livearray = false;

			if (use_livearray) {
				_this.la = new VertoLiveArray(verto, _this.getChannelName("liveArray"), _this.props.name, {
					onChange: _this.handleConferenceEvent
				});

				const laData = {
					canvasCount: 1,
					chatChannel: _this.getChannelName("chat"),
					chatID: "conf+" + _this.props.name + '@' + domain,
					conferenceMemberID: 0,
					infoChannel: _this.getChannelName("info"),
					modChannel: _this.getChannelName("mod"),
					laChannel: _this.getChannelName("liveArray"),
					laName: _this.props.name + '@' + domain,
					role: "moderator" // participant
				}

				const chatCallback = function(v, e) {
					console.log('got chat message', e);
				}

				if (_this.cman) {
					_this.cman.destroy();
					_this.cman = null;
				}

				_this.cman = new VertoConfMan(verto, {
					dialog: null, // dialog,
					hasVid: true, // check_vid(),
					laData: laData,
					chatCallback: chatCallback
				});
			} else {
				const laChannelName = _this.getChannelName("liveArray");
				_this.binding = verto.subscribe(laChannelName, {handler: _this.handleFSEvent.bind(_this),
					userData: verto,
					subParams: {}
				});

				verto.broadcast(laChannelName, {
					liveArray: {
						command: "bootstrap",
						context: laChannelName,
						name: _this.props.name,
						obj: {}
					}
				});
			}
		});
	}

	handleVertoLogin (e) {
		// console.log("eeee", e.detail);
		// if (this.la) this.la.destroy;
		// this.la = new VertoLiveArray(verto, this.getChannelName("liveArray"), this.props.name, {});
		// this.la.onChange = this.handleConferenceEvent;
	}

	handleFSEvent(verto, e) {
		this.handleConferenceEvent(null, e.data);
	}

	handleConferenceEvent (la, a) {
		console.log("onChange FSevent:", a.action, a);
		const _this = this;

		if (a.hashKey) a.key = a.hashKey;

		switch (a.action) {

		case "init":
			break;

		case "bootObj":
			var rows = [];

			this.state.static_rows.forEach((row) => {
				rows.push(row);
			});

			a.data.forEach(function(member) {
				rows.push(translateMember(member));
			})

			this.setState({rows: rows});
			break;
		case "add":
			var found = 0;
			var member = translateMember([a.key, a.data]);

			if (member.cidName == "Outbound Call") {
				var outcall_rows = this.state.outcall_rows.filter(function(row) {
					if (row.cidNumber == member.cidNumber) {
						found++;
						return false;
					} else {
						return true;
					}
				});

				if (found) this.setState({outcall_rows: outcall_rows});

				if (!found) {
					const rows = this.state.rows.map(function(row) {
						if (row.memberID < 0 && row.cidNumber == member.cidNumber) {
							row.hidden = true;
							found++;
							return row;
						} else {
							return row;
						}
					});

					if (found) this.setState({rows: rows});
				}

			}

			var rows = this.state.rows;
			rows.push(member);
			this.setState({rows: rows});

			break;
		case "modify":
			var rows = [];

			this.state.rows = this.state.rows.map(function(row) {
				if (row.uuid == a.key ) {
					var member = translateMember([a.key, a.data]);
					member.active = _this.activeMembers[member.memberID];
					return member;
				} else {
					return row;
				}
			});

			this.setState(this.state);
			break;

		case "del":
			var rows = this.state.rows.filter(function(row) {
				if (row.uuid == a.key) {
					delete _this.activeMembers[row.memberID];
				}

				if (row.memberID < 0 && row.cidNumber == a.data[1]) {
					row.hidden = false;
				}

				return row.uuid != a.key;
			});

			this.setState({rows: rows});
			break;

		case "clear":
			var rows = [];

			this.state.static_rows.forEach((row) => {
				rows.push(row);
			});

			this.setState({rows: rows});
			break;

		case "reorder":
			break;

		default:
			console.log("unknow action: ", a.action);
			break;
		}
	}

	render () {
		var _this = this;

		const rows = this.state.outcall_rows.concat(this.state.rows);

		const members = rows.map(function(member) {
			if (member.hidden) return null;
			member.conference_name = _this.props.name;
			return <Member member={member} key={member.uuid} onMemberClick={_this.handleMemberClick} displayStyle={_this.state.displayStyle}/>
		});

		let member_list;

		if (this.state.displayStyle == 'table') {
			member_list = <table className="table conference">
				<tbody>
				<tr>
					<th><T.span text="Member ID"/></th>
					<th><T.span text="CID"/></th>
					<th><T.span text="Status"/></th>
					<th><T.span text="Email"/></th>
				</tr>
				{members}
				</tbody>
			</table>
		} else if (this.state.displayStyle == 'list') {
			member_list = <ul>{members}</ul>
		}

		const toolbarTextStyle = this.state.toolbarText ? null : {display: 'none'};

		return <div>
			<ButtonToolbar className="pull-right">

			<ButtonGroup style={ this.state.outcallNumberShow ? null : {display: 'none'} }>
				<input value={this.state.outcallNumber} onChange={this.handleOutcallNumberChange} size={10}
					ref={(input) => { this.outcallNumberInput = input; }} placeholder="number"/>
			</ButtonGroup>


			<ButtonGroup>
				<Button onClick={() => _this.handleControlClick("call")}>
					<i className="fa fa-phone" aria-hidden="true"></i>&nbsp;
					<T.span text= "Call" style={toolbarTextStyle}/>
				</Button>
			</ButtonGroup>

			<ButtonGroup>
				<Button onClick={() => _this.handleControlClick("select")}>
					<i className="fa fa-check-square-o" aria-hidden="true"></i>&nbsp;
					<T.span text= "Select" style={toolbarTextStyle}/>
				</Button>
			</ButtonGroup>

			<ButtonGroup>
				<Button onClick={() => _this.handleControlClick("mute")}>
					<i className="fa fa-microphone-slash" aria-hidden="true"></i>&nbsp;
					<T.span text= "Mute" style={toolbarTextStyle}/>
				</Button>
				<Button onClick={() => _this.handleControlClick("unmute")}>
					<i className="fa fa-microphone" aria-hidden="true"></i>&nbsp;
					<T.span text= "unMute" style={toolbarTextStyle}/>
				</Button>
				<Button onClick={() => _this.handleControlClick("hup")}>
					<i className="fa fa-power-off" aria-hidden="true"></i>&nbsp;
					<T.span text= "Hangup" style={toolbarTextStyle}/>
				</Button>
			</ButtonGroup>

			<ButtonGroup>
				<Button onClick={() => _this.handleControlClick("lock")}>
					<i className="fa fa-lock" aria-hidden="true"></i>&nbsp;
					<T.span text= "Lock" style={toolbarTextStyle}/>
				</Button>
				<Button onClick={() => _this.handleControlClick("unLock")}>
					<i className="fa fa-unlock-alt" aria-hidden="true"></i>&nbsp;
					<T.span text= "unLock" style={toolbarTextStyle}/>
				</Button>
			</ButtonGroup>

			<ButtonGroup>
				<Button onClick={() => _this.handleControlClick("table")} title={T.translate("Display as Table")}>
					<i className="fa fa-table" aria-hidden="true"></i>
				</Button>
				<Button onClick={() => _this.handleControlClick("list")} title={T.translate("Display as List")}>
					<i className="fa fa-list" aria-hidden="true" data="list"></i>
				</Button>
				<Button onClick={() => _this.handleControlClick("toolbarText")} title={T.translate("Toggle Toolbar Text")}>
					<i className="fa fa-text-width" aria-hidden="true"></i>
				</Button>
			</ButtonGroup>


			</ButtonToolbar>

			<h1><T.span text={{ key: "Conference"}} /></h1>

			<ButtonToolbar>
				<T.span text="Conference Name"/>: {this.props.name} |&nbsp;
				<T.span text="Total"/>: {this.state.rows.length}
			</ButtonToolbar>

			<div>
				{member_list}
			</div>
		</div>
	}
};

export default ConferencePage;

/*
{
	"audio":{"muted":false,"deaf":false,"onHold":false,"talking":true,"floor":true,"energyScore":8},
	"video":{"visible":false,"videoOnly":false,"avatarPresented":false,"mediaFlow":"sendRecv","muted":false,"floor":true,"reservationID":null,"roleID":null,"videoLayerID":-1},
	"oldStatus":"TALKING (FLOOR) VIDEO (FLOOR)"
}
*/
