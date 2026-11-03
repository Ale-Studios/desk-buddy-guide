# 10 · Connecting to a PC (local AI brain)

A microcontroller cannot run a language model. The pattern every serious project uses is the same: **the robot is the body, your computer is the brain.** And with today's open-source tools, that brain can run entirely on your own machine — free, private, with no cloud account and no API key.

## Architecture

```
ROBOT (ESP32)                          COMPUTER on the same network
                                       ┌──────────────────────────────┐
microphone ── audio frames ──────────▶ │ wake word   (optional)        │
                                       │ speech-to-text  e.g. whisper  │
                                       │ language model  e.g. Ollama   │
                                       │ text-to-speech  e.g. Kokoro   │
speaker   ◀── audio ─────────────────  │                               │
face/servos ◀── {"face":"happy"} ────  │ behaviour / tool logic        │
                                       └──────────────────────────────┘
```

The robot stays responsive (blinking, looking around) on its own; the computer only handles the slow, heavy parts.

## Step 1 — pick a link

| Link | Pros | Cons |
|------|------|------|
| **WebSocket over Wi-Fi** | Wireless, two-way, carries both JSON and audio | Slightly more code |
| **MQTT** | Great for several devices, many tools | Needs a broker running |
| **USB serial** | Simplest, no network setup | Robot is tethered |

## Step 2 — define a small protocol

Keep it human-readable. Commands from computer to robot:

```json
{ "face": "happy" }
{ "look": [12, -4] }
{ "nod": 2 }
{ "say": "audio-start", "rate": 16000 }
```

Events from robot to computer:

```json
{ "event": "touch" }
{ "event": "near", "mm": 180 }
{ "event": "audio", "rate": 16000 }
```

Audio travels as raw 16-bit PCM frames (16 kHz mono is enough for speech) in binary WebSocket messages.

## Step 3 — the computer side

A small Python or Node.js server that:

1. Receives audio from the robot and detects when you stop speaking.
2. Transcribes it with a speech-to-text model.
3. Sends the text to a local language model.
4. Turns the reply into speech and streams it back, together with a face command.

## Free local building blocks

| Role | Project | Licence | Notes |
|------|---------|---------|-------|
| Speech-to-text | [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | MIT | Runs on CPU or GPU (CUDA, Vulkan, Metal…). Models: tiny 75 MiB, base 142 MiB, small 466 MiB, medium 1.5 GiB, large 2.9 GiB. |
| Language model | [Ollama](https://github.com/ollama/ollama) | See repository | Runs open models locally. Its OpenAI-compatible API lives at `http://localhost:11434/v1/`; clients need an API-key field but any placeholder works locally. |
| Text-to-speech | [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) | Apache-2.0 | Small, natural-sounding voices. |
| Text-to-speech | [Piper](https://github.com/OHF-Voice/piper1-gpl) | GPL-3.0 | Fast; the original `rhasspy/piper` repository was archived in October 2025 and development continues here. |
| Wake word | [openWakeWord](https://github.com/dscripka/openWakeWord) | Code Apache-2.0; pre-trained models CC BY-NC-SA 4.0 | Runs on a PC or Pi, not on microcontrollers. The included models are **non-commercial**. |

> **Note:** check every licence before you sell a robot or a product built on these tools. Open source does not always mean "free for commercial use" — openWakeWord's pre-trained models are the clearest example.

## Step 4 — hide the latency

On an ordinary PC the full loop (listen → transcribe → think → speak) takes from one to several seconds. The robot should never look frozen during that time:

- switch to the **thinking** face the moment you stop speaking;
- keep small idle movements going;
- start speaking the first sentence as soon as it is ready instead of waiting for the full reply.

## Step 5 — privacy and safety

- Bind the server to your **local network only**; never expose it to the internet.
- Keep a physical way to mute the microphone (a switch, or covering the touch pad).
- Log nothing you would not want stored.

## Sources

- whisper.cpp licence, backends and model sizes: https://github.com/ggml-org/whisper.cpp
- Piper archive notice and new home: https://github.com/rhasspy/piper · https://github.com/OHF-Voice/piper1-gpl
- Ollama OpenAI-compatible API: https://docs.ollama.com/api/openai-compatibility
- Kokoro-82M (Apache-2.0): https://huggingface.co/hexgrad/Kokoro-82M
- openWakeWord licences and hardware notes: https://github.com/dscripka/openWakeWord
