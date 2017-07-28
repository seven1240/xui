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
 * Liyang <liyang@x-y-t.cn>
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Modal, ButtonGroup, ButtonToolbar, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col } from 'react-bootstrap';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek';
import {EditControl, xFetchJSON } from '../libs/xtools';

class SimpleClock extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			dateTime: new Date(),
			ticking: true,
			interval: 1000,
			edit: false,
			timer: null
		};

		this.updateDateTime = this.updateDateTime.bind(this);
		this.dateTimeFormat = this.dateTimeFormat.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
	}

	handleBlur(e) {
		var reg = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/;
		var regExp = new RegExp(reg);

		if (this.input && this.input.value && regExp.test(this.input.value)) {
			this.props.handleManualSync(this.input.value);
		}

		this.setState({edit: false});
	}

	handleClick(e) {
		this.setState({edit: !this.state.edit});
	}

	componentWillReceiveProps(nextProps) {
		var nprops = Object.assign({}, nextProps);

		if (nprops.date && nprops.date != this.props.date) {
			this.props = nprops;
			this.setState({dateTime: new Date(Date.parse(nprops.date))});
		}
	}

	dateTimeFormat(d) {
		var handlerTime = function(t) {
			if ( t < 10) {
				return "0" + t;
			}

			return t;
		};

		var dateStr = handlerTime(d.getFullYear()) + "-" + handlerTime(d.getMonth() + 1) + "-" +
			handlerTime(d.getDate()) + " " + handlerTime(d.getHours()) + ":" +
			handlerTime(d.getMinutes()) + ":" + handlerTime(d.getSeconds());

		return dateStr;
	}

	updateDateTime(interval) {
		var ndate = new Date(Date.parse(this.state.dateTime) + interval);
		this.setState({dateTime: ndate});
	}

	componentDidMount() {
		var _this = this;
		var ndate = new Date();
		const props = Object.assign({}, this.props);
		var timer = null;
		var systemDateTime = null;
		var ndate = this.state.dateTime;
		var interval = this.state.interval;
		var timer = null;

		if (props.interval) interval = props.interval;

		var timer = setInterval(function() {_this.updateDateTime(interval)}, interval);

		if (props.date) systemDateTime = props.date;

		if (systemDateTime) ndate = new Date(Date.parse(systemDateTime));

		this.setState({
			dateTime: ndate,
			timer: timer,
			interval: interval
		});
	}

	componentWillUnmount() {
		clearInterval(this.state.timer);
		this.setState({timer: null});
	}

	render() {
		var _this = this;
		var time = this.dateTimeFormat(this.state.dateTime);

		if (this.state.edit) {
			return <input type="text" placeholder={time} onBlur={this.handleBlur} ref={ref => { this.input = ref; }} autoFocus/>
		} else {
			return <T.span onClick={this.handleClick} text={time}/>
		}

	}
}

class SettingDateTime extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			editable: false,
			ntpServer: "s2c.time.edu.cn",
			msg: "",
			syncSuccess: true,
			syncBtnDisable: false,
			systemDateTime: "2010-01-01 01:01:01"
		};

		this.handleNTPSync = this.handleNTPSync.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleGetSystemDateTime = this.handleGetSystemDateTime.bind(this);
		this.handleManualSync = this.handleManualSync.bind(this);
	}

	handleGetSystemDateTime() {
		var _this = this;

		xFetchJSON("/api/datetime", {
			method: "GET",
		}).then((obj) => {
			console.log("system datetime", obj);
			_this.setState({systemDateTime: obj.datetime.replace(/[\r\n]/g,"")});
		}).catch((msg) => {
			console.log("get system datetime fail", msg);
		});
	}

	handleManualSync(d) {
		var _this = this;

		xFetchJSON("/api/datetime/manual_sync", {
			method: "PUT",
			body: JSON.stringify({datetime: d})
		}).then((obj) => {
			console.log("Manual sync success", obj);
			_this.setState({systemDateTime: obj.datetime});
		}).catch((msg) => {
			console.log("ntp sync fail", msg);
		});
	}

	handleNTPSync() {
		var _this = this;

		var delay_update = function(msg, suc) {
			setTimeout(function() {
				_this.setState({
					syncBtnDisable: false,
					syncSuccess: true,
					msg: ""
				});
			}, 3000);

			setTimeout(function() {
				_this.setState({
					syncSuccess: suc,
					msg: msg,
				});

			}, 200);
		}

		this.setState({
			syncBtnDisable: true,
			msg: T.translate("Syncing") + " ..."
		});

		xFetchJSON("/api/datetime/ntp_sync", {
			method: "PUT",
			body: JSON.stringify({ntp_server: _this.state.ntpServer})
		}).then((obj) => {
			console.log("ntp sync success", obj);
			delay_update("Sync success", true);
			_this.setState({systemDateTime: obj.datetime});
		}).catch((msg) => {
			console.log("ntp sync fail", msg);
			delay_update(T.translate("Sync fail") + ": " + msg, false);
		});

	}

	handleChange(obj) {
		const id = Object.keys(obj)[0];
		const val = obj[id];

		localStorage.setItem("xui.ntpServer", val);
		this.setState({ntpServer: val});
	}

	componentDidMount() {
		const ntpServer = localStorage.getItem("xui.ntpServer");

		if (ntpServer) this.setState({ntpServer: ntpServer});
		this.handleGetSystemDateTime();
	}

	render() {
		const _this = this;
		//let hand = {cursor : "pointer"};
		let val = this.state.ntpServer;
		var msgClassName = this.state.syncSuccess ? "text-success" : "danger";
		var msg = <h5><T.span text={this.state.msg} className={msgClassName}/></h5>;

		return <div>
			<h2><T.span text="NTP Sync Setting"/></h2>
			<br/>
			<Row>
				<Col sm={2}><T.span text="NTP Server"/></Col>
				<Col sm={4}>
					<RIEInput value={val} change={_this.handleChange.bind(_this)}
						propName="ntpServer"
						className={_this.state.highlight ? "editable long-input" : "long-input"}
						validate={_this.isStringAcceptable}
						classLoading="loading"
						classInvalid="invalid"/>
				</Col>
				<Col sm={2}>
					<Button bsStyle="primary" bsSize="small" disabled={_this.state.syncBtnDisable} onClick={_this.handleNTPSync.bind(_this)}>
						<i className="fa fa-exchange" aria-hidden="true"></i>&nbsp;
						<T.span text="Sync"/>
					</Button>
				</Col>
				<Col sm={4}>
					{msg}
				</Col>
			</Row>
			<Row>
				<Col sm={2}><T.span text="System DateTime"/></Col>
				<Col sm={4}>
					<SimpleClock
						date={_this.state.systemDateTime}
						handleManualSync={_this.handleManualSync}
					/>
				</Col>
				<Col sm={6}>
				</Col>
			</Row>
		</div>
	}
}

export default SettingDateTime;
