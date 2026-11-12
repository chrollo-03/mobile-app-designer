#!/usr/bin/env python3
"""Audit a .figcraft design for two rules designers break most: text contrast (WCAG 2.2 AA)
and tap-target size (iOS 44 pt, Android 48 dp).

    python3 audit_design.py design/App.figcraft "Screens"            # all screens on the page
    python3 audit_design.py design/App.figcraft "Screens" --prefix "Android /"
    python3 audit_design.py ... --no-contrast | --no-targets | --json

Contrast: each visible text layer against the nearest ancestor background, blending
semi-transparent fills; gradients use their worst stop. Needs 4.5:1, or 3:1 for large text
(>= 24 px, or >= 18.7 px bold). Text over sibling shapes (not ancestors) isn't seen; check those
by eye. Tap targets: layers with a click/tap interaction on screens, including layers inside the
main components of instances placed on screens. Exit code 1 when anything fails.
"""

import argparse
import json
import re
import sys
import zipfile

MIN_TARGET = {"iOS": 44, "Android": 48}
BOLD = re.compile(r"bold|black|heavy", re.I)


def lum(c):
    def ch(v):
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2])


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def blend(top, alpha, under):
    return tuple(t * alpha + u * (1 - alpha) for t, u in zip(top, under))


def hexc(c):
    return "#%02X%02X%02X" % tuple(round(v * 255) for v in c)


class Audit:
    def __init__(self, path, page_name, prefix):
        with zipfile.ZipFile(path) as z:
            doc = json.loads(z.read("document.json"))
        self.nodes = {int(k): v for k, v in doc["nodes"].items()}
        page = next(self.nodes[p] for p in doc["pages"] if self.nodes[p]["name"] == page_name)
        self.screens = [self.nodes[c] for c in page.get("children", [])
                        if self.nodes[c]["type"] == "frame" and self.nodes[c]["name"].startswith(prefix)
                        and re.match(r"^\S+ / ", self.nodes[c]["name"])]
        self.failures = []

    def visible(self, n):
        return n.get("visible", True) is not False and n.get("opacity", 1) > 0.01

    def paints(self, n):
        """Visible paints of a node as candidate colours (list of (rgb, alpha) options)."""
        out = []
        for f in n.get("fills", []) or []:
            if f.get("visible") is False:
                continue
            op = f.get("opacity", 1) * n.get("opacity", 1)
            if f.get("type") == "solid":
                c = f["color"]
                out.append([((c["r"], c["g"], c["b"]), c.get("a", 1) * op)])
            elif f.get("type") == "gradient":
                out.append([((s["color"]["r"], s["color"]["g"], s["color"]["b"]),
                             s["color"].get("a", 1) * op) for s in f.get("stops", [])])
        return out

    def backgrounds(self, n):
        """Possible opaque background colours behind node n (one per gradient stop combo)."""
        chain = []
        p = self.nodes.get(n.get("parent"))
        while p and p["type"] != "page":
            chain.append(p)
            p = self.nodes.get(p.get("parent"))
        layers = []
        for a in chain:  # nearest first
            for paint in reversed(self.paints(a)):
                layers.append(paint)
                if all(alpha >= 0.999 for _, alpha in paint):
                    break
            else:
                continue
            break
        bgs = [(1.0, 1.0, 1.0)]  # canvas default if nothing opaque found
        for paint in reversed(layers):  # farthest first
            bgs = [blend(rgb, alpha, b) for b in bgs for rgb, alpha in paint]
        return bgs

    def walk(self, n, screen, path):
        if not self.visible(n):
            return
        yield n, path
        for cid in n.get("children", []):
            c = self.nodes[cid]
            yield from self.walk(c, screen, path + [c["name"]])

    def check_contrast(self):
        for s in self.screens:
            for n, path in self.walk(s, s, []):
                if n["type"] != "text" or not n.get("characters", "").strip():
                    continue
                fills = [p for p in self.paints(n) if len(p) == 1]
                if not fills:
                    continue
                (rgb, alpha), = fills[-1]
                st = n.get("style", {})
                size = st.get("font_size", 16)
                large = size >= 24 or (size >= 18.66 and BOLD.search(st.get("font_style", "")))
                need = 3.0 if large else 4.5
                worst = None
                for bg in self.backgrounds(n):
                    r = ratio(blend(rgb, alpha, bg), bg)
                    if worst is None or r < worst[0]:
                        worst = (r, bg)
                if worst and worst[0] < need:
                    self.failures.append({
                        "rule": "contrast", "screen": s["name"], "layer": " › ".join(path),
                        "text": n["characters"][:40], "ratio": round(worst[0], 2), "need": need,
                        "fg": hexc(blend(rgb, alpha, worst[1])), "bg": hexc(worst[1]), "size": size})

    def tappable(self, n):
        return any(it.get("trigger", {}).get("type") in ("onClick", "onPress", "onTap")
                   for it in n.get("interactions", []) or [])

    def check_targets(self):
        for s in self.screens:
            platform = s["name"].split(" / ")[0]
            if platform == "Overlay":  # sheets are named "Overlay / Name · Platform"
                platform = s["name"].rsplit("· ", 1)[-1]
            need = MIN_TARGET.get(platform, 44)
            for n, path in self.walk(s, s, []):
                if n is s:
                    continue
                if self.tappable(n):
                    self.target(s, path, n, need)
                if n["type"] == "instance" and n.get("component") in self.nodes:
                    main = self.nodes[n["component"]]
                    for m, mpath in self.walk(main, main, []):
                        if m is not main and self.tappable(m):
                            self.target(s, path + mpath, m, need)

    def target(self, s, path, n, need):
        w, h = n.get("width", 0), n.get("height", 0)
        if w < need or h < need:
            self.failures.append({"rule": "tap target", "screen": s["name"], "layer": " › ".join(path),
                                  "size": f"{w:g}×{h:g}", "need": f"{need}×{need}"})


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file")
    ap.add_argument("page")
    ap.add_argument("--prefix", default="")
    ap.add_argument("--no-contrast", action="store_true")
    ap.add_argument("--no-targets", action="store_true")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    audit = Audit(a.file, a.page, a.prefix)
    if not a.no_contrast:
        audit.check_contrast()
    if not a.no_targets:
        audit.check_targets()
    seen, unique = set(), []
    for f in audit.failures:  # instances repeat main-component findings; report each once per screen
        key = (f["rule"], f["screen"], f["layer"])
        if key not in seen:
            seen.add(key)
            unique.append(f)
    if a.json:
        print(json.dumps(unique, indent=2, ensure_ascii=False))
    else:
        for f in unique:
            if f["rule"] == "contrast":
                print(f"CONTRAST  {f['screen']} › {f['layer']}: {f['ratio']}:1 < {f['need']}:1 "
                      f"({f['fg']} on {f['bg']}, {f['size']:g}px) {f['text']!r}")
            else:
                print(f"TARGET    {f['screen']} › {f['layer']}: {f['size']} < {f['need']}")
        sheets = sum(s["name"].startswith("Overlay / ") for s in audit.screens)
        print(f"\n{len(audit.screens) - sheets} screens + {sheets} sheets, {len(unique)} issue(s)")
    return 1 if unique else 0


if __name__ == "__main__":
    sys.exit(main())
