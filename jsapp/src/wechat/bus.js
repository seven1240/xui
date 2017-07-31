'use strict';

import React from 'react'
import ReactDOM from 'react-dom';
import { xFetchJSON } from '../jsx/libs/xtools';
import { FormControl } from 'react-bootstrap';

var is_wx_ready = false;
var loc = {};

function is_in_zhaoyuan(x, y) {
	let min_x = 120.133;
	let max_x = 120.633;
	let min_y = 37.083;
	let max_y = 37.55;

	return (parseFloat(x) > parseFloat(min_x) && parseFloat(x) < parseFloat(max_x))
		&& (parseFloat(y) > parseFloat(min_y) && parseFloat(y) < parseFloat(max_y));
}

/*
Becase the global object defined here can't be finded by baidu map's alert windows, I add them in window object.
*/
window.start = '';
window.end = '';
window.station_view_this;

window.setStart = function(stat_name) {
	window.start = stat_name;
	alert('已设为起点，请到换乘查询页面进行查询');
}

window.setEnd = function(stat_name) {
	window.end = stat_name;
	alert('已设为终点，请到换乘查询页面进行查询');	
}

function loadScript() {
	var script = document.createElement("script");
	script.src = "http://api.map.baidu.com/api?v=2.0&ak=OGvbL6kRPgyBoV8q3bCgxeHfN6DKdOrx&callback=initializeBaiduMap";
	document.body.appendChild(script);
}

function drawLineAndCars(line_code, type, _this, station_click_func) {
	if (!window.map) {return;}

	let is_station_loaded = 'unload';
	let cars;

	window.map.clearOverlays();

	xFetchJSON('http://zyjt.xswitch.cn/bus_api/site/mapStations', {
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			body: 'line=' + line_code + '&up_down' + type
		}).then((data) => {
		if (data.code != 1) {
			console.error('response json error', data);
			return;
		}
		let stations = data.list;
		let i = 0;

		if (station_click_func) {
			drawStations(stations, _this, station_click_func);
		} else {
			drawStations(stations, _this, _this.onMarkerClick);
		}

		setCenterPosition(stations);

		for (i = 0; i < stations.length - 1; i++) {
			addArrowLine(window.map, stations[i].baidu_x, stations[i].baidu_y,
				stations[i+1].baidu_x, stations[i+1].baidu_y, 'red', 4, 2, false);
		}

		is_station_loaded = 'load';

		if (cars) {
			drawCars(cars);
		}
	});

	xFetchJSON('http://zyjt.xswitch.cn/bus_api/site/realData', {
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			body: 'line=' + line_code + '&up_down' + type + '&xpoint=1&ypoint=1'
	}).then((data) => {
		if (data.code != 1) {
			console.error('response json error', data);
			return;
		}

		if (is_station_loaded == 'load') {
			drawCars(data.res);
		} else {
			cars = data.res;
		}
	});
}

function searchWhere(_this, where) {
	window.map.centerAndZoom(new BMap.Point('120.40086416919', '37.37223326585'), 14);

	var options = {
		onSearchComplete: function(results){
			// 判断状态是否正确
			let center_point;
			if (local.getStatus() == BMAP_STATUS_SUCCESS){
				window.map.clearOverlays();
				var s = [];
				// let min_x = 99999, max_x = 0, min_y = 999999, max_y = 0;

				for (var i = 0; i < results.getCurrentNumPois(); i ++){
					let poi = results.getPoi(i);

					if (is_in_zhaoyuan(poi.point.lng, poi.point.lat)) {
						if (!center_point) center_point = poi.point;
						console.log('in zhaoyuan', poi.point.lng, poi.point.lat);
					} else {
						console.log('no in zhaoyuan', poi.point.lng, poi.point.lat);
						continue;
					}

					_this.addMarker(poi.point, _this.onMyLocationClick.bind(_this), poi.title, 'false');

					// s.push(results.getPoi(i).title + ", " + results.getPoi(i).address);

					// if (parseFloat(max_x) < parseFloat(poi.point.lng)) { max_x = poi.point.lng}
					// if (parseFloat(max_y) < parseFloat(poi.point.lat)) { max_y = poi.point.lat}
					// if (parseFloat(min_x) > parseFloat(poi.point.lng)) { min_x = poi.point.lng}
					// if (parseFloat(min_y) > parseFloat(poi.point.lat)) { min_y = poi.point.lat}
				}

				// let center_x = (parseFloat(max_x) + parseFloat(min_x))/2;
				// let center_y = (parseFloat(max_y) + parseFloat(min_y))/2;

				// if (parseFloat(center_x) > 0) {
				// 	window.map.centerAndZoom(new BMap.Point(center_x, center_y), 14);
				// }
				/*
				I used the max/min point to set the center position before, but I find the map view don't show any search results when the max/min point is too far from the others.
				So, I use the first search result as the center position.
				*/
				if (center_point) {
					window.map.centerAndZoom(center_point, 14);
				}

				// console.error('s', s);
			}
		}
	};
	var local = new BMap.LocalSearch(map, options);
	local.search(where);
}
/*
param must contains stat_name
*/
function drawCars(cars) {
	if (cars.length == 0) { return;}
	cars.forEach((c) => {
		let point = getPosition(c.stat_name);
		if (point) {
			addBusMarker(point, 'bus-blue.png');
		}
	});
}

function getPosition(name) {
	let markers = window.map.getOverlays();
	let i = 0;
	let marker;

	for (i; i < markers.length; i++) {
		marker = markers[i];
		if (marker.content == name) {
			break;
		}
	}

	if (marker) {
		return marker.point;
	}
}

/*
draw stations
By default, the click event function must named onMarkerClick.
*/
function drawStations(stations, _this, func) {
	stations.forEach((station) => {
		const point = new BMap.Point(station.baidu_x, station.baidu_y);
		if (func) {
			addMarker(point, station, func.bind(_this));
			addLabel(point, station.stat_name, station, func.bind(_this));
		} else {
			addMarker(point, station, _this.onMarkerClick.bind(_this));
			addLabel(point, station.stat_name, station, _this.onMarkerClick.bind(_this));
		}		
	});
}

function alertStationWindow(station) {
	xFetchJSON('/api/bus/station/lines?name=' + station.stat_name).then((data) => {
		console.log('lines for station', data);

		const opts = {
			width : '',
			height: '',
			title : station.stat_name
		}

		let text = '<br>';
		let lines_showed = [];
		data.forEach((l) => {
			if (lines_showed.includes(l.line_code)) {
				return;
			}
			lines_showed.push(l.line_code);
			if (l.line_code == station.line_code) {
				text += '<font color="#FF0000">' + l.line_code + '路: ' + l.start_station + '-' + l.stop_station + '</font><br>';
			} else {
				text += '<font>' + l.line_code + '路: ' + l.start_station + '-' + l.stop_station + '</font><br>';
			}
		});

		const infoWindow = new BMap.InfoWindow(text, opts);
		window.map.openInfoWindow(infoWindow, new BMap.Point(station.baidu_x, station.baidu_y));
	});
}

/*
param must contains baidu_x, baidu_y
*/
function setCenterPosition(stations) {
	let max_x = stations[0].baidu_x;
	let max_y = stations[0].baidu_y;
	let min_x = stations[0].baidu_x;
	let min_y = stations[0].baidu_y;
	/* set center position*/
	stations.forEach((station) => {
		if (parseFloat(max_x) < parseFloat(station.baidu_x)) { max_x = station.baidu_x}
		if (parseFloat(max_y) < parseFloat(station.baidu_y)) { max_y = station.baidu_y}
		if (parseFloat(min_x) > parseFloat(station.baidu_x)) { min_x = station.baidu_x}
		if (parseFloat(min_y) > parseFloat(station.baidu_y)) { min_y = station.baidu_y}
	});

	let center_x = (parseFloat(max_x) + parseFloat(min_x))/2;
	let center_y = (parseFloat(max_y) + parseFloat(min_y))/2;
	let center_point = new BMap.Point(center_x, center_y);

	window.map.centerAndZoom(center_point, 14);
}


window.get_line = function(line_code, type) {
	if (!window.map) {return;}

	let is_station_loaded = 'unload';
	let cars;

	window.map.clearOverlays();

	xFetchJSON('http://zyjt.xswitch.cn/bus_api/site/mapStations', {
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			body: 'line=' + line_code + '&up_down' + type
		}).then((data) => {
		if (data.code != 1) {
			console.error('response json error', data);
			return;
		}
		let stations = data.list;
		let _this = window.station_view_this;
		let i = 0;

		drawStations(stations, _this, _this.onMarkerClick2);
		setCenterPosition(stations);

		for (i = 0; i < stations.length - 1; i++) {
			addArrowLine(window.map, stations[i].baidu_x, stations[i].baidu_y,
				stations[i+1].baidu_x, stations[i+1].baidu_y, 'red', 4, 2, false);
		}

		is_station_loaded = 'load';

		if (cars) {
			drawCars(cars);
		}
	});

	xFetchJSON('http://zyjt.xswitch.cn/bus_api/site/realData', {
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			body: 'line=' + line_code + '&up_down' + type + '&xpoint=1&ypoint=1'
	}).then((data) => {
		if (data.code != 1) {
			console.error('response json error', data);
			return;
		}

		if (is_station_loaded == 'load') {
			drawCars(data.res);
		} else {
			cars = data.res;
		}
	});
}

function pushHistory(title, url) {
	var state = {
		title: title,
		url: url
	};
	window.history.pushState(state, title, url);
}

function addMarker(point, data, func) {
	var myIcon = new BMap.Icon("/assets/img/maps/point.png", new BMap.Size(16, 16), {
		offset: new BMap.Size(0, 0)
	});

	var marker = new BMap.Marker(point, {icon: myIcon});

	if (func) {
		marker.addEventListener("click", () => {
			func(data);
		});
	}

	window.map.addOverlay(marker);
}

function addBusMarker(point, png) {
	var myIcon = new BMap.Icon("/assets/img/maps/" + png, new BMap.Size(46, 44), {
		offset: new BMap.Size(0, 0)
	});

	var marker = new BMap.Marker(point, {icon: myIcon});

	window.map.addOverlay(marker);
}

function addLabel(point, label, data, func) {
	var myLabel = new BMap.Label(label, {
		offset: new BMap.Size(0, 0),
		position:point
	});

	if (func) {
		myLabel.addEventListener("click", () => {
			func(data);
		});
	}

	window.map.addOverlay(myLabel);
}

function addArrowLine(map, from_x, from_y, to_x, to_y, color, weight, opacity, isdashed, onclick_function)
{
	var line_style = {strokeColor:color, strokeWeight:weight, strokeOpacity:opacity};
	var polyline = new BMap.Polyline([new BMap.Point(from_x, from_y), new BMap.Point(to_x, to_y)], line_style);

	if (onclick_function != null) {
		polyline.addEventListener("click", onclick_function);
	}

	if (isdashed) polyline.setStrokeStyle("dashed");

	map.addOverlay(polyline);

	//arrow
	var length = 2;
	var angleValue = Math.PI/6;
	var linePoint = polyline.getPath();
	var arrowCount = linePoint.length;
	for (var i = 1; i < arrowCount; i++) {
		var x = (parseFloat(linePoint[i - 1].lng) + parseFloat(linePoint[i].lng)) / 2;
		var y = (parseFloat(linePoint[i - 1].lat) + parseFloat(linePoint[i].lat)) / 2;
		var mid = new BMap.Point(x, y);
		var pixelStart = map.pointToPixel(linePoint[i - 1]);
		var pixelEnd = map.pointToPixel(mid);
		var angle = angleValue;
		var r = length;
		var delta = 0;
		var param = 0;
		var pixelTemX, pixelTemY;
		var pixelX, pixelY, pixelX1, pixelY1;

		if (pixelEnd.x - pixelStart.x == 0) {
			pixelTemX = pixelEnd.x;

			if(pixelEnd.y > pixelStart.y) {
				pixelTemY = pixelEnd.y - r;
			} else {
				pixelTemY = pixelEnd.y + r;
			}

			pixelX = pixelTemX - r * Math.tan(angle);
			pixelX1 = pixelTemX + r * Math.tan(angle);
			pixelY = pixelY1 = pixelTemY;
		} else {
			delta = (pixelEnd.y - pixelStart.y) / (pixelEnd.x - pixelStart.x);
			param = Math.sqrt(delta * delta + 1);

			if ((pixelEnd.x - pixelStart.x) < 0) {
				pixelTemX = pixelEnd.x + r / param;
				pixelTemY = pixelEnd.y + delta * r / param;
			} else {
				pixelTemX = pixelEnd.x - r / param;
				pixelTemY = pixelEnd.y - delta * r / param;
			}

			pixelX = pixelTemX + Math.tan(angle) * r * delta / param;
			pixelY = pixelTemY - Math.tan(angle) * r / param;
			pixelX1 = pixelTemX - Math.tan(angle) * r * delta / param;
			pixelY1 = pixelTemY + Math.tan(angle) * r / param;
		}

		var pointArrow = map.pixelToPoint(new BMap.Pixel(pixelX, pixelY));
		var pointArrow1 = map.pixelToPoint(new BMap.Pixel(pixelX1, pixelY1));
		var Arrow = new BMap.Polyline([pointArrow, mid, pointArrow1], line_style);

		map.addOverlay(Arrow);
	}
}

function addArrowLineWithoutArrow(map, from_x, from_y, to_x, to_y, color, weight, opacity, isdashed, onclick_function)
{
	var line_style = {strokeColor:color, strokeWeight:weight, strokeOpacity:opacity};
	var polyline = new BMap.Polyline([new BMap.Point(from_x, from_y), new BMap.Point(to_x, to_y)], line_style);

	if (onclick_function != null) {
		polyline.addEventListener("click", onclick_function);
	}

	if (isdashed) polyline.setStrokeStyle("dashed");

	map.addOverlay(polyline);
}


class SelectSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {options: [], name: props.station};
	}

	componentDidMount() {
	}

	autoComplete(e) {
		console.log('autoComplete', e.target.value);

		const options = this.props.options.filter((o) => {
			return o.stat_name.indexOf(e.target.value) >= 0;
		});

		console.log('options', options, options.length);

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

		let stat_name = _this.props.station;

		return <div>
			<input className = "weui-input" value={stat_name} placeholder={this.props.placeholder}
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

class LinePage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {stations: [], traffics: [], self_order: null, self_xpoint: 120.404126, self_ypoint: 37.369088};
	}
	
	initializeBaiduMap() {
		var _this = this;
		console.log("initializeBaiduMap", _this);

		window.map = new BMap.Map("allmap");
		window.map.addControl(new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_RIGHT}));   //add map navigation tools
		window.map.centerAndZoom(new BMap.Point(120.40086416919, 37.37223326585), 14);

		var geolocation = new BMap.Geolocation();
		geolocation.getCurrentPosition(function(r){
			if(this.getStatus() == BMAP_STATUS_SUCCESS){
				_this.setState({self_xpoint: r.point.lng, self_ypoint: r.point.lat});
				// _this.setState({self_xpoint: 120.404126, self_ypoint: 37.369088});
				setInterval(function(){
					xFetchJSON('/api/bus/traffic', {
						method: "POST",
						body: '{"line":'+_this.props.line.line_code+'}'
					}).then((obj) => {
						_this.setState({traffics: obj});
						xFetchJSON('/api/bus/traffic/self', {
							method: "POST",
							body: '{"line":'+_this.props.line.line_code+', "xpoint":'+_this.state.self_xpoint+', "ypoint":'+_this.state.self_ypoint+'}'
						}).then((obj) => {
							_this.setState({self_order: obj[0].station_order});
						}).catch((msg) => {
							console.error("new FIFO Err", msg);
						});
					}).catch((msg) => {
						console.error("new FIFO Err", msg);
					});
				},1000);
			}
			else {
			}
		},{enableHighAccuracy: true})
	}
	
	componentDidMount() {
		const _this = this;

		window.initializeBaiduMap = this.initializeBaiduMap.bind(this);
		loadScript();

		xFetchJSON('/api/bus/lines/' + this.props.line.line_code + '/stations').then((data) => {
			_this.setState({stations: data});
		});
	}

	handleRefresh() {
		// todo
	}

	handleToggleDirection() {
		const _this = this;
		let direction = this.state.stations.length > 0 ? this.state.stations[0].up_down_name : '下行';

		direction = direction == '上行' ? '下行' : '上行';

		xFetchJSON('/api/bus/lines/' + this.props.line.line_code + '/stations?direction=' + direction).then((data) => {
			console.log(data);
			_this.setState({stations: data});
		});
	}

	render() {
		const _this = this;
		const direction = this.state.stations.length > 0 ? this.state.stations[0].up_down_name : '下行';

		return <div>
			<div id = "allmap" style={{width: "0px", height: "0px"}} />
			<div className="weui-cell weui-cell_form">
				<div className="weui-cell__hd" style={{width: "40px"}}>
					<label className="weui-label">
						{this.props.line.line_code}路
					</label>
				</div>
				<div className="weui-cell__bd">
					{this.props.line.stop_station}
					&nbsp;
					{
						direction == '上行' ? <span style={{color: 'red'}}>←</span> :
							<span style={{color: 'blue'}}>→</span>
					}

					&nbsp;
					{this.props.line.start_station}
				</div>
				<div className="weui-cell__ft">
					<div style={{float: "right"}}>
						<button className="weui-btn weui-btn_mini weui-btn_default" onClick={this.handleRefresh.bind(this)}>刷新</button>&nbsp;
						<button className="weui-btn weui-btn_mini weui-btn_default" onClick={this.handleToggleDirection.bind(this)}>换向</button>
					</div>
				</div>
			</div>

		{
			this.state.stations.map((station) => {
				return <div className="weui-cell weui-cell_form">
					<div className="weui-cell__hd" style={{width: "40px"}}>
						<label className="weui-label">
							{
								direction == '上行' ? <span style={{color: 'red'}}>↑</span> :
									<span style={{color: 'blue'}}>↓</span>
							}
							&nbsp;
							{ station.station_order }
						</label>
					</div>
					<div className="weui-cell__bd">
							{station.stat_name}
					</div>
					{
						station.station_order == _this.state.self_order ? <div className="weui-cell__ft"><img src="/assets/img/maps/people.png" alt=""/>您的位置</div>:""
					}
					{
						_this.state.traffics.map((traffic) => {
							if (direction == "下行") {
								if (traffic.bus_status == "0" && traffic.prev_station_id == station.station_order) {
									if (station.station_order - _this.state.self_order > 0) {
										return <div className="weui-cell__ft">
											<img src="/assets/img/maps/bus-blue-small.png" alt=""/>距您还有{station.station_order - _this.state.self_order}站，预计约{(station.station_order - _this.state.self_order)*2}分钟
										</div>
									}
								}
							}
							if (direction == "上行") {
								if (traffic.bus_status == "2" && traffic.prev_station_id == station.station_order) {
									if (station.station_order - _this.state.self_order < 0) {
										return <div className="weui-cell__ft">
											<img src="/assets/img/maps/bus-blue-small.png" alt=""/>距您还有{_this.state.self_order - station.station_order}站，预计约{(_this.state.self_order - station.station_order)*2}分钟
										</div>
									}
								}
							}
						})
					}
				</div>
			})
		}

		</div>
	}
}

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {lines: [], line: null};
	}

	componentDidMount() {
		var _this = this;

		xFetchJSON('/api/bus/lines').then((data) => {
			console.log(data);
			this.setState({lines: data});
		});
	}

	handleClick(line) {
		const _this = this;

		this.setState({linePageShow: true, line: line});
		pushHistory(line.line_code, '#line_code_' + line.line_code);

		const fun = function(e) {
			console.log(e);
			_this.setState({linePageShow: false, line: null});

			window.removeEventListener("popstate", fun);
		};

		window.addEventListener("popstate", fun);
	}

	render() {
		const _this = this;

		if (this.state.linePageShow) {
			return <LinePage line={this.state.line} />
		}

		return <div>
		<ul>
			{
				this.state.lines.map((line) => {
					if (line.line_code > 100) return null;

					return <div className="weui-cell weui-cell_access"
						onClick={() => _this.handleClick(line)}>
						<div className="weui-cell__hd" style={{width: "40px"}}>
							<label className="weui-label">{line.line_code}路</label>
						</div>
						<div className="weui-cell__bd">
								{line.start_station}&nbsp;→&nbsp;
								{line.stop_station}
						</div>
						<div className="weui-cell__ft">6:20<br/>18:30</div>
					</div>
				})
			}

		</ul>
		</div>
	}
}

class StationSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state={ 
			station: props.station, 
			stations: [],
			pendingSetupStations: false
		};

		window.station_view_this = this;
	}

	componentWillUnmount() {
		window.map = null;
	}

	componentDidMount() {
		const _this = this;

		window.initializeBaiduMap = this.initializeBaiduMap.bind(this);
		loadScript();

		if (true || !loc.longitude) { // hardcoded for test
			loc = {longitude: 120.40086416919, latitude: 37.37223326585};
		}

		xFetchJSON('/api/bus/station?station=' + _this.state.station).then((data) => {
			_this.setState({stations: data});
			if (window.map) {
				_this.setupStations();
			} else {
				_this.state.pendingSetupStations = true;
			}
		});
	}

	render() {
		const _this = this;
		var url = '/api/bus/same_station?station=' + _this.props.station;
		xFetchJSON(url).then((data) => {
			if (window.map) { window.map.clearOverlays();}

			drawStations(data, _this, _this.onMarkerClick);
			setCenterPosition(data);
		});

		let height = window.innerHeight - 80;
		return <div>
			<div id = "allmap" style={{width: "100%", height: height}} />
		</div>
	}

	setupStations() {
		const _this = this;
		let stations = this.state.stations;

		drawStations(stations, _this, _this.onMarkerClick);
		setCenterPosition(stations);
	}

	initializeBaiduMap() {
		console.log("initializeBaiduMap", this);

		window.map = new BMap.Map("allmap");
		window.map.addControl(new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_RIGHT}));   //add map navigation tools

		var geolocationControl = new BMap.GeolocationControl({anchor: BMAP_ANCHOR_TOP_LEFT});
		geolocationControl.addEventListener("locationSuccess", function(e){
			console.log('定位成功', e);
		});
		geolocationControl.addEventListener("locationError",function(e){
			console.log('定位失败');
		});
		window.map.addControl(geolocationControl);

		if (true || !loc.longitude) { // hardcoded for test
			loc = {longitude: 120.40086416919, latitude: 37.37223326585};
		}

		if (loc.longitude) {
			window.map.centerAndZoom(new BMap.Point(loc.longitude, loc.latitude), 14);
		}

		if (this.state.pendingSetupLineStations) {
			this.setupLineStations();
		} else if (this.state.pendingSetupStations) {
			this.setupStations();
		}
	}

	onMarkerClick(station) {
		console.log("clicked", station);

		const opts = {
			width : '',
			height: '',
			title : station.stat_name
		}

		xFetchJSON('http://zyjt.xswitch.cn/bus_api/site/getStationDes', {
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			body: 'stat_name='+station.stat_name
		}).then((data) => {
		// xFetchJSON('http://zyjt.xswitch.cn/api/bus/test').then((data) => {
			if(data.code == 1){
				var html = '';

				html += '<a style="color:red;" onclick="window.setStart(\'' + station.stat_name + '\');">设为换乘起点</a> '
					+ '<a style="color:blue;" onclick="window.setEnd(\'' + station.stat_name + '\');">设为换乘终点</a><br><br>';
				data.line_time.forEach((item) => {
					if(item.up_cut){
						var up_cut = "最近的车辆还有"+item.up_cut+"站到达，预计约"+item.up_cut*2+"分钟";
					}else{
						var up_cut = "此站点暂无快到达车辆"
					}
					if(item.down_cut){
						var down_cut = "最近的车辆还有"+item.down_cut+"站到达，预计约"+item.down_cut*2+"分钟";
					}else{
						var down_cut = "此站点暂无快到达车辆"
					}
					html += item.line_code+"路<br/>(<a style='color:red;' onclick='window.get_line("+item.line_code+",1)'>"+item.stop_station+"->"+item.start_station+"</a>"+up_cut+")<br/>(<a style='color:blue;' onclick='window.get_line("+item.line_code+",2)'>"+item.start_station+"->"+item.stop_station+"</a>"+down_cut+")<br/><br/>";
				});

				const infoWindow = new BMap.InfoWindow(html, opts);
				window.map.openInfoWindow(infoWindow, new BMap.Point(station.baidu_x, station.baidu_y));
			}
		});
	}

	onMarkerClick2(station) {
		alertStationWindow(station);
	}
}

class TransferMap extends React.Component {
	constructor(props) {
		super(props);
		this.state={
			lines: {}, stations: [],
			candidate: props.candidate
		};
	}

	onMarkerClick(station) {
		console.log("clicked", station);
		alertStationWindow(station);

		// xFetchJSON('/api/bus/station/lines?name=' + station.stat_name).then((data) => {
		// 	console.log('lines for station', data);

		// 	const opts = {
		// 		width : '',
		// 		height: '',
		// 		title : station.stat_name
		// 	}

		// 	var text = '<br>';
		// 	var lines_showed = [];
		// 	data.forEach((l) => {
		// 		if (lines_showed.includes(l.line_code)) {
		// 			return;
		// 		}
		// 		lines_showed.push(l.line_code);
		// 		if (l.line_code == station.line_code) {
		// 			text += '<font color="#FF0000">' + l.line_code + '路: ' + l.start_station + '-' + l.stop_station + '</font><br>';
		// 		} else {
		// 			text += '<font>' + l.line_code + '路: ' + l.start_station + '-' + l.stop_station + '</font><br>';
		// 		}
		// 	});

		// 	const infoWindow = new BMap.InfoWindow(text, opts);
		// 	window.map.openInfoWindow(infoWindow, new BMap.Point(station.baidu_x, station.baidu_y));
		// });
	}

	onStartMarkerClick(station) {
		window.station_view_this = this;

		const opts = {
			width : '',
			height: '',
			title : station.stat_name
		}

		xFetchJSON('http://zyjt.xswitch.cn/bus_api/site/getStationDes', {
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			body: 'stat_name='+station.stat_name
		}).then((data) => {
		// xFetchJSON('http://zyjt.xswitch.cn/api/bus/test').then((data) => {
			if(data.code == 1){
				var html = '';

				data.line_time.forEach((item) => {
					if(item.up_cut){
						var up_cut = "最近的车辆还有"+item.up_cut+"站到达，预计约"+item.up_cut*2+"分钟";
					}else{
						var up_cut = "此站点暂无快到达车辆"
					}
					if(item.down_cut){
						var down_cut = "最近的车辆还有"+item.down_cut+"站到达，预计约"+item.down_cut*2+"分钟";
					}else{
						var down_cut = "此站点暂无快到达车辆"
					}
					html += item.line_code+"路<br/>(<a style='color:red;' onclick='window.get_line("+item.line_code+",1)'>"+item.stop_station+"->"+item.start_station+"</a>"+up_cut+")<br/>(<a style='color:blue;' onclick='window.get_line("+item.line_code+",2)'>"+item.start_station+"->"+item.stop_station+"</a>"+down_cut+")<br/><br/>";
				});

				const infoWindow = new BMap.InfoWindow(html, opts);
				window.map.openInfoWindow(infoWindow, new BMap.Point(station.baidu_x, station.baidu_y));
			}
		});
	}

	is_show_arrow(lineStations, i) {
		var flag1, flag2;
		flag1 = lineStations[i].show;

		if (i+1<lineStations.length) {
			flag2 = lineStations[i+1].show;
		} else {
			flag2 = flag1;
		}

		//sqlite: the value is 1; pg: the value is t
		if ((flag1 == 1 && flag2 == 1) || (flag1 == 't' && flag2 == 't')) {
			return true;
		} else {
			return false;
		}
	}

	setupLineStations() {
		const _this = this;
		const lines = Object.keys(this.state.lines);

		let station_names = this.state.candidate.stat_names.split('-');
		let station_showed = [];
		const start_station = station_names.shift()
		const stop_station = station_names.pop()

		const is_x_station = function(station) {
			for(var i = 0; i < station_names.length; i++) {
				if (station_names[i] == station) return true;
			}

			return false;
		}

		const is_station_showed = function(station) {
			for(var i = 0; i < station_names.length; i++) {
				if (station_showed[i] == station) return true;
			}

			return false;
		}

		let max_x, max_y, min_x, min_y, flags=0;
		const colors = ['red', 'blue', 'green', '#FFFF00'];
		let colors_i = 0;
		lines.forEach((line) => {
			let last_stat_name;
			_this.state.lines[line].forEach((station) => {
				last_stat_name = station.stat_name;
				const point = new BMap.Point(station.baidu_x, station.baidu_y);
				addMarker(point, station, _this.onMarkerClick.bind(_this));

				if (flags == 0) {
					max_x = station.baidu_x;
					max_y = station.baidu_y;
					min_x = station.baidu_x;
					min_y = station.baidu_y;
					flags = 1;
				}
				if (parseFloat(max_x) < parseFloat(station.baidu_x)) { max_x = station.baidu_x}
				if (parseFloat(max_y) < parseFloat(station.baidu_y)) { max_y = station.baidu_y}
				if (parseFloat(min_x) > parseFloat(station.baidu_x)) { min_x = station.baidu_x}
				if (parseFloat(min_y) > parseFloat(station.baidu_y)) { min_y = station.baidu_y}

				if (station.stat_name == start_station) {
					const label = station.line_code + '路 ' + station.stat_name + ' 上车';
					addLabel(point, label, station, _this.onStartMarkerClick.bind(_this));
				} else if (station.stat_name == stop_station) {
					const label = station.line_code + '路 ' + station.stat_name + ' 下车';
					addLabel(point, label, station, _this.onMarkerClick.bind(_this));
				} else if (is_x_station(station.stat_name)) {
					if (!(is_station_showed(station.stat_name))) {
						const label = station.stat_name + ' 换乘';
						addLabel(point, label, station, _this.onMarkerClick.bind(_this));
						station_showed.push(station.stat_name);
					}
				}
			});

			const lineStations = this.state.lines[line];

			for(var i = 0; i < lineStations.length - 1; i++) {
				if (this.is_show_arrow(lineStations, i)) {
					addArrowLine(window.map, lineStations[i].baidu_x, lineStations[i].baidu_y, lineStations[i+1].baidu_x, lineStations[i+1].baidu_y, colors[colors_i], 4, 2, false);
				} else{
					addArrowLineWithoutArrow(window.map, lineStations[i].baidu_x, lineStations[i].baidu_y, lineStations[i+1].baidu_x, lineStations[i+1].baidu_y, colors[colors_i], 2, 0.5, false);
				}
			}

			console.log('color: ', colors_i, colors[colors_i]);

			colors_i = colors_i+1;

			// //draw cars
			// let l = _this.state.lines[line];
			// let url = '/api/bus/get_direction?line=' + line + '&start=' + l[0].stat_name + '&stop=' + last_stat_name;
			// console.error('url=', url);
			// xFetchJSON(url).then((d) => {
			// 	console.error('get_direction', d);
			// 	xFetchJSON('http://zyjt.xswitch.cn/bus_api/site/realData', {
			// 		method: "POST",
			// 		headers: {"Content-Type": "application/x-www-form-urlencoded"},
			// 		body: 'line=' + line + '&up_down' + d.direction + '&xpoint=1&ypoint=1'
			// 	}).then((data) => {
			// 		console.error('realData', data);
			// 		if (data.code != 1) {
			// 			console.error('response json error', data);
			// 			return;
			// 		}

			// 		drawCars(data.res);
			// 	});
			// });
		});

		let center_x = (parseFloat(max_x) + parseFloat(min_x))/2;
		let center_y = (parseFloat(max_y) + parseFloat(min_y))/2;
		let center_point = new BMap.Point(center_x, center_y);

		if (window.map) {
			window.map.centerAndZoom(center_point, 14);
		}
	}

	initializeBaiduMap() {
		console.log("initializeBaiduMap", this);

		window.map = new BMap.Map("allmap");
		window.map.addControl(new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_LEFT}));   //add map navigation tools

		var geolocationControl = new BMap.GeolocationControl({anchor: BMAP_ANCHOR_TOP_RIGHT});
		geolocationControl.addEventListener("locationSuccess", function(e){
			console.log('定位成功', e);
		});
		geolocationControl.addEventListener("locationError",function(e){
			console.log('定位失败');
		});
		window.map.addControl(geolocationControl);

		if (true || !loc.longitude) { // hardcoded for test
			loc = {longitude: 120.40086416919, latitude: 37.37223326585};
		}

		if (loc.longitude) {
			window.map.centerAndZoom(new BMap.Point(loc.longitude, loc.latitude), 14);
		}

		if (this.state.pendingSetupLineStations) {
			this.setupLineStations();
		}
	}

	componentWillUnmount() {
		window.map = null;
	}

	componentDidMount() {
		const _this = this;

		window.initializeBaiduMap = this.initializeBaiduMap.bind(this);
		loadScript();

		const station_names = this.props.candidate.stat_names.split('-');
		const lines = this.props.candidate.all_lines.split('-');
		let i = 0;
		let j = 0;

		lines.forEach((line) => {
			const start = station_names[i]
			const stop = station_names[i+1];
			const colors = ['red', 'blue', 'green', '#FFFF00'];

			xFetchJSON('/api/bus/lines/' + line + '/stations?start=' + start + '&stop=' + stop).then((data) => {
				const _this = this;
				console.log('stations', data);
				data.color = colors[j];
				_this.state.lines[line] = data;
				_this.setState({lines: _this.state.lines});

				j++;

				if (j == lines.length) {
					if (window.map) {
						this.setupLineStations();
					} else {
						this.state.pendingSetupLineStations = true;
					}
				}
			});

			i++;
		});
	}

	drawPlan(lines, station_names) {
		const _this = this;
		let i = 0;
		let j = 0;

		//show new map informations
		lines.forEach((line) => {
			const start = station_names[i]
			const stop = station_names[i+1];
			const colors = ['red', 'blue', 'green', '#FFFF00'];

			xFetchJSON('/api/bus/lines/' + line + '/stations?start=' + start + '&stop=' + stop).then((data) => {
				const _this = this;
				console.log('stations', data);
				data.color = colors[j];
				_this.state.lines[line] = data;
				_this.setState({lines: _this.state.lines});

				j++;

				if (j == lines.length) {
					this.setupLineStations();
				}
			});

			i++;
		});
	}

	onSelectChange(e) {
		const _this = this;

		let params = e.target.value.split(' ');
		let options = [];
		options.all_lines=params[0];
		options.stat_names=params[1];
		options.offs=parseInt(params[2]);
		options.all_plans = this.props.candidate.all_plans;

		const station_names = params[1].split('-');
		const lines = params[0].split('-');
		let i = 0;
		let j = 0;

		_this.setState({candidate: options});

		//clear old map informations
		_this.setState({lines: []});
		window.map.clearOverlays();

		_this.drawPlan(lines, station_names);
	}

	onClickOneLine(e) {
		const _this = this;
		let l = e.target.getAttribute("data-l");
		let s1 = e.target.getAttribute("data-s1");
		let s2 = e.target.getAttribute("data-s2");
		console.log('onClickLine', l, s1, s2);

		window.map.clearOverlays();

		xFetchJSON('/api/bus/get_direction?start=' + s1 + '&stop=' + s2 + '&line=' + l).then((data) => {
			drawLineAndCars(l, data.direction, _this, _this.onMarkerClick);
		});
	}

	onClickAllLines(e) {
		const _this = this;

		window.map.clearOverlays();
		_this.drawPlan(e.target.getAttribute("data-lines").split('-')
			, e.target.getAttribute("data-stations").split('-'));
	}

	render() {
		let height = 580;
		height = window.innerHeight - 80;
		const _this = this;
		console.log('render run:', _this.state);

		if (!_this.state.candidate) {
			return <div></div>
		}

		let station_names = _this.state.candidate.stat_names.split('-');
		let lines = _this.state.candidate.all_lines.split('-');
		let lines_map = [];
		let i = 0;

		console.error('render1', _this.state.candidate, lines);

		for (; i < lines.length; i++) {
			let item = {line: null, stat_name1: null, stat_name2: null};
			item.line = lines[i];
			item.stat_name1 = station_names[i];
			item.stat_name2 = station_names[i + 1];

			lines_map.push(item);
		}

		return <div>
			<center><select id='myselect' width="100%" onChange={_this.onSelectChange.bind(_this)}>
				{
						_this.state.candidate.all_plans.map(function(c) {
							if (c.id == _this.state.candidate.id) {
								return <option selected="selected">{c.all_lines} {c.stat_names} 共{c.offs}站</option>;
							} else {
								return <option>{c.all_lines} {c.stat_names} 共{c.offs}站</option>;
							}
						})
					}
				}
			</select></center>
			<div>
				{
					lines_map.map(function(l){
						return <a href="#" data-l={l.line} data-s1={l.stat_name1} data-s2={l.stat_name2} onClick={_this.onClickOneLine.bind(_this)} className="weui-btn weui-btn_mini weui-btn_primary">{l.line}路</a>;
					})
				}
				<a href="#" data-lines={_this.state.candidate.all_lines} data-stations={_this.state.candidate.stat_names} onClick={_this.onClickAllLines.bind(_this)} className="weui-btn weui-btn_mini weui-btn_primary">所有线路</a>
			</div>
			<div id = "allmap" style={{width: "100%", height: height}} />
		</div>
	}
}

class Stations extends React.Component {
	constructor(props) {
		super(props);
		this.state = {stations: [], inputStationName: ''};
	}

	componentDidMount() {
		const _this = this;
		xFetchJSON('/api/bus/station').then((data) => {
			console.log(data);
			_this.setState({stations: data});
		});
	}

	onChange(e) {
		this.setState({inputStationName: e.value});
	}

	render() {
		return <div>
			<div className="weui-cell">
				<div className="weui-cell__hd"><label className="weui-label">站点查询：</label></div>
				<div className="weui-cell__bd">
					<SelectSearch options={this.state.stations} selectType='1' station={this.state.inputStationName} placeholder="请输入站点名称" onChange={this.onChange.bind(this)}/>
				</div>
			</div>
			<StationSearch station={this.state.inputStationName}/>
		</div>
	}
}

class Change extends React.Component {
	constructor(props) {
		super(props);
		this.state = {candidates: [], stations: [], searched: null, startStation: null, endStation: null, marker: null};

		this.onChange1 = this.onChange1.bind(this);
		this.onChange2 = this.onChange2.bind(this);
	}

	addMarker(point, func, title, drag) {
		var marker = new BMap.Marker(point);

		if (func) {
			marker.addEventListener("click", (e) => {
				func(e);
			});
		}

		if (title) {
			let label = new BMap.Label(title, {offset:new BMap.Size(20,-10)});
			marker.setLabel(label);
		}

		window.map.addOverlay(marker);

		if (!drag || drag == 'true') {
			marker.enableDragging();
		}

		return marker;
	}

	initializeBaiduMap() {
		const _this = this;
		window.map = new BMap.Map("allmap");
		window.map.addControl(new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_LEFT}));   //add map navigation tools
		const longitude = 120.40086416919;
		const latitude = 37.37223326585
		window.map.centerAndZoom(new BMap.Point(longitude, latitude), 14);

		console.log("loc", loc);

		var geolocationControl = new BMap.GeolocationControl({anchor: BMAP_ANCHOR_TOP_RIGHT});
		geolocationControl.addEventListener("locationSuccess", function(e){
			console.log('定位成功', e);
			window.map.clearOverlays();

			if (is_in_zhaoyuan(e.point.lng, e.point.lat)) {
				console.log('in zhaoyuan');
				let marker = _this.addMarker(e.point, _this.onMyLocationClick.bind(_this), null);

				if (_this.state.marker) { window.map.removeOverlay(_this.state.marker);}
				_this.setState({marker : marker});
			} else {
				console.log('no in zhaoyuan');
				const point = new BMap.Point('120.40086416919', '37.37223326585');
				let marker = _this.addMarker(point, _this.onMyLocationClick.bind(_this), null);
				window.map.centerAndZoom(point, 14);

				if (_this.state.marker) { window.map.removeOverlay(_this.state.marker);}
				_this.setState({marker : marker});
			}
		});
		geolocationControl.addEventListener("locationError",function(e){
			console.log('定位失败');
		});
		window.map.addControl(geolocationControl);

		const point = new BMap.Point(longitude, latitude);
		this.addMarker(point, this.onMyLocationClick.bind(this));

		window.map.addEventListener("tilesloaded", function() {
			let marker = _this.addMarker(window.map.getCenter(), _this.onMyLocationClick.bind(_this), null, 'false');
			if (_this.state.marker) { window.map.removeOverlay(_this.state.marker);}
			_this.setState({marker : marker});
		});
	}

	onMyLocationClick(e) {
		console.log(e.target.getPosition());
		const position = e.target.getPosition();
		const opts = {
			// title: 'blah'
		}

		const _this = this;

		window.showNearbyStations = function(r) { // has to be global in the old school
			xFetchJSON('/api/bus/nearby_stations?longitude=' +
				position.lng + '&latitude=' + position.lat +
				"&r=" + r).then((data) => {
				console.log(data);
				window.map.closeInfoWindow();
				window.map.clearOverlays();

				// filter to remove duplicated stations
				let dup = {}
				data = data.filter((station) => {
					if (dup[station.stat_name]) return false;

					dup[station.stat_name] = true;
					return true;
				});

				// draw stations
				drawStations(data, _this, _this.onStationClick);

				// add current positioin back
				const point = new BMap.Point(position.lng, position.lat);
				_this.addMarker(point, _this.onMyLocationClick.bind(_this));
			});
		}

		const text = '<a href="#" onclick="showNearbyStations(500);return false">显示附近公交站点（500米）</a> <br>' +
					 '<a href="#" onclick="showNearbyStations(1500);return false">显示附近公交站点（1500米）</a> <br>' +
					 '<a href="#" onclick="showNearbyStations(3000);return false">显示附近公交站点（3000米）</a>';

		const infoWindow = new BMap.InfoWindow(text, opts);
		window.map.openInfoWindow(infoWindow, new BMap.Point(position.lng, position.lat));
	}

	onStationClick(data) {
		const _this = this;
		console.log("onStationClick", data);

		window.setAsStart = function() {
			window.start = data.stat_name;
			_this.setState({startStation: data.stat_name});
			window.map.closeInfoWindow();
		}

		window.setAsEnd = function() {
			window.end = data.stat_name;
			_this.setState({endStation: data.stat_name});
			window.map.closeInfoWindow();
		}

		const text = '<a href="#" onclick="setAsStart()">设为起点</a> | ' +
			'<a href="#" onclick="setAsEnd()">设为终点</a>';

		const opts = {title: "选择起止点"};
		const infoWindow = new BMap.InfoWindow(text, opts);
		window.map.openInfoWindow(infoWindow, new BMap.Point(data.baidu_x, data.baidu_y));
	}

	componentDidMount() {
		window.initializeBaiduMap = this.initializeBaiduMap.bind(this);
		loadScript();

		const _this = this;
		xFetchJSON('/api/bus/station').then((data) => {
			console.log(data);
			_this.setState({stations: data});
		});
	}

	onChange1(e) {
		window.start = e.value;
		this.setState({startStation: e.value});
	}

	onChange2(e) {
		window.end = e.value;
		this.setState({endStation: e.value});
	}

	handleSearchInterchange(e) {
		e.preventDefault();
		const _this = this;

		xFetchJSON('/api/bus/interchange?start=' + window.start + '&stop=' + window.end).then((data) => {
			console.error('interchange', data);
			if (data.error == 1 || data.error == 2) {
				let stat_name = data.name;
				let text = '请在地图中选择' + stat_name + '附近的站点';
				alert(text);

				searchWhere(_this, stat_name);
				return;
			} else 	if (data.error == 3) {
				let text = '请输入换乘查询站点';
				alert(text);
				return;
			}
			_this.setState({searched: 1});
			_this.setState({candidates: data});
		});
	}

	showOnMap(candidate) {
		const _this = this;
		let options = candidate;

		options.all_plans = _this.state.candidates;
		ReactDOM.render(<TransferMap candidate={options}/>, document.getElementById('main'));
	}

	render() {
		const _this = this;
		var content;

		if (this.state.candidates.length > 0) {
			content = <ul> {
				this.state.candidates.map((candidate) => {
					var line1_info = '', line2_info = '', line3_info = '';
					if (candidate.line1) line1_info = candidate.line1 + '路[' + candidate.off1 + '站] ';
					if (candidate.line2) line2_info = candidate.stat_name1+ ' ' + candidate.line2 + '路[' + candidate.off2 + '站] ';
					if (candidate.line3) line3_info = candidate.stat_name2+ ' ' + candidate.line3 + '路[' + candidate.off3 + '站] ';

					return <div className="weui-cell weui-cell_access">
							<div className="weui-cell__bd">
							<li style={{listStyle:"none",fontSize:"14px"}}
								onClick={() => _this.showOnMap(candidate)}>
								[共{candidate.offs}站]&nbsp;
								{line1_info}
								{line2_info}
								{line3_info}
							</li>
						</div>
						<div className="weui-cell__ft"></div>
				</div>
				})
			} </ul>
		} else {
			if (_this.state.searched) { content = '没有找到换乘方案';}
		}

		let mapHeight = window.innerHeight - 180;

		return <div className="page" style={{padding:"0 15px"}}>
			<h1 className="page__title" style={{textAlign:"center",margin:"10px 0"}}>换乘查询</h1>

			<div>
				<table>
					<tr>
						<td width="30%">
							<SelectSearch options={this.state.stations} selectType='0' placeholder="请输入出发站" station={this.state.startStation} onChange={this.onChange1}/>
						</td><td width="10%">
							<span>至&nbsp;&nbsp;</span>
						</td><td style={{textAlign: "right"}}>
							<SelectSearch options={this.state.stations} selectType='0' placeholder="请输入目的站" station={this.state.endStation} onChange={this.onChange2}/>
						</td><td width="72px" style={{textAlign:"right"}}>
							<a href="#" className="weui-btn weui-btn_mini weui-btn_primary" style={{marginTop:"10px"}} onClick={this.handleSearchInterchange.bind(this)}>查询</a>
						</td>
					</tr>
				</table>
			</div>
			<div style={{color: "#999"}}>
				提示：点击小红点并点击可选择站点
			</div>
			<hr/>

			<div class="page__bd">
			{content}
			</div>

			<div id = "allmap" style={{width: "100%", height: mapHeight}} />
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
{/*
					<a className="weui-tabbar__item" onClick={() => _this.handleClick("stations")}>
						<div className="weui-tabbar__icon">
							<img src="/assets/wechat_img/icon_nav_button.png" alt=""/>
						</div>
						<p className="weui-tabbar__label">站点查询</p>
					</a>
*/}
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
