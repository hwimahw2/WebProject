package ru.ncd;
import net.sf.json.*;
import java.io.FileNotFoundException;

public class Data {
    Matrix matrix;
    String dataMatrix;
    Graph graph;
    String dataGraph;

    public String getData() throws FileNotFoundException {
        StringBuffer sb = new StringBuffer();
        matrix = new Matrix();
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
        dataMatrix = json.toString();
        sb.append(dataMatrix);
       /* json = new JSONObject();
        rows = new JSONArray();
        data = new JSONArray();
        jo = new JSONObject();
        id = 2;
        data.element(graph.n);
        data.element(graph.toString());
        jo.element("id", id);
        jo.element("data2", data);
        rows.element(jo);
        json.element("rows", rows);
        dataGraph = json.toString();
        sb.append(dataGraph);*/

        return sb.toString();
    }
}
