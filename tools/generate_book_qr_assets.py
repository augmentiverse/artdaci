#!/usr/bin/env python3
"""Generate all reader-facing ARTDACI QR assets from canonical project data."""

from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse

import qrcode
from qrcode.constants import ERROR_CORRECT_M


ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "content/media-manifests/catalog.json"
LEGACY_PATH = ROOT / "content/legacy-qr-destinations.json"
OUTPUT_DIR = ROOT / "assets/qr"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def assert_reader_url(url: str, *, allow_external: bool = False) -> None:
    parsed = urlparse(url)
    if parsed.scheme != "https":
        raise ValueError(f"QR destination must use HTTPS: {url}")
    if not allow_external and parsed.netloc != "artdaci.com":
        raise ValueError(f"Artwork QR destination must use artdaci.com: {url}")
    forbidden = ("github.io", "vercel.app", "localhost", "127.0.0.1")
    if any(value in parsed.netloc.lower() for value in forbidden):
        raise ValueError(f"Forbidden QR destination: {url}")


def write_qr(path: Path, url: str) -> None:
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,
        box_size=24,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(fill_color="black", back_color="white")
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=False)


def artwork_destinations() -> dict[str, str]:
    catalog = load_json(CATALOG_PATH)
    active = [item for item in catalog["artworks"] if item.get("status") == "active"]
    if len(active) != 24:
        raise ValueError(f"Expected 24 active artworks, found {len(active)}")

    destinations: dict[str, str] = {}
    for artwork in active:
        manifest_path = CATALOG_PATH.parent / artwork["manifest"]["path"]
        manifest = load_json(manifest_path)
        if manifest.get("id") != artwork["id"]:
            raise ValueError(f"Manifest identity mismatch for {artwork['id']}")
        url = manifest["pageUrl"]
        assert_reader_url(url)
        destinations[artwork["id"]] = url
    return destinations


def main() -> None:
    generated = 0
    for artwork_id, url in artwork_destinations().items():
        write_qr(OUTPUT_DIR / "artworks" / f"{artwork_id}.png", url)
        generated += 1

    legacy = load_json(LEGACY_PATH)
    for filename, url in legacy["destinations"].items():
        assert_reader_url(url)
        write_qr(OUTPUT_DIR / filename, url)
        generated += 1
    for filename, url in legacy["externalDestinations"].items():
        assert_reader_url(url, allow_external=True)
        write_qr(OUTPUT_DIR / filename, url)
        generated += 1

    print(f"Generated {generated} QR codes ({len(artwork_destinations())} artwork, {generated - 24} retained/general).")


if __name__ == "__main__":
    main()
