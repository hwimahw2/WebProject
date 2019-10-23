package ru.ncd;

import net.sf.json.JSONObject;

public interface DaoInterface {
    public void add();
    public JSONObject get() throws Exception;
}
