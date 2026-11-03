# 1 · Basics

A desk buddy is a small, characterful robot that lives next to your keyboard. It has a face, it looks around, it reacts when you touch it or talk to it — and it never needs a cloud account to do any of that.

## Anatomy of a desk buddy

Almost every design, from a €30 ESP32 build to a €500 kit, is made of the same four blocks:

```
 SENSES             BRAIN                EXPRESSION
 microphone,  ───▶  microcontroller ───▶ face   (display)
 touch, distance,   (ESP32, Pi, …)       voice  (speaker)
 light, camera            │              motion (servos / motors)
                          │
                   POWER (USB or battery)
```

- **Senses** turn the world into numbers: a sound level, a touch, a distance in millimetres.
- **The brain** is a small computer that runs a loop: read the senses, decide a mood, update the face and motors.
- **Expression** is what you see and hear: eyes on a screen, a nodding neck, beeps and voice.
- **Power** keeps everything alive — and is where most beginner problems start (chapter 3).

The *personality* lives in the rules that connect senses to expression: blink every few seconds, glance toward a sound, close the eyes when the room goes dark, look happy when someone pats its head.

## What you will learn

| Skill | Where | Why it matters |
|-------|-------|----------------|
| Reading a pinout and wiring on a breadboard | Chapters 3, 6 | Every module connects the same few ways (I²C, SPI, I²S, PWM) |
| Soldering header pins | Chapter 1, 3 | Most modules ship with loose pins |
| Powering servos safely | Chapters 3, 5 | The #1 cause of random resets |
| Animating eyes | Chapter 4 | Where the character comes from |
| Designing or printing a shell | Chapter 7 | Turns a prototype into an object |
| Writing a behaviour loop | Chapter 8 | Makes the robot feel alive |

## Tools

| Tool | Needed? | Notes |
|------|---------|-------|
| USB cable + computer | Required | Flashing firmware. Use a cable that carries **data**, not a charge-only one. |
| Breadboard + jumper wires | Required | Prototype every circuit before soldering it. |
| Soldering iron, temperature-controlled (~60 W) | Strongly recommended | A fine conical or chisel tip; around 330–360 °C for lead-free solder. |
| Multimeter | Strongly recommended | Check voltages, continuity and shorts before powering anything. |
| Flush cutters, tweezers, small screwdrivers | Recommended | |
| Helping hands or a PCB holder | Nice to have | Keeps modules still while soldering. |
| 3D printer | Optional | Print services, kits or cardboard work too (chapter 7). |
| Hot glue gun | Optional | Fast prototyping of enclosures and cable strain relief. |

> **Tip:** buy two of every cheap module (displays, sensors, servos). One will arrive dead or get damaged while you learn, and a spare saves a week of waiting.

## Safety

> **Safety:** lithium batteries (LiPo pouches, 18650 cells) store a lot of energy. A short circuit, a puncture or charging without protection can make them swell, smoke or catch fire.

- Use **protected cells**, or a charger board with a protection circuit. Many cheap TP4056 charger boards only charge; the versions with an extra protection chip also guard against over-discharge and short circuits.
- **Never leave lithium batteries charging unattended**, and never charge a swollen or damaged cell.
- **Servos draw far more current when they stall** than when they move freely. Power them from their own 5 V rail and connect all grounds together (chapter 3).
- **Unplug power before changing wiring.** Most dead modules die from a wire moved while powered.
- Solder in a ventilated room, keep the iron in its stand, and wash your hands after handling leaded solder.

## Before you buy anything

1. Read [chapter 2](02-choose-your-path.md) and pick **one** path.
2. Buy that path's parts plus spares of the cheap ones.
3. Follow the chapters in order: power and wiring first, face second, movement third.

## Further reading

- Adafruit Learn — the best free library of beginner-friendly electronics guides: https://learn.adafruit.com/
- Arduino documentation — getting started and language reference: https://docs.arduino.cc/

Next: [Choose your path →](02-choose-your-path.md)
