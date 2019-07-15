<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN\" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
    <title>Калькулятор - IslandCount</title>
    <meta charset="utf-8">
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
<h1><b>Онлайн калькулятор подсчета количества островов в матрице</b></h1>
<h4>Введите данные</h4>
<!--<fieldset>-->
    <p><button type="submit" id="btn_data">Из файла</button></p>
    <div id="grid" style="width:600px;height:400px;"></div>
    <script>
        var gridObject = new dhtmlXGridObject("grid");
        gridObject.setHeader("Количество строк, Количество столбцов, Матрица");//the headers of columns
        gridObject.setInitWidths("250,250,100");
     //   gridObject.enableAutoWidth(true);
     //   gridObject.enableAutoHeight(true);
     //   gridObject.setSizes();//the widths of columns
      //  gridObject.setColSorting("int,int,str");        //the sorting types
        gridObject.init();      //finishes initialization and renders the grid on the page

        function btnClick() {
            new Ajax.Request('http://localhost:8090/MyWebProject/data', {
                method: 'get',
                onSuccess: function (transport) {
                    var response = transport.responseText || "no response text";
                    var y = response.evalJSON(true);
                    gridObject.parse(y,"json");
                },
                onFailure: function () {
                    alert('Something went wrong...')
                }
            });
        }
        document.observe('dom:loaded',
            function () {
                Event.observe('btn_data', 'click', btnClick);
            }
        );
    </script>
<!--</fieldset>-->
<script type="text/javascript" src="prototype.js"></script>
</body>
</html>



<%--





    function btnWriteClicked(){
        new Ajax.Request('http://localhost:8090/WebProject1/FirstServlet', {
            method:'get',
            onSuccess: function(transport) {
                var response = transport.responseText || "no response text";
                alert("Success! \n\n" + response);
            },
            parameters: {date: $F('date'), direction: $F('direction'), comment: $F('text')}
        });
    }

    document.observe('dom:loaded',
        function () {
            Event.observe('btn_write', 'click', btnWriteClicked);
        }
    );

    var dataset = [
        {
            "id": 0,
            "a": 1,
            "b": "Linwood Long long long",
            "c": "Petersen",
            "d": "Dahlgreen Place"
        },
        {
            "id": 1,
            "a": 2,
            "b": "Edenburg",
            "c": "Agnes",
            "d": "Gem Street"
        },
        // more columns
    ];

    var grid = new dhx.Grid('dataset');
    grid.data.load(dataset);


</script>--%>
