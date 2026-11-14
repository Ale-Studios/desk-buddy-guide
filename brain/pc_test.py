"""Talk to brain.py from your computer, before any robot exists.

    python pc_test.py           type a message, hear the answer
    python pc_test.py --mic     speak into the PC microphone, exactly like the robot will

It pretends to be the robot: same WebSocket, same messages, same audio format.
MIT licence.
"""
import asyncio
import json
import sys

import numpy as np
import sounddevice as sd
from websockets.asyncio.client import connect

URL = sys.argv[sys.argv.index("--url") + 1] if "--url" in sys.argv else "ws://localhost:8765"
MIC = "--mic" in sys.argv


async def receive_turn(ws):
    """Show faces, play each spoken sentence, return when the brain goes back to idle."""
    audio, rate = bytearray(), 16000
    async for msg in ws:
        if isinstance(msg, bytes):
            audio += msg
            continue
        cmd = json.loads(msg)
        if "face" in cmd:
            print(f"   [face: {cmd['face']}]")
        if cmd.get("say") == "audio-start":
            audio, rate = bytearray(), cmd.get("rate", 16000)
        elif cmd.get("say") == "audio-end":
            sd.play(np.frombuffer(bytes(audio), dtype=np.int16), rate)
            await asyncio.to_thread(sd.wait)
        if cmd.get("face") == "idle":
            return


async def typed():
    async with connect(URL, max_size=None) as ws:
        print("Connected. Type a message (empty line to quit).")
        while True:
            text = (await asyncio.to_thread(input, "you> ")).strip()
            if not text:
                return
            await ws.send(json.dumps({"event": "text", "text": text}))
            await receive_turn(ws)


async def spoken():
    loop = asyncio.get_running_loop()
    frames = asyncio.Queue()
    talking = {"on": False}

    def on_audio(indata, n, t, status):
        if not talking["on"]:                      # like the robot: mic muted while it speaks
            loop.call_soon_threadsafe(frames.put_nowait, bytes(indata))

    async with connect(URL, max_size=None) as ws:
        async def pump():
            while True:
                await ws.send(await frames.get())

        async def listen():
            audio, rate = bytearray(), 16000
            async for msg in ws:
                if isinstance(msg, bytes):
                    audio += msg
                    continue
                cmd = json.loads(msg)
                if "face" in cmd:
                    print(f"   [face: {cmd['face']}]")
                if cmd.get("face") in ("thinking", "talking"):
                    talking["on"] = True
                if cmd.get("say") == "audio-start":
                    audio, rate = bytearray(), cmd.get("rate", 16000)
                elif cmd.get("say") == "audio-end":
                    sd.play(np.frombuffer(bytes(audio), dtype=np.int16), rate)
                    await asyncio.to_thread(sd.wait)
                if cmd.get("face") == "idle":
                    talking["on"] = False

        with sd.RawInputStream(samplerate=16000, channels=1, dtype="int16", blocksize=512, callback=on_audio):
            print("Connected. Speak (Ctrl+C to quit).")
            await asyncio.gather(pump(), listen())


if __name__ == "__main__":
    try:
        asyncio.run(spoken() if MIC else typed())
    except KeyboardInterrupt:
        pass
