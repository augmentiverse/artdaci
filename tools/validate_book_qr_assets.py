#!/usr/bin/env python3
"""Decode the generated PNGs and compare real payloads with canonical data."""

from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse

import cv2


ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "content/media-manifests/catalog.json"
LEGACY_PATH = ROOT / "content/legacy-qr-destinations.json"
OUTPUT_DIR = ROOT / "assets/qr"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def expected_payloads() -> dict[Path, str]:
    catalog = load_json(CATALOG_PATH)
    expected: dict[Path, str] = {}
    for artwork in catalog["artworks"]:
        if artwork.get("status") != "active":
            continue
        manifest = load_json(CATALOG_PATH.parent / artwork["manifest"]["path"])
        expected[OUTPUT_DIR / "artworks" / f"{artwork['id']}.png"] = manifest["pageUrl"]
    legacy = load_json(LEGACY_PATH)
    for group in ("destinations", "externalDestinations"):
        for filename, url in legacy[group].items():
            expected[OUTPUT_DIR / filename] = url
    return expected


def main() -> None:
    detector = cv2.QRCodeDetector()
    failures: list[str] = []
    decoded_count = 0
    for path, expected in expected_payloads().items():
        image = cv2.imread(str(path))
        if image is None:
            failures.append(f"missing: {path.relative_to(ROOT)}")
            continue
        decoded, _, _ = detector.detectAndDecode(image)
        if not decoded:
            failures.append(f"undecodable: {path.relative_to(ROOT)}")
            continue
        decoded_count += 1
        if decoded != expected:
            failures.append(
                f"mismatch: {path.relative_to(ROOT)} expected={expected!r} decoded={decoded!r}"
            )
        host = urlparse(decoded).netloc.lower()
        if any(value in host for value in ("github.io", "vercel.app", "localhost", "127.0.0.1")):
            failures.append(f"forbidden host: {path.relative_to(ROOT)} -> {decoded}")

    if failures:
        raise SystemExit("\n".join(failures))
    print(f"Decoded and verified {decoded_count}/{len(expected_payloads())} QR PNG payloads.")


if __name__ == "__main__":
    main()
