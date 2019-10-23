package ru.ncd;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import java.sql.*;

public class DataDaoDb implements DaoInterface {

    Data data;

    DataDaoDb(Data data){
        this.data = data;
    }

    public void add(){
        int id = 33;
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
            String sql = "INSERT INTO datadata VALUES ("+ id + "," + data.n + "," + data.m + "," + "\'" + data.matrix + "\'" + ")";
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
            }
            try {
                if (conn != null) conn.close();
            } catch (SQLException se) {
                se.printStackTrace();
            }
        }
    }

    public JSONObject get(){
        final String JDBC_DRIVER = "org.h2.Driver";
        final String DB_URL = "jdbc:h2:~/test";
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
                data.setN(rs.getInt("n"));
                data.setM(rs.getInt("m"));
                data.setMatrix(rs.getString("matrix"));
                Matrix matrix = new Matrix(data.getMatrix(), data.getN(), data.getM());
                Graph graph = new Graph(matrix);
                data.toJsonDB(graph, matrix, jsonMain, rows, i);
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
        return jsonMain;
    }
}
