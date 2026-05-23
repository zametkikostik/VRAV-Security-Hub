import React from 'react';
import { 
  Shield, 
  Coins, 
  Download, 
  Star, 
  CheckCircle, 
  User, 
  Activity,
  AlertTriangle,
  Info
} from 'lucide-react';
import { AppItem } from '../App';

interface AppCardProps {
  key?: string | number;
  app: AppItem;
  onInstall: (app: AppItem) => void;
  onSelectDetails: (app: AppItem) => void;
  onOpenAttestation: (appId: string) => void;
}

export function AppCard({ app, onInstall, onSelectDetails, onOpenAttestation }: AppCardProps) {
  // Convert trust percent to standard 5-star rating (between 3.0 and 5.0)
  const displayRating = (3.0 + (app.trustScore / 100) * 2.0).toFixed(1);
  const starCount = Math.round(parseFloat(displayRating));

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
      
      {/* Upper info clicker */}
      <div className="cursor-pointer space-y-3.5" onClick={() => onSelectDetails(app)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            {getAppIcon(app.id)}
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                {app.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5 uppercase tracking-wider">
                BY {app.developer.split(' ')[0]} ORG
              </p>
            </div>
          </div>
          
          {/* Active Staked Indicator Badge */}
          {app.isSlashed ? (
            <span className="text-[9px] font-mono uppercase bg-red-950/80 text-red-400 border border-red-500/25 px-2 py-0.5 rounded-md font-bold flex items-center space-x-1">
              <span className="w-1 h-1 rounded-full bg-red-400 animate-ping" />
              <span>Slashed</span>
            </span>
          ) : (
            <span className="text-[9px] font-mono uppercase bg-emerald-950/60 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded-md font-extrabold flex items-center space-x-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span>PoS Verified</span>
            </span>
          )}
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-350 leading-relaxed font-normal min-h-[36px] line-clamp-2">
          {app.description}
        </p>

        {/* Rating and details row */}
        <div className="flex items-center space-x-4 text-xs">
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <span className="font-bold text-slate-200">{displayRating}</span>
            <div className="flex text-amber-450">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < starCount ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                />
              ))}
            </div>
          </div>

          <span className="text-slate-600 font-mono">•</span>

          {/* Installs code */}
          <span className="text-slate-400 font-mono text-[11px] font-medium uppercase tracking-tight">
            {(app.installCount >= 1000 ? `${(app.installCount / 1000).toFixed(1)}K+` : app.installCount)} Installs
          </span>
        </div>
      </div>

      {/* Button Action CTA Footer */}
      <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-800/60">
        <button
          onClick={() => onSelectDetails(app)}
          className="w-full bg-slate-950 hover:bg-slate-850/80 border border-slate-800 text-slate-300 hover:text-white rounded-xl py-2 text-[11px] font-bold uppercase tracking-wider transition-all select-none cursor-pointer text-center"
        >
          Details
        </button>
        
        <button
          onClick={() => onInstall(app)}
          disabled={app.staticScanStatus === 'critical'}
          className={`w-full rounded-xl py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-250 select-none flex items-center justify-center space-x-1.5 ${
            app.staticScanStatus === 'critical'
              ? 'bg-slate-800 text-slate-500 border border-slate-850 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/10 cursor-pointer'
          }`}
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Install</span>
        </button>
      </div>

    </div>
  );
}
