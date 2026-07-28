# VRAV Security Hub — security & product readiness

**Date:** 2026-07-29  
**Scope:** `main` after phases 1–4

## Executive verdict

| Question | Answer |
|----------|--------|
| Is this a full commercial app store (Play / App Store class)? | **No** |
| Is this a **safe security catalog + DevSecOps hub** MVP? | **Yes, with caveats** |
| Safe to auto-install untrusted APK/IPA from the hub? | **Never designed to; do not add this** |
| Production-ready for public internet with empty `ADMIN_WALLETS`? | **No** — lock allowlist + secrets first |

This product is correctly positioned as a **zero-trust catalog and audit console**: list apps, scan code, SIWE-gated registry edits, external GitHub downloads. It is **not** a binary distribution CDN and must not become one without sandboxing, legal review, and AV pipeline at file-ingest scale.

---

## What is solid (keep)

1. **Mutation auth** — SIWE JWT and/or `X-Admin-Token`; rate limits; Zod on inputs.
2. **No binary hosting by default** — GitHub `browser_download_url` only; remote hash opt-in.
3. **VirusTotal by hash** — reduces malware upload to third parties when a real hash is known.
4. **Helmet, CORS, body limits, multer type filter** — baseline API hygiene.
5. **Atomic manifest writes** — reduces corrupt JSON under concurrent writes.
6. **Slash / critical path** — registry can mark packages untrusted; UI can block “install” simulation for critical/slashed.

---

## Critical gaps before calling it a “store”

### P0 — must fix before public deploy

| Gap | Risk | Mitigation |
|-----|------|------------|
| `App.tsx` publish/slash may still omit `adminHeaders()` | 401 or broken UX | Import `adminHeaders` on POST `/api/apps` and `/api/slash` |
| Empty `ADMIN_WALLETS` | Any SIWE wallet can mutate catalog | Set allowlist in production |
| Weak / default `JWT_SECRET` | Session forgery | Strong secret, rotate |
| `manifest.json` as sole DB | No audit log, no backup, race at scale | Postgres + append-only audit |
| Metadata SHA used as VT input | False “clean” signals | Require `hashVerified` + real file SHA |
| Simulated install / IPFS / HSM in UI | User over-trust | Label UI “simulated” vs “external download” |

### P1 — real store features still missing

- Publisher identity KYC / verified developer accounts  
- Code signing verification (APK sig / IPA provisioning)  
- Reproducible builds + SBOM  
- TOS, DMCA, malware reporting, age ratings  
- CDN + malware isolation (if you ever host files)  
- iOS distribution only via TestFlight/App Store (sideload “store” is not viable at scale)  
- On-chain slash only with audited contract + clear gas/UX  

### P2 — engineering debt

- Monolithic `App.tsx` (~125KB)  
- Floating Wallet/GitHub UI not integrated into tabs  
- No automated e2e tests for auth + import  
- README still describes pure simulation in places  

---

## Recommended operating model (safe “store”)

```
Publisher → GitHub Release (APK/IPA)
         → real SHA-256 of asset
         → VRAV import (SIWE) + VT by hash
         → catalog card: Open GitHub / Download external
User     → reads VT + trust + attestation
         → downloads from GitHub (not from VRAV)
         → installs with OS tools (sideload disclaimer)
```

Never: `POST /install` that streams APK from your server to device without enterprise MDM and legal cover.

---

## Pre-flight checklist

- [ ] `JWT_SECRET` ≥ 32 random bytes  
- [ ] `ADMIN_WALLETS` set to operator addresses  
- [ ] `ADMIN_API_TOKEN` only for CI, not in public frontend builds  
- [ ] `VIRUSTOTAL_API_KEY` for real hash lookups  
- [ ] `GITHUB_TOKEN` for rate limits  
- [ ] `ALLOW_REMOTE_HASH=false` unless you accept SSRF-style fetch risk  
- [ ] TLS reverse proxy (Caddy/nginx)  
- [ ] `App.tsx` uses `adminHeaders()` for mutations  
- [ ] Production: empty allowlist **rejected** (optional code enforce)  

---

## Bottom line

**OK as:** secure **registry + scanner + GitHub-linked catalog** for security-conscious operators.  
**Not OK as:** drop-in Play Store / sideload mall for arbitrary APKs.  

Further product work should deepen **verification** (real hashes, signatures, allowlists), not **distribution** of untrusted binaries.
