import { useState } from 'react';
import { adminHeaders } from '../lib/adminHeaders';
import { getSessionToken } from '../lib/siweAuth';

export function IpfsPublishPanel() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [id, setId] = useState('my-package');
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [register, setRegister] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const publish = async () => {
    if (!file) {
      setMsg('Choose a file');
      return;
    }
    if (!getSessionToken() && !import.meta.env.VITE_ADMIN_API_TOKEN) {
      setMsg('Sign in with Ethereum first');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('id', id);
      fd.append('name', name || id);
      fd.append('version', version);
      fd.append('register', register ? 'true' : 'false');

      const headers = adminHeaders();
      delete (headers as any)['Content-Type']; // browser sets multipart boundary

      const res = await fetch('/api/ipfs/pin', {
        method: 'POST',
        headers,
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || 'Pin failed');
      setMsg(`CID ${data.cid} · VT ${data.virustotalScore} · ${data.gatewayUrl}`);
      window.dispatchEvent(new CustomEvent('vrav-apps-refresh'));
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-16 right-4 z-[99] px-3 py-2 rounded-xl bg-neutral-900 border border-violet-500/40 text-[11px] font-mono font-bold text-violet-400 shadow-lg hover:bg-neutral-800 cursor-pointer"
      >
        {open ? 'Close IPFS' : 'IPFS pin'}
      </button>

      {open && (
        <div className="fixed bottom-28 right-4 z-[99] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-neutral-700 bg-neutral-950 p-4 space-y-2 shadow-2xl text-neutral-200">
          <div className="text-xs font-mono font-bold text-violet-400">PINATA IPFS PUBLISH</div>
          <p className="text-[10px] text-neutral-500">
            Requires PINATA_JWT on server. File is pinned to Pinata; optional registry row with CID +
            SHA/VT.
          </p>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-[10px]"
          />
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="package id"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-[11px] font-mono"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="display name"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-[11px]"
          />
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="version"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-[11px] font-mono"
          />
          <label className="flex items-center gap-2 text-[10px] text-neutral-400">
            <input
              type="checkbox"
              checked={register}
              onChange={(e) => setRegister(e.target.checked)}
            />
            Register in catalog after pin
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={publish}
            className="w-full py-2 rounded-lg bg-violet-800 hover:bg-violet-700 text-[11px] font-bold cursor-pointer disabled:opacity-50"
          >
            {busy ? 'Pinning…' : 'Pin to IPFS'}
          </button>
          {msg && <p className="text-[10px] text-amber-200 break-all">{msg}</p>}
        </div>
      )}
    </>
  );
}
