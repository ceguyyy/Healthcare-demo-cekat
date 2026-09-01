import React, { useState } from 'react';
import { Scenario, Category } from '../types/scenario';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario | null;
  category: Category | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  scenario,
  category
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !scenario || !category) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}#/category/${category.id}/scenario/${scenario.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up">
        {/* Clean Solid Header (No Gradient) */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Share2 size={18} className="text-blue-400" />
            <h3 className="font-bold text-sm tracking-tight">Share Scenario Link</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Clean Content Body */}
        <div className="p-6 space-y-4">
          {/* Scenario Info Preview */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                {category.title}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{scenario.name}</h4>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{scenario.title}</p>
          </div>

          {/* Share Link Input Bar */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Direct URL Link:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-medium rounded-xl px-3 py-2.5 focus:outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                }`}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Copy and send this URL to directly open this scenario.
          </p>
        </div>
      </div>
    </div>
  );
};
