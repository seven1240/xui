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
 * verto-confman.js - Verto Conference Manager
 *
 */

'use strict';

let CONFMAN_SERNO = 0;

export default class VertoConfMan {
	constructor(verto, params) {
		this.params = Object.assign({
			dialog: null,
			hasVid: false,
			laData: null,
			onBroadcast: null,
			onLaChange: null,
			onLaRow: null
		}, params);

		this.verto = verto;
		this.serno = CONFMAN_SERNO++;
		this.canvasCount = this.params.laData.canvasCount;
		const _this = this;

		verto.subscribe(this.params.laData.modChannel, {
			handler: function(v, e) {
				if (_this.params.onBroadcast) {
					_this.params.onBroadcast(verto, _this, e.data);
				}
			}
		});

		verto.subscribe(this.params.laData.infoChannel, {
			handler: function(v, e) {
				if (typeof(_this.params.infoCallback) === "function") {
					_this.params.infoCallback(v,e);
				}
			}
		});

		verto.subscribe(this.params.laData.chatChannel, {
			handler: function(v, e) {
				if (typeof(_this.params.chatCallback) === "function") {
					_this.params.chatCallback(v,e);
				}
			}
		});

		if (this.params.laData.role === "moderator") {
			verto.subscribe(this.params.laData.modChannel, {
				handler: function(v, e) {
					console.error("MODDATA:", e.data);
					if (_this.params.onBroadcast) {
						_this.params.onBroadcast(verto, _this, e.data);
					}

					if (e.data["conf-command"] === "list-videoLayouts") {

						for (var j = 0; j < this.canvasCount; j++) {
							if (e.data.responseData) {
							}
						}
					}
				}
			});

			if (this.params.hasVid) {
				this.modCommand("list-videoLayouts", null, null);
			}
		}
		// if (this.params.laData.role === "moderator")
	}

	modCommand(cmd, id, value) {
	   this.verto.call("verto.broadcast", {
			"eventChannel": this.params.laData.modChannel,
			"data": {
				"application": "conf-control",
				"command": cmd,
				"id": id,
				"value": value
			}
		});
	}

	sendChat(message, type) {
		this.verto.call("verto.broadcast", {
			"eventChannel": this.params.laData.chatChannel,
			"data": {
				"action": "send",
				"message": message,
				"type": type
			}
		});
	}

	destroy() {
		this.destroyed = true;

		if (this.params.laData.chatChannel) {
			this.verto.unsubscribe(this.params.laData.chatChannel);
		}

		if (this.params.laData.infoChannel) {
			this.verto.unsubscribe(this.params.laData.infoChannel);
		}

		if (this.params.laData.modChannel) {
			this.verto.unsubscribe(this.params.laData.modChannel);
		}
	}

	listVideoLayouts() {
		this.modCommand("list-videoLayouts", null, null);
	}

	play(file) {
		this.modCommand("play", null, file);
	}

	stop() {
		this.modCommand("stop", null, "all");
	}

	deaf(memberID) {
		this.modCommand("deaf", parseInt(memberID));
	}

	undeaf(memberID) {
		this.modCommand("undeaf", parseInt(memberID));
	}

	record(file) {
		this.modCommand("recording", null, ["start", file]);
	}

	stopRecord() {
		this.modCommand("recording", null, ["stop", "all"]);
	}

	snapshot(file) {
		if (!this.params.hasVid) {
			throw 'Conference has no video';
		}
		this.modCommand("vid-write-png", null, file);
	}

	setVideoLayout(layout, canvasID) {
		if (!this.params.hasVid) {
			throw 'Conference has no video';
		}
		if (canvasID) {
			this.modCommand("vid-layout", null, [layout, canvasID]);
		} else {
			this.modCommand("vid-layout", null, layout);
		}
	}

	kick(memberID) {
		this.modCommand("kick", parseInt(memberID));
	}

	muteMic(memberID) {
		this.modCommand("tmute", parseInt(memberID));
	}

	muteVideo(memberID) {
		if (!this.params.hasVid) {
			throw 'Conference has no video';
		}
		this.modCommand("tvmute", parseInt(memberID));
	}

	presenter(memberID) {
		if (!this.params.hasVid) {
			throw 'Conference has no video';
		}
		this.modCommand("vid-res-id", parseInt(memberID), "presenter");
	}

	videoFloor(memberID) {
		if (!this.params.hasVid) {
			throw 'Conference has no video';
		}
		this.modCommand("vid-floor", parseInt(memberID), "force");
	}

	banner(memberID, text) {
		if (!this.params.hasVid) {
			throw 'Conference has no video';
		}
		this.modCommand("vid-banner", parseInt(memberID), escape(text));
	}

	volumeDown(memberID) {
		this.modCommand("volume_out", parseInt(memberID), "down");
	}

	volumeUp(memberID) {
		this.modCommand("volume_out", parseInt(memberID), "up");
	}

	gainDown(memberID) {
		this.modCommand("volume_in", parseInt(memberID), "down");
	}

	gainUp(memberID) {
		this.modCommand("volume_in", parseInt(memberID), "up");
	}

	transfer(memberID, exten) {
		this.modCommand("transfer", parseInt(memberID), exten);
	}
}

// window.VertoConfMan = VertoConfMan;

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
