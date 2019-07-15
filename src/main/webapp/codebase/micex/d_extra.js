/* 
Patches.
1)Added bold attribute to dhtmlxgrid.css selected rows
Mike - should be moved to 2.0
*/

var datamode="json";

//patch - from deprecated file
dhtmlXGridObject.prototype.setOnColumnSort=function(func){
    this.attachEvent("onBeforeSorting",func);
};

//Patch - убран вызов события onCellChanged. Оно может и пригодиться потом.
dhtmlXGridCellObject.prototype.setCValue=function(val){
    this.cell.innerHTML=val;
};



//join strings using delimeter
String.prototype.join=function(ar, delim){
    var res='';
    for (var i=0; i < ar.length; ++i){
        if (i > 0) res += delim;
        res+=ar[i];
    }
    return res;
};

dhtmlXGridObject.prototype.isRowVisible=function(id){
    var row=this.getRowById(id);
    if(!row)return false;
    return row.style.display!="none";
}

/*
 * Получить номер первой видимой в гриде строки (нумерация с нуля).
 * Возвращает -1, в случае, если таких строк нет.
 */
dhtmlXGridObject.prototype.getFirstVisibleRow=function(){
    var n=this.getRowsNum();
    if (n == 0) return -1;
    if (!Object.isUndefined(this._smart_rendering))
        return 0;//there are no hidden rows in dynamic grid
    for (var i = 0; i<n; ++i){
        var id=this.getRowId(i);
        if (this.isRowVisible(id)) return i;
    }
    return -1;
}

dhtmlXGridObject.prototype.selectFirstVisibleRow=function(){
    var n=this.getFirstVisibleRow();
    if (n==-1)return;
    this.selectRow(n, true);
}

/*fast version of setRowHidden (for use in cycles). Requires setSizes call after cycle*/
dhtmlXGridObject.prototype.setRowHiddenFast=function(id,state){
    convertStringToBoolean(state);
    var row=this.getRowById(id);
    if(!row)return;
    if (row.expand==="")this.collapseKids(row);
    if ((state)&&(row.style.display!="none")){
        row.style.display="none";
        var z=this.selectedRows._dhx_find(row);
        if (z!=-1){
            row.className=row.className.replace("rowselected","");
            for (var i=0;i<row.childNodes.length;i++)
                row.childNodes[i].className=row.childNodes[i].className.replace(/cellselected/g,"");
            this.selectedRows._dhx_removeAt(z);
        }
        //this.callEvent("onGridReconstructed",[])
    }
    if ((!state)&&(row.style.display=="none")){
        row.style.display="";
        //this.callEvent("onGridReconstructed",[])
    }
    //this.setSizes()
};


/*Get specified cell text*/
dhtmlXGridObject.prototype.cellText = function (rowId, cellInd) {
    return this.cells(rowId, cellInd).getValue();
};

/*Get specified cell text*/
dhtmlXGridObject.prototype.setCellText = Prototype.Browser.IE?
    function (rowId, cellInd, text) {
        var cell=this.cells(rowId, cellInd).cell;
        cell.title = text;
        // Difference between browsers, cause here we have value from
        // dhtmlXGridObject.prototype.cellText where value takes from cell.innerText
        // That's mean that IE can work faster with innerText, but WebKit browsers
        // ignoring innerText and working with innerHTML (as well as cellText getting
        // that escaped value)
        cell.innerText = text;
        if (text != '') cell._clearCell=false;
    }:
    function (rowId, cellInd, text) {
        var cell=this.cells(rowId, cellInd).cell;
        cell.title = text;
        cell.innerHTML = text; // WebKit variant
        if (text != '') cell._clearCell=false;
    };

/*patch  from v 1/6 */
/*
dhtmlXGridObject.prototype.getSelectedRowId=function(){
     var selAr = new Array(0);
     var uni = {};
     for (var i = 0;i < this.selectedRows.length;i++){
         var id = this.selectedRows[i].idd;
         if (uni[id])continue;
         selAr[selAr.length]=id;
         uni[id]=true
     }
     if (selAr.length == 0)
         return null;
     else
        return selAr.join(this.delim)
};*/

//Column used for sorting for the last time
dhtmlXGridObject.prototype.mc_lastSortCol=-1;
//last sort direction
dhtmlXGridObject.prototype.mc_sortDir='';

/**
 * Current sort state
 * return Array - [last column sorted index,sort direction]
 */
dhtmlXGridObject.prototype.getCurrentSortStateHash = function() {
    return $H({orderby:this.mc_lastSortCol, direct:this.mc_sortDir});
};

/*
Get sorting state. Works correctly if there were no sorts before.
ind - index of col currently sorted
*/
dhtmlXGridObject.prototype.getSortingStateEx=function(ind){
    var res=new Array(2);
    if (!Object.isUndefined(ind)){
        if (this.mc_lastSortCol!=ind){
            this.mc_lastSortCol=ind;
            this.mc_sortDir="asc";
        }else{
            this.mc_sortDir=(this.mc_sortDir=='des'?'asc':'des');
        }
    }
    res[0]=this.mc_lastSortCol;
    res[1]=this.mc_sortDir;
    return res;
};

/*
 * Hide sorting arrow. Suggested to be private.
 */
dhtmlXGridObject.prototype._hideSortArrow=function(){
    if (this.mc_lastSortCol==-1) return;
    this.setSortImgState(false, this.mc_lastSortCol);
};

/*patch to wait for v 1.6
 * Mike - function exists in 2.0. Should be removed from here
 */
/*
dhtmlXGridObject.prototype.selectRowById=function(row_id, multiFL, show, call){
    var row=this.getRowById(row_id);
    if (!row) return;
    if (!call)call=false;
    this.selectCell(row, 0, call, multiFL, false, show);
}*/

/*Support for column moving*/
//private
dhtmlXGridObject.prototype._removeAt=function(ar,ind){
    var tmpAr=new Array(ar.length-1);
    for (var i=0; i<ind; ++i)
        tmpAr[i]=ar[i];
    for (i=ind+1; i<ar.length; ++i)
        tmpAr[i-1]=ar[i];
    return tmpAr;
};


//on col move handler - private
dhtmlXGridObject.prototype._updateColMapping=function(sInd,tInd){//sInd-from, tInd-to, zero-based
    this.arColPos=this._moveColHelper(this.arColPos, sInd, tInd);
    return true;
};

dhtmlXGridObject.prototype._moveColHelper=function(ar, from, to){
    var moveValue=ar[from];
    var tmp=this._removeAt(ar,from);
    tmp=_insertAt(tmp,to,moveValue);
    return tmp;
};

/* private. 
 * Helper function to implement column moving. Receives an array of stored column positions (arColPos array).
 * Implements series of steps to move grid columns from initial position (sequential indexing - 0,1,2,3,...)
 * to a given array of positions.
 */
dhtmlXGridObject.prototype._implementColMoving=function(ar){
    var len = ar.length;
    var arStart = $A($R(0, len-1));
    for (var i=0;i<len;++i){
        if (ar[i] == arStart[i])continue;
        var fromPos=arStart.indexOf2(ar[i]);
        this.moveColumn(fromPos, i);
        arStart=this._moveColHelper(arStart,fromPos,i);
    }
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

dhtmlXGridObject.prototype._onContextMenuClick=function(id){
    var gr=this.gridObj;
    //save cell
    gr._selectCellInSelectedRow(gr._mouseColIndex);
    if (id=='clear'){
        gr.clearFilters(true);
    }
    else if (id=='apply'){
        gr.applyFilters();
    }
    else if (id=='excel'){
        gr.queryExcelFile();
    }
    else if (id=='view'){
        var data = $H();
        data.set('name', "extraView");
        data.set('winWidth', 300);      // Ширина окна
        data.set('winHeight', 200);     // Высота окна
        data.set('text', gr.getCellValue(gr.getSelectedRowId(),gr._colIds[gr.cell.cellIndex]));
        
        var res = showChild(data);
    }
};

dhtmlXGridObject.prototype.applyFilters=function(func){
    if (!this._smart_rendering)
        this._applyClientFilters(this);
    else
        this._realInternalFiltering(this, undefined, func);
};

dhtmlXGridObject.prototype.applyFiltersIfAny=function(func){
    if (!this._smart_rendering){
        if (!this.filterPositions)return;
        var h = this._getFilterHashCl();
        if (h.keys().length>0)
            this._applyClientFilters(this);
        if (!Object.isUndefined(func)){
            if (typeof(func)=='function')
                func();
            else {
                var ind=this.getRowIndex(func);
                if (ind != -1)
                    this.selectRow(ind, true);
            }
        }
    }
    else{
        var h2 = this.getFilterHash();
        if (h2.keys().length>0)
            this._realInternalFiltering(this, undefined, func);
    }
};

dhtmlXGridObject.prototype.loadWithFilters=function(func){
    if (!this._smart_rendering)
        alert('Function loadWithFilters is not suggested to be used in static grids');
    else{
        this._realInternalFiltering(this, true, func);
    }
};

dhtmlXGridObject.prototype._initMenu=function(){
    if (!Object.isUndefined(this._menu)) return;
    this._menu = new dhtmlXMenuObject();
    this._menu.gridObj=this;
    with(this._menu){
        setImagePath(this.imgURL);
        renderAsContextMenu();
        setOpenMode('web');
        addNewChild(null, 0, 'apply', 'Применить фильтры');
        addNewChild(null, 1, 'clear', 'Очистить фильтры');
        //либо есть прямое разрешение на выгрузку в Эксель (через галочку в правах)
        var excelAllowed = !Object.isUndefined(window.pageOptions) && !Object.isUndefined(window.pageOptions.excel) && window.pageOptions.excel == true;
        //либо НЕТ флага блокировки Экселя - тогда тоже можно выгружать - флаг выставляем только на особо защищаемых формах
        var excelDisabled = !Object.isUndefined(window.pageOptions) && !Object.isUndefined(window.pageOptions.excel_blocked) && window.pageOptions.excel_blocked == true;
        if (!excelDisabled || excelAllowed){
            // либо это обычная форма, а если это особозащищенная форма, то должны быть права на выгрузку
            addNewChild(null, 2, 'excel', 'Выгрузить в Excel');
        }
        addNewChild(null, 3, 'view', 'Просмотр');
        addContextZone(this.entBox.id);
        attachEvent('onClick', this._onContextMenuClick);
        // Сокрытие контекстного меню, при нажатии в гриде вне меню.
        this.attachEvent('onRowSelect',function(){_hideContextMenu();});
    }
};

dhtmlXGridObject.prototype.init_extra=function(colNum){
    if (Object.isUndefined(this.safeColCount))this.safeColCount=colNum;
    else if (this.safeColCount!=colNum) alert("init_extra called with wrong number of columns!");
    this.arColPos = $A($R(0, colNum-1));
    //проставим id для колонок - от 1 до числа колонок (до перестановки их)
    var r = $A($R(1,this.safeColCount)).join("^");
    this.setColumnIdsSafe(r);

    this.enableMultiselect(false); //Убираем множественное выделение строк
    this.attachEvent("onBeforeCMove",this._updateColMapping);
    //always select first row after sorting
    this.attachEvent("onAfterSorting",function(){if (this.getRowsNum()>0) this.selectFirstVisibleRow(); /*this.selectRow(0,true);*/});
    //select this column cell in the selected row before client sorting in order to select it again after soring in selectRow
    this.attachEvent("onBeforeSorting",this._selectCellInSelectedRow);
    this.attachEvent("onXLE", this._saveSizes);
    // заполняет чекбоксы для вновь загруженных строчек, если была нажата кнопка "выбрать все строки"
    this.attachEvent("onXLE", this._checkboxesSelectionControl.bind(this));
    this.attachEvent("onKeyPress", this._onKeyPressHandler);
    this.attachEvent("onResizeEnd", this._onResizeEnd);
    //save current column for context menu handlers
    this.attachEvent("onMouseOver",function(id,ind){this._mouseColIndex=ind;return true;});
    //this._initMenu();
    //this.attachEvent("onXLE", function(){
    //this.callEvent("onAfterClientFiltering",[this.getRowsNum() > 0 ? 0 : undefined]);
    //});
    this._firstOnXLE=true;
};

dhtmlXGridObject.prototype._selectCellInSelectedRow=function(ind){
    if (this.getRowsNum()>0){
        var cRowId=this.getSelectedRowId();
        if (cRowId==null)return true;
        var cRow=this.getRowById(cRowId);
        //save cell ind in class field - for dynamic grids - selected cell is cleared after grid.clearAll
        this._selectedCellIndex=ind;
        this.selectCell(cRow,ind,false,false,false,false);
    }
    return true;
}

dhtmlXGridObject.prototype._onResizeEnd=function(){
    this._columnsResized = 1;
};

var _grid = new Array();

function registerGrid(grid){
    if (_grid.indexOf2(grid) == -1)
        _grid.push(grid);
}


dhtmlXGridObject.prototype._onKeyPressHandler=function(keyCode, ctrlKey, shiftKey){
    if (keyCode == 67 && ctrlKey == true && shiftKey == false){//Ctrl + C - copy row and header to clipboard
        var rowId = this.getSelectedRowId();
        if (rowId == null) return true;
        this.setCSVDelimiter('\t');
        this.rowToClipboard(rowId);
        return true;
    }
    if (keyCode == 67 && ctrlKey == true && shiftKey == true){//Ctrl + Shift + C - copy selected cell to clipboard
        rowId = this.getSelectedRowId();
        var cellId = this.getSelectedCellIndex();
        if (rowId == null) return true;
        this.setCSVDelimiter('\t');
        this.cellToClipboard(rowId, cellId);
        return true;
    }
    if (keyCode == 79 && ctrlKey == true && shiftKey == true){//Ctrl + Shift + O - clear and unapply filters
        this.clearFilters(true);
        return true;
    }
//    alert(keyCode + ' ' + ctrlKey + ' ' + shiftKey);
    return true;
};

dhtmlXGridObject.prototype._saveSizes=function(force_read){
    if (force_read != true)
        if (!Object.isUndefined(this._doneSaveSizes)) return;
    if (Object.isUndefined(this._doneSaveSizes))
        addWinBeforeUnloadHandler(_checkSizeChanged);
    this._doneSaveSizes = 1;
    //save column widths
    //this._startWidths = new Array(this.safeColCount);
    //for (var i = 0; i < this.safeColCount; ++i)
    //    this._startWidths[i] = this.getColWidth(i);
    //save column positions
    if (!Object.isUndefined(this.arColPos))//clone arColPos if it already exists
        this._startColPos = this.arColPos.clone();
    else //use same initialization otherwise
        this._startColPos = $A($R(0, this.safeColCount-1));
    registerGrid(this);
};

var _processed_size_check = false;
function _checkSizeChanged(){
    if (_processed_size_check) return;
    _processed_size_check = true;
    for (var i=0;i<_grid.length;++i){
        _processOneGrid(_grid[i]);
    }
}

function _processOneGrid(gr)
{
    var dirtySize = false;
    if (gr._columnsResized == 1) dirtySize = true;
    //alert(gr.arColPos);
    /*
    for (var i=0;i<gr.safeColCount;++i)
    {
        var curWidth=gr.getColWidth(i);
        if (isNaN(gr._startWidths[i]) && isNaN(curWidth))continue;
        if (gr._startWidths[i] != curWidth){
            //alert('i=' + i + " old=" + gr._startWidths[i] + " new=" + curWidth);
            dirtySize=true;
            break;
        }
    }*/
    var dirtyPos = false;
    for (var i=0;i<gr.safeColCount;++i)
        if (gr.arColPos[i] != gr._startColPos[i]){
            dirtyPos=true;
            break;
        }
    if (!dirtySize&&!dirtyPos) return;
//    var mes;
//    if (dirtySize&&dirtyPos)mes="Размеры и положения";
//    else if (dirtySize)mes="Размеры";
//    else mes="Положения";
//    if (window.confirm(mes+" колонок были изменены. Сохранить изменения?")){
    if (window.windowAsk("Сохранить измененный шаблон?")){
        var name=gr.entBox.id;
        //alert(name);
        var exp=new Date();
        var oneYearFromNow=exp.getTime()+(365*24*60*60*1000);
        exp.setTime(oneYearFromNow);
        var param="expires="+exp.toGMTString();
        if (dirtySize || dirtyPos){
            gr.saveSizeToCookie2(name,param);
            gr.saveOrderToCookie2(name,param);
        }
    }
}

//get real column position (after column moving)
dhtmlXGridObject.prototype.getRealPos=function(colIndex){
    //if we got an error in next line - init_extra wasn't called!
    return this.arColPos.indexOf2(colIndex);
};

//get grid cell value by rowId and column ID (set in setColumnsInfo)
dhtmlXGridObject.prototype.getCellValue=function(rowId, colId){
    var colIndex = this._colIds.indexOf(colId);
    if (colIndex == -1){
        alert("ID '" + colId + "' is not found in current grid (method getCellValue)! Check misspellings!");
        return "";
    }
    var colRealPos = this.getRealPos(colIndex);
    var colType = this.getColType(colRealPos);
    if(colType == "ch"){
        return this.cells(rowId, colRealPos).isChecked() ? '1' : '0';
    } else {
        var txt = this.cellText(rowId, colRealPos);
        if (txt == '&nbsp;') return '';
        return txt;
    }
};

//set value for specified grid cell
dhtmlXGridObject.prototype.setCellValue=function(rowId, colId, value){
    var colIndex = this._colIds.indexOf(colId);
    if (colIndex == -1){
        alert("ID '" + colId + "' is not found in current grid (method setCellValue)! Check misspellings!");
        return;
    }
    var colRealPos = this.getRealPos(colIndex);
    var colType = this.getColType(colRealPos);
    if(colType == "ch"){
        var cl=this.cells(rowId, colRealPos);
        var oldval=cl.isChecked();
        var newval=value != '0';
        cl.setChecked(newval);
        if (oldval!=newval)
            this.callEvent("onCheckbox",[rowId,colIndex,value]);
    } else {
        this.setCellText(rowId, colRealPos, value);
    }
};

//text, w_px/w_pc, align, sort, type, filter, hidden
dhtmlXGridObject.prototype.setColumnsInfo=function(arInfo){
    var sz = arInfo.length;
    var headers = new Array(sz);
    var widths = new Array(sz);
    var aligns = new Array(sz);
    var sorting = new Array(sz);
    var coltypes = new Array(sz);
    var width_pix;
    //storage for column types. Will be needed for server filtering
    this._colTypes = new Array(sz);

    //filters for attachHeader2
    this._row2Filters = new Array(arInfo.length);
    //column ids for data retrieval
    this._colIds = new Array(sz);
    //array of hidden cols positions
    this._hiddenColPos = new Array();

    if (Object.isUndefined(arInfo[0].w_pc))
        width_pix = 1;
    else
        width_pix = 0;
    this.flagpos=-1;
    for (var i = 0; i < sz; ++i){
        var col = arInfo[i];
        if (Object.isUndefined(col.id))
            this._colIds[i] = col.text;
        else
            this._colIds[i] = col.id;
        if (!Object.isUndefined(col.hidden) && col.hidden){
            headers[i]= Object.isUndefined(col.text) ? '' : col.text;
            widths[i]='0';
            aligns[i]='left';
            sorting[i]='strspec';
            coltypes[i]= col.type || 'ro';
            this._hiddenColPos.push(i);
            this._row2Filters[i] ='#rspan';
            this._colTypes[i] = sorting[i];
            continue;
        }
        headers[i] = col.text;
        if (width_pix == 1) {
            if (Object.isUndefined(col.w_px)) {
                alert("w_px property not set for column at index " + i + "!");
                return;
            }
            widths[i] = String(col.w_px);
        }
        else {
            if (Object.isUndefined(col.w_pc)) {
                alert("w_pc property not set for column at index " + i + "!");
                return;
            }
            widths[i] = String(col.w_pc);
        }
        aligns[i]=col.align;
        sorting[i]=col.sort=='str' ? 'strspec':col.sort;
        if (Object.isUndefined(sorting[i])){
            alert("sort property not set for column at index " + i + "!");
            return;
        }
        coltypes[i]=col.type;
        if (Object.isUndefined(col.filter))
            this._row2Filters[i] = '#textfilter'; //'#rspan';
        else{
            this._row2Filters[i]=col.filter;
            if (col.filter=='#flag')this.flagpos=i;
            if (col.filter=='#checkboxfilter')sorting[i]='int';
        }
        this._colTypes[i] = sorting[i];
    }
    this.setHeaderSafe(headers.join("^"));
    if (width_pix == 1){
        this.widthPixel = true;
        this.setInitWidthsSafe(widths.join("^"));
    }
    else {
        this.widthPercent = true;
        this.setInitWidthsP(widths.join());
    }
    this.setColAlignSafe(aligns.join("^"));
    this.setColSortingSafe(sorting.join("^"));
    this.setColTypesSafe(coltypes.join("^"));
    //support for native column hiding
    for (i=0; i<widths.length; ++i){
        if (widths[i]=='0')
            this.setColumnHidden(i, true);
    }
    this.init_extra(sz);
};

//safety envelopes
// Checks for equivalence between amount of table columns and amount of 
// parameters given in the function. Counter of columns is set under the first
// calling of any 'safety'-function and after it can't be changed.
// Parameters: 
//  str           - parameters of table representation
//  funcName      - name of wrapper function
//  extSplitSign  - sign which determines the necessity of smart string splitting

dhtmlXGridObject.prototype._checkSafeCounter=function(str, funcName, extSplitSign)
{
//    alert('funcName=' + funcName + ' str=' + str);
    var ids;
    var result = true,
        eSign = false;

    if (extSplitSign != null)
        eSign = extSplitSign;
    var old=this.delim;
    this.delim='^';
    ids = (eSign)? this._eSplit(str) : ids = str.split("^");
    this.delim=old;
    if (Object.isUndefined(this.safeColCount))
    {
        this.safeColCount=ids.length;
    }
    else if (this.safeColCount!=ids.length)
    {
        result = false;
    }
    return result;
};

dhtmlXGridObject.prototype._setValues=function(str, funcName, funcStr, eSplit){
    if (this._checkSafeCounter(str, funcStr, eSplit)) {
        var old=this.delim;
        this.delim='^';
        this[funcName](str);
        this.delim=old;
    }
};

dhtmlXGridObject.prototype.setHeaderSafe=function(str){
    this._setValues(str, 'setHeader', 'setHeaderSafe', false);
};

dhtmlXGridObject.prototype.setColumnIdsSafe=function(str){
    this._setValues(str, 'setColumnIds', 'setColumnIds', false);
};

dhtmlXGridObject.prototype.setInitWidthsSafe=function(str){
    this._setValues(str, 'setInitWidths', 'setInitWidth', false);
};

dhtmlXGridObject.prototype.setColAlignSafe=function(str){
    this._setValues(str, 'setColAlign', 'setColAlignSafe', false);
};

dhtmlXGridObject.prototype.setColSortingSafe=function(str){
    this._setValues(str, 'setColSorting', 'setColSortingSafe', false);
};

dhtmlXGridObject.prototype.setColTypesSafe=function(str){
    this._setValues(str, 'setColTypes', 'setColTypesSafe', false);
};

dhtmlXGridObject.prototype.attachHeaderSafe=function(str){
    this._setValues(str, 'attachHeader', 'attachHeaderSafe', true);
};


//FILTERS
/*
 * Return hash, containing keys 'fltName' + numbers (from 1) with values equal to column positions (initial positions, column moving supported),
 * and keys 'flt' + number (from  1) with values equal to filter values.
 */
dhtmlXGridObject.prototype.getFilterHash=function(encode){
    var h = new Hash();
    if (!this.filterPositions) return h;
    var flt = this.filterPositions;
    var cnt = 1;
    for (var i=0; i<flt.length;++i){
        var edit = $(this.filterPrefix+"fltf"+i);
        if (edit != null){
            var ed = encode ? encodeURIComponent(edit.value._dhx_trim()) : edit.value._dhx_trim();
            if (ed != ''){
                h.set('fltName'+cnt, flt[i].num);
                if (edit.colType==__STR_TYPE_NAME)
                    h.set('flt'+cnt, '#'+ed);
                else
                    h.set('flt'+cnt, '#'+ed);
                ++cnt;
            }
        } else {
            var colId = this._colIds[flt[i].num-1];
            var combo=this._comboFilters.get(colId);
            ed = getComboValue(combo)._dhx_trim();
            //alert(ed);
            if (ed != ''){
                h.set('fltName'+cnt, flt[i].num);
                if (combo.colType==__STR_TYPE_NAME)
                    h.set('flt'+cnt, '#"'+ed + '"');
                else{
                    if (combo.chb==false)
                        h.set('flt'+cnt, '#'+ed);
                    else
                        h.set('flt'+cnt, ed==this.CHB_TRUE ? '#=1' : '#=0');
                }
                ++cnt;
            }
        }
    }
    return h;
};

dhtmlXGridObject.prototype._getFilterHashCl=function(){
    var h = new Hash();
    if (!this.filterPositions) return h;
    var flt = this.filterPositions;
    var cnt = 1;
    for (var i=0; i<flt.length;++i){
        var edit = $(this.filterPrefix+"fltf"+i);
        var colId2 = this._colIds[flt[i].num-1];
        if (edit != null){
            var ed = edit.value._dhx_trim();
            if (ed != ''){
                h.set('fltName'+cnt, colId2);
                if (edit.colType==__STR_TYPE_NAME)
                    h.set('flt'+cnt, ed);
                else
                    h.set('flt'+cnt, ed);
                h.set('type'+cnt, edit.colType);
                ++cnt;
            }
        } else {
            var combo=this._comboFilters.get(colId2);
            ed = getComboValue(combo)._dhx_trim();
            if (ed != ''){
                h.set('fltName'+cnt, colId2);
                if (combo.colType==__STR_TYPE_NAME)
                    h.set('flt'+cnt, '"' + ed + '"');
                else{
                    if (combo.chb==false)
                        h.set('flt'+cnt, ed);
                    else
                        h.set('flt'+cnt, ed==this.CHB_TRUE ? '!=0' : '=0');
                }
                h.set('type'+cnt, combo.colType);
                ++cnt;
            }
        }
    }
    h.set('size', cnt-1);
    return h;
};

dhtmlXGridObject.prototype._applyClientFilters=function(gr){
    if (!gr.filterPositions)return;
    gr.callEvent("onFilterStart", []);
    var h = gr._getFilterHashCl();
    var firstId = -1;
    var rowCount=gr.getRowsNum();
    var filterCount=h.get('size');
    //очистили фильтры, например
    if (filterCount==0){
        for(var i=0;i<rowCount;++i){
            var rowId=gr.getRowId(i);
            if (!rowId)continue;
            var c=gr.rowsCol[i];
            if (!c) continue;
            if (firstId == -1)
                firstId = i;
            gr.setRowHiddenFast(rowId,false);
        }
        gr.callEvent("onGridReconstructed",[]);
        gr.setSizes();
        if (firstId != -1)
            gr.callEvent("onAfterClientFiltering",[firstId]);
        else
            gr.callEvent("onAfterClientFiltering",[]);
        return;
    }
    var names=new Array();
    var filters=new Array();
    for (i=1;i<=filterCount;++i){
        names.push(h.get('fltName'+i));
        try{
            var f=getFilter(h.get('flt'+i), h.get('type'+i));
            filters.push(f);
        } catch (err){
            alert('Ошибка при разборе фильтра "' + h.get('flt'+i) + '":\n' + err.description);
            return;
        }
    }

    for(i=0;i<rowCount;++i){
        rowId=gr.getRowId(i);
        if (!rowId)continue;
        c=gr.rowsCol[i];
        if (!c) continue;
        var failed = false;
        for (var j=0;j<names.length;++j){
            if (!filters[j].hit(gr.getCellValue(rowId, names[j]).strip())){
                failed=true;
                break;
            }
        }
        if (!failed){
            if (firstId == -1)
                firstId = i;
            gr.setRowHiddenFast(rowId,false);
        } else
            gr.setRowHiddenFast(rowId,true);
    }
    gr.callEvent("onGridReconstructed",[]);
    gr.setSizes();
    if (firstId != -1)
        gr.callEvent("onAfterClientFiltering",[firstId]);
    else
        gr.callEvent("onAfterClientFiltering",[]);

};

//private Internal filtering - server
dhtmlXGridObject.prototype._internalFilterBy=function(event){
    //called from edit!
    var el = Event.element(event);
    var gr = el.parent_grid;
    if (event.keyCode != 13) return;
    //поддержка оставания в этом столбце грида
    gr._selectCellInSelectedRow(gr.getColIndexById(el.colIndex));
    gr._realInternalFiltering(gr);
};

dhtmlXGridObject.prototype._internalFilterByCombo=function(){
    //called from combo!
    var gr = this.parent_grid;
    //поддержка оставания в этом столбце грида
    gr._selectCellInSelectedRow(gr.getColIndexById(this.colIndex));
    gr._realInternalFiltering(gr);
};

dhtmlXGridObject.prototype._realInternalFiltering = function (gr, flush, func) {
    if (!Tools.def(gr._first_url)) return;
    var h = gr.getFilterHash();
    var sorting = gr.getSortingStateEx();
    var sortingSet = !Object.isUndefined(sorting[0]) && sorting[0] != -1;
    if (sortingSet) {
        h.set('orderby', sorting[0]);
        h.set('direct', sorting[1]);
    }

    if (!Object.isUndefined(flush)) {
        h.set('flush', '1');
    }
    var qString = this._addHashToUrl(addUn(gr._first_url), h);
    gr.clearAll();
    gr._is_server_filtering = 1;
    // очищаем все чекбоксы
    gr.uncheckAllSelection();
    var newFunc = function () {
        if (sortingSet) {
            gr.setSortImgState(true, gr.getRealPos(sorting[0] - 1), sorting[1]);
        }
        if (!Object.isUndefined(func)) func();
    };
    gr.load(qString, newFunc, datamode);
};

dhtmlXGridObject.prototype._addHashToUrl=function(url, hash){
    var hQuery = hash.toQueryString();
    return _addStringToUrl(url, hQuery);
};

//private internal filtering - client
dhtmlXGridObject.prototype._clientFilterBy=function(event){
    //called from edit!
    var el = Event.element(event);
    var gr = el.parent_grid;
    if (event.keyCode != 13) return;
    //поддержка оставания в этом столбце грида
    gr._selectCellInSelectedRow(gr.getColIndexById(el.colIndex));

    gr._applyClientFilters(gr);
};

dhtmlXGridObject.prototype._clientFilterByCombo=function(){
    //called from edit!
    var el = this; //Event.element(event);
    var gr = el.parent_grid;
    //поддержка оставания в этом столбце грида
    gr._selectCellInSelectedRow(gr.getColIndexById(el.colIndex));
    gr._applyClientFilters(gr);
};

dhtmlXGridObject.prototype._decodeComboFilter=function(combo){
    var s=getComboValue(combo);
    if (s=='')return '';
    if (s==this.CHB_TRUE)return '1';
    return '0';
};

/* clear text filters
 * Set do_filtering param to true if data refiltering is required. Otherwise,
 * function just clears all filters. 
 */
dhtmlXGridObject.prototype.clearFilters = function(do_filtering) {
    if (!this.filterPositions) return;
    var flt = this.filterPositions;

    for (var i=0; i < flt.length; ++i) {
        var ed = $(this.filterPrefix + "fltf" + i);
        if (ed != null) {
            ed.value = '';
            ed.className = '';
            ed.title = '';
        } else {
            var colId = this._colIds[flt[i].num - 1];
            var combo = this._comboFilters.get(colId);
            combo.selectedIndex = 0;
        }
    }

    if (Object.isUndefined(do_filtering)) return;
    if (do_filtering != true) return;
    if (!this._smart_rendering)
        this._applyClientFilters(this);
    else
        this._realInternalFiltering(this);
};

/*
 *   Refresh grid data according to filters data
 */
dhtmlXGridObject.prototype.refreshFilter=function(){
    if (!this._smart_rendering)
        this._applyClientFilters(this);
    else
        this._realInternalFiltering(this);
};

//disable all filters (true) or enable them (false)
dhtmlXGridObject.prototype.setFiltersDisabled=function(bl){
    if (!this.filterPositions) return;
    var flt=this.filterPositions;
    for (var i=0;i<flt.length;++i){
        var edit=$(this.filterPrefix+"fltf"+i);
        if (edit!=null)
            edit.disabled=bl;
        else {
            var colId=this._colIds[flt[i].num-1];
            var obj=this._comboFilters.get(colId);
            obj.disabled = bl;
        }
    }
};

dhtmlXGridObject.prototype.loadSizesFromCookie=function()
{
    this.loadOrderFromCookie2();
    this.loadSizeFromCookie2();
    this._saveSizes(true);
};
/**
 * Выполняет первоначальную настройку грида. размеры столбцов и их порядок.
 * если настройки найдены в cookies, они будут загружены оттуда
 * @param callSetSizes : Boolean флаг, который показывает надо ли сохранять размеры столбцов после загрузки их из cookies
 */
dhtmlXGridObject.prototype.initGridAppearance=function(/*boolean*/callSetSizes){
    this.setSizes();
    //We store size first and order next in _checkSizeChanged. We should load data here in opposite order.
    this.loadOrderFromCookie2();
    this.loadSizeFromCookie2();  //todo: иногда неприятно стреляет  IE
    if (Object.isUndefined(callSetSizes) || callSetSizes){
        this._saveSizes(true);
    }
};
/**
 * Устанавливает настройки грида + приделывает фильтры к гриду + устанавливает контекстное менб для грида
 * @param str имя грида. необязатльный параметр. в случае есщи не указан импользуется id грида
 * @param callSetSizes : Boolean флаг, который показывает надо ли сохранять размеры столбцов после загрузки их из cookies
 */
dhtmlXGridObject.prototype.attachHeader3 = function(str, callSetSizes) {
    this.attachHeader2(str);
    this.initGridAppearance(callSetSizes);
    //init menu. Could be called several times wo any problems
    this._initMenu();
};
/**
 * Приделывает фильтры к гриду
 */
dhtmlXGridObject.prototype.attachHeader4=function(){
    this.attachHeader2();
    //init menu. Could be called several times wo any problems
    this._initMenu();
};

//private
//attach header with built-in text filter support ('#textfilter' tag) or combo filter support
//this function is intended to execute BEFORE any columns moving (as part of attachHeader3 function)
//requires prototype and dhtmlxCombo files inclusion for #combofilter support
dhtmlXGridObject.prototype.attachHeader2=function(str){
    var ids;
    if (Object.isUndefined(str))
        ids=this._row2Filters; //use filters from setColumnsInfo
    else
        ids=this._eSplit(str);
    var cnt=0;
    var prefix=this.entBox.id;
    //array of pairs - num=column index, index=filter cnt (to get filter objects names)
    this.filterPositions=new Array();
    this.filterPrefix=prefix;
    var positions=new Array();
    var filterTypes=new Array();
//    var noBubbleEvent="(arguments[0]||window.event).cancelBubble=true;";
    var noBubbleEvent="";
    var handlers=''; //" onclick='" + noBubbleEvent + "' onmousedown='" + noBubbleEvent + "'";
    //this.flagpos=-1;
    for (var i=0;i<ids.length;++i){
        if (ids[i] == '#textfilter' || ids[i] == '#combofilter' || ids[i] == '#checkboxfilter'){
            filterTypes.push(ids[i]);
            this.filterPositions[cnt]={num: (i+1), index: cnt};
            //<div id='title_flt'></div>
            ids[i] = "<div id='" + prefix + "flt_zonef" + cnt + "'" + handlers + "></div>";
            positions.push(i);
            ++cnt;
        }
        else if (ids[i]=='#flag'){
            filterTypes.push('');
            //     this.flagpos=i;
            var tbl2 = "<nobr><span id='" + prefix + "flagplus2'></span><span id='" + prefix + "flagminus2'></span></nobr>";
            ids[i] = "<div id='" + prefix + "flt_flagf" + "'" + handlers + ">" + tbl2 + "</div>";
        }
        else {
            filterTypes.push('');
            ids[i] = "<div id='" + prefix + "flt_zoneftmp" + i + "'" + handlers + ">&nbsp;</div>";
        }
    }
    //perform real attach
    this.attachFooter(''.join(ids, this.delim));
    this._comboFilters = new Hash();
    //support for flag column
    if (this.flagpos != -1){
        this._createFlagButtons(prefix, "fltplus2", "flagplus2", "50", "+", this._colIds[this.flagpos]);
        this._createFlagButtons(prefix, "fltminus2", "flagminus2", "50", "-", this._colIds[this.flagpos]);
    }
    //create and attach edits
    for (i=0;i<cnt;++i){
        var filterType=filterTypes[positions[i]];
        var colId=this._colIds[positions[i]];
        if (filterType=='#textfilter'){
            //footer edit
            var edf=this._createTextFilter(prefix, noBubbleEvent, "fltf"+i, "flt_zonef"+i, 100);
            //set types
            edf.colType=this._colTypes[positions[i]];
            //индекс колонки, к которой привязан фильтр
            edf.colIndex=positions[i] + 1;
        }
        else if (filterType=='#combofilter'){
            //footer edit
            edf=this._createComboFilter(prefix, "fltf"+colId, "flt_zonef"+i, 100);
            this._comboFilters.set(colId, edf);
            //set types
            edf.colType=this._colTypes[positions[i]];
            edf.colIndex=positions[i] + 1;
        }
        else if (filterType=='#checkboxfilter'){
            //footer edit
            edf=this._createCheckboxFilter(prefix, "fltf"+colId, "flt_zonef"+i, 100);
            this._comboFilters.set(colId, edf);
            //set types
            edf.colType=this._colTypes[positions[i]];
            edf.colIndex=positions[i] + 1;
        }
    }
};

/*
 * Public.
 * Set properties of #combofilter bound to column with specified id (colId).
 * Func param - is callback function with param 'combo' used to initialize it.
 */
dhtmlXGridObject.prototype.loadComboFilter=function(colId,func){
    var comboObj = this._comboFilters.get(colId);
    func(comboObj);
};

function loadComboFromUrl(combo, url){
    alameda.ajaxRequest(url, {
        method:"post",
        onSuccess:function(transport){
            if (transport.responseText == 'error') return;
            var json = transport.responseText.evalJSON(true);
            var ar = json.values;
            if (ar.indexOf2('') == -1)
                ar = _insertAt(ar,0,'');
            addComboOptions(combo, ar);
        }
    }, alameda.AjaxRequestMode.GET );
}

function addComboOption(combo, text){
    var option = document.createElement("OPTION");
    option.text = text;
    option.title = text;
    combo.options.add(option);
}

function getComboValue(combo){
    var ind=combo.selectedIndex;
    if (ind==-1)return '';
    var option = combo.options[ind];
    // В данном случае комбо бокс может содержать значение отличное от текста его описания
    // по этой причине необходимо проверить, а есть ли option.value, и если есть, то считать
    // его приоритетным перед текстом значения.
    return option.value>''?option.value:option.text;
}


function addComboOptions(combo, texts){
    combo.options.length=0;

    //alert(texts);
    if (typeof(texts) == 'string'){
        addComboOption(combo, texts);
        return 1;
    }
    for (var i=0; i<texts.length; ++i){
        addComboOption(combo, texts[i]);
    }
    return texts.length;
}

function inspectObj(obj)
{
    var s = '';
    for (var c in obj)
        s += c + ' ';
    alert(s);
}

//private
dhtmlXGridObject.prototype._createFlagButtons=function(prefix, flt, flt_zone, width, caption, colId){
    var ed = document.createElement("INPUT");
    ed.id = prefix + flt;
    ed.type='BUTTON';
    ed.className='button';
    ed.style.width = width+'%';
    ed.style.border = '1px solid gray';
    ed.value=caption;
    ed.colId = colId;
    Event.observe(ed, "click", this._FlagButtonHandler);
    ed.parent_grid = this;
    $(prefix+flt_zone).appendChild(ed);
    return ed;
};

dhtmlXGridObject.prototype._checkboxesSelectionControl = function() {
    if (Tools.def(this.checkAllRows) && this.checkAllRows.checked) {
        this._selectCheckboxes(this.checkAllRows.colId, true, true);
    }
};

dhtmlXGridObject.prototype._FlagButtonHandler=function(){
    if (this.value == '+')
        this.parent_grid._selectCheckboxes(this.colId, 1, false);
    else
        this.parent_grid._selectCheckboxes(this.colId, 0, false);
    // сохраним флаг, что была нажата кнопка "выбрать/отменить все галочки"
    this.parent_grid.checkAllRows  = {
        checked : (this.value == '+'),
        colId : this.colId
    }
};
// отрабатывает по нажатию кнопки выделения или отмены выделения всех галочек
dhtmlXGridObject.prototype._selectCheckboxes=function(colId, val, doNotTouchUnselected){
    var num=this.getRowsNum();
    for (var i=0;i<num;++i){
        var rowId = this.getRowId(i);
        // пропускаем, если не определена id строчки либо строчка ещё не загружена
        if (rowId == null || this.getRowById(rowId) == null) continue;
        if(doNotTouchUnselected && Tools.def(this.unselectedRowIds) && Tools.def(this.unselectedRowIds.get(rowId))){
            // для текущей строки не надо проставлять выделение
        }else{
            this.setCellValue(rowId, colId, val);
            // handle checkbox selection
            this.doOnCheckDef(rowId,colId,val == 1);
        }
    }
};

//private
dhtmlXGridObject.prototype._createTextFilter=function(prefix, noBubbleEvent, flt, flt_zone, width){
    var ed = document.createElement("INPUT");
    ed.id = prefix + flt;
    ed.canselect=true;
    ed.style.width = width+'%';
    ed.style.border = '1px solid gray';
    Element.addClassName(ed, "inputFilter");
    ed.onclick = noBubbleEvent;
    if (!this._smart_rendering)
        Event.observe(ed, "keyup", this._clientFilterBy);
    else
        Event.observe(ed, "keyup", this._internalFilterBy);
    Event.observe(ed, "keyup", this._checkFilterCorrectness);
    Event.observe(ed, "change", this._checkFilterCorrectness);//на случай вставки через контекстное меню
    ed.parent_grid = this;
    $(prefix+flt_zone).appendChild(ed);
    return ed;
};

dhtmlXGridObject.prototype._checkFilterCorrectness=function(event){
    var v=this.value.strip();
    Element.removeClassName(this,'correct_filter');
    Element.removeClassName(this,'incorrect_filter');
    if (v==''){
        this.title='';
        return;
    }
    try{
        var f=getFilter(v, this.colType);
        if (event.type=='change') this.value = f.toString2();
        else if (event.type=='keyup'&&event.keyCode==13)this.value = f.toString2();
        Element.addClassName(this,'correct_filter');
        this.title = '';
    }
    catch (err){
        Element.addClassName(this,'incorrect_filter');
        this.title = err.description;
    }
};

//private
dhtmlXGridObject.prototype._createComboFilter=function(prefix, flt, flt_zone, width){
    var ed = document.createElement("SELECT");
    ed.id = prefix + flt;
    ed.style.width = width+'%';
    ed.style.border = '1px solid gray';
    ed.parent_grid = this;
    ed.chb=false;//to distinguish from checkbox filters
    $(prefix+flt_zone).appendChild(ed);
    if (!this._smart_rendering)
        Event.observe(ed, "change", this._clientFilterByCombo);
    else
        Event.observe(ed, "change", this._internalFilterByCombo);
    return ed;
};

dhtmlXGridObject.prototype.CHB_TRUE='Да';
dhtmlXGridObject.prototype.CHB_FALSE='Нет';

//private
dhtmlXGridObject.prototype._createCheckboxFilter=function(prefix, flt, flt_zone, width){
    var ed = document.createElement("SELECT");
    ed.id = prefix + flt;
    ed.style.width = width+'%';
    ed.style.border = '1px solid gray';
    ed.parent_grid = this;
    ed.chb=true;
    addComboOptions(ed, ['',this.CHB_TRUE,this.CHB_FALSE]);
    $(prefix+flt_zone).appendChild(ed);
    if (!this._smart_rendering)
        Event.observe(ed, "change", this._clientFilterByCombo);
    else
        Event.observe(ed, "change", this._internalFilterByCombo);
    return ed;
};

//inititalize grid
dhtmlXGridObject.prototype.firstLoad = function (url, func) {
    this._first_url = url;
    var finalUrl = addUn(url);
    this._hideSortArrow();

    if (!this._smart_rendering) {
        this.load(finalUrl, func, datamode);
    } else {
        this.loadXMLFlush(finalUrl, func);
    }
};

dhtmlXGridObject.prototype.anyColSorted=function(){
    var sorting = this.getSortingStateEx();
    return !Object.isUndefined(sorting[0]) && sorting[0] != -1;
};

dhtmlXGridObject.prototype.firstLoadWithFilters = function (url, func) {
    this._first_url = url;
    var finalUrl = addUn(url);

    if (!this._smart_rendering) {
        // режим без кеширования
        this._hideSortArrow();
        this.load(finalUrl, func, datamode);
    } else {
        var h = this.getFilterHash();
        if (h.keys().length == 0 && !this.anyColSorted()) {
            this.loadXMLFlush(finalUrl, func);
        } else {
            this._realInternalFiltering(this, true, func);
        }
    }
};

dhtmlXGridObject.prototype.clearGrid=function(leaveFilters, leaveSort){
    this.clearAll();
    if (Object.isUndefined(leaveFilters) || !leaveFilters){
        this.clearFilters();
    }
    if (Object.isUndefined(leaveSort) || !leaveSort) {
        this._hideSortArrow();
        this.r_fldSorted = null;
        this.fldSorted = null;
        this.sortImg.style.display="none";
    }
    // убираем выделения строчек
    this.uncheckAllSelection();
};

/*
* Function clears the grid and loads specified data.
* Un parameter is added automatically!
*/
dhtmlXGridObject.prototype.loadStatic=function(url, func){
    this.clearGrid();
    var finalUrl = addUn(url);
    this.load(finalUrl, func, datamode);
};

/*
 * Функция загрузки данных для статических гридов. Поддерживает введенные в грид фильтры
 */
dhtmlXGridObject.prototype.loadStatic2=function(url, func){
    this.clearGrid(true, false);
    var finalUrl = addUn(url);
    var onLoaded;
    if (Object.isUndefined(func)){
        onLoaded = function(){
            this.applyFiltersIfAny();
        }.bind(this);
    }
    else {
        onLoaded = function(){
            this.applyFiltersIfAny();
            func();
        }.bind(this);
    }

    this.load(finalUrl, onLoaded, datamode);
};

//load with filter support
dhtmlXGridObject.prototype.loadXML2=function(url,func){
    this.load(this._addHashToUrl(url, this.getFilterHash()), func, datamode);
};

dhtmlXGridObject.prototype.loadXMLFlush=function(url,func){
    if (!this._smart_rendering)
        alert('This function is not suggested to be used for static (client) grids!');
    else{
        this.load(addUn(this._addHashToUrl(url, $H({flush:'1'}) )), func, datamode);
    }
};

//column sorting (server side)
dhtmlXGridObject.prototype.enableSmartRendering2=function(mode){
    this._smart_rendering = mode;
    if (mode){
        if (!this.safeColCount){
            alert("Inititalize column properties before calling enableSmartRendering2!");
            return;
        }
        var ss = "server^".times(this.safeColCount);
        ss = ss.substr(0, ss.length-2);
        this.setColSortingSafe(ss);
//        var r = $A($R(1,this.safeColCount)).join("^"); //moved to init_extra
//        this.setColumnIdsSafe(r);
        this.setOnColumnSort(this._sortGridOnServer);
        this.attachEvent("onXLE",this._afterServerFiltering);
    }
    this.enableSmartRendering(mode, 75);
};

//private - support for afterServerSorting
dhtmlXGridObject.prototype._afterServerFiltering=function(){
    if (!this._is_server_filtering)return;
    //if (!this._firstOnXLE) return;
    //this._firstOnXLE = false;
    if (this._is_server_filtering == 1){
        this._is_server_filtering = 0;
        if (this.getRowsNum() > 0)
            this.callEvent("onAfterClientFiltering",[0]);
        else
            this.callEvent("onAfterClientFiltering",[]);
    }
};

//onSort handler - private
dhtmlXGridObject.prototype._sortGridOnServer=function(ind){
    var colId=this.getColumnId(ind);//this line depends on setting column ids to 1,2,3,... - done in init_extra //enableSmartRendering2
    var a_state=this.getSortingStateEx(colId);
    // сбрасываем значения чекбоксов для выделенных строчек
    this.uncheckAllSelection();
    this._pr_queryServer(colId,ind,a_state[1]);
    return false;
};
//private
dhtmlXGridObject.prototype._pr_queryServer=function(queryInd,visualInd,direction){
    var h = $H({orderby:queryInd, direct:direction});
    this._pr_loadData(h);
    this.setSortImgState(true,visualInd,direction);
};
//private
dhtmlXGridObject.prototype._pr_loadData=function(extra){
    this.clearAll();
    var url = this._addHashToUrl(addUn(this._first_url), extra);
    this.loadXML2(url, this._onAfterServerFiltering.bind(this));
};
//private - support for server filtering
dhtmlXGridObject.prototype._onAfterServerFiltering=function(){
    this.callEvent("onAfterSorting",[]);
};


/**
 * Return selected row ids in string in format 'row1;row2;row3;'
 */
dhtmlXGridObject.prototype.getSelectedRowsStr = function() {
    if(this.selectedRowIds == null ||
        this.selectedRowIds == undefined){
        return null;
    }else{
        var str = "";
        this.selectedRowIds.each(function(pair) {
            str += pair.value + ";";
        });
        return str;
    }
};
/**
 * Return selected row ids in string in format 'row1;row2;row3;'
 */
dhtmlXGridObject.prototype.getUnselectedRowsStr = function() {
    if(this.unselectedRowIds == null ||
        this.unselectedRowIds == undefined){
        return null;
    }else{
        var str = "";
        this.unselectedRowIds.each(function(pair) {
            str += pair.value + ";";
        });
        return str;
    }
};

/**
 * Return selected row ids Array
 */
dhtmlXGridObject.prototype.getUnselectedRowIdsInArray = function() {
    if(this.unselectedRowIds == null ||
        this.unselectedRowIds == undefined){
        return null;
    }else{
        var ids = [];
        this.unselectedRowIds.each(function(pair) {
            ids.push(pair.value);
        });
        return ids;
    }
};
/**
 * Return true if cheked all lines
 */
dhtmlXGridObject.prototype.isSelectedAll = function() {
    return Tools.def(this.checkAllRows) && this.checkAllRows.checked;
};

/**
 * Return selected row ids Array
 */
dhtmlXGridObject.prototype.getSelectedRowIdsInArray = function() {
    if(this.selectedRowIds == null ||
        this.selectedRowIds == undefined){
        return null;
    }else{
        var ids = [];
        this.selectedRowIds.each(function(pair) {
            ids.push(pair.value);
        });
        return ids;
    }
};

/**
 * Default on check handler for checkboxs
 *
 * @param rowId row id value
 * @param colIndex column index
 * @param checked checkbox checked or not
 */
dhtmlXGridObject.prototype.doOnCheckDef = function(rowId, colIndex, checked){
    if (this.isMultiSelection()) {
        if (this.selectedRowIds == null ||
            this.selectedRowIds == undefined) {
            // список ID выбранных строк
            this.selectedRowIds = $H();
            // список ID строк, которые были отменены
            this.unselectedRowIds = $H();
        }
        if (checked) {
            this.selectedRowIds.set(rowId, rowId);
            this.unselectedRowIds.unset(rowId);
        }else {
            this.selectedRowIds.unset(rowId);
            this.unselectedRowIds.set(rowId, rowId);
        }
    }
};

/**
 * Очищает данные по выбору строчек "галочками"
 */
dhtmlXGridObject.prototype.uncheckAllSelection = function(){
    if (this.isMultiSelection()) {
        if (Tools.def(this.checkAllRows)) {
            this.checkAllRows.checked = false;
        }
        this.selectedRowIds = null;
        this.unselectedRowIds = null;
    }
};

/**
 * Is Multiselection using in grid
 * condition [this.flagpos != -1] means that multiselection using
 */
dhtmlXGridObject.prototype.isMultiSelection = function(){
    return this.flagpos != -1;
};

dhtmlXGridObject.prototype.addEmptyRow=function(id,ind){
    var ss = ",".times(this.safeColCount-1);
    this.addRow(id,ss,ind);
};

dhtmlXGridObject.prototype.saveSizeToCookie2=function(name,cookie_param){
    if (!name)name=this.entBox.id;
    if (this.cellWidthType=='px')
        var z=this.cellWidthPX.join(",");
    else
        z=this.cellWidthPC.join(",");
    var z2=(this.initCellWidth||(new  Array)).join(",");
    this.setCookie(name,cookie_param,0,z);
    this.setCookie(name,cookie_param,1,z2);
    /*/
        if (this.cellWidthType=='px')
            var z=this.cellWidthPX.join(",");
        else
            z=this.cellWidthPC.join(",");
        this.setCookie("gridSizeA"+name,z,cookie_param);
        z=(this.initCellWidth||(new Array)).join(",");
        this.setCookie("gridSizeB"+name,z,cookie_param);
        return true;
    */
};

dhtmlXGridObject.prototype.compareColumnCount = function(/*Array*/dataFromCookies){
    // если не совпадают размеры массивов (количество колонок в таблице),
    // значит были добавлены или удалены столбцы из таблицы (разработчиками).
    // не загружаем данные из cookies
    return this.safeColCount == dataFromCookies.length;
};

dhtmlXGridObject.prototype.loadSizeFromCookie2 = function(name) {
    if (!name)name = this.entBox.id;
//    alert("in loadSizeFromCookie2 for name=" + name); todo
    var z = this._getCookie(name, 1);
    if (z) {
        // проверяем, что в таблицу не были добавлены/удалены столбцы. иначе беда...
        if (this.compareColumnCount(z.split(","))) {
            this.initCellWidth = z.split(",");
            z = this._getCookie(name, 0);
            if ((z) && (z.length)) {
                if (!this._fake && this._hrrar)
                    for (var i = 0; i < z.length; i++)
                        if (this._hrrar[i]) z[i] = 0;
                if (this.cellWidthType == 'px')
                    this.cellWidthPX = z.split(",");
                else
                    this.cellWidthPC = z.split(",");
            }
        }
    }

    this.setSizes();
    return true;
};

/*
 * public.
 * Save column order to cookie. Works fine without any params, using grid name as id.
 * Params meaning is the same as in saveSizeToCookie.
 */
dhtmlXGridObject.prototype.saveOrderToCookie2=function(name,cookie_param){
    if (!name)name=this.entBox.id;
    var z = this.arColPos.join(",");
    //alert('save='+z);
    this.setCookie("columnPositions"+name,cookie_param,3,z);
    return true;
};

/*
 * public.
 * Loads column order (their relative positions) from cookies. Works fine wo params,
 * using grid name as id. Params meaning is the same as in loadSizeFromCookie.
 */
dhtmlXGridObject.prototype.loadOrderFromCookie2 = function(name) {
    if (!name)name = this.entBox.id;
//    alert("in loadOrderFromCookie2 for name=" + name); todo
    var z = this._getCookie("columnPositions" + name, 3);
    //alert('load='+z);
    if (z) {
        // проверяем, что в таблицу не были добавлены/удалены столбцы. иначе беда...
        if (this.compareColumnCount(z.split(","))) {
            z = z.split(",");
            this._implementColMoving(z);
            this.arColPos = z.clone();
            this._startColPos = z.clone();
        } else {
            alameda.debug("Column count in cookies is different from new loaded. " +
                "So the column 'width' won't loaded from cookies");
        }
    }
    return true;
};

/*
 * public.
 * Set column text color. Color is like "#RRGGBB".
 */
dhtmlXGridObject.prototype.setCellTextColor=function(rowId, colId, color){
    var colIndex = this._colIds.indexOf(colId);
    var colRealPos = this.getRealPos(colIndex);
    this.cells(rowId, colRealPos).setTextColor(color);
};

/*
 * public
 * Get row color. (It works only when all row cells have the same color)
 */
dhtmlXGridObject.prototype.getRowColor=function(rowId){
    var r = this.getRowById(rowId);
    return r.childNodes[0].bgColor;
};


/* version 2008-09-05
** author Andrey Etin */
function getFilterPattern(regExp){
    var strRegExp = "";
    if(regExp == ""){
        strRegExp = ".?";
    } else if(regExp.indexOf("*") == -1 && regExp.indexOf("_") == -1){
        strRegExp = "^" + regExp.replace(/\\/g, "\\\\").replace(/(\.)/g, "(.)") + ".?";
    } else {
        strRegExp = regExp.replace(/\\/g, "\\\\").replace(/(\.)/g, "(.)").replace(/(\*)/g, ".?").replace(/(_)/g, ".");
        if(regExp.charAt(0) != '*'){
            strRegExp = "^" + strRegExp;
        }
        if(regExp.charAt(regExp.length - 1) != '*'){
            strRegExp = strRegExp + "$";
        }
    }
    return new RegExp(strRegExp, "mi");
}

dhtmlXGridObject.prototype.setSortingParams=function(colNum, sortType, order){
    this._sortColNum=colNum;
    this._sortSortType=(sortType||this._colTypes[colNum]);
    if (this._sortSortType=='strspec')this._sortSortType='str';
    this._sortOrder=(order||"asc").toLowerCase();
};

dhtmlXGridObject.prototype._sortJson=function(json_data, colNum, sortType, order){
    if (Object.isUndefined(colNum)){
        //it means we dont need sorting
        if (Object.isUndefined(this._sortColNum)) return;
        if (json_data.length<2) return;
        this._sortJson(json_data,this._sortColNum,this._sortSortType,this._sortOrder);
        return;
    }
    //защита от вызова функции setSortingParams для Динамического грида
    if (!Object.isUndefined(this._smart_rendering)){
        this._sortColNum = undefined;
        return;
    }
    var sortFunc;
    if (sortType=='str')
        sortFunc=function(a,b){
            return strspec(a.data[colNum],b.data[colNum],order);
        };
    else if (sortType=='int')
        sortFunc=function(a,b){
            var aVal = parseFloat(a.data[colNum]);
            aVal=isNaN(aVal) ? -99999999999999 : aVal;
            var bVal = parseFloat(b.data[colNum]);
            bVal=isNaN(bVal) ? -99999999999999 : bVal;
            if (order == "asc")
                return aVal-bVal;
            else
                return bVal-aVal;
        };
    else if (sortType=='datedot')
        sortFunc=function(a,b){
            return datedot(a.data[colNum],b.data[colNum],order);
        };
    else if (sortType=='timestamp')
        sortFunc=function(a,b){
            return timestamp(a.data[colNum],b.data[colNum],order);
        };
    else{
        alert('Unknown sort type - ' + sortType);
        return;
    }
    json_data.sort(sortFunc);
};

/*
 * Sorting function for dd.mm.yyyy hh:mi:ss format
 */
function timestamp(a,b,order){
    if (a=='' && b=='')return 0;
    var isAsc=order=="asc";
    if (a=='' && b!='')return isAsc?-1:1;
    if (a!='' && b=='')return isAsc?1:-1;
    var pattern = /^\d{2}.\d{2}.\d{4} \d{2}:\d{2}:\d{2}(\.\d{3}$|$)/;
    if (!pattern.test(a)) return isAsc?-1:1;
    if (!pattern.test(b)) return isAsc?-1:1;
    //alert(a + " " + b);
    a=_timestamp_to_array(a);
    b=_timestamp_to_array(b);
    var mlt = order=="asc"?1:-1;
    if (a[2] != b[2])
        return (a[2] > b[2] ? 1 : -1)*mlt;
    if (a[1] != b[1])
        return (a[1] > b[1] ? 1 : -1)*mlt;
    if (a[0] != b[0])
        return (a[0] > b[0] ? 1 : -1)*mlt;
    if (a[3] != b[3])
        return (a[3] > b[3] ? 1 : -1)*mlt;
    if (a[4] != b[4])
        return (a[4] > b[4]? 1 : -1)*mlt;
    if (a[5] != b[5])
        return (a[5] > b[5] ? 1 : -1)*mlt;
    return (a[6] > b[6] ? 1 : -1)*mlt;
}

/*
 * Sorting function for dd.mm.yyyy format
 */
function datedot(a,b,order){
    if (a=='' && b=='')return 0;
    var isAsc=order=="asc";
    if (a=='' && b!='')return isAsc?-1:1;
    if (a!='' && b=='')return isAsc?1:-1;
    var pattern = /^\d{2}.\d{2}.\d{4}$/;
    if (!pattern.test(a)) return isAsc?-1:1;
    if (!pattern.test(b)) return isAsc?-1:1;
    a=_date_to_array(a);
    b=_date_to_array(b);
    var mlt = isAsc?1:-1;
    if (a[2] != b[2])
        return (a[2]>b[2]?1:-1)*mlt;
    if (a[1] != b[1])
        return (a[1]>b[1]?1:-1)*mlt;
    return (a[0]>b[0]?1:-1)*mlt;
}

/**
 *String case-insensitive sorting function
 */
function strspec(a,b,order){
    if (a=='' && b=='')return 0;
    //if (a=='' && b!='')return -1;
    //if (a!='' && b=='')return 1;
    var mlt = order=="asc"?1:-1;
    var a_l=a.toLowerCase();
    var b_l=b.toLowerCase();
    if (a_l > b_l)
        return mlt;
    if (a_l < b_l)
        return -mlt;
    return 0;
}


/*
 * Date (format dd.mm.yyyy hh:mi:ss) to array of its components translation
 */
function _date_to_array(dt){
    var ar = new Array(3);
    ar[0] = dt.substr(0, 2);
    ar[1] = dt.substr(3, 2);
    ar[2] = dt.substr(6, 4);
    return ar;
}

/*
 * Date (format dd.mm.yyyy hh:mi:ss) to array of its components translation
 */
function _timestamp_to_array(dt){
    var ar = new Array(6);
    ar[0] = dt.substr(0, 2);
    ar[1] = dt.substr(3, 2);
    ar[2] = dt.substr(6, 4);
    ar[3] = dt.substr(11, 2);
    ar[4] = dt.substr(14, 2);
    ar[5] = dt.substr(17, 2);
    // 00.00.0000 00:00:00.000
    // milliseconds
    if (dt.length > 19)
        ar[6] = dt.substr(20,3);
    else
        ar[6] = '000';

    return ar;
}
/**
 * Регестрируем обработчик при ошибочной загрузке XML
 */
window.dhtmlxError.catchError("LoadXML", function(type, name, params) {
    var response = params[0];
    if (response != null && !Object.isUndefined(response)) {
        var json = null;

        try {
            switch (response.status) {
                case 404:     //todo: firefox  не заходит по этой ветке почему-то
                case "404":
                    alert("Запрошенный ресурс не доступен. Обратитесь к поставщику услуг.");
                    return;
                case 200:
                case "200":
                    if (response.responseText.length > 2000) {
                        window.location = document.URL + "1";
                        return;
                    } else {
                        eval("json = " + response.responseText + ";");
                    }
                    break;
                default:
                    // смотрим что есть в response
                    if (response["error"] != null) {
                        json = response;
                    }
                    break;
            }
        } catch(e) {
        }
        if (json != null && json["error"] != null) {
            alert(json["error"]);
            return;
        }
    }
    //alert("Возникли проблемы при загрузке данных.\nВероятно, либо Вам надо перелогиниться, либо Вам не хватает полномочий на запрошенные действия.");
    alert("Возникли проблемы при загрузке данных.\nПроверьте свои полномочия для выполнения требуемых действий или попробуйте заново войти в программу");
    alameda.debugInvisibly("type = " + type, "name = " + name, alameda._getTrStatus(response));
});

dhtmlXGridObject.prototype.queryExcelFile=function(){
    var gr=this;
    //фильтры и сортировка
    var h = gr.getFilterHash().merge(gr.getCurrentSortStateHash());
    //var h = new Hash();
    h.set('xlsMode', 'xls');
    //массив номеров скрытых колонок (0 based)
    if (gr.flagpos==-1)
        h.set('hiddenCol', gr._hiddenColPos);
    else{
        var newAr=gr._hiddenColPos.clone();
        newAr.push(gr.flagpos);
        h.set('hiddenCol', newAr);
    }
    //массив заголовков колонок (0 based)
    h.set('lbl', gr.hdrLabels);
    if(Tools.def(gr.orderByArr)) {
        h.set('orderByArr', gr.orderByArr);
    }
    //массив номеров колонок, стоящих в данный момент на указанном месте
    h.set('arColPos', gr.arColPos);
    // можно задать формат ячеек при выгрузке в excel
    if(Tools.def(gr.excelCellFormat)) {
        h.set('excelCellFormat', gr.excelCellFormat.toJSON());
    }
    //массив id выбранных строк
    if (!gr.isSelectedAll()) {
        var sids = gr.getSelectedRowIdsInArray();
        if (sids != null) h.set('sids', sids);
    }
    //имя сервлета
    h.set('name', 'srv_excel_download_params');
    h.set('searchParameters', gr.excelParameters());

    alameda.ajaxRequest("Ctrl", {
        method:"post",
        parameters:h,
        onSuccess:function(transport){
            gr._openExcelWindow(transport);
        }
    }, alameda.AjaxRequestMode.GET);
};

dhtmlXGridObject.prototype.excelParameters = function() {
};

dhtmlXGridObject.prototype._openExcelWindow=function(transport) {
    var json = transport.responseText.evalJSON(true);
    var hh=new Hash();
    hh.set('key', json.key);
    var url = this._addHashToUrl(addUn(this._first_url), hh);
    if (Object.isUndefined(window.opener)) { //modal window?
        window.open(url.escapeHTML(), "download"+json.key);
    } else
        openModelessWindow(url, "download"+json.key);
};

/**
 * Функция преобразующая дробные числа к формату с разделителем между разрядами
 * Необходимо задавать тип данных ячейки "ron"
 */
dhtmlXGridObject.prototype._aplNF = function(data, ind){
    return setNumberFormat(data, ' ', '.');
}

/**
 * Private convenience function to check availability of DOM local storage
 */
dhtmlXGridObject.prototype._isLocalStorageAvailable = function() {
    return typeof(window.localStorage) !== "undefined";
}

/**
 * Original setCookie patched to support DOM stokage (aka localStorage)
 */
dhtmlXGridObject.prototype.setCookie = function (name, cookie_param, pos, value) {
    if (!name) name = this.entBox.id;
    var t = this.getCookie(name);
    t = (t || "||||").split("|");
    t[pos] = value;
    var str = "gridSettings" + name + "=" + t.join("|") + (cookie_param ? (";" + cookie_param) : "");
    if (this._isLocalStorageAvailable()) {
        window.localStorage.setItem("gridSettings" + name, t.join("|"));
    } else {
        document.cookie = str;
    }
};

/**
 * Original getCookie ptched to support DOM storage (aka localStorage)
 */
dhtmlXGridObject.prototype.getCookie = function (name, surname) {
    if (!name) name = this.entBox.id;
    name = (surname || "gridSettings") + name;
    var search = name + "=";
    if (this._isLocalStorageAvailable()) {
        return window.localStorage.getItem(name);
    } else {
        if (document.cookie.length > 0) {
            var offset = document.cookie.indexOf(search);
            if (offset != -1) {
                offset += search.length;
                var end = document.cookie.indexOf(";", offset);
                if (end == -1) end = document.cookie.length;
                return document.cookie.substring(offset, end)
            }
        }
    }
};

/**
 * Скрытие колонок в гриде по id
 * @param columns массив из id-колонок грида
 */
dhtmlXGridObject.prototype.hideColumns = function(columns) {
    var self = this;
    var visibleFlags = "";
    self._hiddenColPos.clear();
    for (var j = 0; j < this._colIds.length; j++) {
        var isHide = self.isColumnHidden(j);
        if (!isHide) {
            for (var i = 0; i < columns.length; i++) {
                if (self._colIds.indexOf(columns[i]) == j) {
                    isHide = true;
                    break;
                }
            }
        }
        if (isHide) {
            self._hiddenColPos.push(j);
        }
        visibleFlags += isHide.toString() + ",";
    }
    self.setColumnsVisibility(visibleFlags.substr(0, visibleFlags.length - 1));
};
