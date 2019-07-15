//include prototype lib BEFORE this file


/*Create RefButtons in the specified DIV*/
function RefButtons(page_name, div_name_upper, div_name_lower, onReloadTable,
        onNewRec, onCopyRec, onEditRec, onDeleteRec, onSaveRec, onCancelRec, clearAll){
    // В случае, если у пользователя нет привилегий на редактирование, все пара-
    // метры, начиная с onNewRec не будут определены. Следовательно, этот признак
    // может быть использован для добавления кнопок на форму
    var canEdit = !Object.isUndefined(onNewRec);
        
    var d=$(div_name_upper);

    this._PageName = page_name;
    this._ButtonNames = new Array ('rb_new_rec', 'rb_copy_rec', 'rb_edit_rec',
        'rb_del_rec', 'rb_reload', 'rb_save_rec', 'rb_cancel_rec',
        'rb_clear_all');

    this._InvisibleButtons = new Array();
    

    var content = '';
    if (canEdit) {
        if ( onNewRec != null) 
            content += '<input id="' + page_name + 'rb_new_rec" type="button" class="button"  value="\u041d\u043e\u0432\u0430\u044f \u0437\u0430\u043f\u0438\u0441\u044c" />';
        else 
            this._InvisibleButtons.push('rb_new_rec');
        
        if ( onCopyRec != null ) 
            content += '<input id="' + page_name + 'rb_copy_rec" type="button" class="button"  value="\u041d\u043e\u0432\u0430\u044f \u0437\u0430\u043f\u0438\u0441\u044c \u043d\u0430 \u043e\u0441\u043d\u043e\u0432\u0435 \u0442\u0435\u043a\u0443\u0449\u0435\u0439 \u0441\u0442\u0440\u043e\u043a\u0438" />';
        else 
            this._InvisibleButtons.push('rb_copy_rec');
        
        if ( onEditRec != null) 
            content += '<input id="' + page_name + 'rb_edit_rec" type="button" class="button"  value="\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u044c" />';
        else 
            this._InvisibleButtons.push('rb_edit_rec');
        
        if ( onDeleteRec != null) 
            content += '<input id="' + page_name + 'rb_del_rec" type="button" class="button"  value="\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u044c" />';
        else 
            this._InvisibleButtons.push('rb_del_rec');
        
    }    
    content += '<input id="' + page_name + 'rb_reload" type="button" class="button"  value="\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435" onclick="rel_country();" />';
    d.innerHTML = content;
    
    if (canEdit) {
        saveClickListener(page_name + 'rb_new_rec', onNewRec);
        saveClickListener(page_name + 'rb_copy_rec', onCopyRec);
        saveClickListener(page_name + 'rb_edit_rec', onEditRec);
        saveClickListener(page_name + 'rb_del_rec', onDeleteRec);
    }

    if (onReloadTable != null)
        $(page_name + 'rb_reload').onclick=onReloadTable;

    d=$(div_name_lower);
    content = '';
    if (canEdit) {
        if (onSaveRec != null)
            content += '<input id="' + page_name + 'rb_save_rec" type="button" class="button"  value="\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c запись" />';
        else
            this._InvisibleButtons.push('rb_save_rec');

        if ( onCancelRec != null)
            content += '<input id="' + page_name + 'rb_cancel_rec" type="button" class="button"  value="\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c" />';
        else
            this._InvisibleButtons.push('rb_cancel_rec');
        if ( clearAll != null)
            content += '<input id="' + page_name + 'rb_clear_all" type="button" class="button"  value="\u041e\u0447\u0438\u0441\u0442\u0438\u0442\u044c \u043f\u043e\u043b\u044f \u0432\u0432\u043e\u0434\u0430" />';
        else
            this._InvisibleButtons.push('rb_clear_all');
    }
    d.innerHTML = content;

    if (canEdit) {
        saveClickListener(page_name + 'rb_save_rec', onSaveRec);
        saveClickListener(page_name + 'rb_cancel_rec', onCancelRec);
        saveClickListener(page_name + 'rb_clear_all', function(){ clearAll(1);});
    }

    this.setUpperButtonsEnabled(false);
    this.setLowerButtonsState(false);
}


/*Toggle buttons between edit mode and view mode*/
RefButtons.prototype.toggleButtons = function(editMode) {
    if (this._PageName == undefined) return;
    var st1 = editMode ? "none" : "inline";
    var st2 = editMode ? "inline" : "none";
    for (var i = 0; i < this._ButtonNames.length; i++ ) {
        switch (this._ButtonNames[i]) {
            case 'rb_new_rec':
            case 'rb_copy_rec':
            case 'rb_edit_rec':
            case 'rb_del_rec':
            case 'rb_reload':       vStyle = st1; break;
            case 'rb_save_rec':
            case 'rb_cancel_rec':
            case 'rb_clear_all':    vStyle = st2; break;
        }
        
        if (this._InvisibleButtons.indexOf(this._ButtonNames[i]) == -1)
            $(this._PageName + this._ButtonNames[i]).style.display = vStyle; 
    }
};

/*Set state of copy and edit buttons*/
RefButtons.prototype.setRecordDependentButtonsState=function(enabled){
    if (this._PageName == undefined) return;
    this._setButtonsStateEnabled(['rb_copy_rec', 'rb_edit_rec', 'rb_del_rec'], enabled);
};
RefButtons.prototype.setLowerButtonsEnabled=function(enabled){
    if (this._PageName == undefined) return;
    this._setButtonsStateEnabled(['rb_save_rec', 'rb_cancel_rec', 'rb_clear_all'], enabled);
};
RefButtons.prototype.setUpperButtonsEnabled=function(enabled){
    if (this._PageName == undefined) return;
    this._setButtonsStateEnabled(['rb_new_rec', 'rb_copy_rec', 'rb_edit_rec', 'rb_del_rec', 'rb_reload'], enabled);
};
RefButtons.prototype.setUpperButtonsReadOnlyState=function(enabled){
    if (this._PageName == undefined) return;
    this._setButtonsStateEnabled(['rb_new_rec', 'rb_copy_rec', 'rb_edit_rec', 'rb_del_rec'], enabled);
};
RefButtons.prototype.setLowerButtonsState=function(visible){
    if (this._PageName == undefined) return;
    this._setButtonsStateVisible(['rb_save_rec', 'rb_cancel_rec', 'rb_clear_all'], visible);
};

RefButtons.prototype._setButtonsStateEnabled = function(names, enabled) {
    if (this._PageName == undefined) return;
    for (var i=0; i < names.length; ++i) {
        var n=names[i];
        if (this._InvisibleButtons.indexOf(n) == -1) {
            var btn=$(this._PageName + n);
            if (btn != null)
                btn.disabled=!enabled;
        }
    }
};

RefButtons.prototype._setButtonsStateVisible=function(names, visible) {
    if (this._PageName == undefined) return;
    var st1=visible? "inline":"none";
    for (var i=0;i<names.length;++i){
        var n=names[i];
        if (this._InvisibleButtons.indexOf(n) == -1){
            var btn=$(this._PageName + n);
            if (btn != null)
                btn.style.display=st1;
        }
    }
};

/* Mask buttons. Get array as parameter which contains name of buttons to hide */
RefButtons.prototype.maskButtons=function(hideMask) {
    var res = 0;
    return res;
};
