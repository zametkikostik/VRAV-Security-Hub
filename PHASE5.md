# Phase 5 — Verified catalog import

## Client SHA-256

GitHub release assets often cannot be hashed in-browser via `fetch` (CORS). Flow:

1. **Download** asset from GitHub (your machine).
2. **Hash local file + import** — SubtleCrypto SHA-256 → `hashVerified: true` + VT.
3. Or **paste** 64-hex SHA into the field, then **Import**.

Without a real hash, import still works but marks `hashVerified: false` and skips VT confidence.

## UI

- `GitHubCatalog` — paste SHA / local file hash
- `AppDetailsModal` — external Download, badges, real SHA or “Not provided”

## Next (phase 6 ideas)

- On-chain slash contract (Polygon) + wagmi `writeContract`
- Soft refresh of Store without full page reload (`vrav-apps-refresh` event)
- APK signature (apksigner) offline pipeline
