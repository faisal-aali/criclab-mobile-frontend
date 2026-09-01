#!/usr/bin/env python3
"""Build Expo / iOS / Android launcher icons from the CricLab web master.

Source of truth: Cric-Lab/criclab-web-frontend/public/icons/icon-source.png
(the same 1024 mark on the marketing site). Resampled with LANCZOS, never
redrawn. Android adaptive layers punch lime to transparency so seams stay
cutouts against the lime plate; the ball is inset into the 66% safe zone.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WEB_SRC = Path(
    "/Users/macbookpro/Desktop/Cric-Lab/criclab-web-frontend/public/icons/icon-source.png"
)
ASSETS = ROOT / "assets"
IOS_APPICON = (
    ROOT / "ios/CricLab/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png"
)
IOS_SPLASH = ROOT / "ios/CricLab/Images.xcassets/SplashScreenLogo.imageset"
ANDROID_RES = ROOT / "android/app/src/main/res"

# Official adaptive safe zone is the inner 66 dp of a 108 dp layer.
SAFE_ZONE = 66 / 108
DENSITIES = ("mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi")
DENSITY_SCALE = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}


def resample(src: Image.Image, size: int) -> Image.Image:
    return src.resize((size, size), Image.Resampling.LANCZOS)


def lime_rgb(src: Image.Image) -> tuple[int, int, int]:
    return src.convert("RGB").getpixel((2, 2))


def extract_mark(src: Image.Image) -> Image.Image:
    """Keep the night ball; punch lime field and lime seams to alpha."""
    rgba = src.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = pixels[x, y]
            luma = 0.299 * r + 0.587 * g + 0.114 * b
            limeish = (g - r) > 18 and g > b and luma > 80
            if limeish:
                pixels[x, y] = (0, 0, 0, 0)
            elif luma < 36:
                pixels[x, y] = (r, g, b, 255)
            else:
                t = min(1.0, max(0.0, (luma - 36) / 70))
                pixels[x, y] = (r, g, b, int(round(255 * (1.0 - t))))
    return rgba


def fit_safe_zone(mark: Image.Image, size: int, scale: float) -> Image.Image:
    plate = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bbox = mark.getbbox()
    if not bbox:
        return plate
    cropped = mark.crop(bbox)
    max_side = max(cropped.size)
    inner = max(1, round(size * scale))
    ratio = inner / max_side
    w = max(1, round(cropped.size[0] * ratio))
    h = max(1, round(cropped.size[1] * ratio))
    placed = cropped.resize((w, h), Image.Resampling.LANCZOS)
    plate.paste(placed, ((size - w) // 2, (size - h) // 2), placed)
    return plate


def monochrome(mark: Image.Image, size: int, scale: float) -> Image.Image:
    inset = fit_safe_zone(mark, size, scale)
    pixels = inset.load()
    w, h = inset.size
    for y in range(h):
        for x in range(w):
            _r, _g, _b, a = pixels[x, y]
            if a:
                pixels[x, y] = (255, 255, 255, a)
    return inset


def save_webp(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "WEBP", lossless=True, quality=100, method=6)


def write_android(master: Image.Image, background: Image.Image, foreground: Image.Image, mono: Image.Image) -> None:
    if not ANDROID_RES.is_dir():
        return
    for name in DENSITIES:
        scale = DENSITY_SCALE[name]
        mip = ANDROID_RES / f"mipmap-{name}"
        launcher = resample(master, round(48 * scale)).convert("RGBA")
        save_webp(launcher, mip / "ic_launcher.webp")
        save_webp(launcher, mip / "ic_launcher_round.webp")
        layer = round(108 * scale)
        save_webp(background.resize((layer, layer), Image.Resampling.LANCZOS).convert("RGBA"), mip / "ic_launcher_background.webp")
        save_webp(foreground.resize((layer, layer), Image.Resampling.LANCZOS), mip / "ic_launcher_foreground.webp")
        save_webp(mono.resize((layer, layer), Image.Resampling.LANCZOS), mip / "ic_launcher_monochrome.webp")

        splash_size = round(288 * scale)
        splash = resample(master, splash_size).convert("RGBA")
        splash_dir = ANDROID_RES / f"drawable-{name}"
        splash_dir.mkdir(parents=True, exist_ok=True)
        splash.save(splash_dir / "splashscreen_logo.png", "PNG", optimize=True)


def write_ios(master: Image.Image) -> None:
    if IOS_APPICON.parent.is_dir():
        master.save(IOS_APPICON, "PNG", optimize=True)
    if IOS_SPLASH.is_dir():
        for name, size in (("image.png", 200), ("image@2x.png", 400), ("image@3x.png", 600)):
            resample(master, size).convert("RGBA").save(IOS_SPLASH / name, "PNG", optimize=True)


def main() -> None:
    src = Image.open(WEB_SRC).convert("RGB")
    if src.size != (1024, 1024):
        src = resample(src, 1024)
    ASSETS.mkdir(parents=True, exist_ok=True)

    master = resample(src, 1024)
    master.save(ASSETS / "icon.png", "PNG", optimize=True)
    master.save(ASSETS / "splash-icon.png", "PNG", optimize=True)
    resample(src, 48).save(ASSETS / "favicon.png", "PNG", optimize=True)

    lime = lime_rgb(src)
    background = Image.new("RGB", (1024, 1024), lime)
    background.save(ASSETS / "android-icon-background.png", "PNG", optimize=True)

    mark = extract_mark(master)
    foreground = fit_safe_zone(mark, 1024, SAFE_ZONE)
    foreground.save(ASSETS / "android-icon-foreground.png", "PNG", optimize=True)
    mono = monochrome(mark, 1024, SAFE_ZONE)
    mono.save(ASSETS / "android-icon-monochrome.png", "PNG", optimize=True)

    write_android(master, background, foreground, mono)
    write_ios(master)

    r, g, b = lime
    print(
        f"Wrote CricLab icons from web master. Adaptive lime #{r:02x}{g:02x}{b:02x}"
    )


if __name__ == "__main__":
    main()
