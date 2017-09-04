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
 * Stefan Yohansson <sy.fen0@gmail.com>
 *
 * verto-utils.js - General purpose functions
 *
 */


function prngGUID() {
    // If we have a cryptographically secure PRNG, use that
    // http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
    var buf = new Uint16Array(8);
    window.crypto.getRandomValues(buf);
    var S4 = function(num) {
	var ret = num.toString(16);
	while (ret.length < 4) {
	    ret = "0" + ret;
	}
	return ret;
    };
    return (S4(buf[0]) + S4(buf[1]) + "-" + S4(buf[2]) + "-" + S4(buf[3]) + "-" + S4(buf[4]) + "-" + S4(buf[5]) + S4(buf[6]) + S4(buf[7]));
}

function randomGUID() {
    // Otherwise, just use Math.random
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	var r = Math.random() * 16 | 0,
	    v = c == 'x' ? r : (r & 0x3 | 0x8);
	return v.toString(16);
    });
}

export function generateGUID() {
    return (typeof(window.crypto) !== 'undefined' &&
	    typeof(window.crypto.getRandomValues) !== 'undefined')
	? prngGUID
	: randomGUID;
}

export function drop_bad(verto, channel) {
    console.error("drop unauthorized channel: " + channel);
    delete verto.eventSUBS[channel];
}

export function mark_ready(verto, channel) {
    for (var j in verto.eventSUBS[channel]) {
	verto.eventSUBS[channel][j].ready = true;

	console.log("subscribed to channel: " + channel);
	if (verto.eventSUBS[channel][j].readyHandler) {
	    verto.eventSUBS[channel][j].readyHandler(verto, channel);
	}
    }
}

export function ENUM(s) {
    var i = 0, o = {};
    s.split(" ").map(function(x) {
	o[x] = {
	    name: x,
	    val: i++
	};
    });
    return Object.freeze(o);
};
