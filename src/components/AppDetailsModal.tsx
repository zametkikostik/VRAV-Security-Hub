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
  Cpu,
  Star,
  Activity,
  User,
  AlertTriangle
} from 'lucide-react';
import { AppItem } from '../App';

interface AppDetailsModalProps {
  app: AppItem | null;
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
  onCopyPath
}: AppDetailsModalProps) {
  if (!isOpen || !app) return null;

  const displayRating = (3.0 + (app.trustScore / 100) * 2.0).toFixed(1);
  const ratingPct = app.trustScore;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Dark backdrop overlay with blur */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden transition-all duration-300 z-10 max-h-[90vh] flex flex-col">
        
        {/* Header Title with X Close Button */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 select-none bg-slate-950/30">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/15 text-emerald-400 p-2 rounded-xl border border-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono font-bold text-xs uppercase text-emerald-450 tracking-wider">SECURE DIRECTIVE DETAILS</span>
              <h2 className="text-sm font-extrabold text-slate-100 font-sans tracking-tight">{app.name}</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          
          {/* Rating score and basic info metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Rating Box */}
            <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">TRUST DEPOSIT HEALTH</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold text-slate-100">{displayRating}</span>
                  <span className="text-xs text-slate-400">/ 5.0</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      ratingPct >= 80 ? 'bg-emerald-500' : ratingPct >= 40 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'
                    }`}
                    style={{ width: `${ratingPct}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2">
                  <span>Trust Score: {ratingPct}%</span>
                  <span>{app.staticScanStatus === 'clean' ? '✨ Compliant' : '⚠️ Risk Flags'}</span>
                </div>
              </div>
            </div>

            {/* Core Verification parameters */}
            <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl space-y-3 flex flex-col justify-between text-xs">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">INTEGRITY CHECKUP</span>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-450">VirusTotal Scan:</span>
                    <span className={`font-mono font-bold ${
                      app.staticScanStatus === 'clean' ? 'text-emerald-400' : app.staticScanStatus === 'warning' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {app.virustotalScore}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Manifest Permissions:</span>
                    <span className="font-mono text-slate-200">{app.permissionsCount} Policies</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Audited Core Version:</span>
                    <span className="font-mono text-emerald-450 font-bold">v{app.version}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/50">
                <span className="text-[10px] text-slate-500 font-mono block">DEVELOPMENT TEAM:</span>
                <span className="text-xs font-bold text-slate-250 block truncate">{app.developer}</span>
              </div>
            </div>

          </div>

          {/* Cryptographic properties list */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-mono font-bold text-emerald-450 tracking-wider uppercase">DECENTRALIZED CRYPTON CARD</h3>
            
            <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 divide-y divide-slate-850 text-xs text-slate-300">
              
              {/* Box 1: IPFS Pointer */}
              <div className="pb-3.5 space-y-1">
                <div className="flex items-center justify-between select-none">
                  <span className="font-mono text-[10px] text-slate-500 uppercase">IPFS Decentralized CID Pointer</span>
                  <button 
                    onClick={() => onCopyPath(app.ipfsHash, 'details-ipfs')}
                    className="text-slate-400 hover:text-emerald-400 font-mono text-[10px] flex items-center space-x-1"
                  >
                    {copiedId === 'details-ipfs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'details-ipfs' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 truncate select-all">
                  {app.ipfsHash}
                </div>
              </div>

              {/* Box 2: SHA-256 Sum */}
              <div className="py-3.5 space-y-1">
                <div className="flex items-center justify-between select-none">
                  <span className="font-mono text-[10px] text-slate-500 uppercase">Cryptographic SHA-256 Checksum</span>
                  <button 
                    onClick={() => onCopyPath((app as any).sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'details-sha')}
                    className="text-slate-400 hover:text-emerald-400 font-mono text-[10px] flex items-center space-x-1"
                  >
                    {copiedId === 'details-sha' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'details-sha' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-indigo-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 truncate select-all">
                  {(app as any).sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </div>
              </div>

              {/* Box 3: Staking address */}
              <div className="py-3.5 space-y-1">
                <div className="flex items-center justify-between select-none">
                  <span className="font-mono text-[10px] text-slate-500 uppercase">Collateral Smart Contract Deposit Address</span>
                  <button 
                    onClick={() => onCopyPath(app.stakingAddress, 'details-stake')}
                    className="text-slate-400 hover:text-emerald-400 font-mono text-[10px] flex items-center space-x-1"
                  >
                    {copiedId === 'details-stake' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'details-stake' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-amber-500 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 truncate select-all">
                  {app.stakingAddress}
                </div>
              </div>

              {/* Box 4: Multi-sig Auth Key */}
              <div className="pt-3.5 space-y-1.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono text-[10px] text-slate-500 uppercase block">ACTIVE REPUTATION STAKE DEPOSITED</span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span className="font-extrabold text-slate-100 font-mono">
                      {app.isSlashed ? '0.0 MATIC (FORFEITED & SLASHED)' : `${app.reputationStaked} MATIC`}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="font-mono text-[10px] text-slate-500 uppercase block">COLD DESK AUTH SIGNATURE</span>
                  <span className="font-mono text-[11px] font-bold text-slate-200">{app.authorizerSignature}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Primary Action Footer */}
        <div className="px-6 py-5 bg-slate-950/60 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 select-none">
          
          {/* Hardware KMS Signatures verification button */}
          <button
            onClick={() => onOpenAttestation(app.id)}
            className="px-4 py-2 text-xs font-mono font-bold tracking-tight rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-teal-405 hover:border-teal-400/40 transition-all duration-200 flex items-center space-x-2 select-none cursor-pointer"
            title="Authenticate build attestation via Cloud HSM/KMS HSM reports"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>Examine Attestation (HSM)</span>
          </button>

          <div className="flex items-center space-x-2.5">
            {/* Slash Trigger simulation */}
            {!app.isSlashed && app.id !== 'vrav-auth' && (
              <button
                onClick={() => { onTriggerSlash(app.id); onClose(); }}
                disabled={isSlashingActive}
                className="px-4 py-2 text-xs font-bold text-red-400 bg-red-950/40 border border-red-900/[0.45] hover:bg-red-500 hover:text-slate-950 hover:border-red-500 rounded-xl transition-all duration-150 flex items-center space-x-1.5 cursor-pointer uppercase font-mono"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Slash Stake</span>
              </button>
            )}

            {/* Install trigger */}
            <button
              onClick={() => { onInstall(app); onClose(); }}
              disabled={app.staticScanStatus === 'critical'}
              className={`px-5 py-2 text-xs font-extrabold rounded-xl transition-all duration-250 flex items-center space-x-1.5 ${
                app.staticScanStatus === 'critical'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/10 cursor-pointer'
              }`}
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>INSTALL PACK (IPFS PULL)</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
