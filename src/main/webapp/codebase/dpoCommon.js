/**
 * Created by ryzhov.tv on 07.09.2015.
 */
var DpoTools = {
    /**
     * Вызов синхронного запроса. Обертка для вызова alameda.ajaxRequest.
     * @param params  тело запроса
     * @param mode //GET (Default), ADD, EDIT, DELETE
     * @param afterSuccess(json) Функция выполняется после получения 200 ОК
     * @param afterFailure(json) Функция выполняется после неудачного выполнения запроса
     * @param asynchronous True (Default), False - тип запроса
     * @param showSpinner True (Default), False - показывать спинер в момент выполнения запроса
     */
    ajaxRequest: function (params, mode, afterSuccess, afterFailure, asynchronous, showSpinner) {
        mode = mode.toUpperCase() || 'GET';
        if (!alameda.AjaxRequestMode[mode]) {
            alert('mode param in DpoTools.ajaxRequest is wrong!');
            return;
        }

        if(!Tools.def(asynchronous)){
            asynchronous = true;
        }

        if(!Tools.def(showSpinner)){
            showSpinner = true;
        }

        this.logMAP(params);

        if (showSpinner) {
            displayLoadingWarning(true)
        }

        alameda.ajaxRequest('Ctrl', {
            method: 'post',
            asynchronous: asynchronous,
            parameters: params,
            onSuccess: function (transport) {
                if (showSpinner) {
                    displayLoadingWarning(false)
                }
                var json = transport.responseText.evalJSON(true);
                if (!Object.isUndefined(json.error)) {
                    alert('При выполнении операции произошла ошибка:\n' + json.error);
                }
                if (afterSuccess)
                    afterSuccess(json);
            }.bind(this),
            _onFailure: function (transport) {
                if (showSpinner) {
                    displayLoadingWarning(false)
                }
                var json = transport.responseText.evalJSON(true);
                alert('При выполнении операции произошла ошибка:\n' + json.error);
                if (afterFailure)
                    afterFailure(json);
            }
        }, alameda.AjaxRequestMode[mode]);
    },

    getHexColor: function (colorKey) {
        var colorMaping = {
            'clGray': '#808080',
            '$00808080': '#808080',
            '$00FF64C8': '#FF64C8', //C864FF
            '$0080FFFF': '#FFFF80',
            '$0080FF80': '#80FF80',
            'clSilver': '#C0C0C0',
            '$00C0C0C0': '#C0C0C0',
            'clMoneyGreen': '#C0DCC0',
            '$00c6dfc6': '#c6dfc6',
            '$00C0DCC0': '#C0DCC0',
            'clWindow': '#fff',
            '$0000fbe7': '#e7fb00',
            'clWebLightPink': '#FFB6C1',
            '$00FFB6C1': '#C1B6FF',
            'clInfoBk': '#ffffe7',
            '$00ffffe7': '#e7ffff',
            '$008080FF': '#FF8080',
            'clAqua': '#00FFFF',
            '$00F7DCB0': '#B0DCF7',
            '$006699CC': '#CC9966',
            '$00E1FA05': '#05FAE1',
            'clSkyBlue': '#F0CAA6',
            '$00F0CAA6': '#A6CAF0',
            'clYellow': '#FFFF00',
            'clRed': '#FF0000',
            '$00C8F06E': '#6EF0C8',
            '$004080FF': '#FF8040',
            '$00FAE6B4': '#B4E6FA',
            'clGreen': '#008000',
            'clBlue': '#00FF00',
            '$00C2FED9': '#D9FEC2',
            '$00CBC0FF': '#FFC0CB',
            'clRoseRed': '#FA9D9D',
            '$00FF8284': '#FF8284'
        };
        var color = colorMaping[colorKey] || '';
        return color;
    },

    searchFieldsInitRules: function () {
        var elems = $('div_searchParameters').getElementsByTagName('ru.ncd.input');
        var fieldsArray = [];
        for (var i = 0; i < elems.length; i++) {
            fieldsArray.push(elems[i].id);
        }
        $A(fieldsArray).each(
            function (field) {
                if (field.indexOf('ch_') == 0) {
                    Event.observe(field, "click", setSearchMode);
                }
                else {
                    Event.observe(field, "keypress", setSearchMode);
                    Event.observe(field, "change", setSearchMode);
                }
            }
        );
    },

    getHexColorNotifications: function (statusKey, IsCd, block_indicator) {
        var statusMaping = {

            'ERROR': 'clGray',
            'RGSTR': 'clAqua',
            'SKIDO': '$00F7DCB0',
            'CNVTD': 'clMoneyGreen',
            'WDCA': '$006699CC',
            'ORGNL': '0080FF80',
            'PRD': '0080FF80'
        };

        var colorKey = statusMaping[statusKey] || '';
        if (statusKey == 'INPUT') {
            if (block_indicator == 'Y') {
                colorKey = '$006699CC'
            }
            if (IsCd == 'Y') {
                colorKey = '$00E1FA05'
            }
            else {
                colorKey = 'clWindow'
            }
        }

        if (statusKey == 'WDCA') {
            if (block_indicator == 'Y') {
                colorKey = '$006699CC'
            }
            else {
                colorKey = 'clSkyBlue'
            }

        }
        return this.getHexColor(colorKey) || '';
    },

    showXML: function (docId, docType) {
        var data = $H({
            name: 'frm_paper_form_canvas',
            reportName: 'Просмотр XML-файла документа №' + docId,
            servlet: 'srv_dpo_prtd_doc_xml',
            open_type: "inline", // открываем в браузере
            scrolling: "yes",
            doc_id: docId,
            doc_type: docType
        });
        openModelessWindow("Ctrl?" + data.toQueryString(), "paperorder" + new Date().getTime());
    },

    checkRowSelected: function () {
        if ($F('row_id').blank()) {
            alert('Не выбрана строка таблицы.');
            return false;
        } else {
            return true;
        }
    },

    limitText: function (limitField, limitCount, limitNum) {
        if (limitField.value.length > limitNum) {
            limitField.value = limitField.value.substring(0, limitNum);
        } else {
            limitCount.value = limitNum - limitField.value.length;
        }
    },

    playSound: function (id) {
        var sound = $(id);
        sound.play();
    },

    format: function (/*String*/str, /*Array*/args) {
        var i = 0;
        return str.replace(/%(?:\.([0-9]+))?(.)/g, function (str, precisionGroup, genericGroup) {
            switch (genericGroup) {
                case '%':
                    return '%';
                    break;
                case 's':
                    return args[i++].toString();
                    break;
                case 'd':
                    return parseInt(args[i++]);
                    break;
                case 'f':
                    if (precisionGroup == undefined)
                        return parseFloat(args[i++]);
                    else
                        return parseFloat(args[i++]).toFixed(parseInt(precisionGroup));
                    break;
                default:
                    throw new Error('Unsupported conversion character %' + genericGroup);
            }
            return "";
        });
    },

    //Сообщение, выдаваемое при отсутствии прав на форму / операцию
    getNoPriveledgeMsg: function () {
        return 'Ваших полномочий недостаточно!';
    },

    logMAP: function (/*$H, json*/map) {
        var mess = 'Ajax Request: ';
        try {
            if ('toQueryString' in map)
                mess = mess + map.toQueryString();
            else
                mess = mess + JSON.stringify(map);
        }
        catch (e) {
            mess = mess + map.toString();
        }
        alameda.debug(mess);
    },

    unescapeHTML: function (/*String*/text) {
        if (Tools.def(text)) {
            text = text.unescapeHTML();
            return text.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"');
        }
    },

    showChild: function (/*$H*/data, /*String*/url) {
        var dlgWidth, dlgHeight, dlgTop, dlgLeft, scroll;
        if (!Object.isHash(data)) {
            alert("Данные для вызова диалогового окна должны быть построены как объект Hash");
            return -1;
        }
        if (!Tools.def(url)){
            url = "ru.ncd.input";
        }
        dlgWidth = Tools.def(data.get('winWidth')) ? data.get('winWidth') :
            (screen.width >= 1024 ? screen.width - 200 : screen.width - 600);
        dlgHeight = Tools.def(data.get('winHeight')) ? data.get('winHeight') : screen.height - 250;
        dlgTop = (screen.height - dlgHeight) / 2 - 5;
        dlgLeft = (screen.width - dlgWidth) / 2 - 5;
        scroll = Tools.def(data.get('winScroll')) ? data.get('winScroll') : 'yes';
        var result;
        try {
            var dataAdd = $H({dpo: 1, un: new Date().getTime()})
            //data.merge(dataAdd); //not work (
            result = window.showModalDialog(url + "?" + data.toQueryString() + "&" + dataAdd.toQueryString(), null, "resizable:yes;maximize:yes;minimize:yes; dialogHeight:" + dlgHeight + "px; dialogWidth:" + dlgWidth + "px; dialogTop:" + dlgTop + "; dialogLeft:" + dlgLeft + "; scroll:" + scroll);
        } catch (e) {
            window.open(url + "?" + data.toQueryString());
            result = {};
        }
        return result;
    },

    onlyDigits: function (e) {
        var key = e.keyCode ? e.keyCode : e.which;

        if (!( [8, 9, 13, 27, 46, 110, 190].indexOf(key) !== -1 ||
                (key == 65 && ( e.ctrlKey || e.metaKey ) ) ||
                (key >= 35 && key <= 40) ||
                (key >= 48 && key <= 57 && !(e.shiftKey || e.altKey)) ||
                (key >= 96 && key <= 105)
            )) e.preventDefault();
    },

    onlyDigitsOnKeyPress: function (event) {
        var _keyCode;
        if (event.which == null) {
            _keyCode = event.keyCode;
        } else
        if (event.which != 0 && event.charCode != 0) {
            _keyCode = event.which;
        }
        if (_keyCode && (_keyCode < "0".charCodeAt(0) || _keyCode > "9".charCodeAt(0))
            && _keyCode != ".".charCodeAt(0)) {

            return event.preventDefault();
        }
    },

    /**
     * Convert date format dd.mm.yyyy to int yyyymmdd
     * @param dateStr date string
     * @returns {number} yyyymmdd
     */
    dateToInt: function (dateStr) {
        var res = null;
        if (Tools.def(dateStr)) {
            if (dateStr.length == 10) {
                res = parseInt(dateStr.split('.').reverse().join(''))
            }
        }
        return res;
    },

    /**
     *
     * @param dateStr{string} date string
     * @param withTime{boolean} true for java.sql.Types.TIMESTAMP, false for java.sql.Types.Date
     * @return {string} format to sql
     */
    dateToDateSql: function (/*String*/dateStr, /*Boolean*/withTime) {
        var arr = dateStr.split(' ');
        var errorMess = 'Не верный формат строки "' + dateStr + '"';
        arr[0] = arr[0].split('.').reverse().join('-');
        if (withTime) {
            if (!Tools.def(arr[1])) {
                arr[1] = '00:00:00';
            }
            if (arr[0].length + arr[1].length == 18) {
                return arr[0] + ' ' + arr[1];
            }
        } else {
            if (arr[0].length == 10) {
                return arr[0];
            }
        }
        alert(errorMess)
        throw new Error(errorMess);
    },

    strWithoutORA: function(/*String*/ error){
        if (Tools.def(error)){
            return error.replace(/ORA-\d{5}:/g, '')
        } else {
            return '';
        }

    }

};

function displayLoadingWarning(show) {
    if (!Tools.def(window.spinnerCount)) {
        window.spinnerCount = 0;
    }
    if (show) {
        if (window.spinnerCount == 0) {
            LoadingWarning.displayLoadingWarning(true);
        }
        window.spinnerCount++;
    } else {
        window.spinnerCount--;
        if (window.spinnerCount < 1) {
            window.spinnerCount = 0;
            LoadingWarning.displayLoadingWarning(false);
        }
    }
}

/**
 * @param servletName : String - servlet query name
 * @param columnInfo : Array - column info object
 * @param buttons : Array buttons name and function handler {id : idBtn, value : caption btn, clickFunc : function on btn click}
 */
var ShowTable = Class.create({
    initialize: function (/*String*/title, /*String*/caption, /*String*/servletName, /*Hash*/servletParams, /*Array*/columnInfo,
                          /*Array*/buttons, /*Boolean*/isDebug, /*Hash*/sortGrid, /*String*/ cancelLabel, /*Array*/infoItems) {
        this.title = title || '';
        this.caption = caption || '';
        this.servletName = servletName;
        this.columnInfo = columnInfo;
        this.buttons = buttons;
        this.servletParams = Object.isHash(servletParams) ? servletParams : null;
        this.isDebug = isDebug;
        this.sortGrid = Object.isHash(sortGrid) ? sortGrid : null;
        this.cancelLabel = cancelLabel;
        this.result = null;
        this.infoItems = infoItems;
    },

    show: function (winHeight, winWidth, winScroll) {
        var param = $H({
            winHeight: winHeight,
            winWidth: winWidth,
            winScroll: winScroll || 'no',
            title: this.title,
            caption: this.caption,
            servletName: this.servletName,
            servletParams: this.servletParams,
            columnInfo: this.columnInfo,
            buttons: this.buttons,
            isDebug: this.isDebug,
            sortGrid: this.sortGrid,
            cancelLabel: this.cancelLabel,
            infoItems: this.infoItems
        });
        /*возвращается нажатая кнопка, returnValue установленной в buttons.function, rowId выбранной строки*/
        this.result = showChild((param), 'dpoShowTable');
    }
});

/**
 * @param title : Title of form
 * @param caption : Caption of radio button panel
 * @param itemInfo : Array - item info object
 */
var RadioButtonConfirm = Class.create({
    initialize: function (/*String*/title, /*String*/caption, /*Array*/itemsInfo, /*Boolean*/isDebug) {
        this.title = title || '';
        this.caption = caption || '';
        this.itemsInfo = itemsInfo;
        this.isDebug = isDebug;
        this.result = null;
    },

    show: function (winHeight, winWidth, winScroll) {
        var param = $H({
            winHeight: winHeight,
            winWidth: winWidth,
            winScroll: winScroll || 'no',
            title: this.title,
            caption: this.caption,
            itemsInfo: this.itemsInfo,
            isDebug: this.isDebug
        });
        /*возвращается нажатая кнопка, returnValue установленной в buttons.function, rowId выбранной строки*/
        this.result = showChild((param), 'dpoRadioButtonConfirm');
    }
});

var LocalStorageController = Class.create({

    initialize: function (/*String*/currForm, /*int*/refreshTime, /*Boolean*/isNeedAddCloseEvent) {
        if (!Tools.def(currForm)){
            alert('Необходимо указать параметр "currForm"');
            return;
        }
        this.currForm = currForm;
        this.refreshTime = refreshTime || 5;
        this.refreshTime = 1000 * this.refreshTime;
        this.isNeedAddCloseEvent = isNeedAddCloseEvent || false;
        this.skipDispatchEvents = [LocalStorageControllerEvents.onClose];
        this.FORM_EVENT = 'FORM_EVENT';
        this.listeners = [];
        this.prevKey = null;
        this.timerId = null;
        this.dispatchEvents(true);
        this.run();
    },

    run: function () {
        addWinBeforeUnloadHandler(function() {
            this.dispatchEvents(false);
            if (this.isNeedAddCloseEvent) {
                this.addEvent(LocalStorageControllerEvents.onClose);
            }
        }.bind(this));
        if (this.timerId == null) {
            this.timerId = setInterval(this.fire.bind(this), this.refreshTime);
        }
    },

    getTime: function() {
        var date = new Date();
        return date.getTime();

    },

    addEvent: function (event) {
        if (window.localStorage) {
            event = {FORM: this.currForm, EVENT: event, TIME: this.getTime()};
            var events = this.getEvents();
            events.push(event);
            localStorage.setItem(this.FORM_EVENT, JSON.stringify(events));
        }
    },

    dispatchEvents: function (clearAll, isTimerClear) {
        var events = [];
        this.getEvents().each(function (itemK) {
            if ((itemK.FORM != this.currForm) || (!clearAll && this.skipDispatchEvents.indexOf(itemK.EVENT) != -1)) {
                events.push(itemK);
            }
        }.bind(this));
        localStorage.setItem(this.FORM_EVENT, JSON.stringify(events));
        if (this.timerId > 0) {
            (isTimerClear || true) ? clearInterval(this.timerId) : null;
        }
    },

    addListener: function (form, event, handler) {
        if (window.localStorage) {
            var listener = {FORM: form, EVENT: event, HANDLER: handler, TIME: this.getTime()};
            this.listeners.push(listener);
        }
    },

    getEvents: function (){
      return JSON.parse(JSON.parse(localStorage.getItem(this.FORM_EVENT))) || []
    },

    fire: function () {
       var curKey = localStorage.getItem(this.FORM_EVENT);
        if (curKey ===   this.prevKey){
            return;
        }
        this.prevKey = curKey;
        this.listeners.each(function (itemL) {
            this.getEvents().each(function (itemK) {
                if ((itemK.FORM === itemL.FORM) && (itemK.EVENT === itemL.EVENT)) {
                    if (itemL.TIME < itemK.TIME) {
                        itemL.TIME =  this.getTime();
                        new Function(itemL.HANDLER)();
                    }
                }
            }.bind(this));//k
        }.bind(this));//l
    }
});

var showStackTrace = function (name) {
    try {
        throw  new Error(name);
    }
    catch (e) {
        console.log(e.stack || e.stacktrace || "This browser doesn't support Error.stack(stacktrace)");
    }
};

window.console = window.console || {
        debug: function () {
        },
        log: function () {
        }
    };

var KVIT_FORM_TYPE = {
    DIRECTION:  '0',    //Распоряжение
    NOTICE:     '1',	//Уведомление
    CLAIM:      '2'	    //Требование
};

var KvitForm = Class.create({
    /**
     * @param cf_enroll_id - id ошибочного зачисления
     * @param out_doc_num - поручение на операцию 10/36
     * @param certType - тип сертификата для подписи
     * @param afterSuccess - функция, выполняемая по завершению
     */
    initialize: function (/*String*/item_type) {
        this.item_type = item_type;
        this.locked = false;
        this.item_id = -1;
    },

    captureItem: function(item_id, afterSuccess) {
        if (item_id > 0) {
            var params = {
                name: 'srv_dpo_capture_item',
                item_id: item_id,
                item_type: this.item_type
            };
            AlamedaTools.AjaxRequest(params, function (transport) {
                var json = transport.responseText.evalJSON(true);
                if (json.error) {
                    alert(json.error);
                    window.close();
                } else {
                    this.locked = true;
                    this.item_id = item_id;
                    if (afterSuccess) {
                        afterSuccess.call(this);
                    }
                }
            }.bind(this));
        } else {
            afterSuccess.call(this);
        }
    },

    releaseItem: function (item_id, afterSuccess) {
        if (this.locked){
            var params = $H({
                name: 'srv_dpo_release_item',
                item_type: this.item_type
            });
            var id;
            if (item_id > 0) {
                id = item_id;
            } else if (this.item_id > 0) {
                id = this.item_id;
            }
            params.set("item_id", id);
            AlamedaTools.AjaxRequest(params, function (transport) {
                var json = transport.responseText.evalJSON(true);
                if (json.error) {
                    alert(json.error);
                } else if (afterSuccess)   {
                    afterSuccess.call(this);
                }
            }.bind(this));
        }
    }

});

var Base64 = {

// private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

// public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

// public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

// private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

// private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}



