#include <ESP8266BootstrapLite.h>
#include <ESP8266WiFi.h>

  char* ssid_ap = "espdualmode";
  char* password_ap = "someoneqwerty";
  String token = "5c0f49c748b4aa0014199083";

  String ssid_wifi;
  String password_wifi;

  const int RESET_WIFI_BUTTON_PIN = 2;

  ESP8266BootstrapLite bootLite(ssid_ap, password_ap);
  
  void setup() {
    // put your setup code here, to run once:
    Serial.begin(115200);
    //Serial.println("New Firmware");
        
    pinMode(RESET_WIFI_BUTTON_PIN, INPUT);
    
    delay(500);  

    Serial.println("Device mac address: ");
    Serial.println(WiFi.macAddress());
  
    bool success = bootLite.begin();

    bootLite.enableOTAUpdates("10.0.0.249", "3000", token);
  
    attachInterrupt(digitalPinToInterrupt(RESET_WIFI_BUTTON_PIN), pin_ISR, FALLING);
  }
  
  void loop() {
    
      ESPBootstrapError err =  bootLite.bootstrap();
  
      delay(1000);
      
      if(bootLite.getState() == STATE_WIFI_ACTIVE){
        
        Serial.println("Wifi connected");
        Serial.println("OTA Successful! yaay!.");
        delay(5000);

        //bootLite.update(WiFi.macAddress());
      
      }
  }
  
  void pin_ISR(){
    
    Serial.println("Reset button pressed.");
    
    digitalWrite(RESET_WIFI_BUTTON_PIN, HIGH);
  
  }
    

