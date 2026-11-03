# 5 · Movement

## Actuators

| Part | Use | Notes |
|------|-----|-------|
| SG90 micro servo | Head pan/tilt, arms | Cheap, plastic gears, a bit noisy |
| MG90S micro servo | Same, more robust | Metal gears, same size as SG90 |
| Serial bus servos (e.g. SCS0009, RS30X) | Smoother, position feedback | Pricier, daisy-chained; supported by Stack-chan cases |
| N20 gear motors | Wheels | Pair with a DRV8833/TB6612 driver |
| 28BYJ-48 stepper | Slow, precise rotation | Bulky and slow |

## Drivers

- **Direct GPIO PWM** — fine for 1–2 servos on an ESP32.
- **PCA9685** — 16 servo channels over I²C; ideal for Raspberry Pi and bipeds.
- **DRV8833 / TB6612FNG** — dual DC motor drivers for wheels.

## Mechanisms

- **Pan-tilt head:** two servos stacked at 90°. The most common desk-buddy neck.
- **Nod-only:** one servo, simpler and quieter.
- **Biped legs:** two servos per leg (hip + ankle) are enough to walk and dance.
- **Differential drive:** two wheels + one caster; turn by spinning the wheels at different speeds.

## Making movement feel alive

- **Ease in and out** instead of jumping straight to the target angle.
- **Limit the range** in software so servos never hit their end stops.
- **Relax servos when idle** to reduce buzzing and heat.
- Add tiny random "breathing" motions when nothing is happening.

Next: [Senses →](06-senses.md)
