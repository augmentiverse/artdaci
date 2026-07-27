from pathlib import Path

import qrcode


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "qr"
BASE = "https://augmentiverse.github.io/artdaci/"

TARGETS = {
    "mona-lisa-audio-en.png": "assets/paintings/mona-lisa/audio-video/mona-lisa-en.mp3",
    "mona-lisa-audio-fr.png": "assets/paintings/mona-lisa/audio-video/mona-lisa-fr.mp3",
    "van-gogh-audio-en.png": "assets/paintings/van-gogh/audio-video/van-gogh_self-portrait_en.mp3",
    "van-gogh-audio-fr.png": "assets/paintings/van-gogh/audio-video/van-gogh_self-portrait_fr.mp3",
    "van-gogh-bedroom-audio-en.png": "assets/paintings/van-gogh-bedroom/audio-video/Van-Gogh_Bedroom_en.mp3",
    "van-gogh-bedroom-audio-fr.png": "assets/paintings/van-gogh-bedroom/audio-video/Van-Gogh_la-chambre_fr.mp3",
    "vermeer-girl-pearl-ar-en.png": "ar.html?painting=vermeer-girl-with-a-pearl-earring&lang=en",
    "vermeer-girl-pearl-ar-fr.png": "ar.html?painting=vermeer-girl-with-a-pearl-earring&lang=fr",
    "vermeer-girl-pearl-space-en.png": "space.html?painting=vermeer-girl-with-a-pearl-earring&lang=en",
    "vermeer-girl-pearl-space-fr.png": "space.html?painting=vermeer-girl-with-a-pearl-earring&lang=fr",
    "vermeer-girl-pearl-audio-en.png": "assets/paintings/vermeer_Girl-with-a-Pearl-Earring/audio-video/vermeer_Girl-with-a-Pearl-Earring_en.mp3",
    "vermeer-girl-pearl-audio-fr.png": "assets/paintings/vermeer_Girl-with-a-Pearl-Earring/audio-video/vermeer_Girl-with-a-Pearl-Earring_fr.mp3",
    "multimedia-audio-en.png": "assets/paintings/mona-lisa/audio-video/mona-lisa-en.mp3",
    "multimedia-audio-fr.png": "assets/paintings/mona-lisa/audio-video/mona-lisa-fr.mp3",
    "multimedia-video-en.png": "gallery-vr.html?lang=en&room=cinema",
    "multimedia-video-fr.png": "gallery-vr.html?lang=fr&room=cinema",
    "multimedia-ar-en.png": "ar.html?painting=mona-lisa&lang=en",
    "multimedia-ar-fr.png": "ar.html?painting=mona-lisa&lang=fr",
    "multimedia-3d-en.png": "space.html?painting=mona-lisa&lang=en",
    "multimedia-3d-fr.png": "space.html?painting=mona-lisa&lang=fr",
    "multimedia-gallery-en.png": "gallery-vr.html?lang=en",
    "multimedia-gallery-fr.png": "gallery-vr.html?lang=fr",
    "multimedia-book-en.png": "book-3d.html?lang=en",
    "multimedia-book-fr.png": "book-3d.html?lang=fr",
    "multimedia-bedroom-world.png": "https://marble.worldlabs.ai/worldvr/48b7eb17-56e4-4873-a253-fa13ed516fae",
    "multimedia-leonardo-world.png": "https://marble.worldlabs.ai/worldvr/862ab5f6-8608-469c-a840-8cb10f3859ae",
}


OUTPUT.mkdir(parents=True, exist_ok=True)
for filename, path in TARGETS.items():
    qr = qrcode.QRCode(version=None, box_size=10, border=4)
    qr.add_data(path if path.startswith("https://") else BASE + path)
    qr.make(fit=True)
    qr.make_image(fill_color="black", back_color="white").save(OUTPUT / filename)
