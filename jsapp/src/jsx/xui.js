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
 * index.jsx - XUI
 *
 */

'use strict';

import React from 'react'
import ReactDOM from 'react-dom';
import T from 'i18n-react';
import { Row, Col, Button } from 'react-bootstrap';
import { Router, Route, IndexRoute, Link, hashHistory, Redirect } from 'react-router'
import Languages from "./languages";
import MainMenu from './main-menu';
import FSShow from "./fs_show";
import { TicketsPage, TicketPage } from "./page_tickets";
import { TrafficDictPage, TrafficDictsPage } from "./page_traffic_dicts";
import { CDRsPage, CDRPage } from "./page_cdrs";
import { FifoCDRsPage, FifoCDRPage } from "./page_fifo_cdrs";
import {McastsPage, McastPage} from "./page_mcasts";
import AboutPage from "./page_about";
import DashBoard from "./dashboard";
import OverViewPage from "./page_overview";
import ChannelsPage from "./page_channels";
import TicketStatictics from "./page_ticket_statictics";
import RegistrationsPage from "./page_registrations";
import CallsPage from "./page_calls";
import FSUsersPage from "./page_fs_users";
import SofiaPage from "./page_sofia";
import MonitorPage from './page_monitor';
import Conferences from './conferences';
import SystemPage from './page_system';
import { FifoPage, FifoInfo, FifoMemberPage } from './page_fifos';
import { IvrPage, IvrInfo, IvrActionPage } from './page_ivrs';
import Settings from './settings';
import { ConferenceProfilePage, ConferenceProfilesPage } from './page_conference_profiles';
import { ConferenceRooms, ConferenceRoom } from './page_conference_rooms';
import { UsersPage, UserPage } from './page_users';
import { WechatUsersPage, WechatUserPage } from './page_wechat_users';
import { GroupsPage, GroupPage } from './page_groups';
import { RoutesPage, RoutePage } from './page_routes';
import { BlocksPage, BlockPage } from './blocks.js';
import { GatewaysPage, GatewayPage } from './page_gateways';
import { DictsPage, DictPage } from './page_dicts';
import { ModulePage } from './page_module';
import { SIPProfilesPage, SIPProfilePage } from './page_sip';
import { MediaFilesPage, MediaFilePage } from './page_media_files';
import { Login, LoginBox } from './page_login';
import Footer from './footer';
import Terminal from './terminal';
import verto from './verto/verto';
import { ACLPage, ACLsPage } from './page_acls';
import PasswordPage from './page_password';
import {xFetchJSON } from './libs/xtools';

const lang_map = detect_language();
if (lang_map) T.setTexts(lang_map);

class App extends React.Component{
	constructor(props) {
		super(props);

		this.state = {menus:[], rmenus: []};
	}

	componentDidMount() {
		const _this = this;
		xFetchJSON("/api/menus?realm=MENUS").then((data) => {
			_this.setState({menus: data});
		});

		xFetchJSON("/api/menus?realm=RMENUS").then((data) => {
			_this.setState({rmenus: data});
		});
	}

	render() {
		let main = <div></div>;

		if (this.props.children) { //compoment
			main = this.props.children;
			console.log("props1", this.props);
		} else { //components
			console.log("props2", this.props);
			main = <div id='main'><Row className="clearfix">
				<Col sm={2}>
					<br />
					{this.props.sidebar}
				</Col>
				<Col sm={10} className="leftBar">
					<div id='main'>{this.props.main}</div>
				</Col>
			</Row></div>
		}

		return <div id = 'main_area'>
			<MainMenu menus = {this.state.menus} rmenus = {this.state.rmenus}/>
			{ main }
			<Footer/>
		</div>
	}
};

class Home extends React.Component{
	render() {
		const handleLogout = function(params, replace) {
			console.log("Logout");
			console.log(params, replace);
			localStorage.removeItem("xui.username");
			localStorage.removeItem("xui.password");
			if (verto) verto.logout();
			ReactDOM.render(<Login/>, document.getElementById('body'));
		}

		const ensureVisible = function () {
			const top = document.getElementById('main_area');
			if (top) top.scrollIntoView(true);
		}

		return <Router history={hashHistory}>
			<Route path="/" component={App}>
				<IndexRoute components={{sidebar: DashBoard, main: OverViewPage}} />
				<Route path="overview" components={{sidebar: DashBoard, main: OverViewPage}} onlyActiveOnIndex/>
				<Route path="calls" components = {{sidebar: DashBoard, main: CallsPage}}/>
				<Route path="channels" components = {{sidebar: DashBoard, main: ChannelsPage}}/>
				<Route path="ticket_statistics" components = {{sidebar: DashBoard, main: TicketStatictics}}/>
				<Route path="registrations" components = {{sidebar: DashBoard, main: RegistrationsPage}}/>
				<Route path="users" components = {{sidebar: DashBoard, main: FSUsersPage}}/>
				<Route path="sofia" components = {{sidebar: DashBoard, main: SofiaPage}}/>

				<Route path="show" component={FSShow} />
				// <Route path="cdrs" component={CDRsPage} />

				<Route path="tickets">
					<IndexRoute component={TicketsPage} />
					<Route path=":id" component={TicketPage} />
				</Route>

				<Route path="traffic_dicts">
					<IndexRoute component={TrafficDictsPage} />
					<Route path=":id" component={TrafficDictPage} />
				</Route>

				<Route path="cdrs">
					<IndexRoute component={CDRsPage} />
					<Route path=":uuid" component={CDRPage} />
				</Route>

				<Route path="fifocdrs">
					<IndexRoute components={FifoCDRsPage} />
					<Route path=":channel_uuid" component={FifoCDRPage} />
				</Route>

				<Route path="about" component={AboutPage} />
				<Route path="logout" component={LoginBox} onEnter={handleLogout}/>

				<Route path="monitor" component={MonitorPage} />

				<Route path="conferences" component={Conferences} />

				<Route path="media_files">
					<IndexRoute component={MediaFilesPage}/>
					<Route path=":id" component={MediaFilePage}/>
				</Route>

				<Route path="settings">
				    <IndexRoute components={{sidebar: Settings, main: UsersPage}}/>
					<Route path="users">
						<IndexRoute components={{sidebar: Settings, main: UsersPage}}/>
						<Route path="password" components={{sidebar: Settings, main: PasswordPage}}/>
						<Route path=":id" components={{sidebar: Settings, main: UserPage}}/>
					</Route>
					<Route path="wechat_users">
						<IndexRoute components={{sidebar: Settings, main: WechatUsersPage}}/>
						<Route path=":id" components={{sidebar: Settings, main: WechatUserPage}}/>
					</Route>
					<Route path="groups">
						<IndexRoute components={{sidebar: Settings, main: GroupsPage}}/>
						<Route path=":id" components={{sidebar: Settings, main: GroupPage}}/>
					</Route>
					<Route path="gateways">
						<IndexRoute components={{sidebar: Settings, main: GatewaysPage}}/>
						<Route path=":id" components={{sidebar: Settings, main: GatewayPage}}/>
					</Route>
					<Route path="acls">
						<IndexRoute components={{sidebar: Settings, main: ACLsPage}}/>
						<Route path=":id" components={{sidebar: Settings, main: ACLPage}}/>
					</Route>
					<Route path="dicts">
						<IndexRoute components={{sidebar: Settings, main: DictsPage}}/>
						<Route path=":id" components={{sidebar: Settings, main: DictPage}}/>
					</Route>
					<Route path="module">
						<IndexRoute components={{sidebar: Settings, main: ModulePage}}/>
					</Route>
					<Route path="conference_profiles">
						<IndexRoute components={{sidebar: Settings, main: ConferenceProfilesPage}}/>
						<Route path=":id" components={{sidebar: Settings, main: ConferenceProfilePage}}/>
					</Route>
					<Route path="conference_rooms">
						<IndexRoute components={{sidebar: Settings, main: ConferenceRooms}}/>
						<Route path=":id" components={{sidebar: Settings, main: ConferenceRoom}}/>
					</Route>
					<Route path="sip_profiles">
						<IndexRoute components={{sidebar: Settings, main: SIPProfilesPage}}/>
						<Route path=":id" components={{sidebar: Settings, main: SIPProfilePage}}/>
					</Route>
					<Route path="routes">
						<IndexRoute components={{sidebar: Settings, main: RoutesPage}}/>
						<Route path=":id" components={{sidebar: Settings, main: RoutePage}}/>
					</Route>
					<Route path="blocks">
						<IndexRoute components={{sidebar: Settings, main: BlocksPage}}/>
						<Route path=":id" components={{sidebar: Settings, main: BlockPage}}/>
					</Route>
					<Route path="media_files">
						<IndexRoute components={{sidebar: Settings, main: MediaFilesPage}}/>
						<Route path=":id" components={{sidebar: Settings, main: MediaFilePage}}/>
					</Route>

					<Route path="fifos">
						<IndexRoute components={{sidebar: Settings, main: FifoPage}} onEnter={ensureVisible}/>
						<Route path=":fifo_id" components={{sidebar: Settings, main: FifoInfo}} /> 
						<Route path=":fifo_id/members/:id" components={{sidebar: Settings, main: FifoMemberPage}} />
					</Route>
					<Route path="ivrs">
						<IndexRoute components={{sidebar: Settings, main: IvrPage}} onEnter={ensureVisible}/>
						<Route path=":ivr_menu_id" components={{sidebar: Settings, main: IvrInfo}} />
						<Route path=":ivr_menu_id/actions/:id" components={{sidebar: Settings, main: IvrActionPage}} />
					</Route>
					<Route path="mcasts">
						<IndexRoute components={{sidebar: Settings, main: McastsPage}} onEnter={ensureVisible}/>
						<Route path=":id" components={{sidebar: Settings, main: McastPage}}/>
					</Route>
					<Route path="system" components={{sidebar: Settings, main: SystemPage}} onEnter={ensureVisible}/>
					<Route path="term" components={{sidebar: Settings, main: Terminal}}/>
				</Route>
			</Route>
		</Router>
	}
};

export { Home };
