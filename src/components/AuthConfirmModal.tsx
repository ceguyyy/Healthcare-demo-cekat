import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, X, Copy, Trash2 } from 'lucide-react';

interface AuthConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'clone' | 'delete' | null;
  scenarioName?: string;
  onConfirm: () => void;
}

export const AuthConfirmModal: React.FC<AuthConfirmModalProps> = ({
  isOpen,
  onClose,
  actionType,
  scenarioName,
  onConfirm
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPasswordInput('');
      setAuthError('');
    }
  }, [isOpen]);

  if (!isOpen || !actionType) return null;

  const validPassword = import.meta.env.VITE_SA_PASSWORD || 'SAteamCekat@';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === validPassword) {
      onConfirm();
      onClose();
    } else {
      setAuthError('Invalid SA Team password. Please try again.');
    }
  };

  const isDelete = actionType === 'delete';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-scale-up">
        {/* Header */}
        <div className={`px-6 py-4 text-white flex items-center justify-between ${
          isDelete ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          <div className="flex items-center gap-2.5">
            {isDelete ? <Trash2 size={18} /> : <Copy size={18} />}
            <h3 className="font-bold text-sm tracking-tight">
              {isDelete ? 'Confirm Delete Scenario' : 'Confirm Clone Scenario'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-center">
          <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center border shadow-xs ${
            isDelete ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'
          }`}>
            <Lock size={22} />
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm">SA Team Authorization Required</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Enter password to {isDelete ? 'delete' : 'clone'} <span className="font-bold text-slate-800">"{scenarioName}"</span>.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <input
              type="password"
              placeholder="Enter SA Team Password"
              autoFocus
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                if (authError) setAuthError('');
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-blue-600 shadow-xs"
            />
            {authError && (
              <p className="text-[11px] text-red-600 font-semibold text-center">{authError}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 font-bold text-xs py-2.5 rounded-xl text-white transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                isDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <ShieldCheck size={15} />
              <span>{isDelete ? 'Delete' : 'Clone'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
