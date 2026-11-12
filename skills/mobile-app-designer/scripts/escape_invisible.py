#!/usr/bin/env python3
"""Rewrite invisible, bidi-control, combining and presentation-form characters in source
files as \\uXXXX escapes, keeping ordinary letters (Latin, Arabic, ...) readable.

Why: tools sometimes write "\\u200F" as the raw invisible character. Raw bidi controls make
code display differently from how it runs (security scanners flag it, reviewers can't see it).

    python3 escape_invisible.py file.py [file2.kt ...]      # rewrites in place, prints counts
    python3 escape_invisible.py --check file.py             # exit 1 if anything needs escaping

Only safe where \\uXXXX is a valid escape inside strings and regexes (Python, Kotlin, Java,
JS/TS, Swift uses \\u{XXXX}: convert those by hand). Review the diff afterwards.
"""

import sys
import unicodedata

ESCAPE_CATEGORIES = {"Cf", "Cc", "Mn", "Me", "Zl", "Zp"}


def needs_escape(ch):
    o = ord(ch)
    if o < 128:
        return False
    if ch == "\u00a0" or unicodedata.category(ch) in ESCAPE_CATEGORIES:
        return True
    return 0xFB50 <= o <= 0xFDFF or 0xFE70 <= o <= 0xFEFF  # Arabic presentation forms


def main(args):
    check = args[:1] == ["--check"]
    paths = args[1:] if check else args
    if not paths:
        print(__doc__)
        return 2
    dirty = 0
    for path in paths:
        with open(path, encoding="utf-8") as f:
            src = f.read()
        count = sum(needs_escape(c) for c in src)
        dirty += count
        if count and not check:
            out = "".join("\\u%04x" % ord(c) if needs_escape(c) else c for c in src)
            with open(path, "w", encoding="utf-8") as f:
                f.write(out)
        print(f"{path}: {count} character(s) {'to escape' if check else 'escaped'}")
    return 1 if check and dirty else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
