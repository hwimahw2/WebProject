/*
 */

function debug_showObject (obj) {
    var oh;
    if (Object.isHash(obj)) {
        oh = obj.toObject();
    } else {
        oh = obj;
    }

    var keys = Object.keys(oh);
    var vals = Object.values(oh);
    var outs = '';
    for (var i = 0; i < keys.length; ++i) {
        outs += i + ". " + keys[i] + " => " + vals[i] + "\n";
    }
    alert (outs);
}

function _insertAt(ar,ind,val){
    var tmpAr=new Array(ar.length+1);
    for (var i=0;i<ind;++i)
        tmpAr[i]=ar[i];
    tmpAr[ind]=val;
    for (i=ind;i<ar.length;++i)
        tmpAr[i+1]=ar[i];
    return tmpAr;
}

function trim(str) {
    return (Object.isUndefined(str) || str == null)? "": str.replace(/(^\s+)|(\s+$)/g, "");
}

function TrimEmptyString(s){
    if(Object.isUndefined(s) || s == null) return "";
    if(!s.blank()) return s;
    return "";
}

/**
 * Appends its first argument by value separated by delimiter. Delimiter is
 * optional argument and it is equal to ', ' on default. List is the string
 * which contains a sequence of some values
 */
function appendList (list, item, delimiter) {
    if (delimiter == undefined) {
        delimiter = ', ';
    }
    if (list == '') {
        list += item;
    } else {
        list += delimiter + item;
    }
    return list;
}

//----------------------------------------------------------------
function delOk(transport)
{
    var json = transport.responseText.evalJSON(true);
    if (!json.error){//ok
        mygrid.deleteRow($('row_id').value);
        if(mygrid.getRowsNum() == 0)
            refbut.setRecordDependentButtonsState(false);
        else
            mygrid.selectFirstVisibleRow();
        clearAll();
        windowInfo('Запись успешно удалена!');
    } else {//not ok
        alert(json.error);
    }
}

// window closing
function closeWindow() {
    window.close();
}

        function delFailed(transport)
        {
            alert('Не могу удалить запись. Какие-то проблемы при вызове сервера.');
        }

        function saveFailed(transport)
        {
            alert('Не могу сохранить запись. Какие-то проблемы при вызове сервера.');
            refbut.setLowerButtonsEnabled(true);
        }

        function getOldFailed(transport)
        {
            alert("Запись, которую Вы хотели сохранить, была отредактирована \nза то время,пока ее редактировали Вы. \nПри попытке перечитать значения данной записи из БД произошла ошибка.");
        }

        function showChild (data, name) {
            var dlgWidth, dlgHeight, dlgTop, dlgLeft, scroll;
            if (!Object.isHash(data)) {
                alert ("Данные для вызова диалогового окна должны быть построены как объект Hash");
                return -1;
            }
            var mode;
            if ( !Tools.def(name)) {
                if (!Tools.def(data.get("name")) ) {
                    alert("Не указано имя вызываемого окна");
                    return null;
                } else {
                    mode = 2;
                }
            } else {
                mode = 1;
            }
            dlgWidth = Tools.def(data.get('winWidth')) ? data.get('winWidth'):
                (screen.width >= 1024 ? screen.width - 200 : screen.width - 600);
            dlgHeight = Tools.def(data.get('winHeight')) ? data.get('winHeight') : screen.height - 250;
            dlgTop = (screen.height - dlgHeight) / 2 - 5;
            dlgLeft = (screen.width - dlgWidth) / 2 - 5;
            scroll = Tools.def(data.get('winScroll')) ? data.get('winScroll') : 'yes';
            var result;
			var sFeatures = "resizable:yes;maximize:yes;minimize:yes; dialogHeight:" + dlgHeight + "px; dialogWidth:" + dlgWidth + "px; dialogTop:" + dlgTop + "; dialogLeft:" + dlgLeft + "; scroll:" + scroll;
            if ( mode == 1) {
                result = window.showModalDialog("Ctrl?name="+name, data, sFeatures); }
            else {
                try {
                    result = window.showModalDialog("Ctrl?" + data.toQueryString(), null, sFeatures); }
                catch (e) {
                    window.open("Ctrl?" + data.toQueryString());
                    result = {};
                }
            }

            return result;
        }

//-----------------------------------------------------------------------------
// Handler of window-closing attempt
//-----------------------------------------------------------------------------
        var _isChanged;
        var _confirmMessage = "Введенные Вами данные будут утеряны";
        function setChangeFlag() {
            //alert ("setChangeFlag()\neditMode = " + editMode);
            if (editMode)
                _isChanged = true;
        }

        function unsetChangeFlag() {
            //alert ("unsetChangeFlag()");
            _isChanged = false;
        }
        //-------------------------------------------------------------------
        /*
        function onBeforeUnloadHandler() {
            if (_isChanged) {
                event.returnValue = _confirmMessage;
            }
        };
        */

        function initListeners() {
            //alert ("initListeners()");
            unsetChangeFlag();
            addWinBeforeUnloadHandler(function(){
                    //alert ("onBeforeUnloadHandler()")
                    if (_isChanged) {
                        event.returnValue = _confirmMessage;
                    }
                }
            );
        }
//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------
        function underConstructionAlert() {
            document.write("<h1 style='color:red;font-weight:bold'>ВНИМАНИЕ: данный функционал находится в разработке и не предназначен для тестирования!</h1>");
        }

//-----------------------------------------------------------------------------
        function stubMessage() {
            alert ('В настоящее время не реализовано\nВедутся работы по устранению этой проблемы');
        }

//-----------------------------------------------------------------------------
        function deprecateMessage(deprecatedObjectName, newObjectName) {
            alert ('Использование '+ deprecatedObjectName + ' в данной версии нежелательно!\nИспользуйте взамен '+ newObjectName);
        }
//-----------------------------------------------------------------------------
        function messageRFU() {
            alert ('На данном этапе не предназначено к реализации\n');
        }

//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Checking control validity
//-----------------------------------------------------------------------------
    function Validator(){
        this._plainTexts = [];
        this._messages = new Hash();
        this._messages.set("empty", []);
        this._messages.set("notSet", []);
        this._messages.set("notSelected", []);
        this._messages.set("invalidValue", []);
        this._messages.set("invalidFormat", []);
        this._messages.set("invalidLength", []);
        this._messages.set("invalidDateFormat", []);
        this._messages.set("invalidTimeFormat", []);
        this._messages.set("invalidShortTimeFormat", []);
        this._messages.set("notInRefbooks", []);

        this._msgHeaders = new Hash();
        this._msgFooters = new Hash();

        this._msgHeaders.set("empty", []);
        this._msgHeaders.get("empty").push( 'Не заполнено обязательное поле ');
        this._msgHeaders.get("empty").push( 'Не заполнены обязательные поля: ');

        this._msgHeaders.set("notInRefbooks", []);
        this._msgHeaders.get("notInRefbooks").push( 'Не найдено значение в справочнике для поля ');
        this._msgHeaders.get("notInRefbooks").push( 'Не найдено значение в справочнике для полей: ');

        this._msgHeaders.set("notSet", []);
        this._msgHeaders.get("notSet").push( 'Не указано значение поля ');
        this._msgHeaders.get("notSet").push( 'Не указаны значения полей: ');

        this._msgHeaders.set("notSelected", []);
        this._msgHeaders.get("notSelected").push( 'Не выбрано значение для поля ');
        this._msgHeaders.get("notSelected").push( 'Не выбраны значения для полей: ');

        this._msgHeaders.set("invalidValue", []);
        this._msgHeaders.get("invalidValue").push( 'Указано недопустимое значение для поля ');
        this._msgHeaders.get("invalidValue").push( 'Указаны недопустимые значения для полей: ');

        this._msgHeaders.set("invalidFormat", []);
        this._msgHeaders.get("invalidFormat").push( 'Некорректный формат поля ');
        this._msgHeaders.get("invalidFormat").push( 'Некорректный формат полей: ');

        this._msgHeaders.set("invalidLength", []);
        this._msgFooters.set("invalidLength", []);
        this._msgHeaders.get("invalidLength").push( 'Поле ');
        this._msgHeaders.get("invalidLength").push( 'Поля: ');
        this._msgFooters.get("invalidLength").push( ' имеет недопустимую длину');
        this._msgFooters.get("invalidLength").push( ' имеют недопустимую длину');

        this._msgHeaders.set("invalidDateFormat", []);
        var hdrStr = 'Дата должна быть задана в формате ДД.ММ.ГГГГ!\nИсправьте в соответствии с принятым форматом значение ';
        this._msgHeaders.get("invalidDateFormat").push( hdrStr + ' поля ');
        this._msgHeaders.get("invalidDateFormat").push( hdrStr + ' полей: ');

        this._msgHeaders.set("invalidTimeFormat", []);
        var hdrStr = 'Время должно быть задано в формате ЧЧ:ММ[:СС]!\nИсправьте в соответствии с принятым форматом значение ';
        this._msgHeaders.get("invalidTimeFormat").push( hdrStr + ' поля ');
        this._msgHeaders.get("invalidTimeFormat").push( hdrStr + ' полей: ');

        this._msgHeaders.set("invalidShortTimeFormat", []);
        var hdrStr = 'Некорректно указано время. Должно быть ЧЧ:ММ!\nИсправьте в соответствии с принятым форматом значение ';
        this._msgHeaders.get("invalidShortTimeFormat").push( hdrStr + ' поля ');
        this._msgHeaders.get("invalidShortTimeFormat").push( hdrStr + ' полей: ');


        this._message = "";
    }

    Validator.prototype.clear = function(){
        this._message = "";
    };

    /*
     * Validate that edit field is not empty.
     * Function to use ONLY from generated validateFields methods. Requirements:
     * -edit should have id
     * -we should be a span with id = "<editid>_s"
     */

    Validator.prototype.validateNotBlankEdit = function(edit_name){
        deprecateMessage('validateNotBlankEdit()', 'checkEditIsNotBlank()');
    };


/*
 * Patch for Prototype Array.indexOf method at least for arrays of numbers.
 */
Array.prototype.indexOf2=function(val){
    var l=this.length;
    for (var i=0;i<l;++i)
        if (this[i]==val)
            return i;
    return -1;
};
/**
 * Добавить значение в массив, если в нем пока нет этого значения
 */
Array.prototype.putIfAbsent=function(s){
    if (this.indexOf2(s) == -1)
        this.push(s);
};

    Validator.prototype.checkEditIsNotBlank = function(edit_name, message) {
        if ($F(edit_name).blank()) {
            if (Object.isUndefined(message)) {
                var caption = Tools.text(edit_name + '_s');
                this._messages.get("empty").putIfAbsent('"' + caption + '"');
            } else
                this._message += message + '\n';
            return true;
        }
        return false;
    };

    Validator.prototype.checkEditIsInRefbooks = function(edit_name, id_field_name, message) {
        if ($F(id_field_name).blank()) {
            if (Object.isUndefined(message)) {
                var caption = Tools.text(edit_name + '_s');
                this._messages.get("notInRefbooks").putIfAbsent('"' + caption + '"');
            } else
                this._message += message + '\n';
            return true;
        }
        return false;
    };

    Validator.prototype.checkNumber = function(edit_name, len) {
        return this.checkEditForPatternMatching(edit_name, new RegExp("^[0-9]{0," + len + "}$"));
    };
    Validator.prototype.checkValueForNumber = function(value, len, caption) {
        return this.checkValueForPatternMatching(value, new RegExp("^[0-9]{0," + len + "}$"), caption);
    };

    /*
     * Validate that edit field matches the specified pattern.
     * Function to use ONLY from generated validateFields methods. Requirements:
     * -edit should have id
     * -we should be a span with id = "<editid>_s"
     */
    Validator.prototype.validatePatternEdit = function(edit_name, pattern){
        deprecateMessage('validatePatternEdit()', 'checkEditForPatternMatching()');
    };
    Validator.prototype.checkEditForPatternMatching = function(edit_name, pattern) {
        var txt = trim($(edit_name).value),
            caption = Tools.text(edit_name + '_s');
        if (txt == '') {
            this._messages.get("empty").putIfAbsent('"' + caption + '"');
            return true;
        } else if (!pattern.test(txt)) {
            this._messages.get("invalidFormat").putIfAbsent('"' + caption + '"');
            return true;
        }
        return false;
    };
    Validator.prototype.checkValueForPatternMatching = function(value, pattern, caption){
        var txt = trim(value);
        if (txt == ''){
            this._messages.get("empty").putIfAbsent('"' + caption + '"');
            return true;
        }
        if (!pattern.test(txt)){
            this._messages.get("invalidFormat").putIfAbsent('"' + caption + '"');
            return true;
        }
        return false;
    };

Validator.prototype.checkEditLength = function (edit_name, maxlen, text) {
    var txt = trim($(edit_name).value);
    if (txt.length > maxlen) {
        if (Tools.def(text)) {
            this._message += text + '\n';
        } else {
            var caption = Tools.text(edit_name + '_s');
            this._messages.get("invalidLength").putIfAbsent('"' + caption + '"');
        }
        return true;
    }
    return false;
};

Validator.prototype.checkEditLengthNoTrim = function(edit_name, maxlen, text) {
    var txt = $(edit_name).value;
    if (txt.length > maxlen) {
        var caption = $(edit_name + '_s').innerText;
        if (Tools.def(text)) {
            this._message += (text + caption);
        } else {
            this._messages.get("invalidLength").putIfAbsent('"' + caption + '"');
        }
        return true;
    }
    return false;
};

    Validator.prototype.checkEditLengthBetween = function(edit_name, minlen, maxlen){
        var txt = trim($(edit_name).value);
        if (txt.length > maxlen || txt.length < minlen){
           var caption = Tools.text(edit_name + '_s');
           this._messages.get("invalidLength").putIfAbsent('"' + caption + '"');
           return true;
       }
       return false;
    };

    Validator.prototype.checkEditLengthEq = function(edit_name, len){
        var txt = trim($(edit_name).value);
        if (txt.length != len){
           var caption = Tools.text(edit_name + '_s');
           this._messages.get("invalidLength").putIfAbsent('"' + caption + '"');
           return true;
       }
       return false;
    };

/**
 * Проверяет поле, на соответствие формату десятичного числа вида Число(X,Y)
 * @param edit_name {String} id поля для проверки
 * @param total {Number} Общее число знаков в числе
 * @param afterdot {Number} Число знаков после запятой
 * @returns false - проверка пройдена, true - в ином случае
 */
Validator.prototype.checkEditDecimal = function (edit_name, total, afterdot) {
    var txt = $F(edit_name);
    // Если нет дробной части, то проверяем целое число
    if (afterdot == 0) {
        return this.checkNumber(edit_name, total);
    }
    var dot = txt.indexOf('.');
    var beforedot = total - afterdot;
    if (dot == -1) {
        return this.checkNumber(edit_name, beforedot);
    }
    var pattern = "^[+-]?\\d{1," + beforedot + "}\\.?\\d{0," + afterdot + "}$";
    var regExp = new RegExp(pattern);
    return this.checkEditForPatternMatching(edit_name, regExp);
};

    Validator.prototype.checkValueDecimal = function(value, total, afterdot, caption) {
        var dot = value.indexOf('.');
        var ttl = total - afterdot;
        var r = "^[+-]?\\d{1," + ttl + "}$";
        var rr = new RegExp(r);
        if (dot == -1) {
            return this.checkValueForPatternMatching(value, rr, caption);
        }
        var bef=value.substr(0, dot);
        var aft=value.substr(dot+1);
        if (bef.length + aft.length > total) {
            this._messages.get("invalidFormat").putIfAbsent('"' + caption + '"');
            return true;
        } else if (aft.length > afterdot) {
            this._messages.get("invalidFormat").putIfAbsent('"' + caption + '"');
            return true;
        } else if (bef.length == 0) {
            this._messages.get("invalidFormat").putIfAbsent('"' + caption + '"');
            return true;
        } else if (!rr.test(bef)) {
            this._messages.get("invalidFormat").putIfAbsent('"' + caption + '"');
            return true;
        } else if (!rr.test(aft)) {
            this._messages.get("invalidFormat").putIfAbsent('"' + caption + '"');
            return true;
        }
        return false;
    };

    /*
     * Validate, that text in combo is not empty.
     */
    Validator.prototype.validateNotEmptyCombo = function(combo_obj, field_name){
        deprecateMessage('validateNotEmptyCombo()', 'checkComboIsNotEmpty()');
        /*
        if (combo_obj.getComboText() == ''){
            this._message += 'Не указано значение поля "' + field_name + '"!\n';
        }
        */
    };
    Validator.prototype.checkComboIsNotEmpty = function(combo_obj, field_name){
        var cbVal = trim(combo_obj.getComboText());
        if ( cbVal.blank()){
            this._messages.get("notSet").putIfAbsent('"' + field_name + '"') ;
            return false;
        } else {
            return true;
        }
    };

/*
 * Validate that combo value not equals to specified value
 */
    Validator.prototype.checkComboIsAcceptable = function(combo_obj, field_name, restricted_value){
        var cbVal = trim(combo_obj.getCurrentValue());
        if ( cbVal == restricted_value){
            this._messages.get("invalidValue").putIfAbsent('"' + field_name + '"') ;
        }
    };

/*
 * Validate that something is selected in combo
 */
    Validator.prototype.checkComboIsSomethingSelected = function(combo_obj, field_name){
        if (combo_obj.getSelectedIndex() == -1){
            this._messages.get("notSelected").putIfAbsent('"' + field_name + '"') ;
            return false;
        } else {
            return true;
        }
    };

    Validator.prototype.checkComboComprehensively = function(combo_obj, field_name) {
        if (this.checkComboIsNotEmpty(combo_obj, field_name))
            this.checkComboIsSomethingSelected(combo_obj, field_name);
    };

/*
 * Validate string against specified pattern. Use specified message.
 */
    Validator.prototype.checkTextForPatternMatching = function(text, pattern, message){
        var val = trim(text);
        if (!pattern.test(val)){
           this._message += message + '\n';
        }
    };

    Validator.prototype.checkEditForShortTimeFormat = function(edit_name, isMandatory) {
        var txt = trim($(edit_name).value);
        var caption = Tools.text(edit_name + '_s');
        if (isMandatory) {
            if (txt == ''){
                this._messages.get("empty").putIfAbsent('"' + caption + '"');
                return true;
            }
        }
        var timePattern = new RegExp("^([01]\\d|2[0-3]):([0-5]\\d)$");
        if (!txt.blank()) {
            if (txt.match(timePattern) == null)
            {
                this._messages.get("invalidShortTimeFormat").putIfAbsent('"' + caption + '"') ;
                return true;
            }
        }
        return false;
    };

    Validator.prototype.checkEditForTimeFormat = function(edit_name) {
        var txt = trim($(edit_name).value);
        var caption = Tools.text(edit_name + '_s');
        if (txt == ''){
            this._messages.get("empty").putIfAbsent('"' + caption + '"');
            return true;
        } else {
            var timePattern = new RegExp("^([01]\\d|2[0-3]):([0-5]\\d)(:[0-5]\\d(\\.\\d+)?)?$");
            if (txt.match(timePattern) == null) {
                this._messages.get("invalidTimeFormat").putIfAbsent('"' + caption + '"') ;
                return true;
            }
        }
        return false;
    };

/*
 * Validate that edit field contains date in format DD/MM/YYYY
 * Function to use ONLY from generated validateFields methods. Requirements:
 * -edit should have id
 * -we should be a span with id = "<editid>_s"
 */
    Validator.prototype.checkEditForDateFormat = function(edit_name){
        var txt = trim($(edit_name).value);
        if (txt == ''){
            var caption = Tools.text(edit_name + '_s');
            this._messages.get("empty").putIfAbsent('"' + caption + '"');
            return true;
        }
        if (!this.isDateValid(txt)){
           caption = Tools.text(edit_name + '_s');
           this._messages.get("invalidDateFormat").putIfAbsent('"' + caption + '"') ;
           return true;
       }
       return false;
    };


    Validator.prototype.isLeapYear = function(year) {
        var res = false;
        if ( year%4 == 0 && (year%100 != 0 || (year%100 == 0 && year%400 == 0)))
            res = true;
        return res;
    };

    /*
     * Supports only dd/mm/yyyy format
     */
    Validator.prototype.isDateValid = function(ds) {
        var res = true;

        var rge = new RegExp("^\\d{2}\\.\\d{2}\\.\\d{4}$");
        if (ds.match(rge) == null) {
            res = false;
        } else {
            var dList = ds.split(".");
            if (dList[1] < 1 || dList[1] > 12 ) {
                res = false;
            } else {
                var hiLim;
                if (dList[1]==1 || dList[1]==3 || dList[1]==5  || dList[1]==7 || dList[1]==8 || dList[1]==10 || dList[1]==12) {
                    hiLim = 31;
                } else if (dList[1]==4 || dList[1]==6 || dList[1]==9  || dList[1]==11) {
                    hiLim = 30;
                } else {
                    if (this.isLeapYear(dList[2]))
                        hiLim = 29;
                    else
                        hiLim = 28;
                }
                if (dList[0] < 1 || dList[0] > hiLim) {
                    res = false;
                }
            }
        }
        return res;
    };


    Validator.prototype.getMessage = function(){
        return this._message;
    };

    Validator.prototype.getCheckingResult = function() {
        var msg = this.getCheckingText();
        if (msg != '') {
            alert(msg);
            return false;
        }
        return true;
    };

    Validator.prototype.addMessage = function(msg) {
        this._plainTexts.push(msg + "\n");
    };

    Validator.prototype.getCheckingText = function(){
        var msg = '';
        var itemsCount = 0;
        var keys = this._messages.keys();
        var msgs = this._messages;
        var hdrs = this._msgHeaders;
        var tails = this._msgFooters;

        if(this._message != '')
            msg += this._message + '\n';
        keys.each(function(value, index){
            var errors = msgs.get(value).length;
            if(errors > 0){
                if(itemsCount == 0)
                    ++itemsCount;
                else
                    msg += '\n\n';
                var arrHdr = hdrs.get(value);
                var arrFtr = tails.get(value);
                if (errors == 1)
                    msg += arrHdr[0];
                else
                    msg += arrHdr[1];
                msg += msgs.get(value).join(',');
                if (!Object.isUndefined(arrFtr) && arrFtr != null && arrFtr.length >= 1) {
                    if (errors == 1)
                        msg += arrFtr[0];
                    else
                        msg += arrFtr[1];
                }

            }
        });
        var plainTexts = this._plainTexts;
        if (plainTexts.size() > 0)
            msg += "\n";
        plainTexts.each(function (item) {
            msg += item;
        });
        return msg;
    };

    /**
     * Check specified edit field, that it value is not negative
     * @param edit_name
     */
    Validator.prototype.checkEditForNotNegative = function(edit_name) {
        var txt = trim($(edit_name).value);
        if (txt < 0) {
            var caption = $(edit_name + '_s').innerText;
            this._messages.get("invalidFormat").putIfAbsent('"' + caption + '"');
        }
    };

    /**
     * Check specified edit field, that it value is positive. In other words it not negative AND not zero
     * @param edit_name
     */
    Validator.prototype.checkEditForPositive = function(edit_name) {
        var txt = trim($(edit_name).value);
        if (txt <= 0) {
            var caption = $(edit_name + '_s').innerText;
            this._messages.get("invalidFormat").putIfAbsent('"' + caption + '"');
        }
    };

    Validator.prototype.checkEditForSWIFT = function(edit_name){
        return this.checkEditForPatternMatching(edit_name, /^[A-Za-z\d.,\-()\/'+":?& ]+$/);
    };

    /**
     * проверка формата номера счета
     * @param edit_name
     */
    Validator.prototype.checkAccountFormat= function(edit_name) {
        return this.checkEditForPatternMatching(edit_name, /^[A-Za-z\d]{12}$/);
    };

    /**
     * Проверка формата раздела счета
     * @param edit_name
     */
    Validator.prototype.checkSectionFormat= function(edit_name) {
        return this.checkEditForPatternMatching(edit_name, /^[A-Za-z\d]{17}$/);
    };

    /**
     * Проверка формата приоритета типа цены
     * @param edit_name
     */
    Validator.prototype.checkPriceTypePriorityFormat = function(edit_name){
        var val = trim($F(edit_name));
        var pattern = new RegExp('^[A-Z0-9-;]{0,62}$');
        if (!pattern.test(val)) {
            var caption = $(edit_name + '_s').innerText;
            this._messages.get("invalidFormat").putIfAbsent('"' + caption + '"');
        }
    };
//-----------------------------------------------------------------------------
// End of Validator
//-----------------------------------------------------------------------------

function openModelessWindow(url, window_id, opnr){
    var win;
    win = window;
    if (Object.isUndefined(opnr))
        opnr = window;
    while (win.opener != undefined && win.opener.open_window == undefined){
        win = window.opener;
        //if (win.closed) - может быть такая проблема
    }
    if (win.opener == undefined){
        alert('Неправильное использование функции openModelessWindow - она должна вызываться из окна, открытого либо через главное меню, либо через данную функцию!');
        return;
    }
    if (win.opener.open_window == undefined){
        alert('Неправильное использование функции openModelessWindow (не могу найти функцию open_window) - она должна вызываться из окна, открытого либо через главное меню, либо через данную функцию!');
        return;
    }
    win.opener.open_window(url, window_id, opnr);
}

/**
 * Open window with window opened from DPO
 * @param uid user_id
 */
function open_window_dpo(newLoc, id, uid){
    var nLoc=addUn(newLoc);

    if (screen.width >= 1024)
        var dlgWidth = screen.width - 200;
    else
        dlgWidth = screen.width - 500;
    var dlgHeight = screen.height - 200;
    var dlgTop = (screen.height - dlgHeight) / 2 - 5;
    var dlgLeft = (screen.width - dlgWidth) / 2 - 5;

    var wndId = id + "dpowindow" + uid;
    if (wndId.indexOf('-')!=-1){
        alert('В идентификаторе открываемого окна (' + windId + ') обнаружен символ минус. Он относится к запрещенным символам. Обратитесь к разработчикам (приложите снимок экрана).');
        return;
    }
    var wnd = window.open(nLoc, wndId,
     "location=no, menubar=no, toolbar=no, resizable=yes, scrollbars=yes, status=yes" +
     ", top=" + dlgTop + ", left=" + dlgLeft + ", width=" + dlgWidth + ", height=" + dlgHeight);
}

//timestamp of edit start moment
var edit_ts = -1;
/*
Query current timestamp from middleware server. Used for optimistic records blocking
 */
function queryTs(){ //function works async - thats ok
    var data ={
        name:'ts'
    };
    alameda.ajaxRequest("Ctrl", {
        method:"post",
        parameters:data,
        onSuccess:function(transport){
            var json = transport.responseText.evalJSON(true);
            if (json.res != 'error') {edit_ts = json.res;}
        }
    }, alameda.AjaxRequestMode.GET
);
}

/**
 * Alameda service class.
 * Contains:
 *      debug method
 *           Example alameda.debug(object);
 */

if (typeof alameda == "undefined") {

    var al_global = this;

    var al_currentContext = this;

    function al_undef(/*String*/ name, /*Object?*/ object) {
        //summary: Returns true if 'name' is defined on 'object' (or globally if 'object' is null).
        //description: Note that 'defined' and 'exists' are not the same concept.
        return (typeof (object || al_currentContext)[name] == "undefined");	// Boolean
    }

    if (al_undef("alameda", this)) {
        var alameda = {};

    }if (al_undef("alConfig", this)) {
        var alConfig = {
            isDebug: false,
            debugContainerId: "debugContainer"
        };
    }

    alameda.global = function() {
        // summary:
        //		return the current global context object
        //		(e.g., the window object in a browser).
        // description:
        //		Refer to 'alameda.global()' rather than referring to window to ensure your
        //		code runs correctly in contexts other than web browsers (eg: Rhino on a server).
        return al_currentContext;
    };


    if(!al_undef("document", this)){
		var al_currentDocument = this.document;
	}

	alameda.doc = function(){
		// summary:
		//		return the document object associated with the alameda.global()
		return al_currentDocument;
	};

	alameda.body = function(){
		// summary:
		//		return the body object associated with alameda.doc()
		// Note: document.body is not defined for a strict xhtml document
		return alameda.doc().body || alameda.doc().getElementsByTagName("body")[0];
	};



    alameda.println = function(/*String*/line) {
        try {
            var console = document.getElementById(alConfig.debugContainerId ?
                                                  alConfig.debugContainerId : "debugContainer");
            if (!console) {
                console = alameda.body();
            }

            var div = document.createElement("div");
            div.appendChild(document.createTextNode(line));
            console.appendChild(div);
        } catch (e) {
            try {
                // safari needs the output wrapped in an element for some reason
                document.write("<div>" + line + "</div>");
            } catch(e2) {
                window.status = line;
            }
        }
    };

    alameda.errorToString = function(/*Error*/ exception) {
        // summary: Return an exception's 'message', 'description' or text.
        // 		... since natively generated Error objects do not always reflect such things?
        if (!al_undef("message", exception)) {
            return exception.message;		// String
        } else if (!al_undef("description", exception)) {
            return exception.description;	// String
        } else {
            return exception;				// Error
        }
    };

    // process debugging information

    alameda.debug = function () {
        if (!alConfig.isDebug) {
            return;
        }
        var args = arguments;

        var s = ["DEBUG: "];
        for (var i = 0; i < args.length; ++i) {
            if (!false && args[i] && args[i] instanceof Error) {
                var msg = "[" + args[i].name + ": " + alameda.errorToString(args[i]) + (args[i].fileName ? ", file: " + args[i].fileName : "") + (args[i].lineNumber ? ", line: " + args[i].lineNumber : "") + "]";
            } else {
                try {
                    var msg = Object.inspect(args[i]);
                }
                catch (e) {
                    var msg = "[unknown]";
                }
            }
            s.push(msg);
        }
        alameda.println(s.join(" "));
    };

    alameda.debugInvisibly = function () {
        var args = arguments;

        var s = ["DEBUG: "];
        for (var i = 0; i < args.length; ++i) {
            if (!false && args[i] && args[i] instanceof Error) {
                var msg = "[" + args[i].name + ": " + alameda.errorToString(args[i]) + (args[i].fileName ? ", file: " + args[i].fileName : "") + (args[i].lineNumber ? ", line: " + args[i].lineNumber : "") + "]";
            } else {
                try {
                    var msg = Object.inspect(args[i]);
                }
                catch (e) {
                    var msg = "[unknown]";
                }
            }
            s.push(msg);
        }
        alameda.println(s.join(" "));
    };

    alameda.isFunction = function(/*anything*/ it) {
        // summary:	Return true if it is a Function.
        return (it instanceof Function || typeof it == "function"); // Boolean
    };

    alameda.isString = function(/*anything*/ it) {
        // summary:	Return true if it is a String.
        return (typeof it == "string" || it instanceof String);
    };


    alameda.setTimeout = function(/*Function*/func, /*int*/delay /*, ...*/) {
        // summary:
        //		Sets a timeout in milliseconds to execute a function in a given
        //		context with optional arguments.
        // usage:
        //		alameda.setTimeout(Object context, function func, number delay[, arg1[, ...]]);
        //		alameda.setTimeout(function func, number delay[, arg1[, ...]]);

        var context = window, argsStart = 2;
        if (!alameda.isFunction(func)) {
            context = func;
            func = delay;
            delay = arguments[2];
            argsStart++;
        }

        if (alameda.isString(func)) {
            func = context[func];
        }

        var args = [];
        for (var i = argsStart; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        return alameda.global().setTimeout(function() {
            func.apply(context, args);
        }, delay); // int
    };

    alameda.clearTimeout = function(/*int*/timer) {
        // summary: clears timer by number from the execution queue

        // FIXME:
        //		why do we have this function? It's not portable outside of browser
        //		environments and it's a stupid wrapper on something that browsers
        //		provide anyway.
        alameda.global().clearTimeout(timer);
    };

    /**
     * Получает объект по его строковому представлению и выполняет как функцию его последний эллемент
     * @param str строка
     * @param optParam Опциональный параметр, передаваемый в функцию
     */
    alameda.runFunctionInContext = function(/*String*/str, optParam){
        var arr = $A();
        str.gsub(/\w+/, function(match){
            arr.push(match[0]);
            return "";
        });

        if(arr.length == 0) return null;

        // контекст вызываемой функции
        var objResult = window;

        for (var i = 0; i < arr.length-1; i++) {
            objResult = objResult[arr[i]];
        }
        return objResult[arr[arr.length-1]](optParam);
    };

    alameda.initUploadManager = function(){
        if (al_undef("uploadManager", alameda)) {
            alameda.uploadManager = {
                uploaderHash: $H(),
                /**
                 * Регестрирует новый аплоадер
                 * @param name имя
                 * @param uploader аплоадер
                 */
                regUploader: function(/*String*/name,/*FileUploader*/uploader){
                    this.uploaderHash.set(name,uploader);
                },

                /**
                 * Выполняет загрузку конкретного аплоадера
                 * @param name имя аплоадера
                 */
                doUpload: function(/*String*/name){
                    var upl = this.uploaderHash.get(name);
                    if(Tools.def(upl)){
                        upl.doSubmit();
                    }
                },

                /**
                 * Выполняет загрузку всех аплоадеров
                 */
                doUploadAll: function(){
                    this.uploaderHash.each(function(pair){
                        pair.value.doSubmit();
                    });
                },

                /**
                 * проверяет был ли введен путь к файлу
                 * true - путь не указан
                 * false - путь указан
                 * @param name имя(id) аплоадера
                 */
                isFilePathEmpty: function(/*String*/name){
                    var upl = this.uploaderHash.get(name);
                    if (Tools.def(upl)) {
                        return upl._getFileName().strip().blank();
                    }else{
                        return false;
                    }
                }
            };
        }
    };

    alameda._fnn = function(v) {
        if (Object.isUndefined(v) || v == null)
            return '';
        else
            return v.toString();
    };

    alameda._getTrStatus = function (transport) {
        var ss = '{status = ';
        ss += alameda._fnn(transport.status);
        ss += ' statusText="';
        ss += alameda._fnn(transport.statusText);
        ss += '" readyState=';
        ss += alameda._fnn(transport.readyState);
        ss += '" responseText="';
        ss += alameda._fnn(transport.responseText);
        ss += '"}';
        return ss;
    };

    alameda.AjaxRequestMode = {
        GET: "get",
        ADD: "add",
        EDIT: "edit",
        DELETE: "delete"
    };

    /**
     * Вызов асинхронного запроса. Обертка для вызова из прототайпа.
     * Внимание! Все ajax вызовы в проекте аламеда следует делать через этот метод.
     * Поскольку он содерджит стандартную обработку метода onFailure.
     * При необходимости добавить свой метод onFailure надо его назвать _onFailure
     *
     * @param url урл запроса
     * @param options опции (стандартные для прототайпа)
     * @param mode режим работы запроса. Возможные значения:
     *  "get" - запрос данных
     *  "add" - добавление данных
     *  "edit" - редактирование данных
     *  Значение по умолчанию "get"
     */
    alameda.ajaxRequest = function(url, options, mode){
        alameda.debug("alameda.ajaxRequest", url, options, mode);
        if(!Tools.def(mode)){
            mode = alameda.AjaxRequestMode.GET;
        }
        if(Tools.def(options)){
            var fMessage = "Возникли сетевые проблемы при обмене информацией с сервером приложения.\n";
            var fMessageAdd = "\nВероятно, Ваш запрос был выполнен, но автоматически проверить это невозможно.\nПопробуйте выполнить запрос еще раз - если вы получите сообщение о том, что такая запись уже существует (или аналогичное ему по сути), то просто обновите данную страницу - Ваш запрос скорее всего был выполнен в первый раз.";
            // счетчик попыток выполнения запроса
            var attemptCounter = 1;
            var showAlert = function(transport, extra){
                if (Object.isUndefined(extra)) {
                    alert(fMessage + "\n" + alameda._getTrStatus(transport));
                } else {
                    alert(fMessage + extra + "\n" + alameda._getTrStatus(transport));
                }
            };
            options.onException = function(request, exc) {
                try {
                    alameda.debugInvisibly("onException", alameda._getTrStatus(request.transport), exc);
                    alert("Во время выполнения запроса к серверу произошла непредвиденная ошибка. \n" +
                          "Попробуйте выполнить операцию ещё раз либо обратитесь к разработчикам. \n" +
                          "Информация для разработчиков: \n"+
                          alameda._getTrStatus(request.transport) + "\n" + exc);
                } catch(e) {
                    alert(e);
                }
            };
            if(!Tools.def(options._onFailure)){
                options._onFailure = Prototype.emptyFunction;
            }
            options.onFailure = function(transport) {
                alameda.debug("onFailure", alameda._getTrStatus(transport));
                attemptCounter--;
                switch (mode) {
                    // если режимы чтения данных или редактирования, то пробуем ещё раз выполнить запрос
                    case alameda.AjaxRequestMode.GET:
                    case alameda.AjaxRequestMode.EDIT:
                        if (attemptCounter >= 0) {
//                            new Ajax.Request(url, options);
                            alameda._doAjaxRequest(url, options);
                        } else {
                            options._onFailure(transport);
                            showAlert(transport);
                        }
                        break;
                    // в режиме добавления данных выполнить запрос ещё раз не удастся
                    case alameda.AjaxRequestMode.ADD:
                    // в режиме удаления данных выполнить запрос ещё раз не удастся
                    case alameda.AjaxRequestMode.DELETE:
                        options._onFailure(transport);
                        showAlert(transport, fMessageAdd);
                }
            };
        }
//        return new Ajax.Request(url, options);
        return alameda._doAjaxRequest(url, options);
    };

    // время ожидания между запросами в режиме коротких коннектов
    alameda.SHORT_CONNECTION_TIMEOUT_PERIOD = 10000;
    alameda.SHORT_CONNECTION_PARAM_NAME = "shortConnectionMode";
    // счетчик нужен, чтобы reload вызывалось только 1 раз
    alameda._needsReloginCounter = 0;

    alameda._needsRelogin = function(json) {
        if(Tools.def(json["need_relogin"])){
            if(alameda._needsReloginCounter == 0){
                alameda._needsReloginCounter++;
                // надо перелогиниваться
                alert("Произошел разрыв соединения. Пользователь должен заново войти в систему!");
                setTimeout("location.reload(true);",100);
            }
            return true;
        }
        return false;
    };

    // счетчик нужен, чтобы reload вызывалось только 1 раз
    alameda._needsKillSessionCounter = 0;

    alameda._needsKillSession = function(json) {
        if(Tools.def(json["kill_session"])){
            if(alameda._needsKillSessionCounter == 0){
                alameda._needsKillSessionCounter++;
                // надо отправить на страницу с информацией о выбросе пользователя
                window.location = json["kill_session_url"];
            }
            return true;
        }
        return false;
    };

    alameda._systemChecks = function(json){
        return alameda._needsRelogin(json) || alameda._needsKillSession(json);
    };
    /**
     * пауза выполнения
     * @param millis количество миллисекунд
     */
    alameda.pausecomp = function(millis) {
        var date = new Date();
        var curDate = null;
        do {
            curDate = new Date();
        }
        while (curDate - date < millis);
    };

    alameda._doAjaxRequest = function(url, options) {
        // копируем все опции (проблема в том, что это не глубокая копия и объекты внутри не копирюьтся, а просто ссылка переписывается)
        var nOptions = Object.clone(options);
        // проверим наличие опций и наличие флага "короткий коннект"
        if (Tools.def(options) && Tools.def(options[alameda.SHORT_CONNECTION_PARAM_NAME]) && options[alameda.SHORT_CONNECTION_PARAM_NAME]) {
            if (Object.isHash(nOptions.parameters)) {
                // сначала копируем параметры, чтобы в nOptions лежал новый объект, а не ссылка на параметры из options
                nOptions.parameters = options.parameters.clone();
                nOptions.parameters.set("use_scm", true);
                nOptions.parameters.set("SHORT_CONNECTION_TIMEOUT_PERIOD", alameda.SHORT_CONNECTION_TIMEOUT_PERIOD);
                // проверим, что в параметрах нет служебного параметра
                if(nOptions.parameters.get("request_id") != null){
                    alert("Ошибка программирования! При использовании режима shortConnectionMode нельзя использовать параметр request_id");
                    return;
                }
            } else {
                // сначала копируем параметры, чтобы в nOptions лежал новый объект, а не ссылка на параметры из options
                nOptions.parameters = Object.clone(options.parameters);
                nOptions.parameters["use_scm"] = true;
                nOptions.parameters["SHORT_CONNECTION_TIMEOUT_PERIOD"] = alameda.SHORT_CONNECTION_TIMEOUT_PERIOD;
                if(nOptions.parameters.request_id != null){
                    alert("Ошибка программирования! При использовании режима shortConnectionMode нельзя использовать параметр request_id");
                    return;
                }
            }
//            options._onSuccess = options.onSuccess;
            nOptions.onSuccess = function(transport) {
                var json = transport.responseText.evalJSON(true);

                if(alameda._systemChecks(json)){
                    return;
                }

                var requestId = json["request_id"];
                alameda.debug("onSuccess: ", "requestId = " + requestId);
                if (Tools.def(requestId)) {
                    // проверим какого типа поле parameters
                    if(Object.isHash(nOptions.parameters)){
                        // это хэш
                        nOptions.parameters.set("request_id", requestId);
                    }else if(!Tools.def(nOptions.parameters)){
                        // нет вообще параметров, хотя такого быть не может
                        throw new Error("Не корректное формирование опций для ajax запроса");
                    }else{
                        // значит это просто JSON объект
                        nOptions.parameters.request_id = requestId;
                    }
                    // если пришел request_id, значит надо ещё ждать. ждем 10 сек и делаем запрос
                    if (Tools.def(nOptions.asynchronous) && !nOptions.asynchronous) {
                        throw new Error("Нельзя использовать синхронный режим загрузки для SHORT_CONNECTION_MODE");
//                        синхронный режим
//                        alameda.pausecomp(alameda.SHORT_CONNECTION_TIMEOUT_PERIOD);
//                        alameda.debug("running AJAX request for url = " + url, nOptions);
//                        return new Ajax.Request(url, nOptions);
                    } else {
                        setTimeout(function() {
                            alameda.debug("running AJAX request for url = " + url, nOptions);
                            new Ajax.Request(url, nOptions);
                        }, alameda.SHORT_CONNECTION_TIMEOUT_PERIOD);
                    }
                } else {
                    // пришел нужный объект либо ошибка. но всёравно передаем на обработку дальше
                    options.onSuccess(transport);
                }
            };
            return new Ajax.Request(url, nOptions);
        }else{
            nOptions.onSuccess = function(transport) {
                var json = transport.responseText.evalJSON(true);

                if(alameda._systemChecks(json)){
                    return;
                }
                // проверки пройдены, направляем дальше обработку
                if(Tools.defFunc(options.onSuccess)){
                    options.onSuccess(transport);
                }
            };
            // делаем ajax запрос
            return new Ajax.Request(url, nOptions);
        }
    };


    /**
     * Инициализация криптографии в зависимости от типа криптографии
     * @param cryptoType тип используемой криптографии
     * @param cryptoOn признак, что криптография включена
     * @param certType тип используемого справочника сертификатов (PKI,xPKI,rPKI)
     * @return {Boolean} инициализация прошла успешно
     */
    alameda.initCrypto = function(/*String*/cryptoType,/*Boolean*/cryptoOn, /*String*/certType){
        if (Tools.def(cryptoType) && cryptoType.blank()) {
            throw new Error("Не указан тип используемой криптографии");
        }
        if (!Tools.def(cryptoOn)) {
            throw new Error("Не указан признак включенной криптографии");
        }
        if (Tools.def(certType) && cryptoType.blank()) {
            throw new Error("Не указан тип используемого справочника сертификатов");
        }
        var result = false;
        if(cryptoType == "tls" && cryptoOn){
            // подпишем блок данных
            new Ajax.Request("tlsAuth", {
                method:"get",
                asynchronous: false,
                parameters: $H({servlet_mode: "GET_DATA", un:Date.parse(new Date())}),
                onFailure:alameda._saveCryptoFailed,
                onSuccess:function(transport){
                    var json = transport.responseText.evalJSON(true);
                    var res = json["result"];
                    if(!Object.isUndefined(res) && res != null){
                        if(res == "error"){
                            alert(json["error"]);
                            alameda._saveCryptoFailed(transport);
                        }else{
                            // пришел корреткный кусок данных, надо его подписать и отправить для проверки
                            var sign = signData(json["result"], certType);
                            if (sign == "") {
                                return;
                            }
                            new Ajax.Request("tlsAuth", {
                                method:"post",
                                asynchronous: false,
                                onFailure:alameda._saveCryptoFailed,
                                parameters:$H({servlet_mode: "STORE_CERT",signed_data:sign}),
                                onSuccess:function(transport){
                                    var json = transport.responseText.evalJSON(true);
                                    var res = json["result"];
                                    if (!Object.isUndefined(res) && res != null) {
                                        if (res == "error") {
                                            alert(json["error"]);
                                            alameda._saveCryptoFailed(transport);
                                        } else if (res == "ok") {
                                            // проверка сертификата успешна и сертификат сохранен в сессию
                                            result = true;
                                        }
                                    } else {
                                        alameda._saveCryptoFailed(transport);
                                    }
                                }
                            });
                        }
                    }else{
                        alameda._saveCryptoFailed(transport);
                    }
                }
            });
        }else{
            // do nothing
            result = true;
        }
        return result;
    };

    alameda._saveCryptoFailed = function(transport) {
        if(transport.status==555){
            //ошибка корвета. вероятно неправильно настроен клиент криптографии
            alert("Не могу выполнить вход в систему. Необходимо проверить локальные настройки криптографии в интернет обозревателе!");
        }else{
            if(confirm('Не могу выполнить вход в систему. Какие-то проблемы при вызове сервера. Показать текст ответа сервера?')){
                alert(transport.responseText);
            }
        }
        $('login').disabled = false;
    };

    /**
     * Формирует строку из диапазона чисел в виде строки. например для getIntRangeInString(1,4) выдаст 1,2,3,4
     *
     * @param start начальное число
     * @param finish конечно число
     * @returns {string}
     */
    alameda.getIntRangeInString = function (start, finish) {
        var v = "";
        for (var i = start; i < finish; i++) {
            v += i + ","
        }
        v += finish;
        return v;
    }
}

/*
 * General to function to add event listener. Substitutes xAddEventListener.
 */
function addEventListener(object_name, event_name, func){
    if(!(object_name=$(object_name)))return;
    Event.observe(object_name, event_name, func);
//    xAddEventListener(object_name, event_name, func, false);
}

//e - element, which events we are going to listen
//eT - event name
//eL - event handler
//cap - something boolean
/*
function xAddEventListener(e,eT,eL,cap)
{
  if(!(e=document.getElementById(e)))return;
  eT=eT.toLowerCase();
  if(e.addEventListener)e.addEventListener(eT,eL,cap||false);
  else if(e.attachEvent)e.attachEvent('on'+eT,eL);
  else {
        var o=e['on'+eT];
        e['on'+eT]=typeof o=='function' ? function(v){o(v);eL(v);} : eL;
  }
}
*/
function setChangeListener(object_name){
    addEventListener(object_name, 'change', setChangeFlag);
}
function setKeypressListener(object_name){
    addEventListener(object_name, 'keypress', setChangeFlag);
}
function setClickListener(object_name){
    addEventListener(object_name, 'click', setChangeFlag);
}
function setEditListeners(object_name){
    addEventListener(object_name, 'change', setChangeFlag);
    addEventListener(object_name, 'keypress', setChangeFlag);
}

function saveClickListener(object_name, func){
    if (Object.isUndefined(func) || func==null) return;
    var o=$(object_name);
    if (o!=null)
        Event.observe(o, 'click', func);
}

function serveHTML() {
    this._htmlNode = document.createElement("DIV");
}

serveHTML.prototype.decode = function(encodedString) {
    var result;
    this._htmlNode.innerHTML = encodedString;
    if(this._htmlNode.innerText)
        result = this._htmlNode.innerText;
    else  // IE
        result = this._htmlNode.textContent;
    if (result == undefined)
        result = '';
    return result;
};

var _before_unload_handlers;
function addWinBeforeUnloadHandler(func){
    if (Object.isUndefined(_before_unload_handlers)){
        _before_unload_handlers = [];
        window.onbeforeunload = _beforeUnloadRealHandler;
    }
    _before_unload_handlers.push(func);
}

function _beforeUnloadRealHandler(){
    if (Object.isUndefined(_before_unload_handlers)) return;
    for (var i=0; i<_before_unload_handlers.length; ++i){
        _before_unload_handlers[i]();
    }
}

// Массив функций вызываемых при именении размеров окна
var _win_resize_handlers;
/**
 * Добавляем функцию вызываемую при изменении размеров окна
 */
function addWinOnResizeHandler(func){
    if (Object.isUndefined(_win_resize_handlers)){
        _win_resize_handlers = [];
        window.onresize = _winOnResizeHandler;
    }
    _win_resize_handlers.push(func);
}

function _winOnResizeHandler(){
    if (Object.isUndefined(_win_resize_handlers)) return;
    for (var i=0; i<_win_resize_handlers.length; ++i){
        _win_resize_handlers[i]();
    }
}

function clearAllDef(arInputs, flag){
    var bl = !Object.isUndefined(flag) && flag==1;
    for (var i = 0; i < arInputs.length; ++i){
        var el=$(arInputs[i]);
        if (el==null)continue;
        if (arInputs[i] == 'row_id' && bl)
            continue;

        if (arInputs[i].substring(0, 2) == "f_")
            el.checked = false;

        el.value = '';
    }
}

function writeRecordsAmount (amount) {
    var word1 = "Выбрано ";
    var word2;

    var rem10 = amount % 10,
        rem100 = amount % 100;
    if ( (rem100 >= 11 && rem100 <= 19) ||
        rem10 == 0 ||
        (rem10 >= 5 && rem10 <= 9) ) {
        word2 = ' записей';
    } else if (rem10 == 1) {
        word1 = 'Выбрана ';
        word2 = ' запись';
    } else {
        word2 = ' записи';
    }
    window.status = word1 + amount + word2;
}


/**
 * Добавляет текст к строке запроса
 *
 * @param url трока запроса
 * @param str добавляемый текст
 * @returns {string} новая строка запроса
 */
function _addStringToUrl(url, str) {
    return Object.isString(str) && !str.blank() ? url + (url.indexOf("?") >= 0 ? "&" : "?") + str : url;
}

/**
 * Добавляет(заменяет если есть) к строке запроса переменную un со значением текущего времени
 *
 * @param url строка запроса
 * @returns {string} новая строка запроса
 */
function addUn(url) {
    function add(url) {
        if (Object.isUndefined(Date._parse)) {
            return _addStringToUrl(url, "un=" + Date.parse(new Date()));
        } else {
            return _addStringToUrl(url, "un=" + Date._parse(new Date()));
        }
    }
    var index = url.indexOf("&un=");
    if (index == -1) {
        index = url.indexOf("?un=");
    }
    if (index == -1) {
        return add(url);
    } else {
        index = index + 1;
    }
    var newUrl = url.substring(0, index - 1);
    var index2 = url.substring(index).indexOf("&");
    newUrl += index2 > -1 ? url.substring(index + index2) : '';
    return add(newUrl);
}

/**
 * Класс позволяет обрабатывать поля комбобоксы
 */
var ComboboxHandler = Class.create({
    initialize: function() {
        // инициализируем хеш для полей-комбобоксов
        this.combosHash = $H();
    },

    getHash:function() {
        return this.combosHash;
    },

    /**
     * Добавляет комбобокс в хранилище
     * @param name combobox field name
     * @param cbx combobox instance
     */
    addCombo: function(/*String*/name, /*dhtmlxCombo*/cbx){
        this.combosHash.set(name,cbx);
        // хак, связанный с тем, что комбики могут создаваться раньше чем создается таббар и тогда они скрытые получаются
        // если комбик невидим, то ничего не делаем
        if(cbx.DOMelem.style.display == 'none') return;
        cbx.show(false);
        cbx.show(true);
    },

    get: function(/*String*/name){
        return this.combosHash.get(name);
    },

    /**
     * Возвращает весь набор зарегестрированных комбобоксов в виде массива
     */
    getAllCbxs: function(){
        return this.combosHash.values();
    },

    /**
     * Возвращает весь набор ключей зарегестрированных комбобоксов в виде массива
     */
    getAllKeys: function(){
        return this.combosHash.keys();
    },

    /**
     * Заблокировать указанный комбобокс
     * @param name имя комбика
     * @param disable true - заблокировать, false - разблокировать
     */
    disable: function(/*String*/name, /*Boolean*/disable){
        this.getExistant(name).disable(disable);
        this.getExistant(name).readonly(true);
    },

    /**
     * Установить обязательность ввода указанного комбобокса
     * @param name имя комбика
     * @param disable true - обязательно для ввода, false - не обязательно
     */
    setRequired: function(/*String*/name,/*Boolean*/req){
        Tools.setRequired(this.getExistant(name).DOMelem_input, req);
    },

    /**
     * Возвращает значение комбобокса по указанному наименованию
     * @param name имя комбобокса
     * @param label наименование значения
     */
    getValueByLabel: function(/*String*/name, /*String*/label) {
        var cbx = this.getExistant(name);
        if (!label.blank()) {
            var option = cbx.getOptionByLabel(label);
            if (option != null) {
                return cbx.getOptionByLabel(label).value;
            } else {
                throw new Error("Для комбобокса [" + name + "] не найдено наименование [" + label + "]!");
            }
        } else {
            return "-1";
        }

    },

    /**
     * Возвращает текущее значение кобобокса
     * @param name имя комбобокса
     */
    getSelectedValue: function(/*String*/name) {
        return this.getExistant(name).getSelectedValue();
    },

    /**
     * Возвращает текущее значение текста кобобокса
     * @param name имя комбобокса
     */
    getSelectedText: function(/*String*/name) {
        return this.getExistant(name).getSelectedText();
    },

    /**
     * Возвращает гарантированно существующий комбобокс из контейнера.
     * Если комбобокс с указанным имененм не найден, то выброасывается исключаение
     * @param name имя комбобокса
     */
    getExistant: function(/*String*/name) {
        var cbx = this.get(name);
        if (!Object.isUndefined(cbx) && cbx != null) {
            return cbx;
        } else {
            throw new Error("Не найден комбобокс c именем [" + name + "] в контейнере!");
        }
    },

    /**
     * В указанном комбобоксе выделяет значение соответствующее тексту
     * @param name имя комбобокса
     * @param text текст значения комбобокса
     */
    selectOptionByText: function(/*String*/name, /*String*/text) {
        this.getExistant(name).selectOptionByText(text);
    },

    /**
     * В указанном комбобоксе выделяет значение соответствующее тексту
     * @param name имя комбобокса
     * @param value значение комбобокса
     */
    selectOptionByValue: function(/*String*/name, /*String*/value) {
        this.getExistant(name).selectOptionByValue(value);
    },

    /**
     * Сбрасывает значение комбобокса к дефолтовому значению
     * @param name имя комбобокса
     */
    resetToDefaultValue: function(/*String*/name) {
        var cbx = this.getExistant(name);
        if (Tools.def(cbx.defaultOption)) {
            cbx.selectOption(cbx.defaultOption);
        } else { // если дефолтовое значение комбика не определено, то сбрасываем к первому значению
            cbx.selectOption(1);
        }
    }
});

var Tools = {
    NDCCode: "NDC000000000",
	NDCCLRCode: "NSDCLR000000",
    ONE_MB: 1024*1024,

    /**
     *  Обработчик полей, где комбобоксы передаются как ComboboxHandler
     */
    FieldsProcessor : {
        /**
         * Заполнение грида из карточки
         * @param fieldsArray : Array массив с именами эллементов на странице, которые надо почистить
         * @param cbxHandler : ComboboxHandler обработчик комбобоксов
         */
        fillGrid: function(/*id*/id,/*Array*/fieldsArray,/*ComboboxHandler*/cbxHandler,/*grid*/mygrid) {
            for (var i = 0; i < fieldsArray.length; ++i) {
                var elem = $(fieldsArray[i]);
                var type = "";
                if (elem && elem.type)
                    type = elem.type.toUpperCase();
                if (type == "CHECKBOX" || fieldsArray[i].substring(0, 2) == "f_") {
                    mygrid.setCellValue(id, fieldsArray[i], $(fieldsArray[i]).checked ? 1 : 0);
                } else if (fieldsArray[i].substring(0, 2) == "c_") {
                    mygrid.setCellValue(id, fieldsArray[i], cbxHandler.getSelectedText(fieldsArray[i])._dhx_trim());
                } else if(Tools.def(cbxHandler.get(fieldsArray[i])) && Tools.def(cbxHandler.get(fieldsArray[i]).alaAutoComplete)){
                    mygrid.setCellValue(id, fieldsArray[i], cbxHandler.getSelectedText(fieldsArray[i]));
                } else {
                    mygrid.setCellValue(id, fieldsArray[i], $(fieldsArray[i]).value);
                }
            }
        },

        /**
         * Заполнение карточки из грида
         * @param fieldsArray : Array массив с именами эллементов на странице, которые надо почистить
         * @param cbxHandler : ComboboxHandler обработчик комбобоксов
         */
        fillForm: function(/*rowId*/rowId,/*Array*/fieldsArray,/*ComboboxHandler*/cbxHandler,/*grid*/mygrid) {
            for (var i = 0; i < fieldsArray.length; ++i) {
                var elem = $(fieldsArray[i]);
                var type = "";
                if (elem && elem.type)
                    type = elem.type.toUpperCase();
                if (type == "CHECKBOX" || fieldsArray[i].substring(0, 2) == "f_") {
                    $(fieldsArray[i]).checked = (mygrid.getCellValue(rowId, fieldsArray[i]) == '1');
                } else if(Tools.def(cbxHandler.get(fieldsArray[i])) && Tools.def(cbxHandler.get(fieldsArray[i]).alaAutoComplete)){
                    var cbx = cbxHandler.get(fieldsArray[i]);
                    var val = TrimEmptyString(mygrid.getCellValue(rowId, fieldsArray[i]));
                    if (val.blank()) {
                        cbx.doClear();
                    } else if(cbx.alaIsLoaded) {
                        if (!cbx.selectOptionByText(val))
                            cbx.setComboText(val);
                    }
                } else if (fieldsArray[i].substring(0, 2) == "c_") {
                    cbxHandler.selectOptionByText(fieldsArray[i], TrimEmptyString(mygrid.getCellValue(rowId, fieldsArray[i])));
                } else {
                    $(fieldsArray[i]).value = TrimEmptyString(mygrid.getCellValue(rowId, fieldsArray[i]));
                }
            }
        },

        /**
         * Очистка полей
         * @param fieldsArray : Array массив с именами эллементов на странице, которые надо почистить
         * @param cbxHandler : ComboboxHandler обработчик комбобоксов
         */
        clear: function(/*Array*/fieldsArray,/*ComboboxHandler*/cbxHandler) {
            for (var i = 0; i < fieldsArray.length; ++i) {
                var id = fieldsArray[i];
                var elem = $(id);
                var tagname = elem ? elem.tagName.toUpperCase() : "";
                var type = "";
                if (elem && elem.type)
                    type = elem.type.toUpperCase();
                if (id.substring(0, 2) == "c_") {
                    if (Tools.def(cbxHandler)) {
                        cbxHandler.resetToDefaultValue(id);
                    } else {
                        throw Error("Параметр [cbxHandler] для метода [Tools.FieldsProcessor.clear] не определен");
                    }
                } else if(Tools.def(cbxHandler) && Tools.def(cbxHandler.get(id)) && Tools.def(cbxHandler.get(id).alaAutoComplete)){
                    cbxHandler.get(id).doClear();
                } else if (type == "CHECKBOX") {
                    elem.checked = false;
                } else if (tagname == "SELECT") {
                    elem.value = elem.getAttribute('defaultValue');
                } else {
                    elem.value = "";
                }
            }
        },

        /**
         * Блокировка указанных полей
         * @param fieldsArray : Array массив с именами эллементов на странице, которые надо почистить
         * @param cbxHandler : ComboboxHandler обработчик комбобоксов
         * @param disable : Boolean true - блокировать, false - разблокировать
         */
        disable: function(/*Array*/fieldsArray, /*ComboboxHandler*/cbxHandler, /*Boolean*/disable) {
            for (var i = 0; i < fieldsArray.length; ++i) {
                var id = fieldsArray[i];
                var elem = $(id);
                var type = "";
                var tagName = "";
                if (elem) {
                    if (elem.type)
                        type = elem.type.toUpperCase();
                    tagName = elem.tagName.toUpperCase();
                }

                if (id.substring(0, 2) == "c_") {
                    cbxHandler.disable(id, disable);
                } else if(Tools.def(cbxHandler.get(id)) && Tools.def(cbxHandler.get(id).alaAutoComplete)) {
                    cbxHandler.get(id).setDisabled(disable);
                } else if (type == "CHECKBOX" || type == "BUTTON" || tagName == "SELECT") {
                    $(id).disabled = disable;
                } else {
                    disableText($(id), disable);
                }
            }
        },

        /**
         * Возвращает значение поля. Если значение не найдено, то возвращает null
         * @param name : String имя поля
         * @param cbxHandler : ComboboxHandler обработчик комбобоксов
         */
        getValue: function(name, /*ComboboxHandler*/cbxHandler) {
            var value = null;
            var elem = $(name);
            var type = "";
            if (elem && elem.type)
                type = elem.type.toUpperCase();
            if (name.substring(0, 2) == "c_") {
                var cbxValue = cbxHandler.getSelectedValue(name);
                if (!Tools.def(cbxValue) || cbxValue == '-1')
                    value = "";
                else
                    value = cbxValue.strip();
            } else if(Tools.def(cbxHandler.get(name)) && Tools.def(cbxHandler.get(name).alaAutoComplete)){ // Списки с предзаполнением
                var comboBox = cbxHandler.get(name);
                //Нужно для startXml заполнять начальным значением, пока не загрузились данные комбика
                value = '' + comboBox.getValue() + '';
            } else if (type == "CHECKBOX") {
                value = Tools.getCheckboxValue(name);
            } else {
                if ($(name) == null)
                    throw Error("Element " + name + " missing on the page");
                value = $F(name);
            }
            return value;
        },

        /**
         * Возвращает значение поля из грида. Если значение не найдено, то возвращает null
         * @param name : String имя поля
         * @param cbxHandler : ComboboxHandler обработчик комбобоксов
         */
        getGridValue: function(rowId, name, cbxHandler, grid){
            var value = null;
            if (name.substring(0, 2) == "c_") {
                value = cbxHandler.getValueByLabel(name, grid.getCellValue(rowId, name));
                if (value == "-1")
                    value = "";
            } else {
                value = grid.getCellValue(rowId, name);
            }
            return value;
        },

        /**
         * Сравнивает текущее значение указанного поля в карточке с аналогичным полем в гриде.
         * true, если поля имеют одинаковые значения
         * @param name имя поля
         * @param cbxHandler обработчик комбобоксов
         * @param rowId номер строчки в гриде
         * @param grid грид
         */
        compareFormAndGridValue: function(name, /*ComboboxHandler*/cbxHandler, rowId, grid) {
            var formValue = trim(this.getValue(name, cbxHandler));
            var gridValue = trim(this.getGridValue(rowId, name, cbxHandler, grid));
            if (name.substring(0, 2) == "c_" && gridValue == "-1")
                gridValue = "";
            return  formValue == gridValue;
        },

        /**
         * Проверяет имеется ли значение указанное поле в гриде
         * @param name имя поля в гриде
         * @param cbxHandler обработчик комбиков
         * @param rowId id строчки
         * @param grid грид
         */
        isValueInGridNull: function(name, /*ComboboxHandler*/cbxHandler, rowId, grid){
            var gridValue = trim(this.getGridValue(rowId, name, cbxHandler, grid));
//            alameda.debug("isValueInGridNull: name=" + name, "row_id=" + rowId, "value=" + gridValue, "result="+(gridValue == '' || gridValue == null));
            return (gridValue == '' || gridValue == null);
        }
    },

    /**
     * Обработчик полей, где комбобоксы передаются как Hash
     * для  подержки старых страниц, где не используется обработчик комбобоксов
     */
     FieldsProcessorCbxHash : {
         /**
          * Заполнение строки грида из карточки
          * @param id id строки
          * @param fieldsArray : Array
          * @param combosHash : Hash
          * @param mygrid грид
          */
         fillGrid:function(/*id*/id, /*Array*/fieldsArray, /*Hash*/combosHash, /*grid*/mygrid) {
             for (var i = 0; i < fieldsArray.length; ++i) {
                 if (fieldsArray[i].substring(0, 2) == "f_") {
                     mygrid.setCellValue(id, fieldsArray[i], $(fieldsArray[i]).checked ? 1 : 0);
                 } else if (fieldsArray[i].substring(0, 2) == "c_") {
                     mygrid.setCellValue(id, fieldsArray[i], combosHash.get(fieldsArray[i]).getSelectedText());
                 } else {
                     mygrid.setCellValue(id, fieldsArray[i], $(fieldsArray[i]).value);
                 }
             }
         },

         /**
          * Заполнение карточки из грида
          * @param fieldsArray : Array массив с именами эллементов на странице, которые надо почистить
          * @param combosHash : Hash хеш с комбобоксами
          */
         fillForm: function(/*rowId*/rowId, /*Array*/fieldsArray, /*Hash*/combosHash, /*grid*/mygrid, /*boolean*/selectByValue) {
             for (var i = 0; i < fieldsArray.length; ++i) {
                 if (fieldsArray[i].substring(0, 2) == "f_") {
                     $(fieldsArray[i]).checked = (mygrid.getCellValue(rowId, fieldsArray[i]) == '1');
                 } else if (fieldsArray[i].substring(0, 2) == "c_") {
                     if(Tools.def(selectByValue)&&selectByValue){
                         combosHash.get(fieldsArray[i]).selectOptionByValue(TrimEmptyString(mygrid.getCellValue(rowId, fieldsArray[i])));
                     } else {
                         combosHash.get(fieldsArray[i]).selectOptionByText(TrimEmptyString(mygrid.getCellValue(rowId, fieldsArray[i])));
                     }
                 } else {
                     $(fieldsArray[i]).value = TrimEmptyString(mygrid.getCellValue(rowId, fieldsArray[i]));
                 }
             }
         },

        /**
         * Очистка полей
         * @param fieldsArray : Array массив с именами эллементов на странице, которые надо почистить
         * @param cbxHash : Hash хеш комбобоксов
         */
        clear: function(/*Array*/fieldsArray,/*Hash*/cbxHash) {
            for (var i = 0; i < fieldsArray.length; ++i) {
                if (fieldsArray[i].substring(0, 2) == "c_") {
                    var cbx = cbxHash.get(fieldsArray[i]);
                    if (Tools.def(cbx.defaultOption)) {
                        cbx.selectOption(cbx.defaultOption);
                    } else { // если дефолтовое значение комбика не определено, то сбрасываем к первому значению
                        cbx.selectOption(1);
                    }
                } else if (fieldsArray[i].substring(0, 2) == "f_") {
                    $(fieldsArray[i]).checked = false;
                } else {
                    $(fieldsArray[i]).value = "";
                }
            }
        },

         /**
          * Блокировка указанных полей
          * @param fieldsArray : Array массив с именами эллементов на странице, которые надо почистить
          * @param cbxHash : Hash хеш комбобоксов
          * @param disable : Boolean true - блокировать, false - разблокировать
          */
         disable: function(/*Array*/fieldsArray,/*Hash*/cbxHash,/*Boolean*/disable) {
             for (var i = 0; i < fieldsArray.length; ++i) {
                 if (fieldsArray[i].substring(0, 2) == "c_") {
                     cbxHash.get(fieldsArray[i]).disable(disable);
                 } else if (fieldsArray[i].substring(0, 2) == "f_" || fieldsArray[i].substring(0, 4) == "btn_") {
                     $(fieldsArray[i]).disabled = disable;
                 } else {
                     $(fieldsArray[i]).readOnly = disable;
                 }
             }
         },

         /**
         * Возвращает значение поля. Если значение не найдено, то возвращает null
         * @param name : String имя поля
         * @param cbxHash : Hash хеш комбобоксов
         */
        getValue: function(name, /*Hash*/cbxHash) {
            var value = null;
            if (name.substring(0, 2) == "c_") {
                value = "" + cbxHash.get(name).getSelectedValue() + "";
            } else if (name.substring(0, 2) == "f_") {
                value = Tools.getCheckboxValue(name);
            } else {
                value = $(name).value;
            }
            return value;
        },

         /**
          * Возвращает значение поля из грида. Если значение не найдено, то возвращает null
          * @param rowId : String строчка в гриде
          * @param name : String имя поля
          * @param cbxHash : Hash хеш комбобоксов
          */
         getGridValue: function(rowId, name, cbxHash, grid) {
             var value = null;
             if (name.substring(0, 2) == "c_") {
                 var cbx = cbxHash.get(name);
                 var label = grid.getCellValue(rowId, name);
                 var option = cbx.getOptionByLabel(label);
                 if (option != null) {
                     value = cbx.getOptionByLabel(label).value;
                 } else {
                     throw new Error("Для комбобокса [" + name + "] не найдено наименование [" + label + "]!");
                 }

             } else {
                 value = grid.getCellValue(rowId, name);
             }
             return value;
         }
    },

    /**
     * Сравнивает 2 строки как SWIFT-коды (с дополнением символами 'X' до длины 11)
     * @param swift1 -первый сравниваемый код
     * @param swift2 -второй сравниваемый код
     * @returns {boolean} true если строки равны с учетом расширения до 11 символов
     */
    isSwiftCodesEqual: function (swift1, swift2) {
        var xSwift1 = (swift1.length <= 11)?swift1 + "X".times(11-swift1.length): swift1,
            xSwift2 = (swift2.length <= 11)?swift2 + "X".times(11-swift2.length): swift2;
        return xSwift1 == xSwift2;
    },

    /**
     * Формирует полный депозитарный код из сокращенного
     * @param element_id id элемента, в котором содержится депозитарный код
     */
    makePersonCode: function( elementId ) {
        var result = "";
        if (Tools.def(elementId)) {
            result = $F(elementId).toLocaleUpperCase().strip();
            if ( ["N", "NDC", "NSD", "NRD", "НДЦ", "НРД" ].indexOf(result) != -1 ) {
                result = Tools.NDCCode;
            } else if (result == "323") {
                result = "MC0032300000";
            } else if (result == "25") {
                result = "MC0002500000";
            } else if (result == "55") {
                result = "MC0005500000";
            } else if (result == "7") {
                result = "MC0000700000";
            } else if (result == "5") {
                result = "MC0000500000";
            } else if (result == "2") {
                result = "MZ0000200000";
            } else if (result == "1") {
                result = "MC0000100000";
            } else if (result == "160") {
                result = "MC0016000000";
            } else if (result == "33") {
                result = "MC0003300000";
            } else if (result == "1408") {
                result = "GC0140800000";
            } else if (["CLR", "NCLR", "NC", "CL", "CLEAR", "CLEARING"].indexOf (result) != -1) {
                result = Tools.NDCCLRCode;
            } else if (result == "REPOS") {
                result = "CLRTESTREPOS";
            } else if (result == "CLI") {
                result = "NDC000CLI000";
            } else if (result == "APL") {
                result = "CLRTESTAPL01";
            } else if (result == "EM") {
                result = "EMTESTEPAM01";
            } else if (result == "NDEP") {
                result = "NDEP00000000"
            } else if (result == "TR") {
                result = "TRROSKAZNA01"
            }
            $(elementId).setValue ( result );
        }
        return result;
    },

    /**
     * Функция, дополняющая код до определенной длины справа/ Пустая строка не расширяется
     * @param source    исходная строка
     * @param length    длина, до которой нужно расширить исходную (по умолчанию - 12)
     * @param extender  строка из одного символа, которой нужно расширить исходную (по умолчанию - "0")
     * @return {*}
     */
    appendCode: function(source, length, extender) {
        var result = (Tools.def(source))?source : '';
        var srcLen = result.length;
        var newLen = (Tools.def(length))?length : 12;
        var extStr = (Tools.def(extender))?extender : '0';
        if (extStr.length == 1 && result.length > 0)
            for (var i = 1; i <= newLen - srcLen; i++)
                result += extStr;
        return result;
    },

    /**
     * Возвращает значение комбобокса
     * Если комбобокс заблокирован, то возвращает null
     * @param name
     */
    getCheckboxValue: function(/*String*/name) {
        if ($(name).readAttribute("checkedVal") == null || $(name).readAttribute("uncheckedVal") == null) {
            // атрибут "skipOnDisable" говорит о том, что задизабленный чекбокс не надо обрабатывать при формировании xml
            if ($(name).disabled && $(name).readAttribute("skipOnDisable") != null) {
                return "";
            } else {
                return $(name).checked ? "1" : "0";
            }
        } else {
            return $(name).checked ? $(name).readAttribute("checkedVal") : $(name).readAttribute("uncheckedVal");
        }
    },

    inputToUpper: function (/*String*/ fieldName) {
        var elem = $(fieldName);
        if (Tools.def($(elem))) {
            elem.value = elem.value.strip().toLocaleUpperCase();
        }
    },

    checkMaxLength: function (/*Node*/node, /*int*/maxLength) {
        if ($F(node).length > maxLength) {
            $(node).value = $F(node).substring(0, maxLength);
        }
    },

    checkTextAreaLength: function(elem, maxlength) {
        if (!Tools.def(elem))
            return;
        if (elem.value.length > maxlength){
            elem.addClassName('incorrect_multiline');
            elem.title = 'Для данного поля разрешен ввод не более чем ' + maxlength + ' символов! Вами ' + Tools.getCounterWord(elem.value.length);
        }
        else {
            elem.removeClassName('incorrect_multiline');
            elem.title = '';
        }
    },

    getCounterWord: function(amount) {
        var word1 = "введено ";
        var word2;

        var rem10 = amount % 10,
            rem100 = amount % 100;
        if ( (rem100 >= 11 && rem100 <= 19) ||
            rem10 == 0 ||
            (rem10 >= 5 && rem10 <= 9) ) {
            word2 = ' символов';
        } else if (rem10 == 1) {
            word1 = 'введен ';
            word2 = ' символ';
        } else {
            word2 = ' символа';
        }
        return word1 + amount + word2;
    },

    /**
     * Установка нового значения для <textarea> через код
     * @param elementId : String значение параметра id
     * @param newValue : String новое значение параметра value
     * @param maxLength : int максимально допустимое количество символов в параметре value
     */
    setTextAreaValue: function(elementId, newValue, maxLength){
        if(!Tools.def($(elementId))) return;
        $(elementId).value = newValue;
        Tools.checkTextAreaLength($(elementId), maxLength);
    },

    /**
     * Combobox initialization for DIV node with specifyed data
     * @param nodeName div id
     * @param optionsArray options array in format [{value:"key1",text:"text1"},{value:"key2",text:"text2"}]
     * @param defaultOptionIndex default option index. Тут указывается именно индекс эллемента в массиве, а не его значение в поле value!
     * @param cbxWidth : int combo width
     */
    createComboBoxDivFromArray: function(nodeName, optionsArray, defaultOptionIndex, cbxWidth) {
        var cBox = new dhtmlXCombo(nodeName, nodeName, Tools.def(cbxWidth) ? cbxWidth : 300);
        this.initializeExistentComboBox(cBox, optionsArray, defaultOptionIndex);

        return cBox;
    },

    /**
     * Existent comboBox common initialization with specified data.
     * @param cBox dhtmlXCombo
     * @param optionsArray options array in format [{value:"key1",text:"text1"},{value:"key2",text:"text2"}]
     * @param defaultOptionIndex default option index
     */
    initializeExistentComboBox: function (cBox, optionsArray, defaultOptionIndex) {
        cBox.clearAll(false);
        if (Object.isArray(optionsArray)) {
            optionsArray._each(function (value) {
                cBox.addOption(value.value, value.text);
            });
            cBox.enableOptionAutoHeight(1);
            cBox.readonly(true);
            cBox.selectOption(defaultOptionIndex);
            cBox.defaultOption = defaultOptionIndex;
        } else {
            throw new Error("Не верный аргумент для метода initComboBoxDivFromArray");
        }
    },

    /**
     * Combobox initialization for DIV node with specified data
     * @param cBox dhtmlXCombo
     * @param nodeName div id
     * @param optionsArray options array in format [["val1","text1"],["val2","text2"]]
     * @param defaultOptionIndex default option index
     * @param cbxWidth : int combo width
     */
    createComboBoxDivFromArrayInExistsCbx2: function(cBox, nodeName, optionsArray, defaultOptionIndex, cbxWidth) {
        optionsArray = this.convertOptionsArray(optionsArray);
        this.initializeExistentComboBox(cBox, optionsArray, defaultOptionIndex);

        return cBox;
    },

    /**
     * Combobox initialization for DIV node with specified data. Accepts another options array format
     * @param nodeName div id
     * @param optionsArray options array in format [["val1","text1"],["val2","text2"]]
     * @param defaultOptionIndex default option index
     * @param cbxWidth : int combo width
     */
    createComboBoxDivFromArray2: function(nodeName, optionsArray, defaultOptionIndex, cbxWidth) {
        return this.createComboBoxDivFromArray(nodeName,this.convertOptionsArray(optionsArray),defaultOptionIndex, cbxWidth);
    },

    /**
     * Конвертирует массив в формат пригодный для формирования комбиков
     * @param etinFormat массив в формате Этина [["value","text"],["value","text"]]
     */
    convertOptionsArray: function(/*Array*/etinFormat){
        if(Object.isArray(etinFormat)){
            var newArray = $A();
            etinFormat.each(function(elem){
                if(elem[0] == -1){
                    elem[1] = "&nbsp;";
                }
                newArray.push({value:elem[0],text:elem[1]});
            });
            return newArray;
        }else{
            throw new Error("etinFormat не являтся массивом");
        }
    },

    /**
     * Combobox initialization for DIV node with data from servlet
     * @param nodeName              : String div id
     * @param comboServletName      : String servlet name for data loading
     * @param defaultOptionIndex    : int default option for selection index
     * @param nonSelectText         : text of additional option with -1 value, null if no such option
     * @param cbxLoadCallBack       : Function callback after data loading completed [optional]
     * @param cbxWidth              : int combo width
     * @param async                 : Boolean is request async or not. True by default true
     * @param nonSelectValue        : Value for empty combobox option. -1 by default
     */
    createComboBoxDivFromServlet: function(nodeName, comboServletName, defaultOptionIndex, nonSelectText,
                                           cbxLoadCallBack, cbxWidth, async, nonSelectValue) {
        var cBox = new dhtmlXCombo(nodeName, nodeName, Tools.def(cbxWidth) ? cbxWidth : 300);
        cBox.loadXML2(addUn('Ctrl?name=' + comboServletName), function() {
            if (Tools.def(nonSelectText)) {
                if (nonSelectText == "" || nonSelectText == " ") {
                    nonSelectText = "&nbsp;";
                }
                nonSelectValue = Tools.def(nonSelectValue) ? nonSelectValue : -1;
                cBox.addOption(nonSelectValue, nonSelectText);
            }
            if (Tools.def(defaultOptionIndex))
                cBox.selectOption(defaultOptionIndex);

            if (Tools.defFunc(cbxLoadCallBack))
                cbxLoadCallBack();

        }, Tools.def(async) ? async : true);

        cBox.enableOptionAutoHeight(1);
        cBox.readonly(true);
        cBox.selectOption(defaultOptionIndex);
        cBox.defaultOption = defaultOptionIndex;

        return cBox;
    },

    /**
     * Регистрирует для указанных полей и кнопки вызов справочника "Поиск юр/физ лиц"
     * Если указан параметр depCode - код депозитария, то в справочнике возможен выбор лица
     * только из указанного депозитария
     * @param dest_field_pref префикс для полей, куда складывать значения или объект (см. _fillData)
     * @param buttonId id кнопки, на которую вешается событие
     * @param depCode код депозитария. не обязательный параметр. может быть = null
     * @param isOrganization Boolean поиск по юр лицам
	 * @param params additional parameters
     * @param afterLoadingCallback функция, вызываемая после заполнения полей на форме
     */
    registerSelectPerson: function(/*String*/dest_field_pref, /*String*/buttonId, /*String*/depCode,
                    /*Boolean*/isOrganization, /*Hash or Object*/ params, /*Function*/afterLoadingCallback ) {
        var data = new Hash({name:"person_search", search:true});
        if (Tools.def(depCode) && !depCode.strip().blank())
            data.set('subdep', depCode);
        if (Tools.def(isOrganization) && isOrganization)
            data.set('person_type', "j");
		data = data.merge(params);
        Event.observe(buttonId, "click", this._fillData.bind(window, data, dest_field_pref, afterLoadingCallback));
    },

    /**
     * Регистрирует для указанных полей и кнопки вызов справочника "Поиск юр/физ лиц"
     * Параметр subdepFieldId
     * @param destFieldPref префикс для полей, куда складывать значения или объект (см. _fillData)
     * @param buttonId id кнопки, на которую вешается событие
     * @param subdepFieldId задает идентификатор поля, откуда берется код субдепозитария
     * @param isOrganization : Boolean поиск по юр лицам
     */
    registerSelectPersonInSubdep: function (/*String*/destFieldPref, /*String*/buttonId, /*String*/subdepFieldId, /*Boolean*/isOrganization) {
        var data = new Hash({name:"person_search", search:true});
        if (Tools.def(subdepFieldId) && !subdepFieldId.strip().blank())
            data.set('subdepField', subdepFieldId);
        if (Tools.def(isOrganization) && isOrganization)
            data.set('person_type', "j");
        Event.observe(buttonId, "click", this._fillDataWithSubdep.bind(this, data, destFieldPref));
    },

    _fillDataWithSubdep: function (/*Hash*/data, /*String*/destFieldPref) {
        var subdepField = data.get("subdepField");
        if (Tools.def(subdepField)) {
            var subdep = $F(subdepField);
            if ( Tools.def(subdep))
                data.set('subdep', subdep);
        }
        this._fillData(data, destFieldPref);
    },

    /**
     * Функция выполняет открытие окна, как правило сложного справочнкиа с параметрами поиска и
     * раскладывает возвращенные данные в стандартный набор полей - id, code, name
     * @param data хеш с данными об открываемомо окне
     * @param kind префикс полей в которые класть результирующие данные либо объект со структурой {id : "", code: "", name: "", full_name: ""}
     * @param afterLoadingCallback функция, вызываемая после заполнения полей на форме
     */
    _fillData: function(/*Hash*/data, /*String*/kind, /*Function*/afterLoadingCallback) {
        var respString = showChild(data);
        // поля id может не быть
        var idNode = null;
        var codeNode = null;
        var nameNode = null;
        var fullNameNode = null;
        var afterSetCallback = (Tools.defFunc(afterLoadingCallback))? afterLoadingCallback: null;

        if (Object.isString(kind)) {
            if (!Object.isUndefined($(kind + '_id')) && $(kind + '_id') != null) {
                idNode = $(kind + '_id');
            }
            // поле для кода может быть 2-х типов
            codeNode = ($(kind) || $(kind + '_code'));
            nameNode = $(kind + '_name');
        } else {
            if (Object.isUndefined(kind) || kind == null) {
                throw new Error("Tools._fillData(): параметр kind не определен. Обратитесь к разработчикам.");
            } else {
                if (Tools.def(kind["code"])) {
                    codeNode = $(kind["code"]);
                    if (Tools.def(kind["name"])) {
                        nameNode = $(kind["name"]);
                    }
                    if (Tools.def(kind["id"])) {
                        idNode = $(kind["id"]);
                    }
                    if (Tools.def(kind["full_name"])) {
                        fullNameNode = $(kind["full_name"]);
                    }
                    if (afterSetCallback != null && Tools.defFunc(kind.afterSet)) {
                    	afterSetCallback = kind.afterSet;
                    }
                } else {
                    throw new Error("Tools._fillData(): параметр kind имеет не верную структуру. Обратитесь к разработчикам.");
                }
            }
        }

        var idVal = '';
        var codeVal = '';
        var nameVal = '';
        var fullNameVal = '';

        if (!Object.isUndefined(respString) && respString != null) {
            var respData = null;
            if(typeof respString == 'object'){
                // для случая, когда данные возвращаются из окна следующим методом
                // window.returnValue = ret.toObject();
                respData = respString;
            }else{
                // window.returnValue = h.toJSON();
                respData = respString.evalJSON(true);
            }
            if (respData != null && typeof respData == 'object') {
                idVal = (respData['rowid'] || respData['id']);
                codeVal = respData['code'];
                nameVal = respData['name'];
                fullNameVal = respData['full_name'];
//                alert("idVal = " + idVal +"; codeVal = " + codeVal + "; nameVal=" + nameVal);
            } else {
                alert("Объект имеет недопустимую структуру");
            }

            // заполняем данными
            if (idNode != null) {
                idNode.value = idVal;
            }
            if (nameNode != null) {
                nameNode.value = nameVal;
            }
            if (fullNameNode != null) {
                fullNameNode.value = fullNameVal;
            }
            codeNode.value = codeVal;

            //коллбэк тут
            if(Tools.defFunc(afterSetCallback)){
                afterSetCallback(respData);
            }
        }else{
            // закрыли окно не выбрав ничего
        }
    },

    /**
     * Регестрирует для указанных полей и кнопки вызов справочника "Ценные бумаги"
     * Если указан параметр depCode - код депозитария, то в справочнике возможен выбор лица
     * только из указанного депозитария
     * @param dest_field_desc описание полей для результатов
     * @param buttonId id кнопки, на которую вешается событие
     */
    registerFiSelection: function(/*String*/dest_field_desc, /*String*/buttonId) {
        var data = new $H({name:"fi",search:"1"});
        Event.observe(buttonId, "click", this._fillData.bind(window, data, dest_field_desc));
    },
    /**
     * Регестрирует для указанных полей и кнопки вызов справочника "Ценные бумаги" в коротком представлении
     * @param dest_field_desc описание полей для результатов
     * @param buttonId id кнопки, на которую вешается событие
     */
    registerFiShortSelection: function(/*String*/dest_field_desc, /*String*/buttonId) {
        var data = new $H({name:"rb_list_fi_short"});
        Event.observe(buttonId, "click", this._fillData.bind(window, data, dest_field_desc));
    },

    /**
     * Проверяет, является ли объект определенным и не равен null, т.е. существует реальный объект
     * @param obj объект для проверки
     */
    def: function(obj){
        return (!Object.isUndefined(obj) && obj != null);
    },

    /**
     * Проверяет, является ли объект определенным и не равен null, т.е. существует реальный объект
     * и является ли объект функцией
     * @param obj объект для проверки
     */
    defFunc: function(obj){
        return (!Object.isUndefined(obj) && obj != null && Object.isFunction(obj));
    },

    /**
     * Проверяет, является ли объект существующим и функцией, если так, то выполняет её
     * @param obj объект для проверки
     */
    invokeIfDef: function(obj){
        if(this.def(obj) && Object.isFunction(obj)){
            obj();
        }
    },

    setRequired: function(/*String*/name,/*Boolean*/req){
        if(req){
            $(name).addClassName("required");
        }else{
            $(name).removeClassName("required");
        }
    },

    setDisabled: function(/*String*/name,/*Boolean*/dis){
        $(name).disabled = dis
    },

    /**
     * Показать/ снять экран с индикацией загрузки страницы
     * @param show true - показать, false - снять
     */
    showLoading: function(/*Boolean*/show) {
        if (Tools.def(window["LoadingWarning"])) {
            window["LoadingWarning"].displayLoadingWarning(show);
        }
    },

    /**
     * Выполянет синхронный запрос с указанными параметрами и возвращает boolean результат
     * @param data хеш с параметарми запроса
     */
    getBooleanSync:function(/*Hash*/data) {
        var result = false;
        alameda.ajaxRequest("Ctrl", {
            parameters:data,
            asynchronous: false,
            onSuccess:function(transport) {
                var json = transport.responseText.evalJSON(true);
                if (!json.error) {
                    result = json["result"];
                } else {
                    alert(json.error);
                }
            }
        }, alameda.AjaxRequestMode.GET);
        return result;
    },

    appendTagVal: function(base, tagname, tagvalue, needEscape) {
        var tv = tagvalue.strip();
        var es = Object.isUndefined(needEscape) ? true : (!needEscape ? false : true);
        if (tv != '')
            return base + "<" + tagname + ">" + (es ? Tools.escapeXML(tv) : tv) + "</" + tagname + ">";
        else
            return base;
    },

    escapeXML:function (s) {
        var res = '';
        for (var i = 0; i < s.length; ++i) {
            var c = s.charAt(i);
            if (c == '<')
                res += '&lt;';
            else if (c == '>')
                res += '&gt;';
            else if (c == '"')
                    res += '&quot;';
                else if (c == '\'')
                        res += '&apos;';
                    else if (c == '&')
                            res += '&amp;';
                        else
                            res += c;
        }
        return res;
    },

    /**
     * Блокирует все еллементы, входящие в состав входящего массива в том числе обабатывает input и div элементы
     * @param elems : Array массив эллементов, которые надо заблокировать
     * @param keepStates : Boolean true - схранить состояния блокировки, false или undefined - не сохранять
     */
    disableElements: function(/*Array*/elems, /*Boolean*/keepStates){
        if (elems != null) {
            var disableElem = function(elem) {
                if ($(elem).tagName.toLowerCase() == "div") {
                    $(elem).select('ru.ncd.input').each(disableElem);
                } else {
                    if (Tools.def(keepStates) ? keepStates : false) {
                        alameda.debug("disableElements: elem="+elem+"; disabledState=" + $(elem).disabled);
                        var existsState = $(elem).readAttribute("disabledState");
                        // перезаписываем, только в случае, когда состояние сброшено
                        if(!Tools.def(existsState) || existsState == -1){
                            $(elem).writeAttribute("disabledState", $(elem).disabled ? 1 : 0);
                        }
                    }
                    $(elem).disabled = true;
                }
            };
            elems.each(disableElem);
        }
    },

    /**
     * Разблокирует все еллементы, входящие в состав входящего массива в том числе обабатывает input и div элементы
     * @param elems : Array массив эллементов, которые надо заблокировать
     * @param useKeptStates : Boolean true - вернуть сохраненные состояния, false или undefined - не возвращать
     */
    undisableElements: function(/*Array*/elems, /*Boolean*/useKeptStates){
        if (elems != null) {
            var disableElem = function(elem) {
                if ($(elem).tagName.toLowerCase() == "div") {
                    $(elem).select('ru.ncd.input').each(disableElem);
                } else {
                    if (Tools.def(useKeptStates) ? useKeptStates : false) {
                        var keptState = $(elem).readAttribute("disabledState");
                        alameda.debug("undisableElements: elem="+elem+"; keptState=" + keptState);
                        // keptState == -1 означает, что для этого эллемента уже выставили изначальное состояние
                        if (keptState != -1) {
                            $(elem).disabled = Tools.def(keptState) ? keptState == 1 : false;
                            // сбрасываем значение
                            $(elem).writeAttribute("disabledState", -1);
                        }

                    }else{
                        $(elem).disabled = false;
                    }
                }
            };
            elems.each(disableElem);
        }
    },

    DAO : {
        /**
         * Набор методов для доступа к данным по счету депо
         */
        DepoAccount:{
            /**
             * Return depositary by account number. Asynchronous request!
             *
             * @param accountNumber account number
             * @param callBackResult call back function for asynchronous request
             * @param callBackContext callback function context. 'this' if undefined
             */
            getDepositaryByAccountNumber: function(/*String*/accountNumber, /*Function*/callBackResult, /*Object*/callBackContext) {

                var errorMessage = "При попытке запроса депозитария по номеру счета произошла ошибка:\n";

                var data = {
                    name: "query_get_depo_account_details",
                    depo_acc_num: accountNumber
                };

                alameda.ajaxRequest("Ctrl", {
                    parameters:data,
                    onSuccess:function(transport) {
                        var json = transport.responseJSON;
                        if (!json.error) {
                            callBackResult.call(Object.isUndefined(callBackContext) ? this : callBackContext, json);
                        }
                        else {
                            alert(errorMessage + json["error"]);
                        }
                    }
                }, alameda.AjaxRequestMode.GET);
            },

            /**
             * Возвращает депозитарный код владельца указанного счета
             * @param accountNumber номер счета
             * @param im_id input message id по нему определяется депозитарий получатяля поручения
             * @param callBackResult колбэк
             */
            getAccountOwnerByAccountNumberAndImId: function(/*String*/accountNumber, /*String*/im_id, /*Function*/callBackResult) {

                var errorMessage = "При попытке запроса владельца счета по номеру счета произошла ошибка:\n";

                var params = $H();
                params.set("name", "query_deponent_by_account_number");
                params.set("code", accountNumber);
                params.set("im_id", im_id);
                params.set("names", ["code","im_id"]);

                alameda.ajaxRequest("Ctrl", {
                    parameters:params,
                    onSuccess:function(transport) {
                        var json = transport.responseJSON;
                        if (!json.error) {
                            callBackResult(json);
                        }
                        else {
                            alert(errorMessage + json["error"]);
                        }
                    }
                }, alameda.AjaxRequestMode.GET);
            },
            /**
             * Возвращает депозитарный код владельца указанного счета
             * @param accountNumber номер счета
             * @param accountNumber : Hash хеш соответсвий имен объектов, которые возвращаются из запроса и имен полей
             * @param callBackResult колбэк
             * @param async как выполнять запрос, сихронно или аснихронно
             */
            getAccountOwnerByAccountNumber: function(/*String*/accountNumber,/*Hash*/resultFields,/*Function*/callBackResult, /*boolean*/async) {

                if (!Tools.def(async)){
                    async = true;
                }

                if(Tools.def(resultFields)){
                    callBackResult = function (/*Object*/json) {
                        var dataExists = false;
                        resultFields._each(function(pair){
                            if(json[pair.key]){
                                $(pair.value).value = json[pair.key];
                                dataExists = true;
                            }else{
                                $(pair.value).value = "";
                            }
                        });
                        if (!dataExists) {
                            if (json["error"]) {
                                alert("Во время поиска депонента по номеру счета произошла ошибка. \n" + json["error"]);
                            } else {
                                alert("Не удалось найти депонента по указанному номеру счета!");
                            }
                        }
                    };
                }else{
                      if(Tools.def(callBackResult)){
                          if (!Object.isFunction(callBackResult)) {
                              throw new Error("Аргумент 'callBackResult' для функции Tools.DAO.DepoAccount.getAccountOwnerByAccountNumber(), должен быть функцией!");
                          }
                      }else{
                          throw new Error("Не верный аргумент функции Tools.DAO.DepoAccount.getAccountOwnerByAccountNumber()");
                      }
                }

                var errorMessage = "При попытке запроса владельца счета по номеру счета произошла ошибка:\n";

                var params = $H();
                params.set("name", "query_deponent_by_account_number_2");
                params.set("code", accountNumber);
                params.set("names", ["code"]);

                alameda.ajaxRequest("Ctrl", {
                    asynchronous:async,
                    parameters:params,
                    onSuccess:function(transport) {
                        var json = transport.responseJSON;
                        if (!json.error) {
                            callBackResult(json);
                        }
                        else {
                            alert(errorMessage + json["error"]);
                        }
                    }
                }, alameda.AjaxRequestMode.GET);
            },

            /**
             * Проверяет, что указанный номер счета существует в системе
             * @param accountNumber номер счета для проверки
             * @param depositary код депозитария в котором искать номер счета
             * @param onlyOpened только открытый счет, false - просто наличие счета
             */
            isAccountExistsInDepos:function(/*String*/accountNumber,/*String*/depositary, /*Boolean*/onlyOpened) {
                var result = null;
                var servletName = (Tools.def(onlyOpened) && onlyOpened) ? "query_open_account_exists" : "query_account_exists";
                alameda.ajaxRequest("Ctrl", {
                    parameters:$H({name:servletName, accountNumber:accountNumber,
                        depositary:depositary,names:["accountNumber","depositary"]}),
                    asynchronous: false,
                    onSuccess:function(transport) {
                        var json = transport.responseJSON;
                        if (!json.error) {
                            result = json["result"];
                        }
                        else {
                            alert(json["error"]);
                        }
                    }
                }, alameda.AjaxRequestMode.GET);

                return result;
            },

            /**
             * Проверяет, что указанный номер раздела счета существует в системе для указанного депозитария и указанного счета
             * @param accountNumber номер счета для проверки
             * @param accountNumber номер счета для проверки
             * @param depositary код депозитария в котором искать номер счета
             * @param onlyOpened true - только открытый раздел (счет тоже должен быть открыт), false - просто наличие
             */
            isSectionExistsInDeposAndAccount:function(/*String*/sectionNumber,/*String*/accountNumber,/*String*/depositary, /*Boolean*/onlyOpened) {
                var result = null;
                var servletName = (Tools.def(onlyOpened) && onlyOpened) ? "query_open_section_exists" : "query_section_exists";
                alameda.ajaxRequest("Ctrl", {
                    parameters:$H({name:servletName, accountNumber:accountNumber, sectionNumber: sectionNumber,
                        depositary:depositary,names:["accountNumber","sectionNumber","depositary"]}),
                    asynchronous: false,
                    onSuccess:function(transport) {
                        var json = transport.responseJSON;
                        if (!json.error) {
                            result = json["result"];
                        }
                        else {
                            alert(json["error"]);
                        }
                    }
                }, alameda.AjaxRequestMode.GET);

                return result;
            }
        },

        /**
         * доступ к данным ценных бумаг
         */
        SecuritiesDao: {

            /**
             * Проверяет наличие кода ц.б. в справочнике
             *
             * @param fiCode код ц.б.
             * @returns {*}
             */
            isFiCodeExistsInRefbook: function(fiCode) {
                var result = null;
                var params = $H();
                params.set('name', 'qry_get_fi_by_code');
                params.set('names', ['code']);
                params.set('code', fiCode);
                alameda.ajaxRequest("Ctrl", {
                    method:'post',
                    asynchronous: false,
                    parameters: params,
                    onSuccess:function(transport){
                        var json = transport.responseJSON;
                        if (json['error']) {
                            alert(json['error']);
                        } else {
                            result = Tools.def(json["id"]);
                        }
                    }
                }, alameda.AjaxRequestMode.GET);

                return result;
            }
        },

        /**
         * доступ к общим данным
         */
       GeneralDAO: {
           isKLDOpened: function() {
               var result = null;
               alameda.ajaxRequest("Ctrl", {
                   parameters:$H({name:"srv_is_kld_opened"}),
                   asynchronous: false,
                   onSuccess:function(transport) {
                       var json = transport.responseJSON;
                       if (!json.error) {
                           result = json["result"];
                       }
                       else {
                           alert(json["error"]);
                       }
                   }
               }, alameda.AjaxRequestMode.GET);

               return result;
           }
       }
    },

    /**
     * Открывает окно в котором будет открыт отчет. Решает проблему названия окна.
     * @param id id сущности, для которой открывается отчет
     * @param servletName имя сервлета
     * @param pageTitle заголовок окна
     */
    openPdfReport: function(/*int*/id, /*String*/servletName, /*String*/pageTitle) {
        var data = $H({
            name: 'frm_paper_form_canvas',
            id: id,
            reportName: pageTitle,
            servlet: servletName,
            open_type: "inline"
        });
        openModelessWindow("Ctrl?" + data.toQueryString(), "paperorder" + id);
    },

    /**
     * Открывает окно в котором будет открыт отчет. Решает проблему названия окна.
     * Позволяет передавать много параметров в сервлет с отчетом
     * @param servletName имя сервлета
     * @param pageTitle заголовок окна
     * @param params хеш дополнительных параметров для отчета
     */
    openPdfReport2: function(/*String*/servletName, /*String*/pageTitle, /*Hash*/params) {
        var data = $H({
            name: 'frm_paper_form_canvas',
            reportName: pageTitle,
            servlet: servletName,
            open_type: "inline" // открываем в браузере
        }).merge(params);
        alameda.debug(data);
        openModelessWindow("Ctrl?" + data.toQueryString(), "paperorder" + new Date().getTime());
    },

    /**
     * Загружает pdf с отчетом на страницу и отправляет его на печать
     * @param id rmm_id отчета
     */
    printPdfReport: function(/*Integer*/id) {
    	var params = $H({
    		name: 'srv_report_pdf_print',
    		rmm_id: id
    	});

    	alameda.ajaxRequest("Ctrl", {
    		onCreate: function() {
    			Tools.showLoading(true);
    		},
    		parameters: params,
    		onSuccess: function(response) {
    			var json = response.responseJSON;
    			if (json['error']) {
    				alert(json['error']);
    			} else {
    				params.unset('rmm_id');
    				params.set('key', json.key);
    				var src = "Ctrl?" + params.toQueryString();
    	            var obTagId = 'pdfobjecttag_' + id;
    	            var elem = $(obTagId);
    	            if (elem != null) elem.remove();
    	            elem = new Element('object', {id: obTagId, data: src, type: 'application/pdf', width: 0, height: 0});
    	            $(document.body).insert(elem);

    	            function print() {
    	            	try {
    	            		elem.printAll();
    	            		Tools.showLoading(false);
    	            	} catch(e) {
    	            		setTimeout(print, 1000);
    	            	}
    	            }

    	            //we don't have event, saying that document is loaded
    	            //so wait until we can show print dialog to the user
    	            print();
    			}
    		},
    		onComplete: function() {
    			Tools.showLoading(false);
    		},
    		onFailure: function() {
    			Tools.showLoading(false);
    		}
    	});
    },

    /**
     * Печать отчетов по указанному
     * @param rmmIds
     * @param issue_report надо ли проставлять признак 'выдан отчет'
     */
    printPdfByRmmIds: function(/*Array*/rmmIds, grid, issue_report) {
        Tools.showLoading(true);
        var h = $H();
        // индекс, который был распечатан
        var printedIndex = 0;
        // всего количество отчетов
        var elemsAtAll = rmmIds.size();
        // признак, чтобы ошибки отчетов
        var errors = "";
//        alameda.debugInvisibly("Всего отчетов:", elemsAtAll);
        function print() {
            try {
                var elem = h.get(printedIndex);
                if(!Tools.def(elem.error)){
                    // означает, что отчет удалось создать
                    // если elem == null, то вылетит в catch, что нам и надо
                    elem.printAll();
                } else {
                    errors += grid.getCellValue(elem.rmmId, 'order_reg_num') + ", ";
                }

                // значит можно печатать следующий отчет
                printedIndex++;
//                alameda.debugInvisibly("printedIndex = ", printedIndex);
                // условие, что распечатали всё
                if (printedIndex == elemsAtAll) {
                    Tools.showLoading(false);
                    if (errors != "") {
                        // значит были ошибки
                        alert("Не удалось распечатать отчеты со следующими рег. номерами: \n" + errors);
                    }
                    setTimeout(function() {
                        // удаляем все объекты со страницы
                        h.values().each(function(el) {
                            try {
                                el.remove();
                            } catch(e) {
                            }
                        });
                    }, 5000);

                }else{
                    // печать ещё не закончена
                    print();
                }
            } catch(e) {
                setTimeout(print, 500);
            }
        }

        print();

        var i=0;
        rmmIds.each(function(elem){
            var o = this._printPdfReport2(elem, issue_report, h, i);
            i++;
        }, this);
    },

    /**
     * Формирует тег с отчетом на страницу
     * @param id rmm_id отчета
     * @param issue_report надо ли проставить признак "выдан отчет"
     */
    _printPdfReport2: function(/*Integer*/id, /*boolean*/issue_report, /*Hash*/hash, /*int*/index) {
    	var params = $H({
    		name: 'srv_report_pdf_print',
    		rmm_id: id
    	});

    	alameda.ajaxRequest("Ctrl", {
            asynchronous:true,
    		parameters: params,
    		onSuccess: function(response) {
    			var json = response.responseJSON;
    			if (json['error']) {
                    elem = {rmmId:id, error:json['error']};
    			} else {
//    				params.unset('rmm_id');
    				params.set('key', json.key);
    				params.set('issue_report', issue_report);
    				var src = "Ctrl?" + params.toQueryString();
    	            var obTagId = 'pdfobjecttag_' + id;
    	            elem = $(obTagId);
    	            if (elem != null) elem.remove();
    	            elem = new Element('object', {id: obTagId, data: src, type: 'application/pdf', width: 0, height: 0});
    	            $(document.body).insert(elem);
                    hash.set(index, elem);
    			}
    		}
    	});
    },
    /**
     * Перемещает курсор в конец поля ввода TextArea или Input.
     * @param inputObject
     */
    moveCaretToEnd: function (inputObject) {
        if (Prototype.Browser.IE) {
            if (inputObject.createTextRange)
            {
                var r = inputObject.createTextRange();
                r.collapse(false);
                r.select();
            }
        }else if(Prototype.Browser.Gecko){
            if (inputObject["selectionStart"])
            {
                var end = inputObject.value.length;
                inputObject.setSelectionRange(end, end);
                inputObject.focus();
            }
        }
    },

    /**
     * Обработчик нажатия кнопок для полей-загрузчиков файлов
     * Блокирует нажатия всех кнопок кроме перечисленных в коде
     * @param event
     */
    onInputUploadKeyPress: function(event) {
        switch (event.keyCode) {
            case Event.KEY_TAB:
            case Event.KEY_LEFT:
            case Event.KEY_RIGHT:
            case Event.KEY_END:
            case Event.KEY_HOME:
                return;
            case Event.KEY_DELETE:
                var element = Event.element(event);
                element.value = "";
                return;

            default:
                Event.stop(event);
        }
    },

    /**
     * Заменяет входную строку на звездочки.
     * количество звездочек совпадает с количеством символов в исходной строке
     * @param value входная строка
     */
    replaceToStars: function (/*String*/value){
        if(!Tools.def(value)){
            throw new Error("Tools.replaceToStars() argument should'n be null");
        }else{
            return "*".times(value.length);
        }
    },

    refbookBtnClicked: function(refbookName, idFieldName, codeFieldName, nameFieldName, dynamic){
        var ar = ['rowid', 'code', 'item_name'];
        var d = Tools.def(dynamic) ? dynamic : false;
        var res;
        if(d)
            res = listView(refbookName, ar, null, 1);
        else
            res = listView(refbookName, ar);
        if (!res.get('cancel')){
            $(idFieldName).value = res.get('rowid');
            $(codeFieldName).value = res.get('code');
            $(nameFieldName).value = res.get('item_name');
        }
    },

    /**
     * Сохраняет указанные данные в сессии.
     * @param sessionAttrName имя атрибута с данными в сессии
     * @param data данные в виде строки
     */
    keepDataToSession: function(/*String*/sessionAttrName, /*Object*/data) {
        alameda.ajaxRequest("Ctrl", {
            asynchronous: false,
            method: "post",
            parameters:$H({name:"srv_set_data_to_session", data:data, attrName:sessionAttrName}),
            onSuccess:function(transport) {
                var json = transport.responseText.evalJSON(true);
                if (json.error) {
                    alert('При попытке сохранения данных в сессию произошла ошибка:\n' + json.error);
                }
            }
        }, alameda.AjaxRequestMode.EDIT);
    },

    /**
     * Параметры, которые формируют текущее состояние грида
     * @param _grid грил
     * @param servletName имя сервлета
     * @param queryParams параметры для грида
     */
    getParametersForGrid: function(_grid, servletName, queryParams) {
        // отмененные галки
        var unselrowIds = _grid.getUnselectedRowIdsInArray();
        // уникальное имя атрибута для хранения в сессии параметра с массивом id-ков
        var selectionIdAN = addUn(servletName) + "ids";
        // уникальное имя атрибута для хранения в сессии дополнительных параметров
        var extraParamsAN = addUn(servletName) + "extr";

        // параметры запроса
        var params = $H({recordIds: selectionIdAN, name:servletName});

        // доп. параметры. кладем в сессию
        var params2 = $H();
        // флаг показывает, что используется режим "выбраны все"
        params2.set("selectAll", true);
        // сбрасываем параметр, ограничивавющий выборку
        params2.set("count", -1);
        if (unselrowIds != null && unselrowIds.length > 0) {
            // сохраняем отмененные id-шники строк в сессию по имени атрибута
            Tools.keepDataToSession(selectionIdAN, new Array(unselrowIds));
        }
        // присоединяем все параметры для запроа дданных для грида
        params2 = params2.merge(queryParams);
        // добавим фильтрацию и сортировку
        var filters = _grid.getFilterHash();
        var sorting = _grid.getCurrentSortStateHash();
        params2 = params2.merge(filters).merge(sorting);
        // параметров может быть много, поэтому сохраним их в сессию
        Tools.keepDataToSession(extraParamsAN, params2.toQueryString());
        // а в реальном запросе просто напишем имя параметра сессии
        params.set("reportExtraParams", extraParamsAN);

        return params;
    },

    /**
     * Запрос выбранных id-ков грида, в том числе возвращает id-ки и записей, которых ещё нет на экране
     * @param grid id записи грид
     * @param servletName имя сервлета, который запрашивает данные для грида
     * @param queryParams параметры для грида
     */
    getSelectedIds:function(grid, servletName, queryParams) {
        var _grid = grid;
        var rowIds = _grid.getSelectedRowIdsInArray();
        if (rowIds == null || rowIds.length == 0) {
            alert("Не выделено ни одной строки");
            return;
        }
        // признак, что была нажата кнопка "выбрать все строки"
        var selectedAll = _grid.isSelectedAll();
        if (selectedAll) {
            // параметры запроса
            var params = this.getParametersForGrid(_grid, servletName, queryParams);
            // признак того, что выполняем запрос id-ков
            params.set("selectedRows", true);

            // запрос id-ков
            alameda.ajaxRequest("Ctrl", {
                parameters:params,
                asynchronous: false,
                onSuccess:function(transport) {
                    var json = transport.responseJSON;
                    if (json.error) {
                        alert(json["error"]);
                        rowIds = null;
                    } else {
                        if (Tools.def(json["ids"])) {
                            rowIds = json["ids"];
                        }
                    }
                }.bind(this)
            }, alameda.AjaxRequestMode.GET);
        }

        return rowIds;
    },

	hasInnerText: ((document.getElementsByTagName("html")[0].innerText != undefined)),

	/**
	 * Gets element inner text in cross-browser manner
	 * Uses innerText property if supported or textContent otherwise
	 * @param element HTMLElement or String
	 * @return String DOM element inner text
	 */
	text: function(element) {
		element = $(element);
		return this.hasInnerText ? element.innerText : element.textContent;
	},

    /**
     * Сохранить cookies в браузере
     * @param name имя
     * @param value значение
     * @param expires время окончания действия
     * @param path
     * @param domain
     * @param secure
     */
    setCookie:function (name, value, expires, path, domain, secure) {
        var today = new Date();
        today.setTime( today.getTime() );
        if ( expires ) {
            expires = expires * 1000 * 60 * 60 * 24;
        }
        var expires_date = new Date( today.getTime() + (expires) );
        document.cookie = name+'='+escape( value ) +
            ( ( expires ) ? ';expires='+expires_date.toGMTString() : '' ) + //expires.toGMTString()
            ( ( path ) ? ';path=' + path : '' ) +
            ( ( domain ) ? ';domain=' + domain : '' ) +
            ( ( secure ) ? ';secure' : '' );
    },

    /**
     * Достать cookies по имени
     * @param name имя
     */
    getCookie:function (name) {
        var start = document.cookie.indexOf( name + "=" );
        var len = start + name.length + 1;
        if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) {
            return null;
        }
        if ( start == -1 ) return null;
        var end = document.cookie.indexOf( ';', len );
        if ( end == -1 ) end = document.cookie.length;
        return unescape( document.cookie.substring( len, end ) );
    },

    deleteCookie:function (name, path, domain) {
        Tools.setCookie(name, "", -1, path, domain, null);
    }
};
/**
 * выполняет указанную функцию только когда функция c условием вернет true
 */
var DelayedExecutor = Class.create({
    initialize: function(/*Function*/func,/*Function*/conditionFunc){
        this.func = func;
        this.condFunc = conditionFunc;
        if (conditionFunc())
        	func();
        else
        	new PeriodicalExecuter(this.execute.bind(this), 0.5);
    },

    execute: function(/*PeriodicalExecuter*/pe){
        if(this.condFunc()){
            this.func();
            pe.stop();
        }
    }
});

function multiLineCheck(){
    if (this.value.length > this.maxlen){
        $(this).addClassName('incorrect_multiline');
        this.title = 'Для данного поля разрешен ввод не более чем ' + this.maxlen + ' символов! Вами введено ' + this.value.length + ' символов.';
    }
    else {
        $(this).removeClassName('incorrect_multiline');
        this.title = '';
    }
}

/*
 Function for opening general purpose dictionary view.
 Should be called from web-inf/jsp folder. Otherwise, path to Ctrl servlet could be incorrect.
 Params:
 xmlName - id of record in xml/map.xml file - dictionary to open
 requiredCols - array of column names to query
 paramsHash (optional) - Hash (prototype) of param name-value pairs - will be given to list data provider.
 dynamicFlag (optional) - can be undefined. If it's established and equal to 1 then grid in the
 modal window uses smart-rendering technology for data handling. In other cases
 grid uses general way of data handling.
 autocompleteWhenSingleRow (optional) - can be undefined. If it has value 1 in modal window calls submit() -method in case
 only one row in grid.
 Returns Hash:

 For one line selection
 field 'cancel' - boolean - if the window was closed without selecting a record
 other fields with names identical to requiredCols - values of correspondent columns in a dictionary.

 For multiline selection
 field 'cancel' - boolean - if the window was closed without selecting a record
 field 'result' with Array of Hashes. Every selected line per one Array element.
 In every Hash fields with names identical to requiredCols - values of correspondent columns in a dictionary.
 */
function listView(xmlName, requiredCols, paramsHash, dynamicFlag, autocompleteWhenSingleRow, filterParams) {
    var obj = new Hash();
    obj.set('requestedFields', requiredCols.join(","));
    if (paramsHash != undefined)
        obj = obj.merge(paramsHash);
    if (filterParams) {
        obj.set("filterParams", filterParams);
    }
    var isDynamic = '&isDynamic=' + (dynamicFlag == 1? '1':'0');
    var isAutocompleteWhenSingleRow = '&isAutocompleteWhenSingleRow=' + (autocompleteWhenSingleRow==1? '1':'0');
    var result = window.showModalDialog(window["contextPath"] + '/srv/Ctrl?name=list_common&xmlName=' + xmlName + isDynamic + isAutocompleteWhenSingleRow,
        obj, "dialogWidth:700px;center:yes;help:no;resizable:yes");
    var res = new Hash();
    if (result == undefined)
        res.set("cancel", true);
    else {
        if (undefined != result["empty"] && result["empty"]) {
            res.set("cancel", true);
            res.set("empty", true);
            return res;
        }
        res.set("cancel", false);
        if (result.length > 0) { // multiselection result
            var resArray = [];
            for (var j = 0; j < result.length; j++) {
                var resRow = new Hash();
                for (var i = 0; i < requiredCols.length; ++i) {
                    resRow.set(requiredCols[i], result[j][requiredCols[i]]);
                }
                resArray.push(resRow);
            }
            res.set("result", resArray);
        } else { // one row result selection
            for (var ii = 0; ii < requiredCols.length; ++ii)
                res.set(requiredCols[ii], result[requiredCols[ii]]);
        }
    }
    return res;
}

/**
 * Инициализация таббара, состоящего из одной закладки
 * @tabbar_div Имя DIV всего таба
 * @title Заголовок
 * @width Ширина (c px)
 * @tabpage_div Имя DIV первой и единственной страницы
 */
function initOnePageTabbar(tabbar_div, title, width, tabpage_div){
    var tb=createTabbar(tabbar_div);
    tb.addTab("page1", title, width);
    tb.setContent('page1', tabpage_div);
    tb.setTabActive('page1');
    tb.enableScroll(false);
    return tb;
}

function createTabbar(tabbar_div){
    var tb=new dhtmlXTabBar(tabbar_div);
    tb.setSkin('modern');
    tb.setImagePath(window.dhx_globalImgPath);
    return tb;
}

function vbArgPrepare(s){
    return s.replace(/"/g, '""').replace(/\n/g, '" & vbCrLf & "');
}

/**
 * Окно запроса с иконкой знака вопроса и кнопками Yes и No
 * @prompt Текст сообщения
 * @title Необязательный параметр - текст заголовка
 * @noSelected При открытии выбранная кнопка - No (если указать в этом параметре true) (параметр необязателен)
 * @return true - при нажатии Yes, false - в противном случае
 */
function windowAsk(prompt, title, noSelected){
    if (Object.isUndefined(window['execScript'])) {
        return confirm(prompt);
    }

    var p=vbArgPrepare(prompt);
    var mode= Object.isUndefined(noSelected) ? "36" : (noSelected ? "292" : "36");
    var sc = Object.isUndefined(title) ? 'n = MsgBox("'+p+'",' + mode + ')' : 'n = MsgBox("'+p+'",'+mode+',"' +vbArgPrepare(title)+'")';
    execScript(sc, "vbscript");
    return(n == 6);

}

/**
 * Окно информационного сообщения с кнопкой OK
 * @prompt Текст сообщения
 * @title Необязательный параметр - текст заголовка
 */
function windowInfo(prompt, title) {
    if (Object.isUndefined(window['execScript'])) {
        alert(prompt);
        return;
    }

    var p=vbArgPrepare(prompt);
    var mode="64";
    var sc = Object.isUndefined(title) ? 'n = MsgBox("'+p+'",' + mode + ')' : 'n = MsgBox("'+p+'",'+mode+',"' +vbArgPrepare(title)+'")';
    execScript(sc, "vbscript");
}

/**
 * Окно запроса с иконкой знака вопроса и кнопками OK и Cancel
 * @prompt Текст сообщения
 * @title Необязательный параметр - текст заголовка
 * @noSelected При открытии выбранная кнопка - Cancel (если указать в этом параметре true) (параметр необязателен)
 * @return true - при нажатии OK, false - в противном случае
 */
function windowOkCancel(prompt, title, noSelected) {
    if (Object.isUndefined(window['execScript'])) {
        return confirm(prompt);
    }

    var p=vbArgPrepare(prompt);
    var mode= Object.isUndefined(noSelected) ? "33" : (noSelected ? "289" : "33");
    var sc = Object.isUndefined(title) ? 'n = MsgBox("'+p+'",' + mode + ')' : 'n = MsgBox("'+p+'",'+mode+',"' +vbArgPrepare(title)+'")';
    execScript(sc, "vbscript");
    return(n == 1);
}

/**
 * Окно запроса данных пользователя
 * @prompt Текст сообщения
 * @title Необязательный параметр - текст заголовка
 * @defaultValue заполнение строки ввода по умолчанию
 * @return строка ввода
 */
function windowInput(prompt, title, defaultValue) {

    if (Object.isUndefined(window['execScript'])) {
        return prompt(title);
    }
    var sc = 'n = InputBox("' + vbArgPrepare(prompt) + '"';
    if (!Object.isUndefined(title)) {
        sc = sc + ',"' +vbArgPrepare(title) + '"'
    }
    if (!Object.isUndefined(defaultValue)) {
        sc = sc + ',"' +vbArgPrepare(defaultValue) + '"'
    }
    sc = sc +  ')';
    execScript(sc, "vbscript");
    return n;
}


/**
 * За(раз)блокировать все INPUTы на указанном узле страницы
 */
function _disableInputs(control, disabledValue, useTextArea)
{
    var ctrl=$(control);
    var types = ['ru.ncd.input'];
    if (!Object.isUndefined(useTextArea) && useTextArea)
        types.push('textarea');
    for ( var i = 0; i < types.length; ++i ) {
        var children=ctrl.select(types[i]);
        if (types[i] == 'textarea'){
            for (var j = 0; j < children.length; ++j ){
                disableText(children[j], disabledValue);
            }
        }
        else {
            for (j = 0; j < children.length; ++j ){
                if ($(children[j]).type == 'text')
                    disableText(children[j], disabledValue);
                else
                    $(children[j]).disabled = disabledValue;
            }
        }
    }
}

/**
 * Блокировать INPUT (type=text) или Textarea в соответствии с концепцией использования св-ва readOnly вместо disabled
 * Проверяет наличие параметра editable. Если установлено editable="false", то поле нередактируемо всегда
 * @param node - Блокируемый узел
 * @param disabledValue Блокировать (true) или разблокировать (false)
 */
function disableText(node, disabledValue){
    var n=$(node);
    var editable = Tools.def(n.editable) ? n.editable == 'true' : true;
    var val = !editable ? true : disabledValue;
    n.readOnly = val;
    if (val) {
        n.addClassName('disabled');
    } else {
        n.removeClassName('disabled');
    }
}

/**
 * Аналогина функции disableText. Дополнительно убирается заливка серым.
 * Нужна для автозаполняемых полей "Номер счета", "Код раздела", "Идентификатор раздела"
 */
function disableTextAndRemoveGrey(node, disabledValue){
    var n=$(node);
    var editable = Tools.def(n.editable) ? n.editable == 'true' : true;
    var val = !editable ? true : disabledValue;
    n.readOnly = val;
    if (val) {
        n.addClassName('disabled');
    } else {
        n.removeClassName('disabled');
        n.removeClassName('fillGrey');
    }
}

/**
 * Выполняет загрузку файла на сервер. Используется в совокупности с тегом fileUpload.tag
 */
var FileUploader = Class.create({
    initialize: function(id, servlet, resultNode, resultFileNameNode, completeCallback) {
        this.id = id;
        this.servlet = "Ctrl?name=" + servlet;
        this.updater = null;
        this.parameters = 'c=status&id=' + this.id;
        // имя поля, куда будет выставляться статус загрузки (0 - не готово, 1 - готово)
        this.resultNode = resultNode;
        // имя поля, куда будет записываться имя загруженного файла
        this.resultFileNameNode = resultFileNameNode;
        // массив функций для сбора дополнительных параметров в контексте текущей формы
        this.additionalParamsCallbacks = $A([]);
        // дополнительные параметры к основному запросу
        this.additionalParams = $H();
        // будет вызываться при окончании загрузки
        this.completeCallback = completeCallback;

        // добавляем дополнительный параметр с именем файла
        this.addParameter('fileName', this._getFileName.bind(this));

        // обработчик события изменения поля
        Event.observe("importFile_" + this.id, "change", this.onFilePathInputChanged.bind(this));
    },

    onFilePathInputChanged: function(){
        // чистим статус загрузки файла
        $('status_' + this.id).innerHTML = "";
    },

    updateList: function() {
        var input = $("importFile_" + this.id);
        var output = $("fileList");
        output.innerHTML = '<ul>';
        var fileNames = $A();
        for (var i = 0; i < input.files.length; ++i) {
            var fileName = input.files.item(i).name;
            output.innerHTML += '<li>' + fileName + '</li>';
            fileNames.push(fileName);
        }
        output.innerHTML += '</ul>';
        this.fileNames = fileNames;
        this.addParameter('fileNames', function () {
                return this.fileNames.join(",");
            }.bind(this)
        );
    },

    /**
     * добавляет новый параметр в запрос
     * @param paramName : String имя параметра
     * @param paramValue : String parameter value
     */
    addParameter: function(/*String*/paramName, /*String*/paramValue) {
        this.additionalParams.set(paramName, paramValue);
    },

    /**
     * добавление функции получения дополнительных параметров загрузки файла
     * @param func : Function функция возвращающая параметры в виде $H() хеша
     */
    registerAdditionalParamsCallback: function (func) {
        if (Object.isFunction(func)) {
            this.additionalParamsCallbacks.push(func);
        }
    },

    /**
     * Возвращает дополнительные параметры.
     */
    getAdditionalParameters: function() {
        var queryParams = $H();
        if (this.additionalParams != null) {
            this.additionalParams._each(function(pair) {
                if (Object.isFunction(pair.value)) {
                    queryParams.set(pair.key, pair.value());
                } else if (Object.isString(pair.value)) {
                    if ($(pair.value).type.toUpperCase() == 'CHECKBOX')
                        queryParams.set(pair.key, $(pair.value).checked ? '1' : '0');
                    else
                        queryParams.set(pair.key, $F(pair.value));
                }
            });
        }
        // Обход дополнительных функций, возвращающих наборы параметров для загрузки файла
        this.additionalParamsCallbacks.each(function (func, offset) {
            try {
                // Объединение параметров
                var res = func.call(this);
                if (res != null) {
                    queryParams = queryParams.merge(res);
                }
            } catch (e) {
                if (window.console > '') {
                    console.error(e);
                }
            }
        });
        return queryParams;
    },

    /**
     * Отрабатывает на сабмит формы
     */
    doSubmit: function() {
        if ($("importFile_" + this.id).value != '') {
            this._buildActionString();
            $("fileForm_" + this.id).submit();
            this.startStatusCheck();
        } else {
            // запускаем вручную событие завершения загрузки
            this.onComplete(true);
        }
    },

    /**
     * builds the action string for the upload form
     */
    _buildActionString: function() {
        var queryString = this.servlet;
        var hAddPar = this.getAdditionalParameters();
        queryString += "&" + hAddPar.toQueryString();

        $("fileForm_" + this.id).action = queryString;
    },

    /**
     * Вызывается при окончательной загрузки файла
     * @param isManualMode : boolean ручной запуск
     */
    onComplete: function(/*boolean*/isManualMode) {
        // не для ручного редима
        if (!Tools.def(isManualMode) || !isManualMode) {
            if (this.resultNode != '') {
                $(this.resultNode).value = $F("upload_completed_" + this.id);
            }
            // показываем значение последнего файла
            if (this.resultFileNameNode != '') {
                $(this.resultFileNameNode).value = this._getFileName();
            }
        }
        // вызываем коллбэк
        if (Tools.def(this.completeCallback)) {
            alameda.runFunctionInContext(this.completeCallback);
        }
    },

    /**
     * отображает только имя файла вместо всего пути
     */
    _getFileName: function() {
        var id = "importFile_" + this.id;
        return $F(id).substring($F(id).lastIndexOf('\\') + 1, $F(id).length);
    },

    _getFileNames: function() {
        return this.fileNames.join(",");
    },

    /**
     * Стартует проверщик статуса
     */
    startStatusCheck: function() {
        this.updater = new Ajax.PeriodicalUpdater('status_' + this.id, this.servlet,
        {asynchronous:true, frequency:1, method: 'get',
            parameters: this.parameters, onFailure: this.reportError.bind(this)});

        return true;
    },

    reportError:function () {
        $('status_' + this.id).innerHTML = '<div class="error"><b>Ошибка соединения с сервером. Попробуйте ещё раз.</b></div>';
    },

    killUpdate: function(message) {
        this.updater.stop();
        if (message != '') {
            $('status_' + this.id).innerHTML = '<div class="error">Не удалось загрузить файл!</div>';
            alert(message);
            // вызываем коллбэк
            if (Tools.def(this.completeCallback)) {
                alameda.runFunctionInContext(this.completeCallback, message);
            }
        }
        else {
            new Ajax.Updater('status_' + this.id, this.servlet,
            {asynchronous:true, method: 'get', parameters: this.parameters + "&delete=true",
                onFailure: this.reportError.bind(this), onComplete: this.onComplete.bind(this, false)});
        }
    }
});

function getWindowsObj(){
    if (Object.isUndefined(window._dhxWins)){
        window._dhxWins = new dhtmlXWindows();
        window._dhxWins.enableAutoViewport(true);
        window._dhxWins.setImagePath(window.dhx_globalImgPath);
    }
    return window._dhxWins;
}

/**
 * Custom events manager.
 * Allows to register events by specifyed name. It could be several events for the same name.
 */
var CustomEventManager = Class.create({
    /**
     * Predefined event names
     */
    onEditRecordEName: "onEditRecord",
    onAddRecordEName: "onAddRecord",
    onCancelEName: "onCancel",
    onLoaded: "onLoaded",

    initialize: function() {
        // массив событий, который выполняются в момент перехода в режим редактирования
        this._eventsMap = $H();
    },

    callEvent:function() {
        var args = $A(arguments), eventName = args.shift();
        var eventsByName = this._eventsMap.get(eventName);
//        alameda.debug("callEvent->" + eventName, " eventsByName = " , eventsByName);
        if (eventsByName != null) {
            eventsByName.each(function(func) {
                func.apply(window, args);
            });
        }
    },

    addEventListener: function(/*String*/eventName, /*Function*/func) {
        if (!Tools.def(eventName)) {
            throw new Error("Внутренняя ошибка. addEventListener->[eventName] parameter shouldnt be null");
        }
        if (!Tools.def(func)) {
            throw new Error("Внутренняя ошибка. addEventListener->[func] parameter shouldnt be null");
        }
        if (!Object.isFunction(func)) {
            throw new Error("Внутренняя ошибка. addEventListener->[func] parameter should be a function");
        }
        // get events by specifyed name
        var eventsByName = this._eventsMap.get(eventName);
        // if the hash doesn't contain event by specifyed name, than create new array for that type events
        if (eventsByName == null) {
            this._eventsMap.set(eventName, $A());
        }
        // keeps event in a hash
        this._eventsMap.get(eventName).push(func);
    }
});

/**
 * Класс, занимающийся обновлением страницы
 */
var PageRefresher = Class.create({
    /**
     * Конструктор
     * @param func функция, которая будет переодически выполняться
     * @param loadingCompletedFunc функция, которая проверяет можно ли запускать обновление страницы
     * @param defPeriod дефолтовый период обновления
     * @param cbRefreshId id поля чекбокса, который устанавливает автообновление
     * @param periodRefreshId id поля где хранится период обновления
     */
    initialize:function(/*Function*/func, /*Function*/loadingCompletedFunc, /*int*/defPeriod, /*int*/minValue,/*String*/cbRefreshId, /*String*/periodRefreshId) {
        // function to do search
        this.func = Tools.def(func) ? func : RegisterPageManager.doSearch.bind(RegisterPageManager);
        // load completed condition function
        this.loadingCompletedFunc = Tools.def(loadingCompletedFunc) ? loadingCompletedFunc : function() {
            alameda.debug("RegisterPageManager.pageGrid.loading", RegisterPageManager.pageGrid.loading);
            return !RegisterPageManager.pageGrid.loading;
        };
        // current periodical executor
        this.perExec = null;
        // default refresh period
        this.defRefreshPeriod = Tools.def(defPeriod) ? defPeriod : 60;
        // current refresh period
        this.currentRefreshPeriod = this.defRefreshPeriod;
        // min period value
        this.minValue = Tools.def(minValue) ? minValue : 10;
        // refresh checkbox node id
        this.cbRefreshId = Tools.def(cbRefreshId) ? cbRefreshId : 'autoRefresh';
        // period input node id
        this.periodRefreshId = Tools.def(periodRefreshId) ? periodRefreshId : "refreshPeriod";
        // пишем дефолтовое значение в инпут
        $(this.periodRefreshId).value = this.currentRefreshPeriod;
        // на клик по чекбоксу
        Event.observe($(this.cbRefreshId), 'click', this.onChangeAutoRefresh.bind(this));
        // изменение значения периода
        Event.observe($(this.periodRefreshId), 'change', this.onChangePeriod.bind(this));
    },

    reset: function(){
        if (this.perExec != null) {
            this.perExec.stop();
        }
        $(this.periodRefreshId).value = this.defRefreshPeriod;
    },

    onChangePeriod:function () {
        if (this.minValue > $F(this.periodRefreshId)) {
            alert("Минимально разрешенный период обновления - " + this.minValue + " секунд");
            $(this.periodRefreshId).value = this.minValue;
        }
    },

    onChangeAutoRefresh:function () {
        if (this.perExec != null) {
            this.perExec.stop();
        }
        this.initExecutor();
    },

    initExecutor: function() {
        // учитываем минимальное значение
        $(this.periodRefreshId).value = [this.minValue,$F(this.periodRefreshId)].max();
        this.currentRefreshPeriod = $F(this.periodRefreshId);
        this.perExec = new PeriodicalExecuter(this._refreshTimeOut.bind(this), this.currentRefreshPeriod);
    },

    _refreshTimeOut:function (/*PeriodicalExecuter*/pe) {
        if ($(this.cbRefreshId).checked) {
            // если в данный момент не выполняется загрузка
            if (this.loadingCompletedFunc()) {
                // выполняем загрузку
                this.func();
                // если сменили период, то обвноим исполнителя
                if (this.currentRefreshPeriod != $F(this.periodRefreshId)) {
                    pe.stop();
                    this.initExecutor();
                }
            }
        } else {
            pe.stop();
        }
    }
});

/**
  * Форматирование дробного числа для гридов
  * @param data {String} данные ячейки
  * @param gs {String} разделитель групп
  * @param ds {String} разделитель дробной части
  * @param ad {Number} минимальное количество знаков после разделителя дробной части
  * @return {String} Отформатированное число
  */
function setNumberFormat(data, gs, ds, ad) {
    // позиция дробной части
    var di = data.indexOf('.');
    // целая часть
    var ip = data;
    // дробная часть
    var dp = "";

    if (di >= 0) {
        ip = data.substring(0, di);
        dp = data.substring(di + 1, data.length);
    }
    if (Object.isNumber(ad)) {
        while (dp.length < ad) {
            dp += "0";
        }
    }
    if (!dp.blank()) {
        dp = ds + dp;
    }

    var arIp = ip.toArray();
    var ipl = ip.length;
    var i = 1;
    var nip = arIp[ipl - 1] || "";

    while (i < ipl) {
        if (i % 3 === 0) {
            nip = gs + nip;
        }
        nip = arIp[ipl - 1 - (i++)] + nip;
    }

    // удалим пробелы после знака
    nip = nip.replace(/^(\+|-) +/, "$1");
    return nip + dp;
}

/**
 * Класс позволяет выполнять указанную функцию с задержкой.
 * Причем если вызов повторяется до начала выполнения предудщего, то предыдущий отменяется.
 */
var TimeoutExecuter = Class.create({
    currentTimeOut: null,
    period: 1000,
    /**
     * Конструктор
     * @param period : int время задержки выполнения в миллисекундах
     */
    initialize: function(period) {
        if (!Object.isUndefined(period) && period != null) {
            this.period = period;
        }
    },
    execute: function(func) {
        if (this.currentTimeOut != null) {
            clearTimeout(this.currentTimeOut);
        }
        this.currentTimeOut = setTimeout(func, this.period);
    }
});

/*
 * Генератор обработчиков в полях ввода текста.
 * Предназначен для создания ограничивающих ввод обработчиков.
 * Пример использования:
 * var eg = new EventGenerator();
 * eg.capture($('field'), 'onkeydown', 'numbers'); // В данном случае в поле ввода field будут доступны для ввода
 *                                                 // только цифры.
 *
 * Класс является конечным и не требует каких-либо библиотек для работы.
 * */
function EventGenerator() {
    var nav = {
        "home": 36,
        "end": 35,
        "pgup": 33,
        "pgdown": 34,
        "left": 37,
        "up": 38,
        "right": 39,
        "down": 40,
        "tab": 9
    };
    var ed = {
        "insert": 45,
        "delete": 46,
        "backspace": 8
    };
    var f = [null, 112,113,114,115,  116,117,118,119,  120,121,122,123];
    var std_nav = {
        single: [nav.up,nav.down,nav.left,nav.right,nav.home,nav.end,nav.pgup,nav.pgdown,nav.tab],
        shift: [nav.up,nav.down,nav.left,nav.right,nav.home,nav.end,nav.pgup,nav.pgdown,nav.tab],
        ctrl: [65, 67, 86, 82, nav.up,nav.down,nav.left,nav.right,nav.home,nav.end,nav.pgup,nav.pgdown]
    };
    // ed["delete"] указан именно в качестве строкового параметра из-за IE, он не понимает
    // конструкцию ed.delete, считая delete в данном случае зарезервированным словом.
    var std_edit = {
        single: std_nav.single.concat([ed["insert"],ed["delete"],ed["backspace"]]),
        shift: std_nav.shift.concat([ed["insert"]]),
        ctrl: std_nav.ctrl.concat([ed["insert"],ed["delete"],ed["backspace"]])
    };

    this.keys = {
        std_nav: std_nav,
        std_edit: std_edit,
        letters: {
            values:['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
            single:[65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90]
        },
        numbers_kb1: {
            values:[0,1,2,3,4,5,6,7,8,9],
            single:[48,49,50,51,52,53,54,55,56,57]
        },
        numbers_numpad: {
            values: [0,1,2,3,4,5,6,7,8,9],
            single: [96,97,98,99,100,101,102,103,104,105]
        },
        // float_chars, а не float - потому что JS компрессор считает float зарезервированным типом
        float_chars: {
            values:['.', '.', ','],
            single:[110, 190, 188]
        },
        math_operators: {
            values: ['/', '*', '-', '-', '+'],
            single: [111, 106, 109, 189, 107],
            shift:  [null, 56,null,null, 187]
        },
        currency: {
            values:['$','%'],
            shift: [ 52, 53]
        },
        text_specific: {
            values: ['!','@','#','^','&','*','(',')'],
            shift:  [ 49, 50, 51, 54, 55, 56, 57, 48]
        }
    };

    /*
     * Алгоритм быстрой сортировки Quick Sort
     * @param arr		сортируемый массив
     * @param left	смещение левого элемента
     * @param right	смещение правого элемента
     */
    this.qsort = function qsort (arr, left, right) {
        var i = left;
        var j = right;
        var tmp;
        pivotidx = (left + right) / 2;
        var pivot = parseInt(arr[pivotidx.toFixed()]);
        /* partition */
        while (i <= j) {
            while (parseInt(arr[i]) < pivot)
                i++;
            while (parseInt(arr[j]) > pivot)
                j--;
            if (i <= j) {
                tmp = arr[i];
                arr[i] = arr[j];
                arr[j] = tmp;
                i++;
                j--;
            }
        }

        /* recursion */
        if (left < j)
            qsort(arr, left, j);
        if (i < right)
            qsort(arr, i, right);
        return arr;
    };

    // Добавление в один массив элементов другого массива
    var amerge = function amerge(src, dst) {
        // Решение банальное, есть возможность оптимизации,
        // но потребность пока не возникала.
        for (var i=0; i<src.length; i++) {
            dst.push(src[i]);
        }
    };
    // Генерация уникального массива
    var uniqarr = function uniqarr( arr ) {
        var res = [];
        // В IE, в случае, если out является типом [], а не {}, любое число воспринимается как индекс от
        // нуля и создаёт отсутствующие элементы, делая массив out уродливым.
        var out = {};
        for (var i=0; i<arr.length; i++) out[arr[i]]=1;
        if ((typeof out['forEach'])!=='undefined') {
            out.forEach(function(val, key) {
                res.push(key);
            });
        } else {
            for (var key in out)
                res.push(parseInt(key));
        }
        return res;
    };

    // Метод подготовки массива блоков упарвляющих кодов в один блок
    this.prepare_keyblock = function ( blocks, do_not_sort ) {
        var res = {
            single:[],
            shift:[],
            ctrl:[]
        };
        for (var i=0; i<blocks.length;i++) {
            var block = blocks[i];
            if (block["single"]) amerge(block["single"], res.single);
            if (block["shift"]) amerge(block["shift"], res.shift);
            if (block["ctrl"]) amerge(block["ctrl"], res.ctrl);
        }
        res.single = uniqarr(res.single);
        res.shift = uniqarr(res.shift);
        res.ctrl = uniqarr(res.ctrl);

        if (!do_not_sort) {
            this.qsort(res.single, 0, res.single.length-1);
            this.qsort(res.shift, 0, res.shift.length-1);
            this.qsort(res.ctrl, 0, res.ctrl.length-1);
        }
        return res;
    };

    // Генерация связанных последовательностей
    var sequence_condition = function sequence_condition( arr, _var_name ) {
        if (!_var_name) throw("Variable name not defined.");
        var seqs = [];
        if (arr.length>1) {
            for (var i=1, start=arr[0], curr, prev=start, len=0; i<arr.length; i++) {
                curr = arr[i];
                if (curr-prev>1) {
                    if (len<=1)
                        seqs.push([start]);
                    else
                        seqs.push([start, prev]);
                    start = curr;
                    len=0;
                }
                len++;
                prev = curr;
            }

            if (len==1)
                seqs.push([start]);
            else
                seqs.push([start, prev]);
        } else if (arr.length==1) seqs.push([arr[0]]);

        var cond = [];
        for (var i=0; i<seqs.length; i++) {
            var s = seqs[i];
            if (s.length>1) {
                cond.push(_var_name+">="+s[0]+" && "+_var_name+"<="+s[1]);
            } else {
                cond.push(_var_name+"==="+s[0]);
            }
        }

        return [seqs, "("+cond.join(") || (")+")"];
    };

    /*
     * Генератор обработчика ввода в поле с символьным ограничением
     * @param key_block	Сформированный массив допустимых управляющих кодов
     *			Его формирование производится путём вызова метода prepare_keyblock
     * @param props	Объект с набором необязательных свойств
     *			props.func_name - Имя выходной функции
     *			props.block_true - JS функциональный текст, который выполнится в
     *					   случае совпадения кода символа с условием
     *			props.block_false - JS функциональный текст, который выполнится в
     *					    случае несовпадения кода символа с условием
     *			props.func_true	- JS функция совпадения условия
     *			props.func_false - JS функция несовпадения условия
     */
    this.make_event = function make_event( key_block, props ) {
        if (!props) props={};
        var ctx = {
            self: this,
            props: props
        };
        var blocks = [];
        if (key_block.shift.length>0) {
            var cond = sequence_condition(key_block.shift, "key");
            blocks.push("(e.shiftKey===true && ("+cond[1]+"))");
        }
        if (key_block.ctrl.length>0) {
            var cond = sequence_condition(key_block.ctrl, "key");
            blocks.push("(e.ctrlKey===true && ("+cond[1]+"))");
        }
        if (key_block.single.length>0) {
            var cond = sequence_condition(key_block.single, "key");
            blocks.push(cond[1]);
        }
        if (blocks.length==0) throw("Empty key block");
        var condition = "if ("+blocks.join("\n || ")+")";
        var event_break = "e.preventDefault(); return false; ";
        var body_buf = ["var key = e.keyCode;", condition, "{"];
        // Добавление блока кода, который должен выполниться в случае успешного прохождения условия
        if (props.block_true!=null)
            body_buf.push(props.block_true);
        // Добавление обработчика успешного прохождения условия ввода
        if (props.func_true!=null)
            body_buf.push("this.props.func_true();");
        body_buf.push("return true;");
        body_buf.push("}; ");

        // Добавление блока кода, который выполнится в случае неудачного прохождения условия
        if (props.block_false!=null)
            body_buf.push(props.block_false);
        // Добавление обработчика неудачного прохождения условия ввода
        if (props.func_false!=null)
            body_buf.push("this.props.func_false();");
        body_buf.push(event_break);

        var func = new Function("e", body_buf.join("\n"));
        if (props.func_name!=null) func.name = props.func_name;
        return func.bind(ctx);
    };

    // Предустановка для цифрового поля ввода
    this.numbers_field = function(is_float) {
        var blocks = [
            this.keys.std_edit,
            this.keys.numbers_kb1,
            this.keys.numbers_numpad
        ];
        if (is_float) blocks.push(this.keys.float_chars);
        return this.prepare_keyblock(blocks);
    };

    // Предустановка для цифрового поля с дробными числами
    this.float_numbers_field = function() {
        return this.numbers_field(true);
    };

    /*
     * Получение предустановленного обработчика
     * @param block_name	Имя предустановленного блока
     * @param props	Параметры обработчика
     */
    this.event = function event( block_name, props ) {
        var ev_block = block_name+'_field';
        if (this[ev_block])
            return this.make_event(this[ev_block](), props);
        else
            throw(block_name+" not found in preselected blocks");
    };

    /*
     * Макрос назначения обработчика на поле ввода с предустановленным обработчиком
     * @param target	Объект назначения обработчика
     * @param event	Название события привязки обработчика
     * @param block_name	Имя предустановленного блока
     * @param props	Параметры обработчика
     */
    this.capture = function capture( target, event, block_name, props ) {
        if (!event) event="onkeydown";
        if (target!=null) {
            target[event] = this.event(block_name, props);
        } else throw("Target not defined.");
    }
}

/**
 * Устанавливает отслеживание изменения поля и предотвращает ввод строки длиннее, чем допустимое кол-во символов
 * @param fieldId id поля для отслеживания
 * @param maxLength максимальное кол-во символов
 * @param isSelector флаг, использовать id для поиска или строку селекторов
 */
function setFieldMaxValueChecker(fieldId, maxLength, isSelector) {
    if (!Tools.def(isSelector)) {
        isSelector = false;
    }
    var field = isSelector ? $$(fieldId)[0] : $(fieldId);
    if (!Tools.def(field)) {
        return;
    }

    setFieldValueChecker(field, function() {
        Tools.checkMaxLength(field, maxLength);
    });
}

/**
 * Устанавливает отслеживание изменения поля
 * @param field объект поля
 * @param checkFunction функция отслеживания
 */
function setFieldValueChecker(field, checkFunction) {
    if (!Tools.def(field) || !Object.isFunction(checkFunction)) {
        return;
    }
    field.onkeyup = field.oninput = checkFunction;
    field.onpropertychange = function() {
        if (event.propertyName == "value") {
            checkFunction();
        }
    };
    field.oncut = function() {
        setTimeout(checkFunction, 0); // на момент oncut значение еще старое
    };
}

/**
 * Ограничение числа вводимых символов в поле с атрибутом maxlength (с предупреждением)
 * @param event	Название события привязки обработчика
 */
function isNotMaxLength(event) {
    event = event || window.event;
    var target = event.target || event.srcElement,
        code = event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode);

    // Исключаем блокировку несимвольных клавиш (например, Del)
    if ([13, 8, 9, 46, 37, 38, 39, 40].indexOf(code) != -1) return true;

    var maxlength = target.getAttribute('maxlength'),
        isMax = target.value.length >= maxlength;
    if (isMax) alert("Максимально допустимая длина текста (" + maxlength + " символов) превышена!");
    return !isMax;
}

/**
 * Удаление избыточного текста в поле с атрибутом maxlength (с предупреждением)
 * @param event	Название события привязки обработчика
 */

function textCutter(event) {
    var target = event.target || event.srcElement,
        a = target.innerText,
        maxlength = target.getAttribute('maxlength');
    if (a.length > maxlength) {
        alert("Максимально допустимая длина текста (" + maxlength + " символов) превышена! \nБудет проведена обрезка.");
        var b = a.substring(0, maxlength);
        target.innerText = b;
    }
}

/**
 * Возвращает размер экрана
 */
function findDimensions() {
    var dimensions = { };

    if (window.innerWidth) {
        dimensions["width"] = window.innerWidth;
        dimensions["height"] = window.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientWidth) {
        dimensions["width"] = document.documentElement.clientWidth;
        dimensions["height"] = document.documentElement.clientHeight;
    }
    else if (document.body && document.body.clientWidth) {
        dimensions["width"] = document.body.clientWidth;
        dimensions["height"] = document.body.clientHeight;
    }
    else if (window.dialogWidth && window.dialogHeight) {
        dimensions["width"] = window.dialogWidth.substring(0,window.dialogWidth.length-2);
        dimensions["height"] = window.dialogHeight.substring(0,window.dialogHeight.length-2);
    }
    return dimensions;
}