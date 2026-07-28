#!/usr/bin/env python3
"""
VRAV Phase 6 — APK structure + optional apksigner verification.

Usage:
  python scripts/verify_apk_sig.py path/to/app.apk
  python scripts/verify_apk_sig.py --smoke   # synthetic zip smoke test (CI)

Exit 0 = pass, 1 = fail.
"""
from __future__ import annotations

import argparse
import io
import json
import os
import struct
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path


def check_zip_apk_structure(path: Path) -> dict:
    result = {
        "path": str(path),
        "ok": False,
        "is_zip": False,
        "has_manifest": False,
        "has_dex": False,
        "has_signature_block": False,
        "signing_scheme_hint": [],
        "errors": [],
    }
    if not path.is_file():
        result["errors"].append("file not found")
        return result

    try:
        with zipfile.ZipFile(path, "r") as zf:
            result["is_zip"] = True
            names = set(zf.namelist())
            result["has_manifest"] = "AndroidManifest.xml" in names
            result["has_dex"] = any(n.startswith("classes") and n.endswith(".dex") for n in names)
            # v1 JAR signing
            if any(n.startswith("META-INF/") and (n.endswith(".RSA") or n.endswith(".DSA") or n.endswith(".EC")) for n in names):
                result["signing_scheme_hint"].append("v1_jar")
                result["has_signature_block"] = True
            if "META-INF/MANIFEST.MF" in names:
                result["signing_scheme_hint"].append("meta_inf_manifest")
    except zipfile.BadZipFile:
        result["errors"].append("not a valid zip/apk")
        return result

    # APK Signing Block (v2/v3) sits before EOCD — heuristic scan
    try:
        data = path.read_bytes()
        if b"APK Sig Block 42" in data:
            result["signing_scheme_hint"].append("v2_or_v3_block")
            result["has_signature_block"] = True
    except OSError as e:
        result["errors"].append(str(e))

    if not result["has_manifest"]:
        result["errors"].append("missing AndroidManifest.xml")
    if not result["has_dex"]:
        result["errors"].append("missing classes*.dex")

    result["ok"] = (
        result["is_zip"]
        and result["has_manifest"]
        and result["has_dex"]
        and len(result["errors"]) == 0
    )
    return result


def run_apksigner(path: Path) -> dict:
    """Optional: requires Android build-tools apksigner on PATH."""
    out = {"available": False, "verified": None, "stdout": "", "stderr": ""}
    try:
        proc = subprocess.run(
            ["apksigner", "verify", "--verbose", str(path)],
            capture_output=True,
            text=True,
            timeout=60,
        )
        out["available"] = True
        out["stdout"] = proc.stdout[-2000:]
        out["stderr"] = proc.stderr[-2000:]
        out["verified"] = proc.returncode == 0
    except FileNotFoundError:
        out["stderr"] = "apksigner not installed"
    except subprocess.TimeoutExpired:
        out["stderr"] = "apksigner timeout"
    return out


def smoke_test() -> int:
    """Build a minimal zip that looks like an unsigned APK skeleton."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("AndroidManifest.xml", b"\x00\x00dummy")
        zf.writestr("classes.dex", b"dex\n035\\0" + b"\x00" * 20)
    with tempfile.NamedTemporaryFile(suffix=".apk", delete=False) as tmp:
        tmp.write(buf.getvalue())
        tmp_path = Path(tmp.name)
    try:
        r = check_zip_apk_structure(tmp_path)
        # unsigned is OK for structure smoke
        print(json.dumps({"smoke": True, "structure": r}, indent=2))
        return 0 if r["ok"] else 1
    finally:
        tmp_path.unlink(missing_ok=True)


def main() -> int:
    p = argparse.ArgumentParser(description="VRAV APK signature / structure verifier")
    p.add_argument("apk", nargs="?", help="Path to .apk")
    p.add_argument("--smoke", action="store_true", help="CI smoke test without real APK")
    p.add_argument("--apksigner", action="store_true", help="Also run apksigner if available")
    args = p.parse_args()

    if args.smoke:
        return smoke_test()

    if not args.apk:
        p.print_help()
        return 1

    path = Path(args.apk)
    structure = check_zip_apk_structure(path)
    report = {"structure": structure, "apksigner": None}

    if args.apksigner or os.environ.get("VRAV_REQUIRE_APKSIGNER") == "1":
        report["apksigner"] = run_apksigner(path)

    print(json.dumps(report, indent=2))

    if not structure["ok"]:
        return 1
    if report["apksigner"] and report["apksigner"].get("available") and report["apksigner"].get("verified") is False:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
