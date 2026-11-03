# 4 · Eyes & face

The face is where most of the personality lives.

| Display | Size | Interface | Look | Notes |
|---------|------|-----------|------|-------|
| SSD1306 OLED | 0.96"/1.3" mono | I²C | Crisp, retro, high contrast | Cheapest; two make a pair of eyes |
| GC9A01 round TFT | 1.28" colour | SPI | Round eyeballs | Very popular for eye projects |
| ST7789 TFT | 1.5–2.4" colour | SPI | A full face on one screen | Pairs well with ESP32-S3 PSRAM |
| 8×8 / 16×16 LED matrix | — | SPI / data line | Pixel art, readable from afar | Low resolution |
| E-paper | 1.5–2.9" | SPI | Calm, paper-like | Slow refresh — no blinking |

## Animation techniques

- **Procedural eyes:** rounded rectangles that change size and position (blink = shrink height, look = shift x/y). Tiny code, smooth, endlessly variable. The open-source [RoboEyes](https://github.com/FluxGarage/RoboEyes) library (GPL-3.0) does exactly this on OLEDs.
- **Sprite sheets:** pre-drawn frames played in sequence, designed in any pixel editor.
- **Expression states:** idle, happy, sleepy, surprised, angry, thinking — switched with smooth easing.
- **Idle life:** random blinks every 2–6 s and small random glances make a robot feel alive.

## Tips

- Draw to a memory buffer, then push the whole frame, to avoid flicker.
- Keep a steady frame rate (~30 fps) rather than running as fast as possible.
- Show a "thinking" expression whenever the robot waits on something slow.

Next: [Movement →](05-movement.md)
