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

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {ticket: {}, user_options: null, ass_template: null, ticket_comments: [], wechat_users: props.users, deal_user: null};
	}
	componentDidMount() {
		var _this = this;
		xFetchJSON("/api/tickets/" + current_ticket_id).then((data) => {
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
		xFetchJSON('/api/tickets/' + current_ticket_id + '/comments').then((data) => {
			console.log('comments', data);
			_this.setState({ticket_comments: data});
		});
	}
	handleComment(e) {
		current_ticket_id = e;
		ReactDOM.render(<Comment/>, document.getElementById('main'));
	}
	handleAllot(e) {
		ReactDOM.render(<Userlist/>, document.getElementById('main'));
	}
	sendAssignTem(e) {
		is_assign = false;
		this.setState({ass_template: null});
		xFetchJSON("/api/tickets/" + e + "/assign/" + this.state.wechat_users.id, {
			method: 'PUT'
		}).then((data) => {
		}).catch((e) => {
		});
	}
	render() {
		const _this = this;
		const ticket = this.state.ticket;
		if (!ticket.id) {
			return <div><br/><br/><br/><br/><br/><br/>
				<center>当前没有待处理工单</center>
			</div>
		}
		const comments = this.state.ticket_comments.map((comment) => {
			return <a className="weui-media-box weui-media-box_appmsg" key={comment.id}>
					<div className="weui-media-box__hd">
						<img className="weui-media-box__thumb" src={comment.avatar_url} alt=""/>
					</div>
					<div className="weui-media-box__bd">
						<div className="weui-form-preview__item">
							<div className="weui-form-preview__bd">
								<div className="weui-form-preview__item">
									<label className="weui-form-preview__label" style={{color:"black",fontSize:"15px"}}>{comment.user_name}</label>
									<span className="weui-form-preview__value">{comment.created_epoch}</span>
								</div>
								<div className="weui-form-preview__item">
									<label className="weui-form-preview__label" style={{color:"black",fontSize:"15px"}}>{comment.content.slice(0,20)}</label>
									<span className="weui-form-preview__value"></span>
								</div>
							</div>
						</div>
					</div>
				</a>
		})
		var wechat = _this.state.wechat_users;
		if(wechat){
			if(is_assign){
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
		}else{
			var assigns = <a className="weui-form-preview__btn weui-form-preview__btn_primary" onClick={ () => _this.handleAllot(ticket.id)}>派发</a>
		}
		return <div>
			<div className="weui-cells__title">
				<h1 style={{ textAlign:"center",color:"black" }}>{ticket.subject}</h1>
			{/* <p>
				{ticket.content}
			</p> */}
			</div>
		<div className="weui-form-preview">
			<div className="weui-form-preview__bd">
				<div className="weui-form-preview__item">
					<span style={{color:"black"}} className="weui-form-preview__label">时间</span>
					<span className="weui-form-preview__value">{ticket.created_epoch}</span>
				</div>
			</div>
			<div className="weui-form-preview__ft">
			</div>
			<div className="weui-form-preview__bd">
				<div className="weui-form-preview__item">
					<span style={{color:"black"}} className="weui-form-preview__label">派单人</span>
					<span className="weui-form-preview__value">{ticket.user_name}</span>
				</div>
			</div>
			<div className="weui-form-preview__ft">
			</div>
			<div className="weui-form-preview__bd">
				<div className="weui-form-preview__item">
					<span style={{color:"black"}} className="weui-form-preview__label">执行人</span>
					<span className="weui-form-preview__value">{ticket.current_user_name}</span>
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
		</div>
		<article className="weui-article">
			<section>
				<p>{ticket.content}</p>
			</section>
		</article>
		{assigns}
		<br/>
			<a className="weui-form-preview__btn weui-form-preview__btn_primary" onClick={() => _this.handleComment(ticket.id)}>添加评论</a>
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
		</div>
	}
}

class Userlist extends React.Component {
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
									<span className="weui-form-preview__value" style={{fontSize:"12px",color:"black"}}>{row.name}&nbsp;&nbsp;&nbsp;{row.extn}&nbsp;&nbsp;&nbsp;{row.nickname}</span>
								</div>
							</div>
						</a>
					</div>
				})
		return <div>
			<div className="weui-form-preview__bd">
				<div className="weui-form-preview__item">
					<span style={{color:"black"}} className="weui-form-preview__label">选择用户</span>
				</div>
			</div>
			{wechat_users}
		</div>
	}
}
class Comment extends React.Component {
	constructor(props) {
		super(props);
		this.state = {ticket_comments: [], content: []};
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
		if(this.state.comment_content){
			xFetchJSON("/api/tickets/" + current_ticket_id + "/comments", {
				method: 'POST',
				body: JSON.stringify({content: this.state.comment_content})
			}).then((data) => {
				ReactDOM.render(<Home/>, document.getElementById('main'));
			}).catch((e) => {
			});
		}
	}
	noComments() {
		ReactDOM.render(<Home/>, document.getElementById('main'));
	}
	render(){
		const _this = this;
		const comments = this.state.ticket_comments.map((comment) => {
			return <a className="weui-media-box weui-media-box_appmsg" key={comment.id}>
					<div className="weui-media-box__hd">
						<img className="weui-media-box__thumb" src={comment.avatar_url} alt=""/>
					</div>
					<div className="weui-media-box__bd">
					
					<div className="weui-form-preview__item">
						<span className="weui-form-preview__label">
							<h4 className="weui-media-box__title">{comment.user_name}:</h4>
							<p className="weui-media-box__desc">{comment.content}</p>
						</span>
						<span className="weui-form-preview__value" style={{fontSize:"12px",float:"right",color:"gray"}}>{comment.created_epoch}</span>
						</div>
					</div>
				</a>
		})
		const current_img = _this.state.localIds.map((c_img) => {
			return <div>
					<img src={c_img} style={{width:"120px",height:"120px"}}/><a onClick={ () => _this.delLocalId(c_img)}>X</a>
				</div>
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
				</div>
				<div className="weui-form-preview__bd">
					<a href="javascript:;" className="weui-btn weui-btn_primary" onClick={ () => _this.addComments()}>添加评论</a>
				</div>
				<div className="weui-form-preview__bd">
					<a href="javascript:;" className="weui-btn weui-btn_warn" onClick={ () => _this.noComments()}>取消</a>
				</div>
			</div>
	}
}

class Newticket extends React.Component {
	constructor(props) {
		super(props);
		this.state = {input: {}, ticket_type: []}
	}
	componentDidMount() {
		xFetchJSON("/api/dicts/", {
			method:"GET",
			headers: {"realm":"TICKET_TYPE"}
		}).then((data) => {
			this.setState({ticket_type: data})
		}).catch((msg) => {
			console.error("dicts", msg);
		});
		this.setState({users: null})
	}
	handleCidNumber(e) {
		console.log('input', e.target.value);
		this.state.input.cid_number = e.target.value;
	}
	handleContent(e) {
		console.log('input', e.target.value);
		this.state.input.content = e.target.value;
	}
	handleType(e) {
		console.log('input', e.target.value);
		this.state.input.type = e.target.value;
	}
	handleSubject(e) {
		console.log('input', e.target.value);
		this.state.input.subject = e.target.value;
	}
	newTicketAdd(e) {
		var _this = this;
		if(!_this.state.input.cid_number || !_this.state.input.subject){
			return false;
		}
		const ticket = _this.state.input;
		xFetchJSON("/api/tickets", {
			method:"POST",
			body: JSON.stringify(ticket)
		}).then((data) => {
			ReactDOM.render(<Tickets/>, document.getElementById('main'));
		}).catch((msg) => {
			console.error("ticket", msg);
		});
	}
	render() {
		 const ticket_type = this.state.ticket_type.map((type) => {
			 return <option value={type.k}>{type.v}</option>
		 })
		return <div>
				<div className="weui-cells weui-cells_form">
					<div className="weui-cells__title">
						<h1 style={{ textAlign:"center" }}>新建工单</h1>
					</div>
					<div className="weui-cell">
						<div className="weui-cell__hd">
							<label className="weui-label">主叫号码</label>
						</div>
						<div className="weui-cell__bd">
							<input className="weui-input" type="number" onChange={this.handleCidNumber.bind(this)} pattern="[0-11]*" placeholder="请输入主叫号码"/>
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
				</div>
				<div className="weui-cells__title">类型</div>
				<div className="weui-cells">
					<div className="weui-cell weui-cell_select">
						<div className="weui-cell__bd">
							<select className="weui-select" name="select1" onChange={this.handleType.bind(this)}>
								{ticket_type}
							</select>
						</div>
					</div>
				</div>
				<div className="weui-cells__title">内容</div>
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
		this.state = {tickets: []};
	}
	componentDidMount() {
		var _this = this;
		xFetchJSON("/api/wechat/xyt/all").then((data) => {
			console.log("ticket", data);
			_this.setState({tickets: data});
		}).catch((e) => {
			console.error("get ticket", e);
		});
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
		const tickets = this.state.tickets.map((ticket) => {
			return <div className="weui-form-preview__bd" onClick={() => _this.handleClick(ticket.id)} key={ticket.id} >
						<div className="weui-form-preview__item">
							<label className="weui-form-preview__label" style={{color:"black"}}>{ticket.subject}</label>
							<span className="weui-form-preview__value" style={{color:"black"}}>{ticket.cid_number}</span>
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
		console.log("tickets", tickets);
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
		this.state = {users: []};
	}
	render() {
		var users = this.state.users;
		return <div className="weui-cells weui-cells_form">
					<div className="weui-media-box__hd">
						<img className="weui-media-box__thumb" style={{width:"40%",marginLeft:"30%"}} src="http://www.x-y-t.cn/img/banner/xyt.jpg" alt=""/>
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
							<img src="http://weui.github.io/weui/images/icon_nav_button.png" alt=""/>
						</div>
						<p className="weui-tabbar__label">我的</p>
					</a>
					<a className="weui-tabbar__item" onClick={() => _this.handleClick("tickets")}>
						<div className="weui-tabbar__icon">
							<img src="http://weui.github.io/weui/images/icon_nav_article.png" alt=""/>
						</div>
						<p className="weui-tabbar__label">全部</p>
					</a>
					<a className="weui-tabbar__item">
						<div className="weui-tabbar__icon" onClick={() => _this.handleClick("settings")}>
							<img src="http://weui.github.io/weui/images/icon_nav_cell.png" alt=""/>
						</div>
						<p className="weui-tabbar__label">设置</p>
					</a>
				</div>
			</div>
	}
}

wx.ready(function () {
	console.log("wx ready!");
	is_wx_ready = true;

	const shareData = {
		title: '小樱桃工单',
		desc: '小樱桃工单',
		link: location.href.split('#')[0] + 1,
		imgUrl: 'http://xswitch.cn/assets/img/ticket.png'
	};

	wx.onMenuShareAppMessage(shareData);
});

xFetchJSON('/api/wechat/xyt/jsapi_ticket?url=' + escape(location.href.split('#')[0])).then((data) => {
	console.log('signPackage', data);
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
			'onMenuShareAppMessage'
		]
	});
});

ReactDOM.render(<Home/>, document.getElementById('main'));
ReactDOM.render(<App/>, document.getElementById('body'));
