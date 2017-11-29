'use strict';

import React from 'react';
import verto from './verto/verto';
import { Verto } from './verto/verto';

export function verto_params() {
	var protocol = window.location.protocol == "https:" ? "wss://" : "ws://";
	var username = localStorage.getItem('xui.username');
	var password = localStorage.getItem('xui.password');
	var vid_width = localStorage.getItem("phone.video.width");

	return {
		login: username + "@" + host,
		passwd: password,
		socketUrl: protocol + host + ":" + window.location.port + "/ws",
		tag: "webcam",
		ringFile: "/assets/sounds/bell_ring2.mp3",
		iceServers: [
			// { url: 'stun:[YOUR_STUN_SERVER]',}
		],
		deviceParams: {
			useMic: 'any',
			useSpeak: 'any'
		}
	}
}

export const verto_callbacks = {
	onMessage: function(verto, dialog, msg, data) {
		console.log("GOT MSG", msg);

		switch (msg) {
		case Verto.enum.message.pvtEvent:
			console.error("pvtEvent", data.pvtData);
			break;
		case Verto.enum.message.display:
			break;
		default:
			break;
		}
	},

	onDialogState: function(d) {
		fire_event("verto-dialog-state", d);
	},

	onWSLogin: function(v, success) {
		console.log("onWSLogin", v);
		console.log("onWSLogin", success);
		verto_loginState = true;
		verto.domain = domain;

		if (!success) {
			verto_loginState = false;
			fire_event("verto-login-error", v);
			verto.logout();
			return;
		}

		setCookie("freeswitch_xtra_session_id", v.sessid);

		fire_event("verto-login", v);

		verto.fsStatus(function(s) {
			// fire a "update-status" event so the OverView component can update
			fire_event("update-status", s);
		});
	},

	onWSClose: function(v, success) {
		console.log("onWSClose", v);
		fire_event("verto-disconnect", v);
	},

	onEvent: function(v, e) {
		console.debug("GOT EVENT", e);
	}
};
