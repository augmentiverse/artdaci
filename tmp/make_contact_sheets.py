from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

src = Path(r"tmp\prototype-enriched-render")
files = sorted(src.glob("page-*.png"))
for group_no in range(0, len(files), 4):
    group = files[group_no:group_no+4]
    thumb_w, thumb_h = 700, 990
    sheet = Image.new("RGB", (thumb_w * 2 + 60, thumb_h * 2 + 90), "#d5d9dc")
    draw = ImageDraw.Draw(sheet)
    for idx, f in enumerate(group):
        with Image.open(f) as im:
            page = ImageOps.contain(im.convert("RGB"), (thumb_w, thumb_h))
            x = 20 + (idx % 2) * (thumb_w + 20)
            y = 35 + (idx // 2) * (thumb_h + 20)
            sheet.paste(page, (x, y))
            draw.text((x, 8 + (idx // 2) * (thumb_h + 20)), f.stem, fill="black")
    sheet.save(src / f"contact-{group_no//4+1:02d}.jpg", quality=88)
