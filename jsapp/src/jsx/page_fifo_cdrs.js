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
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col, Pagination } from 'react-bootstrap';
import { Link } from 'react-router';
import { EditControl, xFetchJSON } from './libs/xtools';

class FifoCDRPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {media_file: null};
	}

	fetch_media_file(cdr) {
		const _this = this;

		if (cdr && cdr.media_file_id) {
			xFetchJSON("/api/media_files/" + cdr.media_file_id).then((data) => {
				this.setState({media_file: data});
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.show && nextProps.cdr) {
			this.fetch_media_file(nextProps.cdr);
		}
	}

	componentDidMount() {
		this.fetch_media_file(this.props.cdr);
	}

	render() {
		const _this = this;
		const src = this.state.media_file ? "/recordings/" + this.state.media_file.rel_path : null;
		const fifocdr = this.props.cdr;
		const props = Object.assign({}, this.props);
		delete props.cdr;

		return !fifocdr ? null : <Modal  {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg">
				   <T.span text="FIFO CDR"/><small>{fifocdr.channel_uuid}</small>
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form horizontal id="FIFOCDRForm">
					<input type="hidden" name="id" defaultValue={fifocdr.channel_uuid}/>
					<FormGroup controlId="formCaller_id_name">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Record"/></Col>
						<Col sm={10}><audio src={src} controls="controls" /></Col>
					</FormGroup>
					<FormGroup controlId="formUUID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="UUID"/></Col>
						<Col sm={10}><EditControl edit={this.state.edit} name="channel_uuid" defaultValue={fifocdr.channel_uuid}/></Col>
					</FormGroup>
					<FormGroup controlId="formFIFOName">
						<Col componentClass={ControlLabel} sm={2}><T.span text="FIFO Name"/></Col>
						<Col sm={10}><EditControl edit={this.state.edit} name="channel_uuid" defaultValue={fifocdr.fifo_name}/></Col>
					</FormGroup>

					<FormGroup controlId="formCID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number"/></Col>
						<Col sm={10}><EditControl edit={this.state.edit} name="channel_uuid" defaultValue={fifocdr.ani}/></Col>
					</FormGroup>

					<FormGroup controlId="formDest">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Dest Number"/></Col>
						<Col sm={10}><EditControl edit={this.state.edit} name="channel_uuid" defaultValue={fifocdr.dest_number}/></Col>
					</FormGroup>

					<FormGroup controlId="formBridged">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Bridged Number"/></Col>
						<Col sm={10}><EditControl edit={this.state.edit} name="channel_uuid" defaultValue={fifocdr.bridged_number}/></Col>
					</FormGroup>

					<FormGroup controlId="formStart">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Start"/></Col>
						<Col sm={10}><EditControl edit={this.state.edit} name="channel_uuid" defaultValue={fifocdr.start_epoch}/></Col>
					</FormGroup>

					<FormGroup controlId="formAnswer">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Answer"/></Col>
						<Col sm={10}><EditControl edit={this.state.edit} name="channel_uuid" defaultValue={fifocdr.bridge_epoch}/></Col>
					</FormGroup>

					<FormGroup controlId="formEnd">
						<Col componentClass={ControlLabel} sm={2}><T.span text="End"/></Col>
						<Col sm={10}><EditControl edit={this.state.edit} name="channel_uuid" defaultValue={fifocdr.end_epoch}/></Col>
					</FormGroup>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>
					<i className="fa fa-times" aria-hidden="true"></i>&nbsp;
					<T.span text="Close" />
				</Button>
			</Modal.Footer>
		</Modal>;
	}
}

class FifoCDRsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			rows: [],
			hiddendiv: 'none',
			formShow: false,
			cur_cdr: null,
			loaded: false,
			curPage: 1,
			rowCount: 0,
			pageCount: 0

		};
		this.handleMore = this.handleMore.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
		this.handleQuery = this.handleQuery.bind(this);
		this.handleFindMissed = this.handleFindMissed.bind(this);
		this.handlePageTurn = this.handlePageTurn.bind(this);
	}

	handleControlClick (e) {
		console.log("clicked", e.target);
	}

	handleMore (e) {
		e.preventDefault();
		this.setState({hiddendiv: this.state.hiddendiv == 'none' ? 'block' : 'none'});
	}

	handleSearch (e) {
		const _this = this;
		const qs = "startDate=" + this.startDate.value +
			"&endDate=" + this.endDate.value +
			"&ani=" + this.ani.value +
			"&dest_number=" + this.dest_number.value +
			"&bridged_number=" + this.bridged_number.value;

		xFetchJSON("/api/fifo_cdrs?" + qs).then((fifocdrs) => {
			_this.setState({
				rows: fifocdrs.data,
				pageCount: fifocdrs.pageCount, 
				rowCount: fifocdrs.rowCount,
				curPage: fifocdrs.curPage
			});
		});
	}

	componentDidMount () {
		const _this = this;

		xFetchJSON("/api/fifo_cdrs").then((fifocdrs) => {
			_this.setState({
				rows: fifocdrs.data,
				loaded : true,
				pageCount: fifocdrs.pageCount, 
				rowCount: fifocdrs.rowCount,
				curPage: fifocdrs.curPage
			});
		});
	}

	handleQuery (e) {
		var _this = this;
		var data = parseInt(e.target.getAttribute("data"));
		this.days = data;

		e.preventDefault();

		xFetchJSON("/api/fifo_cdrs?last=" + data).then((fifocdrs) => {
			_this.setState({
				rows: fifocdrs.data,
				pageCount: fifocdrs.pageCount, 
				rowCount: fifocdrs.rowCount,
				curPage: fifocdrs.curPage
			});
		});
	}

	handleFindMissed (e) {
		var _this = this;

		e.preventDefault();

		xFetchJSON("/api/fifo_cdrs?missed=" + 1).then((fifocdrs) => {
			_this.setState({
				rows: fifocdrs.data,
				pageCount: fifocdrs.pageCount, 
				rowCount: fifocdrs.rowCount,
				curPage: fifocdrs.curPage
			});
		});
	}

	handleSortClick(bridged_number) {
		var rows = this.state.rows;

		var n = 1;

		if (this.state.order == 'ASC') {
			this.state.order = 'DSC';
			n = -1;
		} else {
			this.state.order = 'ASC';
		}

		rows.sort(function(a,b) {
			return a[bridged_number] < b[bridged_number] ? -1 * n : 1 * n;
		});

		this.setState({rows: rows});
	}

	handlePageTurn (pageNum) {
		var qs = "";

		if (this.state.hiddendiv == "block") {
			qs = "startDate=" + this.startDate.value +
				"&endDate=" + this.endDate.value +
				"&ani=" + this.ani.value +
				"&dest_number=" + this.dest_number.value +
				"&bridged_number=" + this.bridged_number.value;
		} else {
			qs = "last=" + this.days;
		}

		qs = qs + "&pageNum=" + pageNum;

		xFetchJSON("/api/fifo_cdrs?" + qs).then((fifocdrs) => {
			this.setState({
				rows: fifocdrs.data,
				pageCount: fifocdrs.pageCount, 
				rowCount: fifocdrs.rowCount,
				curPage: fifocdrs.curPage
			});
		});
	}

	render () {
		var _this = this;
		let isShow;
		var rows = _this.state.rows.map(function(row) {
			return <tr key={row.id}>
				<td><a onClick={()=>{_this.setState({formShow: true, cur_cdr: row})}} style={{cursor: "pointer"}}>{row.channel_uuid}</a></td>
				<td>{row.fifo_name}</td>
				<td>{row.ani}</td>
				<td>{row.dest_number}</td>
				<td>{row.bridged_number}</td>
				<td>{row.start_epoch}</td>
				<td>{row.bridge_epoch}</td>
				<td>{row.end_epoch}</td>
			</tr>
		});

		if(this.state.loaded){
			isShow = "none";
		}
		const loadSpinner = {
			width : "200px",
			height : "200px",
			margin : "auto", 
			clear : "both",
			display : "block",
			color : 'gray',
			display : isShow
		}

		var now = new Date();
		var nowdate = Date.parse(now);
		var sevenDaysBeforenowtime = nowdate - 7*24*60*60*1000;
		var sevenDaysBeforenowdate = new Date(sevenDaysBeforenowtime);
		let formClose = () => this.setState({ formShow: false });

		let pagination = function() {
			let maxButtons = 7;
			if (_this.state.pageCount == 0) return <div></div>

			if (maxButtons > _this.state.pageCount) maxButtons = _this.state.pageCount;

			return (
				<nav className="pull-right">
					<Pagination
						prev={T.translate("Prev Page")}
						next={T.translate("Next Page")}
						first={T.translate("First Page")}
						last={T.translate("Last Page")}
						ellipsis={false}
						items={_this.state.pageCount}
						maxButtons={maxButtons}
						activePage={_this.state.curPage}
						onSelect={_this.handlePageTurn} />
				</nav>
			);
		}();

		function getTime(time){
			var month = (time.getMonth() + 1);
			var day = time.getDate();
			if (month < 10)
				month = "0" + month;
			if (day < 10) 
			day = "0" + day;
			return time.getFullYear() + '-' + month + '-' + day;
		}

		var today = getTime(now);
		var sevenDaysBeforeToday = getTime(sevenDaysBeforenowdate);

		return <div>
			<ButtonToolbar className="pull-right">
				<T.a onClick={this.handleFindMissed} text="Missed" style={{color: 'red'}} href="#"/> &nbsp;
				<T.span text="Last"/> &nbsp;
				<T.a onClick={this.handleQuery} text={{key:"days", day: 7}} data="7" href="#"/>&nbsp;|&nbsp;
				<T.a onClick={this.handleQuery} text={{key:"days", day: 15}} data="15" href="#"/>&nbsp;|&nbsp;
				<T.a onClick={this.handleQuery} text={{key:"days", day: 30}} data="30" href="#"/>&nbsp;|&nbsp;
				<T.a onClick={this.handleQuery} text={{key:"days", day: 60}} data="60" href="#"/>&nbsp;|&nbsp;
				<T.a onClick={this.handleQuery} text={{key:"days", day: 90}} data="90" href="#"/>&nbsp;|&nbsp;
				<T.a onClick={this.handleMore} text="More" data="more" href="#"/>...
			</ButtonToolbar>			

			<h1><T.span text="FIFO CDRs"/></h1>
			<div>
				<div style={{padding: "5px", display: _this.state.hiddendiv}} className="pull-right">
					<input type="date" defaultValue={sevenDaysBeforeToday} ref={(input) => { _this.startDate = input; }}/> -&nbsp;
					<input type="date" defaultValue={today} ref={(input) => { _this.endDate = input; }}/> &nbsp;
					<T.span text="CID Number"/><input ref={(input) => { _this.ani = input; }}/> &nbsp;
					<T.span text="Dest Number"/><input ref={(input) => { _this.dest_number = input; }}/> &nbsp;
					<T.span text="Bridged Number"/><input ref={(input) => { _this.bridged_number = input; }}/> &nbsp;
					<T.button text="Search" onClick={this.handleSearch}/>
				</div>

				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="UUID"/></th>
					<th><T.span text="FIFO Name"/></th>
					<th><T.span text="CID Number"/></th>
					<th><T.span text="Dest Number"/></th>
					<th><T.span text="Bridged Number" onClick={() => this.handleSortClick("bridged_number")} className="cursor-hand"/></th>
					<th><T.span text="Start"/></th>
					<th><T.span text="Answer"/></th>
					<th><T.span text="End"/></th>
				</tr>
				{rows}
				<tr>
					<td colSpan="12">
						{pagination}
					</td>
				</tr>
				</tbody>
				</table>
			</div>
			{
				!this.state.cur_cdr ? null :
				<FifoCDRPage show={this.state.formShow} onHide={formClose} cdr={_this.state.cur_cdr} />
			}
			<div style={{textAlign: "center"}}>
				<img style={loadSpinner} src="assets/img/loading.gif"/>
			</div>	
		</div>
	}
};

export {FifoCDRsPage, FifoCDRPage};
