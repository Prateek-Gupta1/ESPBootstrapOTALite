# ESPSensorManagementSystem
A sensor management solution that allows developers to get started with ESP8266 devices for personal and professional use.

## Get started with an end-to-end IoT solution for Arduino based wifi enabled microcontrollers
Firmware engineers and IoT enthusiasts often find it difficult to develop an infrastructure to manage their IoT devices and the data flow 
in the network. This project is an effort to provide an extensible and secure backend infrastructure that could help individuals and 
corporations to setup a sensor management system with minimum efforts. This project is a prototype implementation developed to manage 
ESP8266 wifi micro-chip, however, the server and the mobile app could be tailored to handle any Wifi enabled micro controller and sensors.

## Overview
The entire solution is divided into two distinguished projects.
- **Project A:** An *ESP8266 Sensor Management library* and the corresponding *Web server* to configure and manage ESP devices and the sensors attached on them.
- **Project B:** It consists of an *Android companion app*, a *ESP bootstrap library* and an *Application server* to manage OTA firmware updates of ESPs.

## About Project B 
The main goal of this project is to provide a secure way to publish over the air firmware updates to a device that is registered in the system. To achieve it, the firmware on the device needs to use the open source library provided for its architecture, for now it is only availble for ESP8266 based devices, and user is required to host the node.js based server on internet or local network. The library will handle the downloading and flashing of the new firmware, however, user needs to publish the new firmware for the registered device on the system. The solution takes care of the security of both the device and the node.js server. Another feature embedded in project B is bootstrapping a new ESP device. Vendors usually provide a default password to the device's acess point mode, which renders the device vulnerable till the user changes those credentials. Our idea here is to allow vendors to provide credentials as QR code, the companion Android app can then read the QR code, connect to the device and the user can pass local network credentials using the companion app on to the device. We have provided a library for ESP8266 to make it easier for the vendors to embed the functionality with minimum efforts.

## Pre-requisites for Project B 
To compile the ESP8266 library, you will need
- Arduino IDE

To configure and install the companion app
- Android Studio

To run the server, you will need to install
- Docker
If you want to build and run the server without using Docker, then you will need to install
- NPM
- MongoDB

## Getting started with Project B

To compile and use the ESP8266 library follow the below steps
```
* Start the Arduino IDE
* Find the arduino sketchbook folder by going to 'preferences' in the Arduino IDE (named as 'Arduino' on Mac).
* Go to the sketchbook folder on terminal and create a directory named "Libraries" using command "mkdir Libraries"
* Copy paste the folder named ESP8266BootstrapLite from ESPSensorManagementSystem/EspModules of this repo 
  to the Libraries folder
* Restart the Arduino IDE.
```
> To know more about the Library go to this link :point_right: ESP8266BootstrapLite

To run and edit Android code do the following
```
* Download the Companion App folder in a local dirctory.
* Start Android studio and import the project.
* Connect an android device, build the project and run.
```

> To know more about the companion app go to this link :point_right: Companion App

To build and run the server

```
* Start docker on your system.
* Download the folder named OTAServer under Server directory of this repo.
* Navigate on terminal inside the OTAServer folder.
* Run docker-compose build
*     docker-compose up
* Once the server is started you can hit localhost:3000 to check if a blank page appears.
```
> To know more about the server go to this link :point_right: OTAServer

## Architecture

##
