import { useCallback, useEffect, useState } from 'react';
import { adminHeaders } from '../lib/adminHeaders';
import { getSessionToken } from '../lib/siweAuth';

type Asset = {
  id: number;
  name: string;
  size: number;
  downloadUrl: string;
  isPackage: boolean;
};

type Release = {
  id: number;
  tag: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  assets: Asset[];
};

export function GitHubCatalog() {
  const [open, setOpen] = useState(false);
  const [owner, setOwner] = useState('zametkikostik');
  const [repo, setRepo] = useState('VRAV-Security-Hub');
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [presets, setPresets] = useState<{ owner: string; repo: string }[]>([]);

  useEffect(() => {
    fetch('/api/catalog/github-presets')
      .then((r) => r.json())
      .then((d) => setPresets(d.presets || []))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setImportMsg(null);
    try {
      const res = await fetch(
        `/api/github/releases?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || 'Failed');
      setReleases(data.releases || []);
    } catch (e: any) {
      setError(e.message);
      setReleases([]);
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  const importAsset = async (rel: Release, asset: Asset) => {
    setImportMsg(null);
    if (!getSessionToken() && !import.meta.env.VITE_ADMIN_API_TOKEN) {
      setImportMsg('Sign in with Ethereum (or set admin token) before import');
      return;
    }
    try {
      const res = await fetch('/api/catalog/import-github', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          owner,
          repo,
          tag: rel.tag,
          assetName: asset.name,
          downloadUrl: asset.downloadUrl,
          name: `${repo} ${rel.tag}`,
          description: `Package ${asset.name} from GitHub release ${rel.tag}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setImportMsg(
        `Imported ${data.app?.id} · VT: ${data.app?.virustotalScore}. External link only.`
      );
    } catch (e: any) {
      setImportMsg(e.message);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 left-4 z-[100] px-3 py-2 rounded-xl bg-neutral-900 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-400 shadow-lg hover:bg-neutral-800 cursor-pointer"
      >
        {open ? 'Close GitHub catalog' : 'GitHub releases catalog'}
      </button>

      {open && (
        <div className="fixed bottom-16 left-4 z-[100] w-[min(420px,calc(100vw-2rem))] max-h-[70vh] overflow-hidden flex flex-col rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl text-neutral-200">
          <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900">
            <div className="text-xs font-mono font-bold text-emerald-400 tracking-wide">
              PHASE 4 · GITHUB CATALOG
            </div>
            <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
              Browse release assets. Import registers metadata + VT-by-hash. Download is always
              external (GitHub) — no auto-install.
            </p>
          </div>

          <div className="p-3 space-y-2 border-b border-neutral-800">
            <div className="flex gap-2">
              <input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="owner"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-[11px] font-mono"
              />
              <input
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="repo"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-[11px] font-mono"
              />
            </div>
            {presets.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {presets.map((p) => (
                  <button
                    key={`${p.owner}/${p.repo}`}
                    type="button"
                    onClick={() => {
                      setOwner(p.owner);
                      setRepo(p.repo);
                    }}
                    className="text-[9px] px-2 py-0.5 rounded border border-neutral-700 text-neutral-400 hover:text-emerald-400 cursor-pointer"
                  >
                    {p.owner}/{p.repo}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-[11px] font-bold font-mono disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Loading…' : 'Fetch releases'}
            </button>
            {error && <p className="text-[10px] text-red-400">{error}</p>}
            {importMsg && <p className="text-[10px] text-amber-300">{importMsg}</p>}
          </div>

          <div className="overflow-y-auto flex-1 p-3 space-y-3 text-[11px]">
            {releases.length === 0 && !loading && (
              <p className="text-neutral-500 text-center py-6">No releases loaded</p>
            )}
            {releases.map((rel) => (
              <div
                key={rel.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 space-y-2"
              >
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-neutral-100">{rel.name}</span>
                  <span className="font-mono text-emerald-500/90">{rel.tag}</span>
                </div>
                <a
                  href={rel.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-sky-400 hover:underline"
                >
                  Open on GitHub ↗
                </a>
                <div className="space-y-1.5">
                  {rel.assets.filter((a) => a.isPackage).length === 0 && (
                    <p className="text-neutral-500 text-[10px]">No .apk/.ipa/.zip assets</p>
                  )}
                  {rel.assets
                    .filter((a) => a.isPackage)
                    .map((asset) => (
                      <div
                        key={asset.id}
                        className="flex flex-col gap-1 p-2 rounded-lg bg-neutral-950 border border-neutral-800"
                      >
                        <span className="font-mono text-neutral-300 truncate">{asset.name}</span>
                        <span className="text-[9px] text-neutral-500">
                          {(asset.size / 1024).toFixed(1)} KB
                        </span>
                        <div className="flex gap-2">
                          <a
                            href={asset.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center py-1 rounded bg-neutral-800 text-[10px] font-bold hover:bg-neutral-700"
                          >
                            Download (GitHub)
                          </a>
                          <button
                            type="button"
                            onClick={() => importAsset(rel, asset)}
                            className="flex-1 py-1 rounded bg-emerald-900/50 border border-emerald-700/40 text-[10px] font-bold text-emerald-300 cursor-pointer"
                          >
                            Import to hub
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
