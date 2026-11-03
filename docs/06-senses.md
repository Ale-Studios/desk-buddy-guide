# 6 · Senses

Senses are what make a robot *react* instead of just play an animation. You do not need many: a touch pad and a distance sensor already give a desk buddy plenty to respond to.

## Overview

| Sense | Part | Interface | What the robot can do with it |
|-------|------|-----------|-------------------------------|
| Hearing | INMP441 I²S MEMS microphone | I²S | React to claps and loud sounds; capture voice (chapter 10) |
| Voice | MAX98357A I²S amplifier + small speaker | I²S | Beeps, sounds, speech |
| Touch | TTP223 capacitive pad | Digital pin | "Pat its head" — works through thin plastic |
| Distance | VL53L0X laser time-of-flight | I²C | Notice your hand or face approaching |
| Distance (budget) | HC-SR04 ultrasonic | Two digital pins | The classic "eyes" on biped robots |
| Edges | IR reflectance sensors | Digital / analog | Stop a wheeled robot from driving off the desk |
| Light | Photoresistor (LDR) or BH1750 | Analog / I²C | Get sleepy when the room goes dark |
| Motion | MPU6050 IMU | I²C | Notice being picked up, shaken or tilted |
| Sight | OV2640 (ESP32-CAM) or Pi Camera Module 3 | DVP / CSI | Face tracking and vision |

## Distance sensors compared

| | VL53L0X | HC-SR04 |
|-|---------|---------|
| Principle | Infrared laser time-of-flight | Ultrasonic echo |
| Range | About 50 mm – 1.2 m by default; 1.5–2 m in long-range mode on white, reflective targets | 2 cm – 400 cm; 10–250 cm gives the best results |
| Supply | Chip runs at 2.8 V; Adafruit's breakout takes 3–5 V with level shifting | 5 V only |
| Logic | 3.3 V safe on breakouts | Echo outputs 5 V — needs a divider on 3.3 V boards |
| Accuracy | Typically 3–12 % | Good for "something is near" |
| Look | A tiny chip | Two big "eyes" — great on bipeds |

## Audio out: MAX98357A

The MAX98357A takes digital I²S audio straight from the board and drives a speaker — no analog wiring, no extra DAC.

- Supply **2.7–5.5 V**; about **3.2 W into 4 Ω** or **1.8 W into 8 Ω** at 5 V.
- Default gain **9 dB**, adjustable to 3, 6, 12 or 15 dB with a resistor on the GAIN pin.
- The **SD** pin shuts the amplifier down or selects the channel; by default it plays a mono mix of left and right.
- Accepts sample rates from 8 to 96 kHz and needs **no MCLK** — only BCLK, LRC and DIN.
- I²S inputs accept 3.3 V or 5 V logic.

> **Tip:** give the speaker a closed box (even a printed cup). A bare speaker sounds thin because the front and back waves cancel each other.

## Audio in: INMP441

A digital MEMS microphone with an I²S output, powered from 3.3 V. Its **L/R** pin selects which I²S channel it talks on — tie it to ground for the left channel.

- Mount it **away from the speaker and the servos**, facing the person.
- Keep its wires short and away from servo power lines; motors inject noise.

## Cameras

- **ESP32 + OV2640:** good for streaming pictures to a computer; too little processing power for serious on-board vision.
- **Raspberry Pi + Camera Module 3:** real computer vision on board (face detection, tracking) with Python libraries.
- Either way, heavy vision is best done on a PC (chapter 10).

## Sources

- VL53L0X range, voltage and accuracy — Adafruit: https://learn.adafruit.com/adafruit-vl53l0x-micro-lidar-distance-sensor-breakout
- HC-SR04 range and logic levels — Adafruit: https://learn.adafruit.com/ultrasonic-sonar-distance-sensors/overview
- MAX98357A specifications — Adafruit: https://learn.adafruit.com/adafruit-max98357-i2s-class-d-mono-amp

Next: [Body & shell →](07-body-and-shell.md)
