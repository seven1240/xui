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
import { xFetchJSON } from './libs/xtools'

class AboutPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { xui_version: null, db_version: null };
	}

	componentDidMount() {
		var _this = this;
		xFetchJSON('/api/about/version').then((data) => {
			console.log("dt", data)
			_this.setState({ xui_version: data.xui_version, db_version: data.db_version });
		}).catch((msg) => {
			console.log("get version ERR");
		});
	}
	render() {
		return <div>
			<h1><T.span text="About XUI" /></h1>
			<p><T.span text="XUI is a FreeSWITCH UI framework and implementation" /></p>
			<p><T.span text="XUI Version" />:{this.state.xui_version}</p>
			<p><T.span text="DB Version" />:{this.state.db_version}</p>
			<p><T.span text="Author" />: Seven Du</p>
			<p><T.span text="More info" />: <a href="https://github.com/seven1240/xui" target="_blank">XUI on Github</a></p>
		</div>;
	}
};

export default AboutPage;
