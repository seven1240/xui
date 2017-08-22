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
 * XueYun Jiang <jiangxueyun@x-y-t.cn>
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { ProgressBar, Grid } from 'react-bootstrap';
import { xFetchJSON } from '../jsx/libs/xtools';

class ServerPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { info: null };
		this.websocket = null;
		this.timer = 0;
	}

	onOpen(evt) {
		var _this = this;

		console.error("connected\n");
		_this.timer = setInterval(function() {
				_this.doSend('1')
			}, 1000);
	}

	onClose(evt) {
		console.log("disconnected\n");
	}

	doDisconnect() {
		this.websocket.close();
	}

	onMessage(evt) {
		// console.log(evt, JSON.parse(evt.data));
		this.setState({info: JSON.parse(evt.data)});
	}

	onError(evt) {
		console.log("error: ", evt.data);
		this.websocket.close();
	}

	doSend(message) {
		console.log("sent: ", message, this.websocket);
		this.websocket.send(message);
	}

	test() {
		console.log("test");
		this.doSend("111");
	}

	componentDidMount() {
		var _this = this;

		_this.websocket = new WebSocket("ws://" + _this.props.domain + ":8000/");
		_this.websocket.onopen = function(evt) { _this.onOpen(evt) };
		_this.websocket.onclose = function(evt) { _this.onClose(evt) };
		_this.websocket.onmessage = function(evt) { _this.onMessage(evt) };
		_this.websocket.onerror = function(evt) { _this.onError(evt) };
	}

	componentWillUnmount() {
		var _this = this;

		if (_this.timer) {
			clearInterval(_this.timer);
		}
		_this.doDisconnect();
	}

	render() {
		// console.error("render", info);
		return <div>
			<div>{this.props.domain}</div>
			{
				this.state.info ?
					<div>
						<font>CPU: {this.state.info.cpu}% </font>
						<ProgressBar bsStyle="success" now={this.state.info.cpu} label={this.state.info.cpu + '%'}  />
						<font>memory: {this.state.info.memory.percent}% {this.state.info.memory.used}M/{this.state.info.memory.total}M</font>
						<ProgressBar active sytle={{float: "left", width: "50%"}} bsStyle="success" now={this.state.info.memory.percent} label={this.state.info.memory.percent + '%'} />
					</div>
				: ''
			}
		</div>
	}
}

class ServerMonitorPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {servers: null};
	}

	componentDidMount() {
		let _this = this;

		xFetchJSON('/api/server_monitor/').then((data) => {
			if (data.code == 200) {
				_this.setState({servers: data.data});
			}
		});
	}

	render() {
		return <div>
			{
				(this.state.servers || []).map((s) => {
					return <ServerPage domain={s.domain} sytle={{float: "left", width: "50%"}}/>
				})
			}
		</div>
	}
}

export default ServerMonitorPage;
