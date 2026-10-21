#!/usr/bin/env python3
"""Generate the pre-BAT control PDF for ARTDACI's 44 retained QR assets."""

from __future__ import annotations

import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "content" / "legacy-qr-destinations.json"
QR_DIR = ROOT / "assets" / "qr"
OUTPUT = ROOT / "docs" / "production" / "ARTDACI_Legacy_QR_Control_PreBAT.pdf"


def human_label(filename: str) -> str:
    return filename.removesuffix(".png").replace("-", " ").title()


def load_entries() -> list[tuple[str, str, str]]:
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    entries = [
        (filename, url, "ARTDACI")
        for filename, url in config["destinations"].items()
    ]
    entries.extend(
        (filename, url, "External / WorldLabs")
        for filename, url in config["externalDestinations"].items()
    )
    entries.sort(key=lambda item: item[0])
    if len(entries) != 44:
        raise ValueError(f"Expected 44 legacy QR entries, found {len(entries)}")
    missing = [filename for filename, _, _ in entries if not (QR_DIR / filename).is_file()]
    if missing:
        raise FileNotFoundError(f"Missing QR assets: {missing}")
    return entries


def build_pdf() -> None:
    entries = load_entries()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    page_width, page_height = A4
    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=10 * mm,
        rightMargin=10 * mm,
        topMargin=10 * mm,
        bottomMargin=10 * mm,
        title="ARTDACI - 44 retained QR codes - pre-BAT control",
        author="ARTDACI",
    )

    title = ParagraphStyle(
        "Title", fontName="Helvetica-Bold", fontSize=17, leading=20,
        textColor=colors.HexColor("#10233b"), spaceAfter=3 * mm,
    )
    intro = ParagraphStyle(
        "Intro", fontName="Helvetica", fontSize=8.5, leading=11,
        textColor=colors.HexColor("#52657b"), spaceAfter=5 * mm,
    )
    label = ParagraphStyle(
        "Label", fontName="Helvetica-Bold", fontSize=8.5, leading=10,
        textColor=colors.HexColor("#10233b"),
    )
    filename_style = ParagraphStyle(
        "Filename", fontName="Helvetica", fontSize=6.5, leading=8,
        textColor=colors.HexColor("#967025"),
    )
    url_style = ParagraphStyle(
        "Url", fontName="Courier", fontSize=5.5, leading=6.6,
        textColor=colors.HexColor("#1a4d7a"), splitLongWords=True,
    )

    story = [
        Paragraph("ARTDACI - 44 retained QR codes", title),
        Paragraph(
            "Pre-BAT control sheet. Each image below was regenerated from the exact destination printed beside it. "
            "The three WorldLabs destinations are explicitly identified; all other entries use artdaci.com.",
            intro,
        ),
    ]

    cards = []
    for filename, url, scope in entries:
        qr = Image(str(QR_DIR / filename), width=29 * mm, height=29 * mm)
        text = [
            Paragraph(human_label(filename), label),
            Paragraph(filename, filename_style),
            Paragraph(scope, filename_style),
            Spacer(1, 1.5 * mm),
            Paragraph(url, url_style),
        ]
        card = Table([[qr, text]], colWidths=[33 * mm, 54 * mm], rowHeights=[39 * mm])
        card.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 2 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
            ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#aeb9c6")),
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ]))
        cards.append(card)

    rows = [cards[index:index + 2] for index in range(0, len(cards), 2)]
    if len(rows[-1]) == 1:
        rows[-1].append("")
    grid = Table(rows, colWidths=[92 * mm, 92 * mm], hAlign="CENTER", repeatRows=0)
    grid.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 1.5 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 1.5 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 1.5 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5 * mm),
    ]))
    story.append(grid)
    document.build(story)


if __name__ == "__main__":
    build_pdf()
    print(OUTPUT)
