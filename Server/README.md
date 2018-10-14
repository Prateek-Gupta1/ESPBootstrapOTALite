# OTAServer
A node.js and mongodb based application server capable of managing device firmwares.

## Overview
The server is an express-node.js application backed by mongoDB datastore and follows a REST based architecture to expose firmware and other API endpoints. Users first need to register themselves, which gives them a unique identifier to authorize the ESP8266 library api requests. Then the device must be registered on the system with mac address being the device identity and the system generates a token for device as well. Next users can publish new firmwares to the registered device and the server handles the pull request. The entire server is containerized using Docker, but can be run independently as well.

## Running as Docker container

make sure Docker is installed on the system. Use this link :point_right: [Docker](https://docs.docker.com/install/) to download the latest version (community edition is recommended)

```
Clone the repo in a local directory
```
```
run docker application and open terminal
```
```
cd OTAServer
```
```
docker-compose build
```
```
docker-compose up
```

It would take a while to build the container first time. Once it is up, go to localhost:3000 to check if a blank page appears.

## Running as a standalone application

It is not recommended to take this path because all the extra steps are handled by docker. In case you need to do this please follow the steps below

```
Install NPM and MongoDB on your system first.
```
```
Copy server code in a local directory and navigate into the OTAServer folder in terminal.
```
```
Go to /Config/congig.js file and change "config.db.host" to localhost.
```
```
Start monodb server first
  create folder data/db in a local directory, navigate to parent of 'data' directory and run
  
    mongod --dbpath data/db
```
```
In a separate terminal instance run
  cd OTAServer
  npm start
```




