package ru.ncd;

import net.sf.json.JSONObject;

import java.io.FileNotFoundException;

public class DataDaoFile implements DaoInterface {

    Data data;

    public DataDaoFile(Data data) {
        this.data = data;
    }

    public void add(){

    }
    public JSONObject get() throws Exception {
        Matrix matrix = new Matrix();
        Graph graph = new Graph(matrix);
        data.matrix = matrix.toString();
        data.n = matrix.n;
        data.m = matrix.m;
        data.result = graph.countResult(matrix);
        return data.toJsonFile();
    }
}
