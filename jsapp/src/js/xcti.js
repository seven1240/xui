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

// globals
var verto = window.verto;
var verto_loginState = false;
var host = window.location.hostname;
var domain = localStorage.getItem('xui.domain');
var LANGUAGES = {}

if (!domain) domain = host;

(function () {
  if (typeof window.CustomEvent === "function" ) {
  	return false;
  } 
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();

function makeCall(dest_number, options)
{
	verto.sendMethod("jsapi", {
		command: "cti",
		data: {
			method: "makeCall",
			dest_number: dest_number,
			from_number: options.from_number,
			cid_number: options.cid_number
		}
	});
}

function fire_event(event_name, detail, bubbles)
{
	var customEvent = new CustomEvent(event_name,  {
		detail: detail,
		bubbles: bubbles ? bubbles : false
	});

	window.dispatchEvent(customEvent);
}

function jsjson()
{
	verto.sendMethod("jsapi", {
		command: "jsjson",
		data: {
			path: "jsjson/test.js",
			t1: "t1",
			t2: "t2"
		}
	});
}

function lua(dest_number, options)
{
	verto.sendMethod("jsapi", {
		command: "lua",
		data: {
			method: "test",
			func: "test",
			dest_number: dest_number
		}
	});
}

function lua2(dest_number, options)
{
	verto.sendMethod("jsapi", {
		command: "lua",
		data: {
			method: "test",
			func: "test",
			dest_number: dest_number,
			data: {
				a: "aaaa",
				b: "bbbb"
			}
		}
	});
}

function form2json(selector) {
	if (selector.substring(0, 1) == '#') selector = selector.substring(1);

	var formElements = document.getElementById(selector).elements;
	var obj = {};

	for (var i=0, len= formElements.length; i<len; i++) {
		if (formElements[i].type == "submit") continue;

		if (formElements[i].name) {
			if (formElements[i].type == "radio") {
				obj[formElements[i].name] = formElements[formElements[i].name].value;
			} else {
				if (formElements[i].type == "checkbox" && !formElements[i].checked) {
					continue;
				}
				obj[formElements[i].name] = formElements[i].value;
			}
		}
	}
    return obj;
}

function current_lang()
{
	var lang = localStorage.getItem("xui.lang");
	if (!lang) lang = window.navigator.userLanguage || window.navigator.language;
	if (!lang) lang = "en"
	return lang;
}

function detect_language()
{
	var lang = current_lang();
	var lang_map = LANGUAGES[lang];

	if (!lang_map && lang.length > 2) {
		lang_map = LANGUAGES[lang.substring(0,2)];
	}

	return lang_map;
}

function dbtrue(s)
{
	return s ? (s == "true" || s == "1") : false;
}

function dbfalse(s)
{
	return s ? (s == "false" || s == "0") : true;
}

function notify(msg, level, timeout)
{
	var m = {};
	m.msg = msg;
	if (level) m.level = level;
	if (timeout) m.timeout = timeout;

	fire_event('notification', m);
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, seconds) {
	if (!seconds) seconds = '8 * 60 * 60';
    var d = new Date();
    d.setTime(d.getTime() + (seconds * 1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function xdatetime(dt) {
	if (!dt) return null;

	function pad(number) {
		var r = String(number);
		if ( r.length === 1 ) {
			r = '0' + r;
		}
		return r;
	}

	let date = new Date(dt * 1000);

	return date.getUTCFullYear()
		+ '-' + pad(date.getUTCMonth() + 1)
		+ '-' + pad(date.getUTCDate())
		+ ' ' + pad(date.getUTCHours())
		+ ':' + pad(date.getUTCMinutes())
		+ ':' + pad(date.getUTCSeconds());
}

Date.prototype.Format = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		"S": this.getMilliseconds()
	};

	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));

	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	}
	return fmt;
}

function currentDateTime () {
	return new Date().Format("yyyy-MM-dd hh:mm:ss");
}

function currentDate () {
	return new Date().Format("yyyy-MM-dd hh:mm:ss");
}

function currentTime () {
	return new Date().Format("hh:mm:ss");
}

function isArray(obj) {
	if(Array.isArray){
		return Array.isArray(obj);
	}else{
		return Object.prototype.toString.call(obj) === "[object Array]";
	}
}

function isObject(obj) {
	return Object.prototype.toString.call(obj) === "[object Object]";
}

function isString(obj) {
	return Object.prototype.toString.call(obj) === "[object String]";
}

function agoraCall(destNumber, options) {
	var key = options && options.key ? options.key : "key";
	var channel = options && options.channel ? options.channel : destNumber;

	verto.fsAPI("agora", "call " + key + " " + channel + " " + destNumber);
}

function isAdmin () {
	const user = localStorage.getItem("xui.username")
	// return user == "admin";
	return true;
}
