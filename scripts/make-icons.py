"""Rasterize the Cric-Lab mark into icon / splash / adaptive / favicon PNGs."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1] / "assets"
PITCH = (11, 61, 46)
PITCH_DEEP = (6, 38, 28)
BALL_LIGHT = (228, 87, 46)
BALL_DARK = (166, 27, 27)
SEAM = (251, 239, 231)
SPARK = (123, 227, 166)


def lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))  # type: ignore[return-value]


def draw_ball(img: Image.Image, cx: float, cy: float, r: float) -> None:
    draw = ImageDraw.Draw(img)
    steps = max(48, int(r))
    for i in range(steps, 0, -1):
        t = 1 - (i / steps)
        color = lerp(BALL_LIGHT, BALL_DARK, t * 0.85)
        draw.ellipse((cx - i, cy - i, cx + i, cy + i), fill=color)

    hx, hy, hr = cx - r * 0.28, cy - r * 0.32, r * 0.38
    highlight = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(highlight)
    hd.ellipse((hx - hr, hy - hr, hx + hr, hy + hr), fill=(255, 220, 190, 70))
    blurred = highlight.filter(ImageFilter.GaussianBlur(radius=max(2, r * 0.08)))
    img.paste(blurred, (0, 0), blurred)

    def seam(y_off: float, width: float, amp: float) -> None:
        pts: list[tuple[float, float]] = []
        for i in range(33):
            t = i / 32
            x = cx - r * 0.72 + t * r * 1.44
            y = cy + y_off + math.sin((t - 0.5) * math.pi) * amp
            pts.append((x, y))
        draw.line(pts, fill=SEAM, width=max(2, int(width)))

    seam(-r * 0.28, r * 0.075, r * 0.10)
    seam(0, r * 0.09, r * 0.12)
    seam(r * 0.28, r * 0.075, r * 0.10)


def draw_sparks(draw: ImageDraw.ImageDraw, cx: float, cy: float, r: float) -> None:
    w = max(3, int(r * 0.08))
    x1, y1 = cx + r * 0.62, cy - r * 0.95
    draw.line((x1, y1, x1 + r * 0.28, y1 - r * 0.28), fill=SPARK, width=w)
    draw.line((x1 + r * 0.18, y1 + r * 0.08, x1 + r * 0.42, y1 - r * 0.16), fill=SPARK, width=w)


def make_icon(size: int = 1024) -> Image.Image:
    img = Image.new("RGBA", (size, size), (*PITCH, 255))
    cx = cy = size / 2
    r = size * 0.31
    draw_ball(img, cx, cy, r)
    draw_sparks(ImageDraw.Draw(img), cx, cy, r)
    return img.convert("RGB")


def make_adaptive_fg(size: int = 1024) -> Image.Image:
    rgb = Image.new("RGBA", (size, size), (*PITCH, 255))
    cx = cy = size / 2
    r = size * 0.26
    draw_ball(rgb, cx, cy, r)
    alpha = Image.new("L", (size, size), 0)
    ad = ImageDraw.Draw(alpha)
    ad.ellipse((cx - r - 4, cy - r - 4, cx + r + 4, cy + r + 4), fill=255)
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


def make_monochrome(size: int = 1024) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx = cy = size / 2
    r = size * 0.26
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255, 255))
    return img


def make_favicon(size: int = 64) -> Image.Image:
    return make_icon(size)


def save(img: Image.Image, name: str) -> None:
    path = ROOT / name
    img.save(path, "PNG", optimize=True)
    print(f"{name}: {path.stat().st_size} bytes {img.size} {img.mode}")


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    icon = make_icon(1024)
    save(icon, "icon.png")
    save(icon, "splash-icon.png")
    save(Image.new("RGB", (1024, 1024), PITCH), "android-icon-background.png")
    save(make_adaptive_fg(1024), "android-icon-foreground.png")
    save(make_monochrome(1024), "android-icon-monochrome.png")
    save(make_favicon(64), "favicon.png")


if __name__ == "__main__":
    main()
