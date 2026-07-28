import React from 'react';
import { AppItem } from '../App';
import { AppCard } from './AppCard';
import { Search, Shield } from 'lucide-react';

interface StoreTabProps {
  appsList: AppItem[];
  isAppsLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  onInstall: (app: AppItem) => void;
  onSelectDetails: (app: AppItem) => void;
  onOpenAttestation: (appId: string) => void;
  gatewayLatency: number | null;
  selectedGateway: string;
}

export function StoreTab({
  appsList,
  isAppsLoading,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  onInstall,
  onSelectDetails,
  onOpenAttestation,
  gatewayLatency,
}: StoreTabProps) {
  const categories = ['All', 'Security', 'Finance', 'Communication', 'Utilities', 'GitHub'];

  const filteredApps = appsList.filter((app) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      app.name.toLowerCase().includes(q) ||
      app.developer.toLowerCase().includes(q) ||
      app.ipfsHash.toLowerCase().includes(q) ||
      ((app as any).downloadUrl || '').toLowerCase().includes(q);
    const matchesCategory =
      categoryFilter === 'All' || app.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const activeAppsCount = appsList.length;
  const verifiedCount = appsList.filter((a) => (a as any).hashVerified).length;
  const totalRepStaked = appsList.reduce(
    (acc, a) => acc + (a.isSlashed ? 0 : a.reputationStaked || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-extrabold tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Secure catalog · external downloads only</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">
              Zero-Trust App Catalog
            </h1>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
              Packages are listed with VT/hash signals. GitHub assets open on GitHub — VRAV does not
              host or auto-install binaries. Sandbox install is simulation only for demo entries.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto shrink-0 border-t border-slate-800 lg:border-t-0 pt-6 lg:pt-0">
            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Listed</span>
              <span className="text-lg font-mono font-extrabold text-slate-200 mt-1 block">
                {activeAppsCount}
              </span>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">SHA verified</span>
              <span className="text-lg font-mono font-extrabold text-emerald-400 mt-1 block">
                {verifiedCount}
              </span>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Collateral</span>
              <span className="text-lg font-mono font-extrabold text-amber-500 mt-1 block">
                {totalRepStaked}
              </span>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Gateway</span>
              <span className="text-lg font-mono font-extrabold text-indigo-400 mt-1 block">
                {gatewayLatency ? `${gatewayLatency}ms` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-100 border border-slate-800'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search apps, hashes, creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {isAppsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 animate-pulse h-48"
            />
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto space-y-3">
          <Shield className="w-12 h-12 stroke-[1] text-slate-600 mx-auto" />
          <h3 className="text-slate-200 text-xs font-mono font-extrabold uppercase tracking-widest">
            No matches
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onInstall={onInstall}
              onSelectDetails={onSelectDetails}
              onOpenAttestation={onOpenAttestation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
