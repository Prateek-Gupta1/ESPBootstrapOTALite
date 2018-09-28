# ESPCompanionApp
This page describes various aspects of the Android based ESPCompanion app.

## Overview

When a new ESP device is booted for the first time, it contains some default credentials for its hotspot configuration. This makes the device vulnarable to the attackers who could guess the credentials and essentially control the device for their own use. The android app act as a means to securely configure the ESP8266 device when it is booted for the first and subsequent times. The app is fairly easy to install and use with the device. As a prototype implementation it can only send local network (home wifi) credentials and a user token, however,it could be extended to support more features, such as, dual authentication, hotspot reconfiguration, token management, etc.   

## Architecture

The app consists of 5 major componnents that makes the bootstrapping possible. The diagram below depicts the flow of information and the 5 components that handles the flow. 

- When user launches the app, there is a blank list of registered esp devices and a fab to scan QR code. User press the fab and scans the 
  QR code, which is decoded into corresponding esp device credentials and stored on the local storage of mobile. 
  
- Once the device is populated on the main screen, user can select it and wifi is connected to the hotspot ssid hosted by the esp device.

- Once mobile is connected to hotspot, a list of available wifi networks is presented to user. The user selects the wifi ssid, the 
  information of which is to be sent to the esp device, and enters information which is then sent over and stored on the esp device.


![Architecture Diagram](https://github.com/Prateek-Gupta1/ESPSensorManagementSystem/blob/master/AndroidApp/CompanionApp/AndroidArchitecture.png)

```
 Note: 
 - The QR code should consists of esp device hotspot credentials and mac address, and encoded in a fool proof way. Default is esp8266_ssid#password#mac_esp8266.
 - The app incorporates latest android architecture styles, such as RxJava, Room persistence API, and DataBinding using Architecture  components.
 ```
     
## Installing and running the app

```
* Download the companion app folder "EspCompanionApp" in a local dirctory.
* Start Android studio and import the project.
* Connect an android device, build the project and run.
```

