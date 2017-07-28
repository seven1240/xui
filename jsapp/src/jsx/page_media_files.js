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
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Radio, Col, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router';
// http://kaivi.github.io/riek/
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek'
import Dropzone from 'react-dropzone';
import { EditControl, xFetchJSON } from './libs/xtools'
import verto from './verto/verto';

class NewMediaFile extends React.Component {
	constructor(props) {
		super(props);

		this.last_id = 0;
		this.state = {errmsg: '', mfile: {},formShow: false, rows: []};
		// this.state = { formShow: false, rows: [], danger: false};
		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var mfile = form2json('#newMediaFileForm');
		console.log(mfile.input);

		if (!mfile.input) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/baidu/tts", {
			method: "POST",
			body: JSON.stringify(mfile)
		}).then((obj) => {
			_this.props.handleNewMediaFileAdded(obj);
			var rows = _this.state.rows;
			_this.setState({rows:rows, formShow: false});
		}).catch((msg) => {
			console.error("route", msg);
			_this.setState({errmsg: '' + msg});
		});
	}

	render() {
		const props = Object.assign({}, this.props);
		const mfiles = props.mfiles;
		delete props.mfiles;
		delete props.handleNewMediaFileAdded;

		const mfiles_options = mfiles.map(mfile => {
			return <option value={mfile.id} key={mfile.id}>Profile[{mfile.name}]</option>
		});

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="百度TTS" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newMediaFileForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="TTS文本" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="input" placeholder="text" /></Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={10}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="TTS" />
						</Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
				</FormGroup>
			</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>
					<i className="fa fa-times" aria-hidden="true"></i>&nbsp;
					<T.span text="Close" />
				</Button>
			</Modal.Footer>
		</Modal>;
	}
}

class NewRecordFile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {recordingMSG: null, audio: null};

		this.handleFSEvent = this.handleFSEvent.bind(this);
		this.handleDeleteOneRecodring = this.handleDeleteOneRecodring.bind(this);
	}

	componentDidMount() {
		verto.subscribe("FSevent.custom::xui::record_start", {handler: this.handleFSEvent});
		verto.subscribe("FSevent.custom::xui::record_complete", {handler: this.handleFSEvent});
	}

	componentWillUnmount() {
		verto.subscribe("FSevent.custom::xui::record_start");
		verto.subscribe("FSevent.custom::xui::record_complete");
	}

	handleDeleteOneRecodring() {
		var _this = this;

		if (1) {
			var c = confirm(T.translate("Confirm to Delete ?"));
			if (!c) return;
		}

		xFetchJSON("/api/media_files").then((data) => {
			xFetchJSON("/api/media_files/" + data[data.length-1].id, {
				method: "DELETE"
			}).then((obj) => {
				console.log("delete success");
			}).catch((msg) => {
				console.error("media_files delete", msg);
			});
		}).catch((msg) => {
			console.log("get media_files ERR");
		});
		_this.setState({audio: null});
	}

	handleFSEvent(v, e) {
		console.log("FSevent:", e);

		if (e.eventChannel == "FSevent.custom::xui::record_start") {
			const path = e.data.rel_path;
			this.setState({recordingMSG: <T.span text={{key:"Recording to", path: path}}/>,audio: null});
		} else if (e.eventChannel == "FSevent.custom::xui::record_complete") {
			const path = e.data.rel_path;
			const src = "/recordings/" + path;
			this.setState({recordingMSG: <T.span text={{key:"Record completed", path: path}}/>,
			audio: <div><Col sm={2}>录音试听：</Col><Col sm={4}><audio src={src} controls="controls" /></Col>
						<Col><Button  bsSize="small" onClick={this.handleDeleteOneRecodring}><T.span text="Delete"/></Button></Col></div>});
		}
	}

	doCallbackRecord() {
		console.log("callback record ...");
		verto.fsAPI("bgapi", "originate user/" + this.refs.callbackNumber.value + " *991234", function(s) {
			console.log(s);
		}, function(s) {
			console.error(s);
			notify(s);
		});
	}

	handleOpenWebPhone(e) {
		e.preventDefault();
		fire_event("verto-phone-open", '*991234');
	}

	render() {
		if (!this.props.show) return null;
		// let audio = <audio src={this.state.path} controls="controls" />;

		return <div aria-labelledby="contained-modal-title-lg">
			<h1><T.span text="Record"/></h1>
			<Form horizontal id="newRecordFileForm">
				<FormGroup controlId="formMSG">
					<Col sm={12}>{this.state.recordingMSG}</Col>
					<br/>
					<br/>
					{this.state.audio}

				</FormGroup>

				<hr/>

				<FormGroup controlId="formMethod1">
					<Col sm={12}>
						<Button onClick={this.handleOpenWebPhone} className="pull-right">
							<i className="fa fa-phone" aria-hidden="true" onClick={this.handleControlClick}></i>
						</Button>

						1.<T.span text="Use any phone, Call *991234 to record after BEEP"/>
					</Col>
				</FormGroup>

				<hr/>

				<FormGroup controlId="formMethod2">
					<Col sm={12}>2. <T.span text="Callback to record after BEEP"/></Col>
				</FormGroup>

				<FormGroup controlId="formMethod22">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Number" className="mandatory"/></Col>
					<Col sm={10}>
						<input type="input" name="number" placeholder="1000" ref="callbackNumber"/>&nbsp;
						<Button onClick={this.doCallbackRecord.bind(this)}>
							<i className="fa fa-phone" aria-hidden="true"></i>
						</Button>
					</Col>
				</FormGroup>
			</Form>
			<br/><br/><br/>
		</div>
	}
}

class MediaFilePage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {mfile: {}, edit: false, readonly: false};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleToggleParam = this.handleToggleParam.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.toggleHighlight = this.toggleHighlight.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var mfile = form2json('#newMediaFilesForm');

		if (!mfile.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/media_files/" + mfile.id, {
			method: "PUT",
			body: JSON.stringify(mfile)
		}).then((obj) => {
			mfile.params = _this.state.mfile.params;
			_this.setState({mfile: mfile, edit: false});
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("media_files put", msg);
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	handleToggleParam(data) {
		const _this = this;

		xFetchJSON("/api/media_files/" + this.state.mfile.id + "/params/" + data, {
			method: "PUT",
			body: JSON.stringify({action: "toggle"})
		}).then((param) => {
			const params = _this.state.mfile.params.map(function(p) {
				if (p.id == data) {
					p.disabled = param.disabled;
				}
				return p;
			});
			_this.state.mfile.params = params;
			_this.setState({mfile: _this.state.mfile});
		}).catch((msg) => {
			console.error("toggle params", msg);
		});
	}

	handleChange(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];

		console.log("change", obj);

		xFetchJSON("/api/media_files/" + this.state.mfile.id + "/params/" + id, {
			method: "PUT",
			body: JSON.stringify({v: obj[id]})
		}).then((param) => {
			console.log("success!!!!", param);
			_this.state.mfile.params = _this.state.mfile.params.map(function(p) {
				if (p.id == id) {
					return param;
				}
				return p;
			});
			_this.setState({mfile: _this.state.mfile});
		}).catch((msg) => {
			console.error("update params", msg);
			_this.setState({mfile: _this.state.mfile});
		});
	}

	toggleHighlight() {
		this.setState({highlight: !this.state.highlight});
	}

	isStringAcceptable() {
		return true;
	}

	componentDidMount() {
		const readonly = this.props.location.pathname.match(/^\/settings/) ? false : true;

		var _this = this;
		xFetchJSON("/api/media_files/" + this.props.params.id).then((data) => {
			_this.setState({mfile: data, readonly: readonly});
			console.log(data);
		}).catch((msg) => {
			console.log("get media files ERR");
			_this.setState({readoly: readoly});
		});
	}

	render() {
		const mfile = this.state.mfile;
		const _this = this;
		let save_btn = "";
		let err_msg = "";
		let params = <tr></tr>;

		if (this.state.mfile.params && Array.isArray(this.state.mfile.params)) {
			// console.log(this.state.mfile.params)
			params = this.state.mfile.params.map(function(param) {
				const disabled_class = dbfalse(param.disabled) ? "" : "disabled";

				return <tr key={param.id} className={disabled_class}>
					<td>{param.k}</td>
					<td><RIEInput value={param.v} change={_this.handleChange}
						propName={param.id}
						className={_this.state.highlight ? "editable long-input" : "long-input"}
						validate={_this.isStringAcceptable}
						classLoading="loading"
						classInvalid="invalid"/>
					</td>
					<td><Button onClick={() => _this.handleToggleParam(param.id)}>{dbfalse(param.disabled) ? "Yes" : "No"}</Button></td>
				</tr>
			});
		}

		if (this.state.edit) {
			save_btn = <Button onClick={this.handleSubmit}><T.span onClick={this.handleSubmit} text="Save"/></Button>
		}

		let src;
		if ((mfile.dir_path || '').match(/upload$/)) {
			src = "/upload/" + mfile.rel_path;
		} else if ((mfile.dir_path || '').match(/recordings$/)) {
			src = "/recordings/" + mfile.rel_path;
		};

		console.log(src);

		const media_type = (mfile.mime || "").split('/')[0]
		var mcontrol = null;
		var position = null;

		switch (media_type) {
			case "image":
				mcontrol = <img src={src} style={{maxWidth: "80%", maxHeight: "200px"}}/>
				break;
			case "audio":
				if (src.slice(-3) == 'amr') {
					src = src.replace(/amr/, 'mp3');
				}
				mcontrol = <audio src={src} controls="controls"/>
				position = "toolbar";
				break;
			case "video":
				mcontrol = <video src={src} controls="controls" style={{maxWidth: "80%", maxHeight: "200px"}}/>
				break;
			default:
				mcontrol = <Button><T.a href={src} text="Download" target="_blank"/></Button>
				position = "toolbar";
		}

		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				{position == "toolbar" ? mcontrol : null}
			</ButtonGroup>

			<ButtonGroup>
				{ save_btn }

				{
					this.state.readonly ? null :
					<Button onClick={this.handleControlClick}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;
						<T.span onClick={this.handleControlClick} text="Edit"/>
					</Button>
				}
			</ButtonGroup>
			</ButtonToolbar>

			<h1>{mfile.name} <small>{mfile.extn}</small></h1>
			<hr/>

			<div style={{textAlign: "center"}}>{position == null ? mcontrol : null}</div>

			<Form horizontal id="newMediaFilesForm">
				<input type="hidden" name="id" defaultValue={mfile.id}/>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={mfile.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="description" defaultValue={mfile.description}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="abs_path"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="abs_path" defaultValue={mfile.abs_path}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="ext"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="ext" defaultValue={mfile.ext}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="dir_path"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="dir_path" defaultValue={mfile.dir_path}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="file_size"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="file_size" defaultValue={parseInt(mfile.file_size) + "byte"}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="mime"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="mime" defaultValue={mfile.mime}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="original_file_name"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="original_file_name" defaultValue={mfile.original_file_name}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="channel_uuid"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="channel_uuid" defaultValue={mfile.channel_uuid}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="created_epoch"/></Col>
					<Col sm={10}><FormControl.Static>{mfile.created_epoch}</FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="updated_epoch"/></Col>
					<Col sm={10}><FormControl.Static>{mfile.updated_epoch}</FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formSave">
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={10}>{save_btn}</Col>
				</FormGroup>
			</Form>

		</div>
	}
}

class MediaFilesPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, recordFormShow: false, rows: [], danger: false, progress: -1, show: false, readonly: false};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.handleSortClick = this.handleSortClick.bind(this);
	}

	handleControlClick(data) {
		console.log("data", data);

		if (data == "new") {
			// this.setState({ formShow: true});
			this.dropzone.open();
		} else if (data == "ivr") {
			this.setState({ formShow: true});
		} else if (data == "record" && this.state.show == true) {
			this.setState({ recordFormShow: !this.state.recordFormShow, show: false });
		} else if (data == "record" && this.state.show == false) {
			this.setState({ recordFormShow: !this.state.recordFormShow, show: true });
		};
	}

	handleDelete(id) {
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/media_files/" + id, {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			_this.setState({rows: rows});
		}).catch((msg) => {
				console.error("media_files", msg);
		});
	}

	componentDidMount() {
		const readonly = this.props.location.pathname.match(/^\/settings/) ? false : true;
		const search = this.props.location.search || "";

		var _this = this;
		xFetchJSON("/api/media_files" + search).then((data) => {
			_this.setState({rows: data, readonly: readonly});
		}).catch((msg) => {
			console.log("get media_files ERR");
			this.setState({readonly: readonly});
		});
	}

	handleMediaFileAdded(roww) {
		var rows = this.state.rows;
		rows.push(roww);
		this.setState({rows: rows, formShow: false});
	}

	onDrop (acceptedFiles, rejectedFiles) {
		const _this = this;
		console.log('Accepted files: ', acceptedFiles);
		console.log('Rejected files: ', rejectedFiles);

		if (this.state.readonly) return;

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
				}
			}
		} else {
			console.log("XHR upload progress is not supported in your browswer!");
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					// console.log('response=',xhr.responseText);
					let mfiles = JSON.parse(xhr.responseText);
					console.log(mfiles);
					_this.setState({rows: mfiles.concat(_this.state.rows)});
				} else {
					// console.error("upload err");
				}
			}
		}

		xhr.open('POST', '/api/upload');
		xhr.send(data);
	}

	handleSortClick(field) {
		var rows = this.state.rows;

		var n = 1;

		if (this.state.order == 'ASC') {
			this.state.order = 'DSC';
			n = -1;
		} else {
			this.state.order = 'ASC';
		}

		if (field == 'file_size') {
			rows.sort(function(a,b) {
				return parseInt(a[field]) < parseInt(b[field]) ? -1 * n : 1 * n;
			});
		} else {
			rows.sort(function(a,b) {
				return a[field] < b[field] ? -1 * n : 1 * n;
			});
		}

		this.setState({rows: rows});
	}

	render() {
		let hand = { cursor: "pointer" };
		const formClose = () => this.setState({ formShow: false });
		const toggleDanger = () => this.setState({ danger: !this.state.danger });
	    const danger = this.state.danger ? "danger" : "";
	    const settings = this.state.readonly ? "" : "/settings";

		const _this = this;

		const progress_bar = this.state.progress < 0 ? null : <ProgressBar now={this.state.progress} label={`${this.state.progress}%`}/>

		const rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.created_epoch}</td>
					<td><Link to={`${settings}/media_files/${row.id}`}>{row.name.substring(0, 36)}</Link></td>
					<td>{row.description}</td>
					<td>{row.mime}</td>
					<td>{row.file_size}</td>
					<td><T.a onClick={() => _this.handleDelete(row.id)} text="Delete" className={danger} style={{cursor: 'pointer'}}/></td>
			</tr>;
		})

		if (_this.state.show == false) {
			var btng = <ButtonGroup>
				<Button onClick={() => this.handleControlClick("record")}>
					<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span text="Record" />
				</Button>
			</ButtonGroup>;
		} else {
			var btng = <ButtonGroup>
				<Button onClick={() => this.handleControlClick("record")}>
					<i className="fa fa-minus" aria-hidden="true"></i>&nbsp;
					<T.span text="Hidden Record" />
				</Button>
			</ButtonGroup>;
		};
		
		return <Dropzone ref={(node) => { this.dropzone = node; }} onDrop={this.onDrop} className="dropzone" activeClassName="dropzone_active" disableClick={true}><div>
			<NewRecordFile show={this.state.recordFormShow}/>

			{
				this.state.readonly ? null :
				<ButtonToolbar className="pull-right">
				<ButtonGroup>
					<Button onClick={() => this.handleControlClick("new")}>
						<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
						<T.span text="Upload" />
					</Button>
				</ButtonGroup>

				<ButtonGroup>
					<Button onClick={() => this.handleControlClick("ivr")}>
						<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
						<T.span text="TTS" />
					</Button>
				</ButtonGroup>

				{btng}
				</ButtonToolbar>
			}


			<h1><T.span text="Media Files"/>
			{
				this.state.readonly ? null : <small>&nbsp;&nbsp;<T.span text="Drag and drop files here to upload"/></small>
			}
			</h1>

			{progress_bar}

			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="Created"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Description" style={hand} onClick={() => this.handleSortClick("description")}/></th>
					<th><T.span text="Type" style={hand} onClick={() => this.handleSortClick("type")}/></th>
					<th><T.span text="Size" style={hand} onClick={() => this.handleSortClick("file_size")}/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewMediaFile show={this.state.formShow} onHide={formClose}
				mfiles = {this.state.rows}
				handleNewMediaFileAdded={this.handleMediaFileAdded.bind(this)}/>
		</div></Dropzone>
	}
}

export {MediaFilesPage, MediaFilePage};
