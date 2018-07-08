package edu.sfsu.pgupta.espcompanion.viewmodels;

import android.arch.lifecycle.ViewModel;
import android.arch.lifecycle.ViewModelProvider;
import android.content.Context;
import android.support.annotation.NonNull;

import edu.sfsu.pgupta.espcompanion.data.repository.ArduinoDeviceDataSource;

public class ViewModelFactory implements ViewModelProvider.Factory {

    private final ArduinoDeviceDataSource mDataSource;
    private final Context mContext;

    public ViewModelFactory(ArduinoDeviceDataSource dataSource, Context mContext){
        mDataSource = dataSource;
        this.mContext = mContext;
    }

    @NonNull
    @Override
    public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
        if (modelClass.isAssignableFrom(ArduinoDeviceListViewModel.class)) {
            return (T) new ArduinoDeviceListViewModel(mDataSource);
        }
        throw new IllegalArgumentException("Unknown ViewModel class");
    }
}
