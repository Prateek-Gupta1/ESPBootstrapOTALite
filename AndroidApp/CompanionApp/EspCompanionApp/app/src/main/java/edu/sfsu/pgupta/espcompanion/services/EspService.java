package edu.sfsu.pgupta.espcompanion.services;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

/**
 * Created by Home on 11/12/17.
 */

public interface EspService {

    @GET("/apconfig")
    Call<ResponseBody> sendWifiCredentials(
            @Query("ssid") String ssid,
            @Query("password") String password,
            @Query("token") String token
    );
}
