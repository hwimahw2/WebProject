package ru.ncd;
import net.sf.json.*;
import java.io.FileNotFoundException;
import java.sql.*;

public class Data {
    String matrix;
    int n;
    int m;
    int result;

    public Data(String matrix, int n, int m, int result) {
        this.matrix = matrix;
        this.n = n;
        this.m = m;
        this.result = result;
    }

    public String getMatrix() {
        return matrix;
    }

    public void setMatrix(String matrix) {
        this.matrix = matrix;
    }

    public int getN() {
        return n;
    }

    public void setN(int n) {
        this.n = n;
    }

    public int getM() {
        return m;
    }

    public void setM(int m) {
        this.m = m;
    }

    public int getResult() {
        return result;
    }

    public void setResult(int result) {
        this.result = result;
    }

    public JSONObject toJsonDB(Graph graph, Matrix matrix, JSONObject jsonMain, JSONArray rows, int i) {
        JSONObject json = new JSONObject();
        int id = i;
        JSONArray data = new JSONArray();
        data.element(n);
        data.element(m);
        data.element(matrix.toString());
        data.element(graph.countResult(matrix));
        json.element("id", id);
        json.element("data", data);
        rows.element(json);
        jsonMain.element("rows", rows);
        return jsonMain;
    }

    public JSONObject toJsonFile() {
        JSONObject jsonMain = new JSONObject();
        JSONArray rows = new JSONArray();
        JSONObject json = new JSONObject();
        int id = 1;
        JSONArray data = new JSONArray();
        data.element(n);
        data.element(m);
        data.element(this.matrix);
        data.element(this.result);
        json.element("id", id);
        json.element("data", data);
        rows.element(json);
        jsonMain.element("rows", rows);
        return jsonMain;
    }
}
//CREATE TABLE D (date varchar(10000), n number, m number, matrix varchar(10000), result number);