# 7 · Body & shell

The shell turns a tangle of modules into an object with a personality. It also protects the electronics, hides the wires and decides how the robot *feels* in your hand.

## Choosing a method

| Method | Cost | Strengths | Limits |
|--------|------|-----------|--------|
| **3D printing (PLA / PETG)** | Low with your own printer | Precise, repeatable, easy to share as files | Needs a printer or a service |
| **Online print service** | Medium | No printer needed, wide material choice | Waiting time and shipping |
| **Cardboard / foam board** | Almost free | The fastest way to test proportions | Fragile, short-lived |
| **Wood / plywood** | Low | Warm look, very sturdy | Needs tools, less detail |
| **Ready-made kit** | Medium–high | Designed to fit perfectly | Less unique |

> **Tip:** build a cardboard mock-up first. Ten minutes with a box cutter tells you whether the head is the right size for the display before you spend hours printing.

## Start from an open design

You rarely have to start from zero. These shells are published openly:

| Design | Licence | Can I redistribute or remix it? |
|--------|---------|----------------------------------|
| [Stack-chan cases](https://github.com/stack-chan/stack-chan/tree/develop/case) — SG90, SCS0009, RS30X servo versions, battery backpacks, community remixes (STEP, STL, Fusion 360) | Apache-2.0 | Yes, with the licence notice and credit |
| [Otto DIY](https://www.ottodiy.com/) biped body | CC BY-SA 4.0 | Yes, with credit to Otto DIY; remixes stay CC BY-SA |
| [Reachy Mini](https://github.com/pollen-robotics/reachy_mini) | CC BY-SA-NC | Personal and non-commercial use only |

Inspect the Stack-chan SG90 parts in the [3D viewer](../models/README.md) — rotate them, check their size in millimetres and download the STL files.

> **Note:** models on sites like Printables and Thingiverse each carry their own licence. Read it before you remix, sell prints or include the files in another project.

## Design rules that save reprints

- **Design around the display first.** The screen sets the size of the head; everything else fits around it.
- **Keep the USB port reachable** — you will reflash the firmware many times.
- **Make it openable.** Use screws into heat-set inserts, or magnets; snap fits wear out.
- **Leave clearance.** About 0.2–0.3 mm per side for parts that slide together; check with a small test print.
- **Ventilate** near voltage regulators and the board.
- **Route cables through the neck** with enough slack for the full pan and tilt range.
- **Give the speaker a sealed chamber** and the microphone a small hole facing forward.
- **Mount servos with their own screws and brackets**, not glue.

## Printing tips

| Setting | Starting point | Why |
|---------|----------------|-----|
| Material | PLA for most parts, PETG for brackets and anything warm | PLA is easy; PETG is tougher and handles heat better |
| Layer height | 0.2 mm (0.12–0.16 mm for visible faces) | Balance between speed and finish |
| Walls | 3 perimeters | Strength for screw holes and brackets |
| Infill | 15–25 % | Enough for small robot parts |
| Orientation | Largest flat face on the bed; screw holes vertical | Fewer supports, stronger holes |

## Free tools

| Job | Tools |
|-----|-------|
| Mechanical design | [FreeCAD](https://www.freecad.org/), Onshape (free plan), Tinkercad (beginners) |
| Organic shapes and characters | [Blender](https://www.blender.org/) |
| Slicing | PrusaSlicer, Cura, OrcaSlicer |
| PCB and component 3D models | [KiCad](https://www.kicad.org/) |

## Sources

- Stack-chan case files and licence: https://github.com/stack-chan/stack-chan
- Otto DIY licence: https://github.com/OttoDIY/OttoDIYLib
- Reachy Mini hardware licence: https://github.com/pollen-robotics/reachy_mini

Next: [Basic firmware →](08-firmware.md)
