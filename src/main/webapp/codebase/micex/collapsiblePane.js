// Функции для управлениями двумя панелями: параметров запроса и 
// результатов поиска
var isInitialState = false;   // флаг, сигнализирующий о том, что окно находится
                              // в начальном состоянии (поиск еще не проводился)
var displayMode;              // search - устанавливаются параметры запроса
                              // view   - просмотр результатов поиска
var visualEffect;             // fade   - простое исчезновение/появление
                              // slide  - схлопывание по верткали/выпадение
var isParametersPaneVisible;
var isResultsPaneVisible;

var searchPane;               
var resultsPane;
var alertDiv;
var alertMessage = 'Внимание! Изменились параметры поиска!<br>'+'Результаты поиска могут не соответствовать параметрам!';

var searchButton;
var searchHeader;

var resultsButton;
var resultsHeader;


// Создание определения объекта Node для MS Internet Explorer  
if (document.all) {
    Node = { ELEMENT_NODE: 1 };
}

// Инициализирует параметры панелей, устанавливает режим отобраения по умолчанию.
// 
// Параметры: 
//    searchPaneName    - id тега fieldset, в котором расположены контролы для 
//                        установки параметров запроса
//    resultsPaneName   - id тега fieldset, в котором расположены результаты 
//                        поиска
//    alertDivName      - id области, куда записывается предупреждение об 
//                        изменении параметров поиска
//    visualEffectName  - имя визуального эффекта для сокрытия/отображения 
//                        панелей (см. прим. к visualEffect)
function setPanesParameters (searchPaneName, resultsPaneName, alertDivName, visualEffectName, 
                             searchButtonId, resultsButtonId, searchButtonValue, resultsButtonValue ) {
    displayMode = 'search';
    
    searchPane = $(searchPaneName);
    resultsPane = $(resultsPaneName);
    alertDiv = $(alertDivName);
    
    isParametersPaneVisible = true;
    isResultsPaneVisible = false;

    if (searchButtonId == undefined ) {
        searchButton = $('l_params');
    } else {
        searchButton = $(searchButtonId);
    }
    
    if (searchButtonValue == undefined ) {
        searchHeader = "Параметры поиска";
    } else {
        searchHeader = searchButtonValue;
    }
    
    if (resultsButtonId == undefined) {
        resultsButton = $('l_results');
    } else {
        resultsButton = $(resultsButtonId);
    }
    
    if (resultsButtonValue == undefined) {
        resultsHeader = "Результаты поиска";
    } else {
        resultsHeader = resultsButtonValue;
    }
    updateHeaders();

    if (visualEffectName != undefined && visualEffectName != null) {
        visualEffect = visualEffectName;
    } else {
        visualEffect = 'fade';
    }

    showPane(searchPane, isParametersPaneVisible);
    showPane(resultsPane, isResultsPaneVisible);
    setSearchMode();
}

// Переключение в режим ввода параметров запроса
function setSearchMode() {
    if (displayMode == 'view' || isInitialState) {
        displayMode = 'search';
        if (isResultsPaneVisible) {
            showPane( resultsPane, false);
            isResultsPaneVisible = false;
        }
        if (Tools.def(alertDiv)) {
            alertDiv.innerHTML = alertMessage;
        }
        updateHeaders();    
    }
}

// Переключение в режим отображения результатов поиска
function setViewMode() {
    if (displayMode == 'search') {
        displayMode = 'view';
        if (!isResultsPaneVisible) {
            showPane(resultsPane, true);
            isResultsPaneVisible = true;
        }
        if (Tools.def(alertDiv)) {
            alertDiv.innerHTML = '';
        }
        updateHeaders();
    }
}

function onClickLegend(pane_kind) {
    if (pane_kind == 'params') {
        showPane(searchPane, !isParametersPaneVisible );
        isParametersPaneVisible = !isParametersPaneVisible;
    } else if (pane_kind == 'results') {
        showPane(resultsPane, !isResultsPaneVisible );
        isResultsPaneVisible = !isResultsPaneVisible;
    }
    updateHeaders();
}

function updateHeaders () {
    if (isParametersPaneVisible) {
        searchButton.innerHTML = "<sup>[-]</sup>          " + searchHeader;
    } else {
        searchButton.innerHTML = "<sup>[+]</sup>          " + searchHeader;
    }
    if (isResultsPaneVisible) {
        resultsButton.innerHTML = "<sup>[-]</sup>         " + resultsHeader;
    } else {
        resultsButton.innerHTML = "<sup>[+]</sup>         " + resultsHeader;;
    }        
}

// Принудительное отображение/сокрытие панели.
// 
// Параметры:
//    pane        - элемент-панель (полученная из $(paneName)
//    makeVisible - флаг видимости (true | false)
function showPane (pane, makeVisible) {
    $A(pane.childNodes).each(
        function(child){
            if ( child.nodeType == Node.ELEMENT_NODE && 
                 child.tagName != 'LEGEND') {
                if (makeVisible) {
                    switch (visualEffect) {
                        case 'slide':
                            new Effect.SlideDown(child, {duration:0.3});
                            break;
                        case 'fade': 
                        default:
                            new Effect.Appear(child, {duration:0.3}); 
                            break;
                    }
                } else {
                    switch(visualEffect) {
                        case 'slide':
                            new Effect.SlideUp(child, {duration:0.3}); //
                            break;
                        case 'fade':
                        default:
                            new Effect.Fade(child, {duration:0.3}); 
                            break;
                    }
                    
                }    
            }
        }
    );
}

function commonTopFieldsInitRules (controls) {
    $A(controls).each(
        function(field){
            if (field.indexOf('p_') == 0 ) {
                Event.observe(field, "keypress", setSearchMode);
                Event.observe(field, "change", setSearchMode);
            }
            if (field.indexOf('r_') == 0 || field.indexOf('ch_') == 0) {
                Event.observe(field, "click", setSearchMode);
            }
        }
    );
}
