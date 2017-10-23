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
 * Mariah Yang <yangxiaojin@x-y-t.cn>
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';
import Select from 'react-select';
import { Link } from 'react-router';
import { EditControl, xFetchJSON } from './libs/xtools'

class TableBrowserPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {datalist: [],len: ""}
	}

	componentDidMount() {
		var datalist = this.state.datalist;
		xFetchJSON("/api/table_browsers/" + this.props.params.name).then((datalist) => {
			this.setState({datalist:datalist,len:datalist.length});
		})
	}

	render () {
		var tablename = this.props.params.name;
		var len = this.state.len;
		var datalist = this.state.datalist;
		var onelist = this.state.datalist[0];
		var titlelists = "";
		function titlelist(){
			for (var key in onelist) {
				titlelists += "<th>" + key + "</th>"
			}
			return {__html: titlelists};
		}
		var detaillists = "";
		function detaillist() {
			for (var i = 0; i < len; i++) {
				detaillists += "<tr>"
				for (var key in onelist ) {
					detaillists += "<td>" + datalist[i][key] + "</td>"
				}
				detaillists += "</tr>"
			}
			return {__html: detaillists}
		}
		
		return <div>
			<h2>{tablename}表</h2>
			<table className="table table-hover">
			<tbody>
				<tr dangerouslySetInnerHTML={titlelist()}/>
			</tbody>
				<tbody dangerouslySetInnerHTML={detaillist()}/>
			</table>
		</div>
	}
}

class TableBrowsersPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {params:[]};
	}

	componentDidMount(){
		var params = this.state.params;
		var len = this.state.len
		xFetchJSON("/api/table_browsers").then((tablelist) => {
			this.setState({params:tablelist});
		});
	}

	handleClick(e){
		console.log(e.target.innerHTML);
		xFetchJSON("/api/table_browsers/"+ e.target.innerHTML).then((data) => {
			console.log("data", data);
		});

	}

	render() {
		var lists = this.state.params.map(function(row, index) {
			return <tr key={index}>
					<td><Link to={`/settings/table_browsers/${row.name}`}>{row.name}</Link></td>
				</tr>
		})

		return <div>
			<h2><T.span text="Databases"/></h2>
			<table className="table table-hover">
				<tbody>
				<tr>
					<th><T.span text="Name"/></th>
				</tr>
				{lists}
				</tbody>
			</table>
		</div>
	}
}

export {TableBrowserPage, TableBrowsersPage};