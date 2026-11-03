# 8 · Basic firmware

Make the robot alive **without any AI**: a loop that reads its senses and drives its expression.

## Toolchains

| Toolchain | For | Notes |
|-----------|-----|-------|
| Arduino IDE 2 | ESP32, Arduino | Easiest start |
| PlatformIO (VS Code) | ESP32, Arduino | Better for bigger projects |
| ESP-IDF | ESP32 | Official, most powerful, steeper |
| MicroPython / CircuitPython | ESP32, RP2040 | Quick experiments in Python |
| Python on Linux | Raspberry Pi | Full OS, camera libraries |

## A simple behaviour loop

```
every frame:
  read sensors   (touch, distance, sound level)
  update mood    (happy if touched, curious if something is near, sleepy if dark/quiet)
  pick the expression for the mood
  animate eyes   (blink timer, look toward the stimulus)
  move servos    (eased toward the target)
```

## Milestones

1. Blink an LED — the toolchain works.
2. Draw two eyes and make them blink.
3. Sweep a servo smoothly with easing.
4. Touch → happy face + small nod.
5. Distance sensor → eyes follow your hand.
6. Play a sound on the speaker.
7. Combine everything into a mood state machine.

Example sketches will live in [firmware/](../firmware/README.md).

Next: [Reference projects →](09-reference-projects.md)
