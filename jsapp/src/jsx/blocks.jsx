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
 * blocks.jsx - Blocks Page
 *
 */

'use strict';

import React from 'react'
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import { Navbar } from 'react-bootstrap';
import { Nav } from 'react-bootstrap';
import { NavItem } from 'react-bootstrap';
import { NavDropdown } from 'react-bootstrap';
import { MenuItem } from 'react-bootstrap';
import Phone from './phone';

class MainMenu extends React.Component {

	handleSelect(k, e) {
		console.log("key", k);
		console.log("event", e);

		if (k == "MM_HOME") {
			window.location = "/";
		} else if (k == "MM_EXPORT") {
			download("test.lua", toLua());
		} else if (k == "MM_LOAD") {
			$.get("/api/blocks/demo", function(xml_text) {
				console.log(xml_text);
				var xml = Blockly.Xml.textToDom(xml_text);
				Blockly.Xml.domToWorkspace(xml, workspace);
			});
		} else if (k == "MM_SAVE") {
			var xml = Blockly.Xml.workspaceToDom(workspace);
			var xml_text = Blockly.Xml.domToText(xml);
			var js_code = "alert(1);";//toJS();
			var lua_code = toLua();
			console.log(xml_text);

			$.post("/api/blocks/demo", {
				xml: xml_text,
				js_code: js_code,
				lua_code: lua_code
			}, function(data) {
					console.log(data);
				// createMessage("#top-message", "{% trans "Saved At" %} " + new Date(), 3000)
			});
		}
	}

	render() {
		var menus = this.props.menus.map(function(item) {
			return <NavItem eventKey={item.id} key={item.id}>{item.description}</NavItem>;
		});

		var rmenus = this.props.rmenus.map(function(item) {
			return <NavItem eventKey={item.id} key={item.id}>{item.description}</NavItem>;
		});

		return <Navbar inverse fixedTop staticTop onSelect={this.handleSelect}>
			<Navbar.Header>
				<Navbar.Brand>
					<a href="#"><img src="/assets/img/xui.png" style={{height: "24px"}}/></a>
				</Navbar.Brand>
				<Navbar.Toggle />
			</Navbar.Header>
			<Navbar.Collapse>
				<Nav>{ menus }</Nav>
				<Nav pullRight><Phone /></Nav>
				<Nav pullRight> { rmenus }</Nav>
			</Navbar.Collapse>
		</Navbar>;
	}
}

class BlocksPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {msg: "connecting ..."};
	}

	componentWillMount() {
		// listen to "update-status" event
		window.addEventListener("update-status", this.handleUpdateStatus);
	}

	componentWillUnmount() {
		window.removeEventListener("update-status", this.handleUpdateStatus);
	}
	componentDidMount() {
	}

	handleUpdateStatus(e) {
		// console.log("eeee", e.detail);
		this.setState({msg: e.detail.message});
	}
	render() {
		return <div><pre>Blah</pre></div>
	}
}

$(document).ready(function(){

	var MENUS = [
		{id: "MM_HOME", description: 'Home'},
	];

	var RMENUS = [
		{id: "MM_EXPORT", description: 'Export Lua ...'},
		{id: "MM_LOAD", description: 'Load'},
		{id: "MM_SAVE", description: 'Save'}
	];

	ReactDOM.render(<MainMenu menus = {MENUS} rmenus = {RMENUS} />,
		document.getElementById('mainMenu'));
});
