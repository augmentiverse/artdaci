#!/usr/bin/env python3
"""Creates *review-only* visual files; no original or published image is changed.
Requires Pillow. The 3 artwork pairs are shown unaltered (no guessed crops).
"""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PAIRS = {
    "lady-with-an-ermine": (
        "assets/home-gallery/leonardo-lady-with-ermine-frameless.webp",
        "assets/artists/leonardo-da-vinci/collection/the-lady-with-an-ermine-davinci.webp"),
    "belle-ferronniere": (
        "assets/home-gallery/leonardo-belle-ferronniere-frameless.webp",
        "assets/artists/leonardo-da-vinci/collection/la-belle-ferronnière-davinci.webp"),
    "pont-d-argenteuil": (
        "assets/home-gallery/monet-bridge-at-argenteuil-frameless.webp",
        "assets/artists/claude-monet/collection/le-pont-d-argenteuil-monet.webp"),
}

def tile(image):
    im = image.convert("RGB")
    im.thumbnail((430, 410), Image.Resampling.LANCZOS)
    return im

def run(output):
    output.mkdir(parents=True,exist_ok=True)
    src = ROOT / "assets/varia/artdaci-logo.png"
    with Image.open(src) as image:
        original_size = image.size
        logo = image.convert("RGBA" if "A" in image.getbands() or "transparency" in image.info else "RGB")
        logo.thumbnail((600,600), Image.Resampling.LANCZOS)
        output_logo = output / "artdaci-logo-optimized-candidate.webp"
        logo.save(output_logo,format="WEBP",lossless=True,method=6)
    data = {"logo": {"sourcePixels": original_size,"candidatePixels": logo.size,
        "sourceBytes":src.stat().st_size,"candidateBytes":output_logo.stat().st_size,
        "status":"Candidate only - verify wordmark before publication"},"artwork":{}}
    for slug,(small_path,big_path) in PAIRS.items():
        with Image.open(ROOT / small_path) as old, Image.open(ROOT / big_path) as raw:
            small=tile(old);big=tile(raw)
            sheet=Image.new("RGB",(910,480),"white")
            draw=ImageDraw.Draw(sheet)
            draw.text((18,12),"Current frameless thumbnail",fill="#20344d")
            draw.text((468,12),"Source, without any automatic crop",fill="#20344d")
            sheet.paste(small,(18+(430-small.width)//2,52+(410-small.height)//2))
            sheet.paste(big,(468+(430-big.width)//2,52+(410-big.height)//2))
            filename="review-"+slug+".jpg"
            sheet.save(output / filename,quality=89,optimize=True)
            data["artwork"][slug]={"currentPixels":old.size,"sourcePixels":raw.size,
                "reviewFile":filename,"status":"Check exact painted boundaries by eye"}
    (output/"review.json").write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(data,ensure_ascii=False,indent=2))

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--output",default="visual-review")
    args=p.parse_args()
    run(Path(args.output))
