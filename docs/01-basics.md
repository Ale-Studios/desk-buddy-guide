# 1 · Basics

## What is a desk buddy?

A small, characterful robot that sits on your desk. Almost every design is built from the same four blocks:

```
 SENSES            BRAIN              EXPRESSION
 mic, touch,  -->  microcontroller --> face (display), voice (speaker),
 distance,         (ESP32, Pi...)      movement (servos/motors)
 camera                 |
                    POWER (USB or battery)
```

The *personality* comes from how the brain links senses to expression: blinking when idle, looking toward a sound, nodding when touched.

## Tools

| Tool | Needed? | Notes |
|------|---------|-------|
| USB cable + computer | Required | For flashing firmware |
| Breadboard + jumper wires | Required | Prototype before soldering |
| Soldering iron (temperature-controlled, ~60 W) | Strongly recommended | Most modules ship with loose header pins |
| Multimeter | Strongly recommended | Check voltages and short circuits |
| Small screwdrivers, flush cutters, tweezers | Recommended | |
| 3D printer | Optional | Kits, print services or cardboard work too |
| Hot glue gun | Optional | Fast enclosure prototyping |

## Safety

- **Lithium batteries** (LiPo, 18650) can catch fire if shorted, punctured or charged without protection. Use protected cells or a charger board with protection, and never leave them charging unattended.
- **Servos draw far more current when stalled** than when idle. Power them separately from the logic board when using more than one.
- Solder in a ventilated room; lead-free solder is preferable.
- Disconnect power before changing wiring.

Next: [Choose your path →](02-choose-your-path.md)
