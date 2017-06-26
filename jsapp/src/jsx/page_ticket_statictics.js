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
import verto from './verto/verto';
import { Button, Form, FormGroup, FormControl, ControlLabel, Col } from 'react-bootstrap';
import { EditControl, xFetchJSON } from './libs/xtools';

class TicketStatictics extends React.Component {
	constructor(props) {
		super(props);
		this.state = {types: [], rows: [], satisfied: [], tsn: [], tsp: [], tsd: []};
		this.toPercent = this.toPercent.bind(this);
		this.indexOf = this.indexOf.bind(this);
	}

	componentDidMount() {
		var _this = this;
		xFetchJSON("/api/dicts?realm=TICKET_TYPE").then((data) => {
			_this.setState({types: data});
		});
		xFetchJSON("/api/tickets/get_amount").then((data) => {
			_this.setState({rows: data[0], satisfied: data[1], tsn: data[2], tsp: data[3], tsd: data[4]});
		});
	}

	toPercent(data) {
		var a = parseInt(data*100);
		var b = parseInt(data * 10000 - a * 100);
		return a + '.' + b + '%';
	}

	indexOf(arr, item) {
		if(Array.prototype.indexOf) {
			return arr.indexOf(item);
		}else {
			for(var i = 0; i < arr.length; i++) {
				return (arr[i] === item) ?  i :  -1;
			}
		}
	}

	render() {
		var _this = this;
		const tsn = this.state.tsn;
		const tsp = this.state.tsp;
		const tsd = this.state.tsd;
		var types = this.state.types.map((type) => {
			return type.v;
		});
		types[5] = '总数';
		var rows = _this.state.rows.map(function(row) {
			var i = _this.indexOf(_this.state.rows, row);
			var percent = _this.state.satisfied[i] / _this.state.rows[i];
			percent = (percent >= 0) ? percent : 0;
			return <tr key={i}>
					<td>{T.translate(types[i])}</td>
					<td>{_this.state.rows[i]}</td>
					<td>{_this.toPercent(_this.state.rows[i]/_this.state.rows[5])}</td>
					<td>{_this.state.satisfied[i]}</td>
					<td>{_this.toPercent(percent)}</td>
					<td>{tsn[i]}</td>
					<td>{tsp[i]}</td>
					<td>{tsd[i]}</td>
				</tr>;
		});
		return <div>
			<h1><T.span text="Ticket Statistics"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="Ticket Type"/></th>
					<th><T.span text="Amount"/></th>
					<th><T.span text="Percentage"/></th>
					<th><T.span text="Satisfied Amount"/></th>
					<th><T.span text="Satisfied Percentage"/></th>
					<th><T.span text="TICKET_ST_NEW"/></th>
					<th><T.span text="TICKET_ST_PROCESSING"/></th>
					<th><T.span text="TICKET_ST_DONE"/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>
		</div>
	}
};

export default TicketStatictics;
