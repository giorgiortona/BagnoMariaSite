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

INK = HexColor("#07547D")
INK_DEEP = HexColor("#033B5C")
SEA = HexColor("#1184B2")
SEA_MID = HexColor("#61BDE1")
SEA_LIGHT = HexColor("#CBEEFA")
SAND = HexColor("#FBFDFE")
WHITE = HexColor("#FFFFFF")
LINE = HexColor("#BEDCE8")
SUN_GOLD = HexColor("#F6C244")
SUN_ORANGE = HexColor("#EE8A5E")

FONT_DISPLAY = "BMDisplay"
FONT_DISPLAY_ITALIC = "BMDisplayItalic"
FONT_SANS = "BMSans"
FONT_SANS_BOLD = "BMSansBold"
FONT_SANS_ITALIC = "BMSansItalic"


GROUPS = [
    ["Caffetteria"],
    ["Colazione e Frutta", "Aperitivo"],
    ["Le Frise", "I Crostoni"],
    ["Le Piadine"],
    ["I Panini"],
    ["Le Insalate"],
    ["I Primi Piatti", "Beverage"],
    ["Birre in bottiglia 33cl", "Vino, Prosecco e Champagne"],
    ["Drink"],
    ["I Pestati", "Selezione Gin e Vodka Premium"],
]


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont(FONT_DISPLAY, "/System/Library/Fonts/NewYork.ttf"))
    pdfmetrics.registerFont(TTFont(FONT_DISPLAY_ITALIC, "/System/Library/Fonts/NewYorkItalic.ttf"))
    pdfmetrics.registerFont(TTFont(FONT_SANS, "/System/Library/Fonts/Supplemental/Arial.ttf"))
    pdfmetrics.registerFont(TTFont(FONT_SANS_BOLD, "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
    pdfmetrics.registerFont(TTFont(FONT_SANS_ITALIC, "/System/Library/Fonts/Supplemental/Arial Italic.ttf"))


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
    converter = shutil.which("rsvg-convert")
    if not converter:
        raise RuntimeError("rsvg-convert non trovato")
    subprocess.run(
        [converter, "-w", "1600", "-o", str(LOGO_RAW), str(LOGO_SVG)],
        check=True,
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


def draw_wave_band(c: canvas.Canvas, y: float, amplitude: float, color, period: float) -> None:
    p = c.beginPath()
    p.moveTo(-period, y)
    x = -period
    while x < PAGE_W + period:
        half = period / 2
        p.curveTo(x + period * 0.14, y + amplitude, x + period * 0.36, y + amplitude, x + half, y)
        p.curveTo(x + period * 0.64, y - amplitude, x + period * 0.86, y - amplitude, x + period, y)
        x += period
    p.lineTo(PAGE_W + period, 0)
    p.lineTo(-period, 0)
    p.close()
    c.setFillColor(color)
    c.drawPath(p, stroke=0, fill=1)


def draw_sea(c: canvas.Canvas, height: float) -> None:
    c.saveState()
    c.setFillColor(HexColor("#FFF5E7"))
    c.rect(0, 0, PAGE_W, height, stroke=0, fill=1)

    horizon = height * 0.66
    sun_x = PAGE_W * 0.72
    sun_y = horizon + 7
    draw_sun_lines(c, sun_x, sun_y, 38, SUN_ORANGE)
    c.setFillColor(WHITE)
    c.setStrokeColor(SUN_GOLD)
    c.setLineWidth(1.2)
    c.circle(sun_x, sun_y, 17.5, stroke=1, fill=1)

    draw_wave_band(c, horizon, 8, HexColor("#F6E2D2"), 82)
    draw_wave_band(c, height * 0.48, 10, HexColor("#CFE6F2"), 90)
    draw_wave_band(c, height * 0.31, 11, HexColor("#7CC0E4"), 96)
    draw_wave_band(c, height * 0.15, 9, HexColor("#2E7DA6"), 86)
    c.restoreState()


def draw_sea_at(c: canvas.Canvas, bottom: float, height: float) -> None:
    c.saveState()
    c.translate(0, bottom)
    draw_sea(c, height)
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
    draw_side_waves(c)
    draw_greek_border(c, PAGE_H - 13)

    c.setFillColor(INK)
    c.setFont(FONT_SANS_BOLD, 6.8)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 31, "SANTA MARIA AL BAGNO · PUGLIA")

    sun_y = PAGE_H - 122
    draw_sun_lines(c, PAGE_W / 2, sun_y, 58, INK)
    logo_w = 75 * mm
    logo_h = logo_w / logo_ratio
    c.drawImage(
        str(LOGO_PNG),
        (PAGE_W - logo_w) / 2,
        sun_y - (logo_h / 2),
        logo_w,
        logo_h,
        preserveAspectRatio=True,
        mask="auto",
    )

    c.setFillColor(INK_DEEP)
    c.setFont(FONT_DISPLAY_ITALIC, 23)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 216, "Menù")
    c.setFont(FONT_SANS_BOLD, 6.5)
    c.setFillColor(SEA)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 234, "BAR · CUCINA · DRINK")

    legend_y = 181
    vegetarian_w = draw_diet_icon(c, 62, legend_y, "vegetarian", 10)
    c.setFont(FONT_SANS_BOLD, 6.2)
    c.setFillColor(INK_DEEP)
    c.drawString(62 + vegetarian_w + 5, legend_y + 2.3, "VEGETARIANO")
    draw_diet_icon(c, 190, legend_y - 0.4, "vegan", 10.8)

    draw_sea(c, 148)
    c.setFillColor(INK_DEEP)
    c.setFont(FONT_SANS_BOLD, 5.8)
    c.drawString(10 * mm, 12, "MENU OFFLINE")
    c.drawRightString(PAGE_W - (10 * mm), 12, "ESTATE 2026")


def draw_page_base(c: canvas.Canvas, page_number: int, logo_ratio: float) -> None:
    c.setFillColor(SAND)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    draw_side_waves(c)
    draw_greek_border(c, PAGE_H - 13)

    logo_w = 39 * mm
    logo_h = logo_w / logo_ratio
    c.drawImage(
        str(LOGO_PNG),
        (PAGE_W - logo_w) / 2,
        PAGE_H - 25 * mm,
        logo_w,
        logo_h,
        preserveAspectRatio=True,
        mask="auto",
    )

    c.setStrokeColor(LINE)
    c.setLineWidth(0.55)
    c.line(MARGIN_X, 12 * mm, PAGE_W - MARGIN_X, 12 * mm)
    c.setFont(FONT_SANS_BOLD, 5.5)
    c.setFillColor(SEA)
    c.drawString(MARGIN_X, 8.4 * mm, "BAGNOMARIA · MENU OFFLINE")
    c.drawRightString(PAGE_W - MARGIN_X, 8.4 * mm, f"{page_number:02d}")


def draw_category_title(c: canvas.Canvas, y: float, title: str, note: str | None = None) -> float:
    size = 17.5
    while pdfmetrics.stringWidth(title, FONT_DISPLAY_ITALIC, size) > CONTENT_W - 34 and size > 12.5:
        size -= 0.5

    title_width = pdfmetrics.stringWidth(title, FONT_DISPLAY_ITALIC, size)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    line_gap = 8
    line_width = max(14, (CONTENT_W - title_width - (2 * line_gap)) / 2)
    left_x = MARGIN_X
    right_x = PAGE_W - MARGIN_X
    c.line(left_x, y + 3, left_x + line_width, y + 3)
    c.line(right_x - line_width, y + 3, right_x, y + 3)
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


def item_height(item: dict) -> tuple[float, list[str], list[str]]:
    price = item.get("prezzo") or ""
    price_w = pdfmetrics.stringWidth(f"€ {price.replace('.', ',')}", FONT_SANS_BOLD, 9.2) if price else 0
    name_width = CONTENT_W - price_w - (10 if price else 0)
    name_lines = wrap_text(item["nome"], FONT_SANS_BOLD, 9.4, name_width)
    desc_lines = wrap_text(item.get("desc", ""), FONT_SANS, 7.25, CONTENT_W - 2)
    height = (len(name_lines) * 11.4) + (len(desc_lines) * 8.8 if desc_lines else 0) + 6.5
    if desc_lines:
        height += 1.5
    return height, name_lines, desc_lines


def draw_item(c: canvas.Canvas, y: float, item: dict) -> float:
    height, name_lines, desc_lines = item_height(item)
    price = item.get("prezzo") or ""
    display_price = f"€ {price.replace('.', ',')}" if price else ""

    c.setFont(FONT_SANS_BOLD, 9.4)
    c.setFillColor(INK_DEEP)
    first_line_y = y
    icon_right = None
    for index, line in enumerate(name_lines):
        c.drawString(MARGIN_X, y, line)
        if index == 0 and item.get("tag"):
            name_w = pdfmetrics.stringWidth(line, FONT_SANS_BOLD, 9.4)
            price_w = pdfmetrics.stringWidth(display_price, FONT_SANS_BOLD, 9.2) if display_price else 0
            icon_h = 8.2
            icon_w = icon_h * DIET_ICON_RATIOS[item["tag"]]
            max_icon_x = PAGE_W - MARGIN_X - price_w - icon_w - 8
            icon_x = min(MARGIN_X + name_w + 5, max_icon_x)
            draw_diet_icon(c, icon_x, y - 1.2, item["tag"], icon_h)
            icon_right = icon_x + icon_w
        y -= 11.4

    if display_price:
        c.setFont(FONT_SANS_BOLD, 9.2)
        c.setFillColor(INK)
        c.drawRightString(PAGE_W - MARGIN_X, first_line_y, display_price)
        name_w = pdfmetrics.stringWidth(name_lines[0], FONT_SANS_BOLD, 9.4)
        price_w = pdfmetrics.stringWidth(display_price, FONT_SANS_BOLD, 9.2)
        dots_start = MARGIN_X + name_w + 5
        dots_end = PAGE_W - MARGIN_X - price_w - 5
        if icon_right is not None:
            dots_start = max(dots_start, icon_right + 5)
        if dots_end - dots_start > 10:
            c.saveState()
            c.setStrokeColor(LINE)
            c.setLineWidth(0.45)
            c.setDash(0.8, 2)
            c.line(dots_start, first_line_y + 1.8, dots_end, first_line_y + 1.8)
            c.restoreState()

    if desc_lines:
        c.setFont(FONT_SANS, 7.25)
        c.setFillColor(SEA)
        y -= 1.5
        for line in desc_lines:
            c.drawString(MARGIN_X + 2, y, line)
            y -= 8.8

    c.setStrokeColor(HexColor("#E7F1F5"))
    c.setLineWidth(0.35)
    c.line(MARGIN_X, y - 1, PAGE_W - MARGIN_X, y - 1)
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
                needed, _, _ = item_height(item)
                if y - needed < CONTENT_BOTTOM:
                    c.showPage()
                    page_number += 1
                    draw_page_base(c, page_number, logo_ratio)
                    y = draw_category_title(c, CONTENT_TOP, f"{category_name} · continua")
                y = draw_item(c, y, item)

        if group_index == len(GROUPS) - 1 and y > 87 * mm:
            draw_sea_at(c, 12.2 * mm, 65 * mm)

        if group_index < len(GROUPS) - 1:
            c.showPage()
            page_number += 1

    c.save()


def main() -> None:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    register_fonts()
    prepare_logo()
    menu_data = extract_menu_data()
    generate_pdf(menu_data)
    print(OUTPUT_PDF)


if __name__ == "__main__":
    main()
