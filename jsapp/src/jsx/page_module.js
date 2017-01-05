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
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Radio, Col } from 'react-bootstrap';
import { Link } from 'react-router';

class ModulePage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {edit: false, rows:[]};

		// This binding is necessary to make `this` work in the callback
		this.handleToggleParam = this.handleToggleParam.bind(this);
		this.handleSort = this.handleSort.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
	}

	handleToggleParam(e) {
		const _this = this;
		const data = e.target.getAttribute("data");

		$.ajax({
			type: "PUT",
			url: "/api/modules/" + data,
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify({action: "toggle"}),
			success: function (param) {
				console.log("success!!!!", param);
				const rows = _this.state.rows.map(function(p) {
					if (p.id == data) {
						p.disabled = param.disabled;
					}
					return p;
				});
				_this.state.rows = rows;
				_this.setState({rows: _this.state.rows});
			},
			error: function(msg) {
				console.error("toggle params", msg);
			}
		});
	}

	componentDidMount() {
		var _this = this;
		$.getJSON("/api/modules/" , "", function(data) {
			console.log(data);
			_this.setState({rows: data});
		}, function(e) {
			console.log("get module ERR");
		});
	}

	handleSort(e){
		var _this = this;
		const rows = _this.state.rows;
		if (rows[0].disabled == 0) {
			rows.sort(function(b,a){
			return a.disabled - b.disabled;
			})
		} else{
			rows.sort(function(a,b){
			return a.disabled - b.disabled;
			})
		};
		
		_this.setState({rows: rows, edit: false});
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);
		var id = e.target.getAttribute("id");
		var rows = this.state.rows;

		if (data == "load") {
			fsAPI("load", rows[id-1].k);
			console.log(rows[id-1].k);
		} else if (data == "unload") {
			fsAPI("unload", rows[id-1].k);
			console.log(rows[id-1].k);
		} else if (data == "reload") {
			fsAPI("reload", rows[id-1].k);
			console.log(rows[id-1].k);
		}
	}

	render() {
		const _this = this;
		let save_btn = "";
		let err_msg = "";

		var rows = _this.state.rows.map(function(row) {
				const disabled_class = dbfalse(row.disabled) ? "" : "disabled";

				return <tr key={row.id} className={disabled_class}>
					<td>{row.k}</td>
					<td><Button onClick={_this.handleToggleParam} data={row.id}>{dbfalse(row.disabled) ? "Yes" : "No"}</Button></td>
					<td>
						<T.a onClick={_this.handleControlClick} id={row.id} data="load" text="Load"/> |
						<T.a onClick={_this.handleControlClick} id={row.id} data="unload" text="Unload"/> |
						<T.a onClick={_this.handleControlClick} id={row.id} data="reload" text="Reload"/> |
						<span>{row.class_name}</span>
					</td>
				</tr>
			});

		return <div>
			<h2><T.span text="Modules"/></h2>
			<table className="table">
				<tbody>
				<tr>
					<th>Name</th>
					<th onClick={this.handleSort.bind(this)}>Enabled</th>
					<th><T.span text="Control"/></th>
				</tr>
				{rows}
				</tbody>
			</table>
		</div>
	}
}

export {ModulePage};
