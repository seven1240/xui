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

var FSAPPs = [
"answer",
"att_xfer",
"bgsystem",
"bind_digit_action",
"bind_meta_app",
"block_dtmf",
"break",
"bridge",
"bridge_export",
"capture",
"capture_video",
"check_acl",
"clear_digit_action",
"clear_speech_cache",
"cng_plc",
"conference",
"conference_set_auto_outcall",
"curl",
"cv_bug",
"db",
"decode_video",
"deduplicate_dtmf",
"deflect",
"delay_echo",
"detect_speech",
"digit_action_set_realm",
"displace_session",
"early_hangup",
"eavesdrop",
"echo",
"enable_heartbeat",
"enable_keepalive",
"endless_playback",
"erlang",
"erlang_sendmsg",
"eval",
"event",
"execute_extension",
"export",
"fax_detect",
"fifo",
"fifo_track_call",
"flush_dtmf",
"gentones",
"group",
"hangup",
"hash",
"hold",
"httapi",
"info",
"intercept",
"ivr",
"javascript",
"javascript",
"jitterbuffer",
"limit",
"limit_execute",
"limit_hash",
"limit_hash_execute",
"log",
"loop_playback",
"lua",
"lua",
"media_reset",
"mkdir",
"multiset",
"multiunset",
"mutex",
"novideo",
"park",
"park_state",
"phrase",
"pickup",
"play_and_detect_speech",
"play_and_get_digits",
"play_fsv",
"play_video",
"play_yuv",
"playback",
"pre_answer",
"preprocess",
"presence",
"privacy",
"push",
"queue_dtmf",
"read",
"record",
"record_av",
"record_fsv",
"record_session",
"record_session_mask",
"record_session_unmask",
"recovery_refresh",
"redirect",
"remove_bugs",
"rename",
"respond",
"ring_ready",
"rxfax",
"say",
"sched_broadcast",
"sched_cancel",
"sched_hangup",
"sched_heartbeat",
"sched_transfer",
"send_display",
"send_dtmf",
"send_info",
"session_loglevel",
"set",
"set_audio_level",
"set_global",
"set_media_stats",
"set_mute",
"set_name",
"set_profile_var",
"set_user",
"set_zombie_exec",
"sleep",
"socket",
"sofia_sla",
"soft_hold",
"sound_test",
"spandsp_detect_tdd",
"spandsp_inject_tdd",
"spandsp_send_tdd",
"spandsp_start_dtmf",
"spandsp_start_fax_detect",
"spandsp_start_tone_detect",
"spandsp_stop_detect_tdd",
"spandsp_stop_dtmf",
"spandsp_stop_fax_detect",
"spandsp_stop_inject_tdd",
"spandsp_stop_tone_detect",
"speak",
"start_dtmf",
"start_dtmf_generate",
"stop",
"stop_displace_session",
"stop_dtmf",
"stop_dtmf_generate",
"stop_record_session",
"stop_tone_detect",
"stop_video_write_overlay",
"stopfax",
"strftime",
"system",
"t38_gateway",
"three_way",
"tone_detect",
"transfer",
"transfer_vars",
"txfax",
"unbind_meta_app",
"unblock_dtmf",
"unhold",
"unloop",
"unset",
"unshift",
"valet_park",
"verbose_events",
"video_refresh",
"video_write_overlay",
"vnc",
"voicemail",
"wait_for_answer",
"wait_for_silence"];

var IVRAPPs = [
"menu-exit",
"menu-sub",
"menu-exec-app",
"menu-play-sound",
"menu-back",
"menu-top"];

Blockly.Blocks['fsStart'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.FS_BLOCK_IVRSTART);
    this.setNextStatement(true);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['audioRecord'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.FS_BLOCK_AUDIORECORD);
    this.appendDummyInput().appendField(Blockly.Msg.FS_BLOCK_AUDIORECORD_PATH);
    this.appendValueInput("path").setCheck(null);

    this.appendDummyInput()
        .appendField(Blockly.Msg.FS_BLOCK_AUDIORECORD_MAX)
        .appendField(new Blockly.FieldTextInput("6000"), "max")
        .appendField(Blockly.Msg.FS_BLOCK_AUDIORECORD_THRESHOLD )
        .appendField(new Blockly.FieldTextInput("500"), "threshold")
        .appendField(Blockly.Msg.FS_BLOCK_AUDIORECORD_SILENCE)
        .appendField(new Blockly.FieldTextInput("5"), "silence");

    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['fsSessionAnswer'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.FS_BLOCK_ANSWER);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['fsConsoleLog'] = {
    init: function() {
        this.appendValueInput("args")
            .setCheck(["String", "Number"])
            .appendField(Blockly.Msg.FS_BLOCK_LOG)
            .appendField(new Blockly.FieldDropdown([
                ["7-Debug", "debug"],
                ["6-Info", "info"],
                ["5-Notice", "notice"],
                ["4-Warning", "warning"],
                ["3-Error", "err"],
                ["2-Critical", "crit"],
                ["1-Alert", "alert"],
                ["0-Console", "console"]]), "Level")
            .appendField(Blockly.Msg.FS_BLOCK_LOG_TEXT);
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(20);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.Blocks['fsSetTTS'] = {
  init: function() {
    this.appendValueInput("TTSENGINE")
        .appendField(Blockly.Msg.FS_BLOCK_TTSENGINE)
    this.appendValueInput("VOICE")
        .appendField(Blockly.Msg.FS_BLOCK_VOICE)
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['fsSessionPlay'] = {
    init: function() {
        this.appendValueInput("args")
            .appendField(Blockly.Msg.FS_BLOCK_PLAY);
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(20);
        this.setTooltip('Sound file or text to play');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.Blocks['fsSessionSpeak'] = {
    init: function() {
        this.appendValueInput("args")
            .appendField(Blockly.Msg.FS_BLOCK_SPEAK);
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(20);
        this.setTooltip('Text to Speak');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.Blocks['fsSessionGet'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.FS_BLOCK_GET)
        .appendField(new Blockly.FieldDropdown([
            ["Caller ID Number", "caller_id_number"],
            ["Caller ID Name", "caller_id_name"],
            ["Destination_number", "destination_number"],
            ["Sip_refer_to", "sip_refer_to"],
            ["Sip_invite_failure_status", "sip_invite_failure_status"],
            ["Originate_disposition", "originate_disposition"],
            ["UUID", "channel_uuid"],
            ["Curl_response_code", "curl_response_code"],
            ["Curl_response_data", "curl_response_data"]]), "NAME");
    this.setInputsInline(true);
    this.setOutput(true, "String");
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['fsSessionSet'] = {
    init: function() {
        this.appendValueInput("args")
            .appendField(Blockly.Msg.FS_BLOCK_SET)
            .appendField(new Blockly.FieldTextInput("var"), "var")
            .appendField("=");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(20);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.Blocks['fsSessionRead'] = {
    init: function() {
        this.appendValueInput("MIN")
            .appendField(Blockly.Msg.FS_BLOCK_READDTMF)
            .appendField(Blockly.Msg.FS_BLOCK_MIN)
        this.appendValueInput("MAX")
            .appendField(Blockly.Msg.FS_BLOCK_MAX)
        this.appendDummyInput()
            .appendField(Blockly.Msg.FS_BLOCK_VAR)
            .appendField(new Blockly.FieldVariable(Blockly.Msg.VARIABLES_DEFAULT_NAME),"VAR")

        this.appendValueInput("TIMEOUT")
            .appendField(Blockly.Msg.FS_BLOCK_TIMEOUT)
        this.appendDummyInput()
            .appendField(Blockly.Msg.FS_BLOCK_TERMINATOR)
            .appendField(new Blockly.FieldTextInput("#"), "terminator");
        this.appendValueInput("sound")
            .setCheck("String")
            .appendField(Blockly.Msg.FS_BLOCK_SOUND)
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(20);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.Blocks['fsSessionTransfer'] = {
    init: function() {
        this.appendValueInput("destination")
            .appendField(Blockly.Msg.FS_BLOCK_TRANSFER)
            .appendField(Blockly.Msg.FS_BLOCK_DESTINATION)
        this.appendValueInput("dialplan")
            .appendField(Blockly.Msg.FS_BLOCK_DIALPLAN)
        this.appendValueInput("context")
            .appendField(Blockly.Msg.FS_BLOCK_CONTEXT)
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(20);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.Blocks['fsSessionExecute'] = {
    init: function() {
        var drops = new Array();
        FSAPPs.forEach(function(app) {
            drops.push([app, app]);
        });
        this.appendValueInput("args")
            .appendField(Blockly.Msg.FS_BLOCK_EXECUTE)
            .appendField(new Blockly.FieldDropdown(drops), "execute");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(20);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.Blocks['fsFIFOS'] = {
    init: function() {
        this.appendValueInput("fifoname")
            .appendField(Blockly.Msg.FS_BLOCK_FIFO)
            .appendField(Blockly.Msg.FS_BLOCK_FILENAME)
        this.appendValueInput("Fifo")
            .appendField(Blockly.Msg.FS_BLOCK_INOROUT)
            .appendField(new Blockly.FieldDropdown([
                        ["in", "in"],
                        ["out wait", "out wait"],
                        ["out nowait", "out nowait"]]),"NAME")
            .appendField(Blockly.Msg.FS_BLOCK_ANNOUNCE);
        this.appendValueInput("music file")
            .appendField(Blockly.Msg.FS_BLOCK_MUSIC)
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(20);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.Blocks['fsCurl'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.FS_BLOCK_CURL)
        .appendField(new Blockly.FieldTextInput("http://host/"), "curl")
        .appendField(new Blockly.FieldDropdown([
                        ["", ""],
                        ["headers", "headers"],
                        ["json", "json"]]),"type")
        .appendField(new Blockly.FieldDropdown([
                        ["", ""],
                        ["get", "get"],
                        ["head", "head"],
                        ["post", "post"]]),"method")
        .appendField(new Blockly.FieldTextInput(" "), "data")
    this.setInputsInline(true);
    this.setOutput(true, "fsCurl");
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


Blockly.Blocks['IVR'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Msg.FS_BLOCK_IVR)
        this.appendValueInput("name")
            .appendField(Blockly.Msg.FS_BLOCK_IVR_NAME)
        this.appendValueInput("sound")
            .appendField(Blockly.Msg.FS_BLOCK_SOUND)
        this.appendDummyInput()
        this.appendValueInput("max")
            .appendField(Blockly.Msg.FS_BLOCK_MAX)
	this.appendDummyInput()
            .appendField(Blockly.Msg.FS_BLOCK_TERMINATOR)
            .appendField(new Blockly.FieldTextInput("#"), "terminator");
	this.appendStatementInput("entries");
        this.appendDummyInput()
            .appendField(Blockly.Msg.FS_BLOCK_DEFAULT);
        this.appendStatementInput("default");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('IVR Entries');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.Blocks['IVREntry'] = {
    init: function() {
        this.appendValueInput("case")
            .appendField(Blockly.Msg.FS_BLOCK_CASE)
        this.appendDummyInput()
        this.appendStatementInput("actions");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(40);
        // this.setOutput('IvrEntry');
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.Blocks['IVRreturn'] = {
  init: function() {
	this.appendValueInput("return")
            .appendField(Blockly.Msg.FS_BLOCK_RETURN)
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(40);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.Blocks['IVRAction'] = {
    init: function() {
        var drops = new Array();
        IVRAPPs.forEach(function(app) {
            drops.push([app, app]);
        });
        this.appendValueInput("args")
            .appendField(Blockly.Msg.FS_BLOCK_EXECUTE)
            .appendField(new Blockly.FieldDropdown(drops), "action");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(20);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};

Blockly.Blocks['IVRReady'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Msg.FS_BLOCK_READY)
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(40);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }

};


Blockly.Blocks['fsDBH'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("DB Connect DSN")
        .appendField(new Blockly.FieldTextInput("dsn"), "dsn")
        .appendField("Username")
        .appendField(new Blockly.FieldTextInput("user"), "user")
        .appendField("Pasword")
        .appendField(new Blockly.FieldTextInput("pass"), "pass");
    this.setInputsInline(true);
    // this.setOutput(true, "DBH");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


Blockly.Blocks['fsDBHQuery'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Query");
    this.appendValueInput("sql")
        .setCheck(null);
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("sql_callback"), "sql_callback");
    // this.setOutput(true, null);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['fsDBHRow'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("row.")
        .appendField(new Blockly.FieldTextInput("col"), "col");
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


Blockly.Blocks['tNow'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.tNow);

    this.setOutput(true, "Date");
    // this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['tDate'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.tDate)
        .appendField(new Blockly.FieldTextInput("year"), "year")
        .appendField("-")
        .appendField(new Blockly.FieldTextInput("month"), "month")
        .appendField("-")
        .appendField(new Blockly.FieldTextInput("day"), "day")
        .appendField(new Blockly.FieldTextInput("hour"), "hour")
        .appendField(":")
        .appendField(new Blockly.FieldTextInput("min"), "min")
        .appendField(":")
        .appendField(new Blockly.FieldTextInput("sec"), "sec");

    this.setOutput(true, "Date");
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['tDatetime'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.tDatetime)
        .appendField(new Blockly.FieldTextInput("year"), "year")
        .appendField("-")
        .appendField(new Blockly.FieldTextInput("month"), "month")
        .appendField("-")
        .appendField(new Blockly.FieldTextInput("day"), "day")
        .appendField(new Blockly.FieldTextInput("hour"), "hour")
        .appendField(":")
        .appendField(new Blockly.FieldTextInput("min"), "min")
        .appendField(":")
        .appendField(new Blockly.FieldTextInput("sec"), "sec");

    this.setOutput(true, "Time");
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['tDateFormat'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.tDateFormat)
        .appendField(new Blockly.FieldVariable(Blockly.Msg.VARIABLES_DEFAULT_NAME), "VAR")
        .appendField(new Blockly.FieldTextInput("fmt"), "fmt")
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['tDateField'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.tDateField)
        .appendField(new Blockly.FieldDropdown([
            [Blockly.Msg.tDateField_YEAR, "year"],
            [Blockly.Msg.tDateField_MONTH, "month"],
            [Blockly.Msg.tDateField_DAY, "day"],
            [Blockly.Msg.tDateField_HOUR, "hour"],
            [Blockly.Msg.tDateField_MIN, "min"],
            [Blockly.Msg.tDateField_SEC, "sec"],
            [Blockly.Msg.tDateField_WDAY, "wday"],
            [Blockly.Msg.tDateField_YDAY, "yday"]
        ]), "FIELD")
        .appendField(new Blockly.FieldVariable(Blockly.Msg.VARIABLES_DEFAULT_NAME), "VAR")
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
