package edu.sfsu.pgupta.espcompanion;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;

import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.vision.barcode.Barcode;

import java.util.ArrayList;
import java.util.List;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;

public class MainActivity extends AppCompatActivity implements View.OnClickListener{

    private static final String TAG = MainActivity.class.getSimpleName();

    private Button bScanQR;
    private TextView tvDisplayMessage;
    private ListView mAvailableWifiNetworksList;

    private ArrayAdapter mAWNListAdapter;
    private String CHECKSTRING = "ESP8266";
    private WifiManager mWifiManager;
    private boolean wasWifiON = false;
    private WifiReceiver mWifiReceiver;
    private WifiInfo mCurrentWifiInfo;

    private final String AP_CRED_CHECKSTRING_SEPARATOR = "_";
    private final String AP_CRED_SEPARATOR = ":";

    private String mAp_SSID;
    private String mAp_password;
    private int mAp_NetID;
    private boolean connectedToAP = false;

    public static final String BASE_URL = "http://192.168.4.1/";

    public static final int RC_QRCODE_CAPTURE = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        bScanQR = (Button) findViewById(R.id.bScan);
        tvDisplayMessage = (TextView) findViewById(R.id.tvMainMsg);
        bScanQR.setOnClickListener(MainActivity.this);
        mAvailableWifiNetworksList = (ListView) findViewById(R.id.lvWifiNets);
        mAWNListAdapter = new ArrayAdapter(this, android.R.layout.simple_list_item_1, new ArrayList<String>());
        mAvailableWifiNetworksList.setAdapter(mAWNListAdapter);
        mAvailableWifiNetworksList.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                createWifiCredentialDialog(mAWNListAdapter.getItem(position).toString());
            }
        });

        mWifiManager = (WifiManager) this.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        mWifiReceiver = new WifiReceiver();
    }

    @Override
    public void onClick(View v) {
        if(v.getId() == R.id.bScan){
            Intent scanQRcode = new Intent(MainActivity.this, QRcodeCaptureActivity.class);
            startActivityForResult(scanQRcode, RC_QRCODE_CAPTURE);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        //check if the QRcode activity returned success and the data field is not null
        if(requestCode == RC_QRCODE_CAPTURE && resultCode == CommonStatusCodes.SUCCESS && data != null){
            //get the QRcode value
            final Barcode qrCode = data.getParcelableExtra(QRcodeCaptureActivity.QRCODE_RESULT);

            //The QR code value will be of the form ESP8266_ssid:password_ESP8266
            String[] qrCodeString = qrCode.displayValue.toString().split(AP_CRED_CHECKSTRING_SEPARATOR);

            //Check if it contains ESP8266 in the beginning and end
            if(CHECKSTRING.equals(qrCodeString[0]) && CHECKSTRING.equals(qrCodeString[2])){

                //Take the middle part i.e. ssid:password and split it
                String[] apCredentials = qrCodeString[1].split(AP_CRED_SEPARATOR);

                //Check the length to confirm it contains ssid and password
                if(apCredentials.length == 2){
                    setMessage("QR code scan successful. Connecting to IoT device AP. Please make sure it is turned ON",10);
                    mAp_SSID = apCredentials[0];
                    mAp_password = apCredentials[1];

                    Log.e(TAG,"SSID: " + mAp_SSID);
                    Log.e(TAG,"Password: " + mAp_password);

                    //Save previous state of the Wifi
                    wasWifiON = mWifiManager.isWifiEnabled();
                    if(wasWifiON){
                        //If Wifi was on save the current info
                        mCurrentWifiInfo = mWifiManager.getConnectionInfo();
                        mWifiManager.disconnect();
                    }
                    setMessage("Scanning for available networks",2000);

                    //Wait till wifi is disabled
                    //while(mWifiManager.getWifiState() != WifiManager.WIFI_STATE_DISABLED);

                    //Enable Wifi if not
                    mWifiManager.setWifiEnabled(true);
                    //Start scan for the available networks in vicinity. This will work in background.
                    mWifiManager.startScan();

                    //Connect to the Access point credentials derived from QR code scan
                    //boolean connectedToAp = connectToAP();
                }else{
                    setMessage("Incorrect QR code. Please try again",200);
                }
            }else{
                setMessage("Incorrect QR code. Please try again",200);
            }
        }else{
            setMessage("Something went wrong. Please try again",200);
        }
    }

    private boolean connectToAP(){

        boolean condition = true;

        for(WifiConfiguration w: mWifiManager.getConfiguredNetworks()){
            if(mAp_SSID != null && w.SSID != null && mAp_SSID.equals(w.SSID)){
                condition = false;
            }
        }

        if(condition) {
            WifiConfiguration config = new WifiConfiguration();
            config.SSID = "\"" + mAp_SSID + "\"";
            config.priority = 1;
            config.preSharedKey = "\"" + mAp_password + "\"";
            //config.status = WifiConfiguration.Status.DISABLED;
            //config.status = WifiConfiguration.Status.CURRENT;
            config.status = WifiConfiguration.Status.ENABLED;
            //config.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.IEEE8021X);
            config.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.WPA_PSK);
            //config.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.NONE);
            //config.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.WPA_EAP);
            config.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.TKIP);
            //config.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.CCMP);
            //config.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.NONE);
            //config.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.CCMP);
            //config.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.TKIP);
            //config.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.WEP104);
            //config.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.WEP40);
            config.allowedAuthAlgorithms.set(WifiConfiguration.AuthAlgorithm.OPEN);
            //config.allowedAuthAlgorithms.set(WifiConfiguration.AuthAlgorithm.SHARED);
            //config.allowedAuthAlgorithms.set(WifiConfiguration.AuthAlgorithm.LEAP);

            config.allowedProtocols.set(WifiConfiguration.Protocol.WPA);
            config.allowedProtocols.set(WifiConfiguration.Protocol.RSN);

            Log.e(TAG, "SSID:" + config.SSID);
            Log.e(TAG, "Password: " + config.preSharedKey);

            if (mWifiManager != null) {
                mWifiManager.disconnect();
                // mWifiManager.saveConfiguration();
                mAp_NetID = mWifiManager.addNetwork(config);
                Log.e(TAG, "Net ID : " + mAp_NetID);
                mWifiManager.enableNetwork(mAp_NetID, true);
                mWifiManager.reconnect();
                return true;
            }
        }
        return false;
    }

    private class WifiReceiver extends BroadcastReceiver{

        @Override
        public void onReceive(Context context, Intent intent) {
            if(mWifiManager == null
                    || mWifiManager.getConnectionInfo() == null
                    || mAp_SSID == null
                    || !mAp_SSID.equals(mWifiManager.getConnectionInfo().getSSID())){
                connectedToAP = false;
            }
            ArrayList<String> wifiList = new ArrayList<>();
            List<ScanResult> wifiResults = mWifiManager.getScanResults();
            for(int i = 0; i<wifiResults.size(); i++){
                String ssid = wifiResults.get(i).SSID;
                if(mAp_SSID != null
                        && mAp_SSID.equals(ssid)
                        || ssid == null
                        || "".equalsIgnoreCase(ssid)) {
                    continue;
                }
                wifiList.add(wifiResults.get(i).SSID);
            }
            mAWNListAdapter.clear();
            mAWNListAdapter.addAll(wifiList);
            mAWNListAdapter.notifyDataSetChanged();
            setMessage("Please select the network to which you want your IoT device to connect",2000);
            if(!connectedToAP){
                connectedToAP = connectToAP();
            }
        }
    }


    @Override
    protected void onPause() {
        super.onPause();
        unregisterReceiver(mWifiReceiver);
        Log.e(TAG, "UnRegistered receiver");
    }

    @Override
    protected void onResume() {
        super.onResume();
        registerReceiver(mWifiReceiver, new IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION));
        Log.e(TAG, "Registered receiver");
    }

    @Override
    protected void onStop() {
        super.onStop();
        if(mWifiManager != null && mWifiManager.isWifiEnabled()){
            mWifiManager.removeNetwork(mAp_NetID);
            if(wasWifiON) {
                mWifiManager.setWifiEnabled(wasWifiON);
            }
        }
    }

    private void createWifiCredentialDialog(final String ssid){

        LayoutInflater li = LayoutInflater.from(this);
        View wifiCredPrompt = li.inflate(R.layout.wifi_credential_dialog, null);

        AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this);

        alertDialogBuilder.setView(wifiCredPrompt);

        final EditText userInput = (EditText) wifiCredPrompt.findViewById(R.id.etDialogWifiPassword);
        TextView tvSSID = (TextView) wifiCredPrompt.findViewById(R.id.tvDialogWifiSSID);

        tvSSID.setText("SSID : " + ssid);

        alertDialogBuilder.setTitle("Please provide password for the selected wifi network.")
                .setCancelable(false)
                .setPositiveButton("Send",
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog,int id) {
                                Retrofit retrofit = new Retrofit.Builder().baseUrl(BASE_URL).build();
                                EspService service = retrofit.create(EspService.class);
                                String password = userInput.getText().toString();
                                password = password.trim();
                                Log.e(TAG,"Password = " + password);
                                if(password != null && password.length() > 0) {
                                    Log.e(TAG,"SSID = " + ssid + " Password = " + password);
                                    final Call<ResponseBody> res = service.sendWifiCredentials(ssid, userInput.getText().toString());
                                    res.enqueue(new Callback<ResponseBody>() {
                                        @Override
                                        public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                                            if(response.code() == 200){
                                                setMessage("Wifi credentials stored on the device",200);
                                                if(mWifiReceiver != null)
                                                    unregisterReceiver(mWifiReceiver);
                                            }else{
                                                Log.e(TAG,"response code != 200");
                                            }
                                        }

                                        @Override
                                        public void onFailure(Call<ResponseBody> call, Throwable t) {
                                                setMessage("Something went wrong. Please try again",200);
                                        }
                                    });
                                }
                            }
                        })
                .setNegativeButton("Cancel",
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog,int id) {
                                dialog.cancel();
                            }
                        });
        AlertDialog alertDialog = alertDialogBuilder.create();
        alertDialog.show();
    }

    private void setMessage(final String message, final int delay){
        tvDisplayMessage.postDelayed(new Runnable() {
            @Override
            public void run() {
                tvDisplayMessage.setText(message);
            }
        },delay);
    }
}