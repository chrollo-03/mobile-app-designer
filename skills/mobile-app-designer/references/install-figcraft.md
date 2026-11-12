# Setting up FigCraft when no design tool is ready

Use this when phase 2 finds no usable design tool. Installing software and changing the user's
Claude Code config are changes to their machine: show the plan and ask before doing it.

## 1. Detect

```bash
python3 scripts/figcraft_setup.py detect
```

Reports OS, CPU, Linux distro and whether FUSE 2 is present (AppImages need it), registered
FigCraft/Figma MCP servers and their mode (headless or attached), whether the app is running, the
latest release, the file for this machine, ready-made `claude mcp add` commands, and a `next` hint.

Ask with one short question, e.g.: *"No design tool is set up. Install FigCraft 0.18 for Fedora
(~100 MB in your home folder) and connect it to Claude Code? / Use the web version in your browser /
Use HTML mockups instead."*

## 2. Choose a route

| Route | Best when | Claude drives it with | Notes |
|---|---|---|---|
| **Desktop + headless MCP** (recommended) | Claude does the designing | MCP tools, no window needed | Nothing to keep running; screenshots and exports still work; user opens the saved `.figcraft` in the app to look and click through |
| **Desktop + attached MCP** | the user wants to watch live | MCP tools, attached to the open app | App must be running with `--control 7979` **before** Claude Code starts |
| **Web build** (WebAssembly, in a browser) | no install allowed, or a quick look | Claude in Chrome / the built-in browser, by clicking | Slower and less precise than MCP; no `claude mcp` link. Good for viewing and small edits |
| **HTML mockups** | the user declines all of the above | files + headless browser screenshots | `other-tools.md` |

## 3. Download and verify

```bash
python3 scripts/figcraft_setup.py download --dir <install dir>        # desktop build for this OS
python3 scripts/figcraft_setup.py download --dir <dir> --web          # the web build zip
```

Files come from the latest `storytold/figcraft` GitHub release and are checked against its
`SHA256SUMS.txt`; a mismatch deletes the file and stops. No-admin install dirs: Linux
`~/Applications/figcraft`, macOS `~/Applications`, Windows `%LOCALAPPDATA%\Programs\FigCraft`.
~100 MB: on a slow connection run it in the background and tell the user.

## 4. Install

### Linux (Fedora and others)
- **AppImage (no root, recommended)**: `chmod +x figcraft-<ver>-linux-<arch>.AppImage`.
  Needs FUSE 2, if `detect` says `"fuse2": false`, the user runs the fix it prints, e.g. on
  Fedora `! sudo dnf install fuse fuse-libs` (Ubuntu: `libfuse2` / `libfuse2t64`). Without root,
  `--appimage-extract-and-run` works too.
- **Fedora/RHEL package**: `! sudo dnf install ./figcraft-<ver>-linux-x86_64.rpm` (system-wide,
  updates via file). Debian/Ubuntu: `.deb` with `sudo apt install ./file.deb`. Flatpak:
  `flatpak install --user ./file.flatpak`. These need the user's password, the user runs them with
  `!`, never Claude.
### macOS
`hdiutil attach figcraft-<ver>-macos-universal.dmg`, copy the `.app` to `~/Applications`,
`hdiutil detach`. First launch: right-click → Open (it's signed and notarized, but Gatekeeper may ask).
### Windows
`Expand-Archive figcraft-<ver>-windows-<x64|arm64>-portable.zip <dir>`, or run the `.msi`.

Find the executable instead of guessing: Linux = the AppImage (or `figcraft` on PATH for packages);
macOS = `ls <App>.app/Contents/MacOS/`; Windows = `Get-ChildItem <dir> -Recurse -Filter *.exe`.
Confirm with `<exe> cli mcp --help`.

## 5. Connect to Claude Code

**Headless (recommended)**, no app needs to run; confine file access to the project:

```bash
claude mcp add --scope user figcraft-app -- <exe> cli mcp --automation-write-root <project dir>
```

**Attached**, the user sees every change live:

```bash
setsid -f <exe> --control 7979        # Linux; macOS: open -a "<App>.app" --args --control 7979
claude mcp add --scope user figcraft-app -- <exe> cli mcp --attach 7979
```

Replace an older registration first: `claude mcp remove figcraft-app --scope user`. `detect`
prints both commands with the right path.

Then tell the user plainly: **restart Claude Code** (MCP servers connect at startup; in attached
mode, start FigCraft first). After the restart the `mcp__figcraft-app__*` tools appear; continue
with `figcraft.md`. A good first command is `file.newFromTemplate` with the built-in mobile app
template, to see the conventions, then start the real file.

## 6. Web build route

1. `download --web`, unzip into a folder, serve it locally: `python3 -m http.server 8765 -d <folder>`
   (browsers block WebAssembly from `file://`).
2. Open `http://localhost:8765` with the browser tool you have: Claude in Chrome (load its skill
   first) or the desktop app's built-in browser. Work by clicking and typing, screenshot often.
3. Save/export the `.figcraft` to the project folder so the checker and audit scripts can read it.

Record what was installed (route, path, version, port, launch command) in project memory so later
sessions don't redo it.
