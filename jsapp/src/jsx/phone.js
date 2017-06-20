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
 * phone.js - The Verto Phone
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { NavItem,  Button } from 'react-bootstrap';
import verto from './verto/verto';
import { Verto } from './verto/verto';
import { getXUIDeviceSettings } from './system/device';

class Phone extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			displayState: false,
			loginState: false,
			callState: "Idle",
			curCall: null,
			shareCall: null,
			cidName: "Anonymouse",
			cidNum: "000000",
			dtmfVisible: false,
			videoMode: "audio",
			destNumber: '',
			displayStyle: null
		};
		this.handleMenuClick = this.handleMenuClick.bind(this);
		this.handleVertoLogin = this.handleVertoLogin.bind(this);
		this.handleVertoDisconnect = this.handleVertoDisconnect.bind(this);
		this.handleVertoDialogState = this.handleVertoDialogState.bind(this);
		this.handleVertoPhoneOpen = this.handleVertoPhoneOpen.bind(this);
		this.handleDestNumberChange = this.handleDestNumberChange.bind(this);
		this.handleChangeDestNumber = this.handleChangeDestNumber.bind(this);
		this.handleCall = this.handleCall.bind(this);
		this.handleHangup = this.handleHangup.bind(this);
		this.handleAnswer = this.handleAnswer.bind(this);
		this.handleShare = this.handleShare.bind(this);
		this.handleVideoToggle = this.handleVideoToggle.bind(this);
		this.handleDTMF = this.handleDTMF.bind(this);
		this.toggleVideo = this.toggleVideo.bind(this);
		this.inCall = this.inCall.bind(this);
		this.translateCallState = this.translateCallState.bind(this);
	}

	inCall() {
		return this.state.curCall || this.state.shareCall;
	}

	useVideo() {
		return this.state.videoMode == "video" || this.state.videoMode == "screen";
	}

	translateCallState(state) {
		switch (state) {
			case Verto.enum.state.new:
			case Verto.enum.state.trying:
			case Verto.enum.state.recovering:
			case Verto.enum.state.answering:
			case Verto.enum.state.ringing:
			case Verto.enum.state.early:
			case Verto.enum.state.active:
			case Verto.enum.state.held:
				return state.name.replace(/\b\w/g, l => l.toUpperCase());
				break;
			case Verto.enum.state.hangup:
			case Verto.enum.state.destroy:
			case Verto.enum.state.purge:
				return "Idle";
			default:
				return "INVALIDSTATE";
		}
	}

	handleMenuClick () {
		this.setState({displayState: !this.state.displayState});
	}

	handleVertoLogin () {
		this.setState({loginState: true});
	}

	handleVertoDisconnect () {
		this.setState({loginState: false});
	}

	handleVertoPhoneOpen (e) {
		const destNumber = e.detail;
		this.setState({destNumber: destNumber, displayState: true});
	}

	handleVertoDialogState (e) {
		var stateData = {}
		const d = e.detail;
		console.log("state", d.state);

		if (d == this.state.shareCall) {
			stateData.shareCall = d;
			stateData.callState = this.translateCallState(d.state);

			switch (d.state) {
				case Verto.enum.state.early:
				case Verto.enum.state.active:
					break;
				case Verto.enum.state.destroy:
				case Verto.enum.state.purge:
					stateData.shareCall = null;
					break;
				default:
					break;
			}

			this.setState(stateData);
			return;
		}

		// another call?
		if (this.state.curCall && d.callID != this.state.curCall.callID) {
			if (d.state.name != "hangup" && d.state.name != "destroy") {
				console.log("hangup", d.callID);
				d.hangup();
			}

			return;
		}

		stateData.curCall = d;

		if (d.state.name == "ringing") {
			stateData.cidNum = d.params.caller_id_number;
		} else if (d.state.name == "trying") {
		} else if (d.state.name == "early") {
		} else if (d.state.name == "active") {
			stateData.cidName = d.cidString();
		} else if (d.state.name == "hangup") {
			stateData.hangupCause = d.cause;
		} else if (d.state.name == "destroy") {
			stateData.curCall = null;
		}

		stateData.callState = this.translateCallState(d.state);
		this.setState(stateData);
	}

	handleDestNumberChange (e) {
		this.setState({destNumber: e.target.value});
	}

	handleChangeDestNumber (e) { // other place want to change the destNumber input
		console.log("changeDestNumber:", e.detail);
		this.setState({destNumber: e.detail});
	}

	handleCall () {
		const _this = this;
		var number = this.state.destNumber;
		if (!number) {
			this.setState({destNumber: localStorage.getItem("phone.destNumber")});
			return;
		}

		if (number == 'xtop') {
			const displayStyle = this.state.displayStyle == 'xtop' ? null : 'xtop';
			localStorage.setItem('phone.displayStyle', displayStyle);
			this.setState({displayStyle: displayStyle});
			return;
		}

		if (number == 'text') {
			const displayStyle = this.state.displayStyle == 'text' ? null : 'text';
			localStorage.
			setItem('phone.displayStyle', displayStyle);
			this.setState({displayStyle: displayStyle});
			return;
		}

		localStorage.setItem("phone.destNumber", this.state.destNumber);

		this.setState({callState: "Trying"});

		let useVideo = this.useVideo();

		const ds = getXUIDeviceSettings();
		console.log('deviceSettings', ds);

		if (useVideo) {
			var vid_width = 640;
			var vid_height = 360;

			switch (ds.resolution) {
				case "120p": vid_width = 160; vid_height = 120; break;
				case "QVGA": vid_width = 320; vid_height = 240; break;
				case "VGA":  vid_width = 640; vid_height = 480; break;
				case "SVGA": vid_width = 800; vid_height = 600; break;
				case "180p": vid_width = 320; vid_height = 180; break;
				case "360p": vid_width = 640; vid_height = 360; break;
				case "720p": vid_width =1280; vid_height = 720; break;
				case "1080p":vid_width =1920; vid_height = 1080;break;
				case "QCIF": vid_width = 176; vid_height = 144; break;
				case "CIF":  vid_width = 352; vid_height = 288; break;
				case "4CIF": vid_width = 704; vid_height = 576; break;
			}

			verto.videoParams({
				"minWidth":  vid_width,
				"minHeight": vid_height,
				"maxWidth":  vid_width,
				"maxHeight": vid_height,
				"minFrameRate": ds.frameRate,
				"vertoBestFrameRate": ds.frameRate
			});
		}

		if (this.state.videoMode == "screen") {
			this.handleShare();
			return;
		}

		verto.newCall({
			destination_number: this.state.destNumber,
			caller_id_name: localStorage.getItem('xui.username'),
			caller_id_number: localStorage.getItem('xui.username'),
			useVideo: useVideo,
			useCamera: ds.videoDevice,
			useMic: ds.audioInDevice,
			useSpeak: ds.audioOutDevice,
			useStereo: true,
			outgoingBandwidth: 'default',
			incomingBandwidth: 'default',
			deviceParams: {
				useMic: ds.audioInDevice,
				useSpeak: ds.audioOutDevice,
				useCamera: ds.videoDevice
			}
		});
	}

	handleHangup() {
		if (this.state.curCall) {
			this.state.curCall.hangup();
		}

		if (this.state.shareCall) { // todo, handle this separately ?
			this.state.shareCall.hangup();
		}
	}

	handleAnswer() {
		console.log('curCall', this.state.curCall);

		const ds = getXUIDeviceSettings();

		this.state.curCall.answer({
			useVideo: this.state.curCall.params.wantVideo,
			useMic: ds.audioInDevice,
			useSpeak: ds.audioOutDevice,
			useCamera: ds.videoDevice
		});
	}

	handleShare() {
		const _this = this;
		if (this.state.shareCall) {
			if (confirm(T.translate("Stop Sharing") + " " + T.translate("Are you sure?"))) {
				this.state.shareCall.hangup();
			}
			return;
		}

		console.log("Attempting Screen Capture....");
		notify("Attempting Screen Capture....");

		const sharefunc = function (error, sourceId, screen_constraints) {
			_this.state.shareCall = verto.newCall({
				destination_number: _this.state.destNumber,
				caller_id_name: localStorage.getItem('xui.username'),
				caller_id_number: localStorage.getItem('xui.username'),
				// outgoingBandwidth: outgoingBandwidth,
				// incomingBandwidth: incomingBandwidth,
				videoParams: screen_constraints ? screen_constraints.video.mandatory : {},
				useVideo: true,
				screenShare: true,
				// dedEnc: false,
				mirrorInput: false
			});
		}

		if (!!navigator.mozGetUserMedia) {
			sharefunc();
		} else {
			getScreenId(sharefunc);
		}
	}

	handleVideoToggle() {
		const video = document.getElementById('webcam'); // todo fix hardcoded
		const display = video.style.display;
		switch (display) {
			case "block":
				video.style.display = "none";
				break;
			case "":
			case "none":
			default:
				video.style.display = "block";
		}
	}

	handleDTMF(e) {
		var dtmf = e.target.getAttribute("data-dtmf");

		if (!dtmf) {
			this.setState({dtmfVisible: !this.state.dtmfVisible});
		} else {
			if (this.state.curCall) {
				this.state.curCall.dtmf(dtmf);
			} else {
				const destNumber = this.state.destNumber + dtmf;
				console.log("destNumber", destNumber);
				this.setState({destNumber: destNumber});
			}
		}
	}

	toggleVideo() {
		let videoMode = "audio"
		switch(this.state.videoMode) {
			case "audio": videoMode = "video";  break;
			case "video": videoMode = "screen"; break;
			default:      videoMode = "audio";  break;
		}

		this.setState({videoMode: videoMode});
		localStorage.setItem('phone.videoMode', videoMode);
	}

	componentDidMount() {
		window.addEventListener("verto-login", this.handleVertoLogin);
		window.addEventListener("verto-disconnect", this.handleVertoDisconnect);
		window.addEventListener("verto-dialog-state", this.handleVertoDialogState);
		window.addEventListener("verto-phone-open", this.handleVertoPhoneOpen);
		window.addEventListener("xui-phone-change-dest-number", this.handleChangeDestNumber);

		if (verto_loginState) this.handleVertoLogin();

		this.setState({
			displayStyle: localStorage.getItem('phone.displayStyle') || "xtop",
			destNumber: localStorage.getItem('phone.destNumber') || '',
			videoMode: localStorage.getItem('phone.videoMode') || "audio"
		});

		// hack ringer
		verto.ringer = document.getElementById('ringer');
	}

	componentWillUnmount() {
		window.removeEventListener("verto-login", this.handleVertoLogin);
		window.removeEventListener("verto-disconnect", this.handleVertoDisconnect);
		window.removeEventListener("verto-dialog-state", this.handleVertoDialogState);
		window.removeEventListener("verto-phone-open", this.handleVertoPhoneOpen);
	}

	render() {
		var state;
		var callButton = null;
		var callButtonDisabled = false;
		var hangupButton = null;
		var transferButton = null;
		var answerButton = null;
		var callerID = null;
		var toggleDTMF = <Button bsStyle="info" bsSize="xsmall" onClick={this.handleDTMF}>
			<i className="fa fa-tty" aria-hidden="true"></i>&nbsp;
			<T.span text= "DTMF" /></Button>;
		var videoButton = null;
		var xtopDisplay = null;
		var textDisplay = null;
		var ishttps = 'https:' == document.location.protocol ? true: false;

		if (!ishttps) {
			return <NavItem eventKey="phone">
				<T.span id="phone-static" className={state} text="Socket Connected" onClick={this.handleMenuClick} />
			</NavItem>
		}

		var DTMFs = <div style={{display: this.state.dtmfVisible ? "block" : "none"}}>
		<div className="row">
			<div className="col-xs-12">
	            <T.span className="btn btn-default btn-circle" onClick={this.handleDTMF} data-dtmf="1" text="1" />
	            <T.span className="btn btn-default btn-circle" onClick={this.handleDTMF} data-dtmf="2" text="2" />
	            <T.span className="btn btn-default btn-circle" onClick={this.handleDTMF} data-dtmf="3" text="3" />
	        </div>
	        <div className="col-xs-12">
	            <T.span className="btn btn-default btn-circle" onClick={this.handleDTMF} data-dtmf="4" text="4" />
	            <T.span className="btn btn-default btn-circle" onClick={this.handleDTMF} data-dtmf="5" text="5" />
	            <T.span className="btn btn-default btn-circle" onClick={this.handleDTMF} data-dtmf="6" text="6" />
	        </div>
	        <div className="col-xs-12">
	            <T.span className="btn btn-default btn-circle" onClick={this.handleDTMF} data-dtmf="7" text="7" />
	            <T.span className="btn btn-default btn-circle" onClick={this.handleDTMF} data-dtmf="8" text="8" />
	            <T.span className="btn btn-default btn-circle" onClick={this.handleDTMF} data-dtmf="9" text="9" />
	        </div>
	        <div className="col-xs-12">
	            <T.span className="btn btn-default btn-circle" onClick={this.handleDTMF} data-dtmf="*" text="*" />
	            <T.span className="btn btn-default btn-circle" onClick={this.handleDTMF} data-dtmf="0" text="0" />
	            <T.span className="btn btn-default btn-circle" onClick={this.handleDTMF} data-dtmf="#" text="#" />
	        </div>
	    </div>
		</div>;

		if (this.state.loginState) {
			state = "Online";
		} else {
			state = "Offline"
		}

		switch(this.state.callState) {
		case "Trying":
		case "Active":
		case "Early":
		case "Ringing":
			state = this.state.callState;
			break;
		default:
			break;
		}

		if (this.inCall()) {
			hangupButton = <Button bsStyle="danger" bsSize="xsmall" onClick={this.handleHangup}>
				<i className="fa fa-minus-circle" aria-hidden="true"></i>&nbsp;
				<T.span text="Hangup" />
			</Button>

			transferButton = <Button bsStyle="warning" bsSize="xsmall" onClick={this.handleTransfer}>
				<i className="fa fa-share-square-o" aria-hidden="true"></i>&nbsp;
				<T.span text="Transfer" />
			</Button>

			console.log("curCall", this.state.curCall);
			const call_params = this.state.curCall ? this.state.curCall.params : this.state.shareCall.params;

			if (call_params.destination_number) {
				callerID = <span style={{color: "lime"}}>
					{state == "Active" ? null : <T.span text="Call"/>}&nbsp;
					{call_params.destination_number}
				</span>
			} else {
				callerID = <span style={{color: "lime"}}>
					{state == "Active" ? null : <T.span text="Incoming Call"/>}&nbsp;
					{call_params.caller_id_name + " <" + call_params.caller_id_number + "> "}
				</span>
			}
		} else {
			callButton = <span>
				<input id='top_dest_number' value={this.state.destNumber} onChange={this.handleDestNumberChange}
					style={{color: "#776969", border: 0, backgroundColor: "#FFF", width: "72pt", textAlign: "right", paddingRight: "5px"}}/>
					&nbsp;&nbsp;

				<Button bsStyle="success" bsSize="xsmall" onClick={this.handleCall}>
					<i className="fa fa-phone" aria-hidden="true"></i>&nbsp;
					<T.span text="Call" />
				</Button>
			</span>
		}

		videoButton = <Button bsStyle={this.state.videoMode == "audio" ? 'warning' : (this.state.videoMode == "video" ? 'primary' : "default")} bsSize="xsmall" disabled={this.inCall() ? true : false} onClick={this.toggleVideo}>
			<i className={this.state.videoMode == "audio" ? 'fa fa-volume-up' : (
				this.state.videoMode == "video" ? 'fa fa-video-camera' : 'fa fa-desktop')} aria-hidden="true"></i>&nbsp;
			<T.span text={this.state.videoMode.replace(/\b\w/g, l => l.toUpperCase())}/>
		</Button>

		if (this.state.curCall && this.state.callState == "Ringing") {
			videoButton = null;
			toggleDTMF = null;
		}

		if (this.state.callState == "Ringing") {
			this.state.displayState = this.state.displayStyle == 'xtop' ? false : true;
			answerButton = <Button bsStyle="primary" bsSize="xsmall" onClick={this.handleAnswer}>
				<i className="fa fa-phone" aria-hidden="true"></i>&nbsp;
				<T.span text="Answer" />
			</Button>
		}

		const shareButton = !(this.inCall() && this.useVideo()) ? null :
		<Button bsStyle={this.state.shareCall ? "danger" : "primary"} bsSize="xsmall" onClick={this.handleShare}>
			<i className="fa fa-desktop" aria-hidden="true"></i>&nbsp;
		</Button>

		const tVideoButton = !(this.inCall() && this.useVideo()) ? null :
		<Button bsStyle="" bsSize="xsmall" onClick={this.handleVideoToggle}>
			<i className="fa fa-video-camera" aria-hidden="true"></i>
		</Button>

		if (this.state.displayStyle == "xtop") {
			xtopDisplay = <span>
				{callerID}&nbsp;
				{callButton}&nbsp;
				{answerButton}&nbsp;
				{hangupButton}&nbsp;
				{transferButton}&nbsp;
				{shareButton}&nbsp;
				{tVideoButton}
				&nbsp;&nbsp;
			</span>
		} else {
			xtopDisplay = <span>{callerID}&nbsp;{shareButton}</span>
		}

		if (this.inCall()) {
			callButtonDisabled = true;
		}

		if (this.state.displayStyle == "text") {
			textDisplay = <span>
				<span>188-6666-8888</span>
				&nbsp;&nbsp;
				<Button bsStyle="link" bsSize="xsmall" onClick={this.handleCall}>
					<i className="fa fa-phone" aria-hidden="true"></i>&nbsp;
					<T.span text="Answer" />
				</Button>
				<Button bsStyle="link" bsSize="xsmall" onClick={this.handleCall}>
					<i className="fa fa-minus-circle" aria-hidden="true"></i>&nbsp;
					<T.span text="Reject" />
				</Button>
				<Button bsStyle="link" bsSize="xsmall" onClick={this.handleCall}>
					<i className="fa fa-share-square-o" aria-hidden="true"></i>&nbsp;
					<T.span text="Transfer" />
				</Button>
				&nbsp;&nbsp;
			</span>
		}

		return 	<NavItem eventKey="phone">
			<div className="hgt">
			{xtopDisplay}&nbsp;
			{textDisplay}&nbsp;
			<T.span id="phone-state" className={state} text={{ key: "Phone"}} onClick={this.handleMenuClick} />
			<div id="web-phone" style={{display: this.state.displayState ? "block" : "none"}}>
				<div id="zm-phone">{verto.options.login}&nbsp;{this.state.cidname} <T.span text={this.state.callState}/></div>
				<input id="dest_number" name="dest_number" value={this.state.destNumber} onChange={this.handleDestNumberChange}/>&nbsp;&nbsp;
				<Button disabled={callButtonDisabled} bsStyle="success" bsSize="xsmall" onClick={this.handleCall}>
					<i className="fa fa-phone" aria-hidden="true"></i>&nbsp;
					<T.span text="Call" />
				</Button>
				<br/>
				{answerButton}
				{toggleDTMF}&nbsp;
				{videoButton}&nbsp;
				{hangupButton}&nbsp;
				{transferButton}
				{DTMFs}
			</div>
			</div>
		</NavItem>
	}
};

export default Phone;
