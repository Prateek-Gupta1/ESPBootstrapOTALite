# ESP8266BootstrapLite

Esp8266BootstrapLite is a library to securely configure and push firmware updates to the arduino based ESP8266 devices. It's simple to use, and easy to modify for any use case.

## Overview

Often vendors of inexpensive micro-controllers configure their devices with default and predictable configurations. This renders these devices vulnerbale to attack by hackers till the user changes these credentials manually. In most cases, it is a painful process that requires the user to change these details in the code, which renders non-technical users helpless. The library, as part of a bigger framework, provides means for the vendors to encode different credentials for every device they sell making it diffcult to crack.

The library itself consists of 2 components. 
- ESP8266BootstrapLite
- ESP8266OTAUpdate

ESP8266BootstrapLite handles the configurtations part, i.e. passing local network credentials and user token. However, it also incorporates OTAUpdate library to facilitate firmware updates with a single call of function.

OTAUpdate component handles the firmware update part of the solution by communicating with the server packaged with the entire solution. To use it independently, developers have to manage the disabling of updates on their own.

## Documentation

The following gives a brief idea about different elements in each of the component of this library.

### ESP8266BootstrapLite.h

 ***Member Variables***

|name|type|description|
|---|---|---|
|`state`|ESPBootstrapState|The variable holds the internal state of the library while it is in use.|
|`_wc_attempts`|uint_8|It is the max count of wifi connection attempt allowed.|
|`_ap_ssid`|char*|starts device hotspot with this ssid.|
|`_ap_password`|char*|Device's hotspot password.|
|`_user_token`|String|a token required to authenticate the firmware update request sent by the device to the server.|
|`_ota_enabled`|bool|flag to enable or disable ota updates from the library.|
|`_api_host`|String|ip address or base uri of the server from where the device needs to pull new firmware.|
|`_api_port`|String|port number if the ***_api_host*** is set as ip address or null if it is domain name.|

***Member functions***

|functions|access type|arguments|return type|description|
|---|---|---|---|---|
|`ESP8266BootstrapLite`||apSSID, apPassword||Constructor function|
|`storeInfoInSPIFFS`|private|key, info|void|Stores info and key on the SPIFF filesystem of the device.|
|`getInfoFromSPIFFS`|private|key|String|Retrieves info stored on the SPIFF filesystem of the device based on the key.|
|`update`|private|deviceId|OTAError|A helper function that performs firmware update|
|`getDeviceIdentityFromServer`|private|macAddress, resourceUri|String|A helper function that fetches device identity from the server based on its mac address|
|`begin`|public|none|void| It sets up the serial monior, checks if SPIFFS can be initialised and set the initial state of the library.|
|`end`|public|reboot|void|shutdown the wifi and reboots the device if the parameter passed is true.|
|`bootstrap`|public|none|ESPBootstrapError|This is the only function that user needs to call. It starts hotspot mode, accepts connections to configure the device, and connects to wifi by maintaining an internal state.|
|`attemptConnectToNearbyWifi`|public|none|ESPBootstrapError|This convenience function is available if user wants to manually connect to the  Wifi network if its credentials are already stored on the device.|
|`startSoftAP`|public|none|ESPBootstrapError|Initiates the station mode, aka Hotspot, on the device using default credentials provided in the constructor. |
|`connectToWifi`|public|ssid, password|ESPBootstrapError|A helper function to connect to a wifi network. |
|`getState`|public|none|ESPBootstrapState|returns the current internal state of the library.|
|`setState`|public|state|void|Set the internal state.|
|`enableOTAUpdates`|public|apihost, port, userToken|void|This function must be called to enable OTA updates from the library. It takes 'apihost name' that could be ip address or domain name, an optional 'port' and a 'userToken' that authenticates the request to the server.|
|`disableOTAUpdates`|public|none|void|Disables the OTA update functionality.|
|`update`|public|macaddress|ESPBootstrapError|Performs the firmware update on the device.|


### ESP8266OTAUpdate.h

***Member variables***

|name|type|description|
|---|---|---|
|`url`|String|base uri of the server from where device needs to pull firmware image.|
|`user_token`|String|a token required to authenticate the firmware update request sent by the device to the server.|
|`zombie`|bool|A dummy state to disable OTA update in case an error occurs.|

***Member functions***

|functions|access type|arguments|return type|description|
|---|---|---|---|---|
|`ESP8288OTAUpdate`||hostame, port, user_token||Constructor|
|`ESP8266OTAUpdate`||hostname, user_token||Constructor that takes resource url and user token.|
|`performUpdate`|public|macAddress|OTAError|The function downloads device identity using the macAddress if it is not done. If the identity is already stored on the device then it downloads new firmware and performs update.|
|`storeInfoInSPIFFS`|private|key, info|void|stores key-info pair in a file in SPIFFS on the device.|
|`getInfoFromSPIFFS`|private|key|String|gets info from SPIFFS using the key.|
|`update`|private|deviceId|OTAError|helper function that downloads the firmware and peforms the update.|
|`getDeviceIdentityFromServer`|private|macAddress, resourceUri|String|fetches the device id from the server and stores it on SPIFFS.|

## Installing the library

To compile and use the ESP8266 library follow the below steps
```
* Start the Arduino IDE
* Find the arduino sketchbook folder by going to 'preferences' in the Arduino IDE (named as 'Arduino' on Mac).
* Go to the sketchbook folder on terminal and create a directory named "Libraries" using command "mkdir Libraries"
* Copy paste the folder named ESP8266BootstrapLite from ESPSensorManagementSystem/EspModules of this repo 
  to the Libraries folder
* Restart the Arduino IDE.
```

## Example usage
The following is an example that shows the convenience and ease of use of the library.
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

