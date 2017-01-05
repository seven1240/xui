/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2016, Seven Du <dujinfang@x-y-t.cn>
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
import { Tab, Row, Col, Nav, NavItem } from 'react-bootstrap';
import UsersPage from "./page_users";
import RoutesPage from "./page_routes";
import { LinkContainer } from 'react-router-bootstrap';

class Settings extends React.Component {

	render() {
		return <Nav bsStyle="pills" stacked>
			<LinkContainer to="/settings/users" key="M_OVERVIEW">
				<NavItem eventKey="M_USER"><T.span text="Users"/></NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/gateways" key="M_GATEWAYS">
				<NavItem eventKey="M_GATEWAYS"><T.span text="Gateways"/></NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/sip_profiles" key="M_SIP">
				<NavItem eventKey="M_SIP"><T.span text="SIP"/></NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/routes" key="M_ROUTES">
				<NavItem eventKey="M_ROUTES"><T.span text="Routes"/></NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/blocks" key="M_BLOCKS">
				<NavItem eventKey="M_BLOCKS"><T.span text="Blocks"/></NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/media_files" key="M_MEDIA_FILES">
				<NavItem eventKey="M_MEDIA_FILES"><T.span text="Media Files"/></NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/system" key="M_SYSTEM">
				<NavItem eventKey="M_SYSTEM"><T.span text="System"/></NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/dicts" key="M_DICTS">
				<NavItem eventKey="M_DICTS"><T.span text="Dicts"/></NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/module" key="M_MODULE">
				<NavItem eventKey="M_MODULE"><T.span text="Modules"/></NavItem>
			</LinkContainer>
		</Nav>
	}
}

export default Settings;
