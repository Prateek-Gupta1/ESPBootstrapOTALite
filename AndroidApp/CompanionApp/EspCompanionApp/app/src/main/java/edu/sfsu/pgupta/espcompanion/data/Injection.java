package edu.sfsu.pgupta.espcompanion.data;

import android.content.Context;

import edu.sfsu.pgupta.espcompanion.data.databases.ArduinoDeviceDatabase;
import edu.sfsu.pgupta.espcompanion.data.repository.ArduinoDeviceDataSource;
import edu.sfsu.pgupta.espcompanion.data.repository.ArduinoDeviceDataSourceLocal;
import edu.sfsu.pgupta.espcompanion.viewmodels.ViewModelFactory;

public class Injection {

    public static ArduinoDeviceDataSource provideUserDataSource(Context context) {
        ArduinoDeviceDatabase database = ArduinoDeviceDatabase.getInstance(context);
        return new ArduinoDeviceDataSourceLocal(database.arduinoDeviceDao());
    }

    public static ViewModelFactory provideViewModelFactory(Context context) {
        ArduinoDeviceDataSource dataSource = provideUserDataSource(context);
        return new ViewModelFactory(dataSource, context);
    }
}
