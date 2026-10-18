"""Check that all portfolio SVG previews are well-formed XML.

This detects browser-invisible assets even when they exist and have the
correct dimensions. Uses only the Python standard library.
"""

from pathlib import Path
import sys
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
paths = sorted((ROOT / "public" / "projects" / "previews").glob("*.svg"))

if not paths:
    raise SystemExit("No SVG previews found")

errors: list[str] = []
for asset in paths:
    try:
        tree = ET.parse(asset)
        root = tree.getroot()
        if root.tag != "{http://www.w3.org/2000/svg}svg":
            raise ValueError("missing SVG namespace")
        if root.get("viewBox") != "0 0 1200 720":
            raise ValueError("unexpected viewBox")
        print("OK", asset.relative_to(ROOT))
    except (ET.ParseError, ValueError) as exc:
        errors.append(f"{asset.relative_to(ROOT)}: {exc}")

if errors:
    print("Invalid SVG assets:\n" + "\n".join(errors), file=sys.stderr)
    sys.exit(1)

print(f"Validated {len(paths)} SVG files")
