package edu.sfsu.pgupta.espcompanion.data.models;

import android.arch.persistence.room.Entity;
import android.arch.persistence.room.PrimaryKey;
import android.support.annotation.NonNull;

import java.util.Date;

@Entity
public class ArduinoDevice {

    @PrimaryKey
    @NonNull
    private String macAddress;
    private String ssid;
    private String password;
    Long registeredOn;
    boolean configured;

    public String getMacAddress() {
        return macAddress;
    }

    public void setMacAddress(String macAddress) {
        this.macAddress = macAddress;
    }

    public String getSsid() {
        return ssid;
    }

    public void setSsid(String ssid) {
        this.ssid = ssid;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isConfigured() {
        return configured;
    }

    public void setConfigured(boolean configured) {
        this.configured = configured;
    }

    public Long getRegisteredOn() {
        return registeredOn;
    }

    public void setRegisteredOn(Long registeredOn) {
        this.registeredOn = registeredOn;
    }
}