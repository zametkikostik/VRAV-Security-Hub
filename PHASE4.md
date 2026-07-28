# Phase 4 — GitHub releases catalog

## Principles

- VRAV **does not host** APK/IPA binaries for installation.
- Users download **only** via GitHub `browser_download_url`.
- Import into hub = metadata + optional SHA-256 + VirusTotal **by hash**.
- Without a real file hash, VT result is based on a metadata digest (document this to users).

## API

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/github/releases?owner=&repo=` | public |
| GET | `/api/catalog/github-presets` | public |
| POST | `/api/catalog/import-github` | SIWE / admin token |
| POST | `/api/catalog/hash-url` | auth + `ALLOW_REMOTE_HASH=true` |

## Env

```env
GITHUB_TOKEN=ghp_...          # optional, higher rate limits
GITHUB_CATALOG_PRESETS=owner/repo,other/repo
ALLOW_REMOTE_HASH=false       # set true only if you accept server-side fetch risk
```

## UI

Bottom-left button **GitHub releases catalog** → fetch → Download (GitHub) / Import to hub.

## Wiring

`server.ts` must call `registerGithubRoutes` (see commit). If routes 404, ensure import is present.
