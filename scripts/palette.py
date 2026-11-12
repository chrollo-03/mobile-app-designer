#!/usr/bin/env python3
"""Build a complete, contrast-checked colour system from one brand colour.

    python3 palette.py make "#3355FF"                         # report: tones, light + dark roles, contrast
    python3 palette.py make "#3355FF" --accent "#D4F25C" --format css|compose|swiftui|flutter|json
    python3 palette.py preset utility-lookup --format compose  # a curated palette from assets/palettes.json
    python3 palette.py check                                   # every preset passes WCAG AA in light and dark
    python3 palette.py panel                                   # rebuild assets/color-panel.html from the presets

How it works: the seed's hue and chroma (CIE LCh) generate tonal ramps where tone = L* lightness
(0 black ... 100 white), the same idea as Material 3. Roles take fixed tones (primary 40 light /
80 dark, on-primary 100 / 20, surfaces 98 / 6 ...), so contrast is predictable whatever the hue.
Chroma is reduced only as far as needed to stay inside sRGB. No dependencies.
"""

import argparse
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PRESETS = os.path.join(ROOT, "assets", "palettes.json")
TONES = [0, 4, 6, 10, 12, 17, 20, 22, 24, 30, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 99, 100]

# --- colour math (sRGB <-> XYZ D65 <-> CIELAB / LCh) -------------------------------------------

def hex_to_rgb(h):
    h = h.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        raise ValueError(f"not a hex colour: #{h}")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def rgb_to_hex(rgb):
    return "#%02X%02X%02X" % tuple(round(min(1, max(0, c)) * 255) for c in rgb)


def _lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _gam(c):
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


_WHITE = (0.95047, 1.0, 1.08883)


def rgb_to_lch(rgb):
    r, g, b = (_lin(c) for c in rgb)
    xyz = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
           0.2126729 * r + 0.7151522 * g + 0.0721750 * b,
           0.0193339 * r + 0.1191920 * g + 0.9503041 * b)
    f = [t ** (1 / 3) if t > 216 / 24389 else (24389 / 27 * t + 16) / 116 for t in (v / w for v, w in zip(xyz, _WHITE))]
    L, a, bb = 116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])
    return L, math.hypot(a, bb), math.degrees(math.atan2(bb, a)) % 360


def lch_to_rgb(L, C, H):
    a, b = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
    fy = (L + 16) / 116
    fx, fz = fy + a / 500, fy - b / 200
    inv = [t ** 3 if t ** 3 > 216 / 24389 else (116 * t - 16) / (24389 / 27) for t in (fx, fy, fz)]
    x, y, z = (v * w for v, w in zip(inv, _WHITE))
    r = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z
    g = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z
    bl = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z
    return tuple(_gam(max(0.0, c)) if c > 0 else 0.0 for c in (r, g, bl)), all(-1e-4 <= c <= 1 + 1e-4 for c in (r, g, bl))


def tone(hue, chroma, t):
    """Colour at lightness t with the hue, reducing chroma until it fits in sRGB."""
    if t <= 0:
        return "#000000"
    if t >= 100:
        return "#FFFFFF"
    lo, hi = 0.0, chroma
    rgb, ok = lch_to_rgb(t, hi, hue)
    if ok:
        return rgb_to_hex(rgb)
    for _ in range(24):  # binary search the largest in-gamut chroma
        mid = (lo + hi) / 2
        if lch_to_rgb(t, mid, hue)[1]:
            lo = mid
        else:
            hi = mid
    return rgb_to_hex(lch_to_rgb(t, lo, hue)[0])


def luminance(hexc):
    r, g, b = (_lin(c) for c in hex_to_rgb(hexc))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)

# --- palette ------------------------------------------------------------------------------------

def ramps(seed, accent=None):
    _, c, h = rgb_to_lch(hex_to_rgb(seed))
    c = max(c, 36)  # a near-grey seed still needs a usable primary
    if accent:
        _, ac, ah = rgb_to_lch(hex_to_rgb(accent))
    else:
        ac, ah = c * 0.8, (h + 60) % 360
    spec = {
        "primary": (h, c), "secondary": (h, c / 3), "tertiary": (ah, max(ac, 24)),
        "neutral": (h, 4), "neutralVariant": (h, 8), "error": (25, 80),
    }
    return {name: {t: tone(hh, cc, t) for t in TONES} for name, (hh, cc) in spec.items()}


ROLES = {  # role: (ramp, light tone, dark tone)
    "primary": ("primary", 40, 80), "onPrimary": ("primary", 100, 20),
    "primaryContainer": ("primary", 90, 30), "onPrimaryContainer": ("primary", 10, 90),
    "secondary": ("secondary", 40, 80), "onSecondary": ("secondary", 100, 20),
    "secondaryContainer": ("secondary", 90, 30), "onSecondaryContainer": ("secondary", 10, 90),
    "tertiary": ("tertiary", 40, 80), "onTertiary": ("tertiary", 100, 20),
    "tertiaryContainer": ("tertiary", 90, 30), "onTertiaryContainer": ("tertiary", 10, 90),
    "error": ("error", 40, 80), "onError": ("error", 100, 20),
    "errorContainer": ("error", 90, 30), "onErrorContainer": ("error", 10, 90),
    "background": ("neutral", 98, 6), "onBackground": ("neutral", 10, 90),
    "surface": ("neutral", 98, 6), "onSurface": ("neutral", 10, 90),
    "surfaceContainerLow": ("neutral", 96, 10), "surfaceContainer": ("neutral", 94, 12),
    "surfaceContainerHigh": ("neutral", 92, 17), "surfaceContainerHighest": ("neutral", 90, 22),
    "surfaceVariant": ("neutralVariant", 90, 30), "onSurfaceVariant": ("neutralVariant", 30, 80),
    "outline": ("neutralVariant", 50, 60), "outlineVariant": ("neutralVariant", 80, 30),
    "inverseSurface": ("neutral", 20, 90), "inverseOnSurface": ("neutral", 95, 20),
    "inversePrimary": ("primary", 80, 40),
}

PAIRS = [  # (foreground, background, minimum ratio, why)
    ("onPrimary", "primary", 4.5, "button text"),
    ("onPrimaryContainer", "primaryContainer", 4.5, "chip / tonal button text"),
    ("onSecondaryContainer", "secondaryContainer", 4.5, "selected item text"),
    ("onTertiaryContainer", "tertiaryContainer", 4.5, "accent container text"),
    ("onError", "error", 4.5, "error button text"),
    ("onSurface", "surface", 4.5, "body text"),
    ("onSurfaceVariant", "surface", 4.5, "secondary text"),
    ("onSurfaceVariant", "surfaceContainerHighest", 4.5, "secondary text on cards"),
    ("primary", "surface", 4.5, "links / text buttons"),
    ("error", "surface", 4.5, "error text"),
    ("outline", "surface", 3.0, "field borders, icons"),
]


def scheme(seed, accent=None, overrides=None):
    rp = ramps(seed, accent)
    out = {}
    for mode, idx in (("light", 1), ("dark", 2)):
        out[mode] = {role: rp[spec[0]][spec[idx]] for role, spec in ROLES.items()}
        out[mode].update((overrides or {}).get(mode, {}))
    return rp, out


def check(sch):
    rows = []
    for mode in ("light", "dark"):
        for fg, bg, need, why in PAIRS:
            r = contrast(sch[mode][fg], sch[mode][bg])
            rows.append({"mode": mode, "fg": fg, "bg": bg, "ratio": round(r, 2), "need": need,
                         "ok": r >= need, "why": why})
    return rows

# --- output -------------------------------------------------------------------------------------

def camel_to_kebab(s):
    return "".join("-" + c.lower() if c.isupper() else c for c in s)


def fmt(sch, kind, name):
    L, D = sch["light"], sch["dark"]
    if kind == "css":
        lines = [f"/* {name} - generated by palette.py */", ":root {"]
        lines += [f"  --color-{camel_to_kebab(k)}: {v};" for k, v in L.items()] + ["}",
                  "@media (prefers-color-scheme: dark) {", "  :root {"]
        lines += [f"    --color-{camel_to_kebab(k)}: {v};" for k, v in D.items()] + ["  }", "}"]
        return "\n".join(lines)
    if kind == "compose":
        def block(fn, m):
            body = ",\n".join(f"    {k} = Color(0xFF{v[1:]})" for k, v in m.items()
                              if not k.startswith("surfaceContainer"))
            return f"val {fn} = {'light' if fn.startswith('Light') else 'dark'}ColorScheme(\n{body},\n)"
        return ("// " + name + " - generated by palette.py\nimport androidx.compose.material3.*\n"
                "import androidx.compose.ui.graphics.Color\n\n" + block("LightColors", L) + "\n\n" + block("DarkColors", D) +
                "\n\n// Material 3 surfaceContainer* roles (set them too on Compose Material 3 1.2+):\n" +
                "\n".join(f"// {k}: light {L[k]}, dark {D[k]}" for k in L if k.startswith("surfaceContainer")))
    if kind == "swiftui":
        lines = [f"// {name} - generated by palette.py", "import SwiftUI", "import UIKit", "",
                 "private func dyn(_ l: UInt32, _ d: UInt32) -> Color {",
                 "    Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: d) : UIColor(hex: l) })", "}",
                 "private extension UIColor {",
                 "    convenience init(hex: UInt32) {",
                 "        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255,",
                 "                  blue: CGFloat(hex & 0xFF) / 255, alpha: 1)", "    }", "}", "",
                 "// A namespace, because SwiftUI already has Color.primary / Color.secondary.",
                 "// Use as: .foregroundStyle(AppColor.onSurface)",
                 "enum AppColor {"]
        lines += [f"    static let {k} = dyn(0x{L[k][1:]}, 0x{D[k][1:]})" for k in L] + ["}"]
        return "\n".join(lines)
    if kind == "flutter":
        def block(var, m, b):
            keep = [k for k in m if not k.startswith("surfaceContainer") and k not in ("background", "onBackground", "surfaceVariant")]
            return f"const {var} = ColorScheme(\n  brightness: Brightness.{b},\n" + "".join(
                f"  {k}: Color(0xFF{m[k][1:]}),\n" for k in keep) + ");"
        return (f"// {name} - generated by palette.py\nimport 'package:flutter/material.dart';\n\n"
                + block("lightScheme", L, "light") + "\n\n" + block("darkScheme", D, "dark"))
    if kind == "json":
        return json.dumps({"name": name, "color": {mode: {k: {"$type": "color", "$value": v} for k, v in sch[mode].items()}
                                                   for mode in ("light", "dark")}}, indent=2)
    raise ValueError(kind)


def report(name, rp, sch, rows):
    out = [f"# {name}", "", "Tonal ramps (tone: " + " ".join(str(t) for t in (10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99)) + ")"]
    for rname, r in rp.items():
        out.append(f"  {rname:15} " + " ".join(r[t] for t in (10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99)))
    out += ["", f"  {'role':26} {'light':8} {'dark':8}"]
    out += [f"  {k:26} {sch['light'][k]:8} {sch['dark'][k]:8}" for k in sch["light"]]
    out += ["", "Contrast (WCAG 2.2 AA):"]
    for r in rows:
        out.append(f"  {'ok  ' if r['ok'] else 'FAIL'} {r['mode']:5} {r['fg']:22} on {r['bg']:24} {r['ratio']:5}:1 (need {r['need']}, {r['why']})")
    return "\n".join(out)


def load_presets():
    with open(PRESETS, encoding="utf-8") as f:
        return json.load(f)["presets"]


def build_panel():
    tpl_path = os.path.join(ROOT, "assets", "color-panel.template.html")
    with open(tpl_path, encoding="utf-8") as f:
        tpl = f.read()
    data = json.dumps(load_presets(), ensure_ascii=False)
    out = os.path.join(ROOT, "assets", "color-panel.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(tpl.replace("/*__PRESETS__*/[]", data))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    m = sub.add_parser("make"); m.add_argument("seed"); m.add_argument("--accent"); m.add_argument("--name", default="Custom")
    p = sub.add_parser("preset"); p.add_argument("id")
    for s in (m, p):
        s.add_argument("--format", choices=["report", "css", "compose", "swiftui", "flutter", "json"], default="report")
    sub.add_parser("check"); sub.add_parser("panel"); sub.add_parser("list")
    a = ap.parse_args()

    if a.cmd == "list":
        for pr in load_presets():
            print(f"{pr['id']:22} {pr['seed']}  {pr.get('accent') or '':8} {pr['name']}: {pr['mood']}")
        return 0
    if a.cmd == "panel":
        print(build_panel())
        return 0
    if a.cmd == "check":
        bad = 0
        for pr in load_presets():
            _, sch = scheme(pr["seed"], pr.get("accent"), pr.get("overrides"))
            fails = [r for r in check(sch) if not r["ok"]]
            bad += len(fails)
            print(f"{'ok  ' if not fails else 'FAIL'} {pr['id']}" + "".join(
                f"\n      {r['mode']} {r['fg']} on {r['bg']}: {r['ratio']}:1 < {r['need']}" for r in fails))
        return 1 if bad else 0
    if a.cmd == "preset":
        pr = next((x for x in load_presets() if x["id"] == a.id), None)
        if not pr:
            sys.exit(f"unknown preset {a.id!r}; see: palette.py list")
        name, seed, accent, ov = pr["name"], pr["seed"], pr.get("accent"), pr.get("overrides")
    else:
        name, seed, accent, ov = a.name, a.seed, a.accent, None
    rp, sch = scheme(seed, accent, ov)
    rows = check(sch)
    print(report(name, rp, sch, rows) if a.format == "report" else fmt(sch, a.format, name))
    return 0 if all(r["ok"] for r in rows) or a.format != "report" else 1


if __name__ == "__main__":
    sys.exit(main())
