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
 * phone.js - The Verto Phone
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { NavItem,  Button } from 'react-bootstrap';


var Phone = React.createClass({
	getInitialState: function() {
		return {
			displayState: false,
			loginState: false,
			callState: "Idle",
			curCall: null,
			cidName: "Anonymouse",
			cidNum: "000000",
			dtmfVisible: false,
			useVideo: false,
			destNumber: '',

			displayStyle: null
		};
	},

	handleMenuClick: function() {
		this.setState({displayState: !this.state.displayState});
	},

	handleVertoLogin: function() {
		this.setState({loginState: true});
	},

	handleVertoDisconnect: function() {
		this.setState({loginState: false});
	},

	handleVertoDialogState: function(e) {
		var d = e.detail;

		switch (d.state) {
		case $.verto.enum.state.ringing:
			this.setState({
				curCall: d,
				callState: "Ringing",
				cidNum: d.params.caller_id_number
			});
			break;
		case $.verto.enum.state.trying:
			this.setState({
				curCall: d,
				callState: "Trying"
			});
			break;
		case $.verto.enum.state.early:
			this.setState({
				curCall: d,
				callState: "Early"
			});
			break;
		case $.verto.enum.state.active:
			this.setState({
				curCall: d,
				callState: "Active",
				cidName: d.cidString()
			});
			break;
		case $.verto.enum.state.hangup:
			this.setState({
				curCall: d,
				callState: "Idle",
				hangupCause: d.cause
			});
			break;
		case $.verto.enum.state.destroy:
			this.setState({
				curCall: null,
				callState: "Idle",
				hangupCause: null
			});
			break;
		case $.verto.enum.state.held:
			break;
		default:
		}
	},

	handleDestNumberChange: function(e) {
		this.setState({destNumber: e.target.value});
	},

	handleCall: function() {
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

		localStorage.setItem("phone.destNumber", $('#dest_number').val());

		this.setState({callState: "Trying"});

		let useVideo = this.state.useVideo;

		verto.newCall({
			destination_number: $('#dest_number').val(),
			caller_id_name: '0000',
			caller_id_number: '0000',
			useVideo: useVideo,
			useStereo: true,
			deviceParams: {
				useMic: 'any',
				useSpeak: 'any',
				useVideo: 'any'
			}
		});
	},

	handleHangup: function() {
		this.state.curCall.hangup();
	},

	handleAnswer: function() {
		this.state.curCall.answer();
	},

	handleDTMF: function(e) {
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
	},

	toggleVideo:function() {
		this.setState({useVideo: !this.state.useVideo});
	},

	componentDidMount: function() {
		window.addEventListener("verto-login", this.handleVertoLogin);
		window.addEventListener("verto-disconnect", this.handleVertoDisconnect);
		window.addEventListener("verto-dialog-state", this.handleVertoDialogState);

		if (verto_loginState) this.handleVertoLogin();

		this.setState({
			displayStyle: localStorage.getItem('phone.displayStyle'),
			destNumber: localStorage.getItem('phone.destNumber') || ''
		});

		// hack ringer
		verto.ringer = $('#webcam');
	},

	componentWillUnmount: function() {
		window.removeEventListener("verto-login", this.handleVertoLogin);
		window.removeEventListener("verto-disconnect", this.handleVertoDisconnect);
		window.removeEventListener("verto-dialog-state", this.handleVertoDialogState);
	},

	render: function() {
		var state;
		var hangupButton = null;
		var transferButton = null;
		var answerButton = null;
		var toggleDTMF = <Button bsStyle="info" bsSize="xsmall">
			<i className="fa fa-tty" aria-hidden="true"></i>&nbsp;
			<T.span onClick={this.handleDTMF} text= "DTMF" /></Button>;
		var audioOrVideo = null;
		var xtopDisplay = null;
		var textDisplay = null;

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

		if (this.state.curCall) {
			hangupButton = <Button bsStyle="danger" bsSize="xsmall">
				<i className="fa fa-minus-circle" aria-hidden="true"></i>&nbsp;
				<T.span onClick={this.handleHangup} text="Hangup" />
			</Button>
		}

		if (this.state.curCall) {
			transferButton = <Button bsStyle="warning" bsSize="xsmall">
				<i className="fa fa-share-square-o" aria-hidden="true"></i>&nbsp;
				<T.span onClick={this.handleTransfer} text="Transfer" />
			</Button>
		}

		audioOrVideo = <Button bsStyle={this.state.useVideo ? 'warning' : 'primary'} bsSize="xsmall" disabled={this.state.curCall ? true : false}>
			<i className={this.state.useVideo ? 'fa fa-video-camera' : 'fa fa-volume-up'} aria-hidden="true"></i>&nbsp;
			<T.span text={this.state.useVideo ? 'Video' : 'Audio'} onClick={this.state.curCall ? null: this.toggleVideo}/>
		</Button>

		if (this.state.callState == "Ringing") {
			$('#web-phone').css('display', 'block');
			answerButton = <button onClick={this.handleAnswer}>Answer</button>
		}

		if (this.state.displayStyle == "xtop") {
			xtopDisplay = <span>
				<input id='top_dest_number' value={this.state.destNumber} onChange={this.handleDestNumberChange}
					style={{color: "#776969", border: 0, backgroundColor: "#FFF", width: "80pt", textAlign: "right"}}/>
				&nbsp;&nbsp;
				<Button bsStyle="success" bsSize="xsmall">
					<i className="fa fa-phone" aria-hidden="true"></i>&nbsp;
					<T.span onClick={this.handleCall} text="Call" />
				</Button>&nbsp;
				{hangupButton}&nbsp;
				{transferButton}
				&nbsp;&nbsp;
			</span>
		}

		if (this.state.displayStyle == "text") {
			textDisplay = <span>
				<span>188-6666-8888</span>
				&nbsp;&nbsp;
				<Button bsStyle="link" bsSize="xsmall">
					<i className="fa fa-phone" aria-hidden="true"></i>&nbsp;
					<T.span onClick={this.handleCall} text="Answer" />
				</Button>
				<Button bsStyle="link" bsSize="xsmall">
					<i className="fa fa-minus-circle" aria-hidden="true"></i>&nbsp;
					<T.span onClick={this.handleCall} text="Reject" />
				</Button>
				<Button bsStyle="link" bsSize="xsmall">
					<i className="fa fa-share-square-o" aria-hidden="true"></i>&nbsp;
					<T.span onClick={this.handleCall} text="Transfer" />
				</Button>
				&nbsp;&nbsp;
			</span>
		}

		return 	<NavItem eventKey="phone">
			<div className="hgt">
			{xtopDisplay}
			{textDisplay}
			<T.span id="phone-state" className={state} text={{ key: "Phone"}} onClick={this.handleMenuClick} />
			<div id="web-phone" style={{display: this.state.displayState ? "block" : "none"}}>
				<div id="zm-phone">{verto.options.login}&nbsp;{this.state.cidname} <T.span text={this.state.callState}/></div>
				<input id="dest_number" name="dest_number" value={this.state.destNumber} onChange={this.handleDestNumberChange}/>&nbsp;&nbsp;
				<Button bsStyle="success" bsSize="xsmall">
					<i className="fa fa-phone" aria-hidden="true"></i>&nbsp;
					<T.span onClick={this.handleCall} text="Call" />
				</Button>
				<br/>
				{answerButton}
				{toggleDTMF}&nbsp;
				{audioOrVideo}&nbsp;
				{hangupButton}&nbsp;
				{transferButton}
				{DTMFs}
			</div>
			</div>
		</NavItem>
	}

});

export default Phone;
