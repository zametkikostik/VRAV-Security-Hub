import React from 'react';
import { AppItem } from '../App';
import { AppCard } from './AppCard';
import { Search, Shield, ShieldCheck, Cpu, Coins, Globe, RefreshCw } from 'lucide-react';

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
  selectedGateway
}: StoreTabProps) {
  // Filter category options
  const categories = ['All', 'Security', 'Finance', 'Communication', 'Utilities'];

  // Calculate filtered results
  const filteredApps = appsList.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      app.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.ipfsHash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || app.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Global metrics for the hero banner
  const activeAppsCount = appsList.length;
  const secureBuildsPct = 100;
  const totalRepStaked = appsList.reduce((acc, a) => acc + (a.isSlashed ? 0 : (a.reputationStaked || 0)), 0);

  return (
    <div className="space-y-6">
      
      {/* 1. Hero Dynamic Stats Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8">
        {/* Subtle decorative glowing mesh */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-extrabold tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Decentralized Consensus Verified</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight font-sans">
              Decentralized Zero-Trust App Store
            </h1>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
              Every package is hosted on IPFS, checked with local regex rule sets plus Gemini AI static scanners, and secured on-chain via developer PoS reputation pools.
            </p>
          </div>

          {/* Quick Metrics columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto shrink-0 border-t border-slate-800 lg:border-t-0 pt-6 lg:pt-0">
            
            <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-2xl flex flex-col justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">ACTIVE APPS</span>
              <span className="text-lg font-mono font-extrabold text-slate-200 mt-1">{activeAppsCount} Packs</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-2xl flex flex-col justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">SECURE RATE</span>
              <span className="text-lg font-mono font-extrabold text-emerald-400 mt-1">{secureBuildsPct}%</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-2xl flex flex-col justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">TOTAL COLLATERAL</span>
              <span className="text-lg font-mono font-extrabold text-amber-500 mt-1">{totalRepStaked} MATIC</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-2xl flex flex-col justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">IPFS LATENCY</span>
              <span className="text-lg font-mono font-extrabold text-indigo-400 mt-1">
                {gatewayLatency ? `${gatewayLatency}ms` : 'Offline'}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Advanced Category filters row accompanied by top Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Category filtering Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-100 border border-slate-800'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Input search box filter */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search applications, hashes, or creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-505/20 transition-all font-medium"
          />
        </div>

      </div>

      {/* 3. Skeleton loadings or dynamic grid content displaying cards */}
      {isAppsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 animate-pulse">
              <div className="flex items-center space-x-3.5">
                <div className="bg-slate-800 rounded-2xl w-14 h-14" />
                <div className="space-y-2 flex-grow">
                  <div className="bg-slate-800 h-4 rounded w-1/3" />
                  <div className="bg-slate-800 h-3 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="bg-slate-800 h-3 rounded w-full" />
                <div className="bg-slate-800 h-3 rounded w-5/6" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-850/50">
                <div className="bg-slate-800 h-3 rounded w-1/4" />
                <div className="bg-slate-800 h-8 rounded-lg w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto space-y-3.5 shadow-sm">
          <Shield className="w-12 h-12 stroke-[1] text-slate-650 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-slate-200 text-xs font-mono font-extrabold uppercase tracking-widest">No Matches Registered</h3>
            <p className="text-xs text-slate-400 font-medium">Verify your query or change category filter constraints above.</p>
          </div>
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
