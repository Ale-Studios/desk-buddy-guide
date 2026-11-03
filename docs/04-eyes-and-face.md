# 4 · Eyes & face

People read faces before anything else. A robot with no arms and two good eyes feels more alive than one with six motors and a blank front — so this is the chapter where your desk buddy gets its character.

## Choosing a display

| Display | Size | Interface | Look | Notes |
|---------|------|-----------|------|-------|
| **SSD1306 OLED** | 128×64 or 128×32, monochrome | I²C or SPI (check the board) | Crisp, high-contrast, retro | Cheapest. Two of them make a classic pair of eyes. |
| **GC9A01 round TFT** | 1.28", colour, round | SPI | A real eyeball | The favourite for eye projects. |
| **ST7789 TFT** | 1.5–2.4", colour | SPI | A whole face on one screen | Pairs well with an ESP32-S3 with PSRAM. |
| **8×8 / 16×16 LED matrix** | Modular | SPI / single data line | Pixel art, readable across a room | Low resolution, very bright. |
| **E-paper** | 1.5–2.9" | SPI | Calm, paper-like | Refreshes too slowly to blink. |
| **Built-in screen** (M5Stack CoreS3) | 2", colour | — | Integrated | No wiring at all. |

> **Tip:** one rectangular screen showing two eyes is easier to wire than two separate displays, and the eyes always stay perfectly aligned.

## Libraries

| Library | Displays | What it gives you | Licence |
|---------|----------|-------------------|---------|
| [RoboEyes](https://github.com/FluxGarage/RoboEyes) (FluxGarage) | Monochrome OLEDs via Adafruit GFX (SSD1306, SSD1322…) | Ready-made animated eyes: moods (default, happy, tired, angry), auto-blink, idle glances, laugh and confused animations, cyclops mode | GPL-3.0 |
| [TFT_eSPI](https://github.com/Bodmer/TFT_eSPI) (Bodmer) | Colour TFTs incl. GC9A01 and ST7789 | Fast drawing, sprites (off-screen buffers), DMA on ESP32 | FreeBSD (2-clause) with MIT/BSD parts |
| [LovyanGFX](https://github.com/lovyan03/LovyanGFX) | Colour TFTs, M5Stack screens | Fast drawing with many board presets | FreeBSD (2-clause) with MIT/BSD parts |
| Adafruit GFX + display drivers | SSD1306 and many others | Simple drawing primitives, huge example base | BSD |

> **Note:** RoboEyes is GPL-3.0. If you publish firmware that includes it, your firmware must be released under the GPL too. Fine for open hobby projects — just know it before you sell anything.

## How procedural eyes work

Procedural eyes are drawn from a few numbers every frame instead of from pre-made images. Each eye is a **rounded rectangle**:

| Parameter | Effect |
|-----------|--------|
| Width / height | Big round eyes = surprised; tall narrow = alert |
| Height × openness | Blink = openness goes 1 → 0 → 1 in about 150 ms |
| X / Y offset | Where it looks |
| Lid shape | A curved cut on the bottom = smiling; a slanted top = angry |
| Corner radius | Soft and cute vs sharp and robotic |

The animated robot on this site's home page is exactly this technique.

## Expressions

| Mood | Eyes | Typical trigger |
|------|------|-----------------|
| Idle | Normal size, slow random glances | Nothing happening |
| Happy | Curved lower lid ("smiling eyes") | Touched, recognised you |
| Curious | Bigger, one eye slightly raised | Something moved close |
| Sleepy | Half closed, slow drift | Dark room, long silence |
| Thinking | Looking up and aside, dots animation | Waiting for something slow |
| Surprised | Large and wide, quick | Sudden loud sound |

## Making it feel alive

- **Blink at random intervals** (every 2–6 s). A perfectly regular blink looks mechanical.
- **Glance around** when idle — small, quick eye movements, then a pause.
- **Ease every change.** Move a fraction of the remaining distance each frame instead of jumping.
- **Keep a steady frame rate** (around 30 fps) rather than drawing as fast as possible.
- **Draw off-screen, then push** the whole frame (a sprite or buffer) to avoid flicker. This is where PSRAM on an ESP32-S3 helps.

## Sources

- RoboEyes features and licence: https://github.com/FluxGarage/RoboEyes
- TFT_eSPI supported drivers: https://github.com/Bodmer/TFT_eSPI · licence: https://raw.githubusercontent.com/Bodmer/TFT_eSPI/master/license.txt
- LovyanGFX licence: https://raw.githubusercontent.com/lovyan03/LovyanGFX/master/license.txt
- SSD1306 sizes and interfaces — Adafruit: https://learn.adafruit.com/monochrome-oled-breakouts/overview

Next: [Movement →](05-movement.md)
