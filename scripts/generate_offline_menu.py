#!/usr/bin/env python3
"""Generate the phone-first offline Bagno Maria menu PDF from Menu.jsx."""

from __future__ import annotations

import json
import math
import shutil
import subprocess
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
TMP_DIR = ROOT / "tmp" / "pdfs"
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_PDF = OUTPUT_DIR / "menu-bagnomaria-offline.pdf"
LOGO_SVG = ROOT / "brand" / "logo-bagnomaria.svg"
LOGO_RAW = TMP_DIR / "logo-bagnomaria-raw.png"
LOGO_PNG = TMP_DIR / "logo-bagnomaria-ink.png"
MENU_SOURCE = ROOT / "src" / "components" / "Menu.jsx"
FONDALE_SRC = ROOT / "public" / "media" / "menu-fondale.webp"
FONDALE_PRINT = TMP_DIR / "fondale-print.jpg"
DIET_ICONS = {
    "vegetarian": ROOT / "public" / "icons" / "diet-vegetarian.png",
    "vegan": ROOT / "public" / "icons" / "diet-vegan.png",
}
DIET_ICON_RATIOS = {
    "vegetarian": 241 / 256,
    "vegan": 266 / 160,
}

PAGE_W = 108 * mm
PAGE_H = 192 * mm
MARGIN_X = 9 * mm
CONTENT_W = PAGE_W - (2 * MARGIN_X)
CONTENT_TOP = PAGE_H - (29 * mm)
CONTENT_BOTTOM = 15 * mm
COVER_LOGO_SHIFT_X = 0.85 * mm
COVER_LOGO_SHIFT_Y = 1.45 * mm

INK = HexColor("#07547D")
INK_DEEP = HexColor("#033B5C")
SEA = HexColor("#1184B2")
SEA_MID = HexColor("#61BDE1")
SAND = HexColor("#FBFDFE")
WHITE = HexColor("#FFFFFF")
LINE = HexColor("#BEDCE8")

FONT_DISPLAY = "BMDisplay"
FONT_DISPLAY_ITALIC = "BMDisplayItalic"
FONT_SANS = "BMSans"
FONT_SANS_LIGHT = "BMSansLight"
FONT_SANS_BOLD = "BMSansBold"
FONT_SANS_ITALIC = "BMSansItalic"
ITEM_NAME_FONT = FONT_SANS_LIGHT
ITEM_NAME_SIZE = 9.7
ITEM_NAME_LEADING = 12.1


GROUPS = [
    ["Caffetteria"],
    ["Colazione e Frutta", "Aperitivo"],
    ["Le Frise", "I Crostoni"],
    ["Le Piadine"],
    ["I Panini"],
    ["Le Insalate"],
    ["I Primi Piatti", "Beverage"],
    ["Birre in bottiglia 33cl", "Vino, Prosecco e Champagne", "Shot"],
    ["Drink", "I Pestati"],
    ["Selezione Gin e Vodka Premium"],
]


def register_fonts() -> None:
    fonts_dir = ROOT / "fonts"
    bodoni = str(fonts_dir / "BodoniModa.ttf")
    bodoni_italic = str(fonts_dir / "BodoniModa-Italic.ttf")
    manrope = str(fonts_dir / "Manrope.ttf")
    pdfmetrics.registerFont(TTFont(FONT_DISPLAY, bodoni))
    pdfmetrics.registerFont(TTFont(FONT_DISPLAY_ITALIC, bodoni_italic))
    pdfmetrics.registerFont(TTFont(FONT_SANS, manrope))
    pdfmetrics.registerFont(TTFont(FONT_SANS_LIGHT, manrope))
    pdfmetrics.registerFont(TTFont(FONT_SANS_BOLD, manrope))
    pdfmetrics.registerFont(TTFont(FONT_SANS_ITALIC, manrope))


def extract_menu_data() -> list[dict]:
    node = Path(
        "/Users/giorgio/.cache/codex-runtimes/codex-primary-runtime/"
        "dependencies/node/bin/node"
    )
    if not node.exists():
        found = shutil.which("node")
        if not found:
            raise RuntimeError("Node.js non trovato: impossibile leggere MENU_DATA")
        node = Path(found)

    script = r"""
import fs from 'node:fs';
const source = fs.readFileSync(process.argv.at(-1), 'utf8');
const marker = 'const MENU_DATA = ';
const markerAt = source.indexOf(marker);
if (markerAt < 0) throw new Error('MENU_DATA non trovato');
const start = source.indexOf('[', markerAt + marker.length);
let depth = 0;
let quote = null;
let escaped = false;
let end = -1;
for (let i = start; i < source.length; i += 1) {
  const char = source[i];
  if (quote) {
    if (escaped) escaped = false;
    else if (char === '\\') escaped = true;
    else if (char === quote) quote = null;
    continue;
  }
  if (char === "'" || char === '"' || char === '`') {
    quote = char;
    continue;
  }
  if (char === '[') depth += 1;
  if (char === ']') {
    depth -= 1;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
if (end < 0) throw new Error('Fine MENU_DATA non trovata');
const literal = source.slice(start, end);
const data = Function(`"use strict"; return (${literal});`)();
process.stdout.write(JSON.stringify(data));
"""
    result = subprocess.run(
        [str(node), "--input-type=module", "-e", script, str(MENU_SOURCE)],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def prepare_logo() -> None:
    if not LOGO_RAW.exists():
        converter = shutil.which("rsvg-convert")
        if converter:
            subprocess.run(
                [converter, "-w", "1600", "-o", str(LOGO_RAW), str(LOGO_SVG)],
                check=True,
            )
        else:
            raise RuntimeError(
                "rsvg-convert non trovato. Genera il logo PNG manualmente:\n"
                f"  npx -y sharp-cli -i {LOGO_SVG} -o {LOGO_RAW} -- resize 1600"
            )
    image = Image.open(LOGO_RAW).convert("RGBA")
    ink = (7, 84, 125)
    colored = Image.new("RGBA", image.size, (*ink, 255))
    colored.putalpha(image.getchannel("A"))
    colored.save(LOGO_PNG, optimize=True)


def wrap_text(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    if not words:
        return []
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if pdfmetrics.stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def draw_greek_border(c: canvas.Canvas, y: float, color=SEA) -> None:
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(0.7)
    step = 17
    x = -4
    while x < PAGE_W + step:
        p = c.beginPath()
        p.moveTo(x, y)
        p.lineTo(x + 5, y)
        p.lineTo(x + 5, y + 6)
        p.lineTo(x + 13, y + 6)
        p.lineTo(x + 13, y + 2.5)
        p.lineTo(x + 10, y + 2.5)
        p.lineTo(x + 10, y)
        p.lineTo(x + step, y)
        c.drawPath(p)
        x += step
    c.restoreState()


def draw_vertical_greek_border(
    c: canvas.Canvas,
    x: float,
    y: float,
    length: float,
    direction: int,
    color=SEA,
) -> None:
    """Fregio a chiave greca verticale, rivolto verso il centro pagina."""
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(0.7)
    step = 17
    offset = 0
    while offset + step <= length:
        p = c.beginPath()
        p.moveTo(x, y + offset)
        p.lineTo(x, y + offset + 5)
        p.lineTo(x + (direction * 6), y + offset + 5)
        p.lineTo(x + (direction * 6), y + offset + 13)
        p.lineTo(x + (direction * 2.5), y + offset + 13)
        p.lineTo(x + (direction * 2.5), y + offset + 10)
        p.lineTo(x, y + offset + 10)
        p.lineTo(x, y + offset + step)
        c.drawPath(p)
        offset += step
    c.restoreState()


def draw_sun_lines(c: canvas.Canvas, cx: float, cy: float, radius: float, color=INK) -> None:
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(0.75)
    c.circle(cx, cy, radius * 0.46, stroke=1, fill=0)
    inner = radius * 0.64
    outer = radius
    for index in range(24):
        angle = math.radians(index * 15)
        c.line(
            cx + (math.cos(angle) * inner),
            cy + (math.sin(angle) * inner),
            cx + (math.cos(angle) * outer),
            cy + (math.sin(angle) * outer),
        )
    c.restoreState()


def draw_diet_icon(
    c: canvas.Canvas,
    x: float,
    y: float,
    tag: str,
    height: float = 8.2,
) -> float:
    width = height * DIET_ICON_RATIOS[tag]
    c.drawImage(
        str(DIET_ICONS[tag]),
        x,
        y,
        width,
        height,
        preserveAspectRatio=True,
        mask="auto",
    )
    return width


def prepare_fondale() -> None:
    """Ritaglia il fotogramma del fondale in verticale, pronto per la stampa."""
    if FONDALE_PRINT.exists() or not FONDALE_SRC.exists():
        return
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg:
        subprocess.run(
            [
                ffmpeg, "-y", "-v", "error", "-i", str(FONDALE_SRC),
                "-vf", "crop=ih*108/192:ih",
                str(FONDALE_PRINT),
            ],
            check=True,
        )
    else:
        img = Image.open(FONDALE_SRC)
        w, h = img.size
        target_w = int(h * 108 / 192)
        left = (w - target_w) // 2
        img.crop((left, 0, left + target_w, h)).convert("RGB").save(
            str(FONDALE_PRINT), "JPEG", quality=92
        )


def draw_sea_background(c: canvas.Canvas) -> None:
    """Fondale marino a tutta pagina, coperto da un velo bianco: tenue e leggibile."""
    if FONDALE_PRINT.exists():
        c.drawImage(str(FONDALE_PRINT), 0, 0, PAGE_W, PAGE_H, mask=None)
        c.saveState()
        c.setFillColor(SAND)
        c.setFillAlpha(0.85)  # ~15% di acqua visibile
        c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
        c.restoreState()
    else:
        c.setFillColor(SAND)
        c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)


def draw_fish(c: canvas.Canvas, x: float, y: float, size: float,
              flip: bool = False, alpha: float = 0.26) -> None:
    """Pesciolino stilizzato (corpo + coda), tenue, in tinta mare."""
    c.saveState()
    c.translate(x, y)
    if flip:
        c.scale(-1, 1)
    c.setFillColor(SEA_MID)
    c.setFillAlpha(alpha)
    s = size
    body = c.beginPath()
    body.moveTo(-0.5 * s, 0)
    body.curveTo(-0.2 * s, 0.34 * s, 0.36 * s, 0.34 * s, 0.62 * s, 0)
    body.curveTo(0.36 * s, -0.34 * s, -0.2 * s, -0.34 * s, -0.5 * s, 0)
    body.close()
    c.drawPath(body, stroke=0, fill=1)
    tail = c.beginPath()
    tail.moveTo(-0.5 * s, 0)
    tail.lineTo(-0.82 * s, 0.24 * s)
    tail.lineTo(-0.72 * s, 0)
    tail.lineTo(-0.82 * s, -0.24 * s)
    tail.close()
    c.drawPath(tail, stroke=0, fill=1)
    c.restoreState()


def draw_side_waves(c: canvas.Canvas) -> None:
    c.saveState()
    c.setStrokeColor(HexColor("#D7EBF3"))
    c.setLineWidth(0.55)
    for y in range(42, int(PAGE_H - 40), 18):
        for x, direction in [(5, 1), (PAGE_W - 5, -1)]:
            p = c.beginPath()
            p.moveTo(x, y - 6)
            p.curveTo(x + (direction * 7), y - 3, x + (direction * 7), y + 3, x, y + 6)
            c.drawPath(p)
    c.restoreState()


def draw_cover(c: canvas.Canvas, logo_ratio: float) -> None:
    c.setFillColor(SAND)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    draw_greek_border(c, PAGE_H - 13)
    draw_greek_border(c, 7)

    logo_w = 82 * mm
    logo_h = logo_w / logo_ratio
    logo_center_y = PAGE_H - (35 * mm)
    c.drawImage(
        str(LOGO_PNG),
        ((PAGE_W - logo_w) / 2) + COVER_LOGO_SHIFT_X,
        logo_center_y - (logo_h / 2) + COVER_LOGO_SHIFT_Y,
        logo_w,
        logo_h,
        preserveAspectRatio=True,
        mask="auto",
    )

    c.setFont(FONT_SANS_BOLD, 6.5)
    c.setFillColor(SEA)
    c.drawCentredString(
        PAGE_W / 2,
        logo_center_y - (logo_h / 2) - 13,
        "BAR · CUCINA · DRINK",
    )

    sun_y = PAGE_H * 0.49
    draw_sun_lines(c, PAGE_W / 2, sun_y, 72, INK)
    greek_side_length = 48 * mm
    greek_side_y = sun_y - (greek_side_length / 2)
    draw_vertical_greek_border(c, 8 * mm, greek_side_y, greek_side_length, 1)
    draw_vertical_greek_border(
        c,
        PAGE_W - (8 * mm),
        greek_side_y,
        greek_side_length,
        -1,
    )

    legend_y = 21 * mm
    vegetarian_x = PAGE_W * 0.36
    vegan_x = PAGE_W * 0.64
    vegetarian_w = 12 * DIET_ICON_RATIOS["vegetarian"]
    vegan_w = 12 * DIET_ICON_RATIOS["vegan"]
    draw_diet_icon(c, vegetarian_x - (vegetarian_w / 2), legend_y, "vegetarian", 12)
    draw_diet_icon(c, vegan_x - (vegan_w / 2), legend_y, "vegan", 12)

    c.setFont(FONT_SANS_BOLD, 6.2)
    c.setFillColor(INK_DEEP)
    c.drawCentredString(vegetarian_x, legend_y - 10, "VEGETARIANO")
    c.drawCentredString(vegan_x, legend_y - 10, "VEGANO")


def draw_page_base(c: canvas.Canvas, page_number: int, logo_ratio: float) -> None:
    draw_sea_background(c)
    draw_fish(c, PAGE_W * 0.2, PAGE_H - 34 * mm, 6 * mm)
    draw_fish(c, PAGE_W * 0.82, PAGE_H * 0.5, 5.5 * mm, flip=True)
    draw_fish(c, PAGE_W * 0.16, 30 * mm, 6 * mm)
    draw_side_waves(c)

    c.setFillColor(WHITE)
    c.setStrokeColor(HexColor("#E4F1F6"))
    c.setLineWidth(0.4)
    c.rect(
        6 * mm,
        13 * mm,
        PAGE_W - (12 * mm),
        PAGE_H - (22 * mm),
        stroke=1,
        fill=1,
    )
    draw_greek_border(c, PAGE_H - 13)

    logo_w = 39 * mm
    logo_h = logo_w / logo_ratio
    c.drawImage(
        str(LOGO_PNG),
        (PAGE_W - logo_w) / 2,
        PAGE_H - 21 * mm,
        logo_w,
        logo_h,
        preserveAspectRatio=True,
        mask="auto",
    )

    c.setFont(FONT_SANS_BOLD, 5.5)
    c.setFillColor(SEA)
    c.drawString(MARGIN_X, 8.4 * mm, "BAGNOMARIA · MENU OFFLINE")
    c.drawRightString(PAGE_W - MARGIN_X, 8.4 * mm, f"{page_number:02d}")


def draw_category_title(c: canvas.Canvas, y: float, title: str, note: str | None = None) -> float:
    size = 20
    while pdfmetrics.stringWidth(title, FONT_DISPLAY_ITALIC, size) > CONTENT_W - 34 and size > 13.5:
        size -= 0.5

    c.setFillColor(INK_DEEP)
    c.setFont(FONT_DISPLAY_ITALIC, size)
    c.drawCentredString(PAGE_W / 2, y - 2, title)
    y -= 24

    if note:
        lines = wrap_text(note, FONT_SANS_ITALIC, 6.8, CONTENT_W)
        c.setFillColor(SEA)
        c.setFont(FONT_SANS_ITALIC, 6.8)
        for line in lines:
            c.drawCentredString(PAGE_W / 2, y, line)
            y -= 8
        y -= 2
    return y


def item_height(item: dict, compact: bool = False) -> tuple[float, list[str], list[str]]:
    price = item.get("prezzo") or ""
    price_w = pdfmetrics.stringWidth(f"€ {price.replace('.', ',')}", FONT_SANS_BOLD, 9.2) if price else 0
    name_width = CONTENT_W - price_w - (10 if price else 0)
    name_lines = wrap_text(item["nome"], ITEM_NAME_FONT, ITEM_NAME_SIZE, name_width)
    desc_lines = wrap_text(item.get("desc", ""), FONT_SANS, 7.25, CONTENT_W - 2)
    if compact and not desc_lines:
        row_gap = 3.6
    elif desc_lines:
        row_gap = 8.0
    else:
        row_gap = 6.7
    height = (len(name_lines) * ITEM_NAME_LEADING) + (len(desc_lines) * 8.8 if desc_lines else 0) + row_gap
    if desc_lines:
        height += 1.5
    return height, name_lines, desc_lines


def draw_item(c: canvas.Canvas, y: float, item: dict, compact: bool = False) -> float:
    height, name_lines, desc_lines = item_height(item, compact=compact)
    price = item.get("prezzo") or ""
    display_price = f"€ {price.replace('.', ',')}" if price else ""

    c.setFont(ITEM_NAME_FONT, ITEM_NAME_SIZE)
    c.setFillColor(INK_DEEP)
    first_line_y = y
    for index, line in enumerate(name_lines):
        c.drawString(MARGIN_X, y, line)
        if index == 0 and item.get("tag"):
            name_w = pdfmetrics.stringWidth(line, ITEM_NAME_FONT, ITEM_NAME_SIZE)
            price_w = pdfmetrics.stringWidth(display_price, FONT_SANS_BOLD, 9.2) if display_price else 0
            icon_h = 8.2
            icon_w = icon_h * DIET_ICON_RATIOS[item["tag"]]
            max_icon_x = PAGE_W - MARGIN_X - price_w - icon_w - 8
            icon_x = min(MARGIN_X + name_w + 5, max_icon_x)
            draw_diet_icon(c, icon_x, y - 1.2, item["tag"], icon_h)
        y -= ITEM_NAME_LEADING

    if display_price:
        c.setFont(FONT_SANS_BOLD, 9.2)
        c.setFillColor(INK)
        c.drawRightString(PAGE_W - MARGIN_X, first_line_y, display_price)

    if desc_lines:
        c.setFont(FONT_SANS, 7.25)
        c.setFillColor(SEA)
        y -= 1.5
        for line in desc_lines:
            c.drawString(MARGIN_X + 2, y, line)
            y -= 8.8

    return first_line_y - height


def generate_pdf(menu_data: list[dict]) -> None:
    by_category = {category["categoria"]: category for category in menu_data}
    missing = [name for group in GROUPS for name in group if name not in by_category]
    if missing:
        raise ValueError(f"Categorie mancanti: {', '.join(missing)}")

    logo_image = Image.open(LOGO_PNG)
    logo_ratio = logo_image.width / logo_image.height
    c = canvas.Canvas(str(OUTPUT_PDF), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    c.setTitle("Bagnomaria - Menu offline")
    c.setAuthor("Bagnomaria")
    c.setSubject("Menu consultabile offline da smartphone")

    draw_cover(c, logo_ratio)
    c.showPage()
    page_number = 2

    for group_index, group in enumerate(GROUPS):
        compact_group = group == ["Drink", "I Pestati"]
        draw_page_base(c, page_number, logo_ratio)
        y = CONTENT_TOP

        for category_index, category_name in enumerate(group):
            category = by_category[category_name]
            if category_index and y < CONTENT_BOTTOM + 65:
                c.showPage()
                page_number += 1
                draw_page_base(c, page_number, logo_ratio)
                y = CONTENT_TOP
            elif category_index:
                y -= 10

            y = draw_category_title(c, y, category_name, category.get("nota"))

            for item in category["piatti"]:
                needed, _, _ = item_height(item, compact=compact_group)
                if y - needed < CONTENT_BOTTOM:
                    c.showPage()
                    page_number += 1
                    draw_page_base(c, page_number, logo_ratio)
                    y = CONTENT_TOP - 24
                y = draw_item(c, y, item, compact=compact_group)

        if group_index < len(GROUPS) - 1:
            c.showPage()
            page_number += 1

    c.save()


def main() -> None:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    register_fonts()
    prepare_logo()
    prepare_fondale()
    menu_data = extract_menu_data()
    generate_pdf(menu_data)
    print(OUTPUT_PDF)


if __name__ == "__main__":
    main()
