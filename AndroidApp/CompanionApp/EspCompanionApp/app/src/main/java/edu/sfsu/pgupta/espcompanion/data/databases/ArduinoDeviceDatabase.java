package edu.sfsu.pgupta.espcompanion.data.databases;

import android.arch.persistence.room.Database;
import android.arch.persistence.room.Room;
import android.arch.persistence.room.RoomDatabase;
import android.content.Context;

import edu.sfsu.pgupta.espcompanion.data.dao.ArduinoDeviceDao;
import edu.sfsu.pgupta.espcompanion.data.models.ArduinoDevice;

@Database(entities = {ArduinoDevice.class}, version = 1, exportSchema = false)
public abstract  class ArduinoDeviceDatabase extends RoomDatabase{

    private static volatile ArduinoDeviceDatabase INSTANCE;

    public abstract ArduinoDeviceDao arduinoDeviceDao();

    public static ArduinoDeviceDatabase getInstance(Context ctx){
        if(INSTANCE == null){

            synchronized (ArduinoDeviceDatabase.class){

                if(INSTANCE == null){
                    INSTANCE = Room.databaseBuilder(ctx.getApplicationContext(),
                            ArduinoDeviceDatabase.class, "Device")
                            .build();
                }
            }
        }

        return INSTANCE;
    }
}
