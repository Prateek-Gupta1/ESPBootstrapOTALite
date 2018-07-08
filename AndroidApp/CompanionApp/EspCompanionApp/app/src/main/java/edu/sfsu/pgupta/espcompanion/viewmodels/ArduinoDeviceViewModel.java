package edu.sfsu.pgupta.espcompanion.viewmodels;

import android.arch.lifecycle.ViewModel;
import android.content.Context;
import android.content.Intent;
import android.databinding.BaseObservable;
import android.databinding.Bindable;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import java.util.List;

import edu.sfsu.pgupta.espcompanion.activities.AvailableNetworksActivity;
import edu.sfsu.pgupta.espcompanion.data.Injection;
import edu.sfsu.pgupta.espcompanion.data.models.ArduinoDevice;
import edu.sfsu.pgupta.espcompanion.data.repository.ArduinoDeviceDataSource;
import edu.sfsu.pgupta.espcompanion.networks.WifiConnect;
import edu.sfsu.pgupta.espcompanion.utils.Commons;
import io.reactivex.Completable;
import io.reactivex.Flowable;

public class ArduinoDeviceViewModel extends BaseObservable {

    private static final String TAG = ArduinoDeviceViewModel.class.getSimpleName();
    private ArduinoDevice mArduinoDevice;
    private Context mContext;

    public ArduinoDeviceViewModel(Context mContext, ArduinoDevice mArduinoDevice){
        this.mContext = mContext;
        this.mArduinoDevice = mArduinoDevice;
    }

    @Bindable
    public String getSsid(){
        return mArduinoDevice.getSsid();
    }

    @Bindable
    public String getMacAddress(){
        return mArduinoDevice.getMacAddress();
    }

    @Bindable
    public String getRegisteredOn() {
        return "Registered On : " + Commons.formatTime(mArduinoDevice.getRegisteredOn());
    }

    public View.OnClickListener connectToAccessPoint(){
        return v -> {
            Intent activity = new Intent(mContext, AvailableNetworksActivity.class);
            activity.putExtra(AvailableNetworksActivity.PARAM_SSID, mArduinoDevice.getSsid());
            activity.putExtra(AvailableNetworksActivity.PARAM_PASSWORD, mArduinoDevice.getPassword());
            mContext.startActivity(activity);

        };
    }
}
