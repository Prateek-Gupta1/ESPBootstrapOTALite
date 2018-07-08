package edu.sfsu.pgupta.espcompanion.data.dao;

import android.arch.persistence.room.Dao;
import android.arch.persistence.room.Insert;
import android.arch.persistence.room.OnConflictStrategy;
import android.arch.persistence.room.Query;

import java.util.List;

import edu.sfsu.pgupta.espcompanion.data.models.ArduinoDevice;
import io.reactivex.Flowable;

@Dao
public interface ArduinoDeviceDao {

    @Query("SELECT * FROM ArduinoDevice ORDER BY registeredOn desc")
    Flowable<List<ArduinoDevice>> getConfiguredDevices();

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertNewConfiguredDevice(ArduinoDevice device);

}

