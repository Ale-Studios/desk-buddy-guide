# 8 · Basic firmware

Before any AI, a desk buddy should already feel alive: blinking, glancing around, reacting to touch. That is all firmware — a loop that reads the senses and drives the expression.

## Choosing a toolchain

| Toolchain | Boards | Language | Good for |
|-----------|--------|----------|----------|
| **Arduino IDE 2** | ESP32, Arduino | C++ | The easiest start; most examples online use it |
| **PlatformIO** (VS Code) | ESP32, Arduino, many more | C++ | Bigger projects, library management, reproducible builds |
| **ESP-IDF** | ESP32 family | C / C++ | Espressif's official framework; most control, steeper curve |
| **MicroPython** | ESP32, RP2040 | Python | Quick experiments from a live prompt |
| **Moddable SDK** | M5Stack, ESP32 | JavaScript | What Stack-chan uses; can be flashed from a web installer |
| **Python on Linux** | Raspberry Pi | Python | Camera and vision libraries |

> **Tip:** start with the Arduino IDE and the official Espressif board package, then move to PlatformIO once your project has more than a couple of files.

## Recommended libraries

| Job | Library | Licence |
|-----|---------|---------|
| Servos on ESP32 | [ESP32Servo](https://github.com/madhephaestus/ESP32Servo) | LGPL-2.1 |
| Colour TFTs (GC9A01, ST7789) | [TFT_eSPI](https://github.com/Bodmer/TFT_eSPI) or [LovyanGFX](https://github.com/lovyan03/LovyanGFX) | FreeBSD / MIT / BSD mix |
| Animated OLED eyes | [RoboEyes](https://github.com/FluxGarage/RoboEyes) | GPL-3.0 |
| Many servos | Adafruit PWM Servo Driver (PCA9685) | BSD |

Check licences before you distribute firmware: GPL code (RoboEyes) makes your firmware GPL; LGPL code (ESP32Servo) comes with relinking obligations when you ship binaries.

## Structure: a behaviour loop

Avoid long `delay()` calls — they freeze the eyes while the robot waits. Instead, run a fast loop and let each part update a little every frame:

```cpp
void loop() {
  uint32_t now = millis();

  readSenses(now);      // touch, distance, sound level
  updateMood(now);      // happy if touched, curious if near, sleepy if dark
  updateEyes(now);      // blink timer, glance toward the stimulus
  updateServos(now);    // ease each servo toward its target angle
  drawFrame();          // push one frame to the display (~30 fps)
}
```

### A mood state machine

```
          touch                        nothing for 60 s
 IDLE ───────────▶ HAPPY ──(3 s)──▶ IDLE ─────────────────▶ SLEEPY
  │  ▲                                ▲                        │
  │  └──────── hand moves away ───────┤                        │
  └── hand within 20 cm ──▶ CURIOUS ──┘     touch / loud sound │
                                            ◀───────────────────┘
```

Each state only decides **targets** (eye shape, gaze, head angle). The update functions move smoothly toward them, so switching moods never looks jerky.

## Milestones

Work through these in order — each one builds on the last and is a small success on its own.

1. **Blink an LED.** Proves the board, cable and toolchain work.
2. **Draw two eyes** on the display and make them blink at random intervals.
3. **Sweep a servo smoothly** with easing, within safe limits.
4. **Touch → happy face + a small nod.**
5. **Distance sensor → the eyes follow your hand.**
6. **Play a sound** on the speaker.
7. **Combine everything** into the mood state machine above.

## Debugging checklist

| Symptom | Usual cause |
|---------|-------------|
| Board resets when a servo moves | Brown-out: servos on the board's supply (chapter 3) |
| Board won't boot with a module attached | A strapping pin is being pulled (chapter 3) |
| Display stays black | Wrong pins in the library config, or wrong I²C address |
| Analog reading stuck while Wi-Fi is on | Sensor on an ADC2 pin (classic ESP32) |
| Motors never turn (TB6612FNG) | STBY left low |
| Upload fails | Charge-only USB cable, or the board needs BOOT held while connecting |

## Getting started links

- Arduino core for ESP32 — Espressif: https://docs.espressif.com/projects/arduino-esp32/en/latest/
- PlatformIO: https://platformio.org/
- MicroPython for ESP32: https://micropython.org/download/?port=esp32
- ESP-IDF get started — Espressif: https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/
- Stack-chan web installer and simulator: https://github.com/stack-chan/stack-chan

Next: [Reference projects →](09-reference-projects.md)
