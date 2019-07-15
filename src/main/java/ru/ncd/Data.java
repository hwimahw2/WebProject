package ru.ncd;
import net.sf.json.*;

import java.io.PrintWriter;

public class Data {
    String data;

    public String getData() {
      /*  JSONObject jo = new JSONObject();
        JSONArray row1 = new JSONArray();
        row1.element("A Time to Kill");
        row1.element("John Grisham");
        row1.element("100");
        row1.element("232");
        jo.element("row1", row1);
        data = jo.toString();
        return data;*/
        JSONObject json = new JSONObject();

        JSONArray rows = new JSONArray();
        JSONArray data1 = new JSONArray();
        JSONObject jo1 = new JSONObject();
        int id1 = 1;
        data1.element("A Time to Kill");
        data1.element("John Grisham");
        data1.element("100");
        data1.element("232");
        jo1.element("id", id1);
        jo1.element("data", data1);
        rows.element(jo1);
        json.element("rows", rows);
        String str = json.toString();
        return json.toString();
       // pw.print(json.toString());
    }
}
