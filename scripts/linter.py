#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
VRAV Security Hub Core - DevSecOps Custom Linting Engine (Phase 2)
Scans Java, Kotlin, and Manifest specifications for covert malicious backdoors.
"""
import os
import re
import sys

CRITICAL_CHECK_PATTERNS = [
    # 1. Clear text system command execution bypassing standard handlers
    (r"Runtime\.getRuntime\(\)\.exec\(", "Arbitrary System Process Spawning (Class.exec)"),
    (r"ProcessBuilder", "Operating System Process Interaction channel"),
    
    # 2. Hardcoded secret / authentication API tokens leakages
    (r"vrav_sec_[a-f0-9]{32}", "Intact Plaintext Administrator Key Signature"),
    (r"AKIA[0-9A-Z]{16}", "AWS static secrets credential leak"),
    (r"AIzaSy[A-Za-z0-9_\\-]{33}", "Static Google API access credential"),
    
    # 3. Secure Transport override attacks
    (r"checkServerTrusted.*\{.*?\}", "SSL TrustManager validation bypass"),
    (r"setDefaultHostnameVerifier.*->.*true", "Insecure TLS SSL Hostname Override"),
]

MEDIUM_ALERT_PATTERNS = [
    # 4. Reflection anomalies bypasses
    (r"Class\.forName", "Dynamic Remote Reflection loading structures"),
    (r"ClassLoader\.getSystemClassLoader", "Internal system classpath access"),
    # 5. Overly wide Android Permissions
    (r"SYSTEM_ALERT_WINDOW", "SYSTEM OVERLAY PRIVILEGE (Bypasses UI security layers)"),
    (r"WRITE_SETTINGS", "CORE SYSTEM SETTINGS COMPROMISE PRIVILEGE"),
]

def analyze_vrav_files():
    failures = 0
    scanned_count = 0
    print("[VRAV_AUDIT_AGENT] Commencing scan of codebase source records...")
    
    for root, dirs, files in os.walk("."):
        # Exclude compilation caches 
        if any(exc in root for exc in ["node_modules", ".git", "build", "dist"]):
            continue
            
        for file in files:
            if file.endswith((".java", ".kt", ".xml")):
                scanned_count += 1
                file_path = os.path.join(root, file)
                
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    lines = content.splitlines()
                
                # Check for CRITICAL violations
                for pattern, rule_title in CRITICAL_CHECK_PATTERNS:
                    matches = re.finditer(pattern, content)
                    for match in matches:
                        # Find line number
                        line_idx = content[:match.start()].count("\n") + 1
                        print(f"[CRITICAL_ALERT] File: {file_path} @ Line {line_idx}: Breach of '{rule_title}' ruleset!")
                        failures += 1
                        
                # Check for MEDIUM violations
                for pattern, rule_title in MEDIUM_ALERT_PATTERNS:
                    matches = re.finditer(pattern, content)
                    for match in matches:
                        line_idx = content[:match.start()].count("\n") + 1
                        print(f"[MEDIUM_ALERT] File: {file_path} @ Line {line_idx}: Suspicious pattern found: {rule_title}")
                        # Medium violations raise issues but don't strictly fail unless configured
                        
    print("\n[VRAV_AUDIT_AGENT] Security Scan completed.")
    print(f"[VRAV_AUDIT_AGENT] Total files analyzed: {scanned_count}")
    print(f"[VRAV_AUDIT_AGENT] Ruleset Violations matching CRITICAL thresholds: {failures}")
    
    if failures > 0:
        print("[VRAV_VERDICT] Zero-Trust checks failed! Audit terminated with non-zero exit code.")
        sys.exit(1)
    else:
        print("[VRAV_VERDICT] Code integrity passed Zero-Trust signature criteria successfully.")
        sys.exit(0)

if __name__ == "__main__":
    analyze_vrav_files()
