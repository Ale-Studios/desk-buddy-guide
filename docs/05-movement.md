# 5 · Movement

A little motion goes a long way. A head that turns toward you and nods once does more for a robot's personality than any number of motors — as long as the movement is smooth and quiet.

## Actuators

| Part | Use | Key numbers | Notes |
|------|-----|-------------|-------|
| **SG90 micro servo** | Head pan/tilt, arms, biped legs | 4.8–6 V; about 1.2 kg·cm at 4.8 V (vendors quote up to 1.8) | Cheap, plastic gears, a little noisy. Specs vary between clones. |
| **MG90S micro servo** | Same, sturdier | Same size and wiring as SG90 | Metal gears survive curious fingers. |
| **Serial bus servos** (SCS0009, RS30X…) | Smooth necks | Daisy-chained on one serial line | Report their position back; supported by Stack-chan cases. |
| **N20 gear motors** | Wheels | 3–12 V depending on version | Many gear ratios; need a motor driver. |
| **28BYJ-48 stepper** | Slow, precise turns | 5 V with ULN2003 board | Bulky and slow, but very quiet. |

> **Tip:** plan your design around **1.2 kg·cm** for an SG90, not the most optimistic number on the box. Clones vary, and a servo working near its limit buzzes and heats up.

## Current: the number that matters most

A servo draws little current while holding still and a lot while starting or when blocked. Measurements of SG90s range from about **300 mA to 750 mA at stall**.

- Size your servo supply for **0.75 A per servo** that might move at once.
- Two servos on a 5 V 2 A USB supply is fine **if** they are powered separately from the board's 3.3 V regulator.
- Sudden resets, or a display that flickers when the head moves, almost always mean brown-out — see the power checklist in [chapter 3](03-electronics.md#powering-servos-without-resets).

## Drivers

| Driver | Controls | Interface | Key numbers |
|--------|----------|-----------|-------------|
| **Direct GPIO (ESP32Servo library)** | 1–4 servos | PWM | Simplest; library is LGPL-2.1 |
| **PCA9685** | 16 servos | I²C | 12-bit PWM per channel; up to 62 boards on one bus |
| **TB6612FNG** | 2 DC motors | 2 PWM + 4 direction pins | Motor supply 2.2–13.5 V, logic 2.7–5.5 V, 1.2 A continuous / 3.2 A peak per channel |
| **DRV8833** | 2 DC motors | 4 PWM pins | Small and cheap; for little motors like N20 |

> **Warning:** the TB6612FNG's **STBY** pin is pulled low on the board. If you leave it unconnected, the motors simply never turn. Drive it high to enable the driver.

## Mechanisms

### Pan-tilt neck
Two servos stacked at 90°: the bottom one turns left/right (pan), the top one nods (tilt). This is the classic desk-buddy neck, used by Stack-chan.

- Put the heavier servo at the bottom.
- Keep the head's centre of mass over the pan axis so the servo is not fighting gravity.
- Use the servo horn screw and a printed bracket; glue alone loosens.

### Nod only
One servo, one degree of freedom. Simpler, quieter and surprisingly expressive.

### Biped legs
Two servos per leg (hip and ankle) are enough to walk, wobble and dance — the Otto DIY design. Calibrate each servo's centre in software, because no two horns sit at exactly the same angle.

### Differential drive
Two wheels and a caster ball. Turn by running the wheels at different speeds. Add downward IR sensors at the front so the robot stops at the edge of the desk.

## Making movement feel alive

- **Ease in and out.** Accelerate and decelerate instead of jumping to the target. A simple approach: each frame, move 10–15 % of the remaining distance.
- **Move the eyes first, the head second.** Real creatures glance before they turn.
- **Limit the range in software** so servos never press against their end stops.
- **Relax when idle.** Detaching the servo signal (or using slow, tiny "breathing" moves) reduces buzzing and heat.
- **Add a little randomness** to timing and angles so the robot never repeats itself exactly.

## Sources

- SG90 voltage and torque range (vendor datasheets disagree): https://docs.circuit.rocks/motors/sg90-servo/
- TB6612FNG specifications and STBY pin — SparkFun: https://learn.sparkfun.com/tutorials/tb6612fng-hookup-guide/all
- PCA9685 — Adafruit: https://learn.adafruit.com/16-channel-pwm-servo-driver
- ESP32Servo library and licence: https://github.com/madhephaestus/ESP32Servo
- DRV8833 datasheet — Texas Instruments: https://www.ti.com/lit/ds/symlink/drv8833.pdf

Next: [Senses →](06-senses.md)
