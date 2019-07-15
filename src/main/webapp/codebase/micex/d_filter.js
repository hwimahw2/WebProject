//глобальные функции. Намеренно оставлены в глоальном пространстве имен. Думаю, могут пригодиться в другом коде.

//перевод строки в массив символов
function strToArray(s){
    var ar=new Array(s.length);
    for (var i=0; i<s.length; ++i)
        ar[i]=s.charAt(i);
    return ar;
}

//перевод указанной части массива символов в строку
function arToStr(ar, start, cnt){
    var s='';
    for (var i=start; i < start + cnt; ++i)
        s+=ar[i];
    return s;
}

//public function - interface to get filter for a given string
function getFilter(str, colType){
    var lx=new Lexer(str.strip(), colType);
    lx.parse();
    return new SubEx(lx.lexemas, 0, lx.lexemas.length - 1, colType)
}

var __INT_TYPE_NAME='int';
var __STR_TYPE_NAME='strspec';
var __DATE_TYPE_NAME='datedot';
var __TIME_TYPE_NAME='timestamp';

//////////////////////////////////////////////////////////////////////////////////////////////////
//  Lexer
//////////////////////////////////////////////////////////////////////////////////////////////////

function Lexer(str, colType){
    var ar=strToArray(str);
    this.operators = ['=','!=','>=','>','<=','<',',','&','|','(',')'];
    this.opChars = '=!><,&|()';
    this.chars = ar;
    this.sz = ar.length;
    this.colType = colType;
}

Lexer.prototype._isDigit=function(c){
    return (c=='0'||c=='1'||c=='2'||c=='3'||c=='4'||c=='5'||c=='6'||c=='7'||c=='8'||c=='9');
}

Lexer.prototype._isSpace=function(c){
    return c==' '||c=='\t'||c=='\n'||c=='\r';
}

Lexer.prototype._getSign=function(sign){
    if (sign==undefined)return 1;
    return (sign==false?-1:1);
}

Lexer.prototype._getYear=function(num)
{
    var p = 0;
    while (p < num.length && num.charAt(p) == '0')
        ++p;
    if (p == num.length)
        var year = 2000;
    else
        year = parseInt(num.substr(p), 10);
    if (year < 50)
        year += 2000;
    else if (year >= 50 && year < 100)
        year += 1900;
    return year;
}

Lexer.prototype._isCorrectDate=function(year, month, day){
    var d = new Date(year, month-1, day);
    if (year >= 2000)
        return (d.getYear()==year && d.getMonth()==(month-1) && d.getDate()==day);
    else{
        var y = d.getYear();
        if (y < 100)
            y+=1900;
        return (y==year && d.getMonth()==(month-1) && d.getDate()==day);
    }
}

Lexer.prototype._checkTime=function(hour, min, sec)
{
    if (hour < 0 || hour > 23)
        throw new Error(-1,"Значение часов должно быть между 0 и 23!");
    if (min < 0 || min > 59)
        throw new Error(-1,"Значение минут должно быть между 0 и 59!");
    if (sec < 0 || sec > 59)
        throw new Error(-1,"Значение секунд должно быть между 0 и 59!");
}

Lexer.prototype.getResults=function(){
    return this.lexemas;
}

Lexer.prototype._packLexemas=function(oldList){
    var ll=oldList;
    var newAr=new Array();
    var sz=ll.length;
    for (var i=0; i<sz; ++i)
    {
        var l=ll[i];
        if (l.isConst())
        {
            if (i < sz - 2)
            {
                if (ll[i + 1].isSpace() && ll[i + 2].isConst())
                {
                    var result = l.val + ll[i + 1].val + ll[i + 2].val;
                    newAr.push(this._stringLexema(result));
                    i += 2;
                    continue;
                }
            }
            if (i < sz - 1){
                if (ll[i + 1].isStringConst()){
                    result = l.sVal + ll[i + 1].sVal;
                    newAr.push(this._stringLexema(result));
                    ++i;
                    continue;
                }
            }
        }
        else if (l.isSpace())
        {
            if (i < sz - 1){
                if (ll[i + 1].isStringConst()){
                    result = l.val + ll[i + 1].val;
                    newAr.push(this._stringLexema(result));
                    ++i;
                    continue;
                }
            }
            if (i == 0 || i == sz - 1) continue;
        }
        newAr.push(l);
    }
    return newAr;
}

Lexer.prototype.parse=function(){
    this._parse1();
    var res1=this._packLexemas(this.lexemas);
    while(true){
        var res2=this._packLexemas(res1);
        if (res1.length==res2.length) break;
        res1=res2;
    }

    this.lexemas = res2;
    this._removeUnnecessaryBrackets();
    this._addBrackets();
    this._removeUnnecessaryBrackets();
}

Lexer.prototype._parse1=function(){
    this.lexemas=new Array();
    var p=0;
    var strLex='';
    while(p < this.sz){
        if (p < this.sz && this._isSpace(this.chars[p]) && strLex == ''){
            var spaces = '';
            while (p < this.sz && this._isSpace(this.chars[p])){
                spaces+=this.chars[p];
                ++p;
            }
            if (spaces.length > 0)
                this.lexemas.push(this._spaceLexema(spaces));
        }
        if (p >= this.sz) break;
        var c = this.chars[p];
        if (this.opChars.indexOf(c) != -1){
            var res = this._getOperator(p);
            if (res.length > 0){
                if (strLex.length > 0){
                    this.lexemas.push(this._stringLexema(strLex));
                    strLex='';
                }
                this.lexemas.push(res[0]);
                p=res[1];
                continue;
            }
        }
        if (c=='\'' || c=='"'){
            res=this._gatherString(p+1);
            if (res.length==0)
                throw new Error(-1,'Не закрыта строковая константа!');
            this.lexemas.push(res[0]);
            p=res[1];
        }
        else if (strLex.length == 0 && this._isNumStart(c)){
            try{
                res = this._getNumeric(p);
                this.lexemas.push(res[0]);
                p=res[1];
            } catch (err){
                strLex+=c;
                ++p;
            }
        }
        else{
            if (c=='\\'){
                if (p + 1 < this.sz){
                    ++p;
                    strLex+=c+this.chars[p];
                    ++p;
                }
                else
                    throw new Error(-5, 'Строковая константа не должна заканчиваться одиночным символом слэша ("\\")! Если Вы хотите найти строки, заканчивающиеся данным символом, укажите его дважды!');
            } else {
                strLex+=c;
                ++p;
            }
        }
    }
    if (strLex.length > 0)
        this.lexemas.push(this._stringLexema(strLex));
}

Lexema.prototype._postProcessString=function(str){
    var ar = strToArray(str);
    var res='';
    for (var i=0; i<ar.length; ++i){
        var c=ar[i];
        if (c=='\\'){
            res += ar[i+1];
            ++i;
            continue;
        }
        else
            res+=c;
    }
    return res;
}

Lexer.prototype._gatherString=function(pos){
    var border=this.chars[pos-1];
    var res='';
    for (var i=pos; i<this.sz; ++i){
        var c=this.chars[i];
        if (c == border)
            return [this._stringLexema(res), i+1];
        else
            res+=c;
    }
    return [];
}

//начинается ли массив символов ar с позиции pos строкой testStr
Lexer.prototype._startsWith=function(ar, pos, testStr){
    var t_ar = strToArray(testStr);
    var t_len = t_ar.length;
    if (ar.length - pos < t_len) return false;
    var n = pos;
    for (var i = 0; i < t_len; ++i, ++n){
        if (ar[n] != t_ar[i]) return false;
    }
    return true;
}

Lexer.prototype._getOperator=function(pos){
    var len=this.operators.length;
    for (var i=0; i < len; ++i){
        var s = this.operators[i];
        if (this._startsWith(this.chars, pos, s)){
            return [this._operatorLexema(s), pos + s.length];
        }
    }
    return [];
}

Lexer.prototype._getNumeric=function(pos){
    var p=pos;
    var isPlus=undefined;
    var part=1;
    var before='', after='', third='';
    while (p < this.sz && !this._isNumericTerminator(this.chars[p]))
    {
        var c = this.chars[p];
        if ((c == '-' || c == '+')){
            if (p > pos)
                throw new Error(-1,"Арифметика в фильтрах не поддерживается - найден знак '" + c + "' в неожиданной позиции фильтра!");
            isPlus = (c == '+');
        }
        else if (this._isDigit(c))
        {
            if (part == 1)
                before+=c;            
            else if (part == 2)
                after+=c;
            else
                third+=c;
        }
        else if (c == '.')
        {
            ++part;
            if (part == 3 && isPlus != undefined)
                throw new Error(-1,"Знак плюс/минус не может идти перед датой!");
            if (part > 3)
                throw new Error(-1,"Слишком много точек в числе/дате!");
        }
        else
            throw new Error(-1,"Найден неожиданный символ '" + c + "' при разборе числа/даты!");
        ++p;
    }
    if (part == 1) //integer
    {
        if (before.length == 0)
            throw new Error(-1,"Числа не могут начинаться с точки!");
        if (isPlus == undefined && (this.colType==__TIME_TYPE_NAME || this.colType == __DATE_TYPE_NAME )){
            var dt = Date.parse(_NdcDatePatterns(before));
            if (dt!=null) {
                //корректировка для фильтров - если номер дня больше текущего, то подставляем дату из прошлого месяца. Должно работать только в случае, когда введен лишь номер дня (1 или 2 цифры)
                if (before.length <= 2){
                    var today=Date.now();
                    var delta=0;
                    //не проскочили ли мы на месяц веперед? (ввели 31 в феврале)
                    if (dt.getMonth() != today.getMonth())
                        delta-=1;
                    if (dt.getDate() > today.getDate())
                        delta-=1;
                    dt.addMonths(delta);
                }
                if (this.colType == __TIME_TYPE_NAME){
                    return [this._datetimeLexema([dt.getDate(), dt.getMonth()+1, dt.getFullYear(), dt.getHours(), dt.getMinutes(), dt.getSeconds()], arToStr(this.chars, pos, p-pos)), p];                
                } else if (this.colType == __DATE_TYPE_NAME){
                    return [this._dateLexema([dt.getDate(), dt.getMonth()+1, dt.getFullYear()], arToStr(this.chars, pos, p-pos)), p];
                }
            }
        }
        
        if (before!="0" && before.charAt(0)=='0')
            throw new Error("Число не может начинаться с нуля, если вслед за нулем идет любой символ, кроме точки!");
        if (this.colType==__STR_TYPE_NAME){
            return [this._stringLexema(before), p];
        }
        return [this._intLexema(before * this._getSign(isPlus)), p];
    }
    else if (part == 2) //float
    {
        if (before.length == 0)
            throw new Error(-1,"Числа не могут начинаться с точки!");
        if (after.length == 0)
            throw new Error(-1,"После точки должна идти хотя бы одна цифра в дробном числе!");
        if (before!="0" && before.charAt(0)=='0')
            throw new Error("Число не может начинаться с нуля, если вслед за нулем идет любой символ, кроме точки!");
        var val = arToStr(this.chars, pos, p - pos);
        return [this._intLexema(val), p];
    }
    else //if (part == 3) //date or datetime
    {
        if (before.length == 0 || after.length == 0 || third.length == 0)
            throw new Error(-1,"Все части даты должны быть не пустыми!");
        //we have date in all cases
        var day = parseInt(before, 10);
        var month = parseInt(after, 10);
        var year = this._getYear(third);
        if (!this._isCorrectDate(year, month, day))
            throw new Error("Несуществующая дата - " + day + '.' + month + '.' + year + '!');
        if (p < this.sz && this._isSpace(this.chars[p]) && this._testRegexp(this.chars, p + 1, 8, /\d{2}:\d{2}:\d{2}/)) //hh:mm:ss
        {
            var hour = parseInt(arToStr(this.chars, p + 1, 2), 10);
            var min = parseInt(arToStr(this.chars, p + 4, 2), 10);
            var sec = parseInt(arToStr(this.chars, p + 7, 2), 10);
            this._checkTime(hour, min, sec);
            return [this._datetimeLexema([day, month, year, hour, min, sec], arToStr(this.chars, pos, p+9-pos)), p + 9];
        }
        else if (p < this.sz && this._isSpace(this.chars[p]) && this._testRegexp(this.chars, p + 1, 5, /\d{2}:\d{2}/)) //hh:mm
        {
            hour = parseInt(arToStr(this.chars, p + 1, 2), 10);
            min = parseInt(arToStr(this.chars, p + 4, 2), 10);
            this._checkTime(hour, min, 0);
            return [this._datetimeLexema([day, month, year, hour, min, 0], arToStr(this.chars, pos, p+6-pos)), p + 6];
        }
        else //date
        {
            return [this._dateLexema([day, month, year], arToStr(this.chars, pos, p-pos)), p];
        }
    }

}

Lexer.prototype._testRegexp=function(/*char[]*/chars, /*int*/ pos, /*int*/ len, /*RegExp*/ regexp)
{
    if (chars.length - pos < len) return false;
    var s = arToStr(chars, pos, len);
    return s.match(regexp);
}

Lexer.prototype._isNumericTerminator=function(c)
{
    return '=!><,&|() \t\n\r'.indexOf(c) != -1;
}

Lexer.prototype._isNumStart=function(c){
    return (this._isDigit(c)||c=='-'||c=='+');
}

function getPairBracket(lexemas, start)
{
    var sz = lexemas.length;
    if (sz <= start)
        return -1;
    if (!lexemas[start].isLBracket())
        return -1;
    var cnt = 1;
    for (var i = start + 1; i < sz; ++i)
    {
        var op = lexemas[i];
        if (op.isLBracket())
            ++cnt;
        else if (op.isRBracket()){
            if (cnt == 1)
                return i;
            else
                --cnt;
        }
    }
    return -1;
}

Lexer.prototype._removeUnnecessaryBrackets=function()
{
    if (this.lexemas.length <= 1)
        return;
    while (this.lexemas.length > 1 && this.lexemas[0].isLBracket())
    {
        var rp = getPairBracket(this.lexemas, 0);
        if (rp == -1)
            this.lexemas.shift();
        else if (rp == this.lexemas.length - 1)
        {
            this.lexemas.pop();
            this.lexemas.shift();
        }
        else
            break;
    }
}

Lexer.prototype._addBrackets=function()
{
    if (this.lexemas.length==0) return;
    var p = 0;
    var start = 0;
    while (p < this.lexemas.length)
    {
        var l = this.lexemas[p];
        if (l.isLBracket()){
            var right = getPairBracket(this.lexemas, p);
            if (right == -1)
                throw new Error(-5, "Не могу найти парную закрывающую скобку!");
            var foundJoin = false;
            for (var i = p + 1; i < right; ++i)
                if (this.lexemas[i].isJoinOp()){
                    foundJoin = true;
                    break;
                }
            if (!foundJoin)
                p = right;
        }
        else if (l.isJoinOp()){
            var shouldAdd = true;
            if (this.lexemas[start].isLBracket()){
                right = getPairBracket(this.lexemas, start);
                if (right == p - 1) shouldAdd = false;
            }
            if (shouldAdd){
                this.lexemas = _insertAt(this.lexemas, p, this._operatorLexema(')'));
                this.lexemas = _insertAt(this.lexemas, start, this._operatorLexema('('));
                p += 2;
            }
            start = p + 1;
        }
        ++p;
    }
    if (start < this.lexemas.length && !this.lexemas[start].isLBracket()){
        this.lexemas.push(this._operatorLexema(')'));
        this.lexemas = _insertAt(this.lexemas, start, this._operatorLexema('('));
    }
}

Lexer.prototype._operatorLexema=function(value){
    return new Lexema('OPERATOR', value);
}

Lexer.prototype._stringLexema=function(value){
    return new Lexema(__STR_TYPE_NAME, value);
}

Lexer.prototype._intLexema=function(value){
    return new Lexema(__INT_TYPE_NAME, value);
}

Lexer.prototype._spaceLexema=function(value){
    return new Lexema('SPACE', value);
}

Lexer.prototype._dateLexema=function(value,svalue){
    return new Lexema(__DATE_TYPE_NAME, value, svalue);
}

Lexer.prototype._datetimeLexema=function(value,svalue){
    return new Lexema(__TIME_TYPE_NAME, value,svalue);
}


////////////////////////////////////////////////////////////////////////////////////////////////
//    SubEx
////////////////////////////////////////////////////////////////////////////////////////////////


function SubEx(lexemas, from, to, colType){
    var beg = lexemas[from];
    if (beg.isLBracket())
    {
        this.parseSubExpressions(lexemas, from, to, colType);
    }
    else
    {
        this.thisExpression = this.getSpecific(lexemas, from, to-from+1, colType);
        if (this.thisExpression == null)
            throw new Error(-5, "Неизвестное выражение - " + this._joinArray(lexemas, from, to-from+1, ", ", function(l){return l.val}) + ' !');
    }    
}

SubEx.prototype._joinArray=function(ar, start, cnt, joinStr, func){
    var s=ar[start];
    if (Object.isUndefined(func)){
        for (var i=start+1; i < start + cnt; ++i)
            s+=joinStr+ar[i];
    }
    else {
        for (i=start+1; i < start + cnt; ++i)
            s+=joinStr+func(ar[i]);
    }
    return s;
}

SubEx.prototype.parseSubExpressions=function(lexemas, from, to, colType)
{        
    this.expressions = new Array();
    this.operators = new Array();
    var p = from;
    var st = 'START';
    while (p <= to)
    {
        var l = lexemas[p];
        if (l.isLBracket()){
            if (st == 'SUBEX')
                throw new Error(-5, "Нельзя указывать два или более подвыражения подряд, не соединяя их логическими операторами!");
            var rp = getPairBracket(lexemas, p);
            if (rp == -1)
                throw new Error(-5, "Нет скобки, парной к скобке в позиции " + p + '!');
            if (rp > to)
                throw new Error(-5, "Позиция скобки, парной к скобке в позиции " + p + ", находится за пределами заданного диапазона [" + from + "; " + to + "]!");
            if (p + 1 > rp - 1)
                throw new Error(-5, "Не допускаются пустые подвыражения!");            
            this.expressions.push(new SubEx(lexemas, p + 1, rp - 1, colType));
            p = rp;
            st = 'SUBEX';
        }
        else if (l.isJoinOp()){
            if (st != 'SUBEX')
                throw new Error(-5, "Перед логическим оператором может быть только подвыражение!");
            this.operators.push(l.val);
            st = 'OP';
        }
        else
            throw new Error(-5, "Найдена неожидаемая лексема - " + l.toString());
        ++p;
    }
    if (st != 'SUBEX')
        throw new Error(-5, "Выражение может заканчиваться только подвыражением (а не логическим оператором)!");
}

SubEx.prototype.getSpecific=function(lexemas, start, cnt, dataType){
    if (cnt==1){
        var l=lexemas[start];
        if (l.isConst()){
            return new EqFilter(l, dataType);
        }
    }
    else if (cnt==2){
        var first=lexemas[start];
        var second=lexemas[start+1];
        if (first.isOp() && second.isConst()){
            if (first.val=='=')
                return new EqFilter(second, dataType);
            else if (first.val=='!=')
                return new NeFilter(second, dataType);
            else if (first.val=='>=')
                return new GeFilter(second, dataType);
            else if (first.val=='>')
                return new GtFilter(second, dataType);
            else if (first.val=='<=')
                return new LeFilter(second, dataType);
            else if (first.val=='<')
                return new LtFilter(second, dataType);
        }
    }
    else if (cnt==3){
        first=lexemas[start];
        second=lexemas[start+1];
        var third=lexemas[start+2];
        if (first.isConst() && second.val==',' && third.isConst()){
            if (this._areCompatibleTypes(first.type, third.type))
            return new BetweenFilter(first, third, dataType);
        }
    }
    return null;
}

SubEx.prototype._areCompatibleTypes=function(type1, type2){
    if (type1==type2)return true;
    if (type1==__STR_TYPE_NAME||type2==__STR_TYPE_NAME)return true;
    if (type1==__DATE_TYPE_NAME&&type2==__TIME_TYPE_NAME)return true;
    if (type2==__DATE_TYPE_NAME&&type1==__TIME_TYPE_NAME)return true;
    return false;
}

SubEx.prototype.hit=function(testStr){
    if (!Object.isUndefined(this.thisExpression))
        return this.thisExpression.hit(testStr);
    var sz = this.expressions.length - 1;
    var left = this.expressions[0].hit(testStr);
    for (var i = 0; i < sz; ++i)
    {
        var right = this.expressions[i + 1].hit(testStr);
        var isAnd = this.operators[i] == '&';
        if (isAnd)
            left = left && right;
        else
            left = left || right;
    }
    return left;
}

SubEx.prototype.toString=function(){
    if (!Object.isUndefined(this.thisExpression))
        return this.thisExpression.toString();
    var sb = '(';
    sb+=this.expressions[0].toString();
    var sz = this.operators.length;
    for (var i = 0; i < sz; ++i)
    {
        sb+=this.operators[i];
        sb+=this.expressions[i + 1].toString();
    }
    return sb + ')';
}

SubEx.prototype.toString2=function(){
    if (!Object.isUndefined(this.thisExpression))
        return this.thisExpression.toString2();
    var sb = '';
    sb+=this.expressions[0].toString2();
    var sz = this.operators.length;
    for (var i = 0; i < sz; ++i)
    {
        sb+=this.operators[i];
        sb+=this.expressions[i + 1].toString2();
    }
    return sb;// + ')';
}



//////////////////////////////////////////////////////////////////////////////////////////////////
//  Lexema
//////////////////////////////////////////////////////////////////////////////////////////////////

function Lexema(typ, value,svalue){
    this.type = typ;
    this.val = value;
    if (typ==__STR_TYPE_NAME){
        var parsedList = this._strPackList(this._strParse(value));
        this._strSetPattern(parsedList);        
    }
    if (typ==__STR_TYPE_NAME||typ==__INT_TYPE_NAME)
        this.sVal=this.val;
    else if (typ==__DATE_TYPE_NAME||typ==__TIME_TYPE_NAME)
        this.sVal=svalue;
}

Lexema.prototype.toString=function(){
    return '{' + this.type + ' : "' + this.val + '"}';
}

Lexema.prototype.toString2=function(){
    if (this.type == __INT_TYPE_NAME)
        return this.val;
    if (this.type==__STR_TYPE_NAME)
        return "'" + this.val + "'";
    if (this.type == __DATE_TYPE_NAME)
        return twoStr(this.val[0])+'.'+twoStr(this.val[1])+'.'+twoStr(this.val[2])
    if (this.type == __TIME_TYPE_NAME)
        return twoStr(this.val[0])+'.'+twoStr(this.val[1])+'.'+twoStr(this.val[2])+' '+twoStr(this.val[3])+':'+twoStr(this.val[4])+':'+twoStr(this.val[5]);
}

Lexema.prototype.isNumberConst=function(){
    return this.type==__INT_TYPE_NAME;
}
Lexema.prototype.isStringConst=function(){
    return this.type==__STR_TYPE_NAME;
}
Lexema.prototype.isSpace=function(){
    return this.type=='SPACE';
}
Lexema.prototype.isLBracket=function(){
    return this.type=='OPERATOR'&&this.val=='(';
}
Lexema.prototype.isRBracket=function(){
    return this.type=='OPERATOR'&&this.val==')';
}
Lexema.prototype.isJoinOp=function(){
    return this.type=='OPERATOR' && (this.val=='&' || this.val=='|');
}
Lexema.prototype.isConst=function(){
    return this.type==__INT_TYPE_NAME || this.type==__STR_TYPE_NAME || this.type==__DATE_TYPE_NAME || this.type==__TIME_TYPE_NAME;
}
Lexema.prototype.isOp=function(){
    return this.type=='OPERATOR';
}

Lexema.prototype._strParse=function(s)
{
    var lst = new Array();
    var chars = strToArray(s);
    var p = 0;
    var sz = chars.length;
    var sb = '';
    while (p < sz){
        var c = chars[p];
        if (c == '\\'){
            ++p;
            if (p+1<sz)sb+=chars[p];
        }
        else if (c == '?' || c == '*'){
            if (sb.length > 0){
                lst.push(['STRING', sb]);
                sb = '';
            }
            if (c == '?')
                lst.push(['ONE', "?"]);
            else
                lst.push(['ZERO_OR_MORE', "*"]);
        }
        else
            sb+=c;
        ++p;
    }
    if (sb.length > 0)
        lst.push(['STRING', sb]);
    return lst;
}

Lexema.prototype._strPackList=function(ll)
{
    var lst = new Array();
    var p = 0;
    var sz = ll.size();
    var cnt = 0;
    var more = false;
    while (p < sz){
        var l = ll[p];
        if (l[0] == 'STRING'){
            if (cnt > 0 || more == true){
                lst.push(['COMPLEX', (more ? "*" : "") + cnt]);
                cnt = 0; more = false;
            }
            lst.push(l);
        }
        else{
            if (l[0] == 'ONE')
                ++cnt;
            else if (l[0] == 'ZERO_OR_MORE')
                more = true;
        }
        ++p;
    }
    if (cnt > 0 || more == true)
        lst.push(['COMPLEX', (more ? "*" : "") + cnt]);
    return lst;
}

Lexema.prototype._replacePatternSpecSymbols=function(str){
    var ar=strToArray(str);
    var sb='';
    for (var i=0;i<ar.length;++i){
        var c=ar[i];
        if (c=='*')
            sb+='\\*';
        else if (c=='?')
            sb+='\\?';
        else if (c=='+')
            sb+='\\+';
        else if (c=='.')
            sb+='\\.';
        else if (c=='(')
            sb+='\\(';
        else if (c==')')
            sb+='\\)';
        else if (c=='|')
            sb+='\\|';
        else 
            sb+=c;
    }
  //  alert(sb);
    return sb;
}

Lexema.prototype._strSetPattern=function(lst)
{
    var sb = '^';
    for (var i=0;i<lst.length;++i)
    {
        var l=lst[i];
        if (l[0] == 'STRING')
            sb+=this._replacePatternSpecSymbols(l[1]);
        else{
            var cnt;
            var multi = l[1].charAt(0) == '*';
            if (multi)
                cnt = parseInt(l[1].substring(1), 10);//todo - check
            else
                cnt = parseInt(l[1], 10);
            if (multi && cnt == 0)
                sb+=".*";
            else if (multi && cnt > 0)
                sb+=".{" + cnt + ",}";
            else if (cnt == 1)
                sb+=".";
            else
                sb+=".{" + cnt + "}";
        }
    }
    sb+='$';
    if (sb=="^$")
        this.isEmpty = true;
    else
        this.pattern = new RegExp(sb, "mi"); 
}

Lexema.prototype.matches=function(test)
{
    if (this.isEmpty)
        return test=='' || test==null || test==undefined;
    return this.pattern.test(test);
}




/////////////////////////////////////////////////////////////
//  EqFilter
/////////////////////////////////////////////////////////////

/*
 * lex - лексема
 * dataType - тип данных в столбце (int, str, datedot, timestamp)
 */
function EqFilter(lex, dataType){
    this.value = lex.val;
    this.valType = lex.type;
    this.lex = lex;
    this.dataType = dataType;
    initFilter(this, this.value, this.valType);
}

EqFilter.prototype.hit=function(testStr){
    return fnc_IsEq(this, testStr);
}

EqFilter.prototype.toString=function(){
    return 'EqFilter('+this.value+')';
}

EqFilter.prototype.toString2=function(){
    return '(=' + this.lex.toString2() + ')';
}

///////////////////////////////////////////////////////////////
// NeFilter
///////////////////////////////////////////////////////////////
function NeFilter(lex, dataType){
    this.value = lex.val;
    this.valType = lex.type;
    this.lex = lex;
    this.dataType = dataType;
    initFilter(this, this.value, this.valType);
}

NeFilter.prototype.hit=function(testStr){
    return !fnc_IsEq(this, testStr);
}

NeFilter.prototype.toString=function(){
    return 'NeFilter('+this.value+')';
}

NeFilter.prototype.toString2=function(){
    return '(!='+this.lex.toString2() + ')';
}

////////////////////////////////////////////////////////////
//  GtFilter
////////////////////////////////////////////////////////////
function GtFilter(lex, dataType){
    this.value = lex.val;
    this.valType = lex.type;
    this.lex = lex;
    this.dataType = dataType;
    initFilter(this, this.value, this.valType);
}

GtFilter.prototype.hit=function(testStr){
    return fnc_IsGt(this, testStr);
}

GtFilter.prototype.toString=function(){
    return 'GtFilter('+this.value+')';
}

GtFilter.prototype.toString2=function(){
    return '(>'+this.lex.toString2() + ')';
}

////////////////////////////////////////////////////////////
//  LeFilter
////////////////////////////////////////////////////////////
function LeFilter(lex, dataType){
    this.value = lex.val;
    this.valType = lex.type;
    this.lex = lex;
    this.dataType = dataType;
    initFilter(this, this.value, this.valType);
}

LeFilter.prototype.hit=function(testStr){
    return !fnc_IsGt(this, testStr);
}

LeFilter.prototype.toString=function(){
    return 'LeFilter('+this.value+')';
}

LeFilter.prototype.toString2=function(){
    return '(<='+this.lex.toString2() + ')';
}

////////////////////////////////////////////////////////////
//  LtFilter
////////////////////////////////////////////////////////////
function LtFilter(lex, dataType){
    this.value = lex.val;
    this.valType = lex.type;
    this.lex = lex;
    this.dataType = dataType;
    initFilter(this, this.value, this.valType);
}

LtFilter.prototype.hit=function(testStr){
    return fnc_IsLt(this, testStr);
}

LtFilter.prototype.toString=function(){
    return 'LtFilter('+this.value+')';
}

LtFilter.prototype.toString2=function(){
    return '(<'+this.lex.toString2() + ')';
}

////////////////////////////////////////////////////////////
//  GeFilter
////////////////////////////////////////////////////////////
function GeFilter(lex, dataType){
    this.value = lex.val;
    this.valType = lex.type;
    this.lex = lex;
    this.dataType = dataType;
    initFilter(this, this.value, this.valType);
}

GeFilter.prototype.hit=function(testStr){
    return !fnc_IsLt(this, testStr);
}

GeFilter.prototype.toString=function(){
    return 'GeFilter('+this.value+')';
}

GeFilter.prototype.toString2=function(){
    return '(>='+this.lex.toString2() + ')';
}

///////////////////////////////////////////////////////////
// BetweenFilter
//////////////////////////////////////////////////////////
function BetweenFilter(lex1, lex2, dataType){
    this.value1 = lex1.val;
    this.valType1 = lex1.type;
    this.value2 = lex2.val;
    this.valType2 = lex2.type;
    this.lex1 = lex1;
    this.lex2 = lex2;
    this.dataType = dataType;
    this._initFilterBetween(this, this.value1, this.valType1, this.value2, this.valType2);
}

BetweenFilter.prototype.hit=function(testStr){
    return this._fnc_Between(this, testStr);
}

BetweenFilter.prototype.toString=function(){
    return 'BetweenFilter('+this.value1+', '+this.value2+')';
}

BetweenFilter.prototype.toString2=function(){
    return '(' + this.lex1.toString2() + ',' + this.lex2.toString2() + ')';
}

BetweenFilter.prototype._fnc_Between=function(v,testStr){
    var t=testStr.toLowerCase();
    if (v.valType==__INT_TYPE_NAME){
        if (v.dataType==__INT_TYPE_NAME){
            var n=Number(t);
            return v.iValue1<=n && v.iValue2>=n;
        }
        else if (v.dataType==__STR_TYPE_NAME)
            return v.sValue1<=t && v.sValue2>=t;
    }
    else if (v.valType==__DATE_TYPE_NAME){
        if (v.dataType==__DATE_TYPE_NAME){
            var d=strToDate(t);
            return dateCmp(v.dValue1, d) <= 0 && dateCmp(v.dValue2, d) >= 0;
        }
        else if (v.dataType==__TIME_TYPE_NAME){
            var tt=strToTime(t);
            return timeCmp(v.tValue1, tt) <= 0 && timeCmp(v.tValue2, tt) >=0 ;
        }
        else if (v.dataType==__STR_TYPE_NAME)
            return v.sValue1<=t && v.sValue2>=t;
    }
    else if (v.valType==__TIME_TYPE_NAME){
        if (v.dataType==__TIME_TYPE_NAME){
            tt=strToTime(t);
            return timeCmp(v.tValue1, tt) <= 0 && timeCmp(v.tValue2, tt) >= 0;
        }
        else if (v.dataType==__DATE_TYPE_NAME){
            d=strToDate(t);
            return dateCmp(v.dValue1, d) <= 0 && dateCmp(v.dValue2, d) >= 0;
        }
        else if (v.dataType==__STR_TYPE_NAME)
            return v.sValue1<=t && v.sValue2>=t;
    }
    else if (v.valType==__STR_TYPE_NAME){
        return v.sValue1<=t && v.sValue2>=t;
    }
    return false;
}

BetweenFilter.prototype._initFilterBetween=function(filterObj, val1, valType1, val2, valType2){
    if (valType1==__INT_TYPE_NAME){
        filterObj.sValue1=val1.toString();
        filterObj.iValue1=val1;
    }
    else if (valType1==__STR_TYPE_NAME){
        filterObj.sValue1=val1.toLowerCase();
        filterObj.iValue1=strToInt(val1);
        filterObj.dValue1=strToDate(val1);
        filterObj.tValue1=strToTime(val1);
    }
    else if (valType1==__DATE_TYPE_NAME){
        filterObj.sValue1 = twoStr(val1[0])+'.'+twoStr(val1[1])+'.'+twoStr(val1[2]);
        filterObj.dValue1 = val1;
        filterObj.tValue1 = [val1[0], val1[1], val1[2], 0, 0, 0];
    }
    else { //if (valType==__TIME_TYPE_NAME)
        filterObj.sValue1 = twoStr(val1[0])+'.'+twoStr(val1[1])+'.'+twoStr(val1[2])+' '+twoStr(val1[3])+':'+twoStr(val1[4])+':'+twoStr(val1[5]);
        filterObj.dValue1 = [val1[0], val1[1], val1[2]];
        filterObj.tValue1 = val1;
    }

    if (valType2==__INT_TYPE_NAME){
        filterObj.sValue2=val2.toString();
        filterObj.iValue2=val2;
    }
    else if (valType2==__STR_TYPE_NAME){
        filterObj.sValue2=val2.toLowerCase();
        filterObj.iValue2=strToInt(val2);
        filterObj.dValue2=strToDate(val2);
        filterObj.tValue2=strToTime(val2);
    }
    else if (valType2==__DATE_TYPE_NAME){
        filterObj.sValue2 = twoStr(val2[0])+'.'+twoStr(val2[1])+'.'+twoStr(val2[2]);
        filterObj.dValue2 = val2;
        filterObj.tValue2 = [val2[0], val2[1], val2[2], 0, 0, 0];
    }
    else { //if (valType==__TIME_TYPE_NAME)
        filterObj.sValue2 = twoStr(val2[0])+'.'+twoStr(val2[1])+'.'+twoStr(val2[2])+' '+twoStr(val2[3])+':'+twoStr(val2[4])+':'+twoStr(val2[5]);
        filterObj.dValue2 = [val2[0], val2[1], val2[2]];
        filterObj.tValue2 = val2;
    }
    //два совместимых типа данных приводятся к старшему из них
    if (valType1==__STR_TYPE_NAME||valType2==__STR_TYPE_NAME){
        filterObj.valType1=__STR_TYPE_NAME;
        filterObj.valType2=__STR_TYPE_NAME;
    }
    if (valType1==__DATE_TYPE_NAME&&valType2==__TIME_TYPE_NAME)
        filterObj.valType1=__TIME_TYPE_NAME;
    if (valType2==__DATE_TYPE_NAME&&valType1==__TIME_TYPE_NAME)
        filterObj.valType2=__TIME_TYPE_NAME;
    filterObj.valType=filterObj.valType1;
}

  
function dateCmp(d1, d2) {//-1 - d1<d2, 0 - d1=d2, 1 - d1>d2
  if (Object.isUndefined(d1) && Object.isUndefined(d2)) return 0;
  if (Object.isUndefined(d1)) return -1;
  if (Object.isUndefined(d2)) return 1;
  //d1, d2 - arrays [day, month, year]
  if (d1[2]<d2[2])return -1;
  if (d1[2]>d2[2])return 1;
  if (d1[1]<d2[1])return -1;
  if (d1[1]>d2[1])return 1;
  if (d1[0]<d2[0])return -1;
  if (d1[0]>d2[0])return 1;
  return 0;
}

function timeCmp(d1, d2){//-1 - d1<d2, 0 - d1=d2, 1 - d1>d2
    if (Object.isUndefined(d1) && Object.isUndefined(d2)) return 0;
    if (Object.isUndefined(d1)) return -1;
    if (Object.isUndefined(d2)) return 1;
    //d1, d2 - arrays [day, month, year, hour, min, sec]
    if (d1[2]<d2[2])return -1;
    if (d1[2]>d2[2])return 1;
    if (d1[1]<d2[1])return -1;
    if (d1[1]>d2[1])return 1;
    if (d1[0]<d2[0])return -1;
    if (d1[0]>d2[0])return 1;
    if (d1[3]<d2[3])return -1;
    if (d1[3]>d2[3])return 1;
    if (d1[4]<d2[4])return -1;
    if (d1[4]>d2[4])return 1;
    if (d1[5]<d2[5])return -1;
    if (d1[5]>d2[5])return 1;
    return 0;
}
  
  


function fnc_IsLt(v,testStr){
    var t=testStr.toLowerCase();
    if (v.valType==__INT_TYPE_NAME){
        if (v.dataType==__INT_TYPE_NAME)
            return v.iValue>Number(t);
        else if (v.dataType==__STR_TYPE_NAME)
            return v.sValue>t;
    }
    else if (v.valType==__DATE_TYPE_NAME){
        if (v.dataType==__DATE_TYPE_NAME)
            return dateCmp(v.dValue, strToDate(t)) > 0;
        else if (v.dataType==__TIME_TYPE_NAME)
            return timeCmp(v.tValue, strToTime(t)) > 0;
        else if (v.dataType==__STR_TYPE_NAME)
            return v.sValue>t;
    }
    else if (v.valType==__TIME_TYPE_NAME){
        if (v.dataType==__TIME_TYPE_NAME)
            return timeCmp(v.tValue, strToTime(t)) > 0;
        else if (v.dataType==__DATE_TYPE_NAME)
            return dateCmp(v.dValue, strToDate(t)) > 0;
        else if (v.dataType==__STR_TYPE_NAME)
            return v.sValue>t;
    }
    else if (v.valType==__STR_TYPE_NAME){
        return v.sValue>t;
    }
    return false;
}

function fnc_IsGt(v,testStr){
    var t=testStr.toLowerCase();
    if (v.valType==__INT_TYPE_NAME){
        if (v.dataType==__INT_TYPE_NAME)
            return v.iValue<Number(t);
        else if (v.dataType==__STR_TYPE_NAME)
            return v.sValue<t;
    }
    else if (v.valType==__DATE_TYPE_NAME){
        if (v.dataType==__DATE_TYPE_NAME)
            return dateCmp(v.dValue, strToDate(t)) < 0;
        else if (v.dataType==__TIME_TYPE_NAME)
            return timeCmp(v.tValue, strToTime(t)) < 0;
        else if (v.dataType==__STR_TYPE_NAME)
            return v.sValue<t;
    }
    else if (v.valType==__TIME_TYPE_NAME){
        if (v.dataType==__TIME_TYPE_NAME)
            return timeCmp(v.tValue, strToTime(t)) < 0;
        else if (v.dataType==__DATE_TYPE_NAME)
            return dateCmp(v.dValue, strToDate(t)) < 0;
        else if (v.dataType==__STR_TYPE_NAME)
            return v.sValue<t;
    }
    else if (v.valType==__STR_TYPE_NAME){
        return v.sValue<t;
    }
    return false;
}

function fnc_IsEq(v,testStr){
    var t=testStr.toLowerCase();
    if (v.valType==__INT_TYPE_NAME){
        if (v.dataType==__INT_TYPE_NAME)
            return v.iValue==Number(t);
        else if (v.dataType==__STR_TYPE_NAME)
            return v.sValue==t;
    }
    else if (v.valType==__DATE_TYPE_NAME){
        if (v.dataType==__DATE_TYPE_NAME)
            return cmpAr(v.dValue, strToDate(t));
        else if (v.dataType==__TIME_TYPE_NAME)
            return cmpAr(v.tValue, strToTime(t));
        else if (v.dataType==__STR_TYPE_NAME)
            return v.sValue==t;
    }
    else if (v.valType==__TIME_TYPE_NAME){
        if (v.dataType==__TIME_TYPE_NAME)
            return cmpAr(v.tValue, strToTime(t));
        else if (v.dataType==__DATE_TYPE_NAME){
            if (v.tValue[3]!=0 || v.tValue[4]!=0 || v.tValue[5]!=0) return false;
            return cmpAr(v.dValue, strToDate(t));
        }
        else if (v.dataType==__STR_TYPE_NAME)
            return v.sValue==t;
    }
    else if (v.valType==__STR_TYPE_NAME){
        //return v.sValue==t;
        return v.lex.matches(t);
    }
    return false;
}

function initFilter(filterObj, val, valType){
    if (valType==__INT_TYPE_NAME){
        filterObj.sValue=val.toString();
        filterObj.iValue=val;
    }
    else if (valType==__STR_TYPE_NAME){
        filterObj.sValue=val.toLowerCase();
        filterObj.iValue=strToInt(val);
        filterObj.dValue=strToDate(val);
        filterObj.tValue=strToTime(val);
    }
    else if (valType==__DATE_TYPE_NAME){
        filterObj.sValue = twoStr(val[0])+'.'+twoStr(val[1])+'.'+twoStr(val[2]);
        filterObj.dValue = val;
        filterObj.tValue = [val[0], val[1], val[2], 0, 0, 0];
    }
    else { //if (valType==__TIME_TYPE_NAME) 
        filterObj.sValue = twoStr(val[0])+'.'+twoStr(val[1])+'.'+twoStr(val[2])+' '+twoStr(val[3])+':'+twoStr(val[4])+':'+twoStr(val[5]);
        filterObj.dValue = [val[0], val[1], val[2]];
        filterObj.tValue = val;
    }    
}

var df_date2 = /^\d{2}\.\d{2}\.\d{2}$/;
var df_date4 = /^\d{2}\.\d{2}\.\d{4}$/;
var tf_time2_short = /^\d{2}\.\d{2}\.\d{2} \d{2}:\d{2}$/;
var tf_time2_long = /^\d{2}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}$/;
var tf_time4_short = /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/;
var tf_time4_long = /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/;


function strToInt(d){
    var r=Number(d);
    if (isNaN(r))
        return undefined;
    return r;
}

function cmpAr(ar1,ar2){
    if (Object.isUndefined(ar1)||Object.isUndefined(ar2)) return false;
    if (ar1.length!=ar2.length)return false;
    for (var i=0;i<ar1.length;++i)
        if (ar1[i]!=ar2[i])return false;
    return true;
}

function strToDate(d){
    if (d.match(df_date2))
        return [d.substr(0,2), d.substr(3,2), d.substr(6,2)];
    else if (d.match(df_date4))
        return [d.substr(0,2), d.substr(3,2), d.substr(6,4)];
    else
        return undefined;
}

function strToTime(d){
    if (d.match(tf_time2_short))
        return [d.substr(0,2), d.substr(3,2), d.substr(6,2), d.substr(9,2), d.substr(12,2), 0];
    else if (d.match(tf_time2_long))
        return [d.substr(0,2), d.substr(3,2), d.substr(6,2), d.substr(9,2), d.substr(12,2), d.substr(15,2)];
    else if (d.match(tf_time4_short))
        return [d.substr(0,2), d.substr(3,2), d.substr(6,4), d.substr(11,2), d.substr(14,2), 0];
    else if (d.match(tf_time4_long))
        return [d.substr(0,2), d.substr(3,2), d.substr(6,4), d.substr(11,2), d.substr(14,2), d.substr(17,2)];
    else
        return undefined;
}

function twoStr(s){
    var ss=s.toString();
    if (ss.length==1)
        return '0'+ss;
    return ss;
}

