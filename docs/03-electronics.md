# 3 · Electronics

Every desk buddy needs a brain, clean power and a few wires done right. This chapter covers all three; get them right and the rest of the build is fun instead of frustrating.

## Choosing the board

| Board | Strengths | Limits | Best for |
|-------|-----------|--------|----------|
| **ESP32 (classic)** | Cheap, Wi-Fi + Bluetooth, huge community | Less RAM for colour screens and audio | Paths D, E |
| **ESP32-S3** | More RAM (PSRAM on many boards), native USB, good for audio + displays | Slightly pricier | Path A — the recommended default |
| **M5Stack CoreS3** | Screen, mics, speaker, camera and battery in one case | Fixed layout, higher cost | Path B |
| **Raspberry Pi Zero 2 W** | Full Linux, camera connector | Boot time, needs a solid 5 V supply | Path C (light) |
| **Raspberry Pi 5** | Desktop-class performance | Cost, heat, 5 V 5 A supply | Path C (heavy vision) |
| **Arduino Nano** | Simplest possible, 5 V logic suits hobby servos | No Wi-Fi, very little memory | Path D |

**Rule of thumb:** a microcontroller (ESP32) for reflexes — blinking, moving, reacting in milliseconds — and a Pi or a PC for heavy thinking (vision, speech, language models).

## Logic levels: 3.3 V vs 5 V

ESP32 and Raspberry Pi pins work at **3.3 V** and are not 5 V tolerant. Arduino Nano and Uno work at **5 V**.

> **Warning:** a 5 V signal into a 3.3 V pin can damage the board. The classic example is the HC-SR04 ultrasonic sensor: it must run from 5 V and its **Echo** pin outputs 5 V. On a 3.3 V board, put a voltage divider on Echo (Adafruit's example uses two 10 kΩ resistors). The **Trig** input accepts 3 V or 5 V.

Most breakout boards sold by Adafruit, SparkFun and similar include level shifting and a regulator, so they accept 3–5 V — but always check the product page.

## ESP32 pin pitfalls

- **Strapping pins** are read at boot to choose the boot mode. Pulling one the wrong way with a sensor or servo can stop the board from starting.
  - **ESP32-S3:** GPIO 0, 3, 45 and 46 are strapping pins. On boards with octal flash or PSRAM (e.g. ESP32-S3R8), GPIO 33–37 are taken by the memory, and GPIO 26–32 are normally used for flash/PSRAM — leave them all free.
  - **Classic ESP32:** check the "Boot configurations" section of the ESP32 datasheet for your module before using GPIO 0, 2, 5, 12 or 15.
- **ADC2 is shared with Wi-Fi.** On the classic ESP32, analog readings on ADC2 pins compete with the Wi-Fi driver. Put analog sensors (light sensor, potentiometer) on **ADC1** pins if your robot uses Wi-Fi.
- **Input-only pins** (GPIO 34–39 on the classic ESP32) cannot drive servos or LEDs.

## Power

| Option | Use when | Notes |
|--------|----------|-------|
| USB 5 V, 2–3 A | The robot stays on the desk | Simplest and safest. Start here. |
| 1S LiPo + charger with protection + 5 V boost | Small wireless robot | Check the boost converter's current covers the servos' peaks. |
| 18650 cell(s) in a holder | More capacity | Use protected cells only. |
| 2S Li-ion (7.4 V) + buck converter to 5–6 V | Motors and several servos | Needs a balance charger. |

### Powering servos without resets

When a servo starts or stalls it pulls a burst of current. If that comes from the same supply as the microcontroller, the voltage dips and the board **browns out** — it resets at random.

1. Give the servos their **own 5 V rail** (a separate USB supply or a regulator rated for the peak).
2. Add a **large capacitor** across that rail near the servos (470–1000 µF, observe polarity).
3. **Connect all grounds together** — board, servo supply, sensors. Signals need a shared reference.
4. With more than two servos, use a driver board such as the PCA9685 (chapter 5).

## The four buses you will meet

| Bus | Wires | Typical parts | Notes |
|-----|-------|---------------|-------|
| **I²C** | SDA, SCL (+ power) | SSD1306 OLED, PCA9685, VL53L0X | Many devices on two wires, each with an address. PCA9685 boards can chain up to 62 on one bus. |
| **SPI** | SCK, MOSI, CS, DC (+ RST) | GC9A01, ST7789 colour TFTs | Fast enough for smooth colour animation. |
| **I²S** | BCLK, WS/LRC, DATA | INMP441 mic, MAX98357A amp | Digital audio — far less noise than analog wiring. |
| **PWM** | One signal wire | Servos | 50 Hz pulses; the pulse width sets the angle. |

## Breadboard → perfboard → PCB

1. **Breadboard:** wire everything, test each part on its own, then together. Photograph the working layout.
2. **Perfboard / protoboard:** solder the same circuit permanently. Keep servo power wires short and thick.
3. **Custom PCB (optional):** design it in the free [KiCad](https://www.kicad.org/) and order it from any PCB manufacturer. Cleaner, smaller and repeatable.

## Sources

- HC-SR04 voltage and Echo divider — Adafruit: https://learn.adafruit.com/ultrasonic-sonar-distance-sensors/overview
- ESP32 GPIO and strapping pins — Espressif ESP-IDF: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/gpio.html
- ESP32-S3 strapping and flash/PSRAM pins — Espressif ESP-IDF: https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/api-reference/peripherals/gpio.html
- ADC2 shared with Wi-Fi — Espressif ESP-IDF: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/adc/adc_oneshot.html
- PCA9685 chaining — Adafruit: https://learn.adafruit.com/16-channel-pwm-servo-driver

Next: [Eyes & face →](04-eyes-and-face.md)
