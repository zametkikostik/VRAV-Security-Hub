import React from 'react';
import { 
  Globe, 
  RefreshCw, 
  UploadCloud, 
  ShieldCheck, 
  Copy, 
  Check, 
  Terminal, 
  FileCode, 
  Key, 
  Settings,
  Info 
} from 'lucide-react';
import { GITHUB_WORKFLOW_YML, LINTER_SCRIPT_PY, PUBLISH_IPFS_PY } from '../data/configTemplates';

interface SettingsTabProps {
  selectedGateway: string;
  setSelectedGateway: (val: string) => void;
  gatewayStatus: 'unchecked' | 'checking' | 'online' | 'error';
  gatewayLatency: number | null;
  executeGatewayProbe: () => void;
  isCheckedOk: boolean;
  setIsCheckedOk: (val: boolean) => void;
  
  pubId: string;
  setPubId: (val: string) => void;
  pubName: string;
  setPubName: (val: string) => void;
  pubVersion: string;
  setPubVersion: (val: string) => void;
  pubDeveloper: string;
  setPubDeveloper: (val: string) => void;
  pubDescription: string;
  setPubDescription: (val: string) => void;
  pubRep: number;
  setPubRep: (val: number) => void;
  pubCode: string;
  setPubCode: (val: string) => void;
  isPublishing: boolean;
  triggerHubAppPublish: () => void;
  
  copiedTextId: string | null;
  copyToClipboard: (text: string, id: string) => void;
}

export function SettingsTab({
  selectedGateway,
  setSelectedGateway,
  gatewayStatus,
  gatewayLatency,
  executeGatewayProbe,
  isCheckedOk,
  setIsCheckedOk,
  
  pubId,
  setPubId,
  pubName,
  setPubName,
  pubVersion,
  setPubVersion,
  pubDeveloper,
  setPubDeveloper,
  pubDescription,
  setPubDescription,
  pubRep,
  setPubRep,
  pubCode,
  setPubCode,
  isPublishing,
  triggerHubAppPublish,
  
  copiedTextId,
  copyToClipboard
}: SettingsTabProps) {
  
  const gateways = [
    { url: 'https://cloudflare-ipfs.com', name: 'Cloudflare IPFS Edge' },
    { url: 'https://ipfs.io', name: 'IPFS.io Global Daemon' },
    { url: 'https://gateway.pinata.cloud', name: 'Pinata Gateway Endpoint' },
    { url: 'http://localhost:8080', name: 'Local Daemon Gateway Node' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Dynamic Top Dual Box Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gateway connection checking (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-5 text-slate-300 select-none">
          <div>
            <h3 className="text-xs font-mono font-extrabold text-indigo-400 uppercase tracking-wider block">Decentralized P2p Daemons</h3>
            <h4 className="text-sm font-sans font-bold text-slate-100 tracking-tight">IPFS Gateway Configuration</h4>
            <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Control proxy routing pathways and check latency values dynamically.</p>
          </div>

          <div className="space-y-4">
            
            {/* select proxy pathway */}
            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Active IPFS Gateway Proxy</label>
              <select
                value={selectedGateway}
                onChange={(e) => setSelectedGateway(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-250 outline-none focus:border-indigo-500 transition-all font-semibold font-mono cursor-pointer"
              >
                {gateways.map((g) => (
                  <option key={g.url} value={g.url}>{g.name} ({g.url})</option>
                ))}
              </select>
            </div>

            {/* Check Latency action */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex items-center justify-between text-xs">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-500 font-bold font-mono uppercase block">Node Connectivity status</span>
                
                <div className="flex items-center space-x-2 font-semibold">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    gatewayStatus === 'online' ? 'bg-emerald-500' : gatewayStatus === 'checking' ? 'bg-amber-400 animate-pulse' : 'bg-red-500'
                  }`} />
                  <span className="uppercase text-[11px] text-slate-200">
                    {gatewayStatus === 'online' ? `Online (${gatewayLatency}ms)` : gatewayStatus === 'checking' ? 'Testing connectivity...' : 'Gateway Timeout'}
                  </span>
                </div>
              </div>

              <button
                onClick={executeGatewayProbe}
                disabled={gatewayStatus === 'checking'}
                className="p-2.5 bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-slate-800 rounded-xl transition-all cursor-pointer disabled:opacity-30"
                title="Handshake ping latency"
              >
                <RefreshCw className={`w-4 h-4 ${gatewayStatus === 'checking' ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Verification policies checkboxes */}
            <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl space-y-2 text-xs">
              <span className="text-[10px] text-slate-500 font-bold font-mono uppercase block">Gateway integrity guidelines</span>
              
              <label className="flex items-center space-x-2.5 cursor-pointer hover:text-white transition-colors py-0.5 font-medium">
                <input
                  type="checkbox"
                  checked={isCheckedOk}
                  onChange={(e) => setIsCheckedOk(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-slate-800 bg-slate-950 text-indigo-500 focus:ring-opacity-0 cursor-pointer"
                />
                <span className="text-[11px] text-slate-350">Enforce Cryptographic SHA-256 Sum Check</span>
              </label>
            </div>

          </div>
        </div>

        {/* Developer Sandbox desk (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-5 text-slate-300">
          <div>
            <h3 className="text-xs font-mono font-extrabold text-emerald-450 uppercase tracking-wider block">Sandbox Staging Desk</h3>
            <h4 className="text-sm font-sans font-bold text-slate-100 tracking-tight">Decentralized P2P Package Publisher</h4>
            <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Package verified resources, deploy builds to IPFS nodes, and commit hash entries dynamically.</p>
          </div>

          <div className="space-y-4">
            
            {/* Form row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-500 font-mono uppercase font-extrabold">Package unique Id</label>
                <input
                  type="text"
                  value={pubId}
                  onChange={(e) => setPubId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-205 outline-none font-semibold font-mono"
                />
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-[9px] text-slate-500 font-mono uppercase font-extrabold">Human Readable Name</label>
                <input
                  type="text"
                  value={pubName}
                  onChange={(e) => setPubName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-205 outline-none font-semibold"
                />
              </div>
            </div>

            {/* Form row 2 */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-500 font-mono uppercase font-extrabold">Build Version</label>
                <input
                  type="text"
                  value={pubVersion}
                  onChange={(e) => setPubVersion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-250 outline-none font-semibold font-mono"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[9px] text-slate-500 font-mono uppercase font-extrabold">Consensus Reputation Pledge (MATIC)</label>
                <input
                  type="number"
                  value={pubRep}
                  onChange={(e) => setPubRep(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-250 outline-none font-mono font-semibold"
                />
              </div>
            </div>

            {/* Description row */}
            <div className="space-y-1.5 text-xs">
              <label className="text-[9px] text-slate-500 font-mono uppercase font-extrabold block">Abstract Summary / description</label>
              <input
                type="text"
                value={pubDescription}
                onChange={(e) => setPubDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-slate-205 outline-none font-semibold"
              />
            </div>

            {/* Action Release */}
            <button
              onClick={triggerHubAppPublish}
              disabled={isPublishing}
              className="w-full py-3 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black uppercase tracking-tight rounded-xl disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer text-xs"
            >
              <UploadCloud className="w-4.5 h-4.5" />
              <span>{isPublishing ? 'Pushing binary block to IPFS...' : 'Verify, Package and Release to Store'}</span>
            </button>

          </div>
        </div>

      </div>

      {/* Copyable pipelines references at the bottom */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-6">
        <div className="border-b border-slate-850 pb-4 select-none">
          <h3 className="text-xs font-mono font-extrabold text-emerald-455 uppercase tracking-wider">DevSecOps reference resources</h3>
          <h4 className="text-sm font-bold text-slate-100 font-sans tracking-tight">On-Chain poS CI/CD verification pipelines</h4>
          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Integrate these secure YAML workflows and validation compilers directly into your GitHub Actions code repositories.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* File 1: Workflow */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between select-none px-1">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-350">
                <FileCode className="w-4 h-4 text-emerald-405" />
                <span>.github/workflows/audit.yml</span>
              </div>
              <button
                onClick={() => copyToClipboard(GITHUB_WORKFLOW_YML, 'set-yaml')}
                className="text-[10px] text-slate-400 hover:text-emerald-400 font-mono font-bold flex items-center space-x-1"
              >
                {copiedTextId === 'set-yaml' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTextId === 'set-yaml' ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <pre className="font-mono text-[9px] leading-relaxed text-slate-400 whitespace-pre">{GITHUB_WORKFLOW_YML}</pre>
            </div>
          </div>

          {/* File 2: python script */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between select-none px-1">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-350">
                <Terminal className="w-4 h-4 text-emerald-405" />
                <span>scripts/linter.py</span>
              </div>
              <button
                onClick={() => copyToClipboard(LINTER_SCRIPT_PY, 'set-py')}
                className="text-[10px] text-slate-400 hover:text-emerald-400 font-mono font-bold flex items-center space-x-1"
              >
                {copiedTextId === 'set-py' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTextId === 'set-py' ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <pre className="font-mono text-[9px] leading-relaxed text-slate-400 whitespace-pre">{LINTER_SCRIPT_PY}</pre>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
