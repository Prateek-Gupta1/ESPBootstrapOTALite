package edu.sfsu.pgupta.espcompanion.activities;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.res.Resources;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import edu.sfsu.pgupta.espcompanion.networks.WifiConnect;
import edu.sfsu.pgupta.espcompanion.services.EspService;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;

import static edu.sfsu.pgupta.espcompanion.utils.Commons.BASE_URL;

public class AvailableNetworksActivity extends AppCompatActivity {

    public static final String PARAM_SSID = "ana_ssid";
    public static final String PARAM_PASSWORD = "ana_password";

    private ListView mAvailableNetworksList;
    private ArrayAdapter mAdapter;
    private TextView tvDisplayMessage;

    private String mAccessPointSSID;
    private String mAccessPointPassword;
    private WifiManager mWifiManager;
    private WifiReceiver mWifiReceiver;
    private WifiConnect mWifiConnect;

    private WifiInfo mCurrentWifiInfo;
    private boolean wasWifiOn = false;

    private int mNetID;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_available_networks);
        mAvailableNetworksList = (ListView) findViewById(R.id.lvWifiNets);
        tvDisplayMessage = (TextView) findViewById(R.id.tvWifiNetsMessage);

        mAccessPointSSID = getIntent().getStringExtra(PARAM_SSID);
        mAccessPointPassword = getIntent().getStringExtra(PARAM_PASSWORD);

        mWifiConnect = new WifiConnect(this);
        mWifiManager = (WifiManager) this.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        mWifiReceiver = new WifiReceiver();

        mAdapter = new ArrayAdapter(this,  android.R.layout.simple_list_item_1, new ArrayList<String>());
        mAvailableNetworksList.setAdapter(mAdapter);
        mAvailableNetworksList.setOnItemClickListener((parent, view, position, id) -> {
            createDialog(mAdapter.getItem(position).toString());
        });

        saveCurrentWifiConfig();
        mWifiManager.setWifiEnabled(true);
        mWifiManager.startScan();
        mNetID = mWifiConnect.connectToNetwork(mAccessPointSSID, mAccessPointPassword);
        setMessage("Scanning for Networks", 100);

        if(mNetID == -1){
            Toast.makeText(this.getApplicationContext(),R.string.error_cannot_add_network, Toast.LENGTH_LONG);
            finish();
        }
    }

    private void createDialog(final String ssid) {
        LayoutInflater li = LayoutInflater.from(this);
        View wifiCredPrompt = li.inflate(R.layout.wifi_credential_dialog, null);

        AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this);

        alertDialogBuilder.setView(wifiCredPrompt);

        final EditText userInput = (EditText) wifiCredPrompt.findViewById(R.id.etDialogWifiPassword);
        final EditText usertoken = (EditText) wifiCredPrompt.findViewById(R.id.etUserToken);
        TextView tvSSID = (TextView) wifiCredPrompt.findViewById(R.id.tvDialogWifiSSID);

        tvSSID.setText("SSID : " + ssid);

        alertDialogBuilder.setTitle("Wifi Network and User Authentication details")
            .setPositiveButton("Send",
                (dialog, id) -> {
                    Retrofit retrofit = new Retrofit.Builder().baseUrl(BASE_URL).build();
                    EspService service = retrofit.create(EspService.class);
                    String password = userInput.getText().toString();
                    password = password.trim();
                    if(password != null && password.length() > 0) {
                        final Call<ResponseBody> res = service.sendWifiCredentials(ssid,
                                password,
                                usertoken.getText().toString());
                        res.enqueue(new Callback<ResponseBody>() {

                            @Override
                            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                                if(response.code() == 200){
                                    setMessage("Details sent successfully.", 200);
                                    unregisterReceiver(mWifiReceiver);
                                    mAdapter.clear();
                                    mAdapter.notifyDataSetChanged();
                                }else{
                                    setMessage("Could not send the configurations details, please try again.", 200);
                                }
                            }

                            @Override
                            public void onFailure(Call<ResponseBody> call, Throwable t) {
                                setMessage("Something went wrong. Please try again.",200);
                            }
                        });
                    }
                })
            .setNegativeButton("Cancel",
                    (dialog, id) -> dialog.cancel());
        AlertDialog alertDialog = alertDialogBuilder.create();
        alertDialog.show();
    }

    @Override
    protected void onPause() {
        super.onPause();
        unregisterReceiver(mWifiReceiver);
    }

    @Override
    protected void onResume() {
        super.onResume();
        registerReceiver(mWifiReceiver, new IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION));
    }

    @Override
    protected void onStop() {
        super.onStop();
        restoreWifiConfig();
    }

    private class WifiReceiver extends BroadcastReceiver {

        @Override
        public void onReceive(Context context, Intent intent) {

            Set<String> wifiList = new HashSet<>();
            List<ScanResult> wifiResults = mWifiManager.getScanResults();
            for(int i = 0; i<wifiResults.size(); i++){
                String ssid = wifiResults.get(i).SSID;
                if(ssid == null || ssid.equals(mAccessPointSSID) ||  "".equalsIgnoreCase(ssid)) {
                    continue;
                }
                wifiList.add(wifiResults.get(i).SSID);
            }

            if(wifiList.size() > 0) {
                setMessage(getString(R.string.available_network_message), 100);
                mAdapter.clear();
                mAdapter.addAll(new ArrayList<String>(wifiList));
                mAdapter.notifyDataSetChanged();
            }else{
                setMessage("Cannot find any network nearby", 100);
            }
        }
    }

    private void setMessage(final String message, final int delay){
        tvDisplayMessage.postDelayed(() -> tvDisplayMessage.setText(message),delay);
    }

    void saveCurrentWifiConfig(){
        wasWifiOn = mWifiManager.isWifiEnabled();
        if(wasWifiOn){
            //If Wifi was ON save the current info and disconnect
            mCurrentWifiInfo = mWifiManager.getConnectionInfo();
            mWifiManager.disconnect();
        }
    }

    void restoreWifiConfig(){
        if(mWifiManager != null && mWifiManager.isWifiEnabled()){
            mWifiManager.removeNetwork(mNetID);
            mWifiManager.setWifiEnabled(wasWifiOn);
        }
    }
}


