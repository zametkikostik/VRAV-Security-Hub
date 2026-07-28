import { useCallback, useEffect, useState } from 'react';
import { adminHeaders } from '../lib/adminHeaders';
import { getSessionToken } from '../lib/siweAuth';

const LS = {
  wc: 'vrav_wc_project_id',
  slash: 'vrav_slash_contract',
  admin: 'vrav_admin_token_override',
} as const;

type Status = Record<string, unknown>;

export function OperatorSetup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Client-side (safe in browser / Vite)
  const [wcId, setWcId] = useState('');
  const [slashAddr, setSlashAddr] = useState('');
  const [adminTok, setAdminTok] = useState('');

  // Server-side secrets (never stored in localStorage)
  const [gemini, setGemini] = useState('');
  const [vt, setVt] = useState('');
  const [ghToken, setGhToken] = useState('');
  const [ghPresets, setGhPresets] = useState('');

  const loadStatus = useCallback(() => {
    fetch('/api/config/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    try {
      setWcId(localStorage.getItem(LS.wc) || '');
      setSlashAddr(localStorage.getItem(LS.slash) || '');
      setAdminTok(localStorage.getItem(LS.admin) || '');
    } catch {
      /* ignore */
    }
    loadStatus();
  }, [loadStatus, open]);

  const saveClient = () => {
    try {
      if (wcId) localStorage.setItem(LS.wc, wcId.trim());
      else localStorage.removeItem(LS.wc);
      if (slashAddr) localStorage.setItem(LS.slash, slashAddr.trim());
      else localStorage.removeItem(LS.slash);
      if (adminTok) localStorage.setItem(LS.admin, adminTok.trim());
      else localStorage.removeItem(LS.admin);
      setMsg('Client settings saved. Reload page for WalletConnect / slash address to apply.');
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const saveServer = async () => {
    if (!getSessionToken() && !adminTok && !import.meta.env.VITE_ADMIN_API_TOKEN) {
      setMsg('Sign in with Ethereum (or set client admin token) to update server keys');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const body: Record<string, string> = {};
      if (gemini.trim()) body.GEMINI_API_KEY = gemini.trim();
      if (vt.trim()) body.VIRUSTOTAL_API_KEY = vt.trim();
      if (ghToken.trim()) body.GITHUB_TOKEN = ghToken.trim();
      if (ghPresets.trim()) body.GITHUB_CATALOG_PRESETS = ghPresets.trim();
      if (Object.keys(body).length === 0) {
        setMsg('Enter at least one server key to apply');
        setBusy(false);
        return;
      }
      const res = await fetch('/api/operator-config', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setGemini('');
      setVt('');
      setGhToken('');
      setMsg(
        'Server keys applied in memory. Add the same values to .env for persistence. ' +
          (data.warning || '')
      );
      loadStatus();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  const flag = (k: string) =>
    status && status[k] ? (
      <span className="text-emerald-400">ON</span>
    ) : (
      <span className="text-neutral-500">off</span>
    );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-[100] px-3 py-2 rounded-xl bg-neutral-900 border border-sky-500/40 text-[11px] font-mono font-bold text-sky-400 shadow-lg hover:bg-neutral-800 cursor-pointer"
      >
        {open ? 'Close setup' : 'API & keys setup'}
      </button>

      {open && (
        <div className="fixed bottom-16 right-4 z-[100] w-[min(420px,calc(100vw-2rem))] max-h-[80vh] overflow-y-auto rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl text-neutral-200 p-4 space-y-4">
          <div>
            <div className="text-xs font-mono font-bold text-sky-400">OPERATOR SETUP</div>
            <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
              Server secrets (Gemini, VirusTotal, GitHub) go only to the backend via SIWE — never in
              localStorage. Client keys (WalletConnect, slash contract) stay in the browser.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 text-[10px] font-mono space-y-1">
            <div className="text-neutral-400 uppercase tracking-wider mb-1">Live status</div>
            <div>Gemini: {flag('gemini')}</div>
            <div>VirusTotal: {flag('virustotal')}</div>
            <div>GitHub token: {flag('githubToken')}</div>
            <div>SIWE: {flag('siweConfigured')}</div>
            <div>Admin token: {flag('adminTokenConfigured')}</div>
            <div>Allowlist wallets: {String(status?.adminWalletsCount ?? '—')}</div>
          </div>

          <section className="space-y-2">
            <h3 className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
              Client (browser)
            </h3>
            <label className="block text-[9px] text-neutral-500">WalletConnect Project ID</label>
            <input
              value={wcId}
              onChange={(e) => setWcId(e.target.value)}
              placeholder="from cloud.walletconnect.com"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-[11px] font-mono"
            />
            <label className="block text-[9px] text-neutral-500">Slash contract address</label>
            <input
              value={slashAddr}
              onChange={(e) => setSlashAddr(e.target.value)}
              placeholder="0x…"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-[11px] font-mono"
            />
            <label className="block text-[9px] text-neutral-500">
              Admin API token (optional client override)
            </label>
            <input
              type="password"
              value={adminTok}
              onChange={(e) => setAdminTok(e.target.value)}
              placeholder="same as ADMIN_API_TOKEN on server"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-[11px] font-mono"
            />
            <button
              type="button"
              onClick={saveClient}
              className="w-full py-2 rounded-lg bg-neutral-800 text-[11px] font-bold cursor-pointer hover:bg-neutral-700"
            >
              Save client settings
            </button>
          </section>

          <section className="space-y-2">
            <h3 className="text-[10px] font-mono font-bold text-amber-400 uppercase">
              Server (requires Sign in with Ethereum)
            </h3>
            <label className="block text-[9px] text-neutral-500">Gemini API key</label>
            <input
              type="password"
              value={gemini}
              onChange={(e) => setGemini(e.target.value)}
              placeholder="leave blank to keep current"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-[11px] font-mono"
            />
            <label className="block text-[9px] text-neutral-500">VirusTotal API key</label>
            <input
              type="password"
              value={vt}
              onChange={(e) => setVt(e.target.value)}
              placeholder="leave blank to keep current"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-[11px] font-mono"
            />
            <label className="block text-[9px] text-neutral-500">GitHub token</label>
            <input
              type="password"
              value={ghToken}
              onChange={(e) => setGhToken(e.target.value)}
              placeholder="ghp_… optional rate limits"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-[11px] font-mono"
            />
            <label className="block text-[9px] text-neutral-500">
              Catalog presets (owner/repo,owner2/repo2)
            </label>
            <input
              value={ghPresets}
              onChange={(e) => setGhPresets(e.target.value)}
              placeholder="zametkikostik/VRAV-Security-Hub"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-[11px] font-mono"
            />
            <button
              type="button"
              disabled={busy}
              onClick={saveServer}
              className="w-full py-2 rounded-lg bg-amber-800/80 hover:bg-amber-700 text-[11px] font-bold cursor-pointer disabled:opacity-50"
            >
              {busy ? 'Applying…' : 'Apply server keys'}
            </button>
          </section>

          {msg && <p className="text-[10px] text-amber-200/90 leading-relaxed">{msg}</p>}

          <p className="text-[9px] text-neutral-600 leading-relaxed">
            Permanent setup: copy `.env.example` → `.env` and restart. See SETUP.md.
          </p>
        </div>
      )}
    </>
  );
}
