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

class TrafficDictPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {mfile: {}, edit: false};

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
		var mfile = form2json('#TrafficDictForm');

		if (!mfile.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/traffic_dicts/" + mfile.id, {
			method: "PUT",
			body: JSON.stringify(mfile)
		}).then((obj) => {
			mfile.params = _this.state.mfile.params;
			_this.setState({mfile: mfile, edit: false});
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("traffic_dicts put", msg);
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	handleToggleParam(data) {
		const _this = this;

		xFetchJSON("/api/traffic_dicts/" + this.state.mfile.id + "/params/" + data, {
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

		xFetchJSON("/api/traffic_dicts/" + this.state.mfile.id + "/params/" + id, {
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
		var _this = this;
		xFetchJSON("/api/traffic_dicts/" + this.props.params.id).then((data) => {
			_this.setState({mfile: data});
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
					<Button onClick={this.handleControlClick}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;
						<T.span onClick={this.handleControlClick} text="Edit"/>
					</Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1>{mfile.name} <small>{mfile.extn}</small></h1>
			<hr/>

			<div style={{textAlign: "center"}}>{position == null ? mcontrol : null}</div>

			<Form horizontal id="TrafficDictForm">
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
					<Col componentClass={ControlLabel} sm={2}><T.span text="created_at"/></Col>
					<Col sm={10}><FormControl.Static>{mfile.created_at}</FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="updated_at"/></Col>
					<Col sm={10}><FormControl.Static>{mfile.updated_at}</FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formSave">
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={10}>{save_btn}</Col>
				</FormGroup>
			</Form>

		</div>
	}
}

class TrafficDictsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { recordFormShow: false, rows: [], danger: false, progress: -1, show: false};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.onDrop = this.onDrop.bind(this);
	}

	handleControlClick(data) {
		if (data == "new") {
			this.dropzone.open();
		};
	}

	handleDelete(id) {
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/traffic_dicts/" + id, {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			_this.setState({rows: rows});
		}).catch((msg) => {
				console.error("traffic_dicts", msg);
		});
	}

	componentDidMount() {
		const search = this.props.location.search || "";

		var _this = this;
		xFetchJSON("/api/traffic_dicts" + search).then((data) => {
			_this.setState({rows: data});
		}).catch((msg) => {
			console.log("get traffic_dicts ERR");
		});
	}

	onDrop (acceptedFiles, rejectedFiles) {
		const _this = this;
		console.log('Accepted files: ', acceptedFiles);
		console.log('Rejected files: ', rejectedFiles);

		const formdataSupported = !!window.FormData;

		let data = new FormData()

		for (var i = 0; i < acceptedFiles.length; i++) {
			data.append('file', acceptedFiles[i]);
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
		xhr.open('POST', '/api/traffic_dicts');
		xhr.send(data);
	}

	render() {
		let hand = { cursor: "pointer" };
		const toggleDanger = () => this.setState({ danger: !this.state.danger });
	    const danger = this.state.danger ? "danger" : "";

		const _this = this;

		const progress_bar = this.state.progress < 0 ? null : <ProgressBar now={this.state.progress} />

		const rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.created_at}</td>
					<td><Link to={`/traffic_dicts/${row.id}`}>{row.name.substring(0, 36)}</Link></td>
					<td>{row.description}</td>
					<td>{row.mime}</td>
					<td>{row.file_size}</td>
					<td><T.a onClick={() => _this.handleDelete(row.id)} text="Delete" className={danger}/></td>
			</tr>;
		})
		
		return <Dropzone ref={(node) => { this.dropzone = node; }} onDrop={this.onDrop} className="dropzone" activeClassName="dropzone_active" disableClick={true}><div>
				<ButtonToolbar className="pull-right">
				<ButtonGroup>
					<Button onClick={() => this.handleControlClick("new")}>
						<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
						<T.span text="Upload" />
					</Button>
				</ButtonGroup>
				</ButtonToolbar>
			<h1><T.span text="Traffic Dicts"/>
			<small>&nbsp;&nbsp;<T.span text="Drag and drop files here to upload"/></small>
			</h1>

			{progress_bar}

			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="Created"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Type"/></th>
					<th><T.span text="Size"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>
		</div></Dropzone>
	}
}

export {TrafficDictPage, TrafficDictsPage};
