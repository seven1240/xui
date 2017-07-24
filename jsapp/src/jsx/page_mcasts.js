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
import verto from './verto/verto';
import { Link } from 'react-router';
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';
import Select from 'react-select';
import { EditControl, xFetchJSON } from './libs/xtools'
import parseXML from './libs/xml_parser'

class NewMcast extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: '', type: 'MUSIC', codec_name: [], sample_rate: []};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleCodecNameChange = this.handleCodecNameChange.bind(this);
		this.handleTypeChange = this.handleTypeChange.bind(this);
	}

	handleCodecNameChange(e) {
		const _this = this;
		var qs = "";

		switch(e.target.value) {
			case 'PCMU':
				qs = "&k=8000";
				break;
			case 'PCMA':
				qs = "&k=8000";
				break;
			case 'G722':
				qs = "&k=16000";
				break;
			case 'CELT':
			case 'OPUS':
				qs = "&k=48000";
				break;
			default:
				break;
		}

		xFetchJSON("/api/dicts?realm=MCAST_SAMPLE_RATE" + qs).then((data) => {
			_this.setState({sample_rate: data});
		});
	}

	handleTypeChange(e) {
		this.setState({type: e.target.value});
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var mcast = form2json('#newMcastForm');
		console.log("mcast", mcast);

		if (!mcast.name || !mcast.codec_ms || !mcast.channels || !mcast.mcast_ip || !mcast.mcast_port) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		if (mcast.auto_start_time && mcast.auto_stop_time) {
			var reg = /^(20|21|22|23|[0-1]\d):[0-5]\d$/;
			var regExp = new RegExp(reg);

			if (!regExp.test(mcast.auto_start_time) || !regExp.test(mcast.auto_stop_time)) {
				this.setState({errmsg: "Time format incorrent"});
				return;
			}
		} else if (mcast.auto_start_time || mcast.auto_stop_time) {
			this.setState({errmsg: "Some time fields left blank"});
			return;
		} else {
			if (Number(mcast.auto_mode) == 1) {
				this.setState({errmsg: "Some time fields left blank"});
				return;
			}
		}

		if (!mcast.auto_start_time) delete mcast.auto_start_time;
		if (!mcast.auto_stop_time) delete mcast.auto_stop_time;

		xFetchJSON("/api/mcasts", {
			method: "POST",
			body: JSON.stringify(mcast)
		}).then((obj) => {
			mcast.id = obj.id;
			this.props.handleNewMcastAdded(mcast);
		}).catch((msg) => {
			console.error("mcast:", msg);
			this.setState({errmsg: msg});
		});
	}

	componentDidMount() {
		xFetchJSON("/api/dicts?realm=MCAST_CODEC_NAME").then((data) => {
			this.setState({codec_name: data});
		});

		xFetchJSON("/api/dicts?realm=MCAST_SAMPLE_RATE&k=8000").then((data) => {
			this.setState({sample_rate: data});
		});
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.handleNewMcastAdded;

		var enable_options = [[1, "Yes"], [0, "No"]];
		var type_options = [["MUSIC", "Music Multicast"], ["REALTIME", "Realtime Multicast"]];
		var optional_forms = [];
		var startDate = new Date();
		var stopDate = new Date();

		var formatTime = function(date) {
			var fHour = date.getHours() >= 10 ? date.getHours() : "0" + date.getHours();
			var fMin = date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes();

			return fHour + ":" + fMin;
		};

		stopDate.setHours(stopDate.getHours() + 1);
		var defaultStartTime = formatTime(startDate);
		var defaultStopTime = formatTime(stopDate);

		if (this.state.type != "REALTIME") {
			optional_forms.push(
				<FormGroup controlId="formAutoStartTime">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Auto Start Time"/></Col>
					<Col sm={10}>
						<FormControl type="input" name="auto_start_time" placeholder={defaultStartTime}/>
					</Col>
				</FormGroup>
			);

			optional_forms.push(
				<FormGroup controlId="formAutoStopTime">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Auto Stop Time"/></Col>
					<Col sm={10}>
						<FormControl type="input" name="auto_stop_time" placeholder={defaultStopTime}/>
					</Col>
				</FormGroup>
			);

			optional_forms.push(
				<FormGroup controlId="formAutoMode">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Auto Mode" /></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="auto_mode">
							{enable_options.map(function(o) {
								return <option key={o[0]} value={o[0]}><T.span text={o[1]}/></option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>
			);

			optional_forms.push(
				<FormGroup controlId="formEnable">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Enabled" /></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="enable">
							{enable_options.map(function(o) {
								return <option key={o[0]} value={o[0]}><T.span text={o[1]}/></option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>
			);
		}

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New mcast" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newMcastForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="multicast name" /></Col>
				</FormGroup>

				{/*
				<FormGroup controlId="formSource">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Source" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="source" placeholder="local_stream://test" /></Col>
				</FormGroup>
				*/}

				<FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="type" onChange={this.handleTypeChange}>
							{type_options.map(function(o) {
								return <option key={o[0]} value={o[0]}><T.span text={o[1]}/></option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formCodecName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Codec Name"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="codec_name" onChange={this.handleCodecNameChange}>
							{this.state.codec_name.map(function(c) {
								return <option key={c.id}>{c.k}</option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formSampleRate">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Sample Rate" /></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="sample_rate">
							{this.state.sample_rate.map(function(t) {
								return <option key={t.id} value={t.k}>{T.translate(t.k)}</option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formCodecMs">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Codec Ms" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="codec_ms" placeholder="20"/></Col>
				</FormGroup>

				<FormGroup controlId="formChannels">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Channels" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="channels" placeholder="1"/></Col>
				</FormGroup>

				<FormGroup controlId="formMcastIP">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Multicast Address" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="mcast_ip" placeholder="224.222.222.222"/></Col>
				</FormGroup>

				<FormGroup controlId="formMcastPort">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Multicast Port" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="mcast_port" placeholder="4598"/></Col>
				</FormGroup>

				{optional_forms}

				<FormGroup>
					<Col smOffset={2} sm={10}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Save" />
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

class McastPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mcast: {},
			mcast_files: [],
			remain_files: [],
			edit: false,
			enable: [],
			codec_name: [],
			sample_rate: [],
			select_value: [],
			type: 'MUSIC'
		};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleTypeChange = this.handleTypeChange.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleCodecNameChange = this.handleCodecNameChange.bind(this);
		this.handleSelectChange = this.handleSelectChange.bind(this);
		this.handleRemoveMediaFiles = this.handleRemoveMediaFiles.bind(this);
		this.handleGetReaminMediaFiles = this.handleGetReaminMediaFiles.bind(this);
		this.handleGetMcastMediaFiles = this.handleGetMcastMediaFiles.bind(this);
		this.handleAddMcastMediaFiles = this.handleAddMcastMediaFiles.bind(this);
	}

	handleCodecNameChange(e) {
		const _this = this;
		var qs = "";

		switch(e.target.value) {
			case 'PCMU':
				qs = "&k=8000";
				break;
			case 'PCMA':
				qs = "&k=8000";
				break;
			case 'G722':
				qs = "&k=16000";
				break;
			case 'CELT':
			case 'OPUS':
				qs = "&k=48000";
				break;
			default:
				break;
		}

		xFetchJSON("/api/dicts?realm=MCAST_SAMPLE_RATE" + qs).then((data) => {
			_this.setState({sample_rate: data});
		});
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var mcast = form2json('#newMcastForm');
		console.log("mcast", mcast);

		if (!mcast.name || !mcast.codec_ms || !mcast.channels || !mcast.mcast_ip || !mcast.mcast_port) {
			notify(<T.span text="Mandatory fields left blank"/>, "error");
			return;
		}

		if (mcast.auto_start_time && mcast.auto_stop_time) {
			var reg = /^(20|21|22|23|[0-1]\d):[0-5]\d$/;
			var regExp = new RegExp(reg);

			if (!regExp.test(mcast.auto_start_time) || !regExp.test(mcast.auto_stop_time)) {
				notify(<T.span text="Time format incorrent"/>, "error");
				return;
			}
		} else if (mcast.auto_start_time || mcast.auto_stop_time) {
			notify(<T.span text="Some time fields left blank"/>, "error");
			return;
		} else {
			if (Number(mcast.auto_mode) == 1) {
				notify(<T.span text="Some time fields left blank"/>, "error");
				return;
			}
		}

		xFetchJSON("/api/mcasts/" + mcast.id, {
			method: "PUT",
			body: JSON.stringify(mcast)
		}).then(() => {
			this.setState({mcast: mcast, edit: false})
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("mcast", msg);
		});
	}

	handleSelectChange(value) {
		this.setState({select_value: value});
	}

	handleGetReaminMediaFiles() {
		var _this = this;

		xFetchJSON("/api/mfile_mcasts/" + this.props.params.id + "/remain_files").then((obj) => {
			this.setState({remain_files: obj});
		}).catch((msg) => {
			console.error("get remain media files ERR", msg);
		});
	}

	handleGetMcastMediaFiles() {
		var _this = this;

		xFetchJSON("/api/mfile_mcasts/" + this.props.params.id).then((data) => {
			_this.setState({mcast_files: data});
		}).catch((msg) => {
			console.log("get mcast_files ERR", msg);
		});
	}

	handleAddMcastMediaFiles(e) {
		var _this = this;

		const mfiles = this.state.select_value.map(function(select) {
			return {mcast_id: _this.props.params.id, mfile_id: select.value.id}
		});

		xFetchJSON("/api/mfile_mcasts", {
			method: "POST",
			body: JSON.stringify(mfiles)
		}).then((data) => {
			this.handleGetReaminMediaFiles();
			this.handleGetMcastMediaFiles();
			this.setState({select_value: []});
		}).catch((msg) => {
			console.log("add media files ERR", msg);
		});
	}

	handleRemoveMediaFiles(e, file_id) {
		var c = confirm(T.translate("Confirm to Delete ?"));
		var url = "/api/mfile_mcasts/" + this.props.params.id;

		if (!c) return;

		if (file_id) {
			url = url + "/" + file_id;
		}

		xFetchJSON(url, {
			method: "DELETE"
		}).then((obj) => {
			var mfiles = [];

			if (file_id) {
				mfiles = this.state.mcast_files.filter(function(f) {
					return f.id != file_id;
				});
			}

			this.setState({mcast_files: mfiles});
			this.handleGetReaminMediaFiles();
		}).catch((msg) => {
			console.error("remove media files ERR", msg);
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	handleTypeChange(e) {
		this.setState({type: e.target.value});
	}

	componentDidMount() {
		var _this = this;

		xFetchJSON("/api/dicts?realm=MCAST_CODEC_NAME").then((data) => {
			_this.setState({codec_name: data});
		});
		xFetchJSON("/api/dicts?realm=MCAST_SAMPLE_RATE").then((data) => {
			_this.setState({sample_rate: data});
		});
		xFetchJSON("/api/mcasts/" + this.props.params.id).then((data) => {
			_this.setState({
				mcast: data,
				type: data.type
			});
			console.log("mcast", data);
		}).catch((msg) => {
			console.log("get mcast ERR");
		});

		this.handleGetMcastMediaFiles();
		this.handleGetReaminMediaFiles();
	}

	render() {
		const mcast = this.state.mcast;
		let save_btn = "";
		let err_msg = "";
		var _this = this;
		var add_files_button_disable = false;
		var remove_all_button_disable = false;
		var add_files_select_disable = false;
		var optional_forms = [];
		var playlist = [];

		if (this.state.edit) {
			save_btn = <Button onClick={this.handleSubmit}><i className="fa fa-save" aria-hidden="true"></i>&nbsp;<T.span text="Save"/></Button>
		}

		const codec_name_options = this.state.codec_name.map(function(row) {
			return [row.k, row.k];
		});

		const sample_rate_options = this.state.sample_rate.map(function(row) {
			return [row.k, row.k];
		});

		const enable_options = [[1, "Yes"], [0, "No"]];
		const type_options = [["MUSIC", "Music Multicast"], ["REALTIME", "Realtime Multicast"]];
		var enable_dval = enable_options[1];
		var auto_mode_dval = enable_options[1];
		var type_dval = type_options[0];

		const remain_file_options = this.state.remain_files.map(function(row){
			return { value: row, label: row.name };
		});

		if (remain_file_options.length <= 0) {
			add_files_select_disable = true;
		}

		if (this.state.select_value.length <= 0) {
			add_files_button_disable = true;
		}

		if (this.state.mcast_files.length <= 0) {
			remove_all_button_disable = true;
		}

		enable_options.map(function(o){
			if (o[0] == Number(_this.state.mcast.auto_mode)) auto_mode_dval = o;
			if (o[0] == Number(_this.state.mcast.enable)) enable_dval = o;
		});

		type_options.map(function(o){
			if (o[0] == _this.state.mcast.type) type_dval = o;
		});

		if (_this.state.type == "MUSIC") {
			optional_forms.push(
				<FormGroup controlId="formAutoStartTime">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Auto Start Time"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="auto_start_time" defaultValue={mcast.auto_start_time} placeholder={mcast.auto_start_time}/></Col>
				</FormGroup>
			);

			optional_forms.push(
				<FormGroup controlId="formAutoStopTime">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Auto Stop Time"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="auto_stop_time" defaultValue={mcast.auto_stop_time} placeholder={mcast.auto_stop_time}/></Col>
				</FormGroup>
			);

			optional_forms.push(
				<FormGroup controlId="formAutoMode">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Auto Mode"/></Col>
					<Col sm={10}>
						<EditControl edit={this.state.edit} componentClass="select" name="auto_mode" options={enable_options} text={auto_mode_dval[1]} defaultValue={auto_mode_dval[0]}/>
					</Col>
				</FormGroup>
			);

			optional_forms.push(
				<FormGroup controlId="formEnabled">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Enabled"/></Col>
					<Col sm={10}>
						<EditControl edit={this.state.edit} componentClass="select" name="enable" options={enable_options} text={enable_dval[1]} defaultValue={enable_dval[0]}/>
					</Col>
				</FormGroup>
			);

			playlist.push(<h1><T.span text="PlayList"/></h1>);
			playlist.push(<br/>);

			playlist.push(
				<ButtonToolbar>
					<Col sm={3}>
						<Select multi="true" disabled={add_files_select_disable} value={this.state.select_value} placeholder={T.translate('Please Select')} options={remain_file_options} onChange={this.handleSelectChange}/>
					</Col>

					<Col sm={3}>
						<Button disabled={add_files_button_disable} onClick={this.handleAddMcastMediaFiles}>
							<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
							<T.span text="Add"/>
						</Button>
					</Col>

					<Col sm={6}>
						<Button className="pull-right" bsStyle="danger" disabled={remove_all_button_disable} onClick={this.handleRemoveMediaFiles} data="new">
							<T.span text="Remove All Files"/>
						</Button>
					</Col>
				</ButtonToolbar>
			);

			playlist.push(<br/>);
			playlist.push(<br/>);

			playlist.push(
				<table className="table">
					<tbody>
						<tr>
							<th><T.span text="FileName"/></th>
							<th><T.span text="Size"/></th>
							<th><T.span text="-"/></th>
						</tr>
						{files}
					</tbody>
				</table>
			);
		}

		var files = this.state.mcast_files.map(function(f) {
			return (
			<tr key={f.id}>
				<th><Link to={`/settings/media_files/${f.id}`}>{f.name}</Link></th>
				<th>{f.file_size}</th>
				<th>
					<Button bsStyle="danger" bsSize="xsmall" onClick={(e) => _this.handleRemoveMediaFiles(e, f.id)} data-id={f.id}>
						<T.span text="Remove"/>
					</Button>
				</th>
			</tr>);
		})

		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				{err_msg} { save_btn }
				<Button onClick={this.handleControlClick}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;<T.span onClick={this.handleControlClick} text="Edit"/></Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Multicast"/> <small>{mcast.name}</small></h1>
			<hr/>

			<Form horizontal id="newMcastForm">
				<input type="hidden" name="id" defaultValue={mcast.id}/>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} disabled={true} name="name" defaultValue={mcast.name}/></Col>
				</FormGroup>

				{/*
				<FormGroup controlId="formSource">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Source" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="source" defaultValue={mcast.source}/></Col>
				</FormGroup>
				*/}

				<FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>
					<Col sm={10}>
						<EditControl edit={this.state.edit} onChange={this.handleTypeChange} componentClass="select" name="type" options={type_options} text={type_dval[1]} defaultValue={type_dval[0]}/>
					</Col>
				</FormGroup>

				<FormGroup controlId="formCodecName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Codec Name"/></Col>
					<Col sm={10}>
						<EditControl edit={this.state.edit} componentClass="select" name="codec_name" options={codec_name_options} text={T.translate(mcast.codec_name)} defaultValue={mcast.codec_name}/>
					</Col>
				</FormGroup>

				<FormGroup controlId="formSampleRate">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Sample Rate"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} disabled={true} componentClass="select" name="sample_rate" options={sample_rate_options} text={T.translate(mcast.sample_rate)} defaultValue={mcast.sample_rate}/></Col>
				</FormGroup>

				<FormGroup controlId="formCodecMs">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Codec Ms" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="codec_ms" defaultValue={mcast.codec_ms}/></Col>
				</FormGroup>

				<FormGroup controlId="formChannels">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Channels" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="channels" defaultValue={mcast.channels}/></Col>
				</FormGroup>

				<FormGroup controlId="formmcast_ip">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Multicast Address" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="mcast_ip" defaultValue={mcast.mcast_ip}/></Col>
				</FormGroup>

				<FormGroup controlId="formmcast_port">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Multicast Port" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="mcast_port" defaultValue={mcast.mcast_port}/></Col>
				</FormGroup>

				{optional_forms}

				<FormGroup controlId="formSave">
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={10}>{save_btn}</Col>
				</FormGroup>
			</Form>

			{playlist}

		</div>
	}
}

class McastsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {formShow: false, rows: [], danger: false};
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}


	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		}
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/mcasts/" + id, {
			method: "DELETE"
		}).then((data) => {
			console.log("deleted")
			var rows = this.state.rows.filter(function(row) {
				return row.id != id;
			});

			this.setState({rows: rows});
		}).catch((msg) => {
			console.error("mcast", msg);
		});
	}

	componentDidMount() {
		var _this = this;
		verto.subscribe("FSevent.custom::mcast::start", {
			handler: this.handleFSEvent.bind(this)
		});
		verto.subscribe("FSevent.custom::mcast::stop", {
			handler: this.handleFSEvent.bind(this)
		});

		xFetchJSON("/api/mcasts").then((data) => {
			this.setState({rows: data});

			var _this = this;
			verto.fsAPI("rtp_mcast", "xmllist", function(data) {
				let rows = [];
				const parser = new DOMParser();
				const doc = parser.parseFromString(data.message, "text/xml");
				console.log('doc', doc);

				const msg = parseXML(doc);
				console.log('msg', msg);

				let mcasts = [];

				if (isArray(msg)) {
					mcasts = msg;
				} else if (isObject(msg)) {
					mcasts.push(msg);
				}

				mcasts.forEach(function(mcast) {
					let name = mcast.name;
					let running = mcast.running;

					rows = _this.state.rows.map(function(row) {
						if (row.name == name) {
							row.running = dbtrue(running);
						}
						return row;
					});

				});

				if (rows.length) _this.setState({rows: rows});
			});
		}).catch((e) => {
			console.log("get mcasts ERR");
			notify('[' + e.status + '] ' + e.statusText);
		});
	}

	componentWillUnmount() {
		verto.unsubscribe("FSevent.custom::mcast::start");
		verto.unsubscribe("FSevent.custom::mcast::stop");
	}

	handleFSEvent(v, e) {
		const _this = this;
		if (e.eventChannel == "FSevent.custom::mcast::start") {
			const mcast_name = e.data["mcast_name"];

			const rows = _this.state.rows.map(function(row) {
				if (row.name == mcast_name) {
					row.running = true;
				}
				return row;
			});

			_this.setState({rows: rows});
		} else if (e.eventChannel == "FSevent.custom::mcast::stop") {
			const mcast_name = e.data["mcast_name"];

			const rows = _this.state.rows.map(function(row) {
				if (row.name == mcast_name) {
					row.running = false;
				}
				return row;
			});

			_this.setState({rows: rows});
		}
	}

	handleMcastAdded(mcast) {
		var rows = this.state.rows;
		rows.unshift(mcast);
		this.setState({rows: rows, formShow: false});
	}

	HandleToggleMcast(e) {
		const mcast_id = e.target.getAttribute("data");

		xFetchJSON("/api/mcasts/" + mcast_id, {
			method: "PUT",
			body: JSON.stringify({action: 'toggle'})
		}).then((mcast) => {
			const rows = this.state.rows.map(function(row) {
				if (row.id == mcast.id) row.enable = mcast.enable;
				return row;
			});
			this.setState({rows: rows});
		}).catch((msg) => {
			console.error("mcast", msg);
		});
	}

	handleMcastAction(e) {
		e.preventDefault();

		let mcast_name = e.target.getAttribute("data-name");
		let action = e.target.getAttribute("data-action");

		verto.fsAPI("rtp_mcast", action + " " + mcast_name, function(ret) {
			notify(ret.message);
		});
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let hand = { cursor: "pointer"};
	    var danger = this.state.danger ? "danger" : "";
	    var _this = this;
		var rows = [];
		this.state.rows.forEach(function(row) {

			const enabled_class = dbtrue(row.enable) ? "" : "disabled";
			const enabled_style = dbtrue(row.enable) ? "success" : "default";
			const running_class = row.running ? "running" : null;
			const disabled = row.type == "REALTIME" ? true : false;
			var mcast_control =
				<td className={running_class}>
					<T.a disabled={disabled} onClick={_this.handleMcastAction.bind(_this)} data-name={row.name} data-action="start" text="Start" href='#'/> |&nbsp;
					<T.a disabled={disabled} onClick={_this.handleMcastAction.bind(_this)} data-name={row.name} data-action="stop" text="Stop" href='#'/> |&nbsp;
					<T.a disabled={disabled} onClick={_this.handleMcastAction.bind(_this)} data-name={row.name} data-action="restart" text="Restart" href='#'/>
				</td>;

			if (row.type == "REALTIME") {
				mcast_control = <td><T.span text="Disabled"/></td>;
			}

			rows.push(<tr key={row.id} className={enabled_class}>
					<td><Link to={`/settings/mcasts/${row.id}`}>{row.name}</Link></td>
					<td><T.span text={row.type}/></td>
					<td>{row.codec_name}</td>
					<td>{row.mcast_ip}</td>
					<td>{row.mcast_port}</td>
					<td>{row.sample_rate}</td>
					<td><Button disabled={disabled} onClick={_this.HandleToggleMcast.bind(_this)} bsStyle={enabled_style} data={row.id}>{dbtrue(row.enable) ? T.translate("Yes") : T.translate("No")}</Button></td>
					{mcast_control}
					<td><T.a style={hand} onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>);
		})

		return <div>

			<ButtonToolbar className="pull-right">
				<ButtonGroup>
					<Button onClick={this.handleControlClick} data="new">
						<i className="fa fa-plus" aria-hidden="true" onClick={this.handleControlClick} data="new"></i>&nbsp;
						<T.span onClick={this.handleControlClick} data="new" text="New"/>
					</Button>
				</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Multicasts"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="Name"/></th>
					<th><T.span text="Type"/></th>
					<th><T.span text="Codec Name"/></th>
					<th><T.span text="Multicast Address"/></th>
					<th><T.span text="Multicast Port"/></th>
					<th><T.span text="Sample Rate"/></th>
					<th><T.span text="Enabled"/></th>
					<th><T.span text="Status"/> / <T.span text="Control"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewMcast show={this.state.formShow} onHide={formClose} handleNewMcastAdded={this.handleMcastAdded.bind(this)}/>
		</div>
	}
};

export {McastPage, McastsPage};
