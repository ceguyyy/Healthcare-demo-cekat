import React, { useState } from 'react';
import { Scenario, Category } from '../types/scenario';
import { X, Copy, Check, Share2, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';

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

  const whatsappShareText = encodeURIComponent(
    `🏥 *${scenario.name}* (${category.title})\n\n${scenario.title}\n\nLihat simulasi interaktif Cekat AI di sini:\n${shareUrl}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
              <Share2 size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Share Use Case Link</h3>
              <p className="text-xs text-purple-100">Bagikan tautan simulasi langsung ke klien atau tim</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Scenario Info Preview */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-purple-100 text-purple-800 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                {category.title}
              </span>
              <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                {scenario.tag || 'Use Case Demo'}
              </span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">{scenario.name}</h4>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{scenario.title}</p>
          </div>

          {/* Share Link Input Bar */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Direct Deep Link URL:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-mono font-medium rounded-xl px-3.5 py-2.5 focus:outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Action Share Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
            <a
              href={`https://api.whatsapp.com/send?text=${whatsappShareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <MessageSquare size={16} />
              <span>Share via WhatsApp</span>
            </a>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Open link in new tab"
            >
              <ExternalLink size={15} />
              <span>Open Link</span>
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 text-center">
          <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
            <Sparkles size={12} className="text-amber-500" />
            Tautan ini akan langsung membuka skenario ini secara otomatis.
          </p>
        </div>
      </div>
    </div>
  );
};
