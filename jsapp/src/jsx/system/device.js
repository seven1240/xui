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
import verto from '../verto/verto';
import { Verto } from '../verto/verto';

export function getXUIDeviceSettings() {
	var ds = {};

	var autoBand = localStorage.getItem("xui.audio.autoBand") || false;
	var testSpeedJoin = localStorage.getItem("xui.audio.testSpeedJoin") || false;
	var googEchoCancellation = localStorage.getItem("xui.audio.googEchoCancellation") || false;
	var googNoiseSuppression = localStorage.getItem("xui.audio.googNoiseSuppression") || false;
	var googHighpassFilter = localStorage.getItem("xui.audio.googHighpassFilter") || false;
	var googAutoGainControl = localStorage.getItem("xui.audio.googAutoGainControl") || false;
	var useVideo = localStorage.getItem("xui.audio.useVideo") || false;
	var useStereo = localStorage.getItem("xui.audio.useStereo") || false;
	var useSTUN = localStorage.getItem("xui.audio.useSTUN") || false;
	var mirrorInput = localStorage.getItem("xui.audio.mirrorInput") || false;
	var askRecoverCall = localStorage.getItem("xui.audio.askRecoverCall") || false;

	// localStorage is string only so convert them into boolean
	ds.autoBand = autoBand == "true";
	ds.testSpeedJoin = testSpeedJoin == "true";
	ds.googEchoCancellation = googEchoCancellation == "true";
	ds.googAutoGainControl = googAutoGainControl == "true";
	ds.googNoiseSuppression = googNoiseSuppression == "true";
	ds.googHighpassFilter = googHighpassFilter == "true";
	ds.useVideo = useVideo == "true";
	ds.useStereo = useStereo == "true";
	ds.useSTUN = useSTUN == "true";
	ds.mirrorInput = mirrorInput == "true";
	ds.askRecoverCall = askRecoverCall == "true";

	ds.videoDevice = localStorage.getItem("xui.audio.videoDevice") || "any";
	ds.frameRate = localStorage.getItem("xui.audio.frameRate") || 15;
	ds.resolution = localStorage.getItem("xui.audio.resolution") || "any";
	ds.audioInDevice = localStorage.getItem("xui.audio.audioInDevice") || "any";
	ds.audioOutDevice = localStorage.getItem("xui.audio.audioOutDevice") || "any";
	ds.shareDevice = localStorage.getItem("xui.audio.shareDevice") || "any";

	return ds;
};

export function defaultSetting() {
	var defaultSetting = {
		autoBand : true,
		testSpeedJoin : true,
		googEchoCancellation : true,
		googAutoGainControl : true,
		googNoiseSuppression : true,
		googHighpassFilter : true,
		useVideo  : true ,
		useStereo : true ,
		useSTUN : true ,
		mirrorInput : false,
		askRecoverCall : false,
		videoDevice : "defalut",
		frameRate : 15,
		resolution : "defalut",
		audioInDevice : "defalut",
		audioOutDevice : "defalut",
		shareDevice : "defalut"
	};

	return defaultSetting;
}

class SettingDevice extends React.Component {
	constructor(props) {
		super(props);
		const _this = this;
		let init = defaultSetting();

		this.state = { cameras: [], microphones: [], speakers: [] };
		for(var key in init){
			this.state[key] = init[key];
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleCheckChange = this.handleCheckChange.bind(this);
		this.hanldeTestSpeed = this.hanldeTestSpeed.bind(this);
		this.handleRefreshList = this.handleRefreshList.bind(this);
		this.handleResetSettings = this.handleResetSettings.bind(this);
		this.handlePrevieSetting = this.handlePrevieSetting.bind(this);
	}

	componentDidMount() {
		const _this = this;
		const ds = getXUIDeviceSettings();
		for(var key in ds){
			_this.setState({ [key]: ds[key] });
		}

		this.handleRefreshList(ds);
	}

	handleChange(e){
		localStorage.setItem("xui.audio." + e.target.name, e.target.value);
		this.setState({[e.target.name]: e.target.value});
	}

	handleCheckChange(e){
		this.setState({ [e.target.value]: e.target.checked });
		localStorage.setItem("xui.audio." + e.target.value, e.target.checked);
	}

	handleResetSettings() { 
		const _this = this;
		let init = defaultSetting();
		for(var key in init){
			_this.setState({ [key]: init[key] });
			localStorage.setItem("xui.audio." + key, init[key]);
		}
	}

	hanldeTestSpeed() {
		console.log("Still not use,will do ...");
	}
	handlePrevieSetting() {
		console.log("Still not use,will do ...");
	}

	handleRefreshList(ds) {
		const _this = this;
	
		var runtime = function(obj) {
			console.log("refreshDevices runtime", obj);
			_this.setState({
				cameras: Verto.videoDevices,
				microphones: Verto.audioInDevices,
				speakers: Verto.audioOutDevices,
				videoDevice: ds.videoDevice,
				frameRate: ds.frameRate
			});
		}
		Verto.refreshDevices(runtime);
	}

	render() {
		const _this = this;

		const video_rows = <div>
				<div className="row">
					<Col sm={2}><T.span text="Camera" /></Col>
					<Col sm={3}>
						<FormControl name="videoDevice" componentClass="select" onChange={_this.handleChange} value={_this.state.videoDevice}>
							<option key='none' value='none'>{T.translate("No Camera")}</option>
							{_this.state.cameras.map(function(obj){
								return <option key={obj.id} value={obj.id}>{obj.label ? obj.label : obj.id}</option>
							})}
						</FormControl>
					</Col>
				</div>
				<div className="row">
					<Col sm={2}><T.span text="Share device" /></Col>
					<Col sm={3}>
						<FormControl name="shareDevice" onChange={this.handleChange} value={this.state.shareDevice} componentClass="select">
							<option value="Screen">Screen</option>
							{_this.state.cameras.map(function(obj){
								return <option key={obj.id} value={obj.id}>{obj.label ? obj.label : obj.id}</option>
							})}
						</FormControl>
					</Col>
				</div>
				<div className="row">
					<Col sm={2}><T.span text="Best frame rate" /></Col>
					<Col sm={3}>
						<FormControl name="frameRate" onChange={this.handleChange} value={this.state.frameRate} componentClass="select">
							<option value="default">{T.translate("default")}</option>
							<option value="10">10 FPS</option>
							<option value="15">15 FPS</option>
							<option value="24">24 FPS</option>
							<option value="25">25 FPS</option>
							<option value="30">30 FPS</option>
							<option value="60">60 FPS</option>
						</FormControl>
					</Col>
				</div>
				<div className="row">
					<Col sm={2}><T.span text="Resolution" /></Col>
					<Col sm={3}>
						<FormControl name="resolution" onChange={this.handleChange} value={this.state.resolution} componentClass="select">
							<option value="default">{T.translate("default")}</option>
							<option value="120p" label="120p 160x120 4:3"></option>
							<option value="QVGA" label="QVGA 320x240 4:3"></option>
							<option value="VGA"  label="VGA  640x480 4:3"></option>
							<option value="SVGA" label="SVGA 800x600 4:3"></option>
							<option value="180p" label="180p 320x180 16:9"></option>
							<option value="360p" label="360p 640x360 16:9"></option>
							<option value="720p" label="720p 1280x720 16:9"></option>
							<option value="1080p" label="1080p 1920x1080 16:9"></option>
							<option value="QCIF" label="QCIF 176x144 11:9"></option>
							<option value="CIF"  label="CIF  352x288 11:9"></option>
							<option value="4CIF" label="4CIF 704x576 11:9"></option>
						</FormControl>
					</Col>
				</div>

				<div className="row">
					<Col sm={6}>
						<Checkbox onChange={_this.handleCheckChange}  name="autoBand" value="autoBand" inline checked={_this.state.autoBand}>
							<T.span text="Automatically determine speed and resolution settings" />
						</Checkbox>
						<br/><br/>
						<Checkbox onChange={_this.handleCheckChange}  name="testSpeedJoin" value="testSpeedJoin" inline checked={_this.state.testSpeedJoin}>
							<T.span text="Recheck bandwidth before each outgoing call" />
						</Checkbox>
						<br/><br/>
						<Checkbox onChange={_this.handleCheckChange} value="mirrorInput" inline checked={_this.state.mirrorInput}>
							<T.span text="Scale Remote Video To Match Camera Resolution" />
						</Checkbox>
					</Col>
					<br/><br/>
					<Button onClick={_this.handlePrevieSetting}><T.span text="Preview Settings" /></Button>
					<br/><br/>
				</div>
			</div>

		const audio_rows = <div>
			<div className="row">
				<Col sm={2}><T.span text="Microphone" /></Col>
				<Col sm={3}>
					<FormControl componentClass="select" id="microphone" name="audioInDevice" onChange={_this.handleChange} value={_this.state.audioInDevice}>
						{_this.state.microphones.map(function(obj){
							return <option key={obj.id} value={obj.id}>{obj.label ? obj.label : obj.id}</option>
						})}
					</FormControl>
				</Col>
			</div>
			<div className="row">
				<Col sm={2}><T.span text="Speaker" /></Col>
				<Col sm={3}>
					<FormControl componentClass="select" id="speaker" name="audioOutDevice" onChange={_this.handleChange} value={_this.state.audioOutDevice}>
						{_this.state.speakers.map(function(obj){
							return <option key={obj.id} value={obj.id}>{obj.label ? obj.label : obj.id}</option>
						})}
					</FormControl>
				</Col>
			</div>
			<div className="row">
				<Col sm={4}>
					<Checkbox onChange={_this.handleCheckChange} value="useStereo" inline checked={_this.state.useStereo}>
						<T.span text="Stereo Audio" />
					</Checkbox>
					<br/><br/>
					<Checkbox onChange={_this.handleCheckChange}  name="googEchoCancellation" value="googEchoCancellation" inline checked={_this.state.googEchoCancellation}>
						<T.span text="Echo Cancellation" />
					</Checkbox>
					<br/><br/>
					<Checkbox onChange={_this.handleCheckChange}  name="googNoiseSuppression" value="googNoiseSuppression" inline checked={_this.state.googNoiseSuppression}>
						<T.span text="Noise Suppression" />
					</Checkbox>
					<br/><br/>
					<Checkbox onChange={_this.handleCheckChange}  name="googHighpassFilter" value="googHighpassFilter" inline checked={_this.state.googHighpassFilter}>
						<T.span text="Highpass Filter" />
					</Checkbox>
					<br/><br/>
					<Checkbox onChange={_this.handleCheckChange}  name="googAutoGainControl" value="googAutoGainControl" inline checked={_this.state.googAutoGainControl}>
						<T.span text="Auto Gain Control" />
					</Checkbox>
				</Col>
			</div>
		</div>

		const general_rows = <div className="row">

			<div className="row">
				<Col sm={4}>
					
					<Checkbox onChange={_this.handleCheckChange} value="useSTUN" inline checked={_this.state.useSTUN}>
						<T.span text="Use STUN" />
					</Checkbox>
					<br/><br/>
					<Checkbox onChange={_this.handleCheckChange} value="askRecoverCall" inline checked={_this.state.askRecoverCall}>
						<T.span text="Ask before recovering call" />
					</Checkbox>
				</Col>
			</div>

			<div className="row">
				<Col sm={4}>
					<Button onClick={_this.handleRefreshList}><T.span text="Refresh Device List" /></Button>
					<br/><br/>
					<Button onClick={_this.handleResetSettings}><T.span text="Factory Reset" /></Button>
				</Col>
			</div>
		</div>

		return <div>
			<ButtonToolbar className="pull-right">
				<ButtonGroup>
					<Button onClick={_this.hanldeTestSpeed}><T.span text="Check Network Speed" /></Button>
				</ButtonGroup>
			</ButtonToolbar>
			<h2><T.span text="General Settings"/></h2>
			{general_rows}

			<hr/>
			<h2><T.span text="Audio Settings" /></h2>
			{audio_rows}

			<hr/>
			<h2><T.span text="Video Settings" /></h2>
			{video_rows}

		</div>;
	}
}

export default SettingDevice;
