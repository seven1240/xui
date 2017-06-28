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
import { Modal, ButtonGroup, ButtonToolbar, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col } from 'react-bootstrap';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek';
import { xFetchJSON } from '../libs/xtools';
import verto from '../verto/verto';

class SettingEventSocket extends React.Component {
	constructor(props) {
		super(props);

		this.state = {editable: false, rows:[]}
	}

	handleChange(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];
		const value = obj[id];

		console.log("id", id);
		console.log("value", value);

		xFetchJSON("/api/settings/event_socket/" + id, {
			method: "PUT",
			body: JSON.stringify({v: value})
		}).then((param) => {
			console.log("success!!!!", param);

			const rows = _this.state.rows.map(function(row) {
				if (row.id == param.id) {
					row = param;
				}
				return row;
			});

			_this.setState({rows: rows});
		}).catch((msg) => {
			console.error("update params", msg);
		});
	}

	componentDidMount() {
		const _this = this;

		xFetchJSON("/api/settings/event_socket").then((data) => {
			_this.setState({rows: data});
		}).catch((msg) => {
			console.log("get EventSocket ERR");
		});
	}

	handleToggleParam(e) {
		const _this = this;
		const param_id = e.target.getAttribute("data");

		xFetchJSON( "/api/settings/event_socket/" + param_id, {
			method: "PUT",
			body: JSON.stringify({action: "toggle"})
		}).then((param) => {
			console.log("success!!!!", param);

			const rows = _this.state.rows.map(function(row) {
				if (row.id == param.id) {
					row.disabled = param.disabled;
				}
				return row;
			});

			_this.setState({rows: rows});
		}).catch((msg) => {
			console.error("toggle params", msg);
		});
	}

	handleReload() {
		verto.fsAPI("reload", "mod_event_socket", function(r) {
			notify(<T.span text="Module reloaded"/>);
		});
	}

	render() {
		const _this = this;
		let hand = {cursor : "pointer"};

		const rows = this.state.rows.map((row) => {
			const enabled_style = dbfalse(row.disabled) ? "success" : "default";
			const disabled_class = dbfalse(row.disabled) ? null : "disabled";
			return <Row key={row.id} className={disabled_class}>
				<Col sm={2} title={T.translate("eventsocket-"+row.k)}>{row.k}</Col>
				<Col sm={8} style={hand} >
					<RIEInput value={row.v} change={_this.handleChange.bind(_this)}
						propName={row.id}
						className={_this.state.highlight ? "editable long-input" : "editable2 long-input"}
						validate={_this.isStringAcceptable}
						classLoading="loading"
						classInvalid="invalid"/>
				</Col>
				<Col sm={2}>
					<Button onClick={_this.handleToggleParam.bind(this)} data={row.id} bsStyle={enabled_style}>
						{dbfalse(row.disabled) ? T.translate("Enabled") : T.translate("Disabled")}
					</Button>
				</Col>
			</Row>
		});

		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				<Button onClick={this.handleReload}><T.span onClick={this.handleReload} text="Reload"/></Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h2><T.span text="EventSocket Settings"/></h2>
			{rows}
		</div>;
	}
}

export default SettingEventSocket;
