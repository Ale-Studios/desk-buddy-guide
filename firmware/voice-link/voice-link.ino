// Desk buddy voice link — chapter 10 of the Desk Buddy Guide.
//
// Streams the INMP441 microphone to brain.py on your PC over Wi-Fi (WebSocket),
// plays the spoken reply on a MAX98357A amplifier, and follows face commands.
//
// Board:     ESP32-S3 (any ESP32 with two I2S peripherals works; change the pins)
// Core:      "esp32" by Espressif, version 3.x (Arduino Boards Manager)
// Libraries: "WebSockets" by Markus Sattler (LGPL-2.1) and
//            "ArduinoJson" by Benoit Blanchon, version 7 (MIT) — both in the Library Manager
// MIT licence.

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <ESP_I2S.h>

// ---- your settings -------------------------------------------------------
const char* WIFI_SSID  = "your-wifi-name";
const char* WIFI_PASS  = "your-wifi-password";
const char* BRAIN_IP   = "192.168.1.50";  // the PC running brain.py (ipconfig → IPv4 address)
const uint16_t BRAIN_PORT = 8765;

// INMP441 microphone: VDD 3.3 V, GND, L/R to GND (left channel)
const int MIC_SCK = 4, MIC_WS = 5, MIC_SD = 6;
// MAX98357A amplifier: VIN 5 V, GND, SD and GAIN unconnected
const int AMP_BCLK = 15, AMP_LRC = 16, AMP_DIN = 7;
// These pins avoid the ESP32-S3 strapping pins (0, 3, 45, 46) and USB (19, 20).

// ---- state ---------------------------------------------------------------
I2SClass mic, amp;
WebSocketsClient ws;
bool speaking = false;     // true while a reply is playing: the mic is not sent
uint32_t ampRate = 0;

// Hook this into the face code from chapter 8 (RoboEyes, TFT eyes, LED matrix …).
void setFace(const char* name) {
  Serial.printf("face: %s\n", name);
  // e.g. if (!strcmp(name, "thinking")) eyes.setMood(TIRED); …
}

void startAmp(uint32_t rate) {
  if (rate == ampRate) return;
  if (ampRate) amp.end();
  amp.setPins(AMP_BCLK, AMP_LRC, AMP_DIN);
  if (!amp.begin(I2S_MODE_STD, rate, I2S_DATA_BIT_WIDTH_16BIT, I2S_SLOT_MODE_MONO)) {
    Serial.println("amplifier I2S failed to start");
  }
  ampRate = rate;
}

void onBrain(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("connected to the brain");
      setFace("idle");
      break;
    case WStype_DISCONNECTED:
      speaking = false;
      setFace("sleepy");
      break;
    case WStype_TEXT: {
      JsonDocument cmd;
      if (deserializeJson(cmd, payload, length)) break;
      if (cmd["face"].is<const char*>()) setFace(cmd["face"].as<const char*>());
      const char* say = cmd["say"] | "";
      if (!strcmp(say, "audio-start")) {
        startAmp(cmd["rate"] | 16000);
        speaking = true;
      } else if (!strcmp(say, "audio-end")) {
        speaking = false;
      }
      break;
    }
    case WStype_BIN:
      // Raw 16-bit mono PCM. write() waits while the DMA buffer is full, which
      // also slows the network down to playback speed — no big buffer needed.
      if (speaking) amp.write(payload, length);
      break;
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);

  mic.setPins(MIC_SCK, MIC_WS, -1, MIC_SD);
  // The INMP441 sends 24-bit samples in 32-bit slots, so read 32 bits and shift.
  if (!mic.begin(I2S_MODE_STD, 16000, I2S_DATA_BIT_WIDTH_32BIT, I2S_SLOT_MODE_MONO)) {
    Serial.println("microphone I2S failed to start");
  }
  startAmp(22050);  // Piper "medium" voices speak at 22 050 Hz

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  WiFi.setSleep(false);  // Wi-Fi power saving adds a lot of audio latency
  while (WiFi.status() != WL_CONNECTED) delay(250);
  Serial.printf("Wi-Fi ok, my address is %s\n", WiFi.localIP().toString().c_str());

  ws.begin(BRAIN_IP, BRAIN_PORT, "/");
  ws.onEvent(onBrain);
  ws.setReconnectInterval(2000);
}

void loop() {
  ws.loop();
  // updateEyes(millis()); updateServos(millis());  ← your chapter-8 behaviour loop

  if (ws.isConnected() && !speaking) {
    static int32_t raw[512];   // 512 samples = 32 ms at 16 kHz
    static int16_t pcm[512];
    size_t n = mic.readBytes((char*)raw, sizeof(raw)) / sizeof(int32_t);
    for (size_t i = 0; i < n; i++) {
      int32_t v = raw[i] >> 14;                       // keep the top bits, with a little gain
      pcm[i] = (int16_t)constrain(v, -32768, 32767);
    }
    if (n) ws.sendBIN((uint8_t*)pcm, n * sizeof(int16_t));
  }
}
