'use strict';

import React from 'react'
import ReactDOM from 'react-dom';
import T from 'i18n-react';
import { xFetchJSON } from '../jsx/libs/xtools';

var is_wx_ready = false;
var is_assign = false;

const ticket_status = {
	"TICKET_ST_NEW": "未处理",
	"TICKET_ST_PROCESSING": "处理中",
	"TICKET_ST_DONE": "已完成"
}

const emergency = {
	"NORMAL": "不紧急",
	"EMERGENT": "较紧急",
	"URGENT": "紧急"
}

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {ticket: {}, tickets: [], user_options: null, record: "开始录音", upload: null, audition: null, current_localId: null, current_serverId:null, ass_template: null, call:"回拨", ticket_comments: [], wechat_users: props.users, deal_user: null};
	}

	fetchComment(ticket_id) {
		var _this = this;
		xFetchJSON('/api/tickets/' + ticket_id + '/comments').then((data) => {
			console.log('comments', data);
			_this.setState({ticket_comments: data});

			if (data.length > 0) {
				// check if we have media files
				xFetchJSON('/api/tickets/' + ticket_id + '/comments/media_files').then((media) => {
					console.log('media', media);

					const comments = _this.state.ticket_comments.map((comment) => {
						media.forEach((m) => {
							if (comment.id == m.comment_id) {
								if (!comment.mfiles) comment.mfiles = [];
								comment.mfiles.push(m);
							}
						});

						return comment;
					});

					console.log('comments', comments);
					_this.setState({ticket_comments: comments});
				});
			}

		});
	}

	fetchTicket(ticket_id) {
		const _this = this;

		xFetchJSON("/api/tickets/" + ticket_id).then((data) => {
			_this.setState({ticket: data});

			const uri = "http://xswitch.cn/api/wechat/xyt/tickets/" + data.id;

			var shareData = {
				title: data.subject,
				desc: data.content.substr(0, 40),
				link: uri,
				imgUrl: 'http://xswitch.cn/assets/img/ticket.png',
				trigger: function (res) {
					console.log('用户点击发送给朋友');
				},
				success: function (res) {
					console.log('已分享');
				},
				cancel: function (res) {
					console.log('已取消');
				},
				fail: function (res) {
					console.log('failed', res);
				}
			};

			if (is_wx_ready) {
				wx.onMenuShareAppMessage(shareData);
			} else {
				wx.ready(function() {
					wx.onMenuShareAppMessage(shareData);
				});
			}
		}).catch((e) => {
			console.error("get ticket", e);
		});
		_this.fetchComment(ticket_id);
	}

	componentDidMount() {
		var _this = this;

		if (current_ticket_id == 0) { // list my tickets
			xFetchJSON("/api/tickets/my_tickets").then((data) => {
				_this.setState({tickets: data});
			});

			return;
		}

		this.fetchTicket(current_ticket_id);
	}

	handleComment(e) {
		current_ticket_id = e;
		ReactDOM.render(<Comment/>, document.getElementById('main'));
	}

	handleRecord() {
		var _this = this;
		if (_this.state.record == "开始录音") {
			wx.startRecord();
			_this.setState({record: "停止录音"});
		}
		if (_this.state.record == "重新录音") {
			_this.setState({record: "停止录音", audition: null, upload: null});
			wx.startRecord();
		}
		if (_this.state.record == "停止录音") {
			wx.stopRecord({
				success: function (res) {
					var localId = res.localId;
					_this.setState({record: "重新录音"});
					var audition = <a className="weui-form-preview__btn weui-form-preview__btn_primary" onClick={() => _this.handleAudition()}>试听</a>;
					var upload = <a className="weui-form-preview__btn weui-form-preview__btn_primary" onClick={() => _this.handleUpload()}>上传</a>;
					_this.setState({current_localId: localId, audition: audition, upload: upload});
				}
			});
		}
	}

	handleAudition () {
		var localId = this.state.current_localId
		wx.playVoice({
			localId: localId
		});
	}

	handleUpload() {
		var _this = this
		var localId = _this.state.current_localId
		var ticket = _this.state.ticket
		wx.uploadVoice({
			localId: localId,
			isShowProgressTips: 1,
			success: function (res) {
				var serverId = res.serverId;
				xFetchJSON("/api/tickets/" + ticket.id + "/comments", {
					method: 'POST',
					body: JSON.stringify({content: '实时录音'})
				}).then((datas) => {
					if (serverId) {
						xFetchJSON("/api/wechat_upload/xyt/" + datas.id + "/record", {
							method: 'POST',
							body: JSON.stringify({serverId: serverId})
						}).then((res) => {
							_this.setState({current_localId: null, audition: null, upload: null, record: "开始录音"});
							_this.fetchComment(ticket.id);
						}).catch((e) => {
						});
					}
				}).catch((e) => {
				});
			}
		});
	}

	handleAllot(e) {
		ReactDOM.render(<UserList/>, document.getElementById('main'));
	}

	sendAssignTem(e) {
		is_assign = false;
		var _this = this;
		_this.setState({ass_template: null});
		xFetchJSON("/api/tickets/" + e + "/assign/" + _this.state.wechat_users.id, {
			method: 'PUT'
		}).then((data) => {
			xFetchJSON('/api/tickets/' + current_ticket_id + '/comments').then((data) => {
				_this.setState({ticket_comments: data});
			});
		}).catch((e) => {
		});
	}

	previewImageShow(path) {
		path = location.protocol + '//' + location.host + path;

		let showImgs = [path];

		console.log({
			current: path,
			urls: showImgs
		});

		wx.previewImage({
			current: path,
			urls: showImgs
		});
	}

	backWithdraw(e) {
		var user_id = this.state.ticket.user_id;
		var wechat_userid = this.state.ticket.wechat_userid;
		if (user_id != wechat_userid) {
			alert("无权限撤回非本人工单");
			return false;
		}
		if (!confirm("确定撤回工单？")) return;
		xFetchJSON("/api/tickets/" + this.state.ticket.id, {method: "DELETE"}).then(() => {
			ReactDOM.render(<Tickets/>, document.getElementById('main'));
		}).catch((msg) => {
			notify(msg, 'error');
		});
	}

	callBack(user_id) {
		xFetchJSON('/api/tickets/' + this.state.ticket.id + '/callback/' + user_id, {
			method: 'PUT'
		}).then((data) => {
			// this.setState({call: "回拨"})
		});
	}

	handleClick(ticket_id) {
		this.fetchTicket(ticket_id);
	}

	backToTicketList() {
		const _this = this;

		this.setState({ticket: {}});

		xFetchJSON("/api/tickets/my_tickets").then((data) => {
			_this.setState({tickets: data});
		});
	}

	render() {
		const _this = this;
		const ticket = this.state.ticket;

		if (!ticket.id) {
			if (this.state.tickets.length == 0) {
				return <div><br/><br/><br/><br/><br/><br/>
					<center>当前没有待处理工单</center>
				</div>
			}

			const warning = ''

			return <div>
				<h1 style={{textAlign: "center"}}>我的工单</h1>
				{
					this.state.tickets.map((ticket) => {
						return <div className="weui-form-preview__bd" onClick={() => _this.handleClick(ticket.id)} key={ticket.id} >
							<div className="weui-form-preview__item">
								<label className="weui-form-preview__label" style={{color:"black"}}>
									<span className={ticket.status}>X</span>&nbsp;
									<span>{ticket.subject}</span>
								</label>
								<span className="weui-form-preview__value" style={{color:"black"}}>{ticket.cid_number}{warning}</span>
							</div>
							<div className="weui-form-preview__item">
								<label className="weui-form-preview__label">{ticket.content.slice(0,20)}</label>
								<span className="weui-form-preview__value"></span>
							</div>
							<div className="weui-form-preview__item">
								<label className="weui-form-preview__label" style={{fontSize:"12px"}}>{ticket.created_epoch}</label>
								<span className="weui-form-preview__value" style={{fontSize:"12px"}}>{ticket_status[ticket.status]}</span>
							</div>
							<div className="weui-form-preview__ft"></div>
						</div>
					})
				}
			</div>
		}

		const comments = this.state.ticket_comments.map((comment) => {
			const wechat_img = !comment.mfiles ? null : comment.mfiles.map((mfile) => {
				const thumb = '/upload/' + (mfile.thumb ? mfile.thumb : mfile.src);
				const path = '/upload/' + mfile.src;

				if (!mfile.mime) return null;

				console.log(mfile);

				if (mfile.mime.indexOf('image') == 0) {
					return <span>
						<img style={{width:"60px", height:"60px"}} onClick={ () => _this.previewImageShow(path)} src={path}/>&nbsp;
					</span>
				} else if (mfile.mime.indexOf('audio') == 0) {
					return <audio src={path} controls="controls"/>
				} else if (mfile.mime.indexOf('video') == 0) {
					return <video controls webkit-playsinline playsinline><source src={path} type="video/mp4"/></video>
				}
			});

			if (!comment.avatar_url) comment.avatar_url = '/assets/img/default_avatar.png';

			return <a className="weui-media-box weui-media-box_appmsg" key={comment.id}>
					<div className="weui-media-box__hd">
						<img className="weui-media-box__thumb" src={comment.avatar_url} alt=""/>
					</div>
					<div className="weui-media-box__bd">
						<div className="weui-form-preview__item">
							<div className="weui-form-preview__bd">
								<div className="weui-form-preview__item">
									<label className="weui-form-preview__label" style={{color:"black",fontSize:"15px"}}>{comment.user_name.substr(0, 10)}</label>
									<span className="weui-form-preview__value">{comment.created_epoch}</span>
								</div>
								<div className="weui-form-preview__item">
									<label className="weui-form-preview__label" style={{color:"black",fontSize:"15px"}}>{comment.content}
									</label>
									<span className="weui-form-preview__value"></span>
								</div>
								<div className="weui-form-preview__item">
									<label className="weui-form-preview__label">
										{wechat_img}
									</label>
									<span className="weui-form-preview__value"></span>
								</div>
							</div>
						</div>
					</div>
				</a>
		})

		var wechat = _this.state.wechat_users;

		if (wechat) {
			if (is_assign) {
				_this.state.ass_template = <div className="weui-btn-area">
							<a className="weui-btn weui-btn_primary" href="javascript:" onClick={ () => _this.sendAssignTem(ticket.id)} id="showTooltips">派发</a>
						</div>
			}
			var assigns = <div className="weui-form-preview">
						<a className="weui-media-box weui-media-box_appmsg" key="">
							<div className="weui-media-box__hd">
								<img className="weui-media-box__thumb" src={wechat.headimgurl} alt=""/>
							</div>
							<div className="weui-media-box__bd">
								<div className="weui-form-preview__item">
									<span className="weui-form-preview__value" style={{fontSize:"12px",color:"black"}}>{wechat.name}&nbsp;&nbsp;{wechat.extn}&nbsp;&nbsp;&nbsp;{wechat.nickname}&nbsp;&nbsp;&nbsp;
										<a href="javascript:;" onClick={() => _this.handleAllot(ticket.id)} className="weui-btn weui-btn_mini weui-btn_primary">重新选择</a>
									</span>
								</div>
							</div>
						</a>
						{_this.state.ass_template}
					</div>
		} else {
			var assigns = <a className="weui-form-preview__btn weui-form-preview__btn_primary" onClick={ () => _this.handleAllot(ticket.id)}>派发</a>
		}

		var record = '';

		if (ticket.original_file_name) {
			const rec = "/recordings/" + ticket.original_file_name
			var record = <div><span style={{color:"black"}} className="weui-form-preview__label">录音</span>
					<span className="weui-form-preview__value">
						<audio src={rec} controls="controls">
						</audio>
					</span>
			<div className="weui-form-preview__ft">
			</div>
				</div>
		}

		return <div>
			<div className={"TICKET_E_" + ticket.emergency}>
				<h1 style={{ textAlign:"center" }}>{ticket.subject}</h1>
			</div>

			<div style={{padding: "5px", color: "#999"}}>
				<br/>
				<div style={{float: "right"}}>{ticket.created_epoch}</div>
				<div>{ticket.serial_number}</div>
			</div>

			<div className="weui-form-preview">
				<div className="weui-form-preview__ft">
				</div>
				<div className="weui-form-preview__bd">
					<div className="weui-form-preview__item">
						<span style={{color:"black"}} className="weui-form-preview__label">制单人</span>
						<span className="weui-form-preview__value" onClick={() => this.callBack(ticket.user_id)}>
							{ticket.user_name}&nbsp;
							<img src='/assets/img/phone.png' style={{width: "20px"}}/>
						</span>
					</div>
				</div>
				<div className="weui-form-preview__ft">
				</div>
				<div className="weui-form-preview__bd">
					<div className="weui-form-preview__item">
						<span style={{color:"black"}} className="weui-form-preview__label">执行人</span>
						<span className="weui-form-preview__value"  onClick={() => this.callBack(ticket.current_user_id)}>
							{ticket.current_user_name}&nbsp;
							<img src='/assets/img/phone.png' style={{width: "20px"}}/>
						</span>
					</div>
				</div>
				<div className="weui-form-preview__ft">
				</div>
				<div className="weui-form-preview__bd">
					<div className="weui-form-preview__item">
						<span style={{color:"black"}} className="weui-form-preview__label">类型</span>
						<span className="weui-form-preview__value"><T.span text={ticket.dtype}/></span>
					</div>
				</div>
				<div className="weui-form-preview__ft">
				</div>
				<div className="weui-form-preview__bd">
					<div className="weui-form-preview__item">
						<span style={{color:"black"}} className="weui-form-preview__label">状态</span>
						<span className="weui-form-preview__value">{ticket_status[ticket.status]}</span>
					</div>
				</div>
				<div className="weui-form-preview__ft">
				</div>
				<div className="weui-form-preview__bd">
					<div className="weui-form-preview__item">
						<span style={{color:"black"}} className="weui-form-preview__label">紧急程度</span>
						<span className="weui-form-preview__value">{emergency[ticket.emergency]}</span>
					</div>
				</div>
				<div className="weui-form-preview__ft">
				</div>

				<div className="weui-form-preview__bd">
					<div className="weui-form-preview__item">
						<span style={{color:"black"}} className="weui-form-preview__label">处理时限</span>
						<span className="weui-form-preview__value">
							{ticket.deadline} &nbsp;
							<a href="javascript:;" onClick={() => _this.backWithdraw(ticket.id)} className="weui-btn weui-btn_mini weui-btn weui-btn_default">撤回</a>
						</span>
					</div>
				</div>

				<div className="weui-form-preview__bd">
					<div className="weui-form-preview__item">
					{record}
				</div>
			</div>
		</div>

		<article className="weui-article">
			<section>
				<p>{ticket.content}</p>
			</section>
		</article>

		{assigns}

		<br/>
			<a className="weui-form-preview__btn weui-form-preview__btn_primary" onClick={() => _this.handleComment(ticket.id)}>添加评论</a>
		<br/>
			<a className="weui-form-preview__btn weui-form-preview__btn_primary" onClick={() => _this.handleRecord()}>{_this.state.record}</a>
			{_this.state.audition}
			{_this.state.upload}
			{/* <div className="weui-cells weui-cells_form">
				<div className="weui-cell">
					<div className="weui-cell__bd">
						<textarea className="weui-textarea" placeholder="请输入内容" onChange={this.handleInput.bind(this)} rows="3"></textarea>
					</div>
				</div>
			</div> */}
		{/*  <div className="weui-btn-area" onClick={this.handleSubmit.bind(this)}>
			<a className="weui-btn weui-btn_primary" href="javascript:" id="showTooltips">提交</a>
		</div> */}

		<div className="weui-panel weui-panel_access">
			<div className="weui-panel__bd">
			{comments}
			</div>
		</div>

		<div>
			<button className="weui-btn" onClick={this.backToTicketList.bind(this)}>返回我的工单列表</button>
			<br/>
			<br/>
		</div>

		</div>
	}
}

class UserList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {wechat_users: []};
	}

	componentDidMount() {
		xFetchJSON("/api/users/bind").then((data) => {
			console.log("wechat_users", data)
			this.setState({wechat_users: data})
		}).catch((msg) => {
			
		});
	}

	handleAssign(row) {
		is_assign = <div className="weui-btn-area">
							<a className="weui-btn weui-btn_primary" href="javascript:" onClick={ () => this.sendAssignTem(ticket.id)} id="showTooltips">派发</a>
						</div>
		ReactDOM.render(<Home users={row}/>, document.getElementById('main'));
	}

	back() {
		ReactDOM.render(<Home/>, document.getElementById('main'));
	}

	render(){
		var _this = this;
		var wechat_users = this.state.wechat_users.map(function(row) {
			return <div className="weui-form-preview"  onClick={ () => _this.handleAssign(row)}>
						<a className="weui-media-box weui-media-box_appmsg" key="">
							<div className="weui-media-box__hd">
								<img className="weui-media-box__thumb" src={row.headimgurl} alt=""/>
							</div>
							<div className="weui-media-box__bd">
								<div className="weui-form-preview__item">
									<span className="weui-form-preview__value" style={{fontSize:"17px",color:"black"}}>{row.name}&nbsp;&nbsp;&nbsp;{row.extn}&nbsp;&nbsp;&nbsp;{row.nickname}</span>
								</div>
							</div>
						</a>
					</div>
				})
		return <div>
			<div className="weui-form-preview__bd">
				<div className="weui-form-preview__item">
					<span style={{color:"black"}} className="weui-form-preview__label">选择用户</span>
					<span className="weui-form-preview__value">
						<a href="javascript:;" className="weui-btn weui-btn_mini weui-btn_warn" onClick={ () => _this.back()}>取消</a>
					</span>
				</div>
			</div>
			{wechat_users}
		</div>
	}
}

class Comment extends React.Component {
	constructor(props) {
		super(props);
		this.state = {content: [], localIds: [], serverIds: []};
	}

	componentDidMount() {
		xFetchJSON("/api/tickets/" + current_ticket_id).then((data) => {
			console.log("comments_aaaaa", data)
			this.setState({content: data})
		}).catch((msg) => {
		});
	}

	handleInput(e) {
		console.log('input', e.target.value);
		this.state.comment_content = e.target.value;
	}

	addComments(e) {
		console.log('submit', this.state.comment_content);
		const serverIds = this.state.serverIds;
		const localIds = this.state.localIds;
		if (this.state.comment_content) {
			xFetchJSON("/api/tickets/" + current_ticket_id + "/comments", {
				method: 'POST',
				body: JSON.stringify({content: this.state.comment_content})
			}).then((data) => {
				ReactDOM.render(<Home/>, document.getElementById('main'));
				if (serverIds) {
					xFetchJSON("/api/wechat_upload/xyt/" + data.id + "/comments", {
						method: 'POST',
						body: JSON.stringify({serverIds: serverIds, localIds: localIds})
					}).then((res) => {
					}).catch((e) => {
					});
				}
			}).catch((e) => {
			});
		}
	}

	noComments() {
		ReactDOM.render(<Home/>, document.getElementById('main'));
	}

	delLocalId(localId) {
		const localIds = this.state.localIds;
		const serverIds = this.state.serverIds;
		for (var i=0;i<localIds.length;i++) {
			if (localId == localIds[i]) {
				localIds.splice(i,1);
				serverIds.splice(i,1);
			}
		}
		this.setState({localIds: localIds});
	}

	uploadImg(e) {
		var _this = this;
		wx.chooseImage({
			count: 1, // 默认9
			sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				_this.state.localIds.push(res.localIds);
				var localIds = _this.state.localIds;
				_this.setState({localIds: localIds})
				res.localIds.map((localId) => {
					_this.wUploadImage(localId);
				})
			}
		});
	}

	wUploadImage(localId) {
		var _this = this;
		wx.uploadImage({
			localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
			isShowProgressTips: 0, // 默认为1，显示进度提示
			success: function (res) {
				var serverId = res.serverId; // 返回图片的服务器端ID
				_this.state.serverIds.push(serverId);
				/*_this.wDownloadImage(serverId);*/
			}
		});
	}

	render(){
		const _this = this;
		const current_img = _this.state.localIds.map((c_img) => {
			return <span>
					<img src={c_img} style={{width:"60px",height:"60px"}}/><a style={{color:"red"}} onClick={ () => _this.delLocalId(c_img)}>X</a>&nbsp;
				</span>
		})
		return <div className="weui-form-preview">
				<div className="weui-form-preview__ft">
				</div>
				<article className="weui-article">
					<section>
						<p>{_this.state.content.content}</p>
					</section>
				</article>
				<br/>
				<div className="weui-cells weui-cells_form">
					<div className="weui-cell">
						<div className="weui-cell__bd">
							<textarea className="weui-textarea" placeholder="请输入内容" onChange={_this.handleInput.bind(this)} rows="3"></textarea>
						</div>
					</div>
					<a onClick={ () => _this.uploadImg()}>添加图片</a>
					<br/>
					{current_img}
				</div>
				<div className="weui-form-preview__bd">
					<a href="javascript:;" className="weui-btn weui-btn_primary" onClick={ () => _this.addComments()}>添加评论</a>
				</div>
				<div className="weui-form-preview__bd">
					<a href="javascript:;" style={{color:"black"}} className="weui-btn weui-plain-default" onClick={ () => _this.noComments()}>取消</a>
				</div>
			</div>
	}
}

class Newticket extends React.Component {
	constructor(props) {
		super(props);
		this.state = {input: {}, ticket_type: [], cnumber: null}
	}

	componentDidMount() {
		const _this = this
		xFetchJSON("/api/dicts/", {
			method:"GET",
			headers: {"realm":"TICKET_TYPE"}
		}).then((data) => {
			_this.setState({ticket_type: data})
		}).catch((msg) => {
			console.error("dicts", msg);
		});
		xFetchJSON("/api/users/wechat", {
			method:"GET"
		}).then((data) => {
			_this.setState({cnumber: data.extn})
		}).catch((msg) => {
			console.error("dicts", msg);
		});
		_this.setState({users: null})
	}

	handleCidNumber(e) {
		console.log('input', e.target.value);
		this.setState({cnumber: e.target.value})
	}

	handleContent(e) {
		console.log('input', e.target.value);
		this.state.input.content = e.target.value;
	}

	handleType(e) {
		console.log('input', e.target.value);
		this.state.input.type = e.target.value;
	}

	handleEmergency(e) {
		console.log('input', e.target.value);
		this.state.input.emergency = e.target.value;
	}

	handleSubject(e) {
		console.log('input', e.target.value);
		this.state.input.subject = e.target.value;
	}

	handleDeadline(e) {
		this.state.input.deadline = e.target.value;
	}

	newTicketAdd(e) {
		var _this = this;
		_this.state.input.cid_number = _this.state.cnumber;
		if (!_this.state.input.cid_number) {
			alert("请输入来电号码");
			return false;
		}
		if (!_this.state.input.subject) {
			alert("请输入主题");
			return false;
		}
		if (!_this.state.input.content) {
			alert("请输入内容");
			return false;
		}
		var timestamp1 = Date.parse(new Date());
		var now = timestamp1 / 1000;
		var timestamp2 = Date.parse(_this.state.input.deadline);
		var deadline = timestamp2 / 1000 + 86400;

		if (now >= deadline) {
			alert("请选择正确的期限时间");
			return false;
		}

		const ticket = _this.state.input;
		xFetchJSON("/api/tickets", {
			method:"POST",
			body: JSON.stringify(ticket)
		}).then((data) => {
			current_ticket_id = data.id
			ReactDOM.render(<Home/>, document.getElementById('main'));
		}).catch((msg) => {
			console.error("ticket", msg);
		});
	}

	render() {
		const ticket_type = this.state.ticket_type.map((type) => {
			return <option value={type.k}>{type.v}</option>
		})
		const cnumber = this.state.cnumber
		return <div>
				<h1 style={{ textAlign:"center" }}>新建工单</h1>

				<div className="weui-cells weui-cells_form">
					<div className="weui-cell">
						<div className="weui-cell__hd">
							<label className="weui-label">来电号码</label>
						</div>
						<div className="weui-cell__bd">
							<input className="weui-input" type="text" onChange={this.handleCidNumber.bind(this)} value={cnumber}/>
						</div>
					</div>
					<div className="weui-cell">
						<div className="weui-cell__hd">
							<label className="weui-label">主题</label>
						</div>
						<div className="weui-cell__bd">
							<input className="weui-input" type="text" onChange={this.handleSubject.bind(this)} placeholder="请输入主题"/>
						</div>
					</div>

					<div className="weui-cell">
						<div className="weui-cell__hd">
							<label className="weui-label">类型</label>
						</div>
						<div className="weui-cell__bd weui-cell_select">
							<select className="weui-select" name="select_type" onChange={this.handleType.bind(this)}>
								{ticket_type}
							</select>
						</div>
					</div>

					<div className="weui-cell">
						<div className="weui-cell__hd">
							<label className="weui-label">紧急程度</label>
						</div>
						<div className="weui-cell__bd weui-cell_select">
							<select className="weui-select" name="select_emergency" onChange={this.handleEmergency.bind(this)}>
							{
								["NORMAL", "EMERGENT", "URGENT"].map((e) => {
									return <option key={e} value="URGENT">{emergency[e]}</option>
								})
							}
							</select>
						</div>
					</div>

					<div className="weui-cell">
						<div className="weui-cell__hd">
							<label className="weui-label">处理期限</label>
						</div>

						<div className="weui-cell__bd">
							<input type="date" onChange={this.handleDeadline.bind(this)}/>
						</div>
					</div>
				</div>
				<div className="weui-form-preview__ft">
				</div>
				<div className="weui-cells__title" style={{color:"black"}}>内容</div>
				<div className="weui-cells">
					<div className="weui-cell">
						<div className="weui-cell__bd">
							<textarea className="weui-textarea" onChange={this.handleContent.bind(this)} placeholder="请输入内容" rows="3"></textarea>
						</div>
					</div>
				</div>
				<div className="weui-btn-area">
					<a className="weui-btn weui-btn_primary" href="javascript:" onClick={() => this.newTicketAdd()} id="showTooltips">确定</a>
				</div>
			</div>
	}
}

class Tickets extends React.Component {
	constructor(props) {
		super(props);
		this.state = {tickets: [], page: 0, scro: true};
	}

	componentDidMount() {
		var _this = this;
		// window.addEventListener('scroll', _this.ticketList.bind(_this))
		var page = _this.state.page
		xFetchJSON("/api/tickets").then((data) => {
			_this.setState({tickets: data});
		}).catch((e) => {
			console.error("get ticket", e);
		});
	}

	ticketList() {
		var _this = this;
		var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop()
		if (!scrollBottom && _this.state.scro) {
			_this.setState({scro: false});
			var page = _this.state.page + 1
			xFetchJSON("/api/tickets").then((data) => {
				if (data.length > 0) {
					console.log("ticket", data);
					var tickets = _this.state.tickets
					data.map((ticket) => {
						tickets.push(ticket)
					});
					_this.setState({tickets: tickets, page: page, scro: true});
				}
			}).catch((e) => {
				console.error("get ticket", e);
			});
		}
	}

	addNewTicket() {
		ReactDOM.render(<Newticket/>, document.getElementById('main'));
	}

	handleClick(ticket_id) {
		console.log(ticket_id);
		current_ticket_id = ticket_id;
		ReactDOM.render(<Home/>, document.getElementById('main'));
	}

	render() {
		var _this = this;
		const timestamp1 = Date.parse(new Date());
		const now = timestamp1 / 1000;
		const tickets = _this.state.tickets.map((ticket) => {
			var ticket_state = ticket.status;
			var ticket_style = '';
			var deadline = ticket.deadline;

			if (now >= deadline && deadline) {
				var warning = <i className="weui-icon-warn"></i>
			}

			return <div className="weui-form-preview__bd" onClick={() => _this.handleClick(ticket.id)} key={ticket.id} >
						<div className="weui-form-preview__item">
							<label className="weui-form-preview__label" style={{color:"black"}}>
								<span className={ticket.status}>X</span>&nbsp;
								<span>{ticket.subject}</span>
							</label>
							<span className="weui-form-preview__value" style={{color:"black"}}>{ticket.cid_number}{warning}</span>
						</div>
						<div className="weui-form-preview__item">
							<label className="weui-form-preview__label">{ticket.content.slice(0,20)}</label>
							<span className="weui-form-preview__value"></span>
						</div>
						<div className="weui-form-preview__item">
							<label className="weui-form-preview__label" style={{fontSize:"12px"}}>{ticket.created_epoch}</label>
							<span className="weui-form-preview__value" style={{fontSize:"12px"}}>{ticket_status[ticket.status]}</span>
						</div>
					<div className="weui-form-preview__ft"></div>
					</div>
		});

		return <div className="weui-panel">
				<div className="weui-panel__hd">
					<div className="weui-form-preview__bd">
						<div className="weui-form-preview__item">
							<span style={{color:"black"}} className="weui-form-preview__label">全部工单</span>
							<span className="weui-form-preview__value">
								<a href="javascript:;" onClick={() => _this.addNewTicket()} className="weui-btn weui-btn_mini weui-btn_primary">新建工单</a>
							</span>
						</div>
					</div>
				</div>
					{tickets}
				</div>
	}
}

class Settings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {user_state: null};
	}

	componentDidMount() {
		xFetchJSON('/api/fifos/members/check').then((data) => {
			this.setState({user_state: data.user_state})
		});
	}

	onWork() {
		xFetchJSON("/api/fifos/work/onwork", {
			method: 'PUT'
		}).then((data) => {
		}).catch((e) => {
		});
	}

	afterWork() {
		xFetchJSON("/api/fifos/work/afterwork", {
			method: 'PUT'
		}).then((data) => {
		}).catch((e) => {
		});
	}

	render() {
		var _this = this;
		if (_this.state.user_state) {
			var work_radio = <span>
								<input type="radio" defaultChecked="checked" name="work" onChange={() => _this.onWork()}/>
								上班
								&nbsp;&nbsp;&nbsp;
								<input type="radio" name="work" onChange={() => _this.afterWork()}/>
								下班
							</span>
		} else {
			var work_radio = <span>
								<input type="radio" name="work" onChange={() => _this.onWork()}/>
								上班
								&nbsp;&nbsp;&nbsp;
								<input type="radio" defaultChecked="checked" name="work" onChange={() => _this.afterWork()}/>
								下班
							</span>
		}
		return <div className="weui-cells weui-cells_form">
					<div className="weui-form-preview__ft">
					</div>
					<div className="weui-form-preview__bd">
						<div className="weui-form-preview__item">
							<span style={{color:"black"}} className="weui-form-preview__label">值班</span>
							<span className="weui-form-preview__value">
								{work_radio}
							</span>
						</div>
					</div>
					<div className="weui-form-preview__ft">
					</div>
					<br/>
					<br/>
					<div className="weui-media-box__hd">
						<img className="weui-media-box__thumb" style={{width:"40%",marginLeft:"30%"}} src="/assets/img/qrcode_wechat.jpg" alt=""/>
					</div>
					<div className="weui-msg">
						<div className="weui-msg__text-area">
							<h2 className="weui-msg__title">识别图中的二维码</h2>
							<h2 className="weui-msg__title">点击关注，获取更多信息</h2>
						</div>
					</div>
				</div>
	}
}

class Other extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return <div>Other</div>
	}
}

class App extends React.Component{
	handleClick(menu) {
		switch(menu) {
			case "last": ReactDOM.render(<Home/>, document.getElementById('main')); break;
			case "tickets": ReactDOM.render(<Tickets/>, document.getElementById('main')); break;
			case "settings": ReactDOM.render(<Settings/>, document.getElementById('main')); break;
			case "other": ReactDOM.render(<Other/>, document.getElementById('main')); break;
			default: ReactDOM.render(<Home/>, document.getElementById('main'));
		}
	}

	render() {
		const _this = this;
		return <div>
			<div style={{width:"100%",height:"50px"}}></div>
				<div className="weui-tabbar" style={{position: "fixed"}}>
					<a className="weui-tabbar__item" onClick={() => _this.handleClick("last")}>
						<div className="weui-tabbar__icon">
							<img src="/assets/wechat_img/icon_nav_button.png" alt=""/>
						</div>
						<p className="weui-tabbar__label">我的</p>
					</a>
					<a className="weui-tabbar__item" onClick={() => _this.handleClick("tickets")}>
						<div className="weui-tabbar__icon">
							<img src="/assets/wechat_img/icon_nav_article.png" alt=""/>
						</div>
						<p className="weui-tabbar__label">全部</p>
					</a>
					<a className="weui-tabbar__item">
						<div className="weui-tabbar__icon" onClick={() => _this.handleClick("settings")}>
							<img src="/assets/wechat_img/icon_nav_cell.png" alt=""/>
						</div>
						<p className="weui-tabbar__label">设置</p>
					</a>
				</div>
			</div>
	}
}

wx.ready(function () {
	is_wx_ready = true;

	const shareData = {
		title: document.title,
		desc: document.title,
		link: location.href.split('#')[0] + 1,
		imgUrl: 'http://xswitch.cn/assets/img/ticket.png'
	};

	wx.onMenuShareAppMessage(shareData);
});

xFetchJSON('/api/wechat/xyt/jsapi_ticket?url=' + escape(location.href.split('#')[0])).then((data) => {
	wx.config({
		// debug: true,
		appId: data.appId,
		timestamp: data.timestamp,
		nonceStr: data.nonceStr,
		signature: data.signature,
		jsApiList: [
			'checkJsApi',
			'openLocation',
			'getLocation',
			'onMenuShareTimeline',
			'onMenuShareAppMessage',
			'chooseImage',
			'previewImage',
			'uploadImage',
			'downloadImage',
			'getLocalImgData',
			'startRecord',
			'stopRecord',
			'onVoiceRecordEnd',
			'playVoice',
			'pauseVoice',
			'stopVoice',
			'onVoicePlayEnd',
			'uploadVoice',
			'downloadVoice'
		]
	});
});

ReactDOM.render(<Home/>, document.getElementById('main'));
ReactDOM.render(<App/>, document.getElementById('body'));
