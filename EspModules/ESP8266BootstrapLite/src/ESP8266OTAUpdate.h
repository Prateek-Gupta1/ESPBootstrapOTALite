
#ifndef _ESP8266OTAUPDATE_H
#define _ESP8266OTAUPDATE_H

#include "Arduino.h"
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266httpUpdate.h>
#include <ArduinoJson.h>
#include "FS.h"

#ifdef DEBUG_ESP_PORT
  #define DEBUG_PRINT(...) { DEBUG_ESP_PORT.printf(__VA_ARGS__); }
  #define DEBUG_PRINTLN(...) { DEBUG_ESP_PORT.printf(__VA_ARGS__); }
#else
  #define DEBUG_PRINT(...) {}
  #define DEBUG_PRINTLN(...) {}
#endif

typedef enum OTAError {
	OTA_UNINDENTIFIED_USER,
	OTA_UNINDENTIFIED_DEVICE,
	OTA_NO_NETWORK_CONNECTION,
	OTA_UPDATE_FAILED,
	OTA_NO_ERROR
} OTAError;

class ESP8266OTAUpdate : public ESP8266HTTPUpdate {

  private:

	String url;
	String user_token;
	//String device_id;
	bool zombie = false;

	void storeInfoInSPIFFS(String key, String info);

	String getInfoFromSPIFFS(String key);

	OTAError update(String deviceId);

	String getDeviceIndentityFromServer(String macAddress, String resourceUri);

  public:

  	ESP8266OTAUpdate(String hostname, String port, String user_token);

  	ESP8266OTAUpdate(String hostname, String user_token);

  	OTAError performUpdate(String macAddress);

  	//String loadUserToken() const;

  	//String loadDeviceIdentity() const;
};

#endif
