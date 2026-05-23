import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  Cpu, 
  Terminal, 
  Code, 
  AlertCircle, 
  Info,
  CheckCircle,
  FileCode,
  FileText
} from 'lucide-react';

interface AuditTabProps {
  selectedTemplateId: string;
  handleTemplateChange: (id: string) => void;
  runAIDeepScan: boolean;
  setRunAIDeepScan: (val: boolean) => void;
  scanTypeSecrets: boolean;
  setScanTypeSecrets: (val: boolean) => void;
  scanTypeDangerousApi: boolean;
  setScanTypeDangerousApi: (val: boolean) => void;
  scanTypeReflection: boolean;
  setScanTypeReflection: (val: boolean) => void;
  customCode: string;
  setCustomCode: (val: string) => void;
  fileName: string;
  setFileName: (val: string) => void;
  isLinterRunning: boolean;
  handleRunLinter: () => void;
  scannedOnce: boolean;
  localLinterResults: {
    passed: boolean;
    violationsCount: number;
    reportLines: string[];
    score: number;
  } | null;
  aiAuditReport: string;
  aiAuditError: string;
}

export function AuditTab({
  selectedTemplateId,
  handleTemplateChange,
  runAIDeepScan,
  setRunAIDeepScan,
  scanTypeSecrets,
  setScanTypeSecrets,
  scanTypeDangerousApi,
  setScanTypeDangerousApi,
  scanTypeReflection,
  setScanTypeReflection,
  customCode,
  setCustomCode,
  fileName,
  setFileName,
  isLinterRunning,
  handleRunLinter,
  scannedOnce,
  localLinterResults,
  aiAuditReport,
  aiAuditError
}: AuditTabProps) {
  
  // Custom presets
  const presets = [
    { id: 'backdoor', name: 'Malicious Backdoor (Trojan)' },
    { id: 'ssl-bypass', name: 'Insecure SSL Trust Bypass' },
    { id: 'manifest', name: 'Dangerous Overlay XML Manifest' },
    { id: 'secure-crypto', name: 'Secure AES Cryptography Core' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT: Control desk Panel & options (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Core scan box settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-5 select-none text-slate-300">
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-sans tracking-tight">Security Scan Desk</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Configure static regex patterns and remote Gemini AI policy audits.</p>
          </div>

          <div className="space-y-4">
            {/* Presets template select */}
            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Pre-staged Vulnerability Templates</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-all font-medium cursor-pointer"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Static linter rule sets checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">PoS RegEx Rule Sets</span>
              
              <div className="space-y-2.5 text-xs font-semibold">
                <label className="flex items-center space-x-2.5 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={scanTypeSecrets}
                    onChange={(e) => setScanTypeSecrets(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-slate-800 bg-slate-950 text-emerald-500 focus:ring-opacity-0 cursor-pointer"
                  />
                  <span>Hardcoded API Private Secrets</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={scanTypeDangerousApi}
                    onChange={(e) => setScanTypeDangerousApi(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-slate-800 bg-slate-950 text-emerald-500 focus:ring-opacity-0 cursor-pointer"
                  />
                  <span>Dangerous Process Overrides</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={scanTypeReflection}
                    onChange={(e) => setScanTypeReflection(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-slate-800 bg-slate-950 text-emerald-500 focus:ring-opacity-0 cursor-pointer"
                  />
                  <span>Runtime Reflection Violations</span>
                </label>
              </div>
            </div>

            {/* Gemini Option */}
            <div className="pt-3 border-t border-slate-800/60 space-y-2.5">
              <div className="flex items-start space-x-2.5 bg-emerald-950/10 border border-emerald-900/35 p-3 rounded-xl">
                <input
                  type="checkbox"
                  id="gemini-toggle"
                  checked={runAIDeepScan}
                  onChange={(e) => setRunAIDeepScan(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-slate-800 bg-slate-950 text-emerald-500 focus:ring-opacity-0 cursor-pointer mt-0.5 shrink-0"
                />
                <div className="text-xs">
                  <label htmlFor="gemini-toggle" className="font-extrabold text-emerald-400 block cursor-pointer">
                    Gemini AI Static Deep Audit
                  </label>
                  <p className="text-[10px] text-zinc-550 font-medium leading-relaxed mt-0.5">
                    Analyzes logical flows in real time, validating compliance criteria with zero-trust standards.
                  </p>
                </div>
              </div>
            </div>

            {/* Form filename parameters */}
            <div className="space-y-1.5 text-xs pt-1.5">
              <label className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Sandbox Entry point file</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. BackdoorActivity.java"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-450 placeholder-slate-650 outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* RUN COMPILER BTN */}
            <button
              onClick={handleRunLinter}
              disabled={isLinterRunning}
              className="w-full py-3 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black font-sans uppercase tracking-tight rounded-xl disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLinterRunning ? (
                <>
                  <Terminal className="w-4.5 h-4.5 animate-spin text-slate-950" />
                  <span>Scanning Records...</span>
                </>
              ) : (
                <>
                  <Play className="w-4.5 h-4.5 fill-current" />
                  <span>Execute Diagnostic Scan</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Small warning disclaimer */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3 text-[10px] text-slate-500 leading-normal font-medium select-none">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            VRAV compilers scan Android resources natively. Static matching captures system leaks instantly, while the deep scan provides cryptographic proof of safety.
          </span>
        </div>

      </div>

      {/* RIGHT: Editor & dynamic report result logs (8 cols) */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        
        {/* Source Code Editor Console Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[320px] md:h-[350px]">
          {/* Editor Header tabs */}
          <div className="bg-slate-950 px-5 py-3 border-b border-slate-850 flex items-center justify-between select-none">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-300 tracking-wide uppercase">{fileName}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 leading-none">PLAINTEXT SOURCE ENVELOPE</span>
          </div>

          {/* Interactive Textarea with line numbers background */}
          <div className="flex-grow flex relative font-mono text-xs overflow-hidden bg-slate-950">
            {/* Editor numbers */}
            <div className="w-12 bg-slate-900/60 border-r border-slate-850 py-4 flex flex-col items-center justify-start text-[10px] space-y-1 text-slate-600 font-semibold select-none shrink-0 leading-normal">
              {Array.from({ length: 25 }, (_, idx) => (
                <span key={idx} className="block">{idx + 1}</span>
              ))}
            </div>
            
            <textarea
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="flex-grow p-4 pl-5 bg-transparent border-0 ring-0 outline-none text-emerald-450/90 leading-normal resize-none font-mono text-[11px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent focus:ring-0"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Results Report Display dynamic section */}
        {scanned_count_helper(scannedOnce, isLinterRunning, localLinterResults, aiAuditReport, aiAuditError)}

      </div>

    </div>
  );
}

// Sub helper to clean JSX nesting structure
function scanned_count_helper(
  scannedOnce: boolean,
  isLinterRunning: boolean,
  localLinterResults: any,
  aiAuditReport: string,
  aiAuditError: string
) {
  if (isLinterRunning) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 select-none flex flex-col items-center justify-center text-slate-500 space-y-3 shadow-inner">
        <Terminal className="w-8 h-8 text-emerald-500 animate-spin" />
        <div className="space-y-1 text-center">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase block">Executing PoS Verification Compiler...</span>
          <span className="text-[10px] block opacity-70">Securing source variables recursively and auditing binary payloads.</span>
        </div>
      </div>
    );
  }

  if (!scannedOnce) {
    return (
      <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-10 select-none flex flex-col items-center justify-center text-slate-500 space-y-2.5">
        <FileText className="w-8 h-8 text-slate-700 stroke-[1]" />
        <div className="space-y-1 text-center">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase block">Ready For Security Assessment</span>
          <p className="text-[10px] text-slate-500 leading-normal max-w-xs font-medium">Click "Execute Diagnostic Scan" on the control desk to run real-time static checks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* LOCAL SCAN REPORT */}
      {localLinterResults && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-5">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-850">
            <div className="flex items-center space-x-3 select-none">
              <div className={`p-2 rounded-xl border ${
                localLinterResults.passed 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' 
                  : 'bg-red-950/40 text-red-400 border-red-900/40 animate-pulse'
              }`}>
                {localLinterResults.passed ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Local Registry Scan Result</span>
                <h4 className="text-sm font-sans font-extrabold text-slate-200">
                  {localLinterResults.passed ? 'COMPLIANT (Clean Scan Rating)' : 'MALWARE OVERRIDE CRITERIA VIOLATED'}
                </h4>
              </div>
            </div>

            {/* Score circle gauge */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-slate-950 rounded-2xl border border-slate-850 select-none">
              <span className="text-[10px] font-mono font-bold text-slate-500">SCORE:</span>
              <span className={`text-md font-mono font-extrabold ${
                localLinterResults.score >= 80 ? 'text-emerald-400' : localLinterResults.score >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {localLinterResults.score} / 100
              </span>
            </div>
          </div>

          {/* Violations reports log stream */}
          <div className="space-y-3.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block select-none">Audit Trace Diagnostic Output</span>
            
            <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto border border-slate-850 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {localLinterResults.reportLines.map((line: string, idx: number) => {
                let colorClass = 'text-slate-300';
                if (line.includes('[CRITICAL_ALERT]') || line.includes('[VIOLATION]')) {
                  colorClass = 'text-red-400 font-bold';
                } else if (line.includes('[MEDIUM_ALERT]')) {
                  colorClass = 'text-amber-400 font-bold';
                } else if (line.includes('completed') || line.includes('passed')) {
                  colorClass = 'text-emerald-400 font-bold';
                } else if (line.indexOf('[') === 0) {
                  colorClass = 'text-slate-500';
                }

                return (
                  <div key={idx} className={`${colorClass} whitespace-pre-wrap py-0.5 border-b border-slate-950/40 last:border-0`}>
                    <span className="text-slate-700 mr-2">{(idx + 1).toString().padStart(3, '0')}</span>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* GEMINI AI DEEP AUDIT REPORT BLOCK */}
      {(aiAuditReport || aiAuditError) && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-850 pb-3.5 select-none">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">AI AGENT DETAILED REPORT</span>
            <span className={`text-[10px] font-mono font-bold ${aiAuditError ? 'text-red-400' : 'text-emerald-400'}`}>
              {aiAuditError ? 'ERROR DELIVERING VERDICT' : 'SECURE VERDICT DELIVERED'}
            </span>
          </div>

          {aiAuditError ? (
            <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-2xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-mono font-bold text-red-400 block uppercase">Deep Scan Audit Interrupted</span>
                <span className="text-slate-400 block mt-1 leading-relaxed font-semibold">{aiAuditError}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 text-slate-300 p-6 rounded-2xl border border-slate-850 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <div className="prose prose-sm prose-invert max-w-none text-slate-350 space-y-4 font-sans text-xs leading-relaxed text-slate-300">
                {aiAuditReport.split('\n\n').map((paragraph, index) => {
                  // Headers
                  if (paragraph.startsWith('### ')) {
                    return <h4 key={index} className="text-sm font-bold text-white tracking-tight pt-3 border-t border-slate-850/40 first:border-0">{paragraph.replace('### ', '')}</h4>;
                  }
                  if (paragraph.startsWith('## ')) {
                    return <h3 key={index} className="text-md font-extrabold text-emerald-400 tracking-tight pt-4">{paragraph.replace('## ', '')}</h3>;
                  }
                  // Dynamic scoring or risk highlight cards
                  if (paragraph.includes('Security Score') || paragraph.includes('Overall Risk Status')) {
                    return (
                      <div key={index} className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 my-2 text-emerald-400 font-mono text-[11px] leading-relaxed">
                        {paragraph.split('\n').map((l, li) => <div key={li}>{l}</div>)}
                      </div>
                    );
                  }
                  // List items
                  if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                    return (
                      <ul key={index} className="list-disc pl-5 space-y-1 my-2 text-slate-300">
                        {paragraph.split('\n').map((line, li) => {
                          const cleanLine = line.replace(/^[-*]\s+/, '');
                          return <li key={li} className="font-medium text-slate-300 leading-relaxed">{cleanLine}</li>;
                        })}
                      </ul>
                    );
                  }
                  // Raw code output
                  if (paragraph.startsWith('```')) {
                    return (
                      <pre key={index} className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl font-mono text-[11px] my-3 leading-normal text-emerald-400 overflow-x-auto">
                        {paragraph.replace(/```[a-zA-Z]*\n?|```/g, '')}
                      </pre>
                    );
                  }
                  return <p key={index} className="font-semibold text-slate-350 leading-relaxed">{paragraph}</p>;
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
