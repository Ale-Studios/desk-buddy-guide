# 10 · Connecting to a PC (local AI brain)

Small boards cannot run a language model. The common pattern: **the robot is the body, your computer is the brain** — and everything can stay on your own network, free, with no cloud.

```
ROBOT (ESP32)                         PC on the same Wi-Fi
mic audio   ── WebSocket ──>   speech-to-text  (e.g. Whisper)
                                       │
                                language model  (e.g. Ollama)
                                       │
speaker     <── audio ──────   text-to-speech  (e.g. Piper, Kokoro)
face/servos <── commands ───   {"face":"happy","look":[10,-5]}
```

## Steps

1. **Pick a link:** WebSocket over Wi-Fi (most flexible), MQTT (many devices), or USB serial (simplest, wired).
2. **Define a small protocol:** JSON commands for face and servos; audio frames for voice.
3. **PC side:** a small server (Python or Node) chaining speech-to-text → model → text-to-speech.
4. **Hide the latency:** show the "thinking" face and small movements while the PC works.
5. **Privacy:** bind the server to your local network only.

## Free local building blocks

| Role | Options |
|------|---------|
| Speech-to-text | Whisper / whisper.cpp, Vosk |
| Language model | Ollama, llama.cpp |
| Text-to-speech | Piper, Kokoro |
| Wake word | openWakeWord |

A full worked example is planned.
