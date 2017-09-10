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

class MemberPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
	}

	render() {
		const member = this.props.member;
		const props = Object.assign({}, this.props);
		delete(props.member)

		if (!member) return null;

		return <Modal  {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg">
				   <T.span text="Member"/>&nbsp;<small>{member.caller_id_number} {member.caller_id_name}</small>
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form horizontal id="ConfCDRForm">
					<FormGroup controlId="formCIDName">
						<Col componentClass={ControlLabel} sm={2}><T.span text="CID Name"/></Col>
						<Col sm={10}><FormControl.Static>{member.caller_id_name} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formCIDNumber">
						<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number"/></Col>
						<Col sm={10}><FormControl.Static>{member.caller_id_number} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formCEIDNumber">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Callee ID Number"/></Col>
						<Col sm={10}><FormControl.Static>{member.callee_id_number} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formCEIDNumber">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Callee ID Name"/></Col>
						<Col sm={10}><FormControl.Static>{member.callee_id_name} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formJoinedAt">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Joined At"/></Col>
						<Col sm={10}><FormControl.Static>{member.joined_at} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formLeftAt">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Left At"/></Col>
						<Col sm={10}><FormControl.Static>{member.left_at} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formANI">
						<Col componentClass={ControlLabel} sm={2}><T.span text="ANI"/></Col>
						<Col sm={10}><FormControl.Static>{member.ani} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formANIII">
						<Col componentClass={ControlLabel} sm={2}><T.span text="ANIII"/></Col>
						<Col sm={10}><FormControl.Static>{member.aniii} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formRNDIS">
						<Col componentClass={ControlLabel} sm={2}><T.span text="RNDIS"/></Col>
						<Col sm={10}><FormControl.Static>{member.rdnis} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formNetworkAddr">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Network Addr"/></Col>
						<Col sm={10}><FormControl.Static>{member.network_addr} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formDestNumber">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Dest Number"/></Col>
						<Col sm={10}><FormControl.Static>{member.destination_number} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formUUID">
						<Col componentClass={ControlLabel} sm={2}><T.span text="UUID"/></Col>
						<Col sm={10}><FormControl.Static>{member.uuid} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formUsername">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Username"/></Col>
						<Col sm={10}><FormControl.Static>{member.username} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formSource">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Source"/></Col>
						<Col sm={10}><FormControl.Static>{member.source} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formChannelName">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Channel Name"/></Col>
						<Col sm={10}><FormControl.Static>{member.chan_name} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formDialplan">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Dialplan"/></Col>
						<Col sm={10}><FormControl.Static>{member.dialplan} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formContext">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Context"/></Col>
						<Col sm={10}><FormControl.Static>{member.context} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formModrator">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Moderator"/> ?</Col>
						<Col sm={10}><FormControl.Static>{member.is_moderator} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formEndConf">
						<Col componentClass={ControlLabel} sm={2}><T.span text="End Conference"/> ?</Col>
						<Col sm={10}><FormControl.Static>{member.end_conference} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formKicked">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Kicked"/> ?</Col>
						<Col sm={10}><FormControl.Static>{member.was_kicked} </FormControl.Static></Col>
					</FormGroup>
					<FormGroup controlId="formGhost">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Ghost"/> ?</Col>
						<Col sm={10}><FormControl.Static>{member.is_ghost} </FormControl.Static></Col>
					</FormGroup>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>
					<i className="fa fa-times" aria-hidden="true"></i>&nbsp;
					<T.span text="Close" />
				</Button>
			</Modal.Footer>
		</Modal>
	}
}

class ConferenceCDRPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {cdr: {}, members: [], showMember: null, mfiles: []};
	}

	componentDidMount() {
		const _this = this;

		xFetchJSON("/api/conference_cdrs/" + this.props.params.id).then((cdr) => {
			xFetchJSON("/api/conference_cdrs/" + this.props.params.id + '/members').then((members) => {
				_this.setState({cdr: cdr, members: members});

				xFetchJSON("/api/media_files?uuid=" + cdr.uuid).then((data) => {
					_this.setState({mfiles: data.data});
				}).catch((err) => {
					console.error("mediaFile Err", err);
				});
			}).catch((err) => {
				console.error("conference cdr member Err", err);
			});
		}).catch((err) => {
			console.error("conference cdr Err", err);
		})
	}

	render() {
		const _this = this;
		const cdr = this.state.cdr;
		let formClose = () => _this.setState({ showMember: null });

		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				<Button onClick={() => window.history.back()}><i className="fa fa-arrow-left" aria-hidden="true"></i>&nbsp;
					<T.span text="Back"/>
				</Button>
			</ButtonGroup>
			</ButtonToolbar>
			<h1><T.span text="Conference CDR"/> <small>{cdr.name} &lt;{cdr.num}&gt;</small></h1>

			<Form horizontal id="ConfCDRFormX">
				<FormGroup controlId="formRecord">
					<Col componentClass={ControlLabel} sm={2}><T.span text="UUID"/></Col>
					<Col sm={10}>{cdr.uuid}</Col>
				</FormGroup>
				<FormGroup controlId="formRecord">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Number"/></Col>
					<Col sm={10}>{cdr.num}</Col>
				</FormGroup>
				<FormGroup controlId="formRecord">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name"/></Col>
					<Col sm={10}>{cdr.name}</Col>
				</FormGroup>
				<FormGroup controlId="formRecord">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Hostname"/></Col>
					<Col sm={10}>{cdr.hostname}</Col>
				</FormGroup>
				<FormGroup controlId="formRecord">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Rate"/></Col>
					<Col sm={10}>{cdr.rate}</Col>
				</FormGroup>
				<FormGroup controlId="formRecord">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Interval"/></Col>
					<Col sm={10}>{cdr.interval}</Col>
				</FormGroup>
				<FormGroup controlId="formRecord">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Started At"/></Col>
					<Col sm={10}>{cdr.started_at}</Col>
				</FormGroup>
				<FormGroup controlId="formRecord">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Completed At"/></Col>
					<Col sm={10}>{cdr.completed_at}</Col>
				</FormGroup>

				<FormGroup controlId="formRecord">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Record"/></Col>
					<Col sm={10}><ul>
					{
						this.state.mfiles.map((mfile) => {
							return <div key={mfile.id}>
								<Link to={`/media_files/${mfile.id}`} target="_blank">{mfile.name}</Link><br/>
								{
									(mfile.mime || "").match(/^audio/) ? <audio src={'/recordings/' + mfile.rel_path} controls/> : (
									(mfile.mime || "").match(/^video/) ? <video src={'/recordings/' + mfile.rel_path} controls style={{maxWidth: "80%"}}/> : null )
								}
							</div>
						})
					}
					</ul></Col>
				</FormGroup>
			</Form>

			<table className="table">
				<thead>
					<tr>
						<th><T.span text="CID Number"/></th>
						<th><T.span text="CID Name"/></th>
						<th><T.span text="Joined At"/></th>
						<th><T.span text="Left At"/></th>
						<th><T.span text="ANI"/></th>
						<th><T.span text="Network Addr"/></th>
						<th><T.span text="Detail"/></th>
					</tr>
				</thead>
				<tbody>
				{
					this.state.members.map((member) => {
						return <tr key={member.id}>
							<td>{member.caller_id_number}</td>
							<td>{member.caller_id_name}</td>
							<td>{member.joined_at}</td>
							<td>{member.left_at}</td>
							<td>{member.ani}</td>
							<td>{member.network_addr}</td>
							<td><T.a text="Detail" href='#' onClick={(e) => {
								e.preventDefault();
								_this.setState({showMember: member}); }}/>
							</td>
						</tr>
					})
				}
				</tbody>
			</table>
			{
				!this.state.showMember ? null :
				<MemberPage show={this.state.showMember ? true : false} onHide={formClose} member={this.state.showMember}/>
			}
		</div>
	}
}

class ConferenceCDRsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			rows: [],
			loaded: false,
			hiddendiv: 'none',
			curPage: 1,
			rowCount: 0,
			pageCount: 0,
			uuid: "",
			showSettings: false,
			rowsPerPage: null
		};

		this.handleQuery = this.handleQuery.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
		this.handleMore = this.handleMore.bind(this);
		this.handlePageTurn = this.handlePageTurn.bind(this);
	}

	handleClick (x) {
	}

	handleControlClick (e) {
		console.log("clicked", e.target);
		this.setState({ showSettings: !this.state.showSettings });
	}

	handleMore (e) {
		e.preventDefault();
		this.setState({hiddendiv: this.state.hiddendiv == 'none' ? 'block' : 'none'});
	}

	handleSearch (e) {
		const cdrsRowsPerPage = localStorage.getItem('cdrsRowsPerPage') || 1000;
		const qs = "startDate=" + this.startDate.value +
			"&endDate=" + this.endDate.value +
			"&cdrsRowsPerPage=" + cdrsRowsPerPage;
		console.log(qs);

		xFetchJSON("/api/conference_cdrs?" + qs).then((cdrs) => {
			this.setState({
				rows: cdrs.data,
				pageCount: cdrs.pageCount,
				rowCount: cdrs.rowCount,
				curPage: cdrs.curPage
			});
		});
	}

	handlePageTurn (pageNum) {
		const cdrsRowsPerPage = localStorage.getItem('cdrsRowsPerPage') || 1000;
		var qs = "";

		if (this.state.hiddendiv == "block") {
			qs = "startDate=" + this.startDate.value +
				"&endDate=" + this.endDate.value;
		} else {
			qs = "last=" + this.days;
		}

		qs = qs + "&pageNum=" + pageNum + "&cdrsRowsPerPage=" + cdrsRowsPerPage;

		xFetchJSON("/api/cdrs?" + qs).then((cdrs) => {
			this.setState({
				rows: cdrs.data,
				pageCount: cdrs.pageCount,
				rowCount: cdrs.rowCount,
				curPage: cdrs.curPage
			});
		});
	}

	componentWillMount () {
	}

	componentWillUnmount () {
	}

	componentDidMount () {
		const cdrsRowsPerPage = localStorage.getItem('cdrsRowsPerPage') || 1000;
		this.setState({ rowsPerPage: cdrsRowsPerPage });

		xFetchJSON("/api/conference_cdrs?cdrsRowsPerPage=" + cdrsRowsPerPage).then((cdrs) => {
			this.setState({
				rows: cdrs.data,
				pageCount: cdrs.pageCount,
				rowCount: cdrs.rowCount,
				curPage: cdrs.curPage,
				loaded : true
			});
		});
	}

	handleQuery (e) {
		const cdrsRowsPerPage = localStorage.getItem('cdrsRowsPerPage') || 1000;
		var data = parseInt(e.target.getAttribute("data"));

		this.days = data;
		e.preventDefault();

		xFetchJSON("/api/conference_cdrs?last=" + data + "&cdrsRowsPerPage=" + cdrsRowsPerPage).then((cdrs) => {
			this.setState({
				rows: cdrs.data,
				pageCount: cdrs.pageCount,
				rowCount: cdrs.rowCount,
				curPage: cdrs.curPage
			});
		});
	}

	handleSortClick(field) {

		var rows = this.state.rows;

		var n = 1;

		if (this.state.order == 'ASC') {
			this.state.order = 'DSC';
			n = -1;
		} else {
			this.state.order = 'ASC';
		}

		rows.sort((a,b) => {
			if (field == "duration" || field == "billsec") {
				return parseInt(a[field]) - parseInt(b[field]) > 0 ? -1 * n : 1 * n
			}else {
				return a[field] < b[field] ? -1 * n : 1 * n
			}
		});

		this.setState({rows: rows});
	}

	handleRowsChange(e) {
		console.log('rows per page', e.target.value);
		const cdrsRowsPerPage = parseInt(e.target.value);

		localStorage.setItem("cdrsRowsPerPage", cdrsRowsPerPage);
	}

	render () {
		var _this = this;
		let isShow;

		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
				<td>{row.num}</td>
				<td>{row.name}</td>
				<td>{row.hostname}</td>
				<td>{row.rate}</td>
				<td>{row.interval}</td>
				<td>{row.started_at}</td>
				<td>{row.completed_at}</td>
				<td><Link to={`/conference_cdrs/${row.id}`}><T.span text="Detail"/></Link></td>
			</tr>
		})

		var pagination = function() {
			var maxButtons = 7;
			if (_this.state.pageCount == 0) return <div/>

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
				<ButtonGroup>
					<Button onClick={() => _this.handleControlClick("settings")} title={T.translate("Settings")}>
						<i className="fa fa-gear" aria-hidden="true"></i>
					</Button>
				</ButtonGroup>
			</ButtonToolbar>
			<ButtonToolbar className="pull-right">
				<T.span text="Last"/> &nbsp;
				<T.a onClick={this.handleQuery} text={{key:"days", day: 7}} data="7" href="#"/>&nbsp;|&nbsp;
				<T.a onClick={this.handleQuery} text={{key:"days", day: 15}} data="15" href="#"/>&nbsp;|&nbsp;
				<T.a onClick={this.handleQuery} text={{key:"days", day: 30}} data="30" href="#"/>&nbsp;|&nbsp;
				<T.a onClick={this.handleQuery} text={{key:"days", day: 60}} data="60" href="#"/>&nbsp;|&nbsp;
				<T.a onClick={this.handleQuery} text={{key:"days", day: 90}} data="90" href="#"/>&nbsp;|&nbsp;
				<T.a onClick={this.handleMore} text="More" data="more" href="#"/>...
				<br/>
				<div className="pull-right">
					<T.span text="Total Rows"/>: {this.state.rowCount} &nbsp;&nbsp;
					<T.span text="Current Page/Total Page"/>: {this.state.curPage}/{this.state.pageCount}
				</div>
			</ButtonToolbar>

			{
				!this.state.showSettings ? null :
				<div style={{position: "absolute", top: "120px", right: "10px", width: "180px", border: "2px solid grey", padding: "10px", zIndex: 999, backgroundColor: "#EEE", textAlign: "right"}}>
					<T.span text="Paginate Settings"/>
					<br/>
					<T.span text="Per Page"/>
					&nbsp;<input  onChange={this.handleRowsChange.bind(this)} defaultValue={this.state.rowsPerPage} size={3}/>&nbsp;
					<T.span text="Row"/>
				</div>
			}

			<h1><T.span text="Conference CDRs"/></h1>
			<div>
				<div style={{padding: "5px", display: _this.state.hiddendiv}} className="pull-right">
					<input type="date" defaultValue={sevenDaysBeforeToday} ref={(input) => { _this.startDate = input; }}/> -&nbsp;
					<input type="date" defaultValue={today} ref={(input) => { _this.endDate = input; }}/> &nbsp;
					<T.button text="Search" onClick={this.handleSearch}/>
				</div>

				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="Number" onClick={() => this.handleSortClick('num')} className="cursor-hand"/></th>
					<th><T.span text="Name" onClick={() => this.handleSortClick('name')} className="cursor-hand"/></th>
					<th><T.span text="Hostname" onClick={() => this.handleSortClick('hostname')} className="cursor-hand"/></th>
					<th><T.span text="Rate"/></th>
					<th><T.span text="Interval"/></th>
					<th><T.span text="Started At" onClick={() => this.handleSortClick('started_at')} className="cursor-hand"/></th>
					<th><T.span text="Completed At" onClick={() => this.handleSortClick('completed_at')} className="cursor-hand"/></th>
					<th><T.span text="Detail"/></th>
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
			<div style={{textAlign: "center"}}>
				<img style={loadSpinner} src="/assets/img/loading.gif"/>
			</div>
		</div>
	}
};

export {ConferenceCDRPage, ConferenceCDRsPage};
