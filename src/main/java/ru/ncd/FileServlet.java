package ru.ncd;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
public class FileServlet extends HttpServlet {
    protected void doPost(javax.servlet.http.HttpServletRequest request, javax.servlet.http.HttpServletResponse response) throws javax.servlet.ServletException, IOException {

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            PrintWriter pw = response.getWriter();
            Matrix matrix = new Matrix();
            Graph graph = new Graph(matrix);
            int result = graph.countResult(matrix);
            Data data = new Data(matrix.toString(), matrix.n, matrix.m, result);
            DataDaoFile dataDaoFile = new DataDaoFile(data);
            pw.print(dataDaoFile.get());
        }catch(Exception e){

        }
    }
}
