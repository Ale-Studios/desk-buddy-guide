# 2 · Choose your path

Six ways to build a desk buddy. All of them can later be connected to a PC (chapter 10).

| Path | Brain | Typical cost* | Difficulty | Build time | Best for |
|------|-------|---------------|------------|-----------|----------|
| **A. Minimal ESP32** | ESP32 / ESP32-S3 | €30–50 | ★★☆☆☆ | 1–2 weekends | First build, learning the basics |
| **B. M5Stack kit (Stack-chan style)** | M5Stack CoreS3 | €70–110 | ★☆☆☆☆ | 1 day | Fast, polished result with little soldering |
| **C. Raspberry Pi bot** | Pi Zero 2 W / Pi 5 | €80–150 | ★★★☆☆ | 2–4 weekends | Camera, vision, running more on board |
| **D. Biped (Otto style)** | Arduino Nano / ESP32 | €30–60 | ★★☆☆☆ | 1–2 weekends | Walking and dancing, education |
| **E. Wheeled buddy** | ESP32 + motor driver | €40–80 | ★★★☆☆ | 2–3 weekends | Roaming the desk |
| **F. Premium kit (Reachy Mini)** | Your PC / on-board computer | €300–500 | ★★☆☆☆ | 1 day | Expressive head, Python SDK |

\* Rough estimates (November 2026), excluding tools and 3D printing. Always compare suppliers.

## Shopping lists

### A. Minimal ESP32
- ESP32-S3 dev board
- 1.28" round GC9A01 TFT **or** 0.96" SSD1306 OLED
- 2 × SG90 / MG90S micro servos (pan + tilt)
- TTP223 touch pad · INMP441 I²S mic · MAX98357A I²S amp + 28–40 mm speaker
- 5 V 2 A USB supply (or TP4056 + protected LiPo for wireless)

### B. M5Stack kit
- M5Stack CoreS3 (display, mic, speaker, camera built in) + 2 servos
- Open case files from Stack-chan (chapter 9)

### C. Raspberry Pi bot
- Pi Zero 2 W (light) or Pi 5 (powerful) · Pi Camera Module 3
- USB or I²S mic · I²S amp + speaker · 2" ST7789 TFT
- PCA9685 servo driver + 2–3 servos · 5 V 3–5 A supply

### D. Biped
- Arduino Nano (or ESP32) · 4–6 SG90 servos · HC-SR04 ultrasonic "eyes" · buzzer
- 4 × AA or 2S Li-ion pack · printed Otto-style body (chapter 9)

### E. Wheeled
- ESP32 · 2 × N20 gear motors + wheels + caster · DRV8833 or TB6612 driver
- VL53L0X distance sensor + downward IR sensors (so it never drives off the desk)
- OLED face · 2S battery

### F. Premium kit
- Reachy Mini (Lite or Wireless) — assemble, then program with its Python SDK.

## How to decide

- **Never soldered?** → B, then A.
- **Want a camera and computer vision?** → C or F.
- **Want it to move around?** → D or E.
- **Tight budget?** → A or D.

Next: [Electronics →](03-electronics.md)
