"""Hyperspace header for the sign-in email: public/email/hyperspace-header.png.

Same idea as src/components/effects/Starfield.tsx: white and indigo/violet stars
on #09090B, some stretched into streaks that radiate from a vanishing point,
plus a soft brand glow, fading into the card colour. Rendered at 2x (1200x400).
The seed is fixed, so every run gives the same image.

Regenerate:
  python3 -m venv .venv && .venv/bin/pip install pillow
  .venv/bin/python scripts/email/hyperspace-header.py public/email/hyperspace-header.png
"""
import math, random, sys
from PIL import Image, ImageDraw, ImageFilter

W, H = 1200, 400
BG = (9, 9, 11)                       # dark.bg #09090B
random.seed(20261009)                 # same image every run

img = Image.new("RGB", (W, H), BG)

# Soft brand glow around the vanishing point (indigo #6366F1 → violet).
glow = Image.new("RGB", (W, H), BG)
g = ImageDraw.Draw(glow)
cx, cy = W * 0.5, H * 0.52
for r, col in [(330, (40, 38, 90)), (220, (60, 52, 140)), (120, (88, 76, 190))]:
    g.ellipse([cx - r * 1.6, cy - r * 0.62, cx + r * 1.6, cy + r * 0.62], fill=col)
glow = glow.filter(ImageFilter.GaussianBlur(70))
img = Image.blend(img, glow, 0.55)

layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(layer)

def star_colour(alpha):
    hue = random.random()
    if hue < 0.62:
        return (255, 255, 255, alpha)            # white
    if hue < 0.85:
        return (129, 140, 248, alpha)            # indigo-400
    return (192, 132, 252, alpha)                # violet-400

# Streaks: the "jump" — longer the further from the centre.
for _ in range(260):
    ang = random.uniform(0, 2 * math.pi)
    dist = random.uniform(40, 700) ** 1.0
    x = cx + math.cos(ang) * dist * 1.55
    y = cy + math.sin(ang) * dist * 0.55
    if not (0 <= x < W and 0 <= y < H):
        continue
    length = (dist / 700) ** 2 * random.uniform(30, 120)
    x2 = x + math.cos(ang) * length * 1.55
    y2 = y + math.sin(ang) * length * 0.55
    a = int(60 + 160 * (dist / 700))
    d.line([(x, y), (x2, y2)], fill=star_colour(a), width=2 if dist > 420 else 1)

# Still stars: small dots, a few brighter ones with a halo.
for _ in range(420):
    x, y = random.uniform(0, W), random.uniform(0, H)
    r = random.choice([0.8, 1.0, 1.2, 1.6, 2.2])
    d.ellipse([x - r, y - r, x + r, y + r], fill=star_colour(random.randint(90, 230)))

halo = layer.filter(ImageFilter.GaussianBlur(2.2))
img = Image.alpha_composite(img.convert("RGBA"), halo)
img = Image.alpha_composite(img, layer)

# Fade the bottom edge into the card colour so the header melts into the email.
fade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
f = ImageDraw.Draw(fade)
for i in range(120):
    a = int(255 * (i / 120) ** 1.6)
    f.line([(0, H - 120 + i), (W, H - 120 + i)], fill=(18, 18, 20, a))   # dark.card #121214
img = Image.alpha_composite(img, fade).convert("RGB")

img.save(sys.argv[1], optimize=True)
print("saved", sys.argv[1])
