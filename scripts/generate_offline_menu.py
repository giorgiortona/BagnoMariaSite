#!/usr/bin/env python3
"""Generate the phone-first offline Bagno Maria menu PDF from Menu.jsx.

Reworked for Windows — uses Bodoni Moda + Manrope (Google Fonts) to match
the live website, and svglib for SVG-to-PDF logo conversion.

Modifiche richieste dal cliente:
  • riquadro con menu al centro
  • cornice con mare della vetrina
  • sole iniziale centrato
  • font uguale a quello del sito
"""

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
FONTS_DIR = ROOT / "fonts"
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

# ── Riquadro e cornice ──
# Margini del riquadro decorativo attorno al contenuto
FRAME_MARGIN = 4 * mm
FRAME_TOP = PAGE_H - 6 * mm
FRAME_BOTTOM = 5 * mm
FRAME_LEFT = FRAME_MARGIN
FRAME_RIGHT = PAGE_W - FRAME_MARGIN

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
FRAME_COLOR = HexColor("#A6D5E8")
FRAME_INNER = HexColor("#D0EAF4")

# Font names — Bodoni Moda (display) and Manrope (sans) to match the website
FONT_DISPLAY = "BodoniModa"
FONT_DISPLAY_ITALIC = "BodoniModaItalic"
FONT_SANS = "Manrope"
FONT_SANS_BOLD = "Manrope"  # Variable font, same file
FONT_SANS_ITALIC = "Manrope"  # No italic available, use regular


GROUPS = [
    ["Caffetteria"],
    ["Colazione e Frutta", "Aperitivo"],
    ["Le Frise", "I Crostoni"],
    ["Le Piadine"],
    ["I Panini"],
    ["Le Insalate"],
    ["I Primi Piatti", "Beverage"],
    ["Birre in bottiglia 33cl", "Vino, Prosecco e Champagne"],
    ["Drink", "I Pestati", "Selezione Gin e Vodka Premium"],
]


def register_fonts() -> None:
    """Register Bodoni Moda and Manrope from the project fonts/ directory."""
    font_map = {
        FONT_DISPLAY: FONTS_DIR / "BodoniModa.ttf",
        FONT_DISPLAY_ITALIC: FONTS_DIR / "BodoniModa-Italic.ttf",
        FONT_SANS: FONTS_DIR / "Manrope.ttf",
    }
    for name, path in font_map.items():
        if not path.exists():
            raise FileNotFoundError(
                f"Font mancante: {path}\n"
                f"Scarica i font con lo script download_fonts.py"
            )
        pdfmetrics.registerFont(TTFont(name, str(path)))


def extract_menu_data() -> list[dict]:
    node = shutil.which("node")
    if not node:
        raise RuntimeError("Node.js non trovato: impossibile leggere MENU_DATA")

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
        encoding="utf-8",
    )
    return json.loads(result.stdout)


def load_logo_drawing():
    """Load the SVG logo as a ReportLab Drawing using svglib."""
    import tempfile
    import os
    from svglib.svglib import svg2rlg
    
    with open(LOGO_SVG, "r", encoding="utf-8") as f:
        svg_content = f.read()

    # Sostituisci currentColor con il colore INK (#07547D)
    svg_content = svg_content.replace('currentColor', '#07547D')

    with tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False, suffix=".svg") as tmp:
        tmp.write(svg_content)
        tmp_path = tmp.name

    try:
        drawing = svg2rlg(tmp_path)
    finally:
        os.unlink(tmp_path)

    if drawing is None:
        raise RuntimeError(f"Impossibile caricare il logo SVG: {LOGO_SVG}")
    return drawing


def draw_logo_on_canvas(c: canvas.Canvas, drawing, x: float, y: float, width: float) -> float:
    """Draw the SVG logo (as RLG drawing) centered at (x, y) with given width.

    Returns the height at which it was drawn.
    """
    from reportlab.graphics import renderPDF
    scale = width / drawing.width
    height = drawing.height * scale
    # renderPDF.draw places the drawing with its bottom-left at (x, y)
    c.saveState()
    c.translate(x, y)
    c.scale(scale, scale)
    renderPDF.draw(drawing, c, 0, 0)
    c.restoreState()
    return height


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
    # Sole centrato orizzontalmente (modifica cliente)
    sun_x = PAGE_W / 2
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


# ── Cornice decorativa con mare (vetrina) ──

def draw_frame_wave_top(c: canvas.Canvas, y: float, width: float, x_start: float) -> None:
    """Draw a small decorative wave line along the top of the frame."""
    c.saveState()
    c.setStrokeColor(FRAME_COLOR)
    c.setLineWidth(0.6)
    period = 24
    amplitude = 2.5
    p = c.beginPath()
    x = x_start
    p.moveTo(x, y)
    while x < x_start + width:
        half = period / 2
        p.curveTo(
            x + period * 0.25, y + amplitude,
            x + period * 0.25, y + amplitude,
            x + half, y,
        )
        p.curveTo(
            x + period * 0.75, y - amplitude,
            x + period * 0.75, y - amplitude,
            x + period, y,
        )
        x += period
    c.drawPath(p)
    c.restoreState()


def draw_frame_wave_bottom(c: canvas.Canvas, y: float, width: float, x_start: float) -> None:
    """Draw decorative wave bands at the bottom of the frame (mare della vetrina)."""
    c.saveState()
    c.clipPath(
        c.beginPath().addTo(
            lambda p: (p.moveTo(x_start, 0), p.lineTo(x_start + width, 0),
                       p.lineTo(x_start + width, y + 20), p.lineTo(x_start, y + 20), p.close())
        ) if False else _clip_rect(c, x_start, 0, width, y + 20),
        stroke=0, fill=0
    )
    # Multiple wave layers
    for i, (offset, amp, col, per) in enumerate([
        (0, 3.5, HexColor("#D0EAF4"), 38),
        (-5, 3, HexColor("#A6D5E8"), 32),
        (-10, 2.5, HexColor("#7CC0E4"), 28),
    ]):
        p = c.beginPath()
        wave_y = y + offset
        xp = x_start - per
        p.moveTo(xp, wave_y)
        while xp < x_start + width + per:
            half = per / 2
            p.curveTo(xp + per * 0.14, wave_y + amp, xp + per * 0.36, wave_y + amp, xp + half, wave_y)
            p.curveTo(xp + per * 0.64, wave_y - amp, xp + per * 0.86, wave_y - amp, xp + per, wave_y)
            xp += per
        p.lineTo(x_start + width + per, 0)
        p.lineTo(x_start - per, 0)
        p.close()
        c.setFillColor(col)
        c.drawPath(p, stroke=0, fill=1)
    c.restoreState()


def _clip_rect(c, x, y, w, h):
    """Helper — returns a clip path rectangle."""
    p = c.beginPath()
    p.rect(x, y, w, h)
    return p


def draw_decorative_frame(c: canvas.Canvas, with_sea: bool = True) -> None:
    """Draw the decorative frame (riquadro) around the page content.

    Features:
      - Double-line rectangular border (outer + inner)
      - Greek meander along the top
      - Small wave motif along the bottom (cornice con mare della vetrina)
      - Corner diamond decorations
    """
    x1 = FRAME_LEFT
    y1 = FRAME_BOTTOM
    x2 = FRAME_RIGHT
    y2 = FRAME_TOP
    w = x2 - x1
    h = y2 - y1

    c.saveState()

    # Outer frame line
    c.setStrokeColor(FRAME_COLOR)
    c.setLineWidth(1.0)
    c.rect(x1, y1, w, h, stroke=1, fill=0)

    # Inner frame line (inset 2mm)
    inset = 2 * mm
    c.setStrokeColor(FRAME_INNER)
    c.setLineWidth(0.5)
    c.rect(x1 + inset, y1 + inset, w - 2 * inset, h - 2 * inset, stroke=1, fill=0)

    # Corner diamond decorations at each corner of the outer frame
    diamond_size = 2.2 * mm
    corners = [
        (x1, y1), (x2, y1), (x1, y2), (x2, y2),
    ]
    c.setFillColor(FRAME_COLOR)
    c.setStrokeColor(WHITE)
    c.setLineWidth(0.3)
    for cx, cy in corners:
        p = c.beginPath()
        p.moveTo(cx, cy - diamond_size)
        p.lineTo(cx + diamond_size, cy)
        p.lineTo(cx, cy + diamond_size)
        p.lineTo(cx - diamond_size, cy)
        p.close()
        c.drawPath(p, stroke=1, fill=1)

    # Small wave decoration along the bottom of the frame (mare della vetrina)
    if with_sea:
        wave_y = y1 + inset + 1.5 * mm
        c.saveState()
        # Clip to frame area
        clip = c.beginPath()
        clip.rect(x1 + inset, y1 + inset, w - 2 * inset, 8 * mm)
        c.clipPath(clip, stroke=0, fill=0)

        for offset, amp, col, per in [
            (5 * mm, 2.8, HexColor("#D0EAF4"), 34),
            (3 * mm, 2.2, HexColor("#A6D5E8"), 28),
            (1 * mm, 1.8, HexColor("#7CC0E4"), 24),
        ]:
            wave_base = y1 + inset + offset
            wp = c.beginPath()
            xp = x1
            wp.moveTo(xp, wave_base)
            while xp < x2:
                half = per / 2
                wp.curveTo(
                    xp + per * 0.14, wave_base + amp,
                    xp + per * 0.36, wave_base + amp,
                    xp + half, wave_base,
                )
                wp.curveTo(
                    xp + per * 0.64, wave_base - amp,
                    xp + per * 0.86, wave_base - amp,
                    xp + per, wave_base,
                )
                xp += per
            wp.lineTo(x2, y1)
            wp.lineTo(x1, y1)
            wp.close()
            c.setFillColor(col)
            c.drawPath(wp, stroke=0, fill=1)
        c.restoreState()

    # Top wave decoration along the top of the frame
    c.saveState()
    c.setStrokeColor(FRAME_COLOR)
    c.setLineWidth(0.5)
    wave_top_y = y2 - inset - 0.5 * mm
    period = 18
    amp = 1.8
    wp = c.beginPath()
    xp = x1 + inset
    wp.moveTo(xp, wave_top_y)
    while xp < x2 - inset:
        half = period / 2
        wp.curveTo(
            xp + period * 0.25, wave_top_y + amp,
            xp + period * 0.25, wave_top_y + amp,
            xp + half, wave_top_y,
        )
        wp.curveTo(
            xp + period * 0.75, wave_top_y - amp,
            xp + period * 0.75, wave_top_y - amp,
            xp + period, wave_top_y,
        )
        xp += period
    c.drawPath(wp)
    c.restoreState()

    c.restoreState()


def draw_cover(c: canvas.Canvas, logo_drawing) -> None:
    c.setFillColor(SAND)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)

    # Decorative frame around the entire cover
    draw_decorative_frame(c, with_sea=False)

    draw_side_waves(c)
    draw_greek_border(c, PAGE_H - 13)

    c.setFillColor(INK)
    c.setFont(FONT_SANS, 6.8)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 45, "SANTA MARIA AL BAGNO · PUGLIA")

    # ── Sole centrato (modifica cliente) ──
    sun_y = PAGE_H - 122
    draw_sun_lines(c, PAGE_W / 2, sun_y + 16, 58, INK)
    logo_w = 75 * mm
    logo_ratio = logo_drawing.width / logo_drawing.height
    logo_h = logo_w / logo_ratio
    draw_logo_on_canvas(c, logo_drawing, (PAGE_W - logo_w) / 2, sun_y - (logo_h / 2) + 18, logo_w)

    c.setFillColor(INK_DEEP)
    c.setFont(FONT_SANS_BOLD, 23)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 216, "Menù")
    c.setFont(FONT_SANS, 6.5)
    c.setFillColor(SEA)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 234, "BAR · CUCINA · DRINK")

    legend_y = 181
    vegetarian_w = draw_diet_icon(c, 62, legend_y, "vegetarian", 10)
    c.setFont(FONT_SANS, 6.2)
    c.setFillColor(INK_DEEP)
    c.drawString(62 + vegetarian_w + 5, legend_y + 2.3, "VEGETARIANO")
    draw_diet_icon(c, 190, legend_y - 0.4, "vegan", 10.8)

    draw_sea(c, 148)
    c.setFillColor(INK_DEEP)
    c.setFont(FONT_SANS, 5.8)
    c.drawString(10 * mm, 24, "MENU OFFLINE")
    c.drawRightString(PAGE_W - (10 * mm), 24, "ESTATE 2026")


def draw_page_base(c: canvas.Canvas, page_number: int, logo_drawing) -> None:
    c.setFillColor(SAND)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)

    # ── Cornice decorativa con mare (vetrina) ──
    draw_decorative_frame(c, with_sea=True)

    draw_side_waves(c)
    draw_greek_border(c, PAGE_H - 13)

    logo_w = 21 * mm
    draw_logo_on_canvas(c, logo_drawing, (PAGE_W - logo_w) / 2, PAGE_H - 16 * mm, logo_w)

    c.setStrokeColor(LINE)
    c.setLineWidth(0.55)
    c.line(MARGIN_X, 13 * mm, PAGE_W - MARGIN_X, 13 * mm)
    c.setFont(FONT_SANS, 5.5)
    c.setFillColor(SEA)
    c.drawString(MARGIN_X, 9.4 * mm, "BAGNOMARIA · MENU OFFLINE")
    c.drawRightString(PAGE_W - MARGIN_X, 9.4 * mm, f"{page_number:02d}")


def draw_category_title(c: canvas.Canvas, y: float, title: str, note: str | None = None) -> float:
    size = 17.5
    while pdfmetrics.stringWidth(title, FONT_SANS_BOLD, size) > CONTENT_W - 34 and size > 12.5:
        size -= 0.5

    title_width = pdfmetrics.stringWidth(title, FONT_SANS_BOLD, size)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    line_gap = 8
    line_width = max(14, (CONTENT_W - title_width - (2 * line_gap)) / 2)
    left_x = MARGIN_X
    right_x = PAGE_W - MARGIN_X
    c.line(left_x, y + 3, left_x + line_width, y + 3)
    c.line(right_x - line_width, y + 3, right_x, y + 3)
    c.setFillColor(INK_DEEP)
    c.setFont(FONT_SANS_BOLD, size)
    c.drawCentredString(PAGE_W / 2, y - 2, title)
    y -= 20

    if note:
        lines = wrap_text(note, FONT_SANS, 6.8, CONTENT_W)
        c.setFillColor(SEA)
        c.setFont(FONT_SANS, 6.8)
        for line in lines:
            c.drawCentredString(PAGE_W / 2, y, line)
            y -= 8
        y -= 2
    return y


def item_height(item: dict) -> tuple[float, list[str], list[str]]:
    price = item.get("prezzo") or ""
    price_w = pdfmetrics.stringWidth(f"€ {price.replace('.', ',')}", FONT_SANS, 9.2) if price else 0
    name_width = CONTENT_W - price_w - (10 if price else 0)
    name_lines = wrap_text(item["nome"], FONT_SANS, 9.4, name_width)
    desc_lines = wrap_text(item.get("desc", ""), FONT_SANS, 7.25, CONTENT_W - 2)
    height = (len(name_lines) * 11.4) + (len(desc_lines) * 8.8 if desc_lines else 0) + 12
    if desc_lines:
        height += 2
    return height, name_lines, desc_lines


def draw_item(c: canvas.Canvas, y: float, item: dict) -> float:
    height, name_lines, desc_lines = item_height(item)
    price = item.get("prezzo") or ""
    display_price = f"€ {price.replace('.', ',')}" if price else ""

    c.setFont(FONT_SANS, 9.4)
    c.setFillColor(INK_DEEP)
    first_line_y = y
    icon_right = None
    for index, line in enumerate(name_lines):
        c.drawString(MARGIN_X, y, line)
        if index == 0 and item.get("tag"):
            name_w = pdfmetrics.stringWidth(line, FONT_SANS, 9.4)
            price_w = pdfmetrics.stringWidth(display_price, FONT_SANS, 9.2) if display_price else 0
            icon_h = 8.2
            icon_w = icon_h * DIET_ICON_RATIOS[item["tag"]]
            max_icon_x = PAGE_W - MARGIN_X - price_w - icon_w - 8
            icon_x = min(MARGIN_X + name_w + 5, max_icon_x)
            draw_diet_icon(c, icon_x, y - 1.2, item["tag"], icon_h)
            icon_right = icon_x + icon_w
        y -= 11.4

    if display_price:
        c.setFont(FONT_SANS, 9.2)
        c.setFillColor(INK)
        c.drawRightString(PAGE_W - MARGIN_X, first_line_y, display_price)

    if desc_lines:
        c.setFont(FONT_SANS, 7.25)
        c.setFillColor(SEA)
        y -= 2
        for line in desc_lines:
            c.drawString(MARGIN_X + 2, y, line)
            y -= 8.8

    c.saveState()
    c.setStrokeColor(HexColor("#BEDCE8"))
    c.setLineWidth(0.4)
    c.setDash(2, 2.5)
    line_w = CONTENT_W * 0.4
    cx = PAGE_W / 2
    c.line(cx - line_w/2, y - 4, cx + line_w/2, y - 4)
    c.restoreState()
    return first_line_y - height


def generate_pdf(menu_data: list[dict]) -> None:
    by_category = {category["categoria"]: category for category in menu_data}
    missing = [name for group in GROUPS for name in group if name not in by_category]
    if missing:
        raise ValueError(f"Categorie mancanti: {', '.join(missing)}")

    logo_drawing = load_logo_drawing()
    
    c = canvas.Canvas(str(OUTPUT_PDF), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    c.setTitle("Bagnomaria - Menu offline")
    c.setAuthor("Bagnomaria")
    c.setSubject("Menu consultabile offline da smartphone")

    draw_cover(c, logo_drawing)
    c.showPage()
    page_number = 2

    for group_index, group in enumerate(GROUPS):
        draw_page_base(c, page_number, logo_drawing)
        y = CONTENT_TOP

        for category_index, category_name in enumerate(group):
            category = by_category[category_name]
            if category_index and y < CONTENT_BOTTOM + 65:
                c.showPage()
                page_number += 1
                draw_page_base(c, page_number, logo_drawing)
                y = CONTENT_TOP
            elif category_index:
                y -= 22

            y = draw_category_title(c, y, category_name, category.get("nota"))

            for item in category["piatti"]:
                needed, _, _ = item_height(item)
                if y - needed < CONTENT_BOTTOM:
                    c.showPage()
                    page_number += 1
                    draw_page_base(c, page_number, logo_drawing)
                    y = draw_category_title(c, CONTENT_TOP, category_name)
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
    menu_data = extract_menu_data()
    generate_pdf(menu_data)
    print(OUTPUT_PDF)


if __name__ == "__main__":
    main()
