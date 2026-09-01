import React, { useState, useEffect } from 'react';
import { Scenario, Category } from '../types/scenario';
import { SupabaseService } from '../services/supabase';
import { Lock, FolderOutput, CheckCircle2, ShieldCheck } from 'lucide-react';

interface MoveScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario | null;
  categories: Category[];
  onScenarioMoved: (updatedScenario: Scenario) => void;
}

export const MoveScenarioModal: React.FC<MoveScenarioModalProps> = ({
  isOpen,
  onClose,
  scenario,
  categories,
  onScenarioMoved
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [targetCatId, setTargetCatId] = useState<string>('');

  useEffect(() => {
    if (scenario) {
      setTargetCatId(scenario.categoryId || 'healthcare');
    }
  }, [scenario, isOpen]);

  if (!isOpen || !scenario) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPassword = import.meta.env.VITE_SA_PASSWORD || 'SAteamCekat@';
    if (passwordInput === validPassword) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid authorization password. Please try again.');
    }
  };

  const handleMoveSubmit = async () => {
    if (!targetCatId) return;

    const updatedScenario: Scenario = {
      ...scenario,
      categoryId: targetCatId
    };

    await SupabaseService.saveScenario(updatedScenario);
    onScenarioMoved(updatedScenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-xs text-slate-800">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <FolderOutput size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Move Scenario Category</h3>
              <p className="text-[11px] text-slate-400">Change industry domain category for this scenario</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>

        {/* Auth Guard Form */}
        {!isAuthenticated ? (
          <form onSubmit={handlePasswordSubmit} className="p-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl border border-blue-200 shadow-sm">
              <Lock size={24} />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-900 text-base">Authorization Required</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">Enter authorization password to move scenario to another category.</p>
            </div>

            <div className="w-full max-w-xs space-y-2">
              <input
                type="password"
                placeholder="Enter Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-blue-600 shadow-xs"
              />
              {authError && <p className="text-[11px] text-red-600 font-semibold text-center">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={16} /> Open Category Mover
            </button>
          </form>
        ) : (
          /* Move Category Selection Form */
          <div className="p-6 space-y-4">
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5 text-left">
              <span className="font-bold text-blue-700 text-xs block">Selected Scenario:</span>
              <h4 className="font-black text-slate-900 text-sm leading-snug">{scenario.title}</h4>
              <p className="text-[11px] text-slate-500 font-mono">ID: {scenario.id}</p>
            </div>

            <div className="text-left space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700">Select Target Industry Category</label>
              <select
                value={targetCatId}
                onChange={(e) => setTargetCatId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs bg-white font-bold text-blue-700 focus:outline-none focus:border-blue-600 shadow-xs"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.badge})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMoveSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={16} /> Move Category
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
