/* 
 * d_extra extensions for checkboxes (not commonly used) 
 */

/**
 * Public.
 * Set watcher for specified checkbox column.
 * Call getChangedCheckboxes after that to get changed columns info and CLEAR watcher.
 */
dhtmlXGridObject.prototype.setCheckColumnWatch=function(colId){
    var colIndex = this._colIds.indexOf(colId);
    if (colIndex == -1){
        alert("ID '" + colId + "' is not found in current grid (method setCheckColumnWatch)! Check misspellings!");
        return;
    }
    var colRealPos = this.getRealPos(colIndex);
    var colType = this.getColType(colRealPos);
    if(colType != "ch"){
        alert("Column '" + colId + "' is not a checkbox column!");
        return;
    }   
    this._checkColumnHash = new Hash();
    this._checkColumnEventId = this.attachEvent("onCheckbox", function(rowId, cellInd, state){
        var oldVal=this._checkColumnHash.get(rowId);
        //for debugging
        //alert(oldVal + ' ' + state);
        if (Object.isUndefined(oldVal))
            this._checkColumnHash.set(rowId,state);
        else if (state!=oldVal)
            this._checkColumnHash.unset(rowId);
    });
};

/**
 * Public.
 * Get information on changed checkbox fields. Requires call setCheckColumnWatch before this.
 * Returns array of objects {id : row ID, val : changed checkbox state}
 */
dhtmlXGridObject.prototype.getChangedCheckboxes=function(){
    if (Object.isUndefined(this._checkColumnHash)){
        alert('Call setCheckColumnWatch before calling getChangedCheckboxes!');
        return new Array();
    }
    this.detachEvent(this._checkColumnEventId);
    var res=new Array();
    this._checkColumnHash.each(function(pair){
        res.push({id:pair.key, val:pair.value});
    });
    return res;
};

/**
 * Public.
 * Set all checkboxes in grid (with exception to multiple selection flags - #flag) to disabled state
 * _disableCheckBoxes used in excell_ch constructor (patched)
 */
dhtmlXGridObject.prototype.setDisabledCheckboxes=function(){
  this._disableCheckBoxes=true;/*
  this.attachEvent("onRowCreated", function(id){
      var fp=Object.isUndefined(this.flagpos)?-1:this.flagpos;
      for(var i=0; i<this.getColumnCount();++i){
          if(i!=fp && this.getColType(i)=='ch'){ 
              var cl=this.cells(id, i);
              cl.setDisabled(true);
              cl.cell.innerHTML = cl.cell.innerHTML.replace("item_chk0_dis.","item_chk0.").replace("item_chk1_dis.","item_chk1.");
          }
      }
  }); */   
};

