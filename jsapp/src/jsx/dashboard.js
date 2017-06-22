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
 * blocks.jsx - Blocks Page
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Nav, NavItem } from 'react-bootstrap';
import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap';

class DashBoard extends React.Component {
	render() {
		return <Nav bsStyle="pills" stacked>
			<IndexLinkContainer to="/" key="M_OVERVIEW">
				<NavItem eventKey="M_OVERVIEW"><T.span text={{ key: "Overview"}}/></NavItem>
			</IndexLinkContainer>
			<LinkContainer to="/calls" key="M_CALLS">
				<NavItem eventKey="M_CALLS"><T.span text={{ key: "Calls"}}/></NavItem>
			</LinkContainer>
			<LinkContainer to="/channels" key="M_CHANNELS">
				<NavItem eventKey="M_CHANNELS"><T.span text={{ key: "Channels"}} /></NavItem>
			</LinkContainer>
			<LinkContainer to="/registrations" key="M_REGISTRATIONS">
				<NavItem eventKey="M_REGISTRATIONS"><T.span text={{ key: "Registrations"}} /></NavItem>
			</LinkContainer>
			<LinkContainer to="/users" key="M_USERS">
				<NavItem eventKey="M_USERS"><T.span text={{ key: "Users"}} /></NavItem>
				</LinkContainer>
			<LinkContainer to="/sofia" key="M_SOFIA">
				<NavItem eventKey="M_SOFIA"><T.span text={{ key: "Sofia"}} /></NavItem>
			</LinkContainer>
			<LinkContainer to="/show" key="M_SHOW">
				<NavItem eventKey="M_SHOW"><T.span text={{ key: "Show"}} /></NavItem>
			</LinkContainer>
			<LinkContainer to="/fifocdrs" key="M_FIFOCDRS">
				<NavItem eventKey="M_FIFOCDRS"><T.span text={{ key: "FIFO CDRs"}}/></NavItem>
			</LinkContainer>
			<LinkContainer to="/changeip" key="M_CAHNGEIP">
				<NavItem eventKey="M_CAHNGEIP"><T.span text={{ key: "Change IP"}}/></NavItem>
			</LinkContainer>
			<LinkContainer to="/ticket_statistics" key="M_TICKETSTATISTICS">
				<NavItem eventKey="M_TICKETSTATISTICS"><T.span text={{ key: "Ticket Statistics"}}/></NavItem>
			</LinkContainer>
		</Nav>
	}
}

export default DashBoard;
