package ru.ncd;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

public class DataBaseServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        PrintWriter pw = response.getWriter();
        Matrix matrix = new Matrix();
        Graph graph = new Graph(matrix);
        int result = graph.countResult(matrix);
        Data data = new Data(matrix.toString(), matrix.n, matrix.m, result);
        DataDaoDb dataDaoDb = new DataDaoDb(data);
        dataDaoDb.add();
        pw.print(dataDaoDb.get());
    }
}
