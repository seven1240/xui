'use strict';

import React from 'react'
import ReactDOM from 'react-dom';
import { xFetchJSON } from '../jsx/libs/xtools';

var is_wx_ready = false;
var loc = {};

class SelectSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {options: [], name: ''};
	}

	componentDidMount() {
	}

	autoComplete(e) {
		console.log(e.target.value);

		const options = this.props.options.filter((o) => {
			return o.name.indexOf(e.target.value) >= 0;
		});

		this.setState({name: e.target.value, options : options});

		if (this.props.onChange) {
			this.props.onChange({value: e.target.value});
		}
	}

	handleClick(name) {
		this.setState({name: name, options: []});

		if (this.props.onChange) {
			this.props.onChange({value: name});
		}
	}

	hideComplete() {
		this.setState({options: []});
	}

	render () {
		const _this = this;

		return <div>
			<input className = "weui_input" value={this.state.name} placeholder={this.props.placeholder}
				onChange={this.autoComplete.bind(this)}
				onBlur={this.hideComplete.bind(this)} />

			{
				this.state.options.length == 0 ? null :
				<div style={{position: "absolute", zIndex: 1000, backgroundColor: "#FFF", border: "1px solid #DDD"}}>
				{
					this.state.options.map((o) => {
						return <div onClick={() => _this.handleClick(o.name)}>{o.name}</div>
					})
				}
				</div>
			}
		</div>
	}

}

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {lines: []};
	}

	componentDidMount() {
		var _this = this;

		xFetchJSON('/api/bus/lines').then((data) => {
			this.setState({lines: data});
		});
	}

	handleClick() {
		wx.openLocation({
			latitude: loc.latitude, // 纬度，浮点数，范围为90 ~ -90
			longitude: loc.longitude, // 经度，浮点数，范围为180 ~ -180。
			name: 'Here', // 位置名
			address: 'Address', // 地址详情说明
			scale: 1, // 地图缩放级别,整形值,范围从1~28。默认为最大
			infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
		});

	}

	render() {
		const _this = this;
		return <div>
			{
				this.state.lines.map((line) => {
					return <li>{line.line_code}: {line.line_type_name}</li>
				})
			}

			<br/><br/><br/><br/><br/><br/>
			<div onClick={this.handleClick.bind(this)}>
				<center>打开地图</center>
			</div>
		</div>
	}
}

class Stations extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return <div>站点查询</div>
	}
}

class Change extends React.Component {
	constructor(props) {
		super(props);
		this.state = {candidates: [], stations: [{name: 'Swedish', value: 'sv'},
			{name: 'English', value: 'en'}], station1: null, station2: null};

		this.onChange1 = this.onChange1.bind(this);
		this.onChange2 = this.onChange2.bind(this);

		const _this = this;
		xFetchJSON('/api/bus/station').then((data) => {
			console.log(data);
			_this.setState({stations: data});
		});
	}

	onChange1(e) {
		this.setState({station1: e.value})
	}

	onChange2(e) {
		this.setState({station2: e.value})
	}

	handleSearchInterchange(e) {
		e.preventDefault();
		const _this = this;

		xFetchJSON('/api/bus/interchange?start=' + this.state.station1 + '&stop=' + this.state.station2).then((data) => {
			console.log(data);
			_this.setState({candidates: data});
		});
	}

	render() {
		var content;
		if (this.state.candidates.length !== 1) {
			content = <ul> {
				this.state.candidates.map((candidate) => {
					return <div className="weui-cell weui-cell_access">
							<div className="weui-cell__bd">
							<li style={{listStyle:"none",fontSize:"14px"}}>
							{candidate.line1}路 -&nbsp;
							[{candidate.off1}站] -&nbsp;
							{candidate.stat_name1} -&nbsp;
							{candidate.line2}路 -&nbsp;
							[{candidate.off1}站]</li>
						</div>
						<div className="weui-cell__ft"></div>
				</div>
				})
			} </ul>
		}else {
			content = <ul><div className="weui-cell weui-cell_access">
							<div className="weui-cell__bd">
							<li style={{listStyle:"none",fontSize:"14px"}}>
							{this.state.candidates[0].line1}路 -&nbsp;
							[{this.state.candidates[0].off1}站]</li>
						</div>
						<div className="weui-cell__ft"></div>
				</div>
			</ul>
		};

		return <div className="page" style={{padding:"0 15px"}}>
			<h1 className="page__title" style={{textAlign:"center",margin:"10px 0"}}>换乘查询</h1>

			<div className="weui-cell">
				<div className="weui-cell__hd"><label className="weui-label">起点：</label></div>
				<div className="weui-cell__bd">
					<SelectSearch options={this.state.stations} placeholder="请输入出发地" onChange={this.onChange1}/>
				</div>
			</div>

			<div className="weui-cell">
				<div className="weui-cell__hd"><label className="weui-label">终点：</label></div>
				<div className="weui-cell__bd">
					<SelectSearch options={this.state.stations} placeholder="请输入目的地" onChange={this.onChange2}/>
				</div>
			</div>

			<hr/>

			<a href="#" className="weui-btn weui-btn_primary" style={{marginTop:"10px"}} onClick={this.handleSearchInterchange.bind(this)}>查询</a>
			<br/>

			<div class="page__bd">
			{content}
			</div>

		</div>
	}
}

class App extends React.Component{
	handleClick(menu) {
		switch(menu) {
			case "lines": ReactDOM.render(<Home/>, document.getElementById('main')); break;
			case "stations": ReactDOM.render(<Stations/>, document.getElementById('main')); break;
			case "change": ReactDOM.render(<Change/>, document.getElementById('main')); break;
			default: ReactDOM.render(<Home/>, document.getElementById('main'));
		}
	}

	componentDidMount() {
		const _this = this;

		wx.openLocation({
			latitude: 0, // 纬度，浮点数，范围为90 ~ -90
			longitude: 0, // 经度，浮点数，范围为180 ~ -180。
			name: '', // 位置名
			address: '', // 地址详情说明
			scale: 1, // 地图缩放级别,整形值,范围从1~28。默认为最大
			infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
		});
	}

	render() {
		const _this = this;
		return <div>
			<div style={{width:"100%",height:"50px"}}></div>
				<div className="weui-tabbar" style={{position: "fixed"}}>
					<a className="weui-tabbar__item" onClick={() => _this.handleClick("lines")}>
						<div className="weui-tabbar__icon">
							<img src="/assets/wechat_img/icon_nav_article.png" alt=""/>
						</div>
						<p className="weui-tabbar__label">线路查询</p>
					</a>
					<a className="weui-tabbar__item" onClick={() => _this.handleClick("stations")}>
						<div className="weui-tabbar__icon">
							<img src="/assets/wechat_img/icon_nav_button.png" alt=""/>
						</div>
						<p className="weui-tabbar__label">站点查询</p>
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

	wx.getLocation({
		type:'wgs84',//默认为wgs84的gps坐标，
		//如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
		success:function(res){
			var latitude=res.latitude;
			var longitude=res.longitude;
			var speed=res.speed;
			var accuracy=res.accuracy;
			console.log('经度：'+latitude+'，纬度：'+longitude);

			loc = res;
		}
	});
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
