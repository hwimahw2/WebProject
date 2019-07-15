/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

dhtmlXCombo.prototype.setFocus = function () {
    this.DOMelem_input.focus();
};

dhtmlXCombo.prototype.selectOptionByValue = function (val) {
    var ind = 1;
    for (var i=0; i < this.optionsArr.length;++i) {
        if ( this.optionsArr[i].value == val ) {
            ind = i;
            break;
        }
    }
    if (this._selOption != ind )
        this.selectOption(ind);
};

dhtmlXCombo.prototype.selectOptionByText = function (val, isRegExp) {
    var ind = 0;
    var regexFlag = new Boolean();
    var regex;

    if (isRegExp == undefined || !isRegExp) {
        regexFlag = false;
    } else {
        regexFlag = true;
        regex = new RegExp(val);
    }
    for (var i=0; i < this.optionsArr.length; ++i) {
        if (!regexFlag ) {
            if ( this.optionsArr[i].text == val ) {
                ind = i;
                break;
            }
        } else {
            if (this.optionsArr[i].text.match(regex)) {
                ind = i;
                break;
            }
        }
    }

    if(i == this.optionsArr.length){
        return false;
    }

    if (this._selOption != ind ) {
        this.selectOption(ind);
		return true;
	}

	return false;
};

// метод не используется
dhtmlXCombo.prototype.getIndexByText = function(val){
      for(var i=0; i < this.optionsArr.length; ++i)
         if(this.optionsArr[i].text == val) 
             return i;
      return -1;
};
// метод не используется
dhtmlXCombo.prototype.setValueForAutocompleteCombo = function(gridObj, rowId, id_field_name, text_field_name){
      var op = gridObj.getCellValue(rowId, text_field_name);
      if (op != ''){
          var index = this.getIndexByText(op);
          if (index != -1) {
              this.selectOption(index); 
          }else {
              var code = gridObj.getCellValue(rowId, id_field_name);
              this.addOption([[code, op]]);
              this.selectOptionByValue(code);
          }
      }    
};
// метод не используется
dhtmlXCombo.prototype.loadFromUrlJson=function(url,func){
    alameda.ajaxRequest(url, {
        method:"post",
        onSuccess:function(transport){
            if (transport.responseText == 'error') return;
            var json = transport.responseText.evalJSON(true);
            var ar = json.values;
            if (typeof(ar) != 'array'){
                var ar2 = new Array();
                ar2.push(ar);
                ar = ar2;
            }
            ar = func(ar);
            this.clearAll(true);
            for (var i=0;i<ar.length;++i){
                var item=ar[i];
                this.addOption(item.id, Object.isUndefined(item.v) ? "" : item.v);
            }
        }
    }, alameda.AjaxRequestMode.GET );    
};

dhtmlXCombo.prototype.getOptionsNum = function() {
    return this.optionsArr.length;
};

dhtmlXCombo.prototype.getOptions = function(mode) {
    var opt = new Array ();
    for (var i = 0; i < this.optionsArr.length; ++i)
    {
        var item = this.optionsArr[i];
        if ( item.value == '' ) {
            if (mode != 'all') {
                continue;
            }
        }
        
        var nobj = new Object();
        nobj.value = item.value;
        nobj.text = item.text;
        opt.push(nobj);          
    }
    return opt;
};

dhtmlXCombo.prototype.focus = function () {
    this.DOMelem_input.focus();
};

/**
 * Метод грузит данные лдя комбика с сервера.
 * Возмножно задавать синхронность запроса
 * @param url url
 * @param afterCall отрабатвает после вызова
 * @param async : Boolean синхронность
 */
dhtmlXCombo.prototype.loadXML2 = function(url, afterCall, async) {
    this._load = true;
    this.callEvent("onXLS", []);
    if ((this._xmlCache) && (this._xmlCache[url])) {
        this._fillFromXML(this, null, null, null, this._xmlCache[url]);
        if (afterCall)afterCall();
    } else {
        var xml = (new dtmlXMLLoaderObject(this._fillFromXML, this, async, true));
        if (afterCall)xml.waitCall = afterCall;
        if (this._prs)for (var i = 0; i < this._prs.length; i++)url += [getUrlSymbol(url),escape(this._prs[i][0]),"=",escape(this._prs[i][1])].join("");
        xml._cPath = url;
        xml.loadXML(url);
    }
};

dhtmlXCombo.prototype.addOption3 = function(options){
  this.render(false);
  for (var i=0; i<options.length;++i){
      var op=options[i];
      this.addOption2(op[0], op[1]);
      //this.addOption2(op.value, op.text);
  }
  this.redrawOptions();
  this.render(true);
}

dhtmlXCombo.prototype.addOption2 = function(options)
{
  if (!arguments[0].length || typeof(arguments[0])!="object")
     args = [arguments];
  else
     args = options;


    for (var i=0; i<args.length; i++) {
        var attr = args[i];
     if (attr.length){
           attr.value = attr[0]||"";
           attr.text = attr[1]||"";
           attr.css = attr[2]||"";
     }
        this._addOption2(attr);
    }
}

dhtmlXCombo.prototype._addOption2 = function(attr)
{
     dOpt = new this._optionObject();
     this.optionsArr.push(dOpt);
     dOpt.setValue.apply(dOpt,[attr]);
}