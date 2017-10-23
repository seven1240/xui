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
		if (!isAdmin()) return <Nav bsStyle="pills" stacked>
			<LinkContainer to="/settings/users" key="M_USERS">
				<NavItem eventKey="M_USER">
					<i className="fa fa-user" aria-hidden="true"></i>&nbsp;
					<T.span text="Users"/>
				</NavItem>
			</LinkContainer>
		</Nav>

		return <Nav bsStyle="pills" stacked>
			<LinkContainer to="/settings/users" key="M_USERS">
				<NavItem eventKey="M_USER">
					<i className="fa fa-user" aria-hidden="true"></i>&nbsp;
					<T.span text="Users"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/groups" key="M_GROUPS">
				<NavItem eventKey="M_GROUP">
					<i className="fa fa-group" aria-hidden="true"></i>&nbsp;
					<T.span text="Groups"/></NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/gateways" key="M_GATEWAYS">
				<NavItem eventKey="M_GATEWAYS">
					<i className="fa fa-road" aria-hidden="true"></i>&nbsp;
					<T.span text="Gateways"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/acls" key="M_ACLS">
				<NavItem eventKey="M_ACLS">
					<i className="fa fa-list" aria-hidden="true"></i>&nbsp;
					<T.span text="ACLs"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/table_browsers" key="M_BROWSER">
				<NavItem eventKey="M_BROWSER">
					<i className="fa fa-list" aria-hidden="true"></i>&nbsp;
					<T.span text="Databases"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/sip_profiles" key="M_SIP">
				<NavItem eventKey="M_SIP">
					<i className="fa fa-file-text" aria-hidden="true"></i>&nbsp;
					<T.span text="SIP"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/routes" key="M_ROUTES">
				<NavItem eventKey="M_ROUTES">
					<i className="fa fa-random" aria-hidden="true"></i>&nbsp;
					<T.span text="Routes"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/blocks" key="M_BLOCKS">
				<NavItem eventKey="M_BLOCKS">
					<i className="fa fa-cubes" aria-hidden="true"></i>&nbsp;
					<T.span text="Blocks"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/conference_rooms" key="M_CONFERECE_ROOMS">
				<NavItem eventKey="M_CONFERECE_ROOMS">
					<i className="fa fa-users" aria-hidden="true"></i>&nbsp;
					<T.span text="Conference Rooms"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/conference_profiles" key="M_CONFERECE_PROFILES">
				<NavItem eventKey="M_CONFERECE_PROFILES">
					<i className="fa fa-file-text" aria-hidden="true"></i>&nbsp;
				<T.span text="Conference Profiles"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/distributors" key="M_DISTRIBUTORS">
				<NavItem eventKey="M_DISTRIBUTORS">
					<i className="fa fa-file-text" aria-hidden="true"></i>&nbsp;
				<T.span text="Distributors"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/media_files" key="M_MEDIA_FILES">
				<NavItem eventKey="M_MEDIA_FILES">
					<i className="fa fa-file-sound-o" aria-hidden="true"></i>&nbsp;
					<T.span text="Media Files"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/module_params" key="M_PARAMS">
				<NavItem eventKey="M_PARAMS">
					<i className="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;
					<T.span text="Params"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/dicts" key="M_DICTS">
				<NavItem eventKey="M_DICTS">
					<i className="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;
					<T.span text="Dicts"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/devices" key="M_DEVICES">
				<NavItem eventKey="M_DEVICES">
					<i className="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;
					<T.span text="Devices"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/module" key="M_MODULE">
				<NavItem eventKey="M_MODULE">
					<i className="fa fa-cube" aria-hidden="true"></i>&nbsp;
					<T.span text="Modules"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/mcasts" key="M_Multicasts">
				<NavItem eventKey="M_Multicasts">
					<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span text="Multicasts"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/term" key="M_TERM">
				<NavItem eventKey="M_TERM">
					<i className="fa fa-terminal" aria-hidden="true"></i>&nbsp;
					<T.span text="Terminal"/>
				</NavItem>
			</LinkContainer>
			<LinkContainer to="/settings/fifos" key="M_FIFO">
				<NavItem eventKey="M_FIFO">
					<i className="fa fa-street-view" aria-hidden="true"></i>&nbsp;
					<T.span text="FIFOs"/>
				</NavItem>
			</LinkContainer>

			<LinkContainer to="/settings/ivrs" key="M_IVR">
				<NavItem eventKey="M_IVR">
					<i className="fa fa-comments" aria-hidden="true"></i>&nbsp;
					<T.span text="IVRS"/>
				</NavItem>
			</LinkContainer>

			<LinkContainer to="/settings/system" key="M_SYSTEM">
				<NavItem eventKey="M_SYSTEM">
					<i className="fa fa-gear" aria-hidden="true"></i>&nbsp;
					<T.span text="System"/>
				</NavItem>
			</LinkContainer>
		</Nav>
	}
}

export default Settings;
