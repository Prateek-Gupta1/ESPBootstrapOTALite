#include <ESP8266BootstrapLite.h>
#include <ESP8266WiFi.h>

  char* ssid_ap = "espdualmode";
  char* password_ap = "someoneqwerty";
  String token = "5b529942acce580934e0c397";

  String ssid_wifi;
  String password_wifi;

  const int RESET_WIFI_BUTTON_PIN = 2;

  ESP8266BootstrapLite bootLite(ssid_ap, password_ap);
  
  void setup() {
    // put your setup code here, to run once:
    Serial.begin(115200);
    
    pinMode(RESET_WIFI_BUTTON_PIN, INPUT);
    
    delay(500);  

    Serial.println("Device mac address: ");
    Serial.println(WiFi.macAddress());
  
    bool success = bootLite.begin();

    bootLite.enableOTAUpdates("\0", "\0", token);
  
    attachInterrupt(digitalPinToInterrupt(RESET_WIFI_BUTTON_PIN), pin_ISR, FALLING);
  }
  
  void loop() {
    
      ESPBootstrapError err =  bootLite.bootstrap();
  
      delay(1000);
      
      if(bootLite.getState() == STATE_WIFI_ACTIVE){
        
        Serial.println("Wifi connected");
      
      }
  }
  
  void pin_ISR(){
    
    Serial.println("Reset button pressed.");
    
    digitalWrite(RESET_WIFI_BUTTON_PIN, HIGH);

    bootLite.update(WiFi.macAddress());
  
  }
    

