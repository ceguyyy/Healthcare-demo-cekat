import React, { useState } from 'react';
import { X, RefreshCw, ExternalLink, Globe, Maximize2, Minimize2 } from 'lucide-react';

interface CekatChatIframeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CekatChatIframeModal: React.FC<CekatChatIframeModalProps> = ({
  isOpen,
  onClose
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  const chatUrl = 'https://chat.cekat.ai/chat';

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
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Globe size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm tracking-tight">Cekat AI Live Web Chat</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  LIVE IFRAME
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">https://chat.cekat.ai/chat</p>
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
              href={chatUrl}
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
              <p className="text-xs font-bold text-slate-600">Loading Live Cekat AI Chat (chat.cekat.ai)...</p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={chatUrl}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-0"
            title="Cekat AI Live Web Chat"
            allow="microphone; camera; clipboard-write; autoplay"
          />
        </div>
      </div>
    </div>
  );
};
