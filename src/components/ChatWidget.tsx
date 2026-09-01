import React, { useRef, useEffect, useState } from 'react';
import { Minus, Smile, Paperclip, Send, RefreshCw, Moon, Sun, Sparkles } from 'lucide-react';
import { Scenario, ScenarioStep } from '../types/scenario';
import { RichMessageContent } from './RichMessageContent';

interface ChatWidgetProps {
  scenario: Scenario;
  currentStepIndex: number;
  displayedMessages: Array<{
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: string;
    richComponent?: ScenarioStep['richComponent'];
  }>;
  availableChips: string[];
  isTyping: boolean;
  onSendUserMessage: (text: string) => void;
  onRestartScenario: () => void;
  widgetTheme: 'light' | 'dark';
  onToggleWidgetTheme: () => void;
  viewMode: 'mobile' | 'floating' | 'full';
  onActionClick: (action: string) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  scenario,
  currentStepIndex,
  displayedMessages,
  availableChips,
  isTyping,
  onSendUserMessage,
  onRestartScenario,
  widgetTheme,
  onToggleWidgetTheme,
  viewMode,
  onActionClick,
}) => {
  const [inputText, setInputText] = useState('');
  const chatCanvasRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatCanvasRef.current) {
      chatCanvasRef.current.scrollTop = chatCanvasRef.current.scrollHeight;
    }
  }, [displayedMessages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim() || availableChips[0] || "Lanjutkan";
    onSendUserMessage(textToSend);
    setInputText('');
  };

  const isDark = widgetTheme === 'dark';

  // Responsive view container width
  const containerWidthClass = 
    viewMode === 'mobile' 
      ? 'w-full max-w-[400px] h-[680px]' 
      : viewMode === 'floating'
      ? 'w-full max-w-[480px] h-[680px]'
      : 'w-full max-w-[640px] h-[680px]';

  return (
    <div className={`${containerWidthClass} ${
      isDark 
        ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-2xl shadow-blue-500/10' 
        : 'bg-[#f4f4f6] border-white/40 text-slate-800 shadow-2xl'
    } rounded-[32px] flex flex-col justify-between p-4 relative border overflow-hidden transition-all duration-300`}>
      
      {/* Widget Header Pill */}
      <div className="relative shrink-0 pt-1 pb-2 flex justify-center items-center">
        
        {/* Floating Brand Badge */}
        <div className={`${
          isDark 
            ? 'bg-slate-800 border-slate-700 text-slate-100' 
            : 'bg-white border-slate-100 text-slate-900'
        } rounded-full px-4 py-1.5 shadow-sm border flex items-center gap-2.5 transition`}>
          <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold overflow-hidden border border-blue-500/30">
            <span className="font-extrabold text-[#0095ff]">RS</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs leading-tight flex items-center gap-1">
              RS Sehat Utama
              <Sparkles className="w-3 h-3 text-amber-400" />
            </span>
            <span className="text-[10px] text-emerald-500 font-medium leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
            </span>
          </div>
        </div>

        {/* Right Header Buttons */}
        <div className="absolute right-2 top-2 flex items-center gap-1">
          <button 
            onClick={onToggleWidgetTheme}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition"
            title="Toggle Widget Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          <button 
            onClick={onRestartScenario}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition"
            title="Restart Scenario Demo"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Chat Messages Canvas */}
      <div 
        ref={chatCanvasRef} 
        className="flex-1 overflow-y-auto widget-scrollbar py-3 px-1 space-y-3"
      >
        {displayedMessages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div 
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              <div className={`${
                isUser 
                  ? 'bg-[#0095ff] text-white rounded-[18px] rounded-tr-[4px] px-4 py-2.5 text-xs font-normal max-w-[84%] shadow-sm leading-relaxed whitespace-pre-line'
                  : isDark
                  ? 'bg-slate-800 text-slate-100 rounded-[18px] rounded-tl-[4px] px-4 py-3 text-xs font-normal max-w-[88%] shadow-sm border border-slate-700/60 leading-relaxed whitespace-pre-line'
                  : 'bg-white text-slate-800 rounded-[18px] rounded-tl-[4px] px-4 py-3 text-xs font-normal max-w-[88%] shadow-sm border border-slate-100 leading-relaxed whitespace-pre-line'
              }`}>
                {/* Text Formatting for Bold and Links */}
                <div 
                  dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
                      .replace(/🔗 (https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>')
                  }}
                />

                {/* Rich Component Embed */}
                {!isUser && msg.richComponent && (
                  <RichMessageContent type={msg.richComponent} onActionClick={onActionClick} />
                )}
              </div>

              {/* Message Timestamp */}
              <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-1 font-mono px-1`}>
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Bot Typing Indicator */}
        {isTyping && (
          <div className="shrink-0 mb-2 animate-in fade-in duration-200">
            <div className={`${
              isDark 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-slate-100'
            } rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm border w-fit flex items-center gap-1.5`}>
              <span className="w-2 h-2 rounded-full bg-slate-400 dot-1"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 dot-2"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 dot-3"></span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Reply Chips Carousel */}
      <div className="shrink-0 mb-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {availableChips.map((chipText, index) => (
            <button
              key={index}
              onClick={() => onSendUserMessage(chipText)}
              className={`${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              } border text-[11px] px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap shadow-xs cursor-pointer transition active:scale-95 shrink-0 flex items-center gap-1`}
            >
              {chipText}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar Form */}
      <div className="shrink-0">
        <form onSubmit={handleSend} className={`${
          isDark 
            ? 'bg-slate-800 border-slate-700/80' 
            : 'bg-white border-slate-200/80'
        } rounded-full px-4 py-2 shadow-sm border flex items-center justify-between gap-2`}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={availableChips.length > 0 ? `Pilih opsi di atas atau ketik...` : "Ketik pesan Anda..."}
            className={`w-full bg-transparent text-xs ${
              isDark ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'
            } focus:outline-none`}
          />

          <div className="flex items-center gap-2.5 text-slate-400 text-sm">
            <button type="button" className="hover:text-slate-600 dark:hover:text-slate-200 transition">
              <Smile className="w-4 h-4" />
            </button>
            <button type="button" className="hover:text-slate-600 dark:hover:text-slate-200 transition">
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-[#0095ff] hover:bg-blue-600 text-white flex items-center justify-center transition shadow-sm shrink-0 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Footer Watermark */}
        <div className={`text-center text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-2 font-medium flex items-center justify-center gap-1`}>
          Powered by <span className="text-[#0095ff] font-bold">Cekat AI</span>
        </div>
      </div>

    </div>
  );
};
