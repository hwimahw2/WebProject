/**
 * Класс, управляющий всплывающими справочниками
 */
var CommonList = Class.create({
    initialize: function(gridname, cols, isDynamic, sortCol, loadServlet, requestedFields, autocomplete) {
        this.gridname = gridname;
        this.isDynamic = isDynamic;
        this.firstLoad = true;
        this.sortCol = sortCol;
        this.loadServlet = loadServlet;
        // requestedFields это строка
        this.requestedFields = Tools.def(requestedFields) ? requestedFields : null;
        this.isAutocomplete = (Tools.def(autocomplete) && 1==autocomplete) ? 1 : 0;

        this.initGrid(gridname, cols);

        saveClickListener('btnSelect', this.doSubmit.bind(this));
        saveClickListener('btnCancel', this.doCancel.bind(this));
    },

    initGrid: function(gridname, cols) {
        var mygrid = new dhtmlXGridObject(gridname);

        this.grid = mygrid;

        mygrid.setColumnsInfo(cols);
        mygrid.setSkin("light");
        mygrid.enableColumnMove(true);
	if (!mygrid.isMultiSelection())
            mygrid._disableCheckBoxes = true;
        mygrid.init();
        if (this.isDynamic == 1) mygrid.enableSmartRendering2(true);
        mygrid.attachEvent("onXLE", this.doOnXle.bind(this));

        if (this.isDynamic != 1) {
            mygrid.setSortingParams(this.sortCol);
        }

        mygrid.attachEvent("onRowDblClicked", this.onDblClick.bind(this));
        mygrid.attachEvent("onAfterClientFiltering", this.onAfterClientFiltering.bind(this));

        mygrid.setFiltersDisabled(true);

        if (mygrid.isMultiSelection()) {
            mygrid.attachEvent("onCheckbox", mygrid.doOnCheckDef);
        }

        this.doLoad();
    },

    doLoad: function() {
        Tools.showLoading(true);
        this.grid.setFiltersDisabled(true);
        if (this.isDynamic == 1) {
            this.grid.clearGrid(true, true);
        }
        this.grid.firstLoad("Ctrl?" + this.prepareQuery().toQueryString(), function() {
            this.grid.setFiltersDisabled(false);
            if (this.firstLoad) {
                this.afterGridFirstTimeLoaded();
                this.firstLoad = false;
            } else {
                this.afterGridEveryTimeLoaded();
            }
            writeRecordsAmount(this.grid.getRowsNum());
            this.setFooterFilters();
            this.grid.applyFiltersIfAny();
            Tools.showLoading(false);
        }.bind(this));

    },

    prepareQuery: function() {
        var params = null;
        if (window["dialogArguments"]) {
            params = window["dialogArguments"].clone();
            params.unset('filterParams');
            params.unset('requestedFields');
            params.set('name', this.loadServlet);
        } else {
            params = $H({name:this.loadServlet});
        }
        return params;
    },

    setFooterFilters: function() {
        if (window["dialogArguments"]) {
            var filters = window["dialogArguments"].unset("filterParams");
            if (filters) {
                for (var key in filters) {
                    $(this.gridname + "fltf" + this.grid._colIds.indexOf(key)).setValue(filters[key]);
                }
            }
        }
    },

    doOnXle: function() {
        if (this.isDynamic == 1) {
            if (this.firstLoad && this.grid.getRowsNum() > 0) {
                this.grid.selectRow(0, true);
            }
        } else {
            if (this.grid.getRowsNum() > 0) {
                //this.grid.sortRows(this.sortCol);
                this.grid.selectRow(0,true);
            }
        }
        if (1 == this.isAutocomplete) {
            if  (1 == this.grid.getRowsNum()) {
                this.doSubmit();
            }
            if  (0 == this.grid.getRowsNum()) {
                var ret = $H();

                ret.set("empty",true);
                window.returnValue = ret.toObject();
                
                this.doCancel();
            }
        }
    },

    onDblClick: function() {
        this.doSubmit();
        return true;
    },

    onAfterClientFiltering: function(firstId) {
        if (!Object.isUndefined(firstId)) {
            this.grid.selectRow(firstId, true);
        }
    },

    afterGridFirstTimeLoaded: function() {
    },

    afterGridEveryTimeLoaded: function() {
    },

    doSubmit: function () {
	    var selectedRowId = this.getSelectedRowId();
        if (this.grid.isMultiSelection()) {
            var selectedRowIds = this.grid.getSelectedRowIdsInArray() ||
		        (selectedRowId ? [selectedRowId] : []);
            window.returnValue = selectedRowIds.collect(function(elem) {
                return this._getRowData(elem).toObject();
            }, this);
        } else if (selectedRowId != null) {
            window.returnValue = this._getRowData(selectedRowId).toObject();
        }
        window.close();
    },

    getSelectedRowId : function () {
        var rowId = this.grid.getSelectedRowId();
        if (rowId == null) {
            alert("Сначала выберите строку в таблице!");
            return null;
        }
        return rowId;
    },

    doCancel: function() {
        window.close();
    },

    getRequestedFields: function() {
      if(window.dialogArguments) {
          return window.dialogArguments.get('requestedFields');
      } else {
          return this.requestedFields || 'rowid,code,name';
      }
    },

    _getRowData: function(/*String*/rowId) {
        var requestedFields = this.getRequestedFields();
        var names = requestedFields.split(",");

        var ret = $H();
        names.each(function(elem) {
            if (elem == 'rowid') {
                ret.set('rowid', rowId);
            } else if (this.grid._colIds.indexOf(elem) != -1){
                ret.set(elem, this.grid.getCellValue(rowId, elem));
            }
        }, this);

        return ret;
    }
});
