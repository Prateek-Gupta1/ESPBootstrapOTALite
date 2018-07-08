package edu.sfsu.pgupta.espcompanion.activities;

import android.arch.lifecycle.ViewModelProviders;
import android.content.Intent;
import android.databinding.DataBindingUtil;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.support.annotation.Nullable;
import android.support.design.widget.FloatingActionButton;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.Menu;
import android.view.View;
import android.widget.TextView;

import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.vision.barcode.Barcode;

import java.util.ArrayList;

import edu.sfsu.pgupta.espcompanion.activities.databinding.ActivityMainBinding;
import edu.sfsu.pgupta.espcompanion.adapters.ArduinoDeviceListAdapter;
import edu.sfsu.pgupta.espcompanion.data.Injection;
import edu.sfsu.pgupta.espcompanion.data.models.ArduinoDevice;
import edu.sfsu.pgupta.espcompanion.utils.Commons;
import edu.sfsu.pgupta.espcompanion.viewmodels.ArduinoDeviceListViewModel;
import edu.sfsu.pgupta.espcompanion.viewmodels.ViewModelFactory;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = MainActivity.class.getSimpleName();

    private TextView tvDefaultMsg;
    private RecyclerView recyclerView;
    private FloatingActionButton fab;

    private ArduinoDeviceListViewModel mADListViewModel;
    private ViewModelFactory mViewModelFactory;
    private ArduinoDeviceListAdapter mADListAdapter;
    ActivityMainBinding mBinding;

    private final CompositeDisposable mDisposable = new CompositeDisposable();

    public static final int REQUEST_CODE_CAPTURE_QRCODE = 1;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.e(TAG, "reached");
        mADListAdapter = new ArduinoDeviceListAdapter(new ArrayList<ArduinoDevice>(), this);
        mBinding = DataBindingUtil.setContentView(this, R.layout.activity_main);
        RecyclerView.LayoutManager layoutManager = new LinearLayoutManager(this);
        mBinding.recyclerView.setLayoutManager(layoutManager);
        mBinding.recyclerView.setAdapter(mADListAdapter);

        mBinding.tvDefaultMsg.setVisibility(View.VISIBLE);
        mBinding.recyclerView.setVisibility(View.VISIBLE);

        mBinding.floatingActionButton.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, QRcodeCaptureActivity.class);
            startActivityForResult(intent, REQUEST_CODE_CAPTURE_QRCODE);
        });

        mViewModelFactory = Injection.provideViewModelFactory(this);
        mADListViewModel = ViewModelProviders.of(this, mViewModelFactory)
                .get(ArduinoDeviceListViewModel.class);

        mDisposable.add(mADListViewModel.getAllConfiguredDevices()
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(
                arduinoDevices -> {
                    if(arduinoDevices.size() > 0){
                        mADListAdapter.getDeviceList().addAll(arduinoDevices);
                        mADListAdapter.notifyDataSetChanged();
                        mBinding.recyclerView.setVisibility(View.VISIBLE);
                        mBinding.tvDefaultMsg.setVisibility(View.INVISIBLE);
                    }
                },
                throwable -> {
                    Log.e(TAG, "Unable to get configured devices", throwable);
                }));
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if(requestCode == Commons.RESULT_CODE_QR_CODE_CAPTURE && resultCode == CommonStatusCodes.SUCCESS && data != null) {
            //get the QRcode value
            final Barcode qrCode = data.getParcelableExtra(QRcodeCaptureActivity.QRCODE_RESULT);

            //The QR code value will be of the form ESP8266_ssid:password_ESP8266
            String[] qrCodeString = qrCode.displayValue.split(Commons.AP_CREDENTIALS_CHECKSTRING_SEPARATOR);

            //Check if it contains esp8266 in the beginning and end
            if (Commons.CHECKSTRING.equals(qrCodeString[0]) && Commons.CHECKSTRING.equals(qrCodeString[2])) {

                //Take the middle part i.e. ssid:password and split it
                String[] apCredentials = qrCodeString[1].split(Commons.AP_CREDENTIALS_SEPARATOR);

                //Check the length to confirm it contains ssid and password
                if (apCredentials.length == 3) {
                    ArduinoDevice device = new ArduinoDevice();
                    device.setConfigured(true);
                    device.setRegisteredOn(System.currentTimeMillis());
                    device.setSsid(apCredentials[0]);
                    device.setPassword(apCredentials[1]);
                    device.setMacAddress(apCredentials[2]);

                    mDisposable.add(mADListViewModel.insertOrUpdateDevice(device)
                        .subscribeOn(Schedulers.io())
                        .observeOn(AndroidSchedulers.mainThread())
                        .subscribe(
                            () -> {
                                mADListAdapter.getDeviceList().add(device);
                                //Don't know why we have to call this, but it seems to solves
                                // the problem of duplicate entries.
                                mADListAdapter.getDeviceList().clear();
                                mADListAdapter.notifyDataSetChanged();
                                if(mBinding.recyclerView.getVisibility() == View.INVISIBLE){
                                    mBinding.recyclerView.setVisibility(View.VISIBLE);
                                    mBinding.tvDefaultMsg.setVisibility(View.INVISIBLE);
                                }
                            },
                            throwable -> {
                                Log.e(TAG, "Unable to save/update device", throwable);
                            }));
                }
            }
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    protected void onPause() {
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mDisposable.clear();
    }

    @Override
    protected void onResume() {
        super.onResume();
    }
}
