/**
 * Perform AJAX request with JSON result
 *
 * @param params Hash instance with parameters. (For Alameda project it is necessary to include "name" parameter with servlet name)
 *               Also it could be specified message parameter. This message will be appear on error request.
 * @param callBackContext context for callbacks. By default it's "this"
 * @param callBackResultSuccess process successful result
 * @param callBackResultFailure process failure result
 * @param callBackResultError function for error processing
 */
function performJSONRequest(/*Hash*/params, /*Object*/callBackContext, /*Function*/callBackResultSuccess,
    /*Function*/callBackResultFailure, /*Function*/callBackResultError) {

    var errorDefMessage = "При попытке запроса произошла ошибка:\n";
    var message = params.get("message");
    var errorMessage = (message || errorDefMessage);
    var async = params.get("_async");
    if (Object.isUndefined(async))
        async = true;

    alameda.ajaxRequest("Ctrl", {
        parameters:params,
        onSuccess:function(transport) {
            var json = transport.responseJSON;
            if (Object.isUndefined(json) || json == null) {
                alert("Возникли проблемы при запросе данных с сервера! Не найден запрашиваемый сервлет.");
            }
            if (!json.error) {
                callBackResultSuccess.call(Object.isUndefined(callBackContext) ? this : callBackContext, json);
            }
            else {
                alert(errorMessage + json["error"]);
                callBackResultError.call(Object.isUndefined(callBackContext) ? this : callBackContext, json);
            }
        },
        onFailure: callBackResultFailure,
        asynchronous: async
    }, alameda.AjaxRequestMode.GET);
}

//----------------------------------------------------------------------------------------------------------------------
/**
 * Class DataLoaderByCode provide ability to connect to any fileds auto data loader handler. Needs to specify code
 * field id and result fields id where will load object name.
 * Processing 'change' and 'on enter click' events
 */
var DataLoaderByCode = Class.create({
    /**
     * Constructor
     * @param servletName : String servlet name
     * @param objIdNodeId : String field id where the object id keeps. can be null
     * @param codeNodeId : String field id where the object code keeps
     * @param resultNodeId : String field id where the object name keeps. can be null
     * @param objectBusinessName : String object business name
     * @param blockKey : String(Array) input and div node(nodes) id which will be block for query exucute time
     * @param errorMessage : String error message
     * @param addParams : Hash Параметры, которые передаются как есть в хеше, т.е. какие значения в хеше указаны, те и уйдут в запросе, в отличие от dynamicParams
     * @param needAlertAndClean : Boolean надо ли выводить сообщение и очищать поле в случае ошибки
     * @param needToBeUppercase : Boolean надо ли преобразовывать код к верхнему регистру
     * @param dynamicParams : Hash набор динамических параметров. В качестве значений этих параметров подставляются ID
     * элементов страницы и при формировании запроса из этих элементов вытягиваются реальные значения. НО! если необходимо,
     * чтобы параметры попали в запрос для БД надо их прописать в addParams c пустыми значениями
     * @param manualLoading : Boolean надо ли запускать загрузку из вне, а не по событиям
     */
    initialize:function(/*String*/servletName, /*NodeId*/objIdNodeId, /*NodeId*/codeNodeId, /*NodeId*/resultNodeId,
        /*String*/objectBusinessName, /*NodeId*/blockKey, /*String*/ errorMessage, /*Hash*/addParams,
        /*Boolean*/needAlertAndClean, /*Boolean*/needToBeUppercase, /*Hash*/dynamicParams, /*Boolean*/manualLoading) {

        this.servletName = servletName;

        this.objIdNodeId = objIdNodeId;
        this.codeNodeId = codeNodeId;
        this.resultNodeId = resultNodeId;
        // набор эллементов для блокирования
        this.blockKey = Tools.def(blockKey) ? (Object.isString(blockKey) ? [blockKey] : (Object.isArray(blockKey) ? blockKey : null)) : null;

        this.objectBuisenessName = objectBusinessName;
        this.errorMessage = Object.isUndefined(errorMessage) ? null : errorMessage;
        this.needsErrorMessageAndClean = Tools.def(needAlertAndClean) ? needAlertAndClean : true;
        this.needToBeUppercased = Tools.def(needToBeUppercase) ? needToBeUppercase : false;

        // description loading status
        this.loading = false;

        // asynchronous loading
        this._async = true;

        // дополнительные параметры
        this.additionalParameters = Tools.def(addParams) ? addParams : null;
        // доп динамические параметры
        this.dynamicParams = Tools.def(dynamicParams) ? dynamicParams : null;

        // by enter and blur perform description loading
        if(Object.isUndefined(manualLoading) || manualLoading == null || !manualLoading) {
            Event.observe(this.codeNodeId, "keydown", this.onKeyPress.bindAsEventListener(this));
            Event.observe(this.codeNodeId, "change", this.loadDescriptionByCode.bind(this));
        }
//        alameda.debug("поле " + codeNodeId + " проинициализировано для автозагрузки!");
    },

    onKeyPress: function(event) {
        if (event.keyCode == Event.KEY_RETURN) {
            this.loadDescriptionByCode();
            Event.stop(event);
        }
    },
    /**
     * Return object description by code . Asynchronous request!
     */
    loadDescriptionByCode: function() {
    	var r = this.beforeLoading();

        if (Tools.def(r) && r)
            return;

        if (!this.loading) {
            if (this.needToBeUppercased)
                $(this.codeNodeId).value = $F(this.codeNodeId).toUpperCase();
            if ($(this.codeNodeId).value != "") {
                // block main button
                Tools.disableElements(this.blockKey, true);
                // status loading = true
                this.loading = true;
                this.getDescriptionByCode(this, $(this.codeNodeId).value, this._loadDescriptionByCodeCallBack);
            } else {
                if (this.resultNodeId != null) {
                    $(this.resultNodeId).value = "";
                }
                if (!Object.isUndefined(this.objIdNodeId) && this.objIdNodeId != null) {
                    $(this.objIdNodeId).value = "";
                }
                this.onEmptyValueFill(this);// обработчик для клиентов класса
            }
        }
    },

    /**
     * Срабатывает на заполнение кода пустым значением
     * Абстрактный метод.
     * @param This
     */
    onEmptyValueFill:function(/*Object*/This) {
    },

    /**
     * Return object description by code . Asynchronous request!
     *
     * @param code object code
     * @param callBackResult call back function for asynchronous request
     * @param callBackContext callback function context. 'this' if undefined
     */
    getDescriptionByCode:function (/*Object*/callBackContext, /*String*/code, /*Function*/callBackResult) {

        var errorMessage = "При попытке запроса описания по его коду произошла ошибка:\n";

        var h = new Hash();
        h.set("name", this.servletName);
        h.set("code", code);
        h.set("message", errorMessage);
        h.set("_async", this._async);

        // иногда бывают дополнительные параметры, которые надо передать
        if (!Object.isUndefined(this.additionalParameters) && this.additionalParameters != null
                && Object.isHash(this.additionalParameters)) {
            h.update(this.additionalParameters);
            // собираем все названия параметров в параметр names
            var names = $A();
            names.push("code");
            names.push(this.additionalParameters.keys());
            h.set("names", names.flatten());
        }

        // иногда бывают дополнительные параметры, которые надо передать
        if (!Object.isUndefined(this.dynamicParams) && this.dynamicParams != null
                && Object.isHash(this.dynamicParams)) {
            this.dynamicParams.each(function(pair) {
                if (Tools.def($(pair.value))) {
                    h.set(pair.key, $F(pair.value));
                }
            });
        }

        performJSONRequest(h, callBackContext, callBackResult, callBackResult, callBackResult);
    },

    /**
     * loading object description by code callback
     * @param json result object
     */
    _loadDescriptionByCodeCallBack: function(/*Object*/json) {
        // if code field is empty, than do not fill data
        if ($(this.codeNodeId).value != "") {
            if ($H(json).values().length == 0 || !(json["name"] || json["NAME"] || json["id"])) {
                if (this.objIdNodeId != null) {
                    $(this.objIdNodeId).value = "";
                }
                if (this.resultNodeId != null) {
                    $(this.resultNodeId).value = "";
                }
                if (this.needsErrorMessageAndClean) {
                    alert(this._processMessage(1));
                    $(this.codeNodeId).value = "";
                }
            } else {
                if (json["id"]) {
                    if (this.objIdNodeId != null) {
                        $(this.objIdNodeId).value = json["id"];
                    }
                }
                if (json["name"] || json["NAME"]) {
                    if (this.resultNodeId != null && json["name"] ) {
                        $(this.resultNodeId).value = json["name"];
                    }else if(this.resultNodeId != null){
                        $(this.resultNodeId).value = json["NAME"];
                    }
                } else {
                    alert(this._processMessage(2));
                }
            }
        }

        // разблокируем все ранее заблокированные элементы
        Tools.undisableElements(this.blockKey, true);
        // status loading = false
        this.loading = false;

        this.afterCallBackHandler(this, /*Object*/json);
    },

    /**
     * вызывается после отбработки callback функции
     * @param This
     * @param json
     */
    afterCallBackHandler: function(/*This*/This, /*Object*/json) {

    },

    /**
     * вызывается перед началом поиска 
     */
    beforeLoading :function () {
    	return false;
    },

    /**
     * Формирует сообщение об ошибке
     * @param msgType тип сообщения (1 - объект с указанным кодом не найден; 2 - не найдено наименование с таким кодом)
     */
    _processMessage: function(/*int*/msgType) {
        var message = this.errorMessage;
        // по умолчанию ошибка, что код не найден
        msgType = Tools.def(msgType) ? msgType : 1;
        switch (msgType) {
            case 1:
                if (this.errorMessage == null) {
                    message = "Объект '$buisenessName' с кодом '$code' в системе не найден";
                }
                break;
            case 2:
                message = "Для объекта '$buisenessName' с кодом '$code' наименование не найдено";
                break;
        }
        message = message.replace("$buisenessName", this.objectBuisenessName).replace("$code", $(this.codeNodeId).value);
        return message;
    }
});

//----------------------------------------------------------------------------------------------------------------------
/**
 * Запрос следующего опердня
 * @param callBackContext контекст в котором вызывать функцию callBackResult
 * @param callBackResult колбэк после отработки запроса
 */
function getNextOperDay(/*Object*/callBackContext, /*Function*/callBackResult) {
    var errorMessage = "При попытке запроса следующего опердня произошла ошибка:\n";

    var h = new Hash();
    h.set("name", "query__get_next_oper_day");
    h.set("message", errorMessage);

    performJSONRequest(h, callBackContext, callBackResult, callBackResult, callBackResult);
}
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
/**
 * Запрос текущего опердня
 * @param callBackContext контекст в котором вызывать функцию callBackResult
 * @param callBackResult колбэк после отработки запроса
 */
function getCurrentOperDay(/*Object*/callBackContext, /*Function*/callBackResult) {
    var errorMessage = "При попытке запроса текущего опердня произошла ошибка:\n";

    var h = new Hash();
    h.set("name", "srv_get_current_oper_day");
    h.set("message", errorMessage);

    performJSONRequest(h, callBackContext, callBackResult, callBackResult, callBackResult);
}
//----------------------------------------------------------------------------------------------------------------------

/**
 * загрузчик данных по коду и другим параметрам. позволяет загружать любое количсевто полей,
 * а точнее ровно столько сколько описано в sql запросе
 */
var DataLoader = Class.create({
    /**
     * Constructor
     * @param servletName : String servlet name
     * @param codeNodeId : String field id where the object code keeps
     * @param fields : Hash набор соответствий эллементов и соответсвующих их наименований солбцов в запросе
     * @param objectBuisenessName : String object buisiness name
     * @param async : Perform async request (defaults to true)
     */
    initialize:function(/*String*/servletName, /*Array*/codeNodeId, /*Hash*/fields, /*String*/objectBuisenessName, /*boolean*/async) {
        // признак окончания инициализации объекта
        this._initCompleted = false;

        // асинхронность запроса
        if (Object.isUndefined(async))
            this._async = true
        else
            this._async = async;

        //имя сервлета
        this.servletName = servletName;
        if (!Tools.def(servletName)) {
            throw new Exception("Не объявлен обязательный параметр servletName для DataLoader");
        }

        // Необходимость преобразования кода (codeNodeId) в верхний регистр
        this.needToBeUppercased = false;

        // description loading status
        this.loading = false;

        // список элементов для которых надо установить событие изменения и нажатия клавиши
        if (!Tools.def(codeNodeId)) {
            throw new Exception("Не объявлен обязательный параметр codeNodeId для DataLoader");
        }
        this.codeNodeId = codeNodeId;

        // бизнес имя объекта
        this.objectBuisenessName = Tools.def(objectBuisenessName) ? objectBuisenessName : null;

        // хеш ассоциаций элементов и полей в пришедшем с сервера JSON
        // key - элемент на форме
        // value - имя поля из запроса
        if (!Tools.def(fields)) {
            throw new Exception("Не объявлен обязательный параметр fields для DataLoader");
        }
        if (!Object.isHash(fields)) {
            throw new Exception("DataLoader: fields должен быть Hash!");
        }
        this.fields = fields;


        // дополнительные параметры
        this.addParams = null;
        // элементы, которые надо блокироват на время загрузки данных
        this.blockNodes = null;
        // кастомное сообщение об ошибке
        this.errorMessage = null;
        // надо ли выводить сообщение об ошибке и очищать поля в случае, если объект по коду не найден
        this.showMessageAndCleanOnError = true;
        // отдельные флаги: надо ли выводить сообщение о том, что объект не найден
        this.showMessageOnError = true;
        // отдельные флаги: надо ли очищать поля в случае, если объект по коду не найден
        this.cleanOnError = true;

        // by enter and change perform description loading
        Event.observe(this.codeNodeId, "keydown", this._onKeyPress.bindAsEventListener(this));
        Event.observe(this.codeNodeId, "change", this.doLoad.bind(this));
    },

    /**
     * Выполняет инициализацию объекта
     */
    init: function() {
        this._initCompleted = true;
        return this;
    },

    /**
     * Устанавливает кастомное сообщение об ошибке
     * @param errorMesage
     */
    setErrorMessage: function(/*String*/errorMessage) {
        if (!this._initCompleted) {
            // additional params
            if (!Tools.def(errorMessage)) {
                throw new Exception("DataLoader.setErrorMessage: errorMessage = null!");
            }
            if (!Object.isString(errorMessage)) {
                throw new Exception("DataLoader.setErrorMessage: blockNodes должен быть String!");
            }
            this.errorMessage = errorMessage;
        }
        return this;
    },


    /**
     * Устанавливает необходимость преобразования кода в верхний регистр
     * @param - Boolean 
     **/
    setNeedToBeUppercased: function(/*Boolean*/param){
        this.needToBeUppercased = param;
        return this;
    },

    /**
     * Показывать или нет сообщение об ошибке в случае, если не найден объект по коду и очищать ли поля
     * @param flag boolean true - да, false - нет
     */
    setShowMessageAndCleanOnError: function(/*Boolean*/flag){
        if (!this._initCompleted) {
            // additional params
            if (!Tools.def(flag)) {
                throw new Exception("DataLoader.setShowMessageAndCleanOnError: flag is null!");
            }
            this.showMessageAndCleanOnError = flag;
            this.showMessageOnError= flag;
            this.cleanOnError= flag;            
        }
        return this;
    },

    setErrorHandlingParameters: function(/*Boolean*/flagClean, /*Boolean*/flagShowMessage) {
        if (!this._initCompleted) {
            // additional params
            if (!Tools.def(flagClean)) {
                throw new Exception("DataLoader.setShowMessageAndCleanOnError: flag CleanOnError is null!");
            }
            if (!Tools.def(flagShowMessage)) {
                throw new Exception("DataLoader.setShowMessageAndCleanOnError: flag ShowMessageOnError is null!");
            }
            this.showMessageOnError= flagShowMessage;
            this.cleanOnError= flagClean;
            if (!this.showMessageOnError || !this.cleanOnError)
                this.showMessageAndCleanOnError = false;
            else
                this.showMessageAndCleanOnError = true;
        }
        return this;
    },

    /**
     * Устанавливает дополнительные параметры
     * @param params
     */
    setAdditionalParams: function(/*Hash*/params) {
        if (!this._initCompleted) {
            // additional params
            if (!Tools.def(params)) {
                throw new Exception("DataLoader.setAdditionalParams: params = null!");
            }
            if (!Object.isHash(params)) {
                throw new Exception("DataLoader.setAdditionalParams: addParams должен быть Hash!");
            }
            this.addParams = params;
        }
        return this;
    },

    /**
     * Устанавливает список елементов которые надо блокировать на время загрузки
     * @param blockNodes
     */
    setBlockingNodes: function(/*Array*/blockNodes) {
        if (!this._initCompleted) {
            // blocking nodes
            if (!Tools.def(blockNodes)) {
                throw new Exception("DataLoader.setBlockingNodes: blockNodes = null!");
            }
            if (!Object.isArray(blockNodes)) {
                throw new Exception("DataLoader.setBlockingNodes: blockNodes должен быть Array!");
            }
            this.blockNodes = blockNodes;
        }
        return this;
    },

    _onKeyPress: function(event) {
        if (event.keyCode == Event.KEY_RETURN) {
            this.doLoad();
            Event.stop(event);
        }
    },
    /**
     * Return object description by code . Asynchronous request!
     */
    doLoad: function() {
        if (!this._initCompleted) {
            throw new Error("DataLoader: Перед запуском загрузки надо сначала выполнить DataLoader.init()");
        }
        if (!this.loading) {
            if ($(this.codeNodeId).value != "") {
                //преобразование в верхний регистр
                if (this.needToBeUppercased)
                    $(this.codeNodeId).value = $F(this.codeNodeId).toUpperCase();
                // block main button
                this._disableBlockingElems(true);
                // status loading = true
                this.loading = true;
                this.getDescriptionByCode(this, $F(this.codeNodeId), this._loadDescriptionByCodeCallBack);
            } else {
                // очистим все поля, в которые должны попадать результаты запроса
                this._clearFields();
                this.onEmptyValueFill(this);// обработчик для клиентов класса
            }
        }
        return this;
    },

    _disableBlockingElems: function(flag) {
        if(flag){
            Tools.disableElements(this.blockNodes, true);
        }else{
            Tools.undisableElements(this.blockNodes, true);
        }
    },

    _clearFields: function() {
        // очистим все поля, в которые должны попадать результаты запроса
        this.fields.each(function(pair) {
            $(pair.key).value = "";
        });
    },

    _fillFields: function(json) {
        this.fields.each(function(pair) {
            var columnName = pair.value;
            var columnNameUpper = pair.value.toUpperCase();
            if (Tools.def(json[columnName])) {
                $(pair.key).value = json[columnName];
            } else if (Tools.def(json[columnNameUpper])) {
            	$(pair.key).value = json[columnNameUpper];
            } else {
                throw new Exception("Не найден элемент " + columnName + " в json объекте");
            }
        });
    },

    /**
     * Срабатывает на заполнение кода пустым значением
     * Абстрактный метод.
     * @param This
     */
    onEmptyValueFill:function(/*Object*/This) {
    },

    /**
     * Return object description by code . Asynchronous request!
     *
     * @param code object code
     * @param callBackResult call back function for asynchronous request
     * @param callBackContext callback function context. 'this' if undefined
     */
    getDescriptionByCode:function (/*Object*/callBackContext, /*String*/code, /*Function*/callBackResult) {
        var errorMessage = "При попытке запроса описания по его коду произошла ошибка:\n";

        var h = new Hash();
        h.set("name", this.servletName);
        h.set("code", code);
        h.set("message", errorMessage);

        // собираем все названия параметров в параметр names
        var names = $A();
        names.push("code");

        // иногда бывают дополнительные параметры, которые надо передать
        if (this.addParams != null) {
            h.update(this._loadAdditionalParameters());
            names.push(this.addParams.keys());
        }
        h.set("names", names.flatten());
        h.set("_async", this._async);
        alameda.debug(h);
        performJSONRequest(h, callBackContext, callBackResult, callBackResult, callBackResult);
    },

    /**
     * Для дополнительных динамических параметров (такие парамеры, данные в которых могут меняться в течении жизни страницы)
     * достает актуальные данные
     */
    _loadAdditionalParameters: function() {
        var realAddParams = $H();
        this.addParams.each(function(pair) {
            if (pair.key.startsWith("d_")) {
                realAddParams.set(pair.key, $F(pair.value));
            } else {
                realAddParams.set(pair.key, pair.value);
            }
        });
        return realAddParams;
    },

    /**
     * loading object description by code callback
     * @param json result object
     */
    _loadDescriptionByCodeCallBack: function(/*Object*/json) {
        // if code field is empty, than do not fill data
        if ($F(this.codeNodeId) != "") {
            if ($H(json).values().length == 0 || ($H(json).values().length == 1 && json.ok == true)) {
                if (this.showMessageAndCleanOnError || this.showMessageOnError || this.cleanOnError) {
                    // очистим все поля, в которые должны попадать результаты запроса
                    var message = this._processMessage(this.objectBuisenessName, $F(this.codeNodeId));

                    if (this.showMessageAndCleanOnError || this.showMessageOnError)
                        alert(message);
                    if (this.showMessageAndCleanOnError || this.cleanOnError) {
                        $(this.codeNodeId).value = "";
                        this._clearFields();
                    }
                }
            } else if (json["error"]) {
                alameda.debug(json["error"]);
            } else {
                this._fillFields(json);
            }
        }
        // разблокируем все нужные эллементы
        this._disableBlockingElems(false);
        // status loading = false
        this.loading = false;

        this.afterCallBackHandler(this, /*Object*/json);
    },

    /**
     * вызывается после отбработки callback функции
     * @param This
     * @param json
     */
    afterCallBackHandler: function(/*This*/This, /*Object*/json) {
    },

    _processMessage: function(/*String*/buisenessName, /*String*/code) {
        var message = this.errorMessage;
        if (this.errorMessage == null) {
            message = "Объект '$buisenessName' с кодом '$code' в системе не найден";
        }
        message = message.replace("$buisenessName", buisenessName).replace("$code", code);
        return message;
    }
});
