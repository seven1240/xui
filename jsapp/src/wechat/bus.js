'use strict';

import React from 'react'
import ReactDOM from 'react-dom';
import T from 'i18n-react';
import { xFetchJSON } from '../jsx/libs/xtools';

var is_wx_ready = false;

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {ticket: {}, user_options: null, ass_template: null, call:"回拨", ticket_comments: [], wechat_users: props.users, deal_user: null};
	}

	componentDidMount() {
		var _this = this;
	}

	render() {
		const _this = this;
		const ticket = this.state.ticket;
		if (!ticket.id) {
			return <div><br/><br/><br/><br/><br/><br/>
				<center>查询</center>
			</div>
		}

		return <div>
			<div className="weui-cells__title">
				<h1 style={{ textAlign:"center",color:"black" }}>{ticket.subject}</h1>
			{/* <p>
				{ticket.content}
			</p> */}
			</div>
			<div className="weui-form-preview__bd">
				<div className="weui-form-preview__item">
					<span style={{color:"black"}} className="weui-form-preview__label">{ticket.serial_number}</span>
					<span className="weui-form-preview__value">{ticket.created_epoch}</span>
				</div>
			</div>
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

	render() {
		var _this = this;

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
				</div>
	}
}

class Lines extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return <div>线路</div>
	}
}

class Change extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return <div>换乘查询</div>
	}
}

class App extends React.Component{
	handleClick(menu) {
		switch(menu) {
			case "realtime": ReactDOM.render(<Home/>, document.getElementById('main')); break;
			case "lines": ReactDOM.render(<Lines/>, document.getElementById('main')); break;
			case "change": ReactDOM.render(<Change/>, document.getElementById('main')); break;
			default: ReactDOM.render(<Home/>, document.getElementById('main'));
		}
	}

	render() {
		const _this = this;
		return <div>
			<div style={{width:"100%",height:"50px"}}></div>
				<div className="weui-tabbar" style={{position: "fixed"}}>
					<a className="weui-tabbar__item" onClick={() => _this.handleClick("realtime")}>
						<div className="weui-tabbar__icon">
							<img src="/assets/wechat_img/icon_nav_button.png" alt=""/>
						</div>
						<p className="weui-tabbar__label">实时查询</p>
					</a>
					<a className="weui-tabbar__item" onClick={() => _this.handleClick("lines")}>
						<div className="weui-tabbar__icon">
							<img src="/assets/wechat_img/icon_nav_article.png" alt=""/>
						</div>
						<p className="weui-tabbar__label">线路查询</p>
					</a>
					<a className="weui-tabbar__item">
						<div className="weui-tabbar__icon" onClick={() => _this.handleClick("change")}>
							<img src="/assets/wechat_img/icon_nav_cell.png" alt=""/>
						</div>
						<p className="weui-tabbar__label">换乘查询</p>
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
			'onMenuShareAppMessage'
		]
	});
});

ReactDOM.render(<Home/>, document.getElementById('main'));
ReactDOM.render(<App/>, document.getElementById('body'));
