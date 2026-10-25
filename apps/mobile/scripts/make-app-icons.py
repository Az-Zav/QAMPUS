"""Builds the Android launcher icon files from assets/images/Qampus-Logo.png.

Run from apps/mobile:  python scripts/make-app-icons.py      (needs Pillow: pip install pillow)
Then rebuild the app (`eas build --profile development --platform android`): launcher icons are part of the
native build, so a JavaScript reload or update never changes them.

Why: an Android adaptive icon is a 108 dp canvas of which only the middle is always visible (the launcher's circle or
rounded mask hides the outer part). The logo used to be the whole foreground, so it looked zoomed in. Now the
background is solid gold (set in app.json) and the foreground is only the white logo mark, shrunk into the safe area.

TO ADJUST THE SIZE: change FOREGROUND_SCALE below, run the script again, rebuild.
  smaller number = more gold around the mark (0.44 fits inside a circular mask; about 0.50 is the most that fits a rounded square);
  larger number  = bigger mark, but its corners may be clipped by circular masks.
"""

from pathlib import Path

from PIL import Image, ImageDraw

FOREGROUND_SCALE = 0.44  # the mark's side as a share of the 1024 px canvas (the visible circle is about 0.67)
STORE_ICON_SCALE = 0.66  # the same mark on the full-bleed gold square used as `icon` (the OS rounds its corners)
GOLD = (255, 204, 51, 255)  # #FFCC33, the logo's gold: also `backgroundColor` of the adaptive icon in app.json
CANVAS = 1024

images = Path(__file__).resolve().parent.parent / "assets" / "images"
logo = Image.open(images / "Qampus-Logo.png").convert("RGBA")

# Keep only the white mark of the logo (the gold and the transparent corners become transparent)
pixels = logo.load()
mark = Image.new("RGBA", logo.size, (0, 0, 0, 0))
mark_pixels = mark.load()
for y in range(logo.height):
    for x in range(logo.width):
        r, g, b, a = pixels[x, y]
        if a > 0 and r > 235 and g > 235 and b > 235:
            mark_pixels[x, y] = (255, 255, 255, 255)
mark = mark.crop(mark.getchannel("A").getbbox())


def place(scale):
    """The mark, scaled to `scale` of the canvas and centred on a transparent 1024 canvas."""
    side = round(CANVAS * scale)
    longest = max(mark.size)
    resized = mark.resize((round(mark.width * side / longest), round(mark.height * side / longest)), Image.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    canvas.paste(resized, ((CANVAS - resized.width) // 2, (CANVAS - resized.height) // 2), resized)
    return canvas


foreground = place(FOREGROUND_SCALE)
foreground.save(images / "android-icon-foreground.png")
foreground.save(images / "android-icon-monochrome.png")  # the themed icon (Android 13+) tints this shape

store = Image.new("RGBA", (CANVAS, CANVAS), GOLD)
store.alpha_composite(place(STORE_ICON_SCALE))
store.convert("RGB").save(images / "icon.png")


# A preview of how common launcher shapes crop the adaptive icon (a circle and a rounded square; 72/108 of the canvas shows)
def preview(shape):
    full = Image.new("RGBA", (CANVAS, CANVAS), GOLD)
    full.alpha_composite(foreground)
    visible = round(CANVAS * 72 / 108)
    offset = (CANVAS - visible) // 2
    full = full.crop((offset, offset, offset + visible, offset + visible))
    mask = Image.new("L", full.size, 0)
    draw = ImageDraw.Draw(mask)
    if shape == "circle":
        draw.ellipse((0, 0, full.width - 1, full.height - 1), fill=255)
    else:
        draw.rounded_rectangle((0, 0, full.width - 1, full.height - 1), radius=round(full.width * 0.28), fill=255)
    out = Image.new("RGBA", full.size, (235, 235, 235, 255))
    out.paste(full, (0, 0), mask)
    return out.resize((300, 300), Image.LANCZOS)


sheet = Image.new("RGBA", (640, 340), (235, 235, 235, 255))
sheet.paste(preview("circle"), (15, 20))
sheet.paste(preview("squircle"), (325, 20))
sheet.convert("RGB").save(images.parent.parent / "scripts" / "icon-preview.png")
print("Wrote android-icon-foreground.png, android-icon-monochrome.png, icon.png and scripts/icon-preview.png")
