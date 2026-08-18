/*
  ============================================================
  ESP32 + DHT11/DHT22 Sensor -> FastAPI Backend
  ============================================================

  WHAT THIS CODE DOES (in plain English):
    1. Connects the ESP32 to your WiFi network.
    2. Every X seconds, reads temperature + humidity from the DHT sensor.
    3. Sends ("POSTs") that data as JSON to your teammate's FastAPI server.
    4. Repeats forever.

  BEFORE YOU FLASH THIS TO THE REAL BOARD, CHANGE THESE 3 THINGS:
    - WIFI_SSID       -> your WiFi network name
    - WIFI_PASSWORD   -> your WiFi password
    - SERVER_URL      -> the real endpoint URL Sanidhya gives you

  LIBRARIES YOU NEED TO INSTALL (Arduino IDE -> Tools -> Manage Libraries):
    - "DHT sensor library" by Adafruit
    - "Adafruit Unified Sensor" (DHT library depends on this)
    (WiFi.h and HTTPClient.h come built-in with the ESP32 board package,
     no need to install those separately)

  BOARD SETUP (Arduino IDE):
    - Tools -> Board -> select your ESP32 board (e.g. "ESP32 Dev Module")
    - Tools -> Port -> select the COM port your ESP32 shows up on

  WIRING (typical):
    DHT sensor VCC  -> ESP32 3.3V
    DHT sensor GND  -> ESP32 GND
    DHT sensor DATA -> ESP32 GPIO4 (or whichever pin you set below)
    (Some DHT modules need a 10k pull-up resistor between DATA and VCC —
     many breakout boards already have this built in, check yours)
  ============================================================
*/

#include <WiFi.h>          // lets the ESP32 connect to WiFi
#include <HTTPClient.h>    // lets the ESP32 send HTTP requests (like POST)
#include "DHT.h"           // lets us talk to the DHT temperature/humidity sensor

// ---------- STEP 0: SETTINGS YOU MUST EDIT ----------

const char* WIFI_SSID     = "YOUR_WIFI_NAME";       // <-- change this
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";   // <-- change this

// The real endpoint URL from Sanidhya's FastAPI backend.
// Example shape: "http://192.168.1.50:8000/sensor"
// (If backend is deployed online later, it'll be a normal https:// URL instead)
const char* SERVER_URL = "http://REPLACE_WITH_BACKEND_IP:8000/sensor";

// Which GPIO pin the DHT sensor's DATA line is connected to
#define DHTPIN 4

// Change to DHT22 if that's the sensor you have instead of DHT11
#define DHTTYPE DHT11

// How often to send a reading, in milliseconds (30000 = 30 seconds)
const unsigned long SEND_INTERVAL_MS = 30000;

// ---------- Internal setup, you don't need to touch below this line ----------

DHT dht(DHTPIN, DHTTYPE);
unsigned long lastSendTime = 0;

// If you don't have the hardware YET and just want to test the WiFi+POST
// logic tonight, set this to true. It will send fake numbers instead of
// reading the real sensor. Set it back to false once you have the board.
bool USE_FAKE_DATA = true;

void setup() {
  Serial.begin(115200);   // opens the Serial Monitor connection for debugging
  delay(1000);

  Serial.println();
  Serial.println("Starting up...");

  dht.begin();  // start the DHT sensor library

  connectToWiFi();
}

void loop() {
  // Only send data every SEND_INTERVAL_MS, not on every single loop cycle
  if (millis() - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = millis();

    float temperature;
    float humidity;

    if (USE_FAKE_DATA) {
      // Fake but realistic-looking values, useful for testing without hardware
      temperature = 25.0 + (random(-30, 30) / 10.0);  // ~22.0 to 28.0 C
      humidity    = 55.0 + (random(-50, 50) / 10.0);  // ~50.0 to 60.0 %
      Serial.println("[FAKE DATA MODE] Using simulated sensor readings.");
    } else {
      // Real reading from the DHT sensor
      temperature = dht.readTemperature();
      humidity    = dht.readHumidity();

      // DHT sensors sometimes fail to read — this checks for that
      if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Failed to read from DHT sensor! Skipping this cycle.");
        return;
      }
    }

    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.print(" C, Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");

    sendToServer(temperature, humidity);
  }

  // Reconnect WiFi automatically if it drops
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, reconnecting...");
    connectToWiFi();
  }
}

// ---------- Helper functions ----------

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("Connected! IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("Failed to connect to WiFi. Will retry in loop().");
  }
}

void sendToServer(float temperature, float humidity) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Not connected to WiFi, skipping send.");
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  // Build the JSON payload as plain text.
  // IMPORTANT: confirm these exact field names ("temperature", "humidity")
  // match what Sanidhya's FastAPI endpoint expects. If he names them
  // differently (e.g. "temp", "hum"), change the keys below to match.
  String jsonPayload = "{\"temperature\": " + String(temperature) +
                        ", \"humidity\": " + String(humidity) + "}";

  Serial.print("Sending: ");
  Serial.println(jsonPayload);

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.print("Server response code: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.print("Server response body: ");
    Serial.println(response);
  } else {
    Serial.print("Error sending POST. Error code: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}
