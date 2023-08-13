// 定数
const STORAGE_NAME = 'gomi_calendar_sd';
const PANEL_LIST = ['Main', 'Config'];
const GOMI_LIST = ['収集無し', '燃やせるごみ', '燃やせないごみ', 'プラスチック製容器包装類', 'びん・かん、ペットボトル、廃食用油、金属類', '古紙類', '衣類・布類'];
const GOMI＿CALENDAR1 = {
    1: [0, 1, 5, 2, 1, 3, 0],
    2: [0, 1, 3, 2, 1, 4, 0],
    3: [0, 4, 1, 2, 3, 1, 0],
    4: [0, 3, 1, 2, 5, 1, 0],
    5: [0, 1, 4, 2, 1, 3, 0],
    6: [0, 1, 3, 2, 1, 5, 0],
    7: [0, 3, 1, 2, 4, 1, 0],
    8: [0, 5, 1, 2, 3, 1, 0]
};
const GOMI＿CALENDAR2 = {
    0: [2, 6, 2, 0, 0],
    1: [6, 2, 0, 2, 0],
    2: [2, 0, 2, 6, 0],
    3: [0, 2, 6, 2, 0]
};

// global変数
var data = null;
var panel = 'Main';

// クラス
var SaveData = function () {
    this.chikuBangou = 1;
};

// localStorage共通クラス
function load() {
    var sd = JSON.parse(localStorage.getItem(STORAGE_NAME));
    if (sd == null) {
        sd = new SaveData();
    }
    return sd;
}

function save(sd) {
    localStorage.setItem(STORAGE_NAME, JSON.stringify(sd));
}

function clearData() {
    localStorage.removeItem(STORAGE_NAME);
}

// Calendar共通クラス
function getToday() {
    var d = new Date();
    //d = new Date(2024, 1 - 1, 21); // テスト用
    return d;
}

function getTomorrow() {
    var d = getToday();
    d.setDate(d.getDate() + 1);
    return d;
}

function getDayOfWeek(dateObj) {
    var dow = ["日", "月", "火", "水", "木", "金", "土"][dateObj.getDay()];
    return dow;
}

function getDate(dataObj) {
    var yy = dataObj.getFullYear();
    var mm = ('00' + (dataObj.getMonth() + 1)).slice(-2);
    var dd = ('00' + dataObj.getDate()).slice(-2);
    return yy + '/' + mm + '/' + dd + ' (' + getDayOfWeek(dataObj) + ')';
}

function getGomi(dataObj) {
    var gomi = GOMI＿CALENDAR1[data.chikuBangou][dataObj.getDay()];
    // 三が日
    if (dataObj.getMonth() == 0) {
        if (dataObj.getDate() == 1 || dataObj.getDate() == 2 || dataObj.getDate() == 3) {
            gomi = 0;
        }
    }
    // 燃えないゴミ
    if (gomi == 2) {
        var d2 = new Date(dataObj.getFullYear(), dataObj.getMonth(), dataObj.getDate() - Math.floor(dataObj.getDate() / 7) * 7);
        if (dataObj.getMonth() == 0 && d2.getDate() < 4) {
            gomi = GOMI＿CALENDAR2[Math.floor((data.chikuBangou - 1) / 2)][Math.floor(dataObj.getDate() / 7) - 1];
        } else {
            gomi = GOMI＿CALENDAR2[Math.floor((data.chikuBangou - 1) / 2)][Math.floor(dataObj.getDate() / 7)];
        }
    }
    // びん・かん、ペットボトル、廃食用油、金属類　／　古紙類
    if (gomi == 4 || gomi == 5) {
        var d3 = new Date(2023, 3, 1);
        var d4 = new Date(2024, 0, 1);
        var d5 = new Date(2024, 0, 2);
        var d6 = new Date(2024, 0, 3);
        var diff = Math.floor((dataObj.getTime() - d3.getTime()) / (24 * 60 * 60 * 1000) / 7);
        if (dataObj > d6) {
            if (GOMI＿CALENDAR1[data.chikuBangou][d4.getDay()] == 4 || GOMI＿CALENDAR1[data.chikuBangou][d4.getDay()] == 5 ||
                GOMI＿CALENDAR1[data.chikuBangou][d5.getDay()] == 4 || GOMI＿CALENDAR1[data.chikuBangou][d5.getDay()] == 5 ||
                GOMI＿CALENDAR1[data.chikuBangou][d6.getDay()] == 4 || GOMI＿CALENDAR1[data.chikuBangou][d6.getDay()] == 5)
                diff -= 1;
        }
        if (diff % 2 == 1) {
            if (gomi == 4) gomi = 5;
            else if (gomi == 5) gomi = 4;
        }
    }
    return gomi;
}

// html操作共通クラス
function getElement(id) {
    return document.getElementById(id);
}

function getStyle(id) {
    return document.getElementById(id).style;
}

function drow(id, str) {
    getElement(id).innerHTML = str;
}

// 処理
function initialize() {
    data = load();
    drowTitle();
    drowMain();
}

function movePanel(nextPanel) {
    panel = nextPanel;
    drowTitle();
    switch (nextPanel) {
        case 'Main':
            drowMain();
            break;
        case 'Config':
            drowCongigChikuBangouOption();
            break;
    }
    PANEL_LIST.forEach(function (value) {
        getStyle(value + 'Panel').visibility = 'hidden';
    });
    getStyle(nextPanel + 'Panel').visibility = 'visible';
}

function saveConfig() {
    data.chikuBangou = getElement('selectChikuBangou').value;
    save(data);
    movePanel('Main');
}

function cancel() {
    data = load();
    movePanel('Main');
}

// 描画
function drowTitle() {
    drow('menu-title', 'ゴミカレンダー［茅ヶ崎市：' + data.chikuBangou + '番地区］');
}

function drowCongigChikuBangouOption() {
    var str = '';
    for (let i = 1; i < 9; i++) {
        if (data.chikuBangou == i) {
            str += '<option value="' + i + '" selected>' + i + '番地区</option>';
        } else {
            str += '<option value="' + i + '">' + i + '番地区</option>';
        }
    }
    drow('selectChikuBangou', str);
}

function drowMain() {
    var str = getDate(getToday());
    drow('MainPanel-Today', str);

    str = '<table><tr><td valign="top">';
    str += '明日は' + getDayOfWeek(getTomorrow()) + '曜日です。<br>';
    str += '<b>' + GOMI_LIST[getGomi(getTomorrow())] + '</b><br>';
    str += 'の日です。</td>';
    str += '<td><img src="img/g' + getGomi(getTomorrow()) + '.png" class="tomorrow"></td></tr></table>';
    drow('MainPanel-Tomorrow', str);

    drowCalendar();

    str = '<div class="icon">';
    str += '<img  src="img/g1.png">：燃やせるごみ　　<img  src="img/g2.png">：燃やせないごみ<br>';
    str += '<img  src="img/g3.png">：プラスチック製容器包装類<br>';
    str += '<img  src="img/g4.png">：びん・かん、ペットボトル、廃食用油、金属類<br>';
    str += '<img  src="img/g5.png">：古紙類　　<img  src="img/g6.png">：衣類・布類<br>';
    str += '</div>';
    drow('MainPanel-Icon', str);
}

function drowCalendar() {
    var d = getToday();
    d.setDate(d.getDate() - d.getDay());

    var str = '';
    str = '<table class="calendar">';
    str += '<tr><th class="sun">日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th class="sat">土</th></tr>';
    str += '<tr>';
    var dd = d.getDate();
    for (let i = 0; i < 14; i++) {
        if (i == 7) str += '</tr><tr>';
        if (i % 7 == 0) str += '<td class="sun">';
        else if (i % 7 == 6) str += '<td class="sat">';
        else str += '<td>';
        str += d.getDate() + '<br><img src="img/g' + getGomi(d) + '.png"></td>';
        d.setDate(d.getDate() + 1);
    }
    str += '</tr></table>';
    drow('MainPanel-Calendar', str);
}