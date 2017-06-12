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
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Radio, Checkbox, Col } from 'react-bootstrap';
import 'whatwg-fetch';

class EditControl extends FormControl {
	constructor(props) {
		super(props);
	}

	render() {
		const props = Object.assign({}, this.props);
		let text = props.text;
		delete props.edit;
		delete props.text;

		if (this.props.edit) {
			if (this.props.componentClass == "select") {
				const options = props.options;
				delete props.options;
				// delete props.defaultValue;

				let options_tag = options.map(function(opt) {
					return <option key={opt[0]} value={opt[0]}><T.span text={opt[1]}/></option>
				});

				return <FormControl {...props}>{options_tag}</FormControl>
			} else if (this.props.componentClass == "checkbox") {
				delete this.props.componentClass;
				return <Checkbox {...props} />
			} else {
				return <FormControl {...props} />
			}
		}

		if (this.props.componentClass == "textarea") {
			return <pre>{props.defaultValue}</pre>
		}

		if (this.props.type == "password") {
			text = "**********";
		}

		return <FormControl.Static><T.span text={text ? text : props.defaultValue}/></FormControl.Static>
	}

}

function xFetch(path, options) {
	if (!options) options = {};

	options = Object.assign({credentials: 'include'}, options);

	return fetch(path, options);
}

function xFetchJSON(path, options) {
	if (!options) options = {};

	options = Object.assign({credentials: 'include'}, options);

	if (!options.headers && options.body && (
		options.method == 'POST' ||
		options.method == 'PUT'  ||
		options.method == 'PATCH'||
		options.method == 'DELETE' )) { // default body to JSON
		options.headers = {"Content-Type": "application/json"};
	}

	return fetch(path, options).then((response) => {
		if (response.status < 200 || response.status > 299) {
			return Promise.reject('[' + response.status + '] ' + response.statusText)
		}

		return response.json();
	});
}

if (!window.jQuery) {

	/* fake jQuery */
	window.jQuery = window.$ = {};

	$.ajax = function(options) {
		options.method = options.type;
		options.body = options.data;
		options.headers = {"Content-Type": "application/json"};

		xFetchJSON(options.url, options).then((data) => {
			options.success(data);
		}).catch((e) => {
			if (options.error) options.error(e);
		});
	}

	$.getJSON = function(url, cb, cb1) {
		xFetchJSON(url).then((data) => {
			if (typeof(cb) == "function") {
				cb(data);
			} else if (typeof(cb1) == "function") {
				cb1(data);
			}
		});
	}

	$.get = $.getJSON;
}

export {EditControl, xFetch, xFetchJSON};
