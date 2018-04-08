


#ifndef _ESP8266BOOTSTRAPLITE_H
#define _ESP8266BOOTSTRAPLITE_H

#include "Arduino.h"
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include "FS.h"

const uint8_t version = 1;

//SSID and Password  separator of string
//#define PASSWORD_SEPERATOR '#'

// Define where debug output will be printed.
//#define DEBUG_PRINTER Serial

#define BOOTLITE_DELAY_TIME 2000

//#define ESP8266BOOTSTRAPLITE_DEBUG

//Setup debug printing
#ifdef DEBUG_ESP_PORT
  #define DEBUG_PRINT(...) { DEBUG_ESP_PORT.printf(__VA_ARGS__); }
  #define DEBUG_PRINTLN(...) { DEBUG_ESP_PORT.printf(__VA_ARGS__); }
#else
  #define DEBUG_PRINT(...) {}
  #define DEBUG_PRINTLN(...) {}
#endif

//Different possible modes for ESP8266
typedef enum ESPBootstrapState { 
	STATE_READY, 
	STATE_WIFI_CONNECT, 
	STATE_WIFI_ACTIVE, 
	STATE_ACCESS_POINT_CONNECT,
	STATE_ACCESS_POINT_ACTIVE,
	STATE_SLEEP
} ESPBootstrapState;

//Error types
typedef enum ESPBootstrapError{ 
	ERROR_ACCESS_POINT, 
	ERROR_WIFI_CONNECT,
	NO_ERROR
} ESPBootstrapError;


class ESP8266BootstrapLite{

	public:

		ESP8266BootstrapLite(char* _ap_ssid, char* _ap_password, char* _ap_token);
		
		~ESP8266BootstrapLite(void);

		bool begin();
		
		void end(bool reboot);

		ESPBootstrapError bootstrap();

		ESPBootstrapError attemptConnectToNearbyWifi();

		ESPBootstrapError startSoftAP();

		ESPBootstrapError connectToWifi(const String ssid, const String password);

		//char* getApSSID() const;
		
		//char* getApPassword() const;
		
		ESPBootstrapState getState() const;
		
		void setState(ESPBootstrapState);

	private:

		ESPBootstrapState state;

		uint8_t _wc_attempts; //Number of Wifi connect attempts allowed

		void teardownWifi();

		void handleConfig();

		void handleNotFound();

		void storeWifiConfInSPIFF(String ssid, String password) const;

		char* _ap_ssid;
		char* _ap_password;
		char* _ap_token;

		ESP8266WebServer* server;
};

#endif

