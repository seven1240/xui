/*
 * Verto HTML5/Javascript Telephony Signaling and Control Protocol Stack for FreeSWITCH
 * Copyright (C) 2005-2017, Anthony Minessale II <anthm@freeswitch.org>
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
 * The Original Code is Verto HTML5/Javascript Telephony Signaling and Control Protocol Stack for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Anthony Minessale II <anthm@freeswitch.org>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Seven Du <dujinfang@x-y-t.cn>
 * Xueyun Jiang <jiangxueyun@x-y-t.cn>
 *
 * verto-dialog.js - Verto Dialog
 *
 */

'use strict';

import VertoRTC from './verto-rtc';
import { Verto } from './verto';

export default class VertoDialog {
	constructor(direction, verto, params) {
		var dialog = this;

		dialog.params = Object.assign({
			useVideo: verto.options.useVideo,
			useStereo: verto.options.useStereo,
			screenShare: false,
			useCamera: params.screenShare ? false : verto.options.deviceParams.useCamera,
			useMic: verto.options.deviceParams.useMic,
			useSpeak: verto.options.deviceParams.useSpeak,
			tag: verto.options.tag,
			localTag: verto.options.localTag,
			login: verto.options.login,
			videoParams: verto.options.videoParams
		}, params);

		dialog.verto = verto;
		dialog.direction = direction;
		dialog.lastState = null;
		dialog.state = dialog.lastState = Verto.enum.state.new;
		dialog.callbacks = verto.callbacks;
		dialog.answered = false;
		dialog.attach = params.attach || false;
		dialog.screenShare = params.screenShare || false;
		dialog.useCamera = dialog.params.useCamera;
		dialog.useMic = dialog.params.useMic;
		dialog.useSpeak = dialog.params.useSpeak;
		dialog.rtc = null;

		if (dialog.params.callID) {
			dialog.callID = dialog.params.callID;
		} else {
			dialog.callID = dialog.params.callID = verto.generateGUID();
		}

		if (typeof(dialog.params.tag) === "function") {
			dialog.params.tag = dialog.params.tag();
		}


		if (dialog.params.tag) {
			dialog.audioStream = document.getElementById(dialog.params.tag);

			if (dialog.params.useVideo) {
				dialog.videoStream = dialog.audioStream;
			}
		}

		if (dialog.params.localTag) {
			dialog.localVideo = document.getElementById(dialog.params.localTag);
		}

		dialog.verto.dialogs[dialog.callID] = dialog;

		var RTCcallbacks = {};

		if (dialog.direction == Verto.enum.direction.inbound) {
			if (dialog.params.display_direction === "outbound") {
				dialog.params.remote_caller_id_name = dialog.params.caller_id_name;
				dialog.params.remote_caller_id_number = dialog.params.caller_id_number;
			} else {
				dialog.params.remote_caller_id_name = dialog.params.callee_id_name;
				dialog.params.remote_caller_id_number = dialog.params.callee_id_number;
			}

			if (!dialog.params.remote_caller_id_name) {
				dialog.params.remote_caller_id_name = "Nobody";
			}

			if (!dialog.params.remote_caller_id_number) {
				dialog.params.remote_caller_id_number = "UNKNOWN";
			}

			RTCcallbacks.onMessage = function(rtc, msg) {
				console.debug(msg);
			};

			RTCcallbacks.onAnswerSDP = function(rtc, sdp) {
				console.error("answer sdp", sdp);
			};
		} else {
			dialog.params.remote_caller_id_name = "Outbound Call";
			dialog.params.remote_caller_id_number = dialog.params.destination_number;
		}

		RTCcallbacks.onICESDP = function(rtc) {
			console.log("RECV " + rtc.type + " SDP", rtc.mediaData.SDP);

			if (dialog.state == Verto.enum.state.requesting
				|| dialog.state == Verto.enum.state.answering
				|| dialog.state == Verto.enum.state.active) {
				location.reload();
				return;
			}

			if (rtc.type == "offer") {
				if (dialog.state == Verto.enum.state.active) {
						dialog.setState(Verto.enum.state.requesting);
					dialog.sendMethod("verto.attach", {
						sdp: rtc.mediaData.SDP
					});
				} else {
					dialog.setState(Verto.enum.state.requesting);

					dialog.sendMethod("verto.invite", {
						sdp: rtc.mediaData.SDP
					});
				}
			} else { //answer
				dialog.setState(Verto.enum.state.answering);

				dialog.sendMethod(dialog.attach ? "verto.attach" : "verto.answer", {
					sdp: dialog.rtc.mediaData.SDP
					});
			}
		};

		RTCcallbacks.onICE = function(rtc) {
			//console.log("cand", rtc.mediaData.candidate);
			if (rtc.type == "offer") {
				console.log("offer", rtc.mediaData.candidate);
				return;
			}
		};

		RTCcallbacks.onStream = function(rtc, stream) {
			if (dialog.verto.options.permissionCallback &&
				typeof dialog.verto.options.permissionCallback.onGranted === 'function'){
				dialog.verto.options.permissionCallback.onGranted(stream);
			}
			console.log("stream started");
		};

		RTCcallbacks.onError = function(e) {
			if (dialog.verto.options.permissionCallback &&
				typeof dialog.verto.options.permissionCallback.onDenied === 'function'){
				dialog.verto.options.permissionCallback.onDenied();
			}
			console.error("ERROR:", e);
			dialog.hangup({cause: "Device or Permission Error"});
		};

		dialog.rtc = new VertoRTC({
			callbacks: RTCcallbacks,
			localVideo: dialog.screenShare ? null : dialog.localVideo,
			useVideo: dialog.params.useVideo ? dialog.videoStream : null,
			useAudio: dialog.audioStream,
			useStereo: dialog.params.useStereo || false,
			videoParams: dialog.params.videoParams || {},
			audioParams: verto.options.audioParams || {},
			iceServers: verto.options.iceServers,
			screenShare: dialog.screenShare,
			useCamera: dialog.useCamera,
			useMic: dialog.useMic,
			useSpeak: dialog.useSpeak
		});

		if (dialog.direction == Verto.enum.direction.inbound) {
			if (dialog.attach) {
				dialog.answer();
			} else {
				dialog.ring();
			}
		}
	}

	invite() {
		var dialog = this;
		dialog.rtc.call();
	}

	sendMethod(method, obj) {
		var dialog = this;
		obj.dialogParams = {};

		for (var i in dialog.params) {
			if (i == "sdp" && method != "verto.invite" && method != "verto.attach") {
				continue;
			}

			if ((obj.noDialogParams && i != "callID")) {
				continue;
			}

			obj.dialogParams[i] = dialog.params[i];
		}

		delete obj.noDialogParams;

		dialog.verto.call(method, obj,
			function(e) {
				/* Success */
				dialog.processReply(method, true, e);
			},

			function(e) {
				/* Error */
				dialog.processReply(method, false, e);
			}
		);
	}

	setAudioPlaybackDevice(sinkId, callback, arg) {
		var dialog = this;
		var element = dialog.audioStream;

		if (typeof element.sinkId !== 'undefined') {
			var devname = dialog.find_name(sinkId);
			console.info("Dialog: " + dialog.callID + " Setting speaker:", element, devname);

			element.setSinkId(sinkId).then(function() {
				console.log("Dialog: " + dialog.callID + ' Success, audio output device attached: ' + sinkId);
				if (callback) {
					callback(true, devname, arg);
				}
			}).catch(function(error) {
				var errorMessage = error;
				if (error.name === 'SecurityError') {
				errorMessage = "Dialog: " + dialog.callID + ' You need to use HTTPS for selecting audio output ' +
					'device: ' + error;
				}
				if (callback) {
				callback(false, null, arg);
				}
				console.error(errorMessage);
			});
		} else {
			console.warn("Dialog: " + dialog.callID + ' Browser does not support output device selection.');
			if (callback) {
				callback(false, null, arg);
			}
		}
	}

	setState(state) {
		var dialog = this;

		if (dialog.state == Verto.enum.state.ringing) {
			dialog.stopRinging();
		}

		if (dialog.state == state || !dialog.checkStateChange(dialog.state, state)) {
			console.error("Dialog " + dialog.callID + ": INVALID state change from " + dialog.state.name + " to " + state.name);
			dialog.hangup();
			return false;
		}

		console.log("Dialog " + dialog.callID + ": state change from " + dialog.state.name + " to " + state.name);

		dialog.lastState = dialog.state;
		dialog.state = state;

		if (dialog.callbacks.onDialogState) {
			dialog.callbacks.onDialogState(this);
		}

		switch (dialog.state) {

		case Verto.enum.state.early:
		case Verto.enum.state.active:
			var speaker = dialog.useSpeak;
			console.info("Using Speaker: ", speaker);

			if (speaker && speaker !== "any" && speaker !== "none") {
				setTimeout(function() {
					dialog.setAudioPlaybackDevice(speaker);
				}, 500);
			}

			break;
		case Verto.enum.state.trying:
			setTimeout(function() {
				if (dialog.state == Verto.enum.state.trying) {
					dialog.setState(Verto.enum.state.hangup);
				}
			}, 30000);
			break;
		case Verto.enum.state.purge:
			dialog.setState(Verto.enum.state.destroy);
			break;
		case Verto.enum.state.hangup:

			if (dialog.lastState.val > Verto.enum.state.requesting.val && dialog.lastState.val < Verto.enum.state.hangup.val) {
				dialog.sendMethod("verto.bye", {});
			}

			dialog.setState(Verto.enum.state.destroy);
			break;
		case Verto.enum.state.destroy:

			if (typeof(dialog.verto.options.tag) === "function") {
			  // $('#' + dialog.params.tag).remove();
			  console.error("FIXME", "!!!!!");
			}

			delete dialog.verto.dialogs[dialog.callID];
		if (dialog.params.screenShare) {
			dialog.rtc.stopPeer();
		} else {
			dialog.rtc.stop();
		}
			break;
		}

		return true;
	}

	processReply(method, success, e) {
		var dialog = this;

		console.log("Response: " + method + " State:" + dialog.state.name, success, e);

		switch (method) {

		case "verto.answer":
		case "verto.attach":
			if (success) {
				dialog.setState(Verto.enum.state.active);
			} else {
				dialog.hangup();
			}
			break;
		case "verto.invite":
			if (success) {
				dialog.setState(Verto.enum.state.trying);
			} else {
				dialog.setState(Verto.enum.state.destroy);
			}
			break;

		case "verto.bye":
			dialog.hangup();
			break;
		case "verto.modify":
			if (e.holdState) {
				if (e.holdState == "held") {
					if (dialog.state != Verto.enum.state.held) {
						dialog.setState(Verto.enum.state.held);
					}
				} else if (e.holdState == "active") {
					if (dialog.state != Verto.enum.state.active) {
						dialog.setState(Verto.enum.state.active);
					}
				}
			}

			if (success) {}

			break;
		default:
			break;
		}
	}

	hangup(params) {
		var dialog = this;

		if (params) {
			if (params.causeCode) {
				dialog.causeCode = params.causeCode;
			}

			if (params.cause) {
				dialog.cause = params.cause;
			}
		}

		if (!dialog.cause && !dialog.causeCode) {
			dialog.cause = "NORMAL_CLEARING";
		}

		if (dialog.state.val >= Verto.enum.state.new.val && dialog.state.val < Verto.enum.state.hangup.val) {
			dialog.setState(Verto.enum.state.hangup);
		} else if (dialog.state.val < Verto.enum.state.destroy) {
			dialog.setState(Verto.enum.state.destroy);
		}
	}

	stopRinging() {
		if (this.verto.ringer) {
			this.rtc.stopRinger(this.verto.ringer);
		}
	}

	indicateRing() {
		var dialog = this;
		if (dialog.verto.ringer) {
			dialog.verto.ringer.src = dialog.verto.options.ringFile;
			dialog.verto.ringer.play();

			setTimeout(function() {
				dialog.stopRinging();
				if (dialog.state == Verto.enum.state.ringing) {
					dialog.indicateRing();
				}
			}, dialog.verto.options.ringSleep);
		}
	}

	ring() {
		var dialog = this;

		dialog.setState(Verto.enum.state.ringing);
		dialog.indicateRing();
	}

	useVideo(on) {
		var dialog = this;

		dialog.params.useVideo = on;

		if (on) {
			dialog.videoStream = dialog.audioStream;
		} else {
			dialog.videoStream = null;
		}

		dialog.rtc.useVideo(dialog.videoStream, dialog.localVideo);
	}

	setMute(what) {
		var dialog = this;
		return dialog.rtc.setMute(what);
	}

	getMute() {
		var dialog = this;
		return dialog.rtc.getMute();
	}

	setVideoMute(what) {
		var dialog = this;
		return dialog.rtc.setVideoMute(what);
	}

	$getVideoMute() {
		var dialog = this;
		return dialog.rtc.getVideoMute();
	}

	useStereo(on) {
		var dialog = this;

		dialog.params.useStereo = on;
		dialog.rtc.useStereo(on);
	}

	dtmf(digits) {
		var dialog = this;
		if (digits) {
			dialog.sendMethod("verto.info", {
				dtmf: digits
			});
		}
	}

	rtt(obj) {
		var dialog = this;
		var pobj = {};

		if (!obj) {
			return false;
		}

		pobj.code = obj.code;
		pobj.chars = obj.chars;

		if (pobj.chars || pobj.code) {
			dialog.sendMethod("verto.info", {
				txt: obj,
				noDialogParams: true
			});
		}
	}

	transfer(dest, params) {
		var dialog = this;
		if (dest) {
			dialog.sendMethod("verto.modify", {
				action: "transfer",
				destination: dest,
				params: params
			});
		}
	}

	hold(params) {
		var dialog = this;

		dialog.sendMethod("verto.modify", {
			action: "hold",
			params: params
		});
	}

	unhold(params) {
		var dialog = this;

		dialog.sendMethod("verto.modify", {
			action: "unhold",
			params: params
		});
	}

	toggleHold(params) {
		var dialog = this;

		dialog.sendMethod("verto.modify", {
			action: "toggleHold",
			params: params
		});
	};

	message(msg) {
		var dialog = this;
		var err = 0;

		msg.from = dialog.params.login;

		if (!msg.to) {
			console.error("Missing To");
			err++;
		}

		if (!msg.body) {
			console.error("Missing Body");
			err++;
		}

		if (err) {
			return false;
		}

		dialog.sendMethod("verto.info", {
			msg: msg
		});

		return true;
	};

	answer(params) {
		var dialog = this;

		if (dialog.answered) return;

		if (!params) params = {};

		params.sdp = dialog.params.sdp;

		if (params) {
			if (params.useVideo) {
				dialog.useVideo(true);
			}

			dialog.params.callee_id_name = params.callee_id_name;
			dialog.params.callee_id_number = params.callee_id_number;

			if (params.useCamera) {
				dialog.useCamera = params.useCamera;
			}

			if (params.useMic) {
				dialog.useMic = params.useMic;
			}

			if (params.useSpeak) {
				dialog.useSpeak = params.useSpeak;
			}
		}

		dialog.rtc.createAnswer(params);
		dialog.answered = true;
	};

	handleAnswer(params) {
		var dialog = this;

		dialog.gotAnswer = true;

		if (dialog.state.val >= Verto.enum.state.active.val) {
			return;
		}

		if (dialog.state.val >= Verto.enum.state.early.val) {
			dialog.setState(Verto.enum.state.active);
		} else {
			if (dialog.gotEarly) {
				console.log("Dialog " + dialog.callID + " Got answer while still establishing early media, delaying...");
			} else {
				console.log("Dialog " + dialog.callID + " Answering Channel");
				dialog.rtc.answer(params.sdp, function() {
					dialog.setState(Verto.enum.state.active);
				}, function(e) {
					console.error(e);
					dialog.hangup();
				});
				console.log("Dialog " + dialog.callID + "ANSWER SDP", params.sdp);
			}
		}


	};

	cidString(enc) {
		var dialog = this;
		var party = dialog.params.remote_caller_id_name + (enc ? " &lt;" : " <") + dialog.params.remote_caller_id_number + (enc ? "&gt;" : ">");
		return party;
	};

	sendMessage(msg, params) {
		var dialog = this;

		if (dialog.callbacks.onMessage) {
			dialog.callbacks.onMessage(dialog.verto, dialog, msg, params);
		}
	};

	handleInfo(params) {
		var dialog = this;

		dialog.sendMessage(Verto.enum.message.info, params);

	};

	handleDisplay(params) {
		var dialog = this;

		if (params.display_name) {
			dialog.params.remote_caller_id_name = params.display_name;
		}
		if (params.display_number) {
			dialog.params.remote_caller_id_number = params.display_number;
		}

		dialog.sendMessage(Verto.enum.message.display, {});
	};

	handleMedia(params) {
		var dialog = this;

		if (dialog.state.val >= Verto.enum.state.early.val) {
			return;
		}

		dialog.gotEarly = true;

		dialog.rtc.answer(params.sdp, function() {
			console.log("Dialog " + dialog.callID + "Establishing early media");
			dialog.setState(Verto.enum.state.early);

			if (dialog.gotAnswer) {
				console.log("Dialog " + dialog.callID + "Answering Channel");
				dialog.setState(Verto.enum.state.active);
			}
		}, function(e) {
			console.error(e);
			dialog.hangup();
		});
		console.log("Dialog " + dialog.callID + "EARLY SDP", params.sdp);
	}

	checkStateChange(oldS, newS) {
		var dialog = this;
		var verto = dialog.verto;

		if (newS == Verto.enum.state.purge || Verto.enum.states[oldS.name][newS.name]) {
			return true;
		}

		return false;
	}

	find_name(id) {
		for (var i in this.verto.audioOutDevices) {
			var source = this.verto.audioOutDevices[i];
			if (source.id === id) {
				return(source.label);
			}
		}

		return id;
	}
}

/* For Emacs:
 * Local Variables:
 * mode:c
 * indent-tabs-mode:t
 * tab-width:4
 * c-basic-offset:4
 * End:
 * For VIM:
 * vim:set softtabstop=4 shiftwidth=4 tabstop=4 noet:
 */
