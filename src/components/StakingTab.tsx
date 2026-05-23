import React, { useState } from 'react';
import { AppItem } from '../App';
import { 
  Coins, 
  ShieldAlert, 
  Activity, 
  Search, 
  Lock, 
  AlertCircle, 
  Terminal, 
  CheckCircle,
  Play
} from 'lucide-react';

interface StakingTabProps {
  appsList: AppItem[];
  isAppsLoading: boolean;
  stakeFilter: 'all' | 'staked' | 'slashed';
  setStakeFilter: (val: 'all' | 'staked' | 'slashed') => void;
  handleTriggerSlash: (appId: string) => void;
  isSlashingActive: boolean;
  slashingTerminalOutput: string[];
}

export function StakingTab({
  appsList,
  isAppsLoading,
  stakeFilter,
  setStakeFilter,
  handleTriggerSlash,
  isSlashingActive,
  slashingTerminalOutput
}: StakingTabProps) {
  
  const [selectedAppToSlash, setSelectedAppToSlash] = useState<string>('');
  const [exploitRationale, setExploitRationale] = useState<string>('Covert runtime reflection spawned arbitrary shell pipeline bypasses.');

  // Global Pooled stats
  const totalAppsCount = appsList.length;
  const activeDepositsCount = appsList.filter(a => !a.isSlashed).length;
  const slashedAppsCount = appsList.filter(a => a.isSlashed).length;
  
  const totalPooledCollateral = appsList
    .filter(a => !a.isSlashed)
    .reduce((sum, a) => sum + (a.reputationStaked || 0), 0);
  
  const totalSlashedFunds = appsList
    .filter(a => a.isSlashed)
    .reduce((sum, a) => sum + (a.reputationStaked || 0), 0);

  // Filter list of developers
  const filteredApps = appsList.filter(app => {
    if (stakeFilter === 'staked') return !app.isSlashed;
    if (stakeFilter === 'slashed') return app.isSlashed;
    return true;
  });

  const activeNonSlashedApps = appsList.filter(a => !a.isSlashed && a.id !== 'vrav-auth');

  // Trigger local simulation action
  const runLocalSlashingProtocol = () => {
    if (!selectedAppToSlash) return;
    handleTriggerSlash(selectedAppToSlash);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Global consensus pool stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none font-sans">
        
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Consensus Collateral Pool</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-100">{totalPooledCollateral}</span>
              <span className="text-xs font-bold text-emerald-450 font-mono">MATIC</span>
            </div>
          </div>
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-2xl border border-emerald-500/10">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Active Developer Nodes</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-100">{activeDepositsCount}</span>
              <span className="text-xs text-slate-400 font-semibold">Staked</span>
            </div>
          </div>
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-2xl border border-emerald-500/10">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Slashed / Forfeited Apps</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-red-400">{slashedAppsCount}</span>
              <span className="text-xs text-slate-400 font-semibold">Blacklisted</span>
            </div>
          </div>
          <div className="bg-red-500/10 text-red-400 p-3 rounded-2xl border border-red-500/10">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Total Penalities Executed</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-amber-500">{totalSlashedFunds}</span>
              <span className="text-xs font-semibold font-mono text-amber-500">MATIC Slashed</span>
            </div>
          </div>
          <div className="bg-amber-500/10 text-amber-500 p-3 rounded-2xl border border-amber-500/10">
            <Lock className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. Double-column layout: Staking ledger vs Slashing penalty contract simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column Ledger List (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col min-h-[420px]">
          
          {/* Staking Ledger Header */}
          <div className="p-5 border-b border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono font-extrabold uppercase text-emerald-450 tracking-wider">Proof-of-Security Ledger</h3>
              <h4 className="text-sm font-extrabold text-slate-100 font-sans tracking-tight">Active Registries Deposits</h4>
            </div>

            {/* Pill filters */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 self-start sm:self-auto text-[10px] font-mono font-extrabold select-none shrink-0">
              <button
                onClick={() => setStakeFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  stakeFilter === 'all' ? 'bg-slate-850 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ALL ({totalAppsCount})
              </button>
              <button
                onClick={() => setStakeFilter('staked')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  stakeFilter === 'staked' ? 'bg-slate-850 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ACTIVE ({activeDepositsCount})
              </button>
              <button
                onClick={() => setStakeFilter('slashed')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  stakeFilter === 'slashed' ? 'bg-slate-850 text-red-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SLASHED ({slashedAppsCount})
              </button>
            </div>
          </div>

          {/* Ledger table items */}
          <div className="flex-grow overflow-y-auto divide-y divide-slate-850 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {isAppsLoading ? (
              <div className="flex items-center justify-center h-full select-none text-slate-600">
                <Activity className="w-5 h-5 animate-spin mr-2" />
                <span className="text-xs font-mono">Loading dynamic register deposits...</span>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-medium select-none text-center">
                <Coins className="w-10 h-10 stroke-[1] mb-2 text-slate-700" />
                <span className="text-xs font-mono font-extrabold uppercase text-slate-450 tracking-widest">No Deposits Staged</span>
                <span className="text-[10px] text-slate-500 leading-normal mt-1 opacity-70">No validators match this category threshold.</span>
              </div>
            ) : (
              filteredApps.map((ledgerItem) => (
                <div key={ledgerItem.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  
                  {/* Left Metadata info */}
                  <div className="flex items-center space-x-3 max-w-sm">
                    <div className={`p-2.5 rounded-2xl border ${
                      ledgerItem.isSlashed 
                        ? 'bg-red-950/20 text-red-500 border-red-900/30' 
                        : 'bg-slate-950 text-slate-400 border-slate-850'
                    }`}>
                      <Coins className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-1.5 select-none">
                        <span className="font-extrabold text-slate-200 truncate block text-sm">{ledgerItem.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border leading-none font-mono ${
                          ledgerItem.isSlashed 
                            ? 'bg-red-950/40 text-red-400 border-red-900/30' 
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                        }`}>
                          {ledgerItem.isSlashed ? 'SLASHED' : 'SECURED'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate font-mono">STAKE DEP: {ledgerItem.stakingAddress}</span>
                    </div>
                  </div>

                  {/* Right Deposit stats */}
                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center shrink-0">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block select-none">COLLATERAL DEPOSITED</span>
                    <span className={`font-mono font-extrabold text-sm ${
                      ledgerItem.isSlashed ? 'text-red-400 line-through' : 'text-emerald-400'
                    }`}>
                      {ledgerItem.isSlashed ? '0.00 MATIC' : `${ledgerItem.reputationStaked} MATIC`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block">{ledgerItem.staticScanStatus === 'clean' ? '100%' : '50%'} Trust rating</span>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Exploit contract simulator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Slashing simulator sandbox box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-5 text-slate-300 select-none">
            <div>
              <h3 className="text-xs font-mono font-extrabold uppercase text-amber-500 tracking-wider">SEC_CORE CONTROLLER</h3>
              <h4 className="text-sm font-bold text-slate-100 font-sans tracking-tight">On-Chain Penalties Protocol Sandbox</h4>
              <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Simulate malicious exploits inside compiled releases and triggers smart-contract slashing.</p>
            </div>

            <div className="space-y-4">
              
              {/* Selector */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Target Registrar Deposit Pool</label>
                <select
                  value={selectedAppToSlash}
                  onChange={(e) => setSelectedAppToSlash(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-red-500/70 transition-all font-medium cursor-pointer"
                >
                  <option value="">-- Choose Active Staked Pack --</option>
                  {activeNonSlashedApps.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.reputationStaked} MATIC Pool)</option>
                  ))}
                </select>
              </div>

              {/* exploit justification */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-slate-400 font-mono uppercase font-bold block">VULNERABILITY RATIO RATIONALE</label>
                <textarea
                  value={exploitRationale}
                  onChange={(e) => setExploitRationale(e.target.value)}
                  placeholder="e.g. Backdoor Trojan payload bypasses static checks on remote calls."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-red-500/75 transition-all font-mono h-20 resize-none leading-relaxed"
                />
              </div>

              {/* Action BTN */}
              <button
                onClick={runLocalSlashingProtocol}
                disabled={!selectedAppToSlash || isSlashingActive}
                className="w-full py-3 bg-red-950/40 border border-red-900/40 text-red-400 hover:bg-red-500 hover:text-slate-950 hover:border-red-500 font-black font-sans uppercase tracking-tight rounded-xl disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-850 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer text-xs"
              >
                {isSlashingActive ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-red-500" />
                    <span>Slashing pool asset...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4.5 h-4.5" />
                    <span>Trigger Slashing Execution</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Interactive terminal logs console display */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[200px]">
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-850 flex items-center justify-between select-none">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-red-400" />
                <span className="text-[10px] font-mono font-bold text-slate-300">PoS CONTRACT PROTOCOL TRACE</span>
              </div>
              <span className="text-[9px] bg-red-950 text-red-400 border border-red-900/30 px-1.5 py-0.5 rounded text-xs font-mono leading-none">ACTIVE</span>
            </div>

            <div className="flex-grow p-4 bg-slate-950 font-mono text-[10px] leading-relaxed overflow-y-auto space-y-1 text-red-300 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {slashingTerminalOutput.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-600 select-none text-center">
                  <span>SLA PROTOCOL IDLE • SIMULATOR CHANNELS ONLINE</span>
                </div>
              ) : (
                slashingTerminalOutput.map((l, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    <span className="text-slate-700 mr-2">[{String(index + 1).padStart(3, '0')}]</span>
                    {l}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
