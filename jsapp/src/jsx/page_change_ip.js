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
import { Button, Form, FormGroup, FormControl, ControlLabel, Col } from 'react-bootstrap';
import { EditControl, xFetchJSON } from './libs/xtools';

class ChangeIpPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {errmsg: ''};
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var infos = form2json('#ChangeIpForm');
		console.log("infos", infos);

		if (!infos.address || !infos.netmask || !infos.gateway) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}
		xFetchJSON("/api/change_ip", {
			method: "POST",
			body: JSON.stringify(infos)
		}).then(() => {
			this.setState({errmsg: "保存成功！"});
		}).catch((msg) => {
			_this.setState({errmsg: msg});
		});
	}

	componentDidMount () {

	}

	render () {
		return <div>
			<h1><T.span text="Change IP"/></h1>
			<hr />
			<Form horizontal id="ChangeIpForm">
				<FormGroup controlId="formDescription">
					<Col sm={2}></Col>
					<Col sm={10}><FormControl.Static>修改IP会使系统重启，2分钟内请勿有任何操作</FormControl.Static></Col>
				</FormGroup>
				<FormGroup controlId="formAddress">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Address" className="mandatory"/></Col>
					<Col sm={8}><FormControl type="input" name="address" /></Col>
				</FormGroup>

				<FormGroup controlId="formNetmask">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Netmask" className="mandatory"/></Col>
					<Col sm={8}><FormControl type="input" name="netmask" /></Col>
				</FormGroup>

				<FormGroup controlId="formGateway">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Gateway" className="mandatory"/></Col>
					<Col sm={8}><FormControl type="input" name="gateway" /></Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={8}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Save" />
						</Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
				</FormGroup>
			</Form>
		</div>
	}
};

export default ChangeIpPage;
