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
 * verto-rtc.js - Verto RTC
 *
 */

'use strict';

// Find the line in sdpLines that starts with |prefix|, and, if specified,
// contains |substr| (case-insensitive search).
function findLine(sdpLines, prefix, substr) {
	return findLineInRange(sdpLines, 0, -1, prefix, substr);
}

// Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
// and, if specified, contains |substr| (case-insensitive search).
function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
	var realEndLine = (endLine != -1) ? endLine : sdpLines.length;
	for (var i = startLine; i < realEndLine; ++i) {
		if (sdpLines[i].indexOf(prefix) === 0) {
			if (!substr || sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
				return i;
			}
		}
	}
	return null;
}

// Gets the codec payload type from an a=rtpmap:X line.
function getCodecPayloadType(sdpLine) {
	var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
	var result = sdpLine.match(pattern);
	return (result && result.length == 2) ? result[1] : null;
}

// Returns a new m= line with the specified codec as the first one.
function setDefaultCodec(mLine, payload) {
	var elements = mLine.split(' ');
	var newLine = [];
	var index = 0;
	for (var i = 0; i < elements.length; i++) {
		if (index === 3) { // Format of media starts from the fourth.
			newLine[index++] = payload; // Put target payload to the first.
		}
		if (elements[i] !== payload) newLine[index++] = elements[i];
	}
	return newLine.join(' ');
}

function setCompat() {
}

function checkCompat() {
	return true;
}

function onStreamError(self, e) {
	console.log('There has been a problem retrieving the streams - did you allow access? Check Device Resolution', e);
	doCallback(self, "onError", e);
}

function onStreamSuccess(self, stream) {
	console.log("Stream Success");
	doCallback(self, "onStream", stream);
}

function onICE(self, candidate) {
	self.mediaData.candidate = candidate;
	self.mediaData.candidateList.push(self.mediaData.candidate);

	doCallback(self, "onICE");
}

function doCallback(self, func, arg) {
	if (func in self.options.callbacks) {
		self.options.callbacks[func](self, arg);
	}
}

function onICEComplete(self, candidate) {
	console.log("ICE Complete");
	doCallback(self, "onICEComplete");
}

function onChannelError(self, e) {
	console.error("Channel Error", e);
	doCallback(self, "onError", e);
}

function onICESDP(self, sdp) {
	self.mediaData.SDP = self.stereoHack(sdp.sdp);
	console.log("ICE SDP");
	doCallback(self, "onICESDP");
}

function onAnswerSDP(self, sdp) {
	self.answer.SDP = self.stereoHack(sdp.sdp);
	console.log("ICE ANSWER SDP");
	doCallback(self, "onAnswerSDP", self.answer.SDP);
}

function onMessage(self, msg) {
	console.log("Message");
	doCallback(self, "onICESDP", msg);
}

function FSRTCattachMediaStream(element, stream) {
	if (element && element.id && typeof attachMediaStream == 'function') {
		attachMediaStream(element, stream);
	} else {
		if (typeof element.srcObject !== 'undefined') {
			element.srcObject = stream;
		} else if (typeof element.src !== 'undefined') {
			element.src = URL.createObjectURL(stream);
		} else {
			console.error('Error attaching stream to element.');
		}
	}
}

function onRemoteStream(self, stream) {
	if (self.options.useVideo) {
		self.options.useVideo.style.display = 'block';
	}

	var element = self.options.useAudio;
	console.log("REMOTE STREAM", stream, element);

	FSRTCattachMediaStream(element, stream);

	self.options.useAudio.play();
	self.remoteStream = stream;
}

function onOfferSDP(self, sdp) {
	self.mediaData.SDP = self.stereoHack(sdp.sdp);
	console.log("Offer SDP");
	doCallback(self, "onOfferSDP");
}

function FSRTCPeerConnection(options) {
	var gathering = false, done = false;
	var config = {};
	var default_ice = {
		urls: ['stun:stun.l.google.com:19302']
	};

	if (options.iceServers) {
		if (typeof(options.iceServers) === "boolean") {
			config.iceServers = [default_ice];
		} else {
			config.iceServers = options.iceServers;
		}
	}

	var peer = new window.RTCPeerConnection(config);

	openOffererChannel();
	var x = 0;

	function ice_handler() {
		done = true;
		gathering = null;

		if (options.onICEComplete) {
			options.onICEComplete();
		}

		if (options.type == "offer") {
			options.onICESDP(peer.localDescription);
		} else {
			if (!x && options.onICESDP) {
				options.onICESDP(peer.localDescription);
			}
		}
	}

	peer.onicecandidate = function(event) {
	if (done) {
			return;
		}

		if (!gathering) {
			gathering = setTimeout(ice_handler, 1000);
		}

		if (event) {
			if (event.candidate) {
				options.onICE(event.candidate);
			}
		} else {
			done = true;

			if (gathering) {
				clearTimeout(gathering);
				gathering = null;
			}

			ice_handler();
		}
	};

	// attachStream = MediaStream;
	if (options.attachStream) peer.addStream(options.attachStream);

	// attachStreams[0] = audio-stream;
	// attachStreams[1] = video-stream;
	// attachStreams[2] = screen-capturing-stream;
	if (options.attachStreams && options.attachStream.length) {
		var streams = options.attachStreams;
		for (var i = 0; i < streams.length; i++) {
			peer.addStream(streams[i]);
		}
	}

	peer.onaddstream = function(event) {
		var remoteMediaStream = event.stream;

		// onRemoteStreamEnded(MediaStream)
		remoteMediaStream.oninactive = function () {
			if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
		};

		// onRemoteStream(MediaStream)
		if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

		//console.debug('on:add:stream', remoteMediaStream);
	};

	//var constraints = options.constraints || {
	//offerToReceiveAudio: true,
	//offerToReceiveVideo: true
	//};

	// onOfferSDP(RTCSessionDescription)
	function createOffer() {
		if (!options.onOfferSDP) return;

		peer.createOffer(function(sessionDescription) {
				sessionDescription.sdp = serializeSdp(sessionDescription.sdp);
				peer.setLocalDescription(sessionDescription);
				options.onOfferSDP(sessionDescription);
			},
			onSdpError, options.constraints
		);
	}

	// onAnswerSDP(RTCSessionDescription)
	function createAnswer() {
		if (options.type != "answer") return;

		//options.offerSDP.sdp = addStereo(options.offerSDP.sdp);
		peer.setRemoteDescription(new window.RTCSessionDescription(options.offerSDP), onSdpSuccess, onSdpError);
		peer.createAnswer(function(sessionDescription) {
			sessionDescription.sdp = serializeSdp(sessionDescription.sdp);
			peer.setLocalDescription(sessionDescription);
			if (options.onAnswerSDP) {
				options.onAnswerSDP(sessionDescription);
			}
		},
		onSdpError);
	}


	if ((options.onChannelMessage) || !options.onChannelMessage) {
		createOffer();
		createAnswer();
	}

	// DataChannel Bandwidth
	function setBandwidth(sdp) {
		// remove existing bandwidth lines
		sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
		sdp = sdp.replace(/a=mid:data\r\n/g, 'a=mid:data\r\nb=AS:1638400\r\n');

		return sdp;
	}

	// old: FF<>Chrome interoperability management
	function getInteropSDP(sdp) {
		var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
		extractedChars = '';

		function getChars() {
			extractedChars += chars[parseInt(Math.random() * 40)] || '';
			if (extractedChars.length < 40) getChars();

			return extractedChars;
		}

		// usually audio-only streaming failure occurs out of audio-specific crypto line
		// a=crypto:1 AES_CM_128_HMAC_SHA1_32 --------- kAttributeCryptoVoice
		if (options.onAnswerSDP) sdp = sdp.replace(/(a=crypto:0 AES_CM_128_HMAC_SHA1_32)(.*?)(\r\n)/g, '');

		// video-specific crypto line i.e. SHA1_80
		// a=crypto:1 AES_CM_128_HMAC_SHA1_80 --------- kAttributeCryptoVideo
		var inline = getChars() + '\r\n' + (extractedChars = '');
		sdp = sdp.indexOf('a=crypto') == -1 ? sdp.replace(/c=IN/g, 'a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:' + inline + 'c=IN') : sdp;

		return sdp;
	}

	function serializeSdp(sdp) {
		return sdp;
	}

	// DataChannel management
	var channel;

	function openOffererChannel() {
		if (!options.onChannelMessage) return;

		_openOffererChannel();

		return;
	}

	function _openOffererChannel() {
		channel = peer.createDataChannel(options.channel || 'RTCDataChannel', {
			reliable: false
		});

		setChannelEvents();
	}

	function setChannelEvents() {
		channel.onmessage = function(event) {
			if (options.onChannelMessage) options.onChannelMessage(event);
		};

		channel.onopen = function() {
			if (options.onChannelOpened) options.onChannelOpened(channel);
		};
		channel.onclose = function(event) {
			if (options.onChannelClosed) options.onChannelClosed(event);

			console.warn('WebRTC DataChannel closed', event);
		};
		channel.onerror = function(event) {
			if (options.onChannelError) options.onChannelError(event);

			console.error('WebRTC DataChannel error', event);
		};
	}

	function openAnswererChannel() {
		peer.ondatachannel = function(event) {
			channel = event.channel;
			channel.binaryType = 'blob';
			setChannelEvents();
		};

		return;
	}

	// fake:true is also available on chrome under a flag!
	function useless() {
		log('Error in fake:true');
	}

	function onSdpSuccess() {}

	function onSdpError(e) {
		if (options.onChannelError) {
			options.onChannelError(e);
		}
		console.error('sdp error:', e);
	}

	return {
		addAnswerSDP: function(sdp, cbSuccess, cbError) {

			peer.setRemoteDescription(new window.RTCSessionDescription(sdp), cbSuccess ? cbSuccess : onSdpSuccess, cbError ? cbError : onSdpError);
		},
		addICE: function(candidate) {
			peer.addIceCandidate(new window.RTCIceCandidate({
				sdpMLineIndex: candidate.sdpMLineIndex,
				candidate: candidate.candidate
			}));
		},

		peer: peer,
		channel: channel,
		sendData: function(message) {
			if (channel) {
				channel.send(message);
			}
		},

		stop: function() {
			peer.close();
			if (options.attachStream) {
				if(typeof options.attachStream.stop == 'function') {
					options.attachStream.stop();
				}
			}
		}

	};
}

// getUserMedia
var video_constraints = {
	//mandatory: {},
	//optional: []
};

function getUserMedia(options) {
	var n = navigator,
	media;
	n.getMedia = n.getUserMedia || n.mozGetUserMedia;
	n.getMedia(options.constraints || {
		audio: true,
		video: video_constraints
	},
	streaming, options.onerror ||
	function(e) {
		console.error(e);
	});

	function streaming(stream) {
		if (options.localVideo) {
			options.localVideo['src'] = window.URL.createObjectURL(stream);
	options.localVideo.style.display = 'block';
		}

		if (options.onsuccess) {
			options.onsuccess(stream);
		}

		media = stream;
	}

	return media;
}


var resList = [[160, 120], [320, 180], [320, 240], [640, 360], [640, 480], [1280, 720], [1920, 1080]];
var resI = 0;
var ttl = 0;


export default class VertoRTC {
	constructor(options) {
		this.validRes = [];

		this.options = Object.assign({
			useVideo: null,
			useStereo: false,
			userData: null,
			localVideo: null,
			screenShare: false,
			useCamera: "any",
			iceServers: false,
			videoParams: {},
			audioParams: {},
			callbacks: {
				onICEComplete: function() {},
				onICE: function() {},
				onOfferSDP: function() {}
			},
		}, options);

		this.audioEnabled = true;
		this.videoEnabled = true;

		this.mediaData = {
			SDP: null,
			profile: {},
			candidateList: []
		};

		this.constraints = {
			offerToReceiveAudio: this.options.useSpeak === "none" ? false : true,
			offerToReceiveVideo: this.options.useVideo ? true : false,
		};

		if (this.options.useVideo) {
			this.options.useVideo.style.display = 'none';
		}

		setCompat();
		checkCompat();
	}

	useVideo(obj, local) {
		if (obj) {
			this.options.useVideo = obj;
			this.options.localVideo = local;
			this.constraints.offerToReceiveVideo = true;
		} else {
			this.options.useVideo = null;
			this.options.localVideo = null;
			this.constraints.offerToReceiveVideo = false;
		}

		if (this.options.useVideo) {
			this.options.useVideo.style.display = 'none';
		}
	}

	useStereo(on) {
		var self = this;
		self.options.useStereo = on;
	}

	// Sets Opus in stereo if stereo is enabled, by adding the stereo=1 fmtp param.
	stereoHack(sdp) {
		var self = this;

		if (!self.options.useStereo) {
			return sdp;
		}

		var sdpLines = sdp.split('\r\n');

		// Find opus payload.
		var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000'), opusPayload;

		if (!opusIndex) {
			return sdp;
		} else {
			opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
		}

		// Find the payload in fmtp line.
		var fmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());

		if (fmtpLineIndex === null) {
			// create an fmtp line
			sdpLines[opusIndex] = sdpLines[opusIndex] + '\r\na=fmtp:' + opusPayload.toString() + " stereo=1; sprop-stereo=1"
		} else {
			// Append stereo=1 to fmtp line.
			sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat('; stereo=1; sprop-stereo=1');
		}

		sdp = sdpLines.join('\r\n');
		return sdp;
	}

	answer(sdp, onSuccess, onError) {
		this.peer.addAnswerSDP({
			type: "answer",
			sdp: sdp
		}, onSuccess, onError);
	}

	stopPeer() {
		if (self.peer) {
			console.log("stopping peer");
			self.peer.stop();
		}
	}

	stop() {
		var self = this;

		if (self.options.useVideo) {
			self.options.useVideo.style.display = 'none';
			self.options.useVideo['src'] = '';
		}

		if (self.localStream) {
			if(typeof self.localStream.stop == 'function') {
				self.localStream.stop();
			} else {
				if (self.localStream.active){
					var tracks = self.localStream.getTracks();
					console.log(tracks);
					tracks.forEach(function(track, index){
						console.log("stopping track", track);
						track.stop();
					});
				}
			}
			self.localStream = null;
		}

		if (self.options.localVideo) {
			self.options.localVideo.style.display = 'none';
			self.options.localVideo['src'] = '';
		}

		if (self.options.localVideoStream) {
			if(typeof self.options.localVideoStream.stop == 'function') {
				self.options.localVideoStream.stop();
			} else {
				if (self.options.localVideoStream.active) {
					var tracks = self.options.localVideoStream.getTracks();
					console.log(tracks);
					tracks.forEach(function(track, index) {
						console.log(track);
						track.stop();
					});
				}
			}
		}

		if (self.peer) {
			console.log("stopping peer");
			self.peer.stop();
		}
	}

	getMute() {
		var self = this;
		return self.audioEnabled;
	}

	setMute(what) {
		var self = this;
		var audioTracks = self.localStream.getAudioTracks();

		for (var i = 0, len = audioTracks.length; i < len; i++ ) {
			switch(what) {
			case "on":
				audioTracks[i].enabled = true;
				break;
			case "off":
				audioTracks[i].enabled = false;
				break;
			case "toggle":
				audioTracks[i].enabled = !audioTracks[i].enabled;
			default:
				break;
			}

			self.audioEnabled = audioTracks[i].enabled;
		}

		return !self.audioEnabled;
	}

	getVideoMute() {
		var self = this;
		return self.videoEnabled;
	}

	setVideoMute(what) {
		var self = this;
		var videoTracks = self.localStream.getVideoTracks();

		for (var i = 0, len = videoTracks.length; i < len; i++ ) {
			switch(what) {
			case "on":
				videoTracks[i].enabled = true;
				break;
			case "off":
				videoTracks[i].enabled = false;
				break;
			case "toggle":
				videoTracks[i].enabled = !videoTracks[i].enabled;
			default:
				break;
			}

			self.videoEnabled = videoTracks[i].enabled;
		}

		return !self.videoEnabled;
	}

	getMediaParams() {
		var audio;
		const self = this;

		if (this.options.useMic && this.options.useMic === "none") {
			console.log("Microphone Disabled");
			audio = false;
		} else if (this.options.videoParams && this.options.screenShare) {//this.options.videoParams.chromeMediaSource == 'desktop') {
			console.error("SCREEN SHARE", this.options.videoParams);
			audio = false;
		} else {
			audio = {};

			if (this.options.audioParams) {
				audio = this.options.audioParams;
			}

			if (this.options.useMic !== "any") {
				//audio.optional = [{sourceId: this.options.useMic}]
				audio.deviceId = {exact: this.options.useMic};
			}
		}

		if (this.options.useVideo && this.options.localVideo) {
			getUserMedia({
				constraints: {
					audio: false,
					video: this.options.videoParams

				},
				localVideo: this.options.localVideo,
				onsuccess: function(e) {self.options.localVideoStream = e; console.log("local video ready");},
				onerror: function(e) {console.error("local video error!");}
			});
		}

		var video = {};
		var bestFrameRate = this.options.videoParams.vertoBestFrameRate;
		var minFrameRate = this.options.videoParams.minFrameRate || 15;
		delete this.options.videoParams.vertoBestFrameRate;

		if (this.options.screenShare) {
			// fix for chrome to work for now, will need to change once we figure out how to do this in a non-mandatory style constraint.

			if (!!navigator.mozGetUserMedia) {
				var dowin = window.confirm("Do you want to share an application window?  If not you will share a screen.");

				video = {
					width: {min: this.options.videoParams.minWidth, max: this.options.videoParams.maxWidth},
					height: {min: this.options.videoParams.minHeight, max: this.options.videoParams.maxHeight},
					mediaSource: dowin ? "window" : "screen"
				}
			} else {
				var opt = [];
				opt.push({sourceId: this.options.useCamera});

				if (bestFrameRate) {
					opt.push({minFrameRate: bestFrameRate});
					opt.push({maxFrameRate: bestFrameRate});
				}

				video = {
					mandatory: this.options.videoParams,
					optional: opt
				};
			}
		} else {
			video = {
				//mandatory: this.options.videoParams,
				width: {min: this.options.videoParams.minWidth, max: this.options.videoParams.maxWidth},
				height: {min: this.options.videoParams.minHeight, max: this.options.videoParams.maxHeight}
			};

			var useVideo = this.options.useVideo;

			if (useVideo && this.options.useCamera && this.options.useCamera !== "none") {
				//if (!video.optional) {
				//video.optional = [];
				//}

				if (this.options.useCamera !== "any") {
					//video.optional.push({sourceId: obj.options.useCamera});
					video.deviceId = this.options.useCamera;
				}

				if (bestFrameRate) {
					//video.optional.push({minFrameRate: bestFrameRate});
					//video.optional.push({maxFrameRate: bestFrameRate});
					video.frameRate = {ideal: bestFrameRate, min: minFrameRate, max: 30};
				}

			} else {
				console.log("Camera Disabled");
				video = false;
				useVideo = false;
			}
		}

		return {audio: audio, video: video, useVideo: useVideo};
	}


	createAnswer(params) {
		var self = this;
		self.type = "answer";
		self.remoteSDP = params.sdp;
		console.debug("inbound sdp: ", params.sdp);

		function onSuccess(stream) {
			self.localStream = stream;

			self.peer = FSRTCPeerConnection({
				type: self.type,
				attachStream: self.localStream,
				onICE: function(candidate) {
					return onICE(self, candidate);
				},
				onICEComplete: function() {
					return onICEComplete(self);
				},
				onRemoteStream: function(stream) {
					return onRemoteStream(self, stream);
				},
				onICESDP: function(sdp) {
					return onICESDP(self, sdp);
				},
				onChannelError: function(e) {
					return onChannelError(self, e);
				},
				constraints: self.constraints,
				iceServers: self.options.iceServers,
				offerSDP: {
					type: "offer",
					sdp: self.remoteSDP
				}
			});

			onStreamSuccess(self, stream);
		}

		function onError(e) {
			onStreamError(self, e);
		}

		this.options.useCamera = params.useCamera;
		var mediaParams = this.getMediaParams();

		console.log("Audio constraints", mediaParams.audio);
		console.log("Video constraints", mediaParams.video);

		if (self.options.useVideo && self.options.localVideo) {
			getUserMedia({
				constraints: {
					audio: false,
					video: {
					// mandatory: self.options.videoParams,
					//optional: []
					},
				},
				localVideo: self.options.localVideo,
				onsuccess: function(e) {self.options.localVideoStream = e; console.log("local video ready");},
				onerror: function(e) {console.error("local video error!");}
			});
		}

		getUserMedia({
			constraints: {
				audio: mediaParams.audio,
				video: mediaParams.video
			},
			video: mediaParams.useVideo,
			onsuccess: onSuccess,
			onerror: onError
		});

	}

	stopRinger(ringer) {
		if (!ringer) return;

		if(typeof ringer.stop == 'function') {
			ringer.stop();
		} else {
			if (ringer.active){
				var tracks = ringer.getTracks();
				tracks.forEach(function(track, index){
					track.stop();
				});
			}
		}
	}

	call(profile) {
		checkCompat();

		var self = this;
		var screen = false;

		self.type = "offer";

		if (self.options.videoParams && self.options.screenShare) { //self.options.videoParams.chromeMediaSource == 'desktop') {
			screen = true;
		}

		function onSuccess(stream) {
			self.localStream = stream;

			if (screen) {
				self.constraints.offerToReceiveVideo = false;
			}

			self.peer = FSRTCPeerConnection({
				type: self.type,
				attachStream: self.localStream,
				onICE: function(candidate) {
					return onICE(self, candidate);
				},
				onICEComplete: function() {
					return onICEComplete(self);
				},
				onRemoteStream: screen ? function(stream) {} : function(stream) {
					return onRemoteStream(self, stream);
				},
				onOfferSDP: function(sdp) {
					return onOfferSDP(self, sdp);
				},
				onICESDP: function(sdp) {
					return onICESDP(self, sdp);
				},
				onChannelError: function(e) {
					return onChannelError(self, e);
				},
				constraints: self.constraints,
				iceServers: self.options.iceServers,
			});

			onStreamSuccess(self, stream);
		}

		function onError(e) {
			onStreamError(self, e);
		}

		var mediaParams = this.getMediaParams();

		console.log("Audio constraints", mediaParams.audio);
		console.log("Video constraints", mediaParams.video);

		if (mediaParams.audio || mediaParams.video) {
			getUserMedia({
				constraints: {
					audio: mediaParams.audio,
					video: mediaParams.video
				},
				video: mediaParams.useVideo,
				onsuccess: onSuccess,
				onerror: onError
			});
		} else {
			onSuccess(null);
		}
	};

	resSupported(w, h) {
		var FSRTC = this;
		for (var i in FSRTC.validRes) {
			if (FSRTC.validRes[i][0] == w && FSRTC.validRes[i][1] == h) {
				return true;
			}
		}

		return false;
	}

	bestResSupported() {
		var FSRTC = this;
		var w = 0, h = 0;

		for (var i in FSRTC.validRes) {
			if (FSRTC.validRes[i][0] >= w && FSRTC.validRes[i][1] >= h) {
				w = FSRTC.validRes[i][0];
				h = FSRTC.validRes[i][1];
			}
		}

		return [w, h];
	}

	getValidRes(cam, func) {
		var FSRTC = this;
		var used = [];
		var cached = localStorage.getItem("res_" + cam);

		if (cached) {
			var cache = JSON.parse(cached);

			if (cache) {
				FSRTC.validRes = cache.validRes;
				console.log("CACHED RES FOR CAM " + cam, cache);
			} else {
				console.error("INVALID CACHE");
			}
			return func ? func(cache) : null;
		}

		FSRTC.validRes = [];
		resI = 0;

		this.checkRes(cam, func);
	}

	checkPerms(runtime, check_audio, check_video) {
		var FSRTC = this;
		getUserMedia({
			constraints: {
				audio: check_audio,
				video: check_video,
			},
			onsuccess: function(e) {
				e.getTracks().forEach(function(track) {track.stop();});

				console.info("media perm init complete");
				if (runtime) {
					setTimeout(runtime, 100, true);
				}
			},
			onerror: function(e) {
				if (check_video && check_audio) {
					console.error("error, retesting with audio params only");
					return FSRTC.checkPerms(runtime, check_audio, false);
				}

				console.error("media perm init error");

				if (runtime) {
					runtime(false)
				}
			}
		})
	}

	checkRes(cam, func) {
		var FSRTC = this;
		if (resI >= resList.length) {
			var res = {
				'validRes': FSRTC.validRes,
				'bestResSupported': FSRTC.bestResSupported()
			};

			localStorage.setItem("res_" + cam, JSON.stringify(res));

			if (func) return func(res);
			return;
		}

		var video = {
			//mandatory: {},
			//optional: []
		}
		//FIXME
		if (cam) {
			//video.optional = [{sourceId: cam}];
			video.deviceId = {exact: cam};
		}

		const w = resList[resI][0];
		const h = resList[resI][1];
		resI++;

		video = {
			width: {exact: w},
			height: {exact: h}
			//"minWidth": w,
			//"minHeight": h,
			//"maxWidth": w,
			//"maxHeight": h
		};

		getUserMedia({
			constraints: {
				audio: ttl++ == 0,
				video: video
			},
			onsuccess: function(e) {
				e.getTracks().forEach(function(track) {track.stop();});
				console.info(w + "x" + h + " supported."); FSRTC.validRes.push([w, h]); FSRTC.checkRes(cam, func);
			},
			onerror: function(e) {console.warn( w + "x" + h + " not supported."); FSRTC.checkRes(cam, func);}
		});
	}
}

// window.VertoRTC = VertoRTC;

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
