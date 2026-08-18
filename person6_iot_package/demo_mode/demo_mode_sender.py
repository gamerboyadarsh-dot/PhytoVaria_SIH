"""
demo_mode_sender.py
============================================================
WHAT THIS IS:
  A "fake ESP32." It sends realistic temperature/humidity readings
  to the backend server over and over, just like the real hardware
  would -- but running from your laptop, no sensor required.

WHY IT MATTERS:
  1. Tonight: lets your teammates (backend + frontend) build and test
     against real-looking sensor data before your hardware is ready.
  2. Tomorrow, during the demo: if the ESP32/WiFi/sensor has any issue
     mid-demo (very common with live IoT), you switch to running this
     script instead. The dashboard keeps getting data and nobody
     watching can tell the difference.

HOW TO RUN IT:
  1. Make sure Python 3 is installed.
  2. Install the one dependency this needs:
       pip install requests
  3. Edit SERVER_URL below to match the real backend endpoint.
  4. Run it:
       python demo_mode_sender.py
  5. Press Ctrl+C to stop.
============================================================
"""

import requests
import random
import time

# ---------- SETTINGS: edit this to match the real backend ----------

# Example: "http://192.168.1.50:8000/sensor" or "http://localhost:8000/sensor"
SERVER_URL = "http://REPLACE_WITH_BACKEND_IP:8000/sensor"

# How often to send a reading, in seconds
SEND_INTERVAL_SECONDS = 10

# ---------------------------------------------------------------------


def generate_fake_reading():
    """Returns a realistic-looking (temperature, humidity) pair."""
    temperature = round(25.0 + random.uniform(-3.0, 3.0), 1)  # ~22.0 - 28.0 C
    humidity = round(55.0 + random.uniform(-5.0, 5.0), 1)     # ~50.0 - 60.0 %
    return temperature, humidity


def send_reading(temperature, humidity):
    payload = {
        "temperature": temperature,
        "humidity": humidity,
    }
    try:
        response = requests.post(SERVER_URL, json=payload, timeout=5)
        print(f"Sent {payload} -> Server responded: {response.status_code} {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Failed to send data: {e}")


def main():
    print("Starting demo mode sender. Press Ctrl+C to stop.")
    print(f"Sending to: {SERVER_URL}")
    print(f"Every {SEND_INTERVAL_SECONDS} seconds...\n")

    while True:
        temperature, humidity = generate_fake_reading()
        send_reading(temperature, humidity)
        time.sleep(SEND_INTERVAL_SECONDS)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nStopped.")
