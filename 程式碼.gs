/**
 * Sushi
 * @type {{}}
 * @description (單例) Sushi 所提供的指令
 */
var Sushi = ((sushi) => {
    var scriptProperties = PropertiesService.getScriptProperties();

    // get profile name
    var getName = (event) => {
        if(event.profile === null) {
            return '客倌';
        } else if (event.isMaster) {
            return '主人';
        } else {
            return ' ' + event.profile.displayName + ' ';
        }
    };

    // Sushi
    var AZScript = (event) => {
        Line.replyBtnTemp(event.replyToken, 'Sushi 在這兒～', Sushi.getCommandTemp(event.isMaster))
    };

    // cmd
    var cmdScript = (event) => {
        Line.replyMsg(event.replyToken, Sushi.getCommandList(event.isMaster));
    };

    // leave
    var leaveScript = (event) => {
        if (event.isMaster) {
            Line.replyMsg(event.replyToken, getName(event) + '掰掰~\nSushi 先行告退了');
        } else {
            Line.replyMsg(event.replyToken, 'Bye~\nSushi 先行告退了');
        }
        Line.leave(event.source.type, event.sourceId);
    };

    // myid
    var myidScript = (event) => {
        Line.replyMsg(event.replyToken, getName(event) + '您的ID是：\n' + event.source.userId);
    };

    // start
    var startScript = (event) => {
        if (event.isMaster) {
            if (event.lineStatus) {
                Line.replyMsg(event.replyToken, getName(event) + '有什麼想讓 Sushi 服務的嗎');
            } else {
                GoogleSheet.setLineStatus(true);
                Line.replyMsg(event.replyToken, 'Sushi 開始上班 \n' + getName(event) + '有什麼事請吩咐 \n要 Sushi 下班請輸入 end');
            }
        } else {
            Line.replyMsg(event.replyToken, '客倌不是 Sushi 的主人\n不能叫我上班');
        }
    };

    // end
    var endScript = (event) => {
        if (event.isMaster) {
            GoogleSheet.setLineStatus(false);
            Line.replyMsg(event.replyToken, 'Sushi 暫時下班～ \n勿掛念 \n要 Sushi 上班請輸入 start');
        } else {
            Line.replyMsg(event.replyToken, '客倌不是 Sushi 的主人\n不能叫我下班');
        }
    };

    // 指令集
    var gCommand = {
        'Sushi': {
            'name': '基礎指令',
            'alias': ['Sushi', '安安', '在嗎', '哈嘍', 'hi'],
            'fn': AZScript,
            'help': '提供@user可使用的指令面板'
        },
        'command': {
            'name': '指令列表',
            'alias': ['command', 'cmd', '指令', '指令列表'],
            'fn': cmdScript,
            'help': '提供@user可使用的指令'
        },
        'leave': {
            'name': '離開',
            'alias': ['leave'],
            'fn': leaveScript,
            'help': '讓 Sushi 離開 group 或 room'
        },
        'myid': {
            'name': '顯示ID',
            'alias': ['myid', '給我id', 'id', 'AZ給我id'],
            'fn': myidScript,
            'help': '顯示@user的 line id'
        },
    };

    var mCommand = {
        'start': {
            'name': '啟動',
            'alias': ['start', '啟動', '上班嘍', '上班', 'AZ上班嘍', '娜娜上班'],
            'fn': startScript,
            'help': '讓 Sushi 上班'
        },
        'end': {
            'name': '結束',
            'alias': ['end', '結束', '下班嘍', '下班', 'AZ下班嘍', '娜娜下班'],
            'fn': endScript,
            'help': '讓 Sushi 下班'
        },
    };

    // 取得 line admin
    sushi.adminString = scriptProperties.getProperty('ADMIN_SATRING');

    // admin command list
    sushi.masterCommand = mCommand;

    // guest command list
    sushi.guestCommand = gCommand;

    // all command list
    sushi.allCommand = Object.assign(Object.assign({}, gCommand), Object.assign({}, mCommand));

    /**
     * 取得指令字串
     * @param isMaster
     * @returns {string}
     */
    sushi.getCommandList = (isMaster) => {
        try {
            var commandString = '';
            var commandList = {};
            if (isMaster) {
                commandString = '主人可以吩咐的事：\n';
                commandList = Sushi.allCommand;
            } else {
                commandString = '主人授權你的事：\n';
                commandList = Sushi.guestCommand;
            }
            for (var command in commandList) {
                commandString += command + '：' + commandList[command]['name'] + '\n';
            }
            return commandString;
        } catch (ex) {
            GoogleSheet.logError('Sushi.getCommandList, ex = ' + ex);
        }
    };

    /**
     * 指令集面板
     * @returns {{}}
     */
    sushi.getCommandTemp = (isMaster) => {
        try {
            var driveApp = DriveApp;
            var Sushi = driveApp.getFilesByName("christine.jpg");
            var AZImg = 'https://lh3.googleusercontent.com/d/' + Sushi.next().getId();
            var AZKkbox = driveApp.getFilesByName("christine-kkbox.jpg");
            var AZKkboxImg = 'https://lh3.googleusercontent.com/d/' + AZKkbox.next().getId();
            var template = {"type": 'carousel'};
            var columns = [];
            var defaultAction = {
                "type": "message",
                "label": "點到圖片或標題",
                "text": "Sushi"
            };
            columns.push({
                "thumbnailImageUrl": AZImg,
                "title": "AZ的基本服務",
                "text": "基本服務",
                "defaultAction": defaultAction,
                "actions": [
                    {
                        "type": "message",
                        "label": Sushi.allCommand['myid'].name,
                        "text": "myid"
                    }
                ]
            });
            if(isMaster) {
                var AZMaster = driveApp.getFilesByName("christine-master.jpg");
                var AZMasterImg = 'https://lh3.googleusercontent.com/d/' + AZMaster.next().getId();
                columns.push({
                    "thumbnailImageUrl": AZMasterImg,
                    "title": "主人的專屬服務",
                    "text": "娛樂",
                    "defaultAction": defaultAction,
                    "actions": [
                        {
                            "type": "message",
                            "label": Sushi.allCommand['command'].name,
                            "text": "command"
                        }, {
                            "type": "message",
                            "label": Sushi.allCommand['command'].name,
                            "text": "command"
                        }, {
                            "type": "message",
                            "label": Sushi.allCommand['command'].name,
                            "text": "command"
                        }
                    ]
                });
                columns.push({
                    "thumbnailImageUrl": AZMasterImg,
                    "title": "主人的專屬服務",
                    "text": "設定",
                    "defaultAction": defaultAction,
                    "actions": [
                        {
                            "type": "message",
                            "label": Sushi.allCommand['start'].name,
                            "text": "start"
                        }, {
                            "type": "message",
                            "label": Sushi.allCommand['end'].name,
                            "text": "end"
                        }, {
                            "type": "message",
                            "label": Sushi.allCommand['leave'].name,
                            "text": "leave"
                        },
                    ]
                });
            }
            template.columns = columns;
            return template;
        } catch (ex) {
            GoogleSheet.logError('Sushi.getCommandTemp, ex = ' + ex);
        }
    };

    /**
     * 檢查身份
     * @param userId
     * @returns {boolean}
     */
    sushi.checkMaster = (userId) => {
        try {
            var adminArray = Sushi.adminString.split(",");
            return adminArray.includes(userId);
        } catch (ex) {
            GoogleSheet.logError('Sushi.checkMaster, ex = ' + ex);
        }
    };

    /**
     * 檢查是否是指令並取得指令
     * @param msg
     * @returns {{isCommand: boolean, command: string}}
     */
    sushi.checkCommand = (msg) => {
        try {

            var msgCommand = msg.toLocaleLowerCase().split(" ").shift();
            var cmdObj = {
                "isCommand": false,
                "command": "",
            }
            for (const [command, cObject] of Object.entries(Sushi.allCommand)) {
                cObject.alias.forEach((alias) => {
                    if (alias === msgCommand) {
                        cmdObj.isCommand = true;
                        cmdObj.command = command;
                    }
                });
            }
            return cmdObj;
        } catch (ex) {
            GoogleSheet.logError('Sushi.checkCommand, ex = ' + ex);
        }
    };

    /**
     * 取得指令參數陣列
     * @param msg
     * @returns {[]}
     */
    sushi.getCommandParam = (msg) => {
        try {
            var paras = [];
            if (msg !== "") {
                paras = msg.split(" ");
                paras.shift();
            }
            return paras;
        } catch (ex) {
            GoogleSheet.logError('Sushi.getCommandParam, ex = ' + ex);
        }
    };

    /**
     * 取得使用者名稱
     * @param event
     * @returns {string}
     */
    sushi.getName = (event) => {
        return getName(event);
    }

    return sushi;
})(Sushi || {});

/**
 * DB
 * @type {function(): {}}
 * @description (物件) 操作 google sheet 的 model
 */
var DB = (() => {
    var scriptProperties = PropertiesService.getScriptProperties();

    // google sheet 資訊
    var sheetId = scriptProperties.getProperty('SHEET_ID');

    // 取得 sheet
    var AZSheet = SpreadsheetApp.openById(sheetId);

    // type
    var type;

    // columns
    var columns = [];

    var selectColumns = {};

    var whereCondition = [];

    var updateData = [];

    var insertData = [];

    // table
    var table;

    var allData;

    // last column
    var lastColumn;

    // last row
    var lastRow;

    // value
    var result = [];

    // 處理讀取的 columns
    var doSelectColumn = () => {
        try {
            if (columns.length) {
                for (var i = 0; i < lastColumn; i++) {
                    if (columns.includes(allData[0][i])) {
                        selectColumns[i] = allData[0][ i];
                    }
                }
            } else {
                for (var j = 0; j < lastColumn; j++) {
                    selectColumns[j] = allData[0][j];
                }
            }
        } catch (ex) {
            GoogleSheet.logError('db.doSelectColumn, ex = ' + ex);
        }
    }

    // 處理條件式
    var doWhere = (rowData) => {
        try {
            var bool = true;
            whereCondition.forEach((condition) => {
                switch (condition['condition']) {
                    case '=':
                    case 'is':
                    case 'IS':
                        if (rowData[condition['columnName']] != condition['value']) {
                            bool = false;
                        }
                        break;
                    case '>':
                        if (parseInt(rowData[condition['columnName']]) <= parseInt(condition['value'])) {
                            bool = false;
                        }
                        break;
                    case '>=':
                        if (parseInt(rowData[condition['columnName']]) < parseInt(condition['value'])) {
                            bool = false;
                        }
                        break;
                    case '<':
                        if (parseInt(rowData[condition['columnName']]) >= parseInt(condition['value'])) {
                            bool = false;
                        }
                        break;
                    case '<=':
                        if (parseInt(rowData[condition['columnName']]) > parseInt(condition['value'])) {
                            bool = false;
                        }
                        break;
                }
            });
            return bool;
        } catch (ex) {
            GoogleSheet.logError('db.doWhere, ex = ' + ex);
        }
    }

    // 處理讀取的資料
    var doResult = () => {
        try {
            let rowData = {};
            let tempRowData = {};
            if (Object.keys(selectColumns).length === 0) {
                for (let i = 1; i < lastRow; i++) {
                    for (let j = 0; j < lastColumn; j++) {
                        rowData[selectColumns[j]] = allData[i][j];
                    }
                    if (doWhere(rowData)) result.push(rowData);
                    rowData = {};
                }

            } else {
                for (let i = 1; i < lastRow; i++) {
                    for (let j = 0; j < lastColumn; j++) {
                        tempRowData[selectColumns[j]] = allData[i][j];
                        if (j in selectColumns) {
                            rowData[selectColumns[j]] = allData[i][j];
                        }
                    }
                    if (doWhere(tempRowData)) result.push(rowData);
                    rowData = {};
                }
            }
        } catch (ex) {
            GoogleSheet.logError('db.doResult, ex = ' + ex);
        }
    }

    // 處理更新資料
    var doUpdate = () => {
        try {
            var rowData = {};
            for (var i = 1; i < lastRow; i++) {
                for (var j = 0; j < lastColumn; j++) {
                    rowData[selectColumns[j]] = allData[i][j];
                }
                if (doWhere(rowData)) {
                    updateData.forEach((data) => {
                        var key = Object.keys(data)[0];
                        rowData[key] = data[key];
                    });
                    var tmpArray = [];
                    Object.keys(rowData).forEach((key) => {
                        tmpArray.push(rowData[key]);
                    });
                    table.getRange(i + 1, 1, 1, tmpArray.length).setValues([tmpArray]);
                }
                rowData = {};
            }
        } catch (ex) {
            GoogleSheet.logError('db.doUpdate, ex = ' + ex);
        }
    }

    // 處理新增資料
    var doInsert = () => {
        try {
            var tmpArray = [];
            var columnNameList = allData[0];
            columnNameList.forEach((columnNmae) => {
                Object.keys(insertData).forEach((key) => {
                    var insertColumnName = Object.keys(insertData[key])[0];
                    var insertValue = Object.values(insertData[key])[0];
                    if(columnNmae === insertColumnName) tmpArray.push(insertValue);
                });
            });
            table.getRange(lastRow + 1, 1, 1, tmpArray.length).setValues([tmpArray]);
        } catch (ex) {
            GoogleSheet.logError('db.doInsert, ex = ' + ex);
        }
    }

    var db = {};

    /**
     * 設定查詢欄位
     * @param column String...
     * @returns {any}
     */
    db.select = (...column) => {
        try {
            [...column].map((columnName) => {
                if (columnName instanceof String && columnName !== '') {
                    columns.push(columnName);
                }
            });
        } catch (ex) {
            GoogleSheet.logError('db.select, ex = ' + ex);
        }
        return db;
    };
    /**
     * 設定查詢 table(sheet)
     * @param tableName String
     * @returns {any}
     */
    db.from = (tableName) => {
        type = 'S';
        try {
            table = AZSheet.getSheetByName(tableName);

            lastColumn = table.getLastColumn();

            lastRow = table.getLastRow();

            allData = table.getDataRange().getValues();

        } catch (ex) {
            GoogleSheet.logError('db.table, ex = ' + ex);
        }
        return db;
    };
    /**
     * 設定條件式
     * @param columnName String
     * @param condition String
     * @param value String
     * @returns {any}
     */
    db.where = (columnName, condition, value) => {
        try {
            whereCondition.push({columnName: columnName, condition: condition, value: value});
        } catch (ex) {
            GoogleSheet.logError('db.where, ex = ' + ex);
        }
        return db;
    };
    /**
     * 執行
     */
    db.execute = () => {
        try {
            if (table === undefined) throw new Error("未設定 Table");
            if (type === undefined) throw new Error("未設定 type");
            switch (type) {
                case 'S':
                    doSelectColumn();
                    doResult();
                    break;
                case 'U':
                    doSelectColumn();
                    doUpdate();
                    break;
                case 'I':
                    doInsert();
                    break

            }
        } catch (ex) {
            GoogleSheet.logError('db.get, ex = ' + ex);
        }
        return db;
    };
    /**
     * 取得查詢結果
     * get
     * @returns {[]}
     */
    db.get = () => {
        try {
            return (result.length === 0) ? {} : result;
        } catch (ex) {
            GoogleSheet.logError('db.get, ex = ' + ex);
        }
    };

    /**
     * 取得 result 第一筆資料
     * @param column
     * @returns {*}
     */
    db.first = (column) => {
        try {
            return (result.length === 0) ? {} : (column === undefined) ? result[0] : result[0][column];
        } catch (ex) {
            GoogleSheet.logError('db.first, ex = ' + ex);
        }
    };

    /**
     * 取得 result 第最後一筆資料
     * @param column
     * @returns {*}
     */
    db.last = (column) => {
        try {
            return (result.length === 0) ? {} : (column === undefined) ? result[result.length-1] : result[result.length-1][column];
        } catch (ex) {
            GoogleSheet.logError('db.last, ex = ' + ex);
        }
    };

    /**
     * 設定更新table(sheet)
     * @param tableName String
     * @returns {{}}
     */
    db.update = (tableName) => {
        type = 'U';
        try {
            table = AZSheet.getSheetByName(tableName);
            lastColumn = table.getLastColumn();
            lastRow = table.getLastRow();
            allData = table.getDataRange().getValues();
        } catch (ex) {
            GoogleSheet.logError('db.update, ex = ' + ex);
        }
        return db;
    };

    /**
     * 設定新增table(sheet)
     * @param tableName String
     * @returns {{}}
     */
    db.insert = (tableName) => {
        type = 'I';
        try {
            table = AZSheet.getSheetByName(tableName);
            lastColumn = table.getLastColumn();
            lastRow = table.getLastRow();
            allData = table.getDataRange().getValues();
        } catch (ex) {
            GoogleSheet.logError('db.insert, ex = ' + ex);
        }
        return db;
    };

    /**
     * 設定資料
     * @param columnName
     * @param value
     * @returns {{}}
     */
    db.set = (columnName, value) => {
        try {
            if (type === undefined) throw new Error("未設定 type");
            var tempData = {};
            tempData[columnName] = value;
            switch (type) {
                case 'U':
                    updateData.push(tempData);
                    break;
                case 'I':
                    insertData.push(tempData);
                    break
            }
        } catch (ex) {
            GoogleSheet.logError('db.set, ex = ' + ex);
        }
        return db;
    };

    return db;
});

/**
 * GoogleDrive
 * @type {{}}
 * @description (單例) 客制化操作 google drive 的 model
 */
var GoogleDrive = ((gd) => {
    var driveApp = DriveApp;

    /**
     * 取得圖片 從 google drive
     * @param name
     * @returns {*}
     */
    gd.getImageUrl = (name) => {
        try {
            var files = driveApp.getFilesByName(name);
            if(files.hasNext()){
                return 'https://lh3.googleusercontent.com/d/' + files.next().getId();
            } else {
                return null;
            }
        } catch (ex) {
            GoogleSheet.logError('GoogleDrive.getImageUrl, ex = ' + ex);
        }
    };


    return gd;
})(GoogleDrive || {});

/**
 * HTMLTOOl
 * @type {{}}
 * @description (單例) 一些自幹的 html tool
 */
var HTMLTOOl = ((ht) =>{

    var  unentitize = (strEncoded) => {
        return strEncoded
            && XmlService.parse(
                '<z>' + (strEncoded + '').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</z>'
            ).getRootElement().getText();
    };

    /**
     * get meat
     * @param url
     * @returns {{metas: {}, title: *}}
     */
    ht.getHtmlMeta = (url) => {
        var strXML = UrlFetchApp.fetch(url, {muteHttpExceptions: true}).getContentText();
        var metas = {};
        var result = {
            title: unentitize((/<title>(.+?)<\/title>/i.exec(strXML) || [])[1]),
            metas: metas
        };
        strXML.replace(/<meta(?=[^>]*\sname="([^"]*)")(?=[^>]*\scontent="([^"]*)")[^>]*\/?>/ig,
            (m, name, content) =>{
                metas[name = unentitize(name)] = content = unentitize(content);
                if (/^description$/i.test(name)) {
                    result.description = content;
                } else if (/^keywords?$/i.test(name)) {
                    result.keywords = content;
                }
            });
        strXML.replace(/<meta(?=[^>]*\sproperty="([^"]*)")(?=[^>]*\scontent="([^"]*)")[^>]*\/?>/ig,
            (m, name, content) =>{
                metas[name = unentitize(name)] = content = unentitize(content);
                if (/^description$/i.test(name)) {
                    result.description = content;
                } else if (/^keywords?$/i.test(name)) {
                    result.keywords = content;
                }
            });
        return result;
    }

    /**
     * isJsonStr
     * @param str
     * @returns {boolean}
     */
    ht.isJsonStr = (str) => {

        if (typeof str == 'string') {
            try {
                JSON.parse(str);
                return true;
            } catch (e) {
                console.log(e);
                return false;
            }

        }
        return false;
    }

    return ht;
})(HTMLTOOl || {});

/**
 * Line
 * @type {{}}
 * @description (單例) 操作 line 的 model
 */
var Line = ((l) => {
    var scriptProperties = PropertiesService.getScriptProperties();

    // 取得 Line token 從環境變數
    var channelToken = scriptProperties.getProperty('LINE_API_KEY');

    // 取得該所在地 SourceId 從 line response
    var getSourceId = (source) => {
        try {
            switch (source.type) {
                case 'user':
                    return source.userId;
                case 'group':
                    return source.groupId;
                case 'room':
                    return source.roomId;
                default:
                    GoogleSheet.logError('Line, getSourceId, invalid source type!');
                    break;
            }
        } catch (ex) {
            GoogleSheet.logError('Line.getSourceId, ex = ' + ex);
        }
    };

    // 取得個人資訊
    getProfile = (source) => {
        try {
            var profile = {}
            switch (source.type) {
                case 'user':
                    profile = JSON.parse(UrlFetchApp.fetch('https://api.line.me/v2/bot/profile/' + source.userId, {
                        'headers': {
                            'Authorization': 'Bearer ' + channelToken,
                        },
                    }).getContentText());
                    break;
                case 'group':
                    profile = JSON.parse(UrlFetchApp.fetch('https://api.line.me/v2/bot/group/' + source.groupId + '/member/' + source.userId, {
                        'headers': {
                            'Authorization': 'Bearer ' + channelToken,
                        },
                    }).getContentText());
                    break;
                case 'room':
                    profile = JSON.parse(UrlFetchApp.fetch('https://api.line.me/v2/bot/room/' + source.roomId + '/member/' + source.userId, {
                        'headers': {
                            'Authorization': 'Bearer ' + channelToken,
                        },
                    }).getContentText());
                    break;
                default:
                    profile.userId = null;
                    profile.displayName = null;
                    profile.pictureUrl = null;
                    break
            }
            return profile;
        } catch (ex) {
            GoogleSheet.logError('Line.getProfile, ex = ' + ex);
        }
    };

    // 傳送 payload 給 line
    var sendMsg = (url, payload) => {
        GoogleSheet.logSend(payload);
        try {
            UrlFetchApp.fetch(url, {
                'headers': {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Authorization': 'Bearer ' + channelToken,
                },
                'method': 'post',
                'payload': payload
            });
        } catch (ex) {
            GoogleSheet.logError('Line.sendMsg, ex = ' + ex);
        }
    };

    l.event = {};

    /**
     * 初始化 event 物件 從 line response
     * @param event
     */
    l.init = (event) => {
        // TODO  製作判斷是 line 來的還是 trading view 來的
        try {
            event.isMaster = Sushi.checkMaster(event.source.userId);
            event.profile = getProfile(event.source);
            if(event.message === null || event.message === undefined){
                event.isCommand = false;
                event.command = "";
                event.commandParam = false;
            } else {
                var cmdObj = Sushi.checkCommand(event.message.text);
                event.isCommand = cmdObj.isCommand;
                event.command = cmdObj.command;
                event.commandParam = Sushi.getCommandParam(event.message.text);
            }
            event.sourceId = getSourceId(event.source);
            event.lineStatus = GoogleSheet.lineStatus;
            Line.event = event;
        } catch (ex) {
            GoogleSheet.logError('Line.eventInit, ex = ' + ex);
        }
    };

    l.isLine = (string) => {
        return HTMLTOOl.isJsonStr(string) && JSON.parse(string).hasOwnProperty("events");
    };

    /**
     * 執行 command
     */
    l.startEvent = () => {
        try {
            switch (Line.event.type) {
                case 'postback':
                    // 暫不動作
                    break;
                case 'message':
                    if (Line.event.isCommand) {
                        if (Line.event.lineStatus) {
                            if (Line.event.commandParam.indexOf('help') !== -1 || Line.event.commandParam.indexOf('h') !== -1) {
                                var commandHelp = Sushi.allCommand[Line.event.command].help;
                                Line.replyMsg(Line.event.replyToken, commandHelp.replace(/@user/, Sushi.getName(Line.event)));
                            } else if (Line.event.commandParam.indexOf('alias') !== -1 || Line.event.commandParam.indexOf('其他指令') !== -1) {
                                var commandName = Sushi.allCommand[Line.event.command].name;
                                var commandAlias = Sushi.allCommand[Line.event.command].alias.toString();
                                Line.replyMsg(Line.event.replyToken,  commandName + "的其他指令有: " + commandAlias);
                            } else {
                                Sushi.allCommand[Line.event.command].fn(Line.event);
                            }
                        } else if (!Line.event.lineStatus  && Line.event.command === 'start') {
                            Sushi.allCommand[Line.event.command].fn(Line.event);
                        } else{
                            Line.replyMsg(Line.event.replyToken, "Sushi 下班了喔");
                        }
                    }
                    break;
                case 'join':
                    Line.pushMsg(Line.event.sourceId, '大家好！我是 Sushi！');
                    break;
                case 'leave':
                    // 暫不動作
                    break;
                case 'memberLeft':
                    Line.pushMsg(Line.event.sourceId, Sushi.getName(Line.event) + '離開了！我們緬懷他');
                    break;
                case 'memberJoined':
                    Line.pushMsg(Line.event.sourceId, Sushi.getName(Line.event) + '你好！我是 Sushi');
                    break;
                case 'follow':
                    Line.pushMsg(Line.event.sourceId, Sushi.getName(Line.event) + '你好！我是 Sushi');
                    break;
                case 'unfollow':
                    Line.pushMsg(Line.event.sourceId, '好可惜以後 Sushi 會提供更多服務的');
                    break;
                default:
                    break;
            }
        } catch (ex) {
            GoogleSheet.logError('Line.startEvent, ex = ' + ex);
        }
    };

    /**
     * 發送文字訊息
     * @param usrId
     * @param message
     */
    l.pushMsg = (usrId, message) => {
        try {
            sendMsg('https://api.line.me/v2/bot/message/push', JSON.stringify({
                'to': usrId,
                'messages': [{
                    'type': 'text',
                    'text': message
                }]
            }));
        } catch (ex) {
            GoogleSheet.logError('Line.pushMsg, ex = ' + ex);
        }
    };

    /**
     * 回覆文字訊息
     * @param replyToken
     * @param userMsg
     */
    l.replyMsg = (replyToken, userMsg) => {
        try {
            sendMsg('https://api.line.me/v2/bot/message/reply',
                JSON.stringify({
                    'replyToken': replyToken,
                    'messages': [{
                        'type': 'text',
                        'text': userMsg
                    }]
                }));
        } catch (ex) {
            GoogleSheet.logError('Line.replyMsg, ex = ' + ex);
        }
    };

    /**
     * 回覆按鈕
     * @param replyToken
     * @param altText
     * @param template
     */
    l.replyBtnTemp = (replyToken, altText, template) => {
        try {
            sendMsg('https://api.line.me/v2/bot/message/reply',
                JSON.stringify({
                    'replyToken': replyToken,
                    'messages': [{
                        'type': 'template',
                        'altText': altText,
                        "template": template
                    }]
                }));
        } catch (ex) {
            GoogleSheet.logError('Line.replyBtnTemp, ex = ' + ex);
        }
    };

    /**
     * 回覆圖片
     * @param replyToken
     * @param bUrl
     * @param sUrl
     */
    l.replyImageTemp = (replyToken, bUrl, sUrl) => {
        try {
            sendMsg('https://api.line.me/v2/bot/message/reply',
                JSON.stringify({
                    'replyToken': replyToken,
                    'messages': [{
                        'type': 'image',
                        'originalContentUrl': bUrl,
                        "previewImageUrl": sUrl
                    }]
                }));
        } catch (ex) {
            GoogleSheet.logError('Line.replyBtnTemp, ex = ' + ex);
        }
    };

    /**
     * 離開
     * @param sourceType
     * @param sourceId
     */
    l.leave = (sourceType, sourceId) => {
        try {
            UrlFetchApp.fetch('https://api.line.me/v2/bot/' + sourceType + '/' + sourceId + '/leave', {
                'headers': {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Authorization': 'Bearer ' + channelToken,
                },
                'method': 'post',
            });
        } catch (ex) {
            GoogleSheet.logError('Line.leave, ex = ' + ex);
        }
    };
    return l;
})(Line || {});

/**
 * GoogleSheet
 * @type {{}}
 * @description (單例) 客製化操作 google sheet 的 model
 */
var GoogleSheet = ((gsh) => {
    var scriptProperties = PropertiesService.getScriptProperties();

    // google sheet 資訊
    var sheetId = scriptProperties.getProperty('SHEET_ID');

    // 取得 sheet
    var AZSheet = SpreadsheetApp.openById(sheetId);

    // 取得 console log table
    var sheetConsoleLog = AZSheet.getSheetByName('consolelog');

    // 取得 eat_what log table
    var sheetEat = AZSheet.getSheetByName('eat_what');

    /**
     * 取得 line status 狀態
     * @returns {*}
     */
    gsh.lineStatus = (() => {
        try {
            return DB().from('Sushi').execute().first('status');
        } catch (ex) {
            gsh.logError('GoogleSheet.lineStatus, ex = ' + ex);
        }
    })();

    /**
     * 寫入 line status 狀態
     * @param data
     */
    gsh.setLineStatus = (data) => {
        try {
            DB().update('Sushi').set('status', data).execute();
        } catch (ex) {
            gsh.logError('GoogleSheet.setLineStatus, ex = ' + ex);
        }
    };

    /**
     * 寫 log
     * @param values
     */
    gsh.setLog = (values) => {
        if (sheetConsoleLog != null) {
            var newRow = sheetConsoleLog.getLastRow() + 1;
            sheetConsoleLog.getRange(newRow, 1, 1, values.length).setValues([values]);
        }
    };

    /**
     * log info
     * @param msg
     */
    gsh.logInfo = (...msg) => {
        var args = [...msg].map((v) => JSON.stringify(v));
        args.unshift('info');
        gsh.setLog(args);
    };

    /**
     * log send
     * @param msg
     */
    gsh.logSend = (...msg) => {
        var args = [...msg].map((v) => JSON.stringify(v));
        args.unshift('send');
        gsh.setLog(args);
    };

    /**
     * error log
     * @param msg
     */
    gsh.logError = (...msg) => {
        var args = [...msg].map((v) => JSON.stringify(v));
        args.unshift('error');
        gsh.setLog(args);
    };

    /**
     * 取得吃什麼
     * @returns {*}
     */
    gsh.eatWhat = () => {
        try {
            var dataExport = {};
            var lastRow = sheetEat.getLastRow();
            var lastColumn = sheetEat.getLastColumn();
            var data = sheetEat.getRange(1, 1, lastRow, lastColumn).getValues();
            for (var i = 0; i <= data.length; i++) {
                dataExport[i] = data[i];
            }
            return dataExport[Math.floor(Math.random() * data.length)];
        } catch (ex) {
            gsh.logError('GoogleSheet.eatWhat, ex = ' + ex);
        }
    };

    /**
     * 取得最新資產
     * @returns {*}
     */
    gsh.money = () => {
        try {
            return DB().from('money').execute().last('money');
        } catch (ex) {
            gsh.logError('GoogleSheet.money, ex = ' + ex);
        }
    };

    /**
     * 登錄資產
     * @param money
     */
    gsh.insertMoney = (money) => {
        try {
            var Today = new Date();
            var date = Today.getFullYear() + "/" + (Today.getMonth() + 1) + "/" + Today.getDate();
            DB().insert('money').set('money', money).set('date', date).execute();
        } catch (ex) {
            gsh.logError('GoogleSheet.money, ex = ' + ex);
        }
    };

    /**
     * 加入待辦事項
     * @param something
     */
    gsh.todo = (something) => {
        try {
            DB().insert('todo').set('content', something).set('do', 0).execute();
        } catch (ex) {
            gsh.logError('GoogleSheet.todo, ex = ' + ex);
        }
    };

    /**
     * 待辦事項列表
     * @returns {*}
     */
    gsh.todolist = () => {
        try {
            var returnString = ""
            var todoList = DB().from('todo').where('do','=',0).execute().get();
            for (let i = 0; i < todoList.length; i++) {
                returnString = returnString + "[ ]" + todoList[i].content + "\n";
            }
            return returnString
        } catch (ex) {
            gsh.logError('GoogleSheet.todolist, ex = ' + ex);
        }
    };

    /**
     * 完成事項
     * @param something
     */
    gsh.do = (something) => {
        try {
            DB().update('todo').where('content','=', something).set('do', 1).execute();
        } catch (ex) {
            gsh.logError('GoogleSheet.do, ex = ' + ex);
        }
    };

    return gsh;
})(GoogleSheet || {});

// 主程序
function doPost(e) {
    try {
        // is line
        if(Line.isLine(e.postData.contents)) {
            var jsonData = JSON.parse(e.postData.contents);
            if (jsonData.events != null) {
                for (var i in jsonData.events) {
                    Line.init(jsonData.events[i]);
                    Line.startEvent();
                }
            }
        }

    } catch (error) {
        GoogleSheet.logError(e.postData.contents);
        GoogleSheet.logError(error);
    }
}

// 測試
function test(){
    try {
        var files = DriveApp.getFilesByName('Sushi');
        GoogleSheet.logError(files.next().getUrl());
    } catch (ex) {
        GoogleSheet.logError('crontab, recordAssets, ex = ' + ex);
    }
}
