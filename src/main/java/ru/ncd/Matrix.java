package ru.ncd;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.Scanner;

public class Matrix{
    public int n;
    public int m;
    public char[][] arrayMatrix;

    public Matrix() throws FileNotFoundException {
        fillMatrix();
    }

    public String toString(){
        StringBuffer sb = new StringBuffer();
        for(int i = 0; i < n; i++){
            for(int j = 0; j < m; j++){
                sb.append(arrayMatrix[i][j]);
                if(j == (m - 1)){
                    sb.append('\n');
                }
            }
        }
        return sb.toString();
    }

    public void fillMatrix() throws FileNotFoundException{
        try {
            Scanner sc = new Scanner(new FileReader("/home/mansur/IdeaProjects/MyWebProject/src/main/resources/input.txt"));
            this.n = sc.nextInt();
            this.m = sc.nextInt();
            sc.nextLine();
            this.arrayMatrix = new char[n][m];
            for (int i = 0; i < n; i++) {
                String str = sc.nextLine();
                // System.out.println(str);
                char[] arr = str.toCharArray();
                System.arraycopy(arr, 0, arrayMatrix[i], 0, arr.length);
            }
        }catch(FileNotFoundException e){
            System.out.println("FileNotFoundException");
            throw new FileNotFoundException();
        }


    }

}