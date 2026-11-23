// Pocket Desk Buddy — animated eyes, one button, deep sleep.
// Board: Seeed XIAO ESP32-C3 · Display: SSD1306 128x32 or 128x64 (I2C)
// Libraries: Adafruit SSD1306, Adafruit GFX · Licence: MIT

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "esp_sleep.h"

#define W 128
#define H 32                               // 32 = 0.91" display, 64 = 0.96" display
Adafruit_SSD1306 oled(W, H, &Wire, -1);

const int BTN = 3;                         // XIAO ESP32-C3 D1 = GPIO3, button to GND
const unsigned long SLEEP_AFTER = 30000;   // ms without a press before deep sleep

const int EYE_H[] = {22, 12, 3, 28};       // eye height: normal, happy, sleepy, surprised
int mood = 0, lookX = 0;
unsigned long lastAct, nextBlink;

void drawEyes(bool blinking) {
  oled.clearDisplay();
  int h = blinking ? 2 : EYE_H[mood], cy = H / 2;
  oled.fillRoundRect(W / 2 - 40 + lookX, cy - h / 2, 30, h, 6, WHITE);
  oled.fillRoundRect(W / 2 + 10 + lookX, cy - h / 2, 30, h, 6, WHITE);
  oled.display();
}

void goToSleep() {
  oled.ssd1306_command(SSD1306_DISPLAYOFF);
  esp_deep_sleep_enable_gpio_wakeup(1ULL << BTN, ESP_GPIO_WAKEUP_GPIO_LOW);
  esp_deep_sleep_start();                  // wakes (and restarts) when the button is pressed
}

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  Wire.begin();                            // default pins: SDA = D4, SCL = D5
  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);  // use 0x3D if your module needs it
  lastAct = millis();
  nextBlink = lastAct + 2500;
  drawEyes(false);
}

void loop() {
  unsigned long now = millis();

  if (digitalRead(BTN) == LOW) {           // press = next mood
    mood = (mood + 1) % 4;
    lastAct = now;
    drawEyes(false);
    while (digitalRead(BTN) == LOW) delay(10);   // wait for release (simple debounce)
    delay(30);
  }

  if (now > nextBlink) {                   // blink every 2–6 seconds
    drawEyes(true); delay(110); drawEyes(false);
    nextBlink = now + random(2000, 6000);
  }

  if (random(0, 400) == 0) {               // now and then, glance sideways
    lookX = random(-8, 9);
    drawEyes(false);
  }

  if (now - lastAct > SLEEP_AFTER) {       // bored: get sleepy, then sleep
    mood = 2;
    drawEyes(false);
    delay(1500);
    goToSleep();
  }
  delay(10);
}
