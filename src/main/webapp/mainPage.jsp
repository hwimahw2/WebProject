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
    <script src="codebase/dhtmlxgridcell.js"></script>
    <script src="codebase/dhtmlxgrid_json.js"></script>
    <script src="codebase/dhtmlxgrid_mcol.js"></script>
    <script src="codebase/dhtmlxgrid_ssc.js"></script>
    <script src="codebase/dhtmlxgrid_srnd.js"></script>
    <script src="prototype.js"></script>
    <style type="text/css">
    </style>
</head>
<body>
<h1><b>Онлайн калькулятор подсчета количества островов в матрице</b></h1>
<h4>Введите данные</h4>
    <p><button type="submit" id="btn_matrix">Из файла</button></p>
    <p><button type="submit" id="btn_bd">Из базы данных</button></p>
<%--<fieldset>--%>
    <div id="gridMatrix" style="width:700px;height:400px;"></div>
    <script>



        var gridObjectMatrix = new dhtmlXGridObject("gridMatrix");
        gridObjectMatrix.setHeader("Количество строк,Количество столбцов,Матрица,Ответ");
        gridObjectMatrix.setInitWidths("250,250,100,100");
        gridObjectMatrix.init();



        function btnClick1() {
            new Ajax.Request('http://localhost:8090/MyWebProject/dataFile', {
                method: 'get',
                onSuccess: function (transport) {
                    var response = transport.responseText || "no response text";
                //    var y = response.evalJSON(true);
                //    gridObjectMatrix.parse(y,"json");
                },
                onFailure: function () {
                    alert('Something went wrong...')
                }
            });
        }
        document.observe('dom:loaded',
            function () {
                Event.observe('btn_matrix', 'click', btnClick1);
            }
        );
        function btnClick2() {
            new Ajax.Request('http://localhost:8090/MyWebProject/dataDataBase', {
                method: 'get',
                onSuccess: function (transport) {
                    var response = transport.responseText || "no response text";
                    var y = response.evalJSON(true);
                   gridObjectMatrix.parse(y,"json");
                },
                onFailure: function () {
                    alert('Something went wrong...')
                }
            });
        }
        document.observe('dom:loaded',
            function () {
                Event.observe('btn_bd', 'click', btnClick2);
            }
        );
    </script>

</body>
</html>
