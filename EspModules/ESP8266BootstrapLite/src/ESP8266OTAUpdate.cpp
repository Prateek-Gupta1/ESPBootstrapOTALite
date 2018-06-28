
#include "ESP8266OTAUpdate.h"



#define GET_DEVICE_INFO_API_ENDPOINT "api/device/mac"

#define UPDATE_API_ENDPOINT "api/firmware/ota/update/device/"

#define DEFAULT_URL "http://localhost:8080/"

#define FILE_DEVICE_IDENTITY "/device.csv"

#define DEVICE_IDENTITY "device"

ESP8266OTAUpdate::ESP8266OTAUpdate(String apihost, String port, String userToken) {

	if(apihost != NULL && apihost.trim().length() != 0) {

		url = apihost;

		if(port != NULL && port.trim().length() != 0) {

			url = "http://" + url + ":" + port + "/";
		}

	}else{

		url = DEFAULT_URL;
	}

	if(userToken == NULL || userToken.trim().length() <= 6) {

		zombie = true;
	}
}

ESP8266OTAUpdate::ESP8266OTAUpdate(String apihost, String usertoken){

	ESP8266OTAUpdate(apihost, NULL, userToken);
}

String ESP8266OTAUpdate::getInfoFromSPIFFS(String key){

	if(zombie) {

		DEBUG_PRINTLN("Object creation failed as user token was not provded.");
		
		return NULL;
	}


	if(SPIFFS.begin() && SPIFFS.exists(FILE_DEVICE_IDENTITY)){

	  File f = SPIFFS.open(FILE_DEVICE_IDENTITY, 'r');

	  if(f){

		String key = f.readStringUntil('\n');

		if(key != NULL){

		  String deviceId = f.readStringUntil('\n');

		  if(deviceId != NULL && deviceId.trim().length() > 6){

			f.close();

			return deviceId;
		  }
		}
	  }
	}

	return NULL;
}


void ESP8266OTAUpdate::storeInfoInSPIFFS(String key, String value){

	if(zombie) {

		DEBUG_PRINTLN("Object creation failed as user token was not provded.");
	
		return NULL;
	}

	File f = SPIFFS.open(FILE_DEVICE_IDENTITY, 'w+');

	if(f){

	  f.println(key);
	  f.println(value);
	}

	if(f != NULL) f.close();
}

String ESP8266OTAUpdate::getDeviceIndentityFromServer(String macAddress, String resourceUri){

	if(zombie) {

		DEBUG_PRINTLN("Object creation failed as user token was not provded.");

		return NULL;
	}

	HTTPClient http;

	StaticJsonBuffer<1500> JSONBuffer;

	if(WiFi.status() == WL_CONNECTED){

		http.addHeader("user", user_token);

		if(resourceUri != NULL && resourceUri.trim().length != 0){

			http.begin(url + resourceUri + "?macaddress=" + macAddress);

		} else {

			http.begin(url + GET_DEVICE_INFO_API_ENDPOINT + "?macaddress=" + macAddress);
		}

		int httpCode = http.GET();

		if(httpCode > 0){

			String payload = http.getString();

			JSONObject& parsed = JSONBuffer.parseObject(payload);

			if(!parsed["message"]){

				http.end();

				String result(parsed["_id"]);

				return result;
			}

			http.end();

		} else{
			
			DEBUG_PRINTLN("Get response with server code : %d", httpCode);
		}
	}

	return NULL;
}

OTAError ESP8266OTAUpdate::update(String deviceId){

	HTTPClient http;

	http.begin(url + UPDATE_API_ENDPOINT + deviceId);

	http.addHeader("user", user_token);

	HTTPUpdateResult ret = handleUpdate(http, NULL);

	switch(ret) {
      case HTTP_UPDATE_FAILED:
          DEBUG_PRINTLN("HTTP_UPDATE_FAILD Error (%d): %s", ESPhttpUpdate.getLastError(), ESPhttpUpdate.getLastErrorString().c_str());
          break;

      case HTTP_UPDATE_NO_UPDATES:
          DEBUG_PRINTLN("HTTP_UPDATE_NO_UPDATES");
          break;

      case HTTP_UPDATE_OK:
          DEBUG_PRINTLN("HTTP_UPDATE_OK");
          break;
    }

    return OTA_UPDATE_FAILED;
}

OTAError ESP8266OTAUpdate::performUpdate(String macAddress){

	if(zombie) {

		DEBUG_PRINTLN("Object creation failed as user token was not provided.");
		
		return OTA_UNINDENTIFIED_USER;
	}


	String deviceId = getInfoFromSPIFFS(DEVICE_IDENTITY);

	if(deviceId == NULL){

		if(WiFi.status() != WL_CONNECTED) {

			DEBUG_PRINTLN("No network connection.");

			return OTA_NO_NETWORK_CONNECTION;
		}

		deviceID = getDeviceIndentityFromServer(macAddress, GET_DEVICE_INFO_API_ENDPOINT);

		if(deviceId == NULL) {

			DEBUG_PRINTLN("Device could not be identified.");

			return OTA_UNINDENTIFIED_DEVICE;

		} else {

			storeInfoInSPIFFS(DEVICE_IDENTITY, deviceId);
		}
	}

	return update(deviceId);
}

