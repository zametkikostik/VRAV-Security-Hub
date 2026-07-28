#!/usr/bin/env python3
"""Write fixtures/sample-unsigned.apk — minimal ZIP APK skeleton for CI structure checks."""
from __future__ import annotations

import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "fixtures" / "sample-unsigned.apk"


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    # Minimal binary-ish manifest + dex magic (unsigned — structure only)
    manifest = b"\x03\x00\x08\x00AndroidManifest"
    dex = b"dex\n035\x00" + b"\x00" * 64
    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("AndroidManifest.xml", manifest)
        zf.writestr("classes.dex", dex)
        zf.writestr("META-INF/MANIFEST.MF", b"Manifest-Version: 1.0\nCreated-By: VRAV-CI\n")
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
