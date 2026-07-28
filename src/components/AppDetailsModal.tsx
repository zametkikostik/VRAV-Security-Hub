import React from 'react';
import {
  X,
  Shield,
  Coins,
  Download,
  Copy,
  Check,
  FileText,
  ShieldAlert,
  ExternalLink,
  BadgeCheck,
  AlertTriangle,
} from 'lucide-react';
import { AppItem } from '../App';

type CatalogApp = AppItem & {
  downloadUrl?: string;
  hashVerified?: boolean;
  source?: string;
  sha256?: string;
};

interface AppDetailsModalProps {
  app: CatalogApp | null;
  isOpen: boolean;
  onClose: () => void;
  onInstall: (app: AppItem) => void;
  onTriggerSlash: (appId: string) => void;
  onOpenAttestation: (appId: string) => void;
  isSlashingActive: boolean;
  copiedId: string | null;
  onCopyPath: (text: string, id: string) => void;
}

export function AppDetailsModal({
  app,
  isOpen,
  onClose,
  onInstall,
  onTriggerSlash,
  onOpenAttestation,
  isSlashingActive,
  copiedId,
  onCopyPath,
}: AppDetailsModalProps) {
  if (!isOpen || !app) return null;

  const displayRating = (3.0 + (app.trustScore / 100) * 2.0).toFixed(1);
  const ratingPct = app.trustScore;
  const external = Boolean(app.downloadUrl);
  const blocked = app.staticScanStatus === 'critical' || app.isSlashed === true;
  const sha = app.sha256;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-950/30">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="bg-emerald-500/15 text-emerald-400 p-2 rounded-xl border border-emerald-500/20 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-mono font-bold text-xs uppercase text-emerald-400 tracking-wider">
                Package details
              </span>
              <h2 className="text-sm font-extrabold text-slate-100 tracking-tight truncate">
                {app.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          <div className="flex flex-wrap gap-2">
            {app.hashVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <BadgeCheck className="w-3.5 h-3.5" /> SHA verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/50">
                <AlertTriangle className="w-3.5 h-3.5" /> Hash not verified
              </span>
            )}
            {app.source === 'github' && (
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
                Source: GitHub
              </span>
            )}
            {app.isSlashed && (
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-red-950 text-red-400 border border-red-800">
                Slashed
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                Trust score
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-3xl font-extrabold text-slate-100">{displayRating}</span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full ${
                    ratingPct >= 80
                      ? 'bg-emerald-500'
                      : ratingPct >= 40
                        ? 'bg-amber-400'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${ratingPct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-2">{ratingPct}%</p>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                Integrity
              </span>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">VirusTotal</span>
                <span
                  className={`font-mono font-bold text-right ${
                    app.staticScanStatus === 'clean'
                      ? 'text-emerald-400'
                      : app.staticScanStatus === 'warning'
                        ? 'text-amber-400'
                        : 'text-red-400'
                  }`}
                >
                  {app.virustotalScore}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Version</span>
                <span className="font-mono text-slate-200">v{app.version}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">Developer</span>
                <span className="text-xs font-bold text-slate-200 truncate block">{app.developer}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">{app.description}</p>

          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
              Cryptographic card
            </h3>
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800 text-xs">
              {app.downloadUrl && (
                <div className="pb-3.5 space-y-1">
                  <span className="font-mono text-[10px] text-slate-500 uppercase">
                    External download URL
                  </span>
                  <a
                    href={app.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-sky-400 break-all hover:underline block"
                  >
                    {app.downloadUrl}
                  </a>
                </div>
              )}

              <div className={`${app.downloadUrl ? 'py-3.5' : 'pb-3.5'} space-y-1`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-500 uppercase">Content pointer</span>
                  <button
                    type="button"
                    onClick={() => onCopyPath(app.ipfsHash, 'details-ipfs')}
                    className="text-slate-400 hover:text-emerald-400 font-mono text-[10px] flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedId === 'details-ipfs' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === 'details-ipfs' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 truncate">
                  {app.ipfsHash}
                </div>
              </div>

              <div className="py-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-500 uppercase">SHA-256</span>
                  {sha && (
                    <button
                      type="button"
                      onClick={() => onCopyPath(sha, 'details-sha')}
                      className="text-slate-400 hover:text-emerald-400 font-mono text-[10px] flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedId === 'details-sha' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === 'details-sha' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
                <div className="font-mono text-xs text-indigo-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 truncate">
                  {sha || 'Not provided'}
                </div>
              </div>

              <div className="py-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-500 uppercase">Staking address</span>
                  <button
                    type="button"
                    onClick={() => onCopyPath(app.stakingAddress, 'details-stake')}
                    className="text-slate-400 hover:text-emerald-400 font-mono text-[10px] flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedId === 'details-stake' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === 'details-stake' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-amber-500 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 truncate">
                  {app.stakingAddress}
                </div>
              </div>

              <div className="pt-3.5 flex justify-between items-center">
                <div>
                  <span className="font-mono text-[10px] text-slate-500 uppercase block">
                    Reputation stake
                  </span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span className="font-extrabold text-slate-100 font-mono">
                      {app.isSlashed
                        ? '0 (slashed)'
                        : `${app.reputationStaked} MATIC`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 bg-slate-950/60 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onOpenAttestation(app.id)}
            className="px-4 py-2 text-xs font-mono font-bold rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>Attestation</span>
          </button>

          <div className="flex items-center space-x-2.5">
            {!app.isSlashed && (
              <button
                type="button"
                onClick={() => {
                  onTriggerSlash(app.id);
                  onClose();
                }}
                disabled={isSlashingActive}
                className="px-4 py-2 text-xs font-bold text-red-400 bg-red-950/40 border border-red-900/45 hover:bg-red-500 hover:text-slate-950 rounded-xl flex items-center space-x-1.5 cursor-pointer uppercase font-mono"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Slash</span>
              </button>
            )}

            {external ? (
              <a
                href={blocked ? undefined : app.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (blocked) e.preventDefault();
                  else onClose();
                }}
                className={`px-5 py-2 text-xs font-extrabold rounded-xl flex items-center space-x-1.5 ${
                  blocked
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Download (external)</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onInstall(app);
                  onClose();
                }}
                disabled={blocked}
                className={`px-5 py-2 text-xs font-extrabold rounded-xl flex items-center space-x-1.5 ${
                  blocked
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                }`}
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Sandbox install</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
