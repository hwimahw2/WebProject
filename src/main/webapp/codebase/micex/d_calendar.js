/*
 * Initialization of dhtmlXCalendar language information
 */
function _initCalendarLang() {
    dhtmlxCalendarLangModules = new Array();
    dhtmlxCalendarLangModules['ru'] = {
        langname:   'ru',
        dateformat: '%d.%m.%Y',
        monthesFNames:  ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
        monthesSNames:  ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
        daysFNames: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
        daysSNames: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        weekend: [0, 6],
        weekstart: 1,
        msgClose:    "Закрыть",
        msgMinimize: "Свернуть",
        msgToday:    "Сегодня"
    };
}

//global init
_initCalendarLang();

var _ar_cal_Edit = new Array();
var _ar_cal_Button = new Array();

function _reg_calendar_elems(edit_name, button_name) {
    _ar_cal_Edit.push(edit_name);
    _ar_cal_Button.push(Object.isUndefined(button_name) ? edit_name + '_calendar' : button_name);
}

Date.prototype.getAlamedaDate = function() {
    return _two_digit(this.getDate()) + '.' + _two_digit(this.getMonth() + 1) + '.' + this.getFullYear();
};

/*
 * Create calendars
 */
function createCalendars() {
    var res = null;
    for (var i = 0; i < _ar_cal_Edit.length; ++i) {
        res = new dhtmlxCalendarObject(_ar_cal_Button[i], true, {editControl: _ar_cal_Edit[i], isMonthEditable: true, isYearEditable: true}); //here SHOULD be true (and hide method call then). Otherwise this will not work :(
        res.loadUserLanguage("ru");
        res._edit=_ar_cal_Edit[i];
        res.attachEvent("onClick", _onCalendar_change);
        res.hide();
        $(_ar_cal_Edit[i]).cal=res;
        //Element.writeAttribute(_ar_cal_Edit[i], "cal", res);
        Event.observe(_ar_cal_Button[i], 'click', _on_cal_button_click);
    }
}

function _onCalendar_change(newVal) {
    var d = this.date;
    var ed=$(this._edit);
    if (!Object.isUndefined(ed.callback))
        eval(ed.callback + "(d)");
}

function closeCalendars () {
    for (var i=0; i < _ar_cal_Edit.length; ++i) {
        var ed = $(_ar_cal_Edit[i]);
        var cal = ed.cal;
        //var cal = Element.readAttribute(ed, "cal");
        if (!Object.isUndefined(cal) && cal != null)
          if(cal.hide)cal.hide();  // todo: иногда cal == null
    }
}

//private
function _two_digit(s) {
    var tmp = '' + s;
    if (tmp.length == 1)
        return '0' + tmp;
    return tmp;
}

/**
 * Формирование даты.
 * Если значение задано по маска 'dd.mm.yyyy', то формируем через конструктор
 * В ином случае используем старый механизм, через переопределенный Date.parse
 *
 * @param txt {String} строковое значение, для преобразования в дату
 * @param correctFutureDates {Boolean} флаг корректировки будущих дат (default = false)
 * @return {Date} объект Date, полученный из преобразования
 */
function parseDate(txt, correctFutureDates) {
    var cfd = Tools.def(correctFutureDates) ? correctFutureDates : false;
    var val = _NdcDatePatterns(txt, cfd);
    var dt = new Date();
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(val)) {
        dt.setFullYear(Number(val.substr(6, 4)));
        // Когда текущий день 31, setMonth(2) установит март вместо февраля see Bug 287637
        dt.setDate (1);
        dt.setMonth(Number(val.substr(3,2))-1);
        dt.setDate(Number(val.substr(0,2)));
    } else {
        dt = Date.parse(val);
    }
    return dt;
}

//substitute partitial date for full one, if possible
function _calendar_edit(event) {
    var ed = Event.element(event);
    var txt = ed.value;
    var dt = parseDate(txt, false);
    if (dt == null) {
        ed.value = "";
        return;
    }

    var cal = $(ed).cal;
    cal.setDate(dt);
    ed.value = _two_digit(dt.getDate()) + '.' + _two_digit(dt.getMonth() + 1) + '.' + dt.getFullYear();

    if (!Object.isUndefined(ed.callback))
        eval(ed.callback + "(dt)");
}

//substitute short date patterns wo delimeters for full dates - NDC requirement
function _NdcDatePatterns(val, correctFutureDates) {
    // доступные для обработки дат форматы
    var dd = /^\d{2}$/
    var ddmm = /^\d{4}$/;
    var ddmmyy = /^\d{6}$/;
    var ddmmyyyy = /^\d{8}$/;

    // приводим дату к необходимому формату
    if (/^\d{1,2}\.{0,1}\d{0,2}\.{0,1}\d{0,4}$/.test(val)) {
        var tokens = val.split('.');
        tokens = tokens.collect(function(t) {
            return _two_digit(t);
        });
        val = tokens.join('');
    }

    //check input against our patterns
    if (dd.test(val) || ddmm.test(val) || ddmmyy.test(val) || ddmmyyyy.test(val)) {
        var len = val.length;
        var day, month, year;
        var today = new Date();
        var curDay = today.getDate();
        var curMonth = today.getMonth() + 1;
        var curYear = today.getFullYear();
        day = Number(val.substr(0,2));

        // определяем год
        if (len == 6) { // 2 digit year
            year = Number(val.substr(4, 2));
            year = (year > 50 ? 1900 : 2000) + year;
        } else if (len == 8) { // 4 digit year
            year = Number(val.substr(4, 4));
        } else {
            year = curYear;
        }
        if (correctFutureDates && year > curYear) {
            year = curYear;
        }
        // определяем месяц
        if (len >= 4) {
            month = Number(val.substr(2,2));
        } else {
            month = curMonth;
        }
        if (correctFutureDates && month > curMonth && year == curYear) {
            year = year - 1;
        }
        // определяем день
        var maxDays = Date.getDaysInMonth(year, month - 1);
        if (correctFutureDates && day > curDay && month == curMonth && year == curYear) {
            if (curMonth == 1) {
                year = year - 1
                month = 12
            } else {
                month = month - 1;
            }
            var curMonthMaxDays = Date.getDaysInMonth(year, month);
            if (day <= curMonthMaxDays && day > maxDays) {
                day = maxDays;
            }
        } else if (day > maxDays) {
            day = maxDays
        }

        val = day + '.' + month + '.' + year;
    }

    return _CorrectStringDate(val);
}

function addLeadZero(val) {
    if (val < 10) {
        return '0' + val;
    } else {
        return val;
    }
}

/**
 * Corrects day and month in fully entered
 * date in d.m.y format
 */
function _CorrectStringDate(val) {
    var dmy = /^\d{1,2}\.\d{1,2}\.\d{1,4}$/;

    var lpad = function(str, ch, len) {
        var l = len - str.length;
        if (l > 0) return '0'.times(l) + str;
        else return str;
    }

    if (dmy.test(val)) {
        var tokens = val.split('.');
        tokens[0] = lpad(tokens[0], '0', 2);
        tokens[1] = lpad(tokens[1], '0', 2);
        tokens[2] = lpad(tokens[2], '0', 2);

        val = tokens.join('.');
    }

    return val;
}

//нажатие на кнопку выпадания календаря
function _on_cal_button_click(event) {
  var el = Event.element(event);
  var edit_id = el.id.replace(/_calendar/, "");
  var edit = $(edit_id);
  var txt = edit.value.strip();
  if (txt != '')
      var dt = Date.parse(txt);
  else
      dt = new Date();
  if (dt == null) return;
  var cal = edit.cal;
  //var cal = Element.readAttribute(edit, "cal");
  cal.setDate(dt);
}

/**
 * Alameda calendar. Dhtmlx calendar Wrapper.
 * Provides ability to select from popup calendar and keep repeat value in input field
 */

var AlCalendar = Class.create({
    initialize: function(/*NodeId*/calName, /*NodeId*/inputFieldName, /*Boolean*/showTime, /*Boolean*/ correctFutureDates) {
        // default date format for alameda calendar
        var defaultDateFormat = "%d.%m.%Y";

        this.calEnabledImgPath = "../codebase/imgs/calendar.gif";
        this.calDisabledImgPath = "../codebase/imgs/calendar_dis.gif";

        // keep date format to object
        this.dateFormat = defaultDateFormat;

        // show time in edit box
        this.showTime = showTime;
        // init time
        this.time = "00:00:00";
        // default time value
        this.defTime = "00:00:00"; 

        // calendar options
        var options = {
            isMonthEditable: true, // - allow directly input of year from keyboard
            isYearEditable: true, // allow directly input of year from keyboard
//            btnPrev: true, // html used for render prev button
//            btnBgPrev: true, // background of prev button
//            btnNext: true, // - html used for render prev button
//            btnBgNext: true, // - background of next button
//            yearsRange : true, //- selectable years( array [from,to])
            isWinHeader: true, // - render header with buttons
            headerButtons:'', //- allowed header buttons
            isWinDrag: true // - allowed drag of calendar
        };

        // if inputFieldName parameter exists than it used as calendar name
        if (inputFieldName != null && !Object.isUndefined(inputFieldName)) {
            this._fName = inputFieldName;
            this._inputFieldExists = true;
            Event.observe(inputFieldName, 'change', this.onChangeCalendarInput.bind(this));
        } else {
            this._fName = null;
            this._inputFieldExists = false;
        }

        // creating calendar container
        var calendarCon = new Element('div', {id:calName}).setStyle({position:"absolute"});
        $(document.body).appendChild(calendarCon);

        // позицию контейнера для календаря выставляем сразу за полем ввода календаря
        try {
            Element.clonePosition(calendarCon, this._fName, {
                setLeft:    true,
                setTop:     true,
                setWidth:   false,
                setHeight:  false,
                offsetTop:  0,
                offsetLeft: Element.getWidth(this._fName) + 24
            });
        }catch(e){}


        var mCal = new dhtmlxCalendarObject(calName, false, options);

        mCal.attachEvent("onClick", this.onClick.bind(this));
        mCal.setYearsRange(1990, 2050);
        mCal.loadUserLanguage("ru");
        mCal.setDateFormat(this.dateFormat);
        mCal.winTitle = "                                           ";
        mCal.draw();
        mCal.hide();

        this.calendar = mCal;

        Event.observe(calName, 'blur', mCal.hide.bind(mCal));

        // массив слушателей события изменения значения календаря
        this.changeEventListeners = [];

        // нужно ли корректировать неполные даты более текущей
        this.correctFutureDates = Tools.def(correctFutureDates) ? correctFutureDates : false;

        // fill default date on clear
        this.required = false;
    },

    setDefaultTime: function(/*String*/time) {
        this.defTime = time;
        this.time = time;
    },

    onClick: function(/*String*/date) {
        $(this._fName).value = this.calendar.getFormatedDate(this.dateFormat, date);

        // если доступно отображение времени
        if(this.showTime) {
            this.appendTimeToInput();
        }
        // прячем календарь
        this.calendar.hide();

        // иницируем событие изменения поля
        this.callChangeEvent();
        return true;
    },

    appendTimeToInput: function() {
        $(this._fName).value = $(this._fName).value + " " + this.time;
    },

    /**
     * input field event handler
     */
    onChangeCalendarInput: function() {
        var txt = $F(this._fName);
        var v1 = _NdcDatePatterns(txt, this.correctFutureDates);
        // 19 это длина строки дата+время
        this.timeSpec = v1.length == 19;
        if (this.timeSpec) {
            var dt = Date.parse(v1);
        } else {
            dt = parseDate(txt, this.correctFutureDates);
        }

        if (dt == null) {
            $(this._fName).value = "";
        } else {
            this.setDate(dt);
        }

        // иницируем событие изменения поля
        this.callChangeEvent();
    },

    show: function() {
        this.calendar.show();
        try {
            /*
            использование try/catch связано с багом в ptototype. суть бага в следующем. Если перенести календарь,
            закрыть его, открыть, то календарь появится на месте, куда был перенесен, причем вылетит ошибка.
            после этого всё начинает рабоатть корректно.
            */
            Element.clonePosition(this.calendar.con, this._fName, {
                setLeft:    true,
                setTop:     true,
                setWidth:   false,
                setHeight:  false,
                offsetTop:  0,
                offsetLeft: Element.getWidth(this._fName) + 24
            });
        } catch(e) {}
    },

    // скрыть календарь
    hide: function() {
        this.calendar.hide();
    },

    // виден ли календарь
    isVisible: function() {
        return this.calendar.isVisible();
    },

    /**
     * Обработчик нажатия кнопки показа календаря
     */
    showBtnClick: function() {
        return this.isVisible() ? this.hide() : this.show();
    },

    // возвращает дату-строку из поля инпута
    getDateString: function() {
        return $(this._fName).value;
    },

    // возвращает объект Date, полученный из поля input
    getDateObject: function() {
        var txt = $(this._fName).value;
        return parseDate(txt, false);
    },

    setDate: function(/*Date*/dt, /*Boolean*/defTime) {
        this.calendar.setDate(dt);
        if (dt != null)
            $(this._fName).value = _two_digit(dt.getDate()) + '.' + _two_digit(dt.getMonth() + 1) + '.' + dt.getFullYear();
        if(this.showTime) {
            this.time = dt.toTimeString().substr(0, 8);
            // если время не пришло, а должно быть, то проставляем дефолтовое
            if (trim(this.time) == "" || ( Tools.def(this.timeSpec) && !this.timeSpec) || defTime) {
                this.time = this.defTime;
            }
            this.appendTimeToInput();
        }
    },

    cleanInput: function() {
        $(this._fName).value = "";
    },

    reset: function() {
        $(this._fName).value = "";
        if (this.required)
            this.setDate(new Date());
        else
            this.calendar.setDate(new Date());
        this.time = this.defTime;
    },

    setRequired: function(/*Boolean*/flag) {
        if (flag) {
            $(this._fName).addClassName("required");
            if (Tools.def(this.formDesign) && this.formDesign) {
                $(this._fName).removeClassName("calendarRepeaterInputForm");
                $(this._fName).addClassName("calendarRepeaterInput");
            };
            $(this._fName).up(0).addClassName("required");
            this.required = true;
        } else {
            $(this._fName).removeClassName("required");
            if (Tools.def(this.formDesign) && this.formDesign) {
                $(this._fName).removeClassName("calendarRepeaterInput");
                $(this._fName).addClassName("calendarRepeaterInputForm");
            };
            $(this._fName).up(0).removeClassName("required");
            this.required = false;
        }
    },

    /**
     * Устанавливает флаг, что календарь на форме с основным цветом
     */
    setFormDesign: function() {
        this.formDesign = true;
    },

    isRequired: function() {
        return $(this._fName).hasClassName("required");
    },

    /**
     * Регестрирует функцию на событие изменения в полях календаря
     * @param func
     */
    addChangeListener: function(/*Function*/func) {
        if (Object.isFunction(func)) {
            // сохраняем слушателя в локальном массиве
            this.changeEventListeners.push(func);
            // ставим на прослушивание изменения поля вручную
            //Event.observe(this._fName, "change", func);
        } else {
            throw new Error("Невозможно зарегестрировать функцию в качестве слушателя события 'change' в календаре с полем " + this._fName);
        }
    },

    /**
     * Оповещает слушателей, что случилось событие изменения календаря
     */
    callChangeEvent: function(){
        this.changeEventListeners.each(function(value) {value();}, this);
    },

    /**
     * Сделать календарь недоступным для редактирования
     */
    disable: function(/*Boolean*/flag){
        $(this._fName).readOnly = flag;
        if(flag){
            this._stopImgObserving();
            $(this.imgNode).src = this.calDisabledImgPath;
            $(this.imgNode).alt = "";
            $(this.imgNode).setStyle({cursor: ""});

        }else{
            this._startImgObserving();
            $(this.imgNode).src = this.calEnabledImgPath;
            $(this.imgNode).alt = "Открыть календарь";
            $(this.imgNode).setStyle({cursor: "pointer"});
        }
    },

    /**
     * Запускает обработку кликов по картинке
     */
    _startImgObserving: function(){
        if (Tools.def(this.imgNode) && !this.imgNodeObserved) {
            Event.observe(this.imgNode, "click", this.showBtnClick.bind(this));
            this.imgNodeObserved = true;
        }
    },

    /**
     * Останавливает обработку кликов по картинке
     */
    _stopImgObserving: function(){
        if (Tools.def(this.imgNode)) {
            Event.stopObserving(this.imgNode, 'click');
            this.imgNodeObserved = false;
        }
    },

    /**
     * Устанавивает свойства, необходимые для регистрации события клика по картинке и запускает событие на прослушку
     * @param imgNodeId id картинки которую будут слушать
     */
    observeImgClick: function(/*String*/imgNodeId){
        this.imgNode = imgNodeId;
        this.imgNodeObserved = false;
        this._startImgObserving();
    }

});


/**
 * Double Alameda calendar class.
 */

var AlDoubleCalendar = Class.create({

    DefaultValueMode:{
        CLEAN:1,
        CURRRENT_DATE:2,
        CUSTOM_DATES:3
    },

    errorMessage: "Необходимо указать корректный диапазон дат.",

    // конструктор
    initialize: function(/*NodeId*/calName1, /*NodeId*/inputFieldName1, /*NodeId*/calName2, /*NodeId*/inputFieldName2,
        /*Boolean*/showTime, /*Boolean*/ correctFutureDates) {
        this._leftCalendar = new AlCalendar(calName1, inputFieldName1, showTime, correctFutureDates);
        this._rightCalendar = new AlCalendar(calName2, inputFieldName2, showTime, correctFutureDates);
        // по умолчанию календарь чистый
        this._mode = this.DefaultValueMode.CLEAN;
        this.showTime = showTime;
        if(showTime) {
            this._leftCalendar.setDefaultTime("00:00:00");
            this._rightCalendar.setDefaultTime("23:59:59");
        }
    },

    // устанавливаем начальный режим инициализации
    setDefValueMode: function(/*DefaultValueMode*/mode, /*Date*/date, /*Date*/date2) {
        this._mode = mode;
        if (this._mode == this.DefaultValueMode.CLEAN) {
            this.defaultValue = "";
        } else if (this._mode == this.DefaultValueMode.CURRRENT_DATE) {
            this.defaultValue = new Date();
        } else if (this._mode == this.DefaultValueMode.CUSTOM_DATES) {
            this.defaultValue = Date.parse(date);
            this.defaultValue2 = Date.parse(date2);
            var time = this.defaultValue.toTimeString().substr(0, 8);
            if(this.showTime && "00:00:00"!=time && ""!=time) {
                this._leftCalendar.setDefaultTime(time);
            }
            time = this.defaultValue2.toTimeString().substr(0, 8);
            if(this.showTime && "00:00:00"!=time && ""!=time) {
                this._rightCalendar.setDefaultTime(time);
            }
        } else {
            this.defaultValue = Date.parse(date);
        }

        this.resetToDefault();
    },

    // сбрасывает значения на начальные
    resetToDefault: function() {
        if (this._mode == this.DefaultValueMode.CLEAN) {
            this._leftCalendar.reset();
            this._rightCalendar.reset();
            // ничего не делаем
        } else if (this._mode == this.DefaultValueMode.CURRRENT_DATE) {
            this.defaultValue = new Date();
            this._leftCalendar.setDate(this.defaultValue, this.showTime);
            this._rightCalendar.setDate(this.defaultValue, this.showTime);
        } else if (this._mode == this.DefaultValueMode.CUSTOM_DATES) {
            this._leftCalendar.setDate(this.defaultValue, this.showTime);
            this._rightCalendar.setDate(this.defaultValue2, this.showTime);
        } else {
            this._leftCalendar.setDate(this.defaultValue, this.showTime);
            this._rightCalendar.setDate(this.defaultValue, this.showTime);
        }
    },

    clear: function() {
        this._leftCalendar.cleanInput();
        this._rightCalendar.cleanInput();
    },

    getDateFrom: function() {
        return this._leftCalendar.getDateString();
    },

    getDateTo: function() {
        return this._rightCalendar.getDateString();
    },

    showLeft: function() {
        if (this._leftCalendar.isVisible()) {
            this._leftCalendar.hide();
        } else {
            this._leftCalendar.show();
        }
    },

    showRight: function() {
        if (this._rightCalendar.isVisible()) {
            this._rightCalendar.hide();
        } else {
            this._rightCalendar.show();
        }
    },

    // проверяет, что поля инпутов календаря не пустые
    // true - если оба поля не пустые
    checkBothFieldNotNull: function() {
        return $(this._leftCalendar._fName).value != "" && $(this._rightCalendar._fName).value != "";
    },

    // проверяет, что оба поля с датами пустые
    checkBothFieldNulls: function() {
        return $(this._leftCalendar._fName).value == "" && $(this._rightCalendar._fName).value == "";
    },

    /**
     * проверяет корректность границ календаря.
     * true - корректно
     * false - нет
     */
    checkCalendar: function() {
        // поверяем что левая дата не больше правой
        var rightDate = this._rightCalendar.getDateObject();
        var leftDate = this._leftCalendar.getDateObject();
        if (rightDate == null || leftDate == null) return false;
        return this.compareDates(leftDate, rightDate) >= 0;
    },

    /**
     * Compare two dates.
     *  if date1 < date2 return 1
     *  if date1 > date2 return -1
     *  if date1 == date2 return 0
     *
     * @param date1 first date for compare
     * @param date2 second date for compare
     */
    compareDates: function(date1, date2) {
        return DateUtils.compareDates(date1, date2);
    },

    // устанавливает сообщение об ошибке
    setErrorMessage: function(/*String*/message) {
        this.errorMessage = message;
    },

    showErrorMessage: function() {
        alert(this.errorMessage);
    },

    wrongRangeMessage: function() {
        alert("Неверно указаны границы диапазона!");
    },

    setRequired: function(/*Boolean*/flag, /*int*/mode){
        if (!Object.isUndefined(mode) && mode != null) {
            if (mode == 1) {
                this._leftCalendar.setRequired(flag);
            } else if (mode == 2) {
                this._rightCalendar.setRequired(flag);
            } else {
                alert("Неверное значение параметра 'mode' у метода AlDoubleCalendar.setRequired");
            }
        } else {
            this._leftCalendar.setRequired(flag);
            this._rightCalendar.setRequired(flag);
        }
    },

    /**
     * Регестрирует функцию на событие изменения в полях календаря
     * @param func
     */
    addChangeListener: function(/*Function*/func){
        this._leftCalendar.addChangeListener(func);
        this._rightCalendar.addChangeListener(func);
    }

});

/**
 * Утилиты для работы с датами
 */
var DateUtils = {
    /**
     * Compare two dates.
     *  if date1 less then date2 return 1
     *  if date1 > date2 return -1
     *  if date1 == date2 return 0
     *
     * @param date1 first date for compare
     * @param date2 second date for compare
     */
    compareDates: function(date1, date2) {
        if (date1.getFullYear() < date2.getFullYear()) {
            return 1;
        } else if (date1.getFullYear() > date2.getFullYear()) {
            return -1;
        } else { // if(date1.getFullYear() == date2.getFullYear())
            if (date1.getMonth() < date2.getMonth()) {
                return 1;
            } else if (date1.getMonth() > date2.getMonth()) {
                return -1;
            } else { // date1.getMonth() == date2.getMonth()
                if (date1.getDate() < date2.getDate()) {
                    return 1;
                } else if (date1.getDate() > date2.getDate()) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    },

    /**
     * Correct date using other date as pivot
     *
     * If pivot is null then correction always go 'down'
     * using current date.
     * @param d date to correct
     * @param m date for compare
     * @param updown correct 'up' or 'down' (default)
     */
    correctDate: function(/*Date*/d, /*Date*/m, /*String*/updown) {
        if (d == null) return;
        var k = -1;
        if (m == null) {
            m = new Date();
        } else if (updown === 'up') k = 1;

        if (this.compareDates(d, m) == k) {
            var dYear = d.getFullYear();
            var mYear = m.getFullYear();
            var dMonth = d.getMonth();
            var mMonth = m.getMonth();

            if (k * dYear < k * mYear) {
                d.setFullYear(mYear);
                dYear = mYear;
            }

            if (k * dMonth < k * mMonth) {
                d.setFullYear(mYear + k);
            } else if (dMonth == mMonth) {
                d.addMonths(k);
            }
        }

        return d;
    }
};

/**
 * Теги регестрируют календари в этом объекте, а после полной загрузки страницы необходимо вызвать метод init, чтобы все
 * объекты календарей корректно проинициализировались
 */
var CalendarInitializer = {
    container: [],

    /**
     * Регестрирует функцию инициализации календаря
     * @param initFunc функция инициализаии календаря
     */
    registerCalendarInit: function(/*Function*/initFunc){
        this.container.push(initFunc);
    },

    /**
     * Вызывает все зарегестрированные функции инициализации каленадрей
     */
    init: function(){
        this.container._each(function(val){
           val.call(window);
        });
    }
};
