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
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Radio, Col, HelpBlock, ProgressBar} from 'react-bootstrap';
import { Link } from 'react-router';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek'
import Dropzone from 'react-dropzone';
import { EditControl,xFetchJSON } from '../libs/xtools';
import verto from '../verto/verto';
import parseXML from '../libs/xml_parser';

class UploadLicence extends React.Component {
	constructor(props) {
		super(props);
		this.state = {mac_address: "00:00:00:00:00:00", progress: -1};
	}

	onDrop(acceptedFiles, rejectedFiles) {
		const _this = this;
		console.log('Accepted files: ', acceptedFiles);
		console.log('Rejected files: ', rejectedFiles);

		const formdataSupported = !!window.FormData;

		let data = new FormData()

		for (var i = 0; i < acceptedFiles.length; i++) {
			data.append('file', acceptedFiles[i])
		}

		let xhr = new XMLHttpRequest();
		const progressSupported = "upload" in xhr;

		xhr.onload = function(e) {
			_this.setState({progress: 100});
			_this.setState({progress: -1});
		};

		if (progressSupported) {
			xhr.upload.onprogress = function (e) {
				// console.log("event", e);
				if (event.lengthComputable) {
					let progress = (event.loaded / event.total * 100 | 0);
					// console.log("complete", progress);
					_this.setState({progress: progress});
					if (progress == "100") {
						alert(T.translate("Upload done"));
					}
				}
			}
		} else {
			console.log("XHR upload progress is not supported in your browswer!");
		}

		xhr.open('POST', '/api/upload/licence');
		xhr.send(data);
	}

	handleControlClick(data) {
		console.log("data", data);
		this.dropzone.open();
	}

	componentDidMount() {
		let _this = this;
		verto.fsAPI("mips", "get mac_address eth0", function(data) {
			let message = data.message;
			let mac_address = data.message.split("\n")[0];
			_this.setState({mac_address: mac_address});

		});
	}

	render() {
		const progress_bar = this.state.progress < 0 ? null : <ProgressBar now={this.state.progress} label={`${this.state.progress}%`}/>
		return <Dropzone accept=".licence" ref={(node) => { this.dropzone = node; }} onDrop={this.onDrop} className="dropzone" activeClassName="dropzone_active" disableClick={true}><div>
			<Form horizontal id="licenceForm">
				<h1><T.span text={T.translate("Server Mac Address")}/></h1>
				<br/>
				<FormGroup controlId="formmcast_ip">
					<Col sm={3}>
						<input type="text" className="form-control" value={this.state.mac_address} disabled="disabled"/>
					</Col>
					<Col sm={3}>
						<Button bsStyle="primary" onClick={() => this.handleControlClick()}>
						<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
						<T.span text="Upload"/>
					</Button>
					</Col>
					<Col sm={6}>
						{progress_bar}
					</Col>
				</FormGroup>
			</Form>
		</div></Dropzone>
	}
}
export default UploadLicence;
