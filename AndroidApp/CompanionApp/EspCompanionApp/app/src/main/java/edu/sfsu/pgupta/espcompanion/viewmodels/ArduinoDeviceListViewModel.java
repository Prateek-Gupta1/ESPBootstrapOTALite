package edu.sfsu.pgupta.espcompanion.viewmodels;

import android.arch.lifecycle.ViewModel;
import android.content.Context;

import java.util.List;

import edu.sfsu.pgupta.espcompanion.data.models.ArduinoDevice;
import edu.sfsu.pgupta.espcompanion.data.repository.ArduinoDeviceDataSource;
import io.reactivex.Completable;
import io.reactivex.Flowable;

public class ArduinoDeviceListViewModel extends ViewModel {

    private ArduinoDeviceDataSource mDataSource;

    ArduinoDeviceListViewModel(ArduinoDeviceDataSource mDataSource){
        this.mDataSource = mDataSource;
    }

    public Flowable<List<ArduinoDevice>> getAllConfiguredDevices(){
        return mDataSource.getConfiguredDevices();
    }

    public Completable insertOrUpdateDevice(ArduinoDevice device){

        return Completable.fromAction(()-> {
            mDataSource.insertConfiguredDevice(device);
        });
    }
}
