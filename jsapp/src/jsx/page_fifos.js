'use strict';
import React from 'react';
import T from 'i18n-react';
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek';
import { EditControl, xFetchJSON } from './libs/xtools';
import verto from './verto/verto';

class FifoMemberPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { row: [], editText: "Edit", editable: false};
		this.handleEdit = this.handleEdit.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		const _this = this;
		let url = "/api/fifos/" + _this.props.params.fifo_id + "/members/" + _this.props.params.id;
		xFetchJSON(url).then((obj) => {
			_this.setState({ row: obj[0] });
		}).catch((msg) => {
			console.log("get ERR");
		});
	}

	handleEdit () {
		const _this = this;
		if( _this.state.editText === "Save" ){
			_this.handleSubmit();
		}
		let text = _this.state.editText === "Edit" ? "Save" : "Edit";
		this.setState({ editText: text, editable: !this.state.editable });
	}

	handleSubmit (){
		let _this = this;
		console.log("submit...");
		let member = form2json('#editMemberForm');
		if (!member.name ) {
			notify(<T.span text="Mandatory fields left blank"/>, 'error');
			return;
		}

		member.fifo_name = _this.state.row.fifo_name;
		xFetchJSON( "/api/fifos/" + _this.state.row.fifo_id + "/members/" + member.id, {
			method: "PUT",
			body: JSON.stringify(member)
		}).then((obj) => {
			_this.setState({ editable: false, row: member})
			notify(<T.span text={{key:"Saved at",time: Date()}}/>);
		}).catch((msg) => {
			console.error("member", msg);
		});
	}

	render () {
		const _this = this;
		let row = this.state.row;
		return <div>
			<ButtonToolbar className="pull-right">
				<Button onClick={ _this.handleEdit }><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;<T.span text={ _this.state.editText } /></Button>
			</ButtonToolbar>
			<h1><T.span text="FIFO Member Info"/></h1>
			<hr />
			<Form horizontal id="editMemberForm">
				<input type="hidden" name="id" defaultValue={row.id}/>
				<input type="hidden" name="fifo_id" defaultValue={row.fifo_id}/>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl name="name" edit={_this.state.editable} defaultValue={row.name} /></Col>
				</FormGroup>
				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><EditControl  name="description" edit={_this.state.editable} defaultValue={row.description}/></Col>
				</FormGroup>
				<FormGroup controlId="formFifoName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="FIFO Name"/></Col>
					<Col sm={10}><EditControl name="fifo_name" defaultValue={row.fifo_name}/></Col>
				</FormGroup>
				<FormGroup controlId="formTimeout">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Timeout" /></Col>
					<Col sm={10}><EditControl name="timeout" edit={_this.state.editable} defaultValue={row.timeout}/></Col>
				</FormGroup>
				<FormGroup controlId="formSimo">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Simo" /></Col>
					<Col sm={10}><EditControl name="simo" edit={_this.state.editable} defaultValue={row.simo}/></Col>
				</FormGroup>
				<FormGroup controlId="formextn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Lag" /></Col>
					<Col sm={10}><EditControl name="lag" edit={_this.state.editable} defaultValue={row.lag}/></Col>
				</FormGroup>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Extn" /></Col>
					<Col sm={10}><EditControl name="extn" edit={_this.state.editable} defaultValue={row.extn}/></Col>
				</FormGroup>
				<FormGroup controlId="formDialString">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Dial String" /></Col>
					<Col sm={10}><EditControl name="dial_string" edit={_this.state.editable} defaultValue={row.dial_string}/></Col>
				</FormGroup>
			</Form>
		</div>
	}
}

class NewMember extends React.Component {
	constructor (props) {
		super(props);
		this.state = { errmsg: "" };
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit (){
		const _this = this;
		var member = form2json('#newMemberForm');
		if (!member.name) {
			this.setState({ errmsg: "Mandatory fields left blank" });
			return;
		}
		member.fifo_id = this.props.fifoData.fifoId;
		member.fifo_name = this.props.fifoData.fifoName;

		xFetchJSON("/api/fifos/" + member.fifo_id + "/members", {
			method: "POST",
			body: JSON.stringify(member)
		}).then((obj) => {
			member.id = obj.id;
			_this.props.handleNewMemberAdded(member);
		}).catch((msg) => {
			console.error("new FIFO Err", msg);
		});
	}

	render () {
		const _this = this;
		const props = Object.assign({}, this.props);
		delete props.handleNewMemberAdded;
		delete props.fifoData;
		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Add FIFO Member" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form horizontal id="newMemberForm">
					<FormGroup controlId="formName">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
						<Col sm={10}><FormControl type="input" name="name" placeholder="name"/></Col>
					</FormGroup>
					<FormGroup controlId="formDescription">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
						<Col sm={10}><FormControl type="input"  name="description" placeholder="description"/></Col>
					</FormGroup>
					<FormGroup controlId="formTimeout">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Timeout" /></Col>
						<Col sm={10}><FormControl type="input" name="timeout" defaultValue="60"/></Col>
					</FormGroup>
					<FormGroup controlId="formSimo">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Simo" /></Col>
						<Col sm={10}><FormControl type="input" name="simo" defaultValue="2"/></Col>
					</FormGroup>
					<FormGroup controlId="formextn">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Lag" /></Col>
						<Col sm={10}><FormControl type="input" name="lag" defaultValue="5"/></Col>
					</FormGroup>
					<FormGroup controlId="formName">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Extn" /></Col>
						<Col sm={10}><FormControl type="input" name="extn" placeholder="extn"/></Col>
					</FormGroup>
					<FormGroup controlId="formDialString">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Dial String" /></Col>
						<Col sm={10}><FormControl type="input" name="dial_string" placeholder="{member_wait=nowait}user/1001"/></Col>
					</FormGroup>
					<FormGroup>
						<Col smOffset={2} sm={10}>
							<Button type="button" bsStyle="primary" onClick={ _this.handleSubmit }>
								<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
								<T.span text="Save" />
							</Button>
							&nbsp;&nbsp;<T.span className="danger" text={ this.state.errmsg }/>
						</Col>
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

class FifoInfo extends React.Component {

	constructor (props) {
		super(props);
		this.state = { 
			fifoRows: [], memberRows:[], danger: false, formShow: false, 
			editable: false, editText: "Edit", auto_record:"0", ifChecked: false};

		this.handleEdit = this.handleEdit.bind(this);
		this.handleChecked = this.handleChecked.bind(this);
		this.handleNewMemberAdded = this.handleNewMemberAdded.bind(this);
	}

	componentDidMount() {
		const _this = this;
		xFetchJSON("/api/fifos/" + _this.props.params.fifo_id)
			.then((data) => {
				let ifChecked = data.auto_record == "1" ? true : false ;
				_this.setState({ fifoRows: data, ifChecked: ifChecked});
			}).catch((msg) => {
				console.log("get Fifo ERR");
			});

		xFetchJSON("/api/fifos/" + _this.props.params.fifo_id + "/members")
			.then((data) => {
				_this.setState({ memberRows: data });
			}).catch((msg) => {
				console.log("get Member ERR");
			});
	}

	handleEdit () {
		const _this = this;
		if( _this.state.editText === "Save" ){
			_this.handleSubmit();
		}
		let text = _this.state.editText === "Edit" ? "Save" : "Edit";
		this.setState({ editText: text, editable: !this.state.editable});
	}

	handleSubmit (){
		let _this = this;
		console.log("submit...");
		let fifo = form2json('#editFifoForm');
		if (!fifo.name ) {
			notify(<T.span text="Mandatory fields left blank"/>, 'error');
			return;
		}

		fifo.id = _this.props.params.fifo_id;
		fifo.auto_record = _this.state.auto_record;

		xFetchJSON("/api/fifos/"+ fifo.id, {
			method: "PUT",
			body: JSON.stringify(fifo)
		}).then((obj) => {
			_this.setState({ editable: false, fifoRows: fifo})
			notify(<T.span text={{key:"Saved at",time: Date()}}/>);
		}).catch((msg) => {
			console.error("fifo", msg);
		});
	}

	handleChecked(e) {
		var auto_record = e.target.checked ? "1" : "0";
		this.setState({ auto_record: auto_record, ifChecked: e.target.checked });
	}

	handleNewMemberAdded (member) {
		const _this = this;
		xFetchJSON("/api/fifos/"+ _this.props.params.fifo_id +"/members")
			.then((obj) => {
				_this.setState({memberRows: obj, formShow: false});
			}).catch((msg) => {
				console.log("ERR");
			});
	}

	handleDelete (id) {
		console.log("deleting id", id);
		var _this = this;
		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));
			if (!c) return;
		}

		xFetchJSON("/api/fifos/" + _this.props.params.fifo_id + "/members/" + id, {
			method: "DELETE"
		}).then(() => {
			console.log("deleted")
			var memberRows = _this.state.memberRows.filter(function(row) {
				return row.id != id;
			});
			console.log("delete row", memberRows);
			_this.setState({memberRows: memberRows});
		}).catch((msg) => {
			console.log("route", msg);
		});
	}

	handleReparse(e){
		verto.fsAPI("fifo", "reparse");
	}

	render() {
		const _this = this;
		const props = Object.assign({}, this.props);

		let formClose = () => this.setState({ formShow: false });
		let danger = this.state.danger ? "danger" : ""; 
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let frow = this.state.fifoRows;
		let fifoData = {fifoId: frow.id, fifoName: frow.name};
		let autoRecord = frow.auto_record == "1" ? "Yes" : "No" ;
		let colEdit = _this.state.editable ?  { display: "none"} : { display: "block" };
		let colCheck = _this.state.editable ? { display: "block"} : { display: "none" };

		let fifoRow = <div>
			<ButtonToolbar className="pull-right">
				<Button onClick={ _this.handleEdit } ><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;<T.span text={ _this.state.editText } /></Button>
			</ButtonToolbar>
			<h1><T.span text="FIFO Info"/></h1>
			<hr />
			<Form horizontal id="editFifoForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl  name="name" edit={_this.state.editable} defaultValue={frow.name}/></Col>
				</FormGroup>
				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><EditControl  name="description" edit={_this.state.editable} defaultValue={frow.description}/></Col>
				</FormGroup>
				<FormGroup controlId="formImportance">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Importance" /></Col>
					<Col sm={10}><EditControl name="importance" edit={_this.state.editable} defaultValue={frow.importance}/></Col>
				</FormGroup>
				<FormGroup controlId="formOPC">
					<Col componentClass={ControlLabel} sm={2}><T.span text="OB Per Cycle" /></Col>
					<Col sm={10}><EditControl name="outbound_per_cycle" edit={_this.state.editable} defaultValue={frow.outbound_per_cycle}/></Col>
				</FormGroup>
				<FormGroup controlId="formOPCM">
					<Col componentClass={ControlLabel} sm={2}><T.span text="OB Per Cycle Min" /></Col>
					<Col sm={10}><EditControl name="outbound_per_cycle_min" edit={_this.state.editable} defaultValue={frow.outbound_per_cycle_min}/></Col>
				</FormGroup>
				<FormGroup controlId="formOName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="OB Name" /></Col>
					<Col sm={10}><EditControl name="outbound_name" edit={_this.state.editable} defaultValue={frow.outbound_name}/></Col>
				</FormGroup>
				<FormGroup controlId="formOStrategy">
					<Col componentClass={ControlLabel} sm={2}><T.span text="OB Strategy" /></Col>
					<Col sm={10}><EditControl name="outbound_strategy" edit={_this.state.editable} defaultValue={frow.outbound_strategy}/></Col>
				</FormGroup>
				<FormGroup controlId="formOPriority">
					<Col componentClass={ControlLabel} sm={2}><T.span text="OB Priority" /></Col>
					<Col sm={10}><EditControl name="outbound_priority" edit={_this.state.editable} defaultValue={frow.outbound_priority}/></Col>
				</FormGroup>
				<FormGroup controlId="formRetryDelay">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Retry Delay" /></Col>
					<Col sm={10}><EditControl name="retry_delay" edit={_this.state.editable} defaultValue={frow.retry_delay}/></Col>
				</FormGroup>

				<FormGroup controlId="formAutoRecord">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Auto Record" /></Col>
					<Col sm={10} style={colEdit}> <EditControl name="record_template" defaultValue={autoRecord}/></Col>
					<Col sm={10} style={colCheck}>
						<Checkbox name="auto_record" value="auto_record" inline onChange={_this.handleChecked} checked={_this.stateifChecked}>
							<T.span text="Auto Record"/>
						</Checkbox>
					</Col>
				</FormGroup>

					<FormGroup controlId="formRecordTemplate">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Record Template" /></Col>
						<Col sm={10}><EditControl name="record_template" edit={_this.state.editable} defaultValue={frow.record_template}/></Col>
					</FormGroup>
				</Form>
			</div>;

		let memberRows = this.state.memberRows.map ( function (memberRow) {
			if( frow.id == memberRow.fifo_id ) {
				return <tr key={memberRow.id} >
					<td> {memberRow.id} </td>
					<td> <Link to={`/settings/fifos/${frow.id}/members/${memberRow.id}`}>{memberRow.name}</Link> </td>
					<td> {memberRow.description} </td>
					<td> {memberRow.timeout} </td>
					<td> {memberRow.simo} </td>
					<td> {memberRow.lag} </td>
					<td> {memberRow.extn} </td>
					<td> {memberRow.dial_string}  </td>
					<td> { <T.a onClick={() => _this.handleDelete(memberRow.id)} text="Delete" className={danger} style= {{cursor:"pointer"}}/>} </td>
				</tr>;
				}
			});

		return <div>
			{fifoRow}

			<br/><br/>
			<NewMember fifoData={fifoData} show={this.state.formShow} onHide={formClose} handleNewMemberAdded={ this.handleNewMemberAdded }/>
			<ButtonToolbar className="pull-right">
				<Button onClick={() => this.setState({formShow: true})}>
					<i className="fa fa-plus" aria-hidden="true" ></i>&nbsp;
					<T.span text="Add" />
				</Button>
				 <Button onClick={_this.handleReparse.bind(_this)}>
					<i className="fa fa-refresh" aria-hidden="true" ></i>&nbsp;
					<T.span text="Reload" />
				</Button>
			</ButtonToolbar>
			<h3><T.span text="FIFO Member"/></h3>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Timeout"/></th>
					<th><T.span text="Simo"/></th>
					<th><T.span text="Lag"/></th>
					<th><T.span text="Extn"/></th>
					<th><T.span text="Dial String"/></th>
					<th><T.span style={{cursor: "pointer" }} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{memberRows}
				</tbody>
				</table>
			</div>
		</div>
	}
}

class NewFifo extends React.Component {

	constructor (props) {
		super(props);
		this.state = { errmsg: "", auto_record: "0"};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChecked = this.handleChecked.bind(this);
	}

	handleChecked(e) {
		var auto_record = e.target.checked ? "1" : "0";
		this.setState({ auto_record: auto_record });
	}

	handleSubmit () {
		console.log("submit...");
		const _this = this;
		var fifo = form2json('#newFifoForm');
		if (!fifo.name) {
			this.setState({ errmsg: "Mandatory fields left blank" });
			return;
		}

		fifo.auto_record = _this.state.auto_record;

		xFetchJSON("/api/fifos", {
			method: "POST",
			types: "json",
			body: JSON.stringify(fifo),
		}).then((obj) => {
			fifo.id = obj.id;
			_this.props.handleNewFifoAdded(fifo);
		}).catch((msg) => {
			console.error("new FIFO Err", msg);
			_this.setState({errmsg: "" + msg + ""});
		});
	}

	render () {
		const _this = this;
		const props = Object.assign({}, this.props);
		delete props.handleNewFifoAdded;

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New FIFO" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form horizontal id="newFifoForm">
					<FormGroup controlId="formName">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
						<Col sm={10}><FormControl type="input" name="name" placeholder="name"/></Col>
					</FormGroup>
					<FormGroup controlId="formDescription">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
						<Col sm={10}><FormControl type="input"  name="description" placeholder="description"/></Col>
					</FormGroup>
					<FormGroup controlId="formImportance">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Importance" /></Col>
						<Col sm={10}><FormControl type="input" name="importance" defaultValue="0"/></Col>
					</FormGroup>
					<FormGroup controlId="formOPC">
						<Col componentClass={ControlLabel} sm={2}><T.span text="OB Per Cycle" /></Col>
						<Col sm={10}><FormControl type="input" name="outbound_per_cycle" defaultValue="1"/></Col>
					</FormGroup>
					<FormGroup controlId="formOPCM">
						<Col componentClass={ControlLabel} sm={2}><T.span text="OB Per Cycle Min" /></Col>
						<Col sm={10}><FormControl type="input" name="outbound_per_cycle_min" defaultValue="1"/></Col>
					</FormGroup>
					<Col sm={2}></Col>
					<Checkbox name="auto_record" value="auto_record" inline onChange={_this.handleChecked}>
						<T.span text="Auto Record" />
					</Checkbox>
					<FormGroup>
						<Col smOffset={2} sm={10}>
							<Button type="button" bsStyle="primary" onClick={ _this.handleSubmit }>
								<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
								<T.span text="Save" />
							</Button>
							&nbsp;&nbsp;<T.span className="danger" text={ _this.state.errmsg }/>
						</Col>
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

class FifoPage extends React.Component {

	constructor(props) {
		super(props);
		this.state = { rows: [], fifoId: "", fifoName:"", danger: "", formShow: false};
		this.handleMemberClick = this.handleMemberClick.bind(this);
		this.handleNewFifoAdded = this.handleNewFifoAdded.bind(this);
	}

	componentDidMount() {
		let _this = this;
		xFetchJSON("/api/fifos").then((data) => {
			_this.setState({rows: data});
		}).catch((e)=> {
			console.log("get groups ERR");
		});
	}

	handleMemberClick (fifoId) {
		this.setState({ fifoId: fifoId, fifoName: fifoId.text });
	}

	handleNewFifoAdded(fifo) {
		const _this = this;
		xFetchJSON("/api/fifos")
			.then((obj) => {
				_this.setState({rows: obj, formShow: false});
			})
			.catch((msg) => {
				console.log("refresh err");
			});
	}

	handleReparseClick() {
		verto.fsAPI("fifo", "reparse", function(data) {
			notify(<T.span text="FIFO Reparsed"/>);
		});
	}

	handleDelete (id){
		console.log("deleting id", id);
		var _this = this;
		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));
			if (!c) return;
		}

		xFetchJSON("/api/fifos/" + id, {
			method: "DELETE"
		}).then((data) => {
			var rows = _this.state.rows.filter(function(row) {
					return row.id != id;
				});
				console.log("delete row", rows);
				_this.setState({rows: rows});
		}).catch((e)=> {
			console.error("route", msg);
		});
	}

	render() {
		const _this = this;
		let memberStyle = _this.state.fifoId ? { display: "block" } : { display: "none"};
		let danger = this.state.danger ? "danger" : "";
		let formClose = () => this.setState({ formShow: false });
		let editFormClose = () => this.setState({ editFormShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let rows = this.state.rows.map(function(row) {
			let autoRecord = row.auto_record == "1" ? "Yes" : "No" ;
			return <tr key={row.id} >
				<td> {row.id} </td>
				<td> <Link to={`/settings/fifos/${row.id}`}>{row.name}</Link></td>
				<td> {row.description} </td>
				<td> {row.importance} </td>
				<td> {row.outbound_per_cycle} </td>
				<td> {row.outbound_per_cycle_min} </td>
				<td><T.span text={autoRecord}/></td>
				<td><T.a onClick={() => _this.handleDelete(row.id)} text="Delete" className={danger} style={{cursor:"pointer"}}/></td>
			</tr>
		});
		return <div>
			<ButtonToolbar className="pull-right">
				<Button onClick={this.handleReparseClick}>
					<i className="fa fa-refresh" aria-hidden="true" ></i>&nbsp;
					<T.span text="Reparse" />
				</Button>
				<Button onClick={()=>{_this.setState({formShow: true})}}>
					<i className="fa fa-plus" aria-hidden="true" ></i>&nbsp;
					<T.span text="New" />
				</Button>
			</ButtonToolbar>
			<h1><T.span text="FIFO"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Importance"/></th>
					<th><T.span text="OB Per Cycle"/></th>
					<th><T.span text="OB Per Cycle Min"/></th>
					<th><T.span text="Auto Record"/></th>
					<th><T.span style={{cursor: "pointer" }} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>
			<br />
			<NewFifo show={this.state.formShow} onHide={formClose} handleNewFifoAdded={this.handleNewFifoAdded}/>
		</div>
	}
}

export { FifoPage, FifoInfo, FifoMemberPage };
