import React, { useState, useEffect } from 'react';
import { X, RefreshCw, ExternalLink, Globe, BookOpen, Maximize2, Minimize2 } from 'lucide-react';

interface CekatIframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  badge?: string;
  iconType?: 'chat' | 'docs';
}

export const CekatIframeModal: React.FC<CekatIframeModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
  badge = 'CEKAT.AI',
  iconType = 'docs'
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setIframeKey(prev => prev + 1);
    }
  }, [url, isOpen]);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 animate-fade-in">
      <div
        className={`bg-white rounded-3xl shadow-2xl border border-slate-200 w-full overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen ? 'h-full max-w-full rounded-none' : 'h-[85vh] max-w-5xl'
        }`}
      >
        {/* Modal Top Header (Solid Slate-900) */}
        <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs ${
              iconType === 'chat' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}>
              {iconType === 'chat' ? <Globe size={18} /> : <BookOpen size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm tracking-tight">{title}</h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  iconType === 'chat'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                }`}>
                  {badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">{url}</p>
            </div>
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Reload Iframe"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Open in new tab"
            >
              <ExternalLink size={16} />
            </a>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1"></div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Iframe Viewport Container */}
        <div className="relative flex-1 bg-slate-100 w-full overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white space-y-3">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-600">Loading {title} ({url})...</p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={url}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-0"
            title={title}
            allow="microphone; camera; clipboard-write; autoplay"
          />
        </div>
      </div>
    </div>
  );
};
