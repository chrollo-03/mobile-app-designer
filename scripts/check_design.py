#!/usr/bin/env python3
"""Check a .figcraft design against a spec: screens exist on every platform at the
right size, prototype links land on real screens, key flows go where they should,
every screen is reachable, variables are saved at their defaults, and exports exist.

    python3 check_design.py design-spec.json        # exit 0 = all pass, 1 = failures

The .figcraft file is a zip holding document.json; nothing here needs FigCraft running.
Save the file in FigCraft before checking. See templates/design-spec.example.json.
"""

import json
import os
import re
import struct
import sys
import zipfile


def load(spec_path):
    with open(spec_path, encoding="utf-8") as f:
        spec = json.load(f)
    base = os.path.dirname(os.path.abspath(spec_path))
    with zipfile.ZipFile(os.path.join(base, spec["file"])) as z:
        doc = json.loads(z.read("document.json"))
    return spec, base, doc


class Checker:
    def __init__(self, spec, base, doc):
        self.spec, self.base = spec, base
        self.nodes = {int(k): v for k, v in doc["nodes"].items()}
        self.pages = {self.nodes[p]["name"]: self.nodes[p] for p in doc["pages"]}
        self.variables = {v["name"]: v for v in doc.get("variables", {}).get("variables", [])}
        self.results = []  # (ok, check, detail)

        platforms = "|".join(map(re.escape, spec["platforms"]))
        self.screen_re = re.compile(rf"^({platforms}) / (\w+) (.+)$")
        page = self.pages.get(spec["page"], {})
        self.screens, self.overlays = {}, {}
        prefix = spec.get("overlay_prefix", "Overlay / ")
        for cid in page.get("children", []):
            n = self.nodes[cid]
            m = self.screen_re.match(n["name"])
            if n["type"] == "frame" and m:
                self.screens[(m[1], m[2])] = n
            elif n["name"].startswith(prefix):
                self.overlays[cid] = n["name"].rsplit("· ", 1)[-1]
        self.screen_ids = {n["id"]: key for key, n in self.screens.items()}

        self.links = []  # (platform, screen num, layer name, dest id)
        for n in self.nodes.values():
            for it in n.get("interactions", []):
                for a in self._actions(it.get("actions", [])):
                    top = self._top(n)
                    if "dest" in a and top and top["id"] in self.screen_ids:
                        self.links.append((*self.screen_ids[top["id"]], n["name"], a["dest"]))

    def _actions(self, actions):
        # conditional actions nest more actions inside blocks
        for a in actions:
            yield a
            for b in a.get("blocks", []):
                yield from self._actions(b.get("actions", []))

    def _top(self, n):
        while n.get("parent") in self.nodes and self.nodes[n["parent"]]["type"] != "page":
            n = self.nodes[n["parent"]]
        return n if n.get("parent") in self.nodes else None

    def check(self, ok, name, detail=""):
        self.results.append((bool(ok), name, detail))

    def expected(self, platform):
        return {**self.spec["screens"], **self.spec.get("platform_screens", {}).get(platform, {})}

    def run(self):
        s = self.spec
        self.check(s["page"] in self.pages, f"page '{s['page']}' exists")
        for platform, conf in s["platforms"].items():
            for num, name in self.expected(platform).items():
                node = self.screens.get((platform, num))
                label = f"{platform} / {num} {name}"
                self.check(node is not None, f"screen exists: {label}")
                if node is None:
                    continue
                self.check(node["name"] == label, f"screen name: {label}", node["name"])
                size = (node["width"], node["height"])
                self.check(size == tuple(conf["size"]), f"screen size: {label}", f"{size}")

        known = {(p, n) for p in s["platforms"] for n in self.expected(p)}
        extra = sorted(f"{p} / {n}" for p, n in set(self.screens) - known)
        self.check(not extra, "no unlisted screens (add new ones to the spec)", ", ".join(extra))

        for platform, num, layer, dest in self.links:
            where = f"link {platform} / {num} · {layer}"
            if dest not in self.nodes:
                self.check(False, where, f"points at deleted layer {dest}")
            elif dest in self.overlays:
                self.check(self.overlays[dest] == platform, where, "overlay of another platform")
            elif dest not in self.screen_ids:
                self.check(False, where, f"layer {dest} is not a screen or overlay")
            else:
                self.check(self.screen_ids[dest][0] == platform, where, "crosses platforms")

        found = {}
        for p, n, layer, dest in self.links:
            found.setdefault((p, n, layer), set()).add(self.screen_ids.get(dest, (None, None))[1])
        for f in s.get("flows", []):
            key = (f["platform"], f["from"], f["layer"])
            self.check(f["to"] in found.get(key, set()),
                       f"flow {f['platform']} / {f['from']} · {f['layer']} -> {f['to']}",
                       f"goes to {sorted(x for x in found.get(key, set()) if x)}" if key in found
                       else "no link on that layer")

        reached = {self.screen_ids[d] for *_, d in self.links if d in self.screen_ids}
        for (p, n), node in sorted(self.screens.items()):
            if n not in s.get("not_linked", []):
                self.check((p, n) in reached, f"reachable: {node['name']}",
                           "no prototype link leads here")

        for name, want in s.get("defaults", {}).items():
            var = self.variables.get(name)
            got = list(var["values"].values())[0]["value"] if var else None
            self.check(var is not None and got == want, f"variable '{name}' saved at default",
                       f"is {got!r}, want {want!r}")

        exp = s.get("exports")
        if exp:
            for (p, n), node in self.screens.items():
                words = re.sub(r"[^\w]+", " ", self.screen_re.match(node["name"])[3]).split()
                fname = exp.get("pattern", "{platform}-{num}-{name}.png").format(
                    platform=p, num=n, name="-".join(words))
                self.check(os.path.exists(os.path.join(self.base, exp["dir"], fname)),
                           f"exported: {fname}")

        for rel in s.get("required_files", []):
            self.check(os.path.exists(os.path.join(self.base, rel)), f"file exists: {rel}")
        for rel in s.get("no_alpha", []):
            path = os.path.join(self.base, rel)
            ok = False
            if os.path.exists(path):
                with open(path, "rb") as fh:
                    head = fh.read(26)
                ok = head[:8] == b"\x89PNG\r\n\x1a\n" and head[25] == 2  # colour type 2 = RGB
            self.check(ok, f"no alpha channel (store icon): {rel}")
        return self.results


def main(argv):
    if len(argv) != 2:
        print(__doc__)
        return 2
    results = Checker(*load(argv[1])).run()
    failed = [r for r in results if not r[0]]
    for ok, name, detail in results:
        if not ok:
            print(f"FAIL  {name}" + (f"  ({detail})" if detail else ""))
    print(f"\n{len(results) - len(failed)} passed, {len(failed)} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
