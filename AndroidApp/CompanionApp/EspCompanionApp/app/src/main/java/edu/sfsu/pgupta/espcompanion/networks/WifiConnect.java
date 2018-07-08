package edu.sfsu.pgupta.espcompanion.networks;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiManager;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;

public class WifiConnect {

    private static final String TAG = WifiConnect.class.getSimpleName();
    private Context mContext;
    private WifiManager mWifiManager;

    public WifiConnect(Context mContext){
        this.mContext = mContext;
        if(this.mContext != null){
            mWifiManager = (WifiManager) this.mContext.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        }
    }

    public int connectToNetwork(String ssid, String password){

        int netId = -1;

        WifiConfiguration config = new WifiConfiguration();
        config.SSID = "\"" + ssid + "\"";
        config.priority = 1;
        config.preSharedKey = "\"" + password + "\"";
        config.status = WifiConfiguration.Status.ENABLED;
        config.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.WPA_PSK);
        config.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.TKIP);
        config.allowedAuthAlgorithms.set(WifiConfiguration.AuthAlgorithm.OPEN);

        config.allowedProtocols.set(WifiConfiguration.Protocol.WPA);
        config.allowedProtocols.set(WifiConfiguration.Protocol.RSN);

        Log.e(TAG, "SSID:" + config.SSID);
        Log.e(TAG, "Password: " + config.preSharedKey);

        if (mWifiManager != null) {
            mWifiManager.disconnect();
            // mWifiManager.saveConfiguration();
            netId = mWifiManager.addNetwork(config);
            Log.e(TAG, "Net ID : " + netId);
            mWifiManager.enableNetwork(netId, true);
            mWifiManager.reconnect();
        }

        return netId;
    }

}
