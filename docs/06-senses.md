# 6 · Senses

| Sense | Part | Interface | Use |
|-------|------|-----------|-----|
| Hearing | INMP441 I²S MEMS mic | I²S | Sound detection, voice capture |
| Voice | MAX98357A I²S amp + 28–40 mm speaker | I²S | Sounds, speech |
| Touch | TTP223 capacitive pad | GPIO | Pet the robot's head |
| Distance | VL53L0X time-of-flight | I²C | Notice you approaching |
| Distance (cheap) | HC-SR04 ultrasonic | GPIO | Classic "eyes" on bipeds |
| Edge | IR reflectance sensors | GPIO/ADC | Stop wheeled bots falling off the desk |
| Light | LDR or BH1750 | ADC / I²C | Get sleepy when the room goes dark |
| Motion | MPU6050 IMU | I²C | Detect being picked up or shaken |
| Sight | OV2640 (ESP32-CAM) / Pi Camera Module 3 | DVP / CSI | Face tracking, vision |

## Notes

- **Audio wants clean power:** keep mic and amp wires short and away from servo lines.
- **Mic placement:** away from the speaker and servos, facing the user.
- **Camera:** on an ESP32 the camera is fine for streaming but limited for on-board vision. Heavy processing belongs on a Pi or a PC.

Next: [Body & shell →](07-body-and-shell.md)
