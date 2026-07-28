import React from 'react';
import {
  Shield,
  Coins,
  Download,
  Star,
  Activity,
  User,
  ExternalLink,
  BadgeCheck,
  AlertTriangle,
} from 'lucide-react';
import type { AppItem } from '../types/app';

interface AppCardProps {
  app: AppItem;
  onInstall: (app: AppItem) => void;
  onSelectDetails: (app: AppItem) => void;
  onOpenAttestation: (appId: string) => void;
}

export function AppCard({ app, onInstall, onSelectDetails, onOpenAttestation }: AppCardProps) {
  const displayRating = (3.0 + (app.trustScore / 100) * 2.0).toFixed(1);
  const starCount = Math.round(parseFloat(displayRating));
  const external = Boolean(app.downloadUrl);
  const blocked =
    app.staticScanStatus === 'critical' || app.isSlashed === true;

  const getAppIcon = (id: string) => {
    switch (id) {
      case 'vrav-auth':
        return (
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-2xl border border-emerald-500/20 shadow-md">
            <Shield className="w-6 h-6 stroke-[2]" />
          </div>
        );
      case 'p2p-wallet':
        return (
          <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-2xl border border-indigo-500/20 shadow-md">
            <Coins className="w-6 h-6 stroke-[2]" />
          </div>
        );
      case 'ipfs-chat':
        return (
          <div className="bg-sky-500/10 text-sky-400 p-3 rounded-2xl border border-sky-500/20 shadow-md">
            <Activity className="w-6 h-6 stroke-[2]" />
          </div>
        );
      default:
        return (
          <div className="bg-amber-500/10 text-amber-400 p-3 rounded-2xl border border-amber-500/20 shadow-md">
            <User className="w-6 h-6 stroke-[2]" />
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 hover:shadow-xl hover:shadow-emerald-500/2 rounded-2xl p-5 select-none transition-all duration-300 group flex flex-col justify-between">
      <div className="cursor-pointer space-y-3.5" onClick={() => onSelectDetails(app)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3.5 min-w-0">
            {getAppIcon(app.id)}
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm tracking-tight text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                {app.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5 uppercase tracking-wider truncate">
                BY {app.developer}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {app.isSlashed ? (
              <span className="text-[9px] font-mono uppercase bg-red-950/80 text-red-400 border border-red-500/25 px-2 py-0.5 rounded-md font-bold">
                Slashed
              </span>
            ) : (
              <span className="text-[9px] font-mono uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-extrabold">
                Listed
              </span>
            )}
            {app.hashVerified ? (
              <span className="text-[9px] font-mono flex items-center gap-0.5 text-emerald-400/90">
                <BadgeCheck className="w-3 h-3" /> SHA verified
              </span>
            ) : app.source === 'github' ? (
              <span className="text-[9px] font-mono flex items-center gap-0.5 text-amber-400/90">
                <AlertTriangle className="w-3 h-3" /> Hash unverified
              </span>
            ) : null}
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-normal min-h-[36px] line-clamp-2">
          {app.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-slate-200">{displayRating}</span>
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < starCount ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-slate-600 font-mono">·</span>
          <span className="text-slate-400 font-mono text-[11px]">
            VT: {app.virustotalScore?.slice(0, 28) || 'n/a'}
          </span>
          {app.source === 'github' && (
            <>
              <span className="text-slate-600 font-mono">·</span>
              <span className="text-sky-400 font-mono text-[10px] uppercase">GitHub</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => onOpenAttestation(app.id)}
          className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl py-2 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          Attest
        </button>

        {external ? (
          <a
            href={blocked ? undefined : app.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (blocked) e.preventDefault();
            }}
            className={`w-full rounded-xl py-2 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 ${
              blocked
                ? 'bg-slate-800 text-slate-500 border border-slate-850 cursor-not-allowed pointer-events-none'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg cursor-pointer'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onInstall(app)}
            disabled={blocked}
            className={`w-full rounded-xl py-2 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
              blocked
                ? 'bg-slate-800 text-slate-500 border border-slate-850 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-lg cursor-pointer'
            }`}
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Sandbox</span>
          </button>
        )}
      </div>
    </div>
  );
}
