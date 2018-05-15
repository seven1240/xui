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

Blockly.Lua.globalIVREntryStart = 0;

Blockly.Lua.fsStart = function(block) {
  var code = 'tts_engine = "tts_commandline"\ntts_voice = "Ting-Ting"\n' +
    'session:set_tts_params(tts_engine, tts_voice)\n' +
    'session:setVariable("tts_engine", ' + 'tts_engine)\n' +
    'session:setVariable("tts_voice", ' + 'tts_voice)\n' +
    'session:answer()\n';
  return code;
};

Blockly.Lua.fsSessionAnswer = function(block) {
  var code = 'session:answer()\n';
  return code;
}

Blockly.Lua.fsConsoleLog = function(block) {
  var level = block.getFieldValue('Level');
  var text = Blockly.Lua.valueToCode(block, 'args', Blockly.Lua.ORDER_ATOMIC) || '""';
      text = text + ' .. "\\n"';
  var code = 'session:consoleLog("' + level + '", ' + text + ')\n';
  return code;
};

Blockly.Lua.fsSetTTS = function(block) {
  var text_engine = Blockly.Lua.valueToCode(block, 'TTSENGINE', Blockly.Lua.ORDER_ATOMIC);
  var text_voice = Blockly.Lua.valueToCode(block, 'VOICE', Blockly.Lua.ORDER_ATOMIC);
  var code = 'session:set_tts_params(' + text_engine + ', ' + text_voice + ')\n' +
    'session:setVariable("tts_engine", ' + text_engine + ')\n' +
    'session:setVariable("tts_voice", ' + text_voice + ')\n';
  return code;
};

Blockly.Lua.fsSessionPlay = function(block) {
  var value_args = Blockly.Lua.valueToCode(block, 'args', Blockly.Lua.ORDER_ATOMIC);
  var code = 'session:streamFile(' + value_args + ')\n';
  return code;
};

Blockly.Lua.fsSessionSpeak = function(block) {
  var value_args = Blockly.Lua.valueToCode(block, 'args', Blockly.Lua.ORDER_ATOMIC);
  var code = 'session:speak(' + value_args + ')\n';
  return code;
};

Blockly.Lua.fsSessionGet = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  var code = 'session:getVariable("' + dropdown_name + '")';
  return [code, Blockly.Lua.ORDER_NONE];
};

Blockly.Lua.fsFilePath = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  var code = '"' + dropdown_name + '"';
  return [code, Blockly.Lua.ORDER_NONE];
};

Blockly.Lua.fsFifo = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  var code = '"' + dropdown_name + '"';
  return [code, Blockly.Lua.ORDER_NONE];
};

Blockly.Lua.fsSessionSet = function(block) {
  var text_var = block.getFieldValue('var');
  var text_val = Blockly.Lua.valueToCode(block, 'args',
    Blockly.Lua.ORDER_ATOMIC) || '""';
  var code = 'session:setVariable("' + text_var + '", ' + text_val + ')\n';
  return code;
};

Blockly.Lua.fsSessionRead = function(block) {
  var text_min = Blockly.Lua.valueToCode(block, 'MIN', Blockly.Lua.ORDER_ATOMIC);
  var text_max = Blockly.Lua.valueToCode(block, 'MAX', Blockly.Lua.ORDER_ATOMIC);
  var text_sound = Blockly.Lua.valueToCode(block, 'sound', Blockly.Lua.ORDER_ATOMIC);
  var variable_digits = Blockly.Lua.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var text_timeout = Blockly.Lua.valueToCode(block, 'TIMEOUT', Blockly.Lua.ORDER_ATOMIC);
  var text_terminator = block.getFieldValue('terminator');

  if (!(text_sound.indexOf(".") >= 0 || text_sound.indexOf("/") >= 0 || text_sound.indexOf("\\\\") >= 0)) {
    if(text_sound.substring(text_sound.length-1)=="\'") {
      text_sound = text_sound.substr(1,text_sound.length-2)
    }

   	text_sound = 'say:' + text_sound;
  }

  var code = variable_digits + ' = session:read(' + text_min + ', ' +
    text_max + ', ' +
    text_sound + ', ' +
    text_timeout + ', "' +
    text_terminator + '");\n';
  return code;
};

Blockly.Lua.fsSessionPlayandGet = function(block) {
  var text_min = Blockly.Lua.valueToCode(block, 'MIN', Blockly.Lua.ORDER_ATOMIC);
  var text_max = Blockly.Lua.valueToCode(block, 'MAX', Blockly.Lua.ORDER_ATOMIC);
  var text_try = Blockly.Lua.valueToCode(block, 'MAX_TRIES', Blockly.Lua.ORDER_ATOMIC);
  var text_timeout = Blockly.Lua.valueToCode(block, 'TIMEOUT', Blockly.Lua.ORDER_ATOMIC) || '""';
  var text_terminator = block.getFieldValue('terminator');
  var text_sound = Blockly.Lua.valueToCode(block, 'Audio_Files', Blockly.Lua.ORDER_ATOMIC);
  var text_badinput = Blockly.Lua.valueToCode(block, 'Bad_Input_Audio_Files', Blockly.Lua.ORDER_ATOMIC);
  var text_regex = Blockly.Lua.valueToCode(block, 'REGEX', Blockly.Lua.ORDER_ATOMIC);
  var variable_name = Blockly.Lua.valueToCode(block, 'VAR_NAME', Blockly.Lua.ORDER_ATOMIC) || '""';
  var text_digits_timeout = Blockly.Lua.valueToCode(block, 'Digits_Timeout', Blockly.Lua.ORDER_ATOMIC) || '""';
  var transfer_on_failure = Blockly.Lua.valueToCode(block, 'Transfer_On_Failure', Blockly.Lua.ORDER_ATOMIC);
  var variable_digits = Blockly.Lua.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);

  if (!(text_sound.indexOf(".") >= 0 || text_sound.indexOf("/") >= 0 || text_sound.indexOf("\\\\") >= 0)) {
    if(text_sound.substring(text_sound.length-1)=="\'") {
      text_sound = text_sound.substr(1,text_sound.length-2)
    }

    text_sound = 'say:' + text_sound;
  }
   if (!(text_badinput.indexOf(".") >= 0 || text_badinput.indexOf("/") >= 0 || text_badinput.indexOf("\\\\") >= 0)) {
    if(text_badinput.substring(text_badinput.length-1)=="\'") {
      text_badinput = text_badinput.substr(1,text_badinput.length-2)
    }

    text_badinput = 'say:' + text_badinput;
  }
   if (!(text_regex.indexOf(".") >= 0 || text_regex.indexOf("/") >= 0 || text_regex.indexOf("\\\\") >= 0)) {
    if(text_regex.substring(text_regex.length-1)=="\'") {
      text_regex = text_regex.substr(1,text_regex.length-2)
    }

    text_regex =  text_regex;
  }
   if (!(transfer_on_failure.indexOf(".") >= 0 || transfer_on_failure.indexOf("/") >= 0 || transfer_on_failure.indexOf("\\\\") >= 0)) {
    if(transfer_on_failure.substring(transfer_on_failure.length-1)=="\'") {
      transfer_on_failure = transfer_on_failure.substr(1,transfer_on_failure.length-2)
    }

  }
   if (!(variable_name.indexOf(".") >= 0 || variable_name.indexOf("/") >= 0 || variable_name.indexOf("\\\\") >= 0)) {
    if(variable_name.substring(variable_name.length-1)=="\'") {
      variable_name = variable_name.substr(1,text_regex.length-2)
    }

  }


  var code = variable_digits + ' = session:playAndGetDigits(' + text_min + ', ' +
    text_max + ', ' +
    text_try + ', ' +
    text_timeout + ', "' +
    text_terminator + '", "' +
    text_sound + '", "' +
    text_badinput + '", "' +
    text_regex + '", "' +
    variable_name + '", "' +
    variable_digits + '", "' + 
    text_digits_timeout + '", "' +
    transfer_on_failure + '");\n';
  return code;
};

Blockly.Lua.fsSessionTransfer = function(block) {
  var text_dest = Blockly.Lua.valueToCode(block, 'destination', Blockly.Lua.ORDER_ATOMIC);
  var text_dialplan = Blockly.Lua.valueToCode(block, 'dialplan', Blockly.Lua.ORDER_ATOMIC);
  var text_context = Blockly.Lua.valueToCode(block, 'context', Blockly.Lua.ORDER_ATOMIC);
  var code = 'session:execute("transfer",' + text_dest + ' .. ' + '" "' + '..' + text_dialplan + ' .. ' + '" "' + ' .. ' + text_context + ' )\n';  
  return code;
};

Blockly.Lua.fsSessionExecute = function(block) {
  var text_app = block.getFieldValue('execute');
  var value_args = Blockly.Lua.valueToCode(block, 'args', Blockly.Lua.ORDER_ATOMIC) || '""';
  var code = 'session:execute("' + text_app + '", ' + value_args + ')\n';
  return code;
};

Blockly.Lua.fsFIFOS = function(block) {
  var fifoname = Blockly.Lua.valueToCode(block, 'fifoname', Blockly.Lua.ORDER_ATOMIC);
  var method = block.getFieldValue('NAME');
  var announce = Blockly.Lua.valueToCode(block, 'Fifo', Blockly.Lua.ORDER_ATOMIC);
  var music = Blockly.Lua.valueToCode(block, 'music file', Blockly.Lua.ORDER_ATOMIC);
  var code = 'session:execute("fifo", ' + fifoname + ' .. " ' +  method + ' ' + announce + ' ' + music + '")\n';
  return code;
};

Blockly.Lua.fsCurl = function(block) {
  var type = block.getFieldValue('type');
  var method = block.getFieldValue('method');
  var http = block.getFieldValue('curl');
  var data = block.getFieldValue('data');
  var code = 'session:execute("curl","' + http + ' ' + method + ' ' + type + ' ' + data + '")\n';
  return [code, Blockly.Lua.ORDER_NONE];
};

Blockly.Lua.IVR = function(block) {
  var text_name = Blockly.Lua.valueToCode(block, 'name', Blockly.Lua.ORDER_ATOMIC);
  var text_sound = Blockly.Lua.valueToCode(block, 'sound', Blockly.Lua.ORDER_ATOMIC);
  var text_max = Blockly.Lua.valueToCode(block, 'max', Blockly.Lua.ORDER_ATOMIC);
  var statements_entries = Blockly.Lua.statementToCode(block, 'entries');
  var statements_default = Blockly.Lua.statementToCode(block, 'default');
  var timeout = 5000;

  if (!(text_sound.indexOf(".") >= 0 || text_sound.indexOf("/") >= 0 || text_sound.indexOf("\\\\") >= 0)) {

   if(text_sound.substring(text_sound.length-1)=="\'")
      {
        text_sound = text_sound.substr(1,text_sound.length-2)
      }

   text_sound = 'say:' + text_sound;
  }

  var code = 'digits = session:read(1, ' + text_max + ', "' +
    text_sound + '", ' +
    timeout + ', "#")\n\n' 
  code = code + statements_entries;
  code = code + '  else\n  ' + statements_default + '  end\n';
  Blockly.Lua.globalIVREntryStart = 0;
  return code;
};

Blockly.Lua.IVREntry = function(block) {
  // var text_digit = block.getFieldValue('digit');
  var text_digit = Blockly.Lua.valueToCode(block, 'case', Blockly.Lua.ORDER_ATOMIC);
  var statements_actions = Blockly.Lua.statementToCode(block, 'actions');
  var the_else = Blockly.Lua.globalIVREntryStart ? "else" : "";
  Blockly.Lua.globalIVREntryStart = 1;
  var value = text_digit;

  if(value.substring(value.length-1)=="\'"){
     value = value.substr(1,value.length-2)
     value = '::digit' + value + '::' + '\n';
  }

  var code = the_else + 'if (digits == ' + text_digit + ') then\n' + value + statements_actions
  return code;
};

Blockly.Lua.IVRreturn = function(block) {
  var text_digit = Blockly.Lua.valueToCode(block, 'return', Blockly.Lua.ORDER_ATOMIC);

  if(text_digit.substring(text_digit.length-1)=="\'"){
  
   text_digit = text_digit.substr(1,text_digit.length-2)
     
  }
  
  var code = 'goto' + ' ' + 'digit' + text_digit + '\n' 
  return code;
};

Blockly.Lua.IVRAction= function(block) {
  var action = block.getFieldValue('action');
  var args = Blockly.Lua.valueToCode(block, 'args', Blockly.JSON.ORDER_ATOMIC);

  // var code = {action: action, args: args};
  var code = "";
  return code;
};


Blockly.Lua.IVRReady = function(block) {

  var code = 'if not session:ready() then return end' + '\n'
  return code;
};


Blockly.Lua.fsDBH = function(block) {
  var dsn  = block.getFieldValue('dsn');
  var user = block.getFieldValue('user');
  var pass = block.getFieldValue('pass');

  var code = 'dbh = freeswitch.Dbh("odbc://' + dsn + ':' + user + ':' + pass + '")\n';
  return code;
};

Blockly.Lua.fsDBHQuery = function(block) {
  var value_sql = Blockly.Lua.valueToCode(block, 'sql', Blockly.Lua.ORDER_ATOMIC);
  var text_sql_callback = block.getFieldValue('sql_callback');
  var code = 'dbh:query(' + value_sql + ', ' + '' + text_sql_callback + '' + ')\n';
  return code;
};

Blockly.Lua.fsDBHRow = function(block) {
  var text_col = block.getFieldValue('col');
  var code = 'row.' + text_col;
  return [code, Blockly.Lua.ORDER_NONE];
};

Blockly.Lua.tNow = function(block) {
  var code = "os.date('*t')";
  return [code, Blockly.Lua.ORDER_NONE];
}

Blockly.Lua.tNowstring = function(block) {
  var code = "os.time()";
  return [code, Blockly.Lua.ORDER_NONE];
}

Blockly.Lua.tDate = function(block) {
  var year = block.getFieldValue('year');
  var month = block.getFieldValue('month');
  var day = block.getFieldValue('day');
  var hour = block.getFieldValue('hour');
  var min = block.getFieldValue('min');
  var sec = block.getFieldValue('sec');
  var code = "os.date('*t', os.time{year=" + year +
    ", month=" + month + ", day=" + day +
    ", hour=" + hour + ", min=" + min + ", sec=" + sec + "})";
  return [code, Blockly.Lua.ORDER_NONE];
}

Blockly.Lua.tDatetime = function(block) {
  var year = block.getFieldValue('year');
  var month = block.getFieldValue('month');
  var day = block.getFieldValue('day');
  var hour = block.getFieldValue('hour');
  var min = block.getFieldValue('min');
  var sec = block.getFieldValue('sec');
  var code = " os.time({year=" + year +
    ", month=" + month + ", day=" + day +
    ", hour=" + hour + ", min=" + min + ", sec=" + sec + "})";
  return [code, Blockly.Lua.ORDER_NONE];
}

Blockly.Lua.tDateFormat = function(block) {
  var variable_date = Blockly.Lua.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var fmt_field = block.getFieldValue('fmt');

  var code = "os.date('" + fmt_field + "', os.time(" + variable_date + "))";
  return [code, Blockly.Lua.ORDER_NONE];
}

Blockly.Lua.tDateField = function(block) {
  var variable_date = Blockly.Lua.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var dropdown_field = block.getFieldValue('FIELD');

  var code = variable_date + "." + dropdown_field;
  return [code, Blockly.Lua.ORDER_NONE];
}

Blockly.Lua.audioRecord = function(block) {
  var path = Blockly.Lua.valueToCode(block, 'path', Blockly.Lua.ORDER_ATOMIC);
  var max_sec = block.getFieldValue("max");
  var threshold = block.getFieldValue("threshold");
  var silence_sec = block.getFieldValue("silence");

  var code = "session:recordFile(" + path + ", " + max_sec + ", " + threshold + ", " + silence_sec + ")";

  return code;
};
