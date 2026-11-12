#!/usr/bin/env python3
"""Dump the design tokens actually used in a .figcraft file: text styles (with a sample),
solid colours by frequency, gradients and corner radii, for the frames whose names start
with a prefix. Use it to write DESIGN-TOKENS.md from real values instead of memory.

    python3 extract_tokens.py design/App.figcraft "Screens" "Android /"
    python3 extract_tokens.py design/App.figcraft "Screens" ""        # every frame on the page
"""

import collections
import json
import sys
import zipfile


def hexc(c):
    out = "#%02X%02X%02X" % tuple(round(c[k] * 255) for k in "rgb")
    a = c.get("a", 1)
    return out if a >= 0.999 else out + "%02X" % round(a * 255)


def main(path, page_name, prefix):
    with zipfile.ZipFile(path) as z:
        doc = json.loads(z.read("document.json"))
    nodes = {int(k): v for k, v in doc["nodes"].items()}
    page = next(nodes[p] for p in doc["pages"] if nodes[p]["name"] == page_name)

    def top(n):
        while n.get("parent") in nodes and nodes[n["parent"]]["type"] != "page":
            n = nodes[n["parent"]]
        return n

    styles, colors, grads, radii = {}, collections.Counter(), collections.Counter(), collections.Counter()
    for n in nodes.values():
        if n.get("parent") not in nodes:
            continue
        t = top(n)
        if t.get("parent") != page["id"] or not t["name"].startswith(prefix):
            continue
        for f in n.get("fills", []):
            if f.get("type") == "solid":
                colors[hexc({**f["color"], "a": f["color"].get("a", 1) * f.get("opacity", 1)})] += 1
            elif f.get("type") == "gradient":
                grads[" -> ".join(hexc(s["color"]) for s in f["stops"])] += 1
        if n.get("corners"):
            radii[n["corners"]["radii"][0]] += 1
        if n["type"] == "text":
            st = n["style"]
            ls = st.get("letter_spacing", {})
            key = (st["font_family"], st["font_style"], st["font_size"],
                   f"{ls.get('value', 0)}{'px' if ls.get('unit') == 'pixels' else '%'}")
            styles.setdefault(key, n.get("characters", "")[:30])

    print("TEXT STYLES (family, style, size, letter spacing) | sample")
    for k, v in sorted(styles.items(), key=lambda kv: -kv[0][2]):
        print(f"  {k[0]:18} {k[1]:10} {k[2]:>5} {k[3]:>8} | {v!r}")
    print("\nCOLOURS (uses)")
    for c, n in colors.most_common():
        print(f"  {c}  {n}")
    print("\nGRADIENTS")
    for g, n in grads.most_common():
        print(f"  {g}  ({n})")
    print("\nCORNER RADII (uses)")
    for r, n in radii.most_common():
        print(f"  {r:g}  {n}")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(2)
    main(*sys.argv[1:])
