# 3 · Electronics

## Choosing the board

| Board | Pros | Cons |
|-------|------|------|
| **ESP32 (classic)** | Cheap, Wi-Fi + Bluetooth, huge community | Less RAM for big displays/audio |
| **ESP32-S3** | More RAM (PSRAM), native USB, good for audio + displays | Slightly pricier |
| **M5Stack CoreS3** | Display, mic, speaker, camera, battery all in one | Less flexible, higher cost |
| **Raspberry Pi Zero 2 W** | Full Linux, camera support | Boot time, more power than an MCU |
| **Raspberry Pi 5** | Desktop-class power | Cost, heat, needs 5 V 5 A |
| **Arduino Nano / Uno** | Simplest, great for servos | No Wi-Fi, little memory |

Rule of thumb: **a microcontroller (ESP32) for reflexes, a PC or Pi for heavy thinking.**

## Power

| Option | Use when | Notes |
|--------|----------|-------|
| USB 5 V (2–3 A) | The robot stays on the desk | Simplest and safest |
| 1S LiPo + TP4056 (with protection) + 5 V boost | Small wireless bot | Check the boost current covers the servos |
| 18650 cell(s) in a holder | More capacity | Use protected cells |
| 2S Li-ion (7.4 V) + buck to 5–6 V | Motors and many servos | Needs a balance charger |

**Servo power:** a micro servo can draw several hundred mA when stalled. Use a separate 5 V rail with a large capacitor (470–1000 µF) and connect all grounds together.

## Buses you will meet

- **I²C** (SDA/SCL) — OLED, PCA9685, VL53L0X: many devices on two wires.
- **SPI** — fast colour TFTs (GC9A01, ST7789).
- **I²S** — digital audio: INMP441 mic and MAX98357A amp.
- **PWM** — servos (50 Hz pulses, roughly 0.5–2.5 ms).

## Breadboard → perfboard → PCB

1. **Breadboard:** prototype everything and photograph the working wiring.
2. **Perfboard:** solder the same circuit permanently.
3. **Custom PCB (optional):** design it in KiCad (free) and order from any PCB maker.

Next: [Eyes & face →](04-eyes-and-face.md)
