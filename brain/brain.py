"""Desk buddy brain: a fully local voice loop for a robot on your Wi-Fi.

    robot mic --16 kHz PCM--> [ speech-to-text ] -> [ language model ] -> [ text-to-speech ] --PCM--> robot speaker
                              faster-whisper        Ollama (or any          Piper
                                                    OpenAI-compatible
                                                    local server)

Everything runs on this computer. Nothing is sent to the internet after the
one-time model downloads. Chapter 10 of the Desk Buddy Guide explains every
part: docs/10-connect-to-pc.md

Run:  python brain.py
Settings are environment variables (see the CONFIG block below).
MIT licence.
"""
import asyncio
import collections
import json
import os
import re
import time

import numpy as np
from faster_whisper import WhisperModel
from piper import PiperVoice
from websockets.asyncio.server import serve

# ---------------------------------------------------------------- CONFIG
HOST = os.environ.get("BUDDY_HOST", "0.0.0.0")          # 0.0.0.0 = every network card of this PC
PORT = int(os.environ.get("BUDDY_PORT", "8765"))
MODEL = os.environ.get("BUDDY_MODEL", "llama3.2:3b")      # any model you have pulled
OPENAI_URL = os.environ.get("BUDDY_OPENAI_URL", "")      # e.g. http://localhost:1234/v1 for LM Studio
WHISPER = os.environ.get("BUDDY_WHISPER", "base.en")     # tiny.en, base.en, small.en, or base/small for other languages
LANGUAGE = os.environ.get("BUDDY_LANGUAGE", "en")        # what you speak (Whisper language code)
VOICE = os.environ.get("BUDDY_VOICE", "en_US-lessac-medium.onnx")
NAME = os.environ.get("BUDDY_NAME", "Buddy")

MIC_RATE = 16000        # the robot sends 16 kHz, 16-bit, mono PCM
THRESHOLD = int(os.environ.get("BUDDY_THRESHOLD", "600"))  # loudness that counts as speech; raise it in a noisy room
SILENCE_MS = 700        # this much quiet after speech = you finished talking
MIN_SPEECH_MS = 300     # ignore shorter blips (a cough, a click)
MAX_SPEECH_MS = 15000   # stop listening after 15 s no matter what
PREROLL_FRAMES = 8      # keep a little audio from before the first loud frame
MAX_TURNS = 8           # how many past exchanges the model remembers

SYSTEM = {
    "role": "system",
    "content": (
        f"You are {NAME}, a small, friendly robot that lives on a desk. "
        "Your words are spoken aloud by a speaker, so answer in one to three short sentences "
        "of plain spoken language: no lists, no Markdown, no emojis, no code. "
        "Reply in the language the user speaks. If you are not sure about a fact, say so."
    ),
}

# ---------------------------------------------------------------- MODELS (loaded once)
print("Loading speech-to-text …")
stt = WhisperModel(WHISPER, device="cpu", compute_type="int8")
print("Loading voice …")
voice = PiperVoice.load(VOICE)


def warm_up():
    """Load the language model now, so the first question doesn't wait for it."""
    if OPENAI_URL:
        return
    import ollama
    ollama.chat(model=MODEL, messages=[], keep_alive="30m")  # empty messages = just load it


def stream_reply(messages):
    """Yield the reply as it is written, piece by piece."""
    if OPENAI_URL:  # LM Studio, llama.cpp's llama-server, Jan, LocalAI, KoboldCpp …
        from openai import OpenAI
        client = OpenAI(base_url=OPENAI_URL, api_key="local")  # the key is ignored locally but must not be empty
        for event in client.chat.completions.create(model=MODEL, messages=messages, stream=True):
            if event.choices and event.choices[0].delta.content:
                yield event.choices[0].delta.content
    else:
        import ollama
        for chunk in ollama.chat(model=MODEL, messages=messages, stream=True, keep_alive="30m"):
            yield chunk["message"]["content"]


# ---------------------------------------------------------------- HELPERS
SENTENCE_END = re.compile(r"(?<=[.!?…])\s+")
NOT_SPOKEN = re.compile(r"[*_#`>|~]|[\U0001F000-\U0001FAFF☀-➿️]")


def transcribe(pcm: bytes) -> str:
    audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
    segments, _ = stt.transcribe(audio, language=LANGUAGE, beam_size=1, vad_filter=True)
    return " ".join(s.text.strip() for s in segments).strip()


def synthesize(text: str):
    chunks = list(voice.synthesize(text))
    if not chunks:
        return b"", 16000
    return b"".join(c.audio_int16_bytes for c in chunks), chunks[0].sample_rate


async def send(ws, **command):
    await ws.send(json.dumps(command))


async def speak(ws, sentence: str):
    text = NOT_SPOKEN.sub("", sentence).strip()
    if not text:
        return
    audio, rate = await asyncio.to_thread(synthesize, text)
    await send(ws, face="talking", say="audio-start", rate=rate)
    for i in range(0, len(audio), 4096):          # small binary messages the robot can play as they arrive
        await ws.send(audio[i:i + 4096])
    await send(ws, say="audio-end")


async def reply(ws, history, text: str):
    """Ask the model, and speak each sentence as soon as it is complete."""
    print(f"you: {text}")
    history.append({"role": "user", "content": text})
    del history[:-MAX_TURNS * 2]
    await send(ws, face="thinking")

    loop = asyncio.get_running_loop()
    sentences = asyncio.Queue()

    def produce():  # runs in a worker thread so the robot link stays responsive
        full, buf = "", ""
        try:
            for piece in stream_reply([SYSTEM, *history]):
                full += piece
                buf += piece
                *done, buf = SENTENCE_END.split(buf)
                for s in done:
                    loop.call_soon_threadsafe(sentences.put_nowait, s)
            if buf.strip():
                loop.call_soon_threadsafe(sentences.put_nowait, buf)
        finally:
            loop.call_soon_threadsafe(sentences.put_nowait, None)
        return full

    writer = asyncio.ensure_future(asyncio.to_thread(produce))
    while (sentence := await sentences.get()) is not None:
        await speak(ws, sentence)
    full = await writer
    print(f"{NAME.lower()}: {full.strip()}")
    history.append({"role": "assistant", "content": full})


async def turn(ws, history, state, pcm=None, text=None):
    """One exchange: (transcribe) -> think -> speak. The robot's mic is ignored meanwhile."""
    started = time.perf_counter()
    try:
        if pcm is not None:
            await send(ws, face="thinking")
            text = await asyncio.to_thread(transcribe, pcm)
        if text:
            await reply(ws, history, text)
            print(f"   ({time.perf_counter() - started:.1f} s)")
    except Exception as e:  # keep the robot alive whatever happens
        print("error:", e)
        await send(ws, face="confused")
    finally:
        await send(ws, face="idle")      # also tells test clients the turn is over
        state["busy"] = False


# ---------------------------------------------------------------- CONNECTION
async def handle(ws):
    print("robot connected:", ws.remote_address)
    history, state = [], {"busy": False}
    pcm, preroll = bytearray(), collections.deque(maxlen=PREROLL_FRAMES)
    speech_ms = silence_ms = 0.0

    async for msg in ws:
        if isinstance(msg, str):                       # JSON events
            event = json.loads(msg)
            kind = event.get("event")
            if kind == "text" and not state["busy"]:   # typed input, used by pc_test.py
                state["busy"] = True
                asyncio.ensure_future(turn(ws, history, state, text=event.get("text", "")))
            elif kind == "touch":
                await send(ws, face="happy")
            continue

        if state["busy"]:                              # don't listen to ourselves talking
            pcm.clear(); preroll.clear(); speech_ms = silence_ms = 0.0
            continue

        samples = np.frombuffer(msg, dtype=np.int16)
        if not len(samples):
            continue
        ms = len(samples) * 1000 / MIC_RATE
        loud = np.sqrt(np.mean(samples.astype(np.float32) ** 2)) > THRESHOLD

        if not speech_ms:                              # waiting for someone to speak
            if loud:
                pcm = bytearray(b"".join(preroll) + msg)
                speech_ms, silence_ms = ms, 0.0
                await send(ws, face="listening")
            else:
                preroll.append(msg)
            continue

        pcm += msg                                     # recording
        if loud:
            speech_ms += ms
            silence_ms = 0.0
        else:
            silence_ms += ms
        if silence_ms >= SILENCE_MS or speech_ms >= MAX_SPEECH_MS:
            if speech_ms >= MIN_SPEECH_MS:
                state["busy"] = True
                asyncio.ensure_future(turn(ws, history, state, pcm=bytes(pcm)))
            else:
                await send(ws, face="idle")
            pcm, speech_ms, silence_ms = bytearray(), 0.0, 0.0
            preroll.clear()
    print("robot disconnected")


async def main():
    print(f"Loading the language model ({MODEL}) …")
    await asyncio.to_thread(warm_up)
    async with serve(handle, HOST, PORT, max_size=None):
        print(f"{NAME}'s brain is listening on ws://{HOST}:{PORT}  (Ctrl+C to stop)")
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
