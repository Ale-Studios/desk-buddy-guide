# 10 · Connecting to a PC (local AI brain)

A microcontroller cannot run a language model. The pattern every serious project uses is the same: **the robot is the body, your computer is the brain.** With today's open-source tools that brain can run entirely on your own machine — free, private, unlimited, with no cloud account and no API key.

This chapter is a complete build. By the end your robot will hear you, think with a language model on your PC, answer out loud and change its face while it does. Every piece is free to download and runs offline; there are no message limits, because nothing is rented.

## Architecture

```
ROBOT (ESP32)                          COMPUTER on the same network
                                       ┌──────────────────────────────┐
microphone ── audio frames ──────────▶ │ end-of-speech detection       │
                                       │ speech-to-text  e.g. whisper  │
                                       │ language model  e.g. Ollama   │
                                       │ text-to-speech  e.g. Piper    │
speaker   ◀── audio ─────────────────  │                               │
face/servos ◀── {"face":"happy"} ────  │ behaviour / tool logic        │
                                       └──────────────────────────────┘
```

The robot stays responsive (blinking, looking around) on its own; the computer only handles the slow, heavy parts.

## Pick your brain

There is more than one free and unlimited way to do this. The main build below uses the first row; the others are covered in [Other free and unlimited ways](#other-free-and-unlimited-ways) and slot into the same robot without changing its firmware.

| Brain | Talks freely? | Needs | Difficulty |
|-------|---------------|-------|------------|
| **Full local AI** — Whisper + Ollama + Piper (this chapter's build) | Yes | A PC with 8 GB of RAM or more | Medium |
| **A desktop app as the model server** — LM Studio, Jan | Yes | Same as above | Easy |
| **llama.cpp's own server** | Yes | Same as above | Medium–hard |
| **Home Assistant Assist** | Yes, with Ollama | An always-on PC or mini PC | Medium |
| **A brain on a Raspberry Pi 5 or an old laptop** | Yes, slowly | Pi 5 (8 GB) or any spare computer | Medium |
| **No language model at all** — fixed voice commands | No, only phrases you define | Nothing extra (even on the robot itself) | Easy |

> **Note:** "free" online AI services are deliberately left out. Their free tiers have limits, can change or disappear, and send everything you say to someone else's server — the opposite of what this guide is about.

## What your computer needs

Language models are measured by their size on disk. To run fast, the whole model should fit in your graphics card's memory (VRAM) with about 1 GB to spare. If it doesn't, it still works on the processor and ordinary RAM — just more slowly.

| Your PC | Model size that feels good | Example models |
|---------|----------------------------|---------------|
| Laptop, no graphics card, 8 GB RAM | about 1–2 GB (1.5–3 billion parameters) | `qwen2.5:1.5b`, `llama3.2:3b` |
| Graphics card with 4 GB, or 16 GB RAM | about 2–3 GB (3–4 billion) | `llama3.2:3b`, `qwen2.5:3b`, `qwen3:4b` |
| Graphics card with 6–8 GB | about 4–5 GB (7–8 billion) | `qwen2.5:7b`, `qwen3:8b` |
| Graphics card with 12 GB or more | about 8–10 GB (12–14 billion) | `gemma3:12b`, `qwen2.5:14b` |

Download sizes from the Ollama library: `qwen2.5:1.5b` about 1 GB, `qwen2.5:3b` 1.9 GB, `llama3.2:3b` 2.0 GB, `qwen3:4b` 2.5 GB, `qwen2.5:7b` 4.7 GB, `qwen3:8b` 5.2 GB, `gemma3:12b` 8.2 GB, `qwen2.5:14b` 9.0 GB.

For a robot, **speed matters more than cleverness**: a small model that answers in a second feels far more alive than a smart one that takes ten. Start small and move up only if the answers are too simple.

> **Warning:** every model has its own licence, and they differ even inside one family — Qwen2.5 1.5B and 7B are Apache-2.0, while Qwen2.5 3B uses Qwen's own licence. Llama and Gemma have their own terms too. For a personal robot this rarely matters; read the model's licence before you sell anything built on it.

Speech recognition and the voice are light: they add roughly 1 GB of RAM together and run fine on the processor.

## Step 1 — install the language model (Ollama)

[Ollama](https://ollama.com) downloads open models and serves them on your PC. It is free, open source (MIT) and runs on Windows, macOS and Linux.

1. Download and install it from [ollama.com/download](https://ollama.com/download). On Windows it then runs in the background, with an icon near the clock.
2. Open a terminal (PowerShell on Windows) and download a model from the table above:

   ```bash
   ollama pull llama3.2:3b
   ```

3. Talk to it to check that it works, then type `/bye` to leave:

   ```bash
   ollama run llama3.2:3b
   ```

4. See what is installed, and what is loaded right now (and whether it runs on the graphics card):

   ```bash
   ollama list
   ```

   ```bash
   ollama ps
   ```

Good to know:

- **It unloads a model after 5 minutes without questions** by default, and the next question waits while it loads again. The brain below asks it to stay loaded for 30 minutes (`keep_alive`); you can change the default for everything with the `OLLAMA_KEEP_ALIVE` environment variable.
- **Models are big.** On Windows they live in `C:\Users\<you>\.ollama\models`. To keep them on another drive, set the `OLLAMA_MODELS` environment variable to a folder there, quit Ollama from the taskbar and start it again.
- **It listens only on your own PC** (`127.0.0.1:11434`) by default. That is what you want here: the robot talks to the brain, and only the brain talks to Ollama.
- **"Thinking" models** (Qwen3 and other reasoning models) first write a hidden chain of thought, which adds seconds before every answer. For a talking robot, prefer a model without it, or turn it off (see [step 6](#step-6-make-it-feel-alive)).

## Step 2 — install the voice parts (Python)

The brain is a small Python program. Install Python **3.11 or newer** from [python.org](https://www.python.org/downloads/) — on Windows, tick **"Add python.exe to PATH"** in the installer.

Get the guide's `brain/` folder (download this repository as a ZIP from GitHub, or clone it), open a terminal in that folder and create a private environment for it, so nothing is installed system-wide:

```bash
python -m venv .venv
```

Activate it — on Windows:

```bash
.venv\Scripts\activate
```

On macOS / Linux:

```bash
source .venv/bin/activate
```

Install the parts listed in [`brain/requirements.txt`](../brain/requirements.txt):

```bash
pip install -r requirements.txt
```

Download a voice for Piper. `en_US-lessac-medium` is a clear, neutral English voice:

```bash
python -m piper.download_voices en_US-lessac-medium
```

What you just installed:

| Part | Project | Licence | Job |
|------|---------|---------|-----|
| Speech-to-text | [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | MIT | OpenAI's Whisper models, reimplemented to run fast on an ordinary processor. Downloads its model the first time it starts. |
| Text-to-speech | [Piper](https://github.com/OHF-Voice/piper1-gpl) | GPL-3.0 | Fast, natural voices in many languages, on the processor. |
| Model client | [ollama-python](https://github.com/ollama/ollama-python) | MIT | Talks to Ollama. |
| Robot link | [websockets](https://github.com/python-websockets/websockets) | BSD-3-Clause | The WebSocket server the robot connects to. |
| PC test | [sounddevice](https://github.com/spatialaudio/python-sounddevice) | MIT | Microphone and speakers for the test without a robot. |

> **Tip:** other languages work too. Pick a Piper voice in your language from its [voice list](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md), and use a multilingual Whisper model (`base` or `small`, without `.en`) with your language code — for example `BUDDY_WHISPER=small` and `BUDDY_LANGUAGE=it`.

## Step 3 — the brain server

[`brain/brain.py`](../brain/brain.py) is the whole brain, about 200 commented lines. It does five things:

1. **Listens.** The robot streams its microphone as 16 kHz, 16-bit mono audio. The brain measures how loud each 32 ms frame is: the first loud frame switches the robot's face to *listening*, and 0.7 s of quiet afterwards means you have finished. A little audio from just before you started is kept, so the first syllable is not cut off.
2. **Transcribes** what you said with Whisper.
3. **Thinks.** It sends your words to the language model together with a short personality (the *system prompt*) and the last 8 exchanges, so the robot remembers the conversation.
4. **Speaks sentence by sentence.** As soon as the model has written one full sentence, Piper turns it into audio and it goes to the robot — while the model is still writing the next one. This is the single biggest trick for making a local AI feel fast.
5. **Ignores its own voice.** While the robot is thinking or speaking, incoming microphone audio is dropped, so it never answers itself.

The personality lives at the top of the file. It tells the model that its words will be spoken, so it should reply in short, plain sentences — lists, Markdown and emojis sound terrible read aloud:

```python
SYSTEM = {
    "role": "system",
    "content": (
        f"You are {NAME}, a small, friendly robot that lives on a desk. "
        "Your words are spoken aloud by a speaker, so answer in one to three short sentences "
        "of plain spoken language: no lists, no Markdown, no emojis, no code. "
        "Reply in the language the user speaks. If you are not sure about a fact, say so."
    ),
}
```

The sentence-by-sentence streaming is the heart of it:

```python
for piece in stream_reply([SYSTEM, *history]):   # the model writes a few letters at a time
    full += piece
    buf += piece
    *done, buf = SENTENCE_END.split(buf)          # any complete sentences yet?
    for s in done:
        speak(s)                                  # voice them now, keep the rest for later
```

Start it from the `brain/` folder, with the environment active and Ollama running:

```bash
python brain.py
```

The first start downloads the Whisper model, so give it a minute. When it prints *"Buddy's brain is listening on ws://0.0.0.0:8765"*, it is ready.

Everything can be changed with environment variables, without touching the code:

| Variable | Default | What it does |
|----------|---------|--------------|
| `BUDDY_MODEL` | `llama3.2:3b` | Which language model to use |
| `BUDDY_NAME` | `Buddy` | The robot's name, used in its personality |
| `BUDDY_WHISPER` | `base.en` | Speech model: `tiny.en` (fastest), `base.en`, `small.en` (most accurate); drop `.en` for other languages |
| `BUDDY_LANGUAGE` | `en` | The language you speak |
| `BUDDY_VOICE` | `en_US-lessac-medium.onnx` | Path to the Piper voice |
| `BUDDY_THRESHOLD` | `600` | How loud counts as speech; raise it in a noisy room |
| `BUDDY_PORT` | `8765` | The port the robot connects to |
| `BUDDY_OPENAI_URL` | *(empty)* | Use LM Studio, llama.cpp, Jan… instead of Ollama (see below) |

In Windows PowerShell, set one for the current window like this, then start the brain:

```bash
$env:BUDDY_MODEL = "llama3.2:3b"
```

## Step 4 — test it from the PC

Before soldering anything, check the whole loop with [`brain/pc_test.py`](../brain/pc_test.py). It pretends to be the robot: same connection, same messages, same audio format. Leave `brain.py` running and open a second terminal in the same folder, with the environment active.

Type to it and hear the answer on your speakers:

```bash
python pc_test.py
```

Then talk to it through the PC's microphone, exactly as the robot will — wear headphones, or the microphone will hear the speakers:

```bash
python pc_test.py --mic
```

You will see the face commands scroll by — `listening`, `thinking`, `talking`, `idle` — and the brain's window prints what it heard, what it answered and how long it took. Once this works, the robot side is only plumbing.

## Step 5 — connect the robot

### Choose the link

| Link | Pros | Cons |
|------|------|------|
| **WebSocket over Wi-Fi** (used here) | Wireless, two-way, carries both JSON and audio | Slightly more code |
| **MQTT** | Great for several devices, many tools | Needs a broker running; awkward for audio |
| **USB serial** | Simplest, no network setup | Robot is tethered; slow for audio |

### The protocol

Human-readable JSON for commands and events, binary messages for audio. Commands from the brain to the robot:

```json
{ "face": "listening" }
{ "face": "thinking" }
{ "face": "talking", "say": "audio-start", "rate": 22050 }
{ "say": "audio-end" }
{ "face": "idle" }
```

Between `audio-start` and `audio-end` come binary messages of raw 16-bit mono PCM at the given sample rate (the brain sends whatever rate the Piper voice uses). Events from the robot to the brain:

```json
{ "event": "touch" }
{ "event": "text", "text": "hello" }
```

…plus the microphone itself: binary messages of 16-bit, 16 kHz mono PCM, sent continuously while the robot is not speaking. Add your own commands (`{ "look": [12, -4] }`, `{ "nod": 2 }`) on both sides as the robot grows.

### Wiring

The [voice link sketch](../firmware/voice-link/voice-link.ino) uses an ESP32-S3 with the INMP441 microphone and MAX98357A amplifier from [chapter 6](06-senses.md), each on its own I²S bus, so the robot can listen and speak without re-wiring:

| Module | Module pin | ESP32-S3 pin |
|--------|------------|--------------|
| INMP441 microphone | VDD | 3V3 |
| | GND | GND |
| | L/R | GND (left channel) |
| | SCK | GPIO 4 |
| | WS | GPIO 5 |
| | SD | GPIO 6 |
| MAX98357A amplifier | VIN | 5V |
| | GND | GND |
| | BCLK | GPIO 15 |
| | LRC | GPIO 16 |
| | DIN | GPIO 7 |
| | SD, GAIN | not connected (on, 9 dB gain) |

These pins avoid the ESP32-S3's strapping pins (0, 3, 45, 46) and its USB pins (19, 20). Other free pins work too: change the numbers at the top of the sketch.

### The firmware

In the Arduino IDE (see [chapter 8](08-firmware.md)):

1. Install the **esp32** board package by Espressif, version **3.x** — its `ESP_I2S` library is built in.
2. From the Library Manager install **WebSockets** by Markus Sattler and **ArduinoJson** by Benoit Blanchon (version 7).
3. Open `firmware/voice-link/voice-link.ino` and fill in your Wi-Fi name, password and the PC's address.
4. Upload, and open the Serial Monitor at 115200 baud: you should see *"Wi-Fi ok"* and then *"connected to the brain"*.

The sketch is deliberately small: it streams the microphone while the robot is quiet, plays whatever audio arrives, and calls `setFace()` for every face command. Connect `setFace()` to the eyes from chapter 4 and you are done. Two details matter:

- `WiFi.setSleep(false)` — Wi-Fi power saving delays packets and makes the audio stutter.
- The amplifier's `write()` waits while its buffer is full. That naturally slows the network down to playback speed, so the robot never has to hold a whole sentence in memory.

### Find your PC's address and open the door

The robot needs the PC's address on your home network. On Windows run `ipconfig` and look for **IPv4 Address** under your Wi-Fi or Ethernet adapter (something like `192.168.1.50`); on macOS use `ipconfig getifaddr en0`, on Linux `hostname -I`.

```bash
ipconfig
```

The first time `brain.py` starts, Windows asks whether Python may communicate on networks: allow **Private networks** only. Make sure your home Wi-Fi is set as a *Private* network in Windows settings, or the robot will not get through.

> **Tip:** give the PC a fixed address in your router's DHCP settings ("address reservation"), so you never have to re-flash the robot when the address changes.

## Step 6 — make it feel alive

On an ordinary PC the full loop (listen → transcribe → think → speak) takes from one to several seconds. The robot should never look frozen during that time:

- **Change the face instantly.** The brain sends `listening` the moment you start talking and `thinking` the moment you stop. Make *thinking* visibly different — eyes looking up, a slow blink, a small head tilt.
- **Keep idle movements going** on the robot itself (chapter 8); never block the behaviour loop while waiting.
- **Speak the first sentence early** — already built in. The shorter the first sentence, the sooner the robot starts talking: one more reason to ask for short answers in the personality.
- **Keep the model loaded.** `brain.py` loads it at start-up and keeps it for 30 minutes after the last question; the first answer after it has been unloaded always takes longer.
- **Use the smallest speech model that understands you.** `tiny.en` is the fastest; move to `small.en` only if it mishears you often.
- **Turn off "thinking"** if you use a reasoning model: in `stream_reply()` add `think=False` to the `ollama.chat(...)` call — only for models that support thinking.
- **Give it a character.** Change the system prompt: a grumpy robot, a cheerful one, one that speaks only in short rhymes. Keep the rule about short, plain sentences.

Ideas for later, each a small change to `brain.py`:

- **Interrupting** ("barge-in"): keep measuring the microphone while the robot speaks and stop playback when you start talking. You will need to deal with the robot hearing its own speaker.
- **Actions:** ask the model to end a reply with a tag such as `[nod]` or `[happy]`, strip it before speaking and send it as a command.
- **Long-term memory:** save `history` to a file on exit and load it at start, or keep a short list of facts about you in the system prompt.
- **A wake word**, so the robot only listens after hearing its name — openWakeWord on the PC, or Espressif's WakeNet on the robot (table below).

## Troubleshooting

| Symptom | Usual cause |
|---------|-------------|
| Robot never connects | Wrong IP in the sketch, brain not running, or Windows Firewall blocking Python (allow it on *Private* networks) |
| Robot connects but never reacts to speech | Microphone too quiet: lower `BUDDY_THRESHOLD`, and check the INMP441's L/R pin is on GND |
| It reacts to every noise | Raise `BUDDY_THRESHOLD` (try 1000–1500) |
| It answers itself in a loop | The robot sends microphone audio while speaking: keep the `speaking` check in the sketch |
| Voice too fast, too slow or squeaky | The amplifier runs at a different rate from the audio: it must restart at the `rate` in `audio-start` |
| Voice crackles or stutters | Wi-Fi power saving still on, weak signal, or the supply sags when the amplifier peaks (chapter 3) |
| Every answer takes 10 seconds or more | Model too large for your PC — `ollama ps` should say *100% GPU* — or a "thinking" model |
| The first answer is slow, the rest fast | Normal: the model was loading |
| `model "…" not found` | You haven't downloaded it: `ollama pull <name>` |
| Mishears words | Try `BUDDY_WHISPER=small.en`, speak 30–50 cm from the microphone, reduce background noise |
| Answers contain lists, asterisks or emojis | Strengthen the system prompt; the brain already strips the worst symbols before speaking |

## Other free and unlimited ways

Every option below is free, has no usage limits and runs on your own hardware. The robot never changes: they only replace one block of the brain.

### LM Studio — models with a mouse instead of a terminal

[LM Studio](https://lmstudio.ai) is a desktop app for Windows, macOS and Linux: you search, download and try models in a chat window, and it can serve them to other programs. It is free for personal use and, since July 2025, for use at work too; the app itself is not open source.

1. Install LM Studio and download a model from its search page (the same size advice applies).
2. Start its local server — from the app's developer/server page, or in a terminal with `lms server start`. By default it listens at `http://localhost:1234/v1`.
3. In the brain's environment install the extra client, then point the brain at LM Studio, using the model name LM Studio shows:

   ```bash
   pip install openai
   ```

   ```bash
   $env:BUDDY_OPENAI_URL = "http://localhost:1234/v1"
   ```

   ```bash
   $env:BUDDY_MODEL = "<model name from LM Studio>"
   ```

That is the general rule: **any program that offers an "OpenAI-compatible" server works with `brain.py`** through `BUDDY_OPENAI_URL`. The API key the client asks for is ignored by local servers; the brain fills in a placeholder.

### Jan — an open-source desktop app

[Jan](https://github.com/janhq/jan) (Apache-2.0) is an open-source alternative to LM Studio: chat window, model downloads, and a local OpenAI-compatible server on `localhost:1337` that you switch on in its settings. Use it with `BUDDY_OPENAI_URL=http://localhost:1337/v1`, as above.

### llama.cpp — the engine underneath

[llama.cpp](https://github.com/ggml-org/llama.cpp) (MIT) is the engine many local AI apps are built on. Using it directly gives you the most control and the smallest footprint, at the cost of more settings. Download a ready-made build for your system from its releases page, then start its server with a model straight from Hugging Face:

```bash
llama-server -hf bartowski/Llama-3.2-3B-Instruct-GGUF:Q4_K_M --port 8080
```

and set `BUDDY_OPENAI_URL=http://localhost:8080/v1`. Always pass `--port` yourself: the default port has changed between versions. Models come as single `.gguf` files; `Q4_K_M` is a good balance of size and quality.

### Home Assistant Assist — if you run a smart home

[Home Assistant](https://www.home-assistant.io/voice_control/) has a complete local voice pipeline called **Assist**: speech-to-text (Whisper, or *Speech-to-Phrase* for fixed commands), text-to-speech (Piper) and, through its [Ollama integration](https://www.home-assistant.io/integrations/ollama/), a local language model as the conversation agent that can also control your home. Your robot then becomes one more voice device in the house. It needs a machine that is always on (a mini PC or a Raspberry Pi 5 running Home Assistant) and is the most work to set up of these options; in return it is maintained by a large community.

### A brain on a Raspberry Pi 5 or an old laptop

The brain does not have to be your main PC. Ollama, Whisper and Piper all run on Linux, including a **Raspberry Pi 5 (8 GB)**. Expect only the smallest models (around 1–1.5 billion parameters, such as `qwen2.5:1.5b` or `llama3.2:1b`) to answer at a usable speed, with `tiny.en` for speech. An old laptop with 8 GB of RAM does better than a Pi, and costs nothing if it is already in a drawer.

Install everything as in steps 1–3, start `brain.py` there and put that machine's address in the sketch. If Ollama runs on a *different* computer from `brain.py`, set `OLLAMA_HOST=0.0.0.0` on the Ollama computer (and restart Ollama) so it accepts connections from your network, and set `OLLAMA_HOST=http://<its address>:11434` where `brain.py` runs — on your home network only.

### No language model: a fixed-command brain

Not every desk buddy needs to chat. A robot that understands twenty phrases perfectly — *"good morning"*, *"what time is it"*, *"start a 25-minute timer"*, *"dance"* — answers instantly, never says anything strange and needs no big download. Two ways to build one:

- **On the PC, with Vosk.** [Vosk](https://github.com/alphacep/vosk-api) (Apache-2.0) is an offline speech recogniser with small models (around 50 MB) for many languages, and it can be limited to a list of phrases, which makes it very accurate for commands. Replace the language model in `brain.py` with a dictionary of phrases → replies, and keep Piper for the voice.
- **On the robot itself, with ESP-SR.** Espressif's [ESP-SR](https://github.com/espressif/esp-sr) runs a wake word (WakeNet) and spoken commands (MultiNet) directly on an ESP32-S3 — no PC at all. Its licence allows free use only on Espressif chips. Answers are then pre-recorded sounds or beeps.

You can also combine them: fixed commands for the things the robot must always get right (timers, volume, *"go to sleep"*), and the language model for everything else.

## Free local building blocks

| Role | Project | Licence | Notes |
|------|---------|---------|-------|
| Language model server | [Ollama](https://github.com/ollama/ollama) | MIT | Runs open models locally. Its OpenAI-compatible API lives at `http://localhost:11434/v1/`; clients need an API-key field but any placeholder works locally. |
| Language model server | [llama.cpp](https://github.com/ggml-org/llama.cpp) | MIT | The engine behind many local apps; `llama-server` is OpenAI-compatible. |
| Language model app | [LM Studio](https://lmstudio.ai) · [Jan](https://github.com/janhq/jan) | Proprietary, free · Apache-2.0 | Desktop apps with a local server. |
| Speech-to-text | [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | MIT | Runs on CPU or GPU (CUDA, Vulkan, Metal…). Models: tiny 75 MiB, base 142 MiB, small 466 MiB, medium 1.5 GiB, large 2.9 GiB. |
| Speech-to-text | [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | MIT | The same Whisper models from Python; used by `brain.py`. |
| Speech-to-text (commands) | [Vosk](https://github.com/alphacep/vosk-api) | Apache-2.0 | Small offline models; can be restricted to a phrase list. |
| Text-to-speech | [Piper](https://github.com/OHF-Voice/piper1-gpl) | GPL-3.0 | Fast; used by `brain.py`. The original `rhasspy/piper` repository was archived in October 2025 and development continues here. |
| Text-to-speech | [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) | Apache-2.0 | Small, very natural-sounding voices; heavier to install than Piper. |
| Wake word | [openWakeWord](https://github.com/dscripka/openWakeWord) | Code Apache-2.0; pre-trained models CC BY-NC-SA 4.0 | Runs on a PC or Pi, not on microcontrollers. The included models are **non-commercial**. |
| Wake word & commands on the robot | [ESP-SR](https://github.com/espressif/esp-sr) | Espressif MIT (Espressif chips only) | WakeNet and MultiNet on the ESP32-S3. |

> **Note:** check every licence before you sell a robot or a product built on these tools. Open source does not always mean "free for commercial use" — openWakeWord's pre-trained models and some model weights are the clearest examples. Piper is GPL-3.0: fine for your own robot, but read what it requires before you distribute a product that includes it.

## Privacy and safety

- Run the brain on your **home network only**; never forward its port on your router or expose it to the internet. It has no password.
- Keep a physical way to mute the microphone (a switch, or covering the touch pad).
- The brain keeps the conversation in memory only while it runs and writes nothing to disk. Log nothing you would not want stored.
- After the one-time downloads everything runs on your hardware: unplug the internet and the robot keeps talking.

## Sources

- Ollama download and model library (sizes): https://ollama.com/download · https://ollama.com/library
- Ollama FAQ (5-minute keep-alive default, `OLLAMA_KEEP_ALIVE`, `OLLAMA_MODELS`, `OLLAMA_HOST`): https://docs.ollama.com/faq
- Ollama OpenAI-compatible API: https://docs.ollama.com/api/openai-compatibility
- Ollama Python library (`chat`, streaming, `keep_alive`): https://github.com/ollama/ollama-python
- faster-whisper (MIT, VAD filter, NumPy input): https://github.com/SYSTRAN/faster-whisper
- Piper Python API and voice download; archive notice and new home: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/API_PYTHON.md · https://github.com/rhasspy/piper
- whisper.cpp licence, backends and model sizes: https://github.com/ggml-org/whisper.cpp
- websockets (asyncio server and client): https://websockets.readthedocs.io/
- ESP32 Arduino core `ESP_I2S` library: https://docs.espressif.com/projects/arduino-esp32/en/latest/api/i2s.html
- arduinoWebSockets: https://github.com/Links2004/arduinoWebSockets · ArduinoJson: https://arduinojson.org/
- Model licences: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct · https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- LM Studio OpenAI-compatible server and free use at work: https://lmstudio.ai/docs/developer/openai-compat · https://lmstudio.ai/blog/free-for-work
- llama.cpp server: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
- Jan local API server: https://github.com/janhq/jan
- Home Assistant local voice and Ollama integration: https://www.home-assistant.io/voice_control/ · https://www.home-assistant.io/integrations/ollama/
- Vosk: https://github.com/alphacep/vosk-api · ESP-SR: https://github.com/espressif/esp-sr
- Kokoro-82M (Apache-2.0): https://huggingface.co/hexgrad/Kokoro-82M
- openWakeWord licences and hardware notes: https://github.com/dscripka/openWakeWord
