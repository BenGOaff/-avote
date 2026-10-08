"""Construit les logos vectoriels de Ça vote ? à partir d'Archivo Black (OFL).

Les tracés sont des contours de glyphes convertis en chemins : aucun texte
ni police n'est nécessaire pour afficher le logo. Le papier jaune utilise des
sommets fixes (pas d'aléatoire au rendu, charte §7).

Usage : python3 scripts/brand/build_logo.py
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
import math

ROOT = Path(__file__).resolve().parents[2]
FONT = ROOT / "node_modules/@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff2"
OUT = ROOT / "public/brand"

INK = "#191919"
PAPER = "#F5F0E6"
YELLOW = "#FFE34D"

font = TTFont(str(FONT))
gs = font.getGlyphSet()
cmap = font.getBestCmap()
UPM = font["head"].unitsPerEm
ASC = font["hhea"].ascent


def glyph_path(ch, x, y, scale):
    """Chemin SVG du glyphe, origine sur la ligne de base (x, y), axe Y vers le bas."""
    name = cmap[ord(ch)]
    pen = SVGPathPen(gs, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
    tpen = TransformPen(pen, (scale, 0, 0, -scale, x, y))
    gs[name].draw(tpen)
    return pen.getCommands(), gs[name].width * scale


def glyph_bounds(ch):
    bp = BoundsPen(gs)
    gs[cmap[ord(ch)]].draw(bp)
    return bp.bounds  # xMin, yMin, xMax, yMax en unités de police


def word(text, x, y, scale, tracking=0.0):
    paths = []
    for ch in text:
        if ch == " ":
            x += gs[cmap[32]].width * scale * 0.75
            continue
        d, adv = glyph_path(ch, x, y, scale)
        paths.append(d)
        x += adv + tracking * scale
    return " ".join(paths), x


# Papier jaune : quadrilatère légèrement irrégulier, sommets fixes,
# incliné de -4° autour de son centre (charte §5).
PAPER_POINTS = [(0.00, 0.03), (0.52, 0.00), (1.00, 0.02), (0.985, 0.55), (1.00, 1.00), (0.48, 0.985), (0.01, 1.00), (0.02, 0.47)]


def paper(cx, cy, w, h, angle_deg=-4.0, fill=YELLOW):
    a = math.radians(angle_deg)
    pts = []
    for px, py in PAPER_POINTS:
        x = (px - 0.5) * w
        y = (py - 0.5) * h
        rx = x * math.cos(a) - y * math.sin(a) + cx
        ry = x * math.sin(a) + y * math.cos(a) + cy
        pts.append(f"{rx:.1f},{ry:.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'


def question(cx, cy, height, angle_deg=-4.0, fill=INK):
    """Point d'interrogation au tracé arrondi (inspiré du favicon fourni par Béné).

    Dessiné comme un trait épais à bouts ronds + un point rond : lisible en petit,
    sans texture ni tremblement aléatoire (charte §6, §7). Coordonnées normalisées
    sur une hauteur de 1, centrées sur (0, 0).
    """
    k = height
    sw = 0.22 * k
    def P(x, y):
        return f"{cx + x * k:.1f},{cy + y * k:.1f}"
    d = (
        f"M{P(-0.25, -0.2)} "
        f"C{P(-0.27, -0.47)} {P(0.27, -0.5)} {P(0.25, -0.2)} "
        f"C{P(0.24, -0.04)} {P(0.02, 0.0)} {P(0.01, 0.15)}"
    )
    dot_r = 0.115 * k
    return (
        f'<g transform="rotate({angle_deg} {cx:.1f} {cy:.1f})">'
        f'<path d="{d}" fill="none" stroke="{fill}" stroke-width="{sw:.1f}" stroke-linecap="round" stroke-linejoin="round"/>'
        f'<circle cx="{cx + 0.0 * k:.1f}" cy="{cy + 0.45 * k:.1f}" r="{dot_r:.1f}" fill="{fill}"/>'
        f'</g>'
    )


def svg(w, h, body, title):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img" aria-labelledby="t">'
        f'<title id="t">{title}</title>{body}</svg>\n'
    )


def horizontal(letters=INK):
    cap = 200.0  # hauteur de capitale cible
    x0, y0, x1, y1 = glyph_bounds("V")
    scale = cap / (y1 - y0)
    pad = 24
    base = pad + cap
    d, end = word("ÇA VOTE", pad, base, scale, tracking=-10)
    # Le papier : carré un peu plus haut que la capitale, collé au E
    pw, ph = cap * 0.86, cap * 1.18
    pcx = end + 30 + pw / 2
    pcy = base - cap / 2
    body = f'<path d="{d}" fill="{letters}"/>' + paper(pcx, pcy, pw, ph) + question(pcx, pcy, cap * 0.86)
    # la cédille descend sous la ligne de base
    cx0, cy0, _, _ = glyph_bounds("Ç")
    h = base - cy0 * scale + pad
    w = pcx + pw / 2 + pad + 8
    return w, h, body


def stacked(letters=INK):
    cap = 200.0
    x0, y0, x1, y1 = glyph_bounds("V")
    scale = cap / (y1 - y0)
    pad = 24
    _, cy0, _, _ = glyph_bounds("Ç")
    desc = -cy0 * scale
    base1 = pad + cap
    d1, end1 = word("ÇA", pad, base1, scale, tracking=-10)
    base2 = base1 + desc + 24 + cap
    d2, end2 = word("VOTE", pad, base2, scale, tracking=-10)
    pw, ph = cap * 0.86, cap * 1.18
    pcx = end1 + 40 + pw / 2
    pcy = base1 - cap / 2 + 10
    body = f'<path d="{d1} {d2}" fill="{letters}"/>' + paper(pcx, pcy, pw, ph) + question(pcx, pcy, cap * 0.86)
    w = max(end2, pcx + pw / 2) + pad + 8
    h = base2 + pad
    return w, h, body


def symbol():
    s = 256
    return s, s, paper(s / 2, s / 2, s * 0.7, s * 0.84, angle_deg=-8) + question(s / 2, s / 2 + 4, s * 0.62, angle_deg=-4)


def app_icon():
    """Icône d'application / avatar : fond papier crème, papier jaune incliné, signe arrondi."""
    s = 512
    body = f'<rect width="{s}" height="{s}" fill="{PAPER}"/>' + paper(s / 2, s / 2, s * 0.6, s * 0.72, angle_deg=-8) + question(s / 2, s / 2 + 8, s * 0.52, angle_deg=-4)
    return s, s, body


def favicon():
    """Jaune plein, signe noir centré, sans papier ni rotation (charte §6)."""
    s = 64
    body = f'<rect width="{s}" height="{s}" rx="10" fill="{YELLOW}"/>' + question(s / 2, s / 2, s * 0.72, angle_deg=0)
    return s, s, body


def maskable():
    """Signe dans la zone sûre centrale (80 %)."""
    s = 512
    body = f'<rect width="{s}" height="{s}" fill="{PAPER}"/>' + paper(s / 2, s / 2, s * 0.5, s * 0.6, angle_deg=-8) + question(s / 2, s / 2 + 6, s * 0.42, angle_deg=-4)
    return s, s, body


def write(name, dims, title):
    w, h, body = dims
    (OUT / name).write_text(svg(w, h, body, title), encoding="utf-8")
    print(name, round(w), round(h))


OUT.mkdir(parents=True, exist_ok=True)
write("logo-horizontal.svg", horizontal(), "Ça vote ?")
write("logo-horizontal-clair.svg", horizontal(PAPER), "Ça vote ?")
write("logo-compact.svg", stacked(), "Ça vote ?")
write("logo-compact-clair.svg", stacked(PAPER), "Ça vote ?")
write("symbole.svg", symbol(), "Ça vote ?")
write("favicon.svg", favicon(), "Ça vote ?")
write("icon-maskable.svg", maskable(), "Ça vote ?")
write("icon-app.svg", app_icon(), "Ça vote ?")
