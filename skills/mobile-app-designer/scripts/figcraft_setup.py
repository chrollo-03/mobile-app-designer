#!/usr/bin/env python3
"""Find out whether a design tool is ready, and fetch FigCraft if it isn't.

    python3 figcraft_setup.py detect                 # JSON report: OS, arch, MCP config, app running, asset to use
    python3 figcraft_setup.py download --dir DIR     # download that asset and verify its SHA-256
    python3 figcraft_setup.py download --dir DIR --asset NAME   # a specific release file

Only reads and downloads; it never installs, launches or registers anything. Those steps are in
references/install-figcraft.md and need the user's OK first. No dependencies beyond Python 3.
"""

import argparse
import hashlib
import json
import os
import platform
import shutil
import socket
import sys
import urllib.request

REPO = "storytold/figcraft"
PORT = 7979
API = f"https://api.github.com/repos/{REPO}/releases/latest"


def get_json(url):
    req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json",
                                               "User-Agent": "mobile-app-designer"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def os_arch():
    system = {"Linux": "linux", "Darwin": "macos", "Windows": "windows", "FreeBSD": "freebsd"}.get(
        platform.system(), platform.system().lower())
    machine = platform.machine().lower()
    arch = {"amd64": "x86_64", "x64": "x86_64", "arm64": "aarch64"}.get(machine, machine)
    return system, arch


def pick_asset(names, system, arch):
    """Preferred release file per OS: no-root installs first."""
    win_arch = {"x86_64": "x64", "aarch64": "arm64"}.get(arch, arch)
    prefs = {
        "linux": [f"linux-{arch}.AppImage", f"linux-{arch}.tar.gz"],
        "macos": ["macos-universal.dmg"],
        "windows": [f"windows-{win_arch}-portable.zip", f"windows-{win_arch}.msi"],
        "freebsd": [f"freebsd-{arch}.tar.gz"],
    }.get(system, [])
    for suffix in prefs:
        for n in names:
            if n.endswith(suffix) and not n.startswith("figcraft-cli"):
                return n
    return None


def mcp_servers():
    """MCP server names from Claude Code's user config (names and commands only)."""
    found = {}
    path = os.path.expanduser("~/.claude.json")
    try:
        with open(path, encoding="utf-8") as f:
            conf = json.load(f)
    except (OSError, ValueError):
        return found

    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k == "mcpServers" and isinstance(v, dict):
                    for name, s in v.items():
                        if isinstance(s, dict):
                            found[name] = " ".join([s.get("command") or s.get("url") or ""] + s.get("args", []))
                else:
                    walk(v)
    walk(conf)
    return found


def port_open(port=PORT):
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=1):
            return True
    except OSError:
        return False


def linux_info():
    """Distro id and whether FUSE 2 (needed by AppImages) is present."""
    info = {}
    try:
        with open("/etc/os-release", encoding="utf-8") as f:
            kv = dict(line.rstrip().split("=", 1) for line in f if "=" in line)
        info["distro"] = kv.get("ID", "").strip('"')
        info["distro_version"] = kv.get("VERSION_ID", "").strip('"')
        info["distro_like"] = kv.get("ID_LIKE", "").strip('"')
    except OSError:
        pass
    libdirs = ["/usr/lib64", "/usr/lib", "/usr/lib/x86_64-linux-gnu", "/usr/lib/aarch64-linux-gnu", "/lib/x86_64-linux-gnu"]
    info["fuse2"] = any(os.path.exists(os.path.join(d, "libfuse.so.2")) for d in libdirs)
    family = (info.get("distro", "") + " " + info.get("distro_like", "")).lower()
    if not info["fuse2"]:
        if "fedora" in family or "rhel" in family:
            info["fuse2_fix"] = "sudo dnf install fuse fuse-libs"
        elif "debian" in family or "ubuntu" in family:
            info["fuse2_fix"] = "sudo apt install libfuse2   # libfuse2t64 on Ubuntu 24.04+"
        elif "arch" in family:
            info["fuse2_fix"] = "sudo pacman -S fuse2"
        else:
            info["fuse2_fix"] = "install your distro's FUSE 2 package, or run the AppImage with --appimage-extract-and-run"
    return info


def mcp_commands(exe, project_dir=None):
    root = f" --automation-write-root {project_dir}" if project_dir else ""
    return {
        "headless": f"claude mcp add --scope user figcraft-app -- {exe} cli mcp{root}",
        "attached": f"claude mcp add --scope user figcraft-app -- {exe} cli mcp --attach {PORT}",
        "launch_for_attached": {"linux": f"setsid -f {exe} --control {PORT}"},
    }


def detect():
    system, arch = os_arch()
    servers = mcp_servers()
    figcraft = {n: c for n, c in servers.items() if "figcraft" in (n + c).lower()}
    figma = [n for n, c in servers.items() if "figma" in (n + c).lower() and "figcraft" not in (n + c).lower()]
    report = {
        "os": system, "arch": arch,
        "figcraft_mcp": figcraft or None,
        "figcraft_command_exists": any(os.path.exists(c.split(" ")[0]) for c in figcraft.values()) if figcraft else False,
        "figcraft_app_running": port_open(),
        "figma_mcp": figma or None,
        "claude_cli": shutil.which("claude"),
    }
    if system == "linux":
        report.update(linux_info())
    if figcraft:
        exe = next(iter(figcraft.values())).split(" ")[0]
        report["mcp_mode"] = "attached" if "--attach" in next(iter(figcraft.values())) else "headless"
        report["commands"] = mcp_commands(exe)
    try:
        rel = get_json(API)
        names = [a["name"] for a in rel["assets"]]
        asset = pick_asset(names, system, arch)
        report.update(latest=rel["tag_name"], asset=asset,
                      url=next((a["browser_download_url"] for a in rel["assets"] if a["name"] == asset), None))
    except OSError as e:
        report["latest_error"] = str(e)
    if report["figcraft_mcp"] and report["figcraft_command_exists"]:
        if report.get("mcp_mode") == "headless" or report["figcraft_app_running"]:
            report["next"] = "ready (restart Claude Code if the tools aren't listed)"
        else:
            report["next"] = ("attached mode needs the app: launch it, then restart Claude Code; "
                              "or switch to headless (commands.headless) so no app is needed")
    else:
        report["next"] = "install FigCraft (ask the user first)"
    return report


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def download(dest_dir, asset=None):
    rel = get_json(API)
    by_name = {a["name"]: a["browser_download_url"] for a in rel["assets"]}
    asset = asset or pick_asset(list(by_name), *os_arch())
    if asset not in by_name:
        sys.exit(f"no release asset {asset!r} in {rel['tag_name']}")
    with urllib.request.urlopen(by_name["SHA256SUMS.txt"], timeout=30) as r:
        sums = dict(line.split()[::-1] for line in r.read().decode().splitlines() if line.strip())
    if asset not in sums:
        sys.exit(f"{asset} is not listed in SHA256SUMS.txt; refusing to use an unverified file")
    os.makedirs(dest_dir, exist_ok=True)
    path = os.path.join(dest_dir, asset)
    print(f"downloading {asset} ({rel['tag_name']}) ...", file=sys.stderr)
    urllib.request.urlretrieve(by_name[asset], path)
    got = sha256(path)
    if got != sums[asset]:
        os.remove(path)
        sys.exit(f"checksum mismatch for {asset}: got {got}, expected {sums[asset]} (file deleted)")
    print(json.dumps({"path": path, "sha256": got, "verified": True, "version": rel["tag_name"]}, indent=2))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("detect")
    d = sub.add_parser("download")
    d.add_argument("--dir", required=True)
    d.add_argument("--asset")
    d.add_argument("--web", action="store_true", help="the browser (WebAssembly) build instead")
    a = p.parse_args()
    if a.cmd == "detect":
        print(json.dumps(detect(), indent=2))
    else:
        asset = a.asset
        if a.web and not asset:
            names = [x["name"] for x in get_json(API)["assets"]]
            asset = next((n for n in names if n.startswith("figcraft-web-") and n.endswith(".zip")), None)
        download(a.dir, asset)


if __name__ == "__main__":
    main()
