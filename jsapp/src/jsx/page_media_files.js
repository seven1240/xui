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
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Radio, Col, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router';
// http://kaivi.github.io/riek/
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek'
import Dropzone from 'react-dropzone';
import { EditControl } from './xtools'

class NewMediaFile extends React.Component {
	propTypes: {handleNewMediaFileAdded: React.PropTypes.func}

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

		$.ajax({
			type: "POST",
			url: "/api/baidu/tts",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(mfile),
			success: function (obj) {
				_this.props["data-handleNewMediaFileAdded"](obj);
				var rows = _this.state.rows;
				_this.setState({rows:rows, formShow: false});
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	render() {
		console.log(this.props);

		const props = Object.assign({}, this.props);
		const mfiles = props.mfiles;
		delete props.mfiles;

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

class MediaFilePage extends React.Component {
	propTypes: {handleNewMediaFileAdded: React.PropTypes.func}

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
		var mfile = form2json('#newMediaFilesForm');

		if (!mfile.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		$.ajax({
			type: "PUT",
			url: "/api/media_files/" + mfile.id,
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(mfile),
			success: function () {
				mfile.params = _this.state.mfile.params;
				_this.setState({mfile: mfile, edit: false});
				notify(<T.span text={{key:"Saved at", time: Date()}}/>);
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	handleToggleParam(e) {
		const _this = this;
		const data = e.target.getAttribute("data");

		$.ajax({
			type: "PUT",
			url: "/api/media_files/" + this.state.mfile.id + "/params/" + data,
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify({action: "toggle"}),
			success: function (param) {
				// console.log("success!!!!", param);
				const params = _this.state.mfile.params.map(function(p) {
					if (p.id == data) {
						p.disabled = param.disabled;
					}
					return p;
				});
				_this.state.mfile.params = params;
				_this.setState({mfile: _this.state.mfile});
			},
			error: function(msg) {
				console.error("toggle params", msg);
			}
		});
	}

	handleChange(obj) {
		const _this = this;
		const id = Object.keys(obj)[0];

		console.log("change", obj);

		$.ajax({
			type: "PUT",
			url: "/api/media_files/" + this.state.mfile.id + "/params/" + id,
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify({v: obj[id]}),
			success: function (param) {
				console.log("success!!!!", param);
				_this.state.mfile.params = _this.state.mfile.params.map(function(p) {
					if (p.id == id) {
						return param;
					}
					return p;
				});
				_this.setState({mfile: _this.state.mfile});
			},
			error: function(msg) {
				console.error("update params", msg);
				_this.setState({mfile: _this.state.mfile});
			}
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
		$.getJSON("/api/media_files/" + this.props.params.id, "", function(data) {
			_this.setState({mfile: data});
		}, function(e) {
			console.log("get media files ERR");
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
						className={_this.state.highlight ? "editable" : ""}
						validate={_this.isStringAcceptable}
						classLoading="loading"
						classInvalid="invalid"/>
					</td>
					<td><Button onClick={_this.handleToggleParam} data={param.id}>{dbfalse(param.disabled) ? "Yes" : "No"}</Button></td>
				</tr>
			});
		}

		if (this.state.edit) {
			save_btn = <Button><T.span onClick={this.handleSubmit} text="Save"/></Button>
		}

		return <div>
			<ButtonGroup className="controls">
				{ save_btn }
				<Button><T.span onClick={this.handleControlClick} text="Edit"/></Button>
			</ButtonGroup>

			<h1>{mfile.name} <small>{mfile.extn}</small></h1>
			<hr/>

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
					<Col componentClass={ControlLabel} sm={2}><T.span text="路径"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="abs_path" defaultValue={mfile.abs_path}/></Col>
				</FormGroup>
			</Form>

		</div>
	}
}

class MediaFilesPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false, progress: -1};

		console.log("location", this.props.location.query)

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.onDrop = this.onDrop.bind(this);
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);

		if (data == "new") {
			// this.setState({ formShow: true});
			this.dropzone.open();
		}

		if (data == "ivr") {
			this.setState({ formShow: true});
		};
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		$.ajax({
			type: "DELETE",
			url: "/api/media_files/" + id,
			success: function () {
				console.log("deleted")
				var rows = _this.state.rows.filter(function(row) {
					return row.id != id;
				});

				_this.setState({rows: rows});
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	handleClick(x) {
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentDidMount() {
		var _this = this;
		$.getJSON("/api/media_files", "", function(data) {
			_this.setState({rows: data});
		}, function(e) {
			console.log("get media_files ERR");
		});
	}

	handleFSEvent(v, e) {
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

		const formdataSupported = !!window.FormData;

		let data = new FormData()

		for (var i = 0; i < acceptedFiles.length; i++) {
			data.append('file', acceptedFiles[i])
		}

/*
		// fetch is promise based so hard to track upload progress
		fetch('/api/upload', {
			method: 'POST',
			body: data
		}).then(function(response) {
			if (response.status == 200) {
				return response.json().then(function(mfiles) {
					_this.setState({rows: mfiles.concat(_this.state.rows)});
				});
			} else {
				console.error(response);
			}
		});
*/

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
					let mfiles = $.parseJSON(xhr.responseText);
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

	render() {
		const formClose = () => this.setState({ formShow: false });
		const toggleDanger = () => this.setState({ danger: !this.state.danger });
	    const danger = this.state.danger ? "danger" : "";

		const _this = this;

		const progress_bar = this.state.progress < 0 ? null : <ProgressBar now={this.state.progress} />

		const rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/media_files/${row.id}`}>{row.name}</Link></td>
					<td>{row.mime}</td>
					<td>{row.description}</td>
					<td>{row.file_size}</td>
					<td><T.a onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <Dropzone ref={(node) => { this.dropzone = node; }} onDrop={this.onDrop} className="dropzone" activeClassName="dropzone_active" disableClick={true}><div>
			<div className="controls">
				<Button>
					<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="Upload" />
				</Button>
				&nbsp;&nbsp;
				<Button>
					<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="ivr" text="TTS" />
				</Button>
			</div>

			<h1><T.span text="Media Files"/> <small><T.span text="Drag and drop files here to upload"/></small></h1>

			{progress_bar}

			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Type"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Size"/></th>
					<th><T.span text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewMediaFile show={this.state.formShow} onHide={formClose}
				mfiles = {this.state.rows}
				data-handleNewMediaFileAdded={this.handleMediaFileAdded.bind(this)}/>
		</div></Dropzone>
	}
}

export {MediaFilesPage, MediaFilePage};
