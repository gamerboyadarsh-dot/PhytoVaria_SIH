# Person 6 — IoT + Software Support

## What's in this folder

- `esp32_sketch/esp32_sketch.ino`
  The code that runs ON the ESP32 board. Reads temperature/humidity
  from the DHT sensor and sends it to the backend over WiFi. Has a
  `USE_FAKE_DATA` switch so it can be flashed and tested even before
  you physically have the sensor working.

- `demo_mode/demo_mode_sender.py`
  A Python script that pretends to be the ESP32 — sends fake but
  realistic sensor readings to the backend on a loop. Use this to:
  1. Let the team test against real-looking data before hardware is ready.
  2. Act as a live backup during the demo if the real hardware has issues.

- `demo_mode/curl_test_commands.txt`
  Copy-paste terminal commands for quickly testing the backend's
  sensor endpoint by hand, no code required.

## Before anything works: get this from Sanidhya (Person 2)

1. The real server URL (IP address + port + endpoint path)
2. The exact JSON field names his FastAPI endpoint expects
3. What a successful response looks like

Then update `SERVER_URL` in both the `.ino` file and the `.py` file.

## Suggested order of operations

1. Confirm the API contract with Sanidhya (see above).
2. Run `demo_mode_sender.py` (or the curl commands) against his real
   endpoint to confirm the plumbing works end-to-end.
3. When you get the ESP32 + DHT hardware: open `esp32_sketch.ino` in
   Arduino IDE, set `WIFI_SSID` / `WIFI_PASSWORD` / `SERVER_URL`,
   flash it, watch Serial Monitor to confirm it's working.
4. Once the real sensor reads are confirmed working, set
   `USE_FAKE_DATA = false` in the sketch and re-flash.
5. Keep `demo_mode_sender.py` ready as a live fallback during judging.
