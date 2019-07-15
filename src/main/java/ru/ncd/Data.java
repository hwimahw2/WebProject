package ru.ncd;
import net.sf.json.*;
import java.io.FileNotFoundException;

public class Data {
    String data;

    public String getData() throws FileNotFoundException {
        Matrix matrix = new Matrix();
        JSONObject json = new JSONObject();
        JSONArray rows = new JSONArray();
        JSONArray data1 = new JSONArray();
        JSONObject jo1 = new JSONObject();
        int id1 = 1;
        data1.element(matrix.n);
        data1.element(matrix.m);
        data1.element(matrix.toString());
        jo1.element("id", id1);
        jo1.element("data", data1);
        rows.element(jo1);
        json.element("rows", rows);
        data = json.toString();
        return data;
    }
}
