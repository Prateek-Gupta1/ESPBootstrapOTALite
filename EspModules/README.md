# ESP8266BootstrapLite Library


## Overview

## Documentation

### Esp8266BootstrapLite.h

|Function Name|Arguments|Return type|Description|
|---|---|---|---|
|`begin`|none|void| It sets up the serial monior, checks if SPIFFS can be initialised and set the initial state of the library.|
|`end`|reboot|void|shutdown the wifi and reboots the device if the parameter passed is true.|
|`bootstrap`|none|ESPBootstrapError|This is the only function that user needs to call. It starts hotspot mode, accepts connections to configure the device, and connects to wifi by maintaining an internal state.|
|`attemptConnectToNearbyWifi`|none|ESPBootstrapError|This convenience function is available if user wants to manually connect to the  Wifi network if its credentials are already stored on the device.|
|`startSoftAP`|none|ESPBootstrapError|Initiates the station mode, aka Hotspot, on the device using default credentials provided in the constructor. |
|`connectToWifi`|ssid, password|ESPBootstrapError|A helper function to connect to a wifi network. |
|`getState`|none|ESPBootstrapState|returns the current internal state of the library.|
|`setState`|state|void|Set the internal state.|
|`enableOTAUpdates`|apihost, port, userToken|void|This function must be called to enable OTA updates from the library. It takes 'apihost name' that could be ip address or domain name, an optional 'port' and a 'userToken' that authenticates the request to the server.|
|`disableOTAUpdates`|none|void|Disables the OTA update functionality.|
|`update`|macaddress|ESPBootstrapError|Performs the firmware update on the device.|


## Example usage

```cpp
  #include <ESP8266BootstrapLite.h>
  #include <ESP8266WiFi.h>

  char* ssid_ap = "esp_hotspot_ssid";
  char* password_ap = "password_length_must_be_more_than_6";
  String token = "somerandomstring";
  
  String ssid_wifi;
  String password_wifi;

  const int RESET_WIFI_BUTTON_PIN = 2;

  ESP8266BootstrapLite bootLite(ssid_ap, password_ap);
  
  void setup() {

    Serial.begin(115200);
    
    pinMode(RESET_WIFI_BUTTON_PIN, INPUT);
    
    delay(500);  

    Serial.println("Device mac address: ");
    Serial.println(WiFi.macAddress());
  
    bool success = bootLite.begin();

    //This call is required to enable OTA updates
    bootLite.enableOTAUpdates("192.168.1.12", "3000", token);
  }
  
  void loop() {
    
    //This will setup the device once and for all.
      ESPBootstrapError err =  bootLite.bootstrap();
  
      delay(1000);
      
      if(bootLite.getState() == STATE_WIFI_ACTIVE){
        
        Serial.println("Wifi connected");
        
        delay(5000);
        
        //Attempt to update firmware
        bootLite.update(WiFi.macAddress());
      
      }
  }

```

