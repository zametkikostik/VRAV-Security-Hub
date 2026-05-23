import React, { useState } from 'react';
import { 
  Terminal, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Square,
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ConsoleOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  installLogs: string[];
  publishLogs: string[];
  slashingLogs: string[];
  onClearInstall: () => void;
  onClearPublish: () => void;
  onClearSlashing: () => void;
}

export function ConsoleOverlay({
  isOpen,
  onClose,
  installLogs,
  publishLogs,
  slashingLogs,
  onClearInstall,
  onClearPublish,
  onClearSlashing
}: ConsoleOverlayProps) {
  const [activeTab, setActiveTab] = useState<'installer' | 'publisher' | 'slashing'>('installer');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) {
    // If closed, return a small floating bubble indicating diagnostic status if logs are active!
    const totalLogCount = installLogs.length + publishLogs.length + slashingLogs.length;
    if (totalLogCount === 0) return null;

    return (
      <div className="fixed bottom-20 md:bottom-6 right-6 z-50">
        <button
          onClick={onClose} // triggers opening!
          className="flex items-center space-x-2.5 bg-slate-900 border-2 border-emerald-500/60 p-3.5 rounded-full shadow-xl hover:scale-105 hover:bg-slate-850 hover:border-emerald-400 text-emerald-400 font-mono text-xs font-bold transition-all duration-200 cursor-pointer animate-bounce animate-pulse"
        >
          <Terminal className="w-4.5 h-4.5" />
          <span className="hidden sm:inline">Diagnostics Console ({totalLogCount} Lines)</span>
        </button>
      </div>
    );
  }

  const getLogs = () => {
    switch (activeTab) {
      case 'installer': return installLogs;
      case 'publisher': return publishLogs;
      case 'slashing': return slashingLogs;
    }
  };

  const handleClear = () => {
    switch (activeTab) {
      case 'installer': onClearInstall(); break;
      case 'publisher': onClearPublish(); break;
      case 'slashing': onClearSlashing(); break;
    }
  };

  const currentLogs = getLogs();

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t-2 border-slate-800 transition-all duration-300 shadow-2xl ${
        isMinimized ? 'h-14' : 'h-[380px] md:h-[450px]'
      }`}
    >
      {/* Console Header Bar */}
      <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-850 flex items-center justify-between select-none">
        
        {/* Logo and Status */}
        <div className="flex items-center space-x-2.5">
          <Terminal className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200">
            SYSTEM EXECUTION OVERLAY • DIAGNOSTICS DEUTSCH PROTOCOL
          </span>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40 text-xs font-mono font-bold">
            ONLINE
          </span>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            title={isMinimized ? "Expand diagnostics view" : "Minimize console"}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={handleClear}
            disabled={currentLogs.length === 0}
            className="text-slate-500 hover:text-slate-350 disabled:opacity-30 transition-colors p-1"
            title="Clear active logs stream"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 transition-colors p-1"
            title="Close diagnostics console"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

      </div>

      {/* Body Area */}
      {!isMinimized && (
        <div className="h-[calc(100%-53px)] flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-850">
          
          {/* Left panel Selector Tabs */}
          <div className="w-full md:w-56 p-3 bg-slate-900/35 space-y-2 flex flex-row md:flex-col items-center md:items-stretch overflow-x-auto md:overflow-x-visible select-none shrink-0 border-b md:border-b-0 border-slate-850">
            <button
              onClick={() => setActiveTab('installer')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-between transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'installer' ? 'bg-slate-850 text-emerald-450 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📥 P2P INSTALLER ({installLogs.length})</span>
              {installLogs.length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            </button>
            <button
              onClick={() => setActiveTab('publisher')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-between transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'publisher' ? 'bg-slate-850 text-emerald-450 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🚀 Sandbox publisher ({publishLogs.length})</span>
              {publishLogs.length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            </button>
            <button
              onClick={() => setActiveTab('slashing')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-between transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'slashing' ? 'bg-slate-850 text-emerald-450 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⚖️ SLASHING SIMULATOR ({slashingLogs.length})</span>
              {slashingLogs.length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            </button>
          </div>

          {/* Right panel terminal log viewer */}
          <div className="flex-grow p-4 bg-slate-950 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {currentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 select-none text-center">
                <Square className="w-8 h-8 stroke-[1] mb-2" />
                <span>TERMINAL LOG BUFFER EMPTY</span>
                <span className="text-[10px] mt-1 opacity-70">Initialize a system command (e.g., Install, Slash, Publish) to view active traces.</span>
              </div>
            ) : (
              currentLogs.map((line, ix) => {
                let textClass = 'text-slate-300';
                if (line.includes('[CRITICAL]') || line.includes('❌') || line.includes('[ERROR]')) {
                  textClass = 'text-red-400 font-bold';
                } else if (line.includes('SUCCESS') || line.includes('[SUCCESS]')) {
                  textClass = 'text-emerald-400 font-bold';
                } else if (line.includes('[LINTER]') || line.includes('[SMART_CONTRACT]')) {
                  textClass = 'text-amber-400';
                } else if (line.includes('[DEV_PIPELINE]')) {
                  textClass = 'text-sky-400';
                } else if (line.includes('[NODE_DAEMON]')) {
                  textClass = 'text-slate-400';
                }

                return (
                  <div key={ix} className={`${textClass} whitespace-pre-wrap`}>
                    <span className="text-slate-600 select-none mr-3">[{String(ix + 1).padStart(3, '0')}]</span>
                    {line}
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
}
