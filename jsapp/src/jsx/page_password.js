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
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';
import { xFetchJSON } from './libs/xtools'

class PasswordPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {errmsg: null};
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		console.log("submit...");
		var pass = form2json('#passwordForm');

		if (!pass.password || !(pass.password == pass.password2)) {
			this.setState({errmsg: "Password confirmation doesn't match"});
			return;
		}

		xFetchJSON("/api/users/change_password", {
			method: "PUT",
			body: JSON.stringify(pass)
		}).then((res) => {
			console.log("res", res);
			notify(<T.span text="Password successfully changed"/>);
		}).catch((msg) => {
			console.error("pass:", msg);
			this.setState({errmsg: msg});
		});
	}

	render() {
		return <div>
			<h2><T.span text="Change Password"/></h2>
			<br/>
			<br/>
			<br/>
			<Form horizontal id="passwordForm">
				<FormGroup controlId="formOldPassword">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Old Password" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="password" name="old_password"/></Col>
				</FormGroup>

				<FormGroup controlId="formPassword">
					<Col componentClass={ControlLabel} sm={2}><T.span text="New Password" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="password" name="password" placeholder="a$veryComplicated-Passw0rd" /></Col>
				</FormGroup>

				<FormGroup controlId="formConfirmPassword">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Confirm Password" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="password" name="password2" placeholder="a$veryComplicated-Passw0rd" /></Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={10}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Save" />
						</Button>
						&nbsp;&nbsp;
						<T.span className="danger" text={this.state.errmsg}/>
					</Col>
				</FormGroup>
			</Form>
		</div>
	}
}

export default PasswordPage;
