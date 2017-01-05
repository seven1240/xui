/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2016, Seven Du <dujinfang@x-y-t.cn>
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
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col } from 'react-bootstrap';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek'

class SystemPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {editable: false, rows:[]};

		// This binding is necessary to make `this` work in the callback
	}

	fetchACCKEY() {
		const _this = this;
		$.ajax({
			type: "PUT",
			url: "/api/baidu/acckey",
			dataType: "json",
			contentType: "application/json",
			data: null,
			success: function (obj) {
				console.log(obj);
				const rows = _this.state.rows.map(function(row) {
					if (row.k == obj.k) {
						row.v = obj.v;
						return row;
					} else {
						return row;
					}
				});

				_this.setState({rows: rows});
			},
			error: function(msg) {
				console.error("sip_profile", msg);
			}
		});
	}

	handleChange(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];

		console.log("change", obj);
	}

	componentDidMount() {
		const _this = this;
		$.getJSON("/api/dicts?realm=BAIDU", "", function(rows) {
			_this.setState({rows: rows});
		}, function(e) {
			console.error(e);
		})
	}

	render() {
		const _this = this;
		const rows = this.state.rows.map((row) => {
			return <Row key={row.k}>
				<Col sm={2}><T.span text={row.k}/></Col>
				<Col>
					<RIEInput value={row.v} change={_this.handleChange.bind(_this)}
						propName={row.id}
						className={_this.state.highlight ? "editable" : "editable2"}
						validate={_this.isStringAcceptable}
						classLoading="loading"
						classInvalid="invalid"/>

					{row.k == "ACCTOKEN" ? <Button onClick={_this.fetchACCKEY.bind(_this)}><T.span text="Fetch"/></Button> : null}
				</Col>
			</Row>
		});

		return <div>
			<h1><T.span text="System Settings"/></h1>
			<hr/>
			<h2><T.span text="Baidu TTS"/></h2>

			{rows}
		</div>;
	}
}

export default SystemPage;
