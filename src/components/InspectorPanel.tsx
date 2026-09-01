import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Shield, Cpu, Server, Activity } from 'lucide-react';
import { Scenario } from '../types/scenario';

interface InspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  currentStepIndex: number;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  isOpen,
  onClose,
  scenario,
  currentStepIndex,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentStep = scenario.steps[Math.max(0, currentStepIndex - 1)] || scenario.steps[0];
  const payload = currentStep?.payloadData || {
    endpoint: "/api/v2/his/generic",
    method: "POST",
    status: 200,
    requestBody: { query: scenario.initialUser },
    responseBody: { status: "PROCESSED", intent: scenario.tag },
    executionTimeMs: 95,
    guardrailStatus: "PASS"
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full lg:w-80 h-[680px] bg-slate-900/90 backdrop-blur-md rounded-[32px] border border-purple-500/30 p-4 flex flex-col shadow-2xl shrink-0 text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2 text-purple-400 font-bold">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>SIMRS Technical Inspector</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Technical Spec Summary Cards */}
      <div className="space-y-2 mb-3">
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Integration Architecture</span>
          </div>
          <p className="text-[11px] text-slate-200 font-mono leading-relaxed">
            {scenario.technicalSpec.hisIntegration}
          </p>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guardrail Shield Status</span>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[11px] text-slate-300 font-mono">
              {scenario.technicalSpec.securityLevel}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
              payload.guardrailStatus === 'ESCALATED' 
                ? 'bg-red-950 text-red-400 border border-red-800'
                : payload.guardrailStatus === 'PII_MASKED'
                ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {payload.guardrailStatus}
            </span>
          </div>
        </div>
      </div>

      {/* API Payload Inspector Header */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-bold text-slate-300 flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-amber-400" /> Live Payload (SIMRS API)
        </span>
        <button 
          onClick={copyJson}
          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1 transition"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy JSON'}</span>
        </button>
      </div>

      {/* HTTP Endpoint info */}
      <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono text-[11px] mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">{payload.method}</span>
          <span className="text-slate-300 truncate max-w-[140px]">{payload.endpoint}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-[10px]">
          <span className="text-emerald-400 font-bold">{payload.status} OK</span>
          <span className="flex items-center gap-0.5 text-blue-400">
            <Activity className="w-3 h-3" /> {payload.executionTimeMs}ms
          </span>
        </div>
      </div>

      {/* Code Block JSON viewer */}
      <div className="flex-1 bg-slate-950 rounded-xl p-3 border border-slate-800 overflow-y-auto custom-scrollbar font-mono text-[10.5px] leading-relaxed text-slate-300">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>

      {/* Footer watermark */}
      <div className="mt-2 text-[10px] text-slate-500 text-center font-mono">
        n8n + Cekat AI LLM Shield Pipeline
      </div>

    </div>
  );
};
