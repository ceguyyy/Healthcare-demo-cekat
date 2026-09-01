import React, { useState } from 'react';
import { Search, Hospital, RotateCcw, X, Check, ChevronRight } from 'lucide-react';
import { Scenario, ScenarioCategory } from '../types/scenario';

interface SidebarProps {
  scenarios: Scenario[];
  currentScenario: Scenario;
  currentStepIndex: number;
  onSelectScenario: (id: number) => void;
  onRestartScenario: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  scenarios,
  currentScenario,
  currentStepIndex,
  onSelectScenario,
  onRestartScenario,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories: string[] = ['All', 'Core HIS', 'Queue API', 'Guardrail', 'Compliance', 'OCR + EMR', 'Security', 'Billing'];

  const filteredScenarios = scenarios.filter((sc) => {
    const matchesSearch = 
      sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.tag.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || sc.tag === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full lg:w-80 h-[680px] bg-slate-900/80 backdrop-blur-md rounded-[32px] border border-white/10 p-4 flex flex-col shadow-2xl shrink-0">
      
      {/* Sidebar Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white flex items-center gap-2">
            <Hospital className="w-4 h-4 text-blue-400" /> Healthcare Scenarios
          </h2>
          <button 
            onClick={onRestartScenario}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded-lg flex items-center gap-1 transition border border-slate-700"
            title="Reset Current Simulation"
          >
            <RotateCcw className="w-3 h-3 text-blue-400" /> Reset
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Pilih skenario untuk simulasi otomatis & audit SIMRS.</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-2.5">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari skenario, tag, atau modul..." 
          className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-500 transition"
        />
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')} 
            className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2 mb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-950/50 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List Scenarios */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {filteredScenarios.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            Tidak ada skenario cocok dengan "{searchQuery}"
          </div>
        ) : (
          filteredScenarios.map((sc) => {
            const isActive = sc.id === currentScenario.id;
            const isFinished = isActive && currentStepIndex >= sc.steps.length;

            return (
              <div
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-900/40 to-slate-900 border-blue-500/80 text-white shadow-lg shadow-blue-500/10' 
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold text-xs ${isActive ? 'text-blue-300' : 'text-slate-200 group-hover:text-white'}`}>
                    {sc.title}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono border ${
                    sc.tag === 'Guardrail' 
                      ? 'bg-red-950/80 text-red-400 border-red-800'
                      : sc.tag === 'Security'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}>
                    {sc.tag}
                  </span>
                </div>

                <p className="text-[10px] leading-relaxed text-slate-400 truncate">
                  {sc.desc}
                </p>

                {isActive && (
                  <div className="mt-2 pt-2 border-t border-blue-500/20 flex items-center justify-between text-[10px]">
                    <span className="text-blue-400 font-medium flex items-center gap-1">
                      {isFinished ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Completed
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                          Running Step {Math.min(currentStepIndex + 1, sc.steps.length)} / {sc.steps.length}
                        </>
                      )}
                    </span>
                    <ChevronRight className="w-3 h-3 text-blue-400" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center flex justify-between items-center">
        <span>12 Scenarios Specs</span>
        <span className="font-mono text-blue-400 font-bold">Cekat AI v2.4</span>
      </div>

    </div>
  );
};
