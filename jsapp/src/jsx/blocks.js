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
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';
import { Link } from 'react-router';

class BlockPage extends React.Component {
	constructor(props) {
		super(props);
		this.workspace = null;
		this.onresize = null;
		this.fs_file_path_dropdown_data = null;
		this.state = {block: {name: "Loading ..."}};
	}

	componentDidMount() {
		console.log("did mount", this.props);
		var _this = this;

		this.onresize = function() {
			var blocklyDiv = $('#blocks');
			var blocklyArea = $('#main');

			// Position blocklyDiv over blocklyArea.
			if (blocklyDiv.style) {
				var element = blocklyArea;
				var x = 0;
				var y = 0;
				do {
					x += element.offsetLeft;
					y += element.offsetTop;
					element = element.offsetParent;
				} while (element);

				blocklyDiv.style.left = x + 'px';
				blocklyDiv.style.top = y + 'px';
				// blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
				blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
			} else if (blocklyDiv.offset) {
				console.log('offset');
				console.log("offset", blocklyArea.offsetWidth);
				console.log("offset", blocklyArea.offsetHeight);
				// blocklyDiv.width(window.innerWidth - 40);
				blocklyDiv.height(window.innerHeight - blocklyDiv.offset().top - 100);
			}
		};

		var load_toolbox = function() {

var toolbox = `<xml id="toolbox" style="display: none">
<category name="IVR" colour="0">
	<block type="fsStart"></block>
	<block type="IVR">
         <value name="sound">
            <shadow type="text">
             <field name="Sound"></field>
           </shadow>
         </value>
         <value name="MAX">
            <shadow type="text">
             <field name="Max"></field>
           </shadow>
         </value>
        </block>
	<block type="IVREntry">
         <value name="case">
            <shadow type="text">
             <field name="Case"></field>
           </shadow>
         </value>
       </block>
</category>

<category name="FreeSWITCH" colour="10">
	<block type="fsConsoleLog">
	      <value name="args">
          <shadow type="text">
            <field name="TEXT"></field>
          </shadow>
        </value>
	</block>
	<block type="fsSetTTS">
         <value name="TTSENGINE">
            <shadow type="text">
             <field name="TTSENGINE"></field>
           </shadow>
         </value>
         <value name="VOICE">
            <shadow type="text">
             <field name="VOICE"></field>
           </shadow>
         </value>
        </block>
	<block type="fsFilePath"></block>
	<block type="fsSessionAnswer"></block>
	<block type="fsSessionGet"></block>
	<block type="fsSessionSet">
         <value name="args">
            <shadow type="text">
             <field name="SET"></field>
           </shadow>
         </value>
        </block>
	<block type="fsSessionPlay">
          <value name="args">
            <shadow type="text">
             <field name="TEXT"></field>
           </shadow>
         </value>
        </block>
	<block type="fsSessionSpeak">
          <value name="args">
           <shadow type="text">
            <field name="TEXT"></field>
           </shadow>
         </value>
        </block>
	<block type="fsSessionRead">
          <value name="MIN">
            <shadow type="text">
             <field name="MIN"></field>
           </shadow>
         </value>
         <value name="MAX">
            <shadow type="text">
             <field name="MAX"></field>
           </shadow>
         </value>
         <value name="TIMEOUT">
            <shadow type="text">
             <field name="TIMEOUT"></field>
           </shadow>
         </value>
        <value name="sound">
            <shadow type="text">
             <field name="SOUND"></field>
           </shadow>
         </value>
        </block>
	<block type="fsSessionExecute"></block>
</category>

<category name="FSDB" colour="20">
	<block type="fsDBH"></block>
	<block type="fsDBHQuery"></block>
	<block type="fsDBHRow"></block>
</category>

<sep></sep>

<category name="Logic" colour="210">
	<block type="controls_if"></block>
	<block type="logic_compare"></block>
	<block type="logic_operation"></block>
	<block type="logic_negate"></block>
	<block type="logic_boolean"></block>
	<block type="logic_null"></block>
	<block type="logic_ternary"></block>
</category>

<category name="Loops" colour="120">
	<block type="controls_repeat_ext">
		<value name="TIMES">
		<shadow type="math_number">
			<field name="NUM">10</field>
		</shadow>
		</value>
	</block>
	<block type="controls_whileUntil"></block>
	<block type="controls_for">
		<value name="FROM">
			<shadow type="math_number">
				<field name="NUM">1</field>
			</shadow>
		</value>
		<value name="TO">
			<shadow type="math_number">
				<field name="NUM">10</field>
			</shadow>
		</value>
		<value name="BY">
			<shadow type="math_number">
				<field name="NUM">1</field>
			</shadow>
		</value>
	</block>
	<block type="controls_forEach"></block>
	<block type="controls_flow_statements"></block>
</category>

<category name="Math" colour="230">
	<block type="math_number"></block>
	<block type="math_arithmetic">
		<value name="A">
			<shadow type="math_number">
				<field name="NUM">1</field>
			</shadow>
		</value>
		<value name="B">
			<shadow type="math_number">
				<field name="NUM">1</field>
			</shadow>
		</value>
	</block>
	<block type="math_single">
		<value name="NUM">
			<shadow type="math_number">
				<field name="NUM">9</field>
			</shadow>
		</value>
	</block>
	<block type="math_trig">
		<value name="NUM">
			<shadow type="math_number">
				<field name="NUM">45</field>
			</shadow>
		</value>
	</block>
	<block type="math_constant"></block>
	<block type="math_number_property">
		<value name="NUMBER_TO_CHECK">
			<shadow type="math_number">
				<field name="NUM">0</field>
			</shadow>
		</value>
	</block>
	<block type="math_round">
		<value name="NUM">
			<shadow type="math_number">
				<field name="NUM">3.1</field>
			</shadow>
		</value>
	</block>
	<block type="math_on_list">	</block>
	<block type="math_modulo">
		<value name="DIVIDEND">
			<shadow type="math_number">
				<field name="NUM">64</field>
			</shadow>
		</value>
		<value name="DIVISOR">
			<shadow type="math_number">
				<field name="NUM">10</field>
			</shadow>
		</value>
	</block>
	<block type="math_constrain">
		<value name="VALUE">
			<shadow type="math_number">
				<field name="NUM">50</field>
			</shadow>
		</value>
		<value name="LOW">
			<shadow type="math_number">
				<field name="NUM">1</field>
			</shadow>
		</value>
		<value name="HIGH">
			<shadow type="math_number">
				<field name="NUM">100</field>
			</shadow>
		</value>
	</block>
	<block type="math_random_int">
		<value name="FROM">
			<shadow type="math_number">
				<field name="NUM">1</field>
			</shadow>
		</value>
		<value name="TO">
			<shadow type="math_number">
				<field name="NUM">100</field>
			</shadow>
		</value>
	</block>
	<block type="math_random_float">	</block>
</category>
<category name="Text" colour="160">
	<block type="text">	</block>
	<block type="text_join">	</block>
	<block type="text_append">
		<value name="TEXT">
			<shadow type="text">			</shadow>
		</value>
	</block>
	<block type="text_length">
		<value name="VALUE">
			<shadow type="text">
				<field name="TEXT">abc</field>
			</shadow>
		</value>
	</block>
	<block type="text_isEmpty">
		<value name="VALUE">
			<shadow type="text">
				<field name="TEXT"></field>
			</shadow>
		</value>
	</block>
	<block type="text_indexOf">
		<value name="VALUE">
	<block type="variables_get">
				<field name="VAR">{textVariable}</field>
	</block>
		</value>
		<value name="FIND">
			<shadow type="text">
				<field name="TEXT">abc</field>
			</shadow>
		</value>
	</block>
	<block type="text_charAt">
		<value name="VALUE">
	<block type="variables_get">
				<field name="VAR">{textVariable}</field>
	</block>
		</value>
	</block>
	<block type="text_getSubstring">
		<value name="STRING">
	<block type="variables_get">
				<field name="VAR">{textVariable}</field>
	</block>
		</value>
	</block>
	<block type="text_changeCase">
		<value name="TEXT">
			<shadow type="text">
				<field name="TEXT">abc</field>
			</shadow>
		</value>
	</block>
	<block type="text_trim">
		<value name="TEXT">
			<shadow type="text">
				<field name="TEXT">abc</field>
			</shadow>
		</value>
	</block>
	<block type="text_print">
		<value name="TEXT">
			<shadow type="text">
				<field name="TEXT">abc</field>
			</shadow>
		</value>
	</block>
	<block type="text_prompt_ext">
		<value name="TEXT">
			<shadow type="text">
				<field name="TEXT">abc</field>
			</shadow>
		</value>
	</block>
</category>
<category name="Lists" colour="260">
	<block type="lists_create_with">
<mutation items="0"></mutation>
	</block>
	<block type="lists_create_with">	</block>
	<block type="lists_repeat">
		<value name="NUM">
			<shadow type="math_number">
				<field name="NUM">5</field>
			</shadow>
		</value>
	</block>
	<block type="lists_length">	</block>
	<block type="lists_isEmpty">	</block>
	<block type="lists_indexOf">
		<value name="VALUE">
	<block type="variables_get">
				<field name="VAR">{listVariable}</field>
	</block>
		</value>
	</block>
	<block type="lists_getIndex">
		<value name="VALUE">
	<block type="variables_get">
				<field name="VAR">{listVariable}</field>
	</block>
		</value>
	</block>
	<block type="lists_setIndex">
		<value name="LIST">
	<block type="variables_get">
				<field name="VAR">{listVariable}</field>
	</block>
		</value>
	</block>
	<block type="lists_getSublist">
		<value name="LIST">
	<block type="variables_get">
				<field name="VAR">{listVariable}</field>
	</block>
		</value>
	</block>
	<block type="lists_split">
		<value name="DELIM">
			<shadow type="text">
				<field name="TEXT">,</field>
			</shadow>
		</value>
	</block>
	<block type="lists_sort">	</block>
</category>
<category name="Colour" colour="20">
	<block type="colour_picker">	</block>
	<block type="colour_random">	</block>
	<block type="colour_rgb">
		<value name="RED">
			<shadow type="math_number">
				<field name="NUM">100</field>
			</shadow>
		</value>
		<value name="GREEN">
			<shadow type="math_number">
				<field name="NUM">50</field>
			</shadow>
		</value>
		<value name="BLUE">
			<shadow type="math_number">
				<field name="NUM">0</field>
			</shadow>
		</value>
	</block>
	<block type="colour_blend">
		<value name="COLOUR1">
			<shadow type="colour_picker">
				<field name="COLOUR">#ff0000</field>
			</shadow>
		</value>
		<value name="COLOUR2">
			<shadow type="colour_picker">
				<field name="COLOUR">#3333ff</field>
			</shadow>
		</value>
		<value name="RATIO">
			<shadow type="math_number">
				<field name="NUM">0.5</field>
			</shadow>
		</value>
	</block>
</category>
<sep></sep>
<category name="Variables" colour="330" custom="VARIABLE"></category>
<category name="Functions" colour="290" custom="PROCEDURE"></category>
</xml>
`

			var xml = document.createElement('div');
			xml.innerHTML = toolbox;

			var body = document.getElementById('body');
			body.appendChild(xml);
		}

		var init_blockly = function() {
			let workspace = Blockly.inject('blocks', {
				toolbox: document.getElementById('toolbox'),
				media: "/assets/blockly/media/"
			});
			return workspace;
		}

		if (typeof(Blockly) === "undefined") {
			// this dosn't work yet, trying to figure out, if you know how to make it work, fire a pull request
			window.alert("SHOULD NOT HAPPEN!");

			var body = document.getElementById('body');
			var script = document.createElement('script');

			script.setAttribute('type', 'text/javascript');
			script.setAttribute('src', "/assets/blockly/blockly_compressed.js");
			body.appendChild(script);
			script.setAttribute('src', "/assets/blockly/blocks_compressed.js");
			body.appendChild(script);
			script.setAttribute('src', "/assets/blockly/lua_compressed.js");
			body.appendChild(script);
			script.setAttribute('src', "/assets/blockly/javascript_compressed.js");
			body.appendChild(script);
			script.setAttribute('src', "/assets/blockly/fs_blocks.js");
			body.appendChild(script);
			script.setAttribute('src', "/assets/blockly/fs_blocks_lua.js");
			body.appendChild(script);
			script.setAttribute('src', "/assets/blockly/fs_blocks_javascript.js");
			body.appendChild(script);
			script.setAttribute('src', "/assets/blockly/en.js");
			body.appendChild(script);

			setTimeout(init_blockly, 1000);
			window.addEventListener('resize', this.onresize, false);
			this.onresize();
			// Blockly.svgResize(workspace);
		} else {
			$.get('/api/media_files', function(obj) {
				console.log("data", obj);
				if (obj.length == 0) {
					obj.push({name:"Error: No file, Please upload some media files", abs_path:"/tmp/File-Not-Found-Error.wav"});
				}
				_this.fs_file_path_dropdown_data = obj.map(function(row) {
					return [row.name, row.abs_path];
				});
			});

			let get_fs_file_path_drowndown_data = function() {
				return _this.fs_file_path_dropdown_data;
			}

			Blockly.Blocks['fsFilePath'] = {
				init: function() {
					this.appendDummyInput()
					.appendField(Blockly.Msg.FS_BLOCK_FILE)
					.appendField(new Blockly.FieldDropdown(get_fs_file_path_drowndown_data), "NAME");

					this.setInputsInline(true);
					this.setOutput(true, "String");
					this.setTooltip('');
					this.setColour(0);
					this.setHelpUrl('http://www.example.com/');
				}
			};

			load_toolbox();
			_this.workspace = init_blockly();
			this.onresize();
			window.addEventListener('resize', this.onresize, false);
			Blockly.svgResize(_this.workspace);

			$.getJSON("/api/blocks/" + _this.props.params.id, function(block) {
				_this.setState({block, block});

				if (block && block.xml && block.xml.length > 0) {
					Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(block.xml), _this.workspace);
				}
			});
		}
	}

	handleControlClick(e) {
		let _this = this;
		let data = e.target.getAttribute("data");

		let toLua = function() {
			let code = Blockly.Lua.workspaceToCode(_this.workspace);
			console.log(code);
			return code;
		}

		if (data == "save") {
			let lua = toLua();
			let block = {}
			block.id = this.props.params.id;
			block.lua = toLua();
			let xml = Blockly.Xml.workspaceToDom(_this.workspace);
			block.xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(_this.workspace));
			block.js = "alert(1);"// disabled;

			$.ajax({
				type: "POST",
				url: "/api/blocks/" + block.id,
				headers: {"X-HTTP-Method-Override": "PUT"},
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(block),
				success: function () {
					_this.setState({errmsg: {key: "Saved at", time: Date()}});
				},
				error: function(msg) {
					console.error("block", msg);
				}
			});
		} else if (data == "export") {
			let download = function(filename, text) {
				var pom = document.createElement('a');
				pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
				pom.setAttribute('download', filename);

				if (document.createEvent) {
					var event = document.createEvent('MouseEvents');
					event.initEvent('click', true, true);
					pom.dispatchEvent(event);
				} else {
					pom.click();
				}
			}

		    download("block-" + this.state.block.id + ".lua", toLua());
		} else if (data == "exportSVG") {
			const renderSimple = function (workspace) {
				var aleph = workspace.svgBlockCanvas_.cloneNode(true);
				aleph.removeAttribute("width");
				aleph.removeAttribute("height");
				if (aleph.children[0] !== undefined) {
					aleph.removeAttribute("transform");
					aleph.children[0].removeAttribute("transform");
					aleph.children[0].children[0].removeAttribute("transform");
					var linkElm = document.createElementNS("http://www.w3.org/1999/xhtml", "style");
					linkElm.textContent = Blockly.Css.CONTENT.join('') + '\n\n';
					aleph.insertBefore(linkElm, aleph.firstChild);
					//$(aleph).find('rect').remove();
					var bbox = document.getElementsByClassName("blocklyBlockCanvas")[0].getBBox();
					var xml = new XMLSerializer().serializeToString(aleph);
					xml = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+bbox.width+'" height="'+bbox.height+'" viewBox="0 0 '+bbox.width+' '+bbox.height+'"><rect width="100%" height="100%" fill="white"></rect>'+xml+'</svg>';
					var data = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
					// var img  = document.createElement("img");
					// console.log(xml);
					// img.setAttribute('src', data);
					// document.body.appendChild(img);

					var pom = document.createElement('a');
					pom.setAttribute('href', data);
					pom.setAttribute('download', "block-" + _this.state.block.id + ".svg");

					if (document.createEvent) {
						var event = document.createEvent('MouseEvents');
						event.initEvent('click', true, true);
						pom.dispatchEvent(event);
					} else {
						pom.click();
					}
				}
			}

			renderSimple(_this.workspace);
		}
	}

	componentWillUnmount() {
		console.log("will unmount ......");
		if (this.workspace) {
			this.workspace.dispose();
			this.workspace = null;
		}

		if (this.onresize) {
			window.removeEventListener('resize', this.onresize);
		}
	}

	render() {
		return <div id='blocks'>
			<div className="controls">
				<Button><T.span onClick={this.handleControlClick.bind(this)} data="exportSVG" text="Export SVG" /></Button>
				<Button><T.span onClick={this.handleControlClick.bind(this)} data="export" text="Export Lua" /></Button>
				<Button><T.span onClick={this.handleControlClick.bind(this)} data="save" text="Save" /></Button>
			</div>
			<h1><T.span text="Blocks"/> {this.state.block.name} <small>{this.state.block.description}</small></h1>
		</div>;
	}
}

class NewBlock extends React.Component {
	propTypes: {handleNewUserAdded: React.PropTypes.func}

	constructor(props) {
		super(props);

		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		let _this = this;

		console.log("submit...");
		let block = form2json('#newBlockForm');
		console.log("block", block);

		if (!block.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		$.ajax({
			type: "POST",
			url: "/api/blocks",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(block),
			success: function (obj) {
				block.id = obj.id;
				_this.props["data-handleNewBlockAdded"](block);
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	render() {
		console.log(this.props);

		return <Modal {...this.props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Block" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newBlockForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="cool_block" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescriptioin">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description"/></Col>
					<Col sm={10}><FormControl type="description" name="description" placeholder="IVR block for ..." /></Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={10}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;<T.span text="Save" />
						</Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
				</FormGroup>
			</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>
					<i className="fa fa-times" aria-hidden="true"></i>&nbsp;
					<T.span text="Close" />
				</Button>
			</Modal.Footer>
		</Modal>;
	}
}

class BlocksPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {rows: [], formShow: false};

		// this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleControlClick(e) {
		this.setState({ formShow: true});
	}

	handleBlockAdded(block) {
		var rows = this.state.rows;
		rows.push(block);
		this.setState({rows: rows, formShow: false});
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		$.ajax({
			type: "DELETE",
			url: "/api/blocks/" + id,
			success: function () {
				console.log("deleted")
				var rows = _this.state.rows.filter(function(row) {
					return row.id != id;
				});

				_this.setState({rows: rows});
			},
			error: function(msg) {
				console.error("block", msg);
			}
		});
	}

	componentDidMount() {
		var _this = this;
		$.getJSON("/api/blocks", function(blocks) {
			console.log("blocks", blocks);
			_this.setState({rows: blocks});
		});
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
	    var danger = this.state.danger ? "danger" : "";

		let _this = this;

		let rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/blocks/${row.id}`}>{row.name}</Link></td>
					<td>{row.description}</td>
					<td>{row.created_at}</td>
					<td><T.a onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <div>
			<div className="controls">
				<Button>
					<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="New" />
				</Button>
			</div>

			<h1><T.span text="IVR Blocks"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Created At"/></th>
					<th><T.span text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewBlock show={this.state.formShow} onHide={formClose} data-handleNewBlockAdded={this.handleBlockAdded.bind(this)}/>
		</div>
	}
}

export {BlocksPage, BlockPage};
