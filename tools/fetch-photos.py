"""Downloads the openly licensed component photos from Wikimedia Commons and
records licence + author for each in site/photos/credits.json.

Licence and author come straight from the Commons API (extmetadata), so the
credits shown on the site always match the file page.
Run: python -I tools/fetch-photos.py
"""
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "site" / "photos"
UA = {"User-Agent": "DeskBuddyGuide/1.0 (open-source guide; photo credits)"}

# Rejected after viewing: N20 (photo shows brackets only), USB supply (disassembled).
# part id -> (Commons file name, how closely it matches the part)
FILES = {
    "esp32": ("ESP32 Dev Board.jpg", "A typical ESP32 development board"),
    "esp32s3": ("ESP32-S3 on paper.jpg", "An ESP32-S3 development board"),
    "pizero": ("Raspberry Pi Zero 2 W -- 2024 -- 0012.jpg", None),
    "pi5": ("Raspberry Pi 5.jpg", None),
    "nano": ("Arduino Nano on table.jpg", None),
    "sg90": ("Tower Pro SG90 micro servo motor.jpg", None),
    "tb6612": ("TB6612FNG.jpg", None),
    "hcsr04": ("HC SR04 Ultrasonic Module.jpg", None),
    "ov2640": ("ESP32-CAM.jpg", "ESP32-CAM board with its OV2640 camera"),
    "speaker": ("SparkFun speaker---05w-8-ohm 16280234761 o.jpg", "A small 0.5 W 8 Ω speaker"),
    "tp4056": ("TP4056 board P1089956.jpg", None),
    "18650": ("18650 and 21700 lithium ion battery cell.jpg", "An 18650 cell next to a larger 21700"),
    "lipo": ("Nokia Lithium Polymer battery, BP-6M-6023.jpg", "A single-cell lithium-polymer battery"),
    "picam3": ("Raspberry Pi Camera Module v2 with ribbon.jpg", "Shown: Camera Module v2 (same size and connector as v3)"),
    "matrix": ("LED Matrix - Dual Color - Medium (10295081466).jpg", "A bare 8×8 LED matrix (the MAX7219 module adds a driver board behind it)"),
}

strip = lambda s: re.sub(r"<[^>]+>", "", s or "").replace("\n", " ").strip()


def get(url, tries=6):
    # Commons rate-limits bursts (HTTP 429): back off and retry
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == tries - 1:
                raise
            time.sleep(10 * (i + 1))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    credits = []
    for pid, (name, note) in FILES.items():
        q = urllib.parse.urlencode({"action": "query", "titles": "File:" + name, "prop": "imageinfo",
                                    "iiprop": "url|extmetadata", "iiurlwidth": 900, "format": "json"})
        data = json.loads(get("https://commons.wikimedia.org/w/api.php?" + q))
        page = next(iter(data["query"]["pages"].values()))
        if "imageinfo" not in page:
            print(pid, "NOT FOUND", name)
            continue
        info = page["imageinfo"][0]
        meta = info["extmetadata"]
        (OUT / f"{pid}.jpg").write_bytes(get(info["thumburl"]))
        entry = {
            "id": pid,
            "file": "File:" + name,
            "page": info["descriptionurl"],
            "license": strip(meta.get("LicenseShortName", {}).get("value")),
            "licenseUrl": strip(meta.get("LicenseUrl", {}).get("value")),
            "artist": strip(meta.get("Artist", {}).get("value")),
            "note": note,
        }
        credits.append(entry)
        print(pid, "|", entry["license"], "|", entry["artist"][:50])
        time.sleep(4)
    (OUT / "credits.json").write_text(json.dumps(credits, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
