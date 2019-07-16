package ru.ncd;
import net.sf.json.*;
import java.io.FileNotFoundException;

public class Data {
    Matrix matrix;
    Graph graph;

    public String getData() throws FileNotFoundException {
        StringBuffer sb = new StringBuffer();
        matrix = new Matrix();
        JSONObject jsonMain = new JSONObject();
     //   JSONObject jsonEx1 = new JSONObject();
      //  JSONObject jsonEx2 = new JSONObject();

        JSONObject json = new JSONObject();
        JSONArray rows = new JSONArray();
        JSONArray data = new JSONArray();
        JSONObject jo = new JSONObject();
        int id = 1;
        data.element(matrix.n);
        data.element(matrix.m);
        data.element(matrix.toString());
        jo.element("id", id);
        jo.element("data", data);
        rows.element(jo);
        json.element("rows", rows);
        jsonMain.element("object1", json);
       // sb.append(jsonMain.toString());
        //jsonMain.element(jsonEx1);

        graph = new Graph(matrix);
        json = new JSONObject();
        rows = new JSONArray();
        data = new JSONArray();
        jo = new JSONObject();
        id = 1;
        data.element(graph.n);
        data.element(graph.toString());
        jo.element("id", id);
        jo.element("data", data);
        rows.element(jo);
        json.element("rows", rows);
        //jsonEx2.element("object2", json);
        jsonMain.element("object2", json);
      //  dataGraph = json.toString();

        json = new JSONObject();
        rows = new JSONArray();
        data = new JSONArray();
        jo = new JSONObject();
        id = 1;
        data.element(result());
        jo.element("id", id);
        jo.element("data", data);
        rows.element(jo);
        json.element("rows", rows);
        //jsonEx2.element("object2", json);
        jsonMain.element("object3", json);
        //  dataGraph = json.toString();




        sb.append(jsonMain.toString());
        return sb.toString();
    }

    public int result(){
        int quantityOfDots = 0;
        for(int i = 0; i < matrix.n; i++){
            for(int j = 0; j < matrix.m; j++){
                if(matrix.arrayMatrix[i][j] == '.'){
                    quantityOfDots++;
                }
            }
        }
        int result = graph.quantityOfIslands(graph) - quantityOfDots;
        return result;
    }
}
