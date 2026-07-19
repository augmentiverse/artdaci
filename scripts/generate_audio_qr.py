from pathlib import Path

import qrcode


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "qr"
BASE = "https://augmentiverse.github.io/artdaci/"

TARGETS = {
    "mona-lisa-audio-en.png": "assets/paintings/mona-lisa/mona-lisa-en.mp3",
    "mona-lisa-audio-fr.png": "assets/paintings/mona-lisa/mona-lisa-fr.mp3",
    "van-gogh-bedroom-audio-en.png": "assets/paintings/van-gogh-bedroom/audio-video/Van-Gogh_Bedroom_en.m4a",
    "van-gogh-bedroom-audio-fr.png": "assets/paintings/van-gogh-bedroom/audio-video/Van-Gogh_la-chambre_fr.m4a",
    "vermeer-girl-pearl-ar-en.png": "ar.html?painting=vermeer-girl-with-a-pearl-earring&lang=en",
    "vermeer-girl-pearl-ar-fr.png": "ar.html?painting=vermeer-girl-with-a-pearl-earring&lang=fr",
    "vermeer-girl-pearl-space-en.png": "space.html?painting=vermeer-girl-with-a-pearl-earring&lang=en",
    "vermeer-girl-pearl-space-fr.png": "space.html?painting=vermeer-girl-with-a-pearl-earring&lang=fr",
    "vermeer-girl-pearl-audio-en.png": "assets/paintings/vermeer_Girl-with-a-Pearl-Earring/audio-video/vermeer_Girl-with-a-Pearl-Earring.mp3",
    "vermeer-girl-pearl-audio-fr.png": "assets/paintings/vermeer_Girl-with-a-Pearl-Earring/audio-video/vermeer_Girl-with-a-Pearl-Earring_fr.mp3",
}


OUTPUT.mkdir(parents=True, exist_ok=True)
for filename, path in TARGETS.items():
    qr = qrcode.QRCode(version=None, box_size=10, border=4)
    qr.add_data(BASE + path)
    qr.make(fit=True)
    qr.make_image(fill_color="black", back_color="white").save(OUTPUT / filename)
