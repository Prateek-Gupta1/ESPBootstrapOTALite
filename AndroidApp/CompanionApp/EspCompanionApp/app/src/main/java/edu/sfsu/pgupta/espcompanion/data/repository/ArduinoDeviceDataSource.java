package edu.sfsu.pgupta.espcompanion.data.repository;

import java.util.List;

import edu.sfsu.pgupta.espcompanion.data.models.ArduinoDevice;
import io.reactivex.Flowable;

public interface ArduinoDeviceDataSource {

    Flowable<List<ArduinoDevice>> getConfiguredDevices();

    void insertConfiguredDevice(ArduinoDevice device);

}
