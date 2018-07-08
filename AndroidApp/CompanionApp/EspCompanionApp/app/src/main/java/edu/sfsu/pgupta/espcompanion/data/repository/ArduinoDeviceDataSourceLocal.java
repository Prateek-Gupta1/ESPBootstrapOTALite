package edu.sfsu.pgupta.espcompanion.data.repository;

import java.util.List;

import edu.sfsu.pgupta.espcompanion.data.dao.ArduinoDeviceDao;
import edu.sfsu.pgupta.espcompanion.data.models.ArduinoDevice;
import io.reactivex.Flowable;

public class ArduinoDeviceDataSourceLocal implements ArduinoDeviceDataSource {

    ArduinoDeviceDao mArduinoDeviceDao;

    public ArduinoDeviceDataSourceLocal(ArduinoDeviceDao dao){
        mArduinoDeviceDao = dao;
    }

    @Override
    public Flowable<List<ArduinoDevice>> getConfiguredDevices() {
        return mArduinoDeviceDao.getConfiguredDevices();
    }

    @Override
    public void insertConfiguredDevice(ArduinoDevice device) {
        mArduinoDeviceDao.insertNewConfiguredDevice(device);
    }
}
