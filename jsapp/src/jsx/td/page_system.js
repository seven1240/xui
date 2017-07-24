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
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col } from 'react-bootstrap';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek';
import SettingBaiduTTS from '../system/baidu_tts';
import SettingEventSocket from '../system/event_socket';
import SettingDevice from './device';
import ChangeIpPage from '../page_change_ip';
import UploadLicence from './page_licence';
import Dropzone from 'react-dropzone';

class SystemPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {rows:[], mac_address: "00:00:00:00:00:00"};
	}


	render() {
		const _this = this;

		return <div>
			<h1><T.span text="System Settings"/></h1>

			<hr/>
			<UploadLicence/>

			<hr/>
			<SettingDevice/>

			<hr/>
			<SettingEventSocket/>

			{/*<hr/>
			<SettingBaiduTTS/>*/}

			<hr/>
			<h2><T.span text="Log"/></h2>
			<ul>
				<li><a href="/api/freeswitch/log"><T.span text="Download Log"/></a></li>
			</ul>
			<hr/>
			<h2><T.span text="Sound Files"/></h2>
			<ul>
				<li><a href="/api/freeswitch/dir/sounds" target="_blank"><T.span text="Sounds"/></a></li>
				<li><a href="/api/freeswitch/dir/storage" target="_blank"><T.span text="Storage"/></a></li>
			</ul>

			<hr/>
			<ChangeIpPage/>
		</div>
	}
}

export default SystemPage;
