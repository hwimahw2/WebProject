<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<jsp:useBean id="dataSet" class="ru.ncd.Data"> </jsp:useBean>
<jsp:getProperty name="dataSet" property="data"/> <%-- = ${dataSet.data} --%>


<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Quick start with dhtmlxGrid</title>
    <link rel="STYLESHEET" type="text/css" href="codebase/dhtmlxgrid.css">
    <script src="codebase/dhtmlxcommon.js"></script>
    <script src="codebase/dhtmlxgrid.js"></script>
    <script src="codebase/dhtmlxgrid_json.js"></script>
    <script src="codebase/dhtmlxgrid_mcol.js"></script>
    <script src="codebase/dhtmlxgrid_ssc.js"></script>
    <script src="codebase/dhtmlxgrid_srnd.js"></script>
    <script src="codebase/dhtmlxgridcell.js"></script>
    <script src="prototype.js"></script>


</head>
<body>
<div id="gridbox" style="width:600px;height:400px;"></div>
<script>
    var mygrid = new dhtmlXGridObject("gridbox");

    //the path to images required by gridl
    mygrid.setHeader("Sales,Book title,Author,Price");//the headers of columns
    mygrid.setInitWidths("100,250,150,100");          //the widths of columns
    mygrid.setColAlign("right,left,left,left");       //the alignment of columns
    mygrid.setColTypes("ro,ed,ed,ed");                //the types of columns
    mygrid.setColSorting("int,str,str,int");          //the sorting types
    mygrid.init();      //finishes initialization and renders the grid on the page
</script>

<button type="submit" id="btn_click">Button</button>
<script>

  var x = ${dataSet.data}

    data={
        rows:[
            { id:1, data: ["A Time to Kill", "John Grisham", "100", "232"]},
        ]
    };

 <%-- {
      "rows":[
            {"id":1,"data":["A Time to Kill","John Grisham","100","232"]}
            ]
  }--%>

    function btnClick() {
        new Ajax.Request('http://localhost:8090/MyWebProject/data', {
            method: 'get',
            onSuccess: function (transport) {
                var response = transport.responseText || "no response text";
                var y = response.evalJSON(true);
                mygrid.parse(y,"json");
            },
            onFailure: function () {
                alert('Something went wrong...')
            }
        });
    }

    document.observe('dom:loaded',
    function(){
        Event.observe('btn_click','click',btnClick)
    }
    );

</script>
</body>
</html>