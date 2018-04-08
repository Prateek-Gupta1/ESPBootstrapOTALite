#include <ESP8266BootstrapLite.h>

  char* ssid_ap = "espdualmode";
  char* password_ap = "someoneqwerty";
  char* token = "qwerty";

  String ssid_wifi;
  String password_wifi;

  const int RESET_WIFI_BUTTON_PIN = 2;

  ESP8266BootstrapLite bootLite(ssid_ap, password_ap, token);
  
  void setup() {
    // put your setup code here, to run once:
    Serial.begin(115200);
    
    pinMode(RESET_WIFI_BUTTON_PIN, INPUT);
    
    delay(500);  
  
    bool success = bootLite.begin();
  
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
    
    bootLite.setState(STATE_ACCESS_POINT_CONNECT);
    
    digitalWrite(RESET_WIFI_BUTTON_PIN, HIGH);
  
  }


//    int ap = digitalRead(RESET_WIFI_BUTTON_PIN);
//    Serial.print("State of reset button is ");
//    Serial.println(ap);

    //Use interrupts instead
//    if(ap == LOW){
//      delay(1000);
//      bootLite.setState(STATE_ACCESS_POINT_CONNECT);
//    }
    

