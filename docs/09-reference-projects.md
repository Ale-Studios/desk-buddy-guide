# 9 · Reference projects

You do not have to invent everything. These open projects have solved most of the hard problems already — study them, borrow their ideas, and respect their licences. Summaries here are our own words; follow the links for the originals.

## At a glance

| Project | Path | Brain | Licence | Best thing to learn from it |
|---------|------|-------|---------|-----------------------------|
| **Stack-chan** | B | M5Stack Core2 / CoreS3 | Apache-2.0 | A complete, polished desk buddy: face, neck, case, firmware |
| **Reachy Mini** | F | Your PC (Lite) or on-board Raspberry Pi CM4 (Wireless) | SDK Apache-2.0; hardware design CC BY-SA-NC | Expressive head motion and a clean Python SDK |
| **Otto DIY** | D | Arduino Nano / ESP32 | Resources CC BY-SA 4.0; library GPL-3.0 | Walking with four servos, education material |
| **RoboEyes** | A, D, E | Any Arduino-compatible board + OLED | GPL-3.0 | Ready-made, characterful animated eyes |
| **wire-pod** | — | Anki / DDL Vector robot | MIT | Replacing a shut-down cloud with a local server |

## Stack-chan

A palm-sized, open-source companion robot built around an M5Stack controller, with a drawn face and a two-servo neck.

- **Hardware:** the standard build uses M5Stack's "Chan" CoreS3 kit; M5Stack Core2 and CoreS3 are supported, and a self-built version with SG90 servos is possible from the sources.
- **Case:** 3D-printable shells for SG90, SCS0009 and RS30X servos, battery backpacks and community remixes, as STEP and STL with Fusion 360 sources. You can inspect the SG90 parts in this guide's [3D viewer](../models/README.md).
- **Firmware:** written in JavaScript/TypeScript on the Moddable SDK. It can be flashed from a **web installer** without installing any toolchain, and a WebAssembly simulator runs add-on "MODs" in the browser.
- **Community:** very active (around 1.8k GitHub stars and 2,000+ commits at the time of writing).
- **Links:** [stack-chan/stack-chan](https://github.com/stack-chan/stack-chan) · [case files](https://github.com/stack-chan/stack-chan/tree/develop/case) · [M5Stack edition](https://github.com/m5stack/StackChan)

## Reachy Mini

An open-hardware expressive head from Pollen Robotics (part of Hugging Face).

- **Two versions:** *Lite* plugs into your computer over USB and uses it as the brain; *Wireless* carries a Raspberry Pi CM4, a battery, Wi-Fi and an IMU.
- **Assembly** takes about two to three hours.
- **Software:** Python and JavaScript (WebRTC) SDKs, plus a simulator.
- **Licence:** the SDK is Apache-2.0; the hardware design files are Creative Commons **BY-SA-NC**, so they cannot be used commercially.
- **Links:** [pollen-robotics/reachy_mini](https://github.com/pollen-robotics/reachy_mini) · [getting started](https://huggingface.co/docs/reachy_mini/platforms/reachy_mini/get_started)

## Otto DIY

The best-known open-source walking robot for education: a printed body, four to six micro servos and an ultrasonic sensor for "eyes".

- **Licence:** Otto's resources are CC BY-SA 4.0 (credit Otto DIY, share remixes alike); the Arduino library is GPL-3.0.
- **Links:** [ottodiy.com](https://www.ottodiy.com/) · [OttoDIYLib](https://github.com/OttoDIY/OttoDIYLib)

## RoboEyes

An Arduino library by FluxGarage that draws animated robot eyes on monochrome OLEDs: moods, auto-blink, idle glances and short animations. A fast way to give paths A, D and E a face before writing your own.

- **Licence:** GPL-3.0 — firmware that includes it must be GPL too.
- **Links:** [FluxGarage/RoboEyes](https://github.com/FluxGarage/RoboEyes) · [getting-started video](https://www.youtube.com/watch?v=WtLWc5zzrmI)

## wire-pod

A community server that replaces the cloud service of Anki/DDL's Vector robot, so the robot keeps understanding voice commands without a subscription. Only useful if you already own a Vector — but a great case study in chapter 10's "local brain" idea.

- **Links:** [kercre123/wire-pod](https://github.com/kercre123/wire-pod)

## Sources

- Stack-chan: https://github.com/stack-chan/stack-chan
- Reachy Mini: https://github.com/pollen-robotics/reachy_mini
- Otto DIY library and licences: https://github.com/OttoDIY/OttoDIYLib
- RoboEyes: https://github.com/FluxGarage/RoboEyes

Next: [Connecting to a PC →](10-connect-to-pc.md)
