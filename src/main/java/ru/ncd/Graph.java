package ru.ncd;

import java.util.ArrayList;

public class Graph {

    public int n;
    public char[][] arrayGraph;
    public int[] numberOfConnectedComponent;

    public Graph(Matrix matrix) {
        this.n = matrix.n * matrix.m;
        arrayGraph = new char[n][n];
        numberOfConnectedComponent = new int[n];
        fillGraph(matrix, matrix.n, matrix.m);
    }

    public void fillGraphMiddlePartOfMatrix(Matrix matrix, int i, int j, int n, int m){
        if (matrix.arrayMatrix[i][j] == '#') {
            arrayGraph[i * m + j][i * m + j] = '1';
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i][j - 1]) {
                arrayGraph[i * m + j][i * m + (j - 1)] = '1';
                arrayGraph[i * m + (j - 1)][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i][j + 1]) {
                arrayGraph[i * m + j][i * m + (j + 1)] = '1';
                arrayGraph[i * m + (j + 1)][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i + 1][j]) {
                arrayGraph[i * m + j][(i + 1) * m + j] = '1';
                arrayGraph[(i + 1) * m + j][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i - 1][j]) {
                arrayGraph[i * m + j][(i - 1) * m + j] = '1';
                arrayGraph[(i - 1) * m + j][i * m + j] = '1';
            }
        }



    }

    public void fillGraphFirstRowOfMatrixWithoutFirstAndLast(Matrix matrix, int i, int j, int n, int m){
        if (matrix.arrayMatrix[i][j] == '#') {
            arrayGraph[i * m + j][i * m + j] = '1';
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i][j - 1]) {
                arrayGraph[i * m + j][i * m + (j - 1)] = '1';
                arrayGraph[i * m + (j - 1)][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i][j + 1]) {
                arrayGraph[i * m + j][i * m + (j + 1)] = '1';
                arrayGraph[i * m + (j + 1)][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i + 1][j]) {
                arrayGraph[i * m + j][(i + 1) * m + j] = '1';
                arrayGraph[(i + 1) * m + j][i * m + j] = '1';
            }
        }
    }

    public void fillGraphLastRowOfMatrixWithoutFirstAndLast(Matrix matrix, int i, int j, int n, int m) {
        if (matrix.arrayMatrix[i][j] == '#') {
            arrayGraph[i * m + j][i * m + j] = '1';
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i][j - 1]) {
                arrayGraph[i * m + j][i * m + (j - 1)] = '1';
                arrayGraph[i * m + (j - 1)][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i][j + 1]) {
                arrayGraph[i * m + j][i * m + (j + 1)] = '1';
                arrayGraph[i * m + (j + 1)][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i - 1][j]) {
                arrayGraph[i * m + j][(i - 1) * m + j] = '1';
                arrayGraph[(i - 1) * m + j][i * m + j] = '1';
            }
        }
    }

    public void fillGraphFirstColumnOfMatrixWithoutFirstAndLast(Matrix matrix, int i, int j, int n, int m) {
        if (matrix.arrayMatrix[i][j] == '#') {
            arrayGraph[i * m + j][i * m + j] = '1';
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i][j + 1]) {
                arrayGraph[i * m + j][i * m + (j + 1)] = '1';
                arrayGraph[i * m + (j + 1)][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i + 1][j]) {
                arrayGraph[i * m + j][(i + 1) * m + j] = '1';
                arrayGraph[(i + 1) * m + j][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i - 1][j]) {
                arrayGraph[i * m + j][(i - 1) * m + j] = '1';
                arrayGraph[(i - 1) * m + j][i * m + j] = '1';
            }
        }
    }


    public void fillGraphLeftUpAngleOfMatrix(Matrix matrix, int i, int j, int n, int m) {
        if (matrix.arrayMatrix[i][j] == '#') {
            arrayGraph[i * m + j][i * m + j] = '1';
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i][j + 1]) {
                arrayGraph[i * m + j][i * m + (j + 1)] = '1';
                arrayGraph[i * m + (j + 1)][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i + 1][j]) {
                arrayGraph[i * m + j][(i + 1) * m + j] = '1';
                arrayGraph[(i + 1) * m + j][i * m + j] = '1';
            }
        }
    }
    public void fillGraphRightUpAngleOfMatrix(Matrix matrix, int i, int j, int n, int m) {
        if (matrix.arrayMatrix[i][j] == '#') {
            arrayGraph[i * m + j][i * m + j] = '1';
            if(matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i][j - 1]) {
                arrayGraph[i * m + j][i * m + (j - 1)] = '1';
                arrayGraph[i * m + (j - 1)][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i + 1][j]) {
                arrayGraph[i * m + j][(i + 1) * m + j] = '1';
                arrayGraph[(i + 1) * m + j][i * m + j] = '1';
            }
        }
    }

    public void fillGraphLeftDownAngleOfMatrix(Matrix matrix, int i, int j, int n, int m) {
        if (matrix.arrayMatrix[i][j] == '#') {
            arrayGraph[i * m + j][i * m + j] = '1';
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i][j + 1]) {
                arrayGraph[i * m + j][i * m + (j + 1)] = '1';
                arrayGraph[i * m + (j + 1)][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i - 1][j]) {
                arrayGraph[i * m + j][(i - 1) * m + j] = '1';
                arrayGraph[(i - 1) * m + j][i * m + j] = '1';
            }
        }
    }

    public void fillGraphRightDownAngleOfMatrix(Matrix matrix, int i, int j, int n, int m) {
        if (matrix.arrayMatrix[i][j] == '#') {
            arrayGraph[i * m + j][i * m + j] = '1';
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i][j - 1]) {
                arrayGraph[i * m + j][i * m + (j - 1)] = '1';
                arrayGraph[i * m + (j - 1)][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i - 1][j]) {
                arrayGraph[i * m + j][(i - 1) * m + j] = '1';
                arrayGraph[(i - 1) * m + j][i * m + j] = '1';
            }
        }
    }


        public void fillGraphLastColumnOfMatrixWithoutFirstAndLast(Matrix matrix, int i, int j, int n, int m) {
        if (matrix.arrayMatrix[i][j] == '#') {
            arrayGraph[i * m + j][i * m + j] = '1';
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i][j - 1]) {
                arrayGraph[i * m + j][i * m + (j - 1)] = '1';
                arrayGraph[i * m + (j - 1)][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i + 1][j]) {
                arrayGraph[i * m + j][(i + 1) * m + j] = '1';
                arrayGraph[(i + 1) * m + j][i * m + j] = '1';
            }
            if (matrix.arrayMatrix[i][j] == matrix.arrayMatrix[i - 1][j]) {
                arrayGraph[i * m + j][(i - 1) * m + j] = '1';
                arrayGraph[(i - 1) * m + j][i * m + j] = '1';
            }
        }

    }

    public void fillGraph(Matrix matrix, int n, int m) {
        for (int i = 0; i < this.n; i++) {
            for (int j = 0; j < this.n; j++) {
                arrayGraph[i][j] = '0';
            }
        }

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if ((i >= 1 && i <= n - 2) && (j >= 1 && j <= m - 2)) {
                    fillGraphMiddlePartOfMatrix(matrix, i, j, n, m);
                }
                else if(i == 0 && (j >= 1 && j <= m - 2)) {
                    fillGraphFirstRowOfMatrixWithoutFirstAndLast(matrix, i, j, n, m);
                }
                else if((i == (n - 1)) && (j >= 1 && j <= m - 2)){
                    fillGraphLastRowOfMatrixWithoutFirstAndLast(matrix, i, j, n, m);
                }
                else if((j == 0) && (i >= 1 && i <= n - 2)){
                    fillGraphFirstColumnOfMatrixWithoutFirstAndLast(matrix, i, j, n, m);
                }
                else if((j == (m - 1)) && (i >= 1 && i <= n - 2)){
                    fillGraphLastColumnOfMatrixWithoutFirstAndLast(matrix, i, j, n, m);
                }
                else if(i == 0 && j == 0){
                   fillGraphLeftUpAngleOfMatrix(matrix, i, j, n, m);
                }
                else if(i == 0 && j == m - 1){
                    fillGraphRightUpAngleOfMatrix(matrix, i, j, n, m);
                }
                else if((i == (n - 1)) && j == 0){
                    fillGraphLeftDownAngleOfMatrix(matrix, i, j, n, m);
                }
                else if((i == (n - 1)) && (j == (m - 1))){
                    fillGraphRightDownAngleOfMatrix(matrix, i, j, n, m);
                }
            }
        }
    }

    public int quantityOfIslands(Graph graph){
        ArrayList<Island> islands = new ArrayList<>();
        int quantityOfConnectedComponent = 0;
        for(int i = 0; i < graph.n; i++){
            Island island;
            if(numberOfConnectedComponent[i] == 0){
                island = new Island();
                quantityOfConnectedComponent++;
                dfs(i, quantityOfConnectedComponent, island);
                islands.add(island);
            }
        }
        return islands.size();
    }


    public void dfs(int i, int quantity, Island island){
        island.add(i);
        numberOfConnectedComponent[i] = quantity;
        for(int j = 0; j < arrayGraph.length; j++){
            if(arrayGraph[i][j] == '1' && numberOfConnectedComponent[j] == 0){
                dfs(j, quantity, island);
            }
        }
    }
}
