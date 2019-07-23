package ru.ncd;
import net.sf.json.*;
import java.io.FileNotFoundException;
import java.sql.*;

public class Data {
    String matrix;
    int n;
    int m;
    int result;

    public String getDataFromFile() throws FileNotFoundException {
        Matrix matrix = new Matrix();
        Graph graph = new Graph(matrix);
        this.matrix = matrix.toString();
        this.n = matrix.n;
        this.m = matrix.m;
        this.matrix = matrix.toString();
        result = countResult(matrix, graph);
        // return this.toJasonFile(matrix, graph).toString();
        return this.toJasonFile().toString();
    }

    public int countResult(Matrix matrix, Graph graph) {
        int quantityOfDots = 0;
        for (int i = 0; i < matrix.n; i++) {
            for (int j = 0; j < matrix.m; j++) {
                if (matrix.arrayMatrix[i][j] == '.') {
                    quantityOfDots++;
                }
            }
        }
        return graph.quantityOfIslands(graph) - quantityOfDots;
    }

    public void addToDataBase() throws FileNotFoundException {
        Matrix matrix = new Matrix();
        Graph graph = new Graph(matrix);
        this.matrix = matrix.toString();
        graph = new Graph(matrix);
        n = matrix.n;
        m = matrix.m;
        result = countResult(matrix, graph);
        final String JDBC_DRIVER = "org.h2.Driver";
        final String DB_URL = "jdbc:h2:~/test";
        final String USER = "sa";
        final String PASS = "";

        Connection conn = null;
        Statement stmt = null;
        try {
            Class.forName(JDBC_DRIVER);
            System.out.println("Connecting to a selected database...");
            conn = DriverManager.getConnection(DB_URL, USER, PASS);
            System.out.println("Connected database successfully...");
            stmt = conn.createStatement();
            String sql = "INSERT INTO ddbb VALUES (" + n + "," + m + "," + "\'" + this.matrix + "\'" + "," + result + ")";
            stmt.executeUpdate(sql);
            stmt.close();
            conn.close();
        } catch (SQLException se) {
            se.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (stmt != null) stmt.close();
            } catch (SQLException se2) {
            } // nothing we can do
            try {
                if (conn != null) conn.close();
            } catch (SQLException se) {
                se.printStackTrace();
            }
        }
    }

    public JSONObject getFromDataBase() {
        final String JDBC_DRIVER = "org.h2.Driver";
        final String DB_URL = "jdbc:h2:~/test";

        //  Database credentials
        final String USER = "sa";
        final String PASS = "";

        Connection conn = null;
        Statement stmt = null;
        JSONObject jsonMain = new JSONObject();
        JSONArray rows = new JSONArray();
        try {

            Class.forName(JDBC_DRIVER);
            conn = DriverManager.getConnection(DB_URL, USER, PASS);
            stmt = conn.createStatement();
            String sql;

            sql = "SELECT n, m, matrix FROM datadata";
            ResultSet rs = stmt.executeQuery(sql);
            int i = 1;
            while (rs.next()) {
                n = rs.getInt("n");
                m = rs.getInt("m");
                matrix = rs.getString("matrix");
                Matrix matrix = new Matrix(this.matrix, n, m);
                String str = matrix.toString();
                Graph graph = new Graph(matrix);
                toJasonDB(matrix, graph, jsonMain, rows, i);
                i++;
            }

            stmt.close();
        } catch (SQLException se) {
            se.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (stmt != null) stmt.close();
            } catch (SQLException se2) {
            }
            try {
                if (conn != null) conn.close();
            } catch (SQLException se) {
                se.printStackTrace();
            }
        }
        //jsonMain.element("rows", rows);
        return jsonMain;
    }


    public JSONObject toJasonDB(Matrix matrix, Graph graph, JSONObject jsonMain, JSONArray rows, int i) {
        JSONObject json = new JSONObject();
        int id = i;
        JSONArray data = new JSONArray();
        data.element(n);
        data.element(m);
        data.element(matrix.toString());
        data.element(countResult(matrix, graph));
        json.element("id", id);
        json.element("data", data);
        rows.element(json);
        jsonMain.element("rows", rows);
        return jsonMain;
    }

  /*  public JSONObject toJasonFile(Matrix matrix, Graph graph) {
        JSONObject jsonMain = new JSONObject();
        JSONObject json = new JSONObject();
        JSONArray rows = new JSONArray();
        JSONArray data = new JSONArray();
        JSONObject jo = new JSONObject();
        int id = 1;
        data.element(n);
        data.element(m);
        data.element(matrix.toString());
        data.element(countResult(matrix, graph));
        jo.element("id", id);
        jo.element("data", data);
        rows.element(jo);
        json.element("rows", rows);
        jsonMain.element("object1", json);
        return jsonMain;
    }*/

    public JSONObject toJasonFile() {
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
        String str = jsonMain.toString();
        int a = 5;
        String jjj = jsonMain.toString();
        String mtr = jsonMain.toString();
        String gtr = jsonMain.toString();
        return jsonMain;
    }
}
//CREATE TABLE D (date varchar(10000), n number, m number, matrix varchar(10000), result number);