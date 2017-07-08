'use strict';

import React from 'react'
import ReactDOM from 'react-dom';
import { xFetchJSON } from '../jsx/libs/xtools';

var is_wx_ready = false;
var loc = {};

function addMarker(point, index) {
	var myIcon = new BMap.Icon("/assets/img/maps/point.png", new BMap.Size(16, 16), {
		offset: new BMap.Size(0, 0)
	});

	var marker = new BMap.Marker(point, {icon: myIcon});
	window.map.addOverlay(marker);
}

function addLabel(point, label) {
	var myLabel = new BMap.Label(label, {
		offset: new BMap.Size(0, 0),
		position:point
	});

	// myLabel.setTitle("我是文本标注label");
	window.map.addOverlay(myLabel);
}

class SelectSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {options: [], name: ''};
	}

	componentDidMount() {
	}

	autoComplete(e) {
		console.log('autoComplete', e.target.value);

		const options = this.props.options.filter((o) => {
			return o.stat_name.indexOf(e.target.value) >= 0;
		});

		this.setState({name: e.target.value, options : options});

		if (this.props.onChange) {
			this.props.onChange({value: e.target.value});
		}
	}

	handleClick(name) {
		console.log('clicked name', name);

		this.setState({name: name, options: []});

		if (this.props.onChange) {
			this.props.onChange({value: name});
		}
	}

	hideComplete() {
		// this.setState({options: []});
	}

	render () {
		const _this = this;

		return <div>
			<input className = "weui-input" value={this.state.name} placeholder={this.props.placeholder}
				onChange={this.autoComplete.bind(this)}
				onBlur={this.hideComplete.bind(this)} />

			{
				this.state.options.length == 0 ? null :
				<div style={{position: "absolute", zIndex: 1000, backgroundColor: "#FFF", border: "1px solid #DDD"}}>
				{
					this.state.options.map((o) => {
						return <li style={{listStyle: 'none', padding: "5px"}}
							onClick={() => _this.handleClick(o.stat_name)}>
							{o.stat_name}
						</li>
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

class TransferMap extends React.Component {
	constructor(props) {
		super(props);
		this.state = {stations: []};
	}

	loadScript() {
		var script = document.createElement("script");
		script.src = "http://api.map.baidu.com/api?v=2.0&ak=OGvbL6kRPgyBoV8q3bCgxeHfN6DKdOrx&callback=initializeBaiduMap";
		document.body.appendChild(script);
	}

	setupStations() {
		this.state.stations.forEach((station) => {
			const point = new BMap.Point(station.baidu_x, station.baidu_y);
			addMarker(point, 0);
			addLabel(point, station.stat_name);
		});

		const polyLineData = this.state.stations.map((station) => {
			return new BMap.Point(station.baidu_x, station.baidu_y);
		});

		const polyLine = new BMap.Polyline(polyLineData, {
			strokeColor: "blue", strokeWeight: 2, strokeOpacity: 0.5
		});

		window.map.addOverlay(polyLine);
	}

	initializeBaiduMap() {
		console.log("initializeBaiduMap", this);

		window.map = new BMap.Map("allmap");

		if (true || !loc.longitude) { // hardcoded for test
			loc = {longitude: 120.40086416919, latitude: 37.37223326585};
		}

		if (loc.longitude) {
			window.map.centerAndZoom(new BMap.Point(loc.longitude, loc.latitude), 14);
		}

		if (this.state.pendingSetupStations) {
			this.setupStations();
		}
	}

	componentDidMount() {
		const _this = this;

		window.initializeBaiduMap = this.initializeBaiduMap.bind(this);
		this.loadScript();

/*
		xFetchJSON('/api/bus/points?lines=' + this.props.candidate.lines +
			'&all_lines=' + this.props.candidate.lines +
			'&stat_names=' + this.props.candidate.stat_names, function(stations) {

			console.log('stations', stations);
			this.setState({stations, stations});
		});
*/

		const station_names = this.props.candidate.stat_names.split('-');
		const lines = this.props.candidate.all_lines.split('-');
		let i = 0;
		let j = 0;

		lines.forEach((line) => {
			const start = station_names[i]
			const stop = station_names[i+1];

			xFetchJSON('/api/bus/lines/' + line + '/stations?start=' + start + '&stop=' + stop).then((data) => {
				const _this = this;
				console.log('stations', data);
				_this.setState({stations: _this.state.stations.concat(data)});

				j++;

				if (j == lines.length) {
					if (window.map) {
						this.setupStations();
					} else {
						this.state.pendingSetupStations = true;
					}
				}
			});

			i++;
		});
	}

	render() {
		let height = 580;
		height = window.innerHeight - 40;

		return <div>
			{this.props.candidate.stat_names}
			{this.props.candidate.all_lines}
			<div id = "allmap" style={{width: "100%", height: height}} />
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

	showOnMap(candidate) {
		ReactDOM.render(<TransferMap candidate={candidate}/>, document.getElementById('main'));
	}

	render() {
		const _this = this;
		var content;

		if (this.state.candidates.length !== 1) {
			content = <ul> {
				this.state.candidates.map((candidate) => {
					return <div className="weui-cell weui-cell_access">
							<div className="weui-cell__bd">
							<li style={{listStyle:"none",fontSize:"14px"}}
								onClick={() => _this.showOnMap(candidate)}>
								[共{candidate.offs}站]&nbsp;
								{candidate.line1}路
								[{candidate.off1}站]&nbsp;
								{candidate.stat_name1}&nbsp;
								{candidate.line2}路
								[{candidate.off2}站]&nbsp;
							</li>
						</div>
						<div className="weui-cell__ft"></div>
				</div>
				})
			} </ul>
		}else {
			content = <ul><div className="weui-cell weui-cell_access">
							<div className="weui-cell__bd">
							<li style={{listStyle:"none",fontSize:"14px"}}
								onClick={() => _this.showOnMap(this.state.candidates[0])}>
							{this.state.candidates[0].line1}路&nbsp;
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
					<SelectSearch options={this.state.stations} placeholder="请输入出发站" onChange={this.onChange1}/>
				</div>
			</div>

			<div className="weui-cell">
				<div className="weui-cell__hd"><label className="weui-label">终点：</label></div>
				<div className="weui-cell__bd">
					<SelectSearch options={this.state.stations} placeholder="请输入目的站" onChange={this.onChange2}/>
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

			if (window.map) {
				window.map.centerAndZoom(new BMap.Point(loc.longitude, loc.latitude), 14);
			}
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
