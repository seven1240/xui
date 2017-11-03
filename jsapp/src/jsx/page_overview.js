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
import verto from './verto/verto';
import {Jumbotron} from 'react-bootstrap';

class OverViewPage extends React.Component {
	// overview is so special because it must wait the websocket connected before it can get any data
	constructor(props) {
		super(props);
		this.state = {msg: "connecting ...", version: '',
			sessionMax:'',  upTime:'', idleCPU:'',
			sessionCount:'', sessionStart:'', sessionPerSecMax:'',
			maxSessions:'', sessionSinceStart:'', sessionPerSec:'',
		};
		this.handleUpdateStatus = this.handleUpdateStatus.bind(this);
		this.handleFSEvent = this.handleFSEvent.bind(this);
	}

	handleClick (x) {
	}

	componentWillMount () {
		// listen to "update-status" event
		window.addEventListener("update-status", this.handleUpdateStatus);
	}

	componentWillUnmount () {
		window.removeEventListener("update-status", this.handleUpdateStatus);
		verto.unsubscribe("FSevent.heartbeat");
	}

	componentDidMount () {
		var _this = this;
		verto.fsStatus(function(e) {
			let mess = <pre>{e.message}</pre>
			_this.setState({msg: mess});
		})

		verto.subscribe("FSevent.heartbeat", {
			handler: this.handleFSEvent
		});

	}

	handleFSEvent (v, e) {
			
		const _this = this;
		let data = e.data;
		for (let key in data) {
			// console.log("key", key);
			// console.log("data[key]", data[key]);
			switch (key){
				case "Session-Peak-Max":
					_this.setState({sessionMax: data[key]});
					break;
				case "Up-Time":
					_this.setState({upTime: data[key]});
					break;
				case "Idle-CPU":
					_this.setState({idleCPU: data[key]});
					break;
				case "Session-Count":
					_this.setState({sessionCount: data[key]});
					break;
				case "Session-Since-Startup":
					_this.setState({sessionSinceStart: data[key]});
					break;
				case "Session-Per-Sec-Max":
					_this.setState({sessionPerSecMax: data[key]});
					break;
				case "Max-Sessions":
					_this.setState({maxSessions: data[key]});
					break;
				case "Session-Per-Sec":
					_this.setState({sessionPerSec: data[key]});
					break;		
				case "FreeSWITCH-Version":
					_this.setState({version: data[key]});
					break;
				case "Session-Peak-FiveMin":
					_this.setState({sessionPerSecMax: data[key]});
					break;		
				default:
					break;
			}
		}

		let mess = <div>
			<Jumbotron style={{backgroundColor: "#fff"}}>
				<b><T.span text="Session Peak Max"/></b>: &nbsp;{this.state.sessionMax} <hr/>
				<b><T.span text="CPU Usage"/></b>: &nbsp; {((100-this.state.idleCPU).toFixed(2))+' %'}<hr/>
				<b><T.span text="Max Sessions"/></b>: &nbsp; {this.state.maxSessions}<hr/>
				<b><T.span text="Session Count"/></b>: &nbsp; {this.state.sessionCount}<hr/>
				<b><T.span text="Session Per Sec Max"/></b>: &nbsp; {this.state.sessionPerSecMax}<hr/>
				<b><T.span text="Session Since Start"/></b>: &nbsp; {this.state.sessionSinceStart}<hr/>
				<b><T.span text="System Uptime"/></b>: &nbsp; {this.state.upTime}<hr/>
				<b><T.span text="FreeSWITCH Version"/></b>: &nbsp; {this.state.version}<hr/>
			</Jumbotron>
		</div>;
		this.setState({msg:mess});
	}

	handleUpdateStatus (e) {
		let mess = <pre>{e.detail.message}</pre>
		this.setState({msg: mess});
	}

	render () {
		return <div><h1><T.span text={{ key: "Status"}} /></h1>{this.state.msg}</div>;
	}
};

export default OverViewPage;
