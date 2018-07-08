package edu.sfsu.pgupta.espcompanion.utils;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by Home on 6/28/18.
 */

public class Commons {

    public static final String BASE_URL = "http://192.168.4.1/";
    public static final String AP_CREDENTIALS_SEPARATOR = "#";
    public static final String AP_CREDENTIALS_CHECKSTRING_SEPARATOR = "_";
    public static final String CHECKSTRING = "esp8266";
    public static final int RESULT_CODE_QR_CODE_CAPTURE = 1;

    public static String formatTime(Long timeMillis){
        SimpleDateFormat formatter = new SimpleDateFormat("EEE d, MM yy");
        Date date = new Date(timeMillis);
        return formatter.format(date);
    }
}

