import React from 'react';
import { Volume2, VolumeX, Play, Pause, FastForward, Terminal, Moon, Sun, Smartphone, Layout, Monitor } from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  widgetTheme: 'light' | 'dark';
  onToggleWidgetTheme: () => void;
  viewMode: 'mobile' | 'floating' | 'full';
  onChangeViewMode: (mode: 'mobile' | 'floating' | 'full') => void;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  widgetTheme,
  onToggleWidgetTheme,
  viewMode,
  onChangeViewMode,
  inspectorOpen,
  onToggleInspector
}) => {
  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30 shrink-0">
            <span className="font-extrabold text-white text-base tracking-tighter">C</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 -mt-2 -ml-0.5 animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-100 text-sm md:text-base tracking-tight flex items-center gap-1.5">
                Cekat AI <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">Healthcare Spec</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Interactive SIMRS Automation & Hospital AI Agent Simulator
            </p>
          </div>
        </div>

        {/* Global Controls Toolbar */}
        <div className="flex items-center flex-wrap justify-center gap-2">

          {/* Auto Simulation Controls */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1 shadow-inner">
            <button
              onClick={onTogglePlay}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isPlaying 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
              title={isPlaying ? 'Pause Auto Simulation' : 'Play Auto Simulation'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            {/* Speed Selector */}
            <div className="flex items-center border-l border-slate-800 pl-1">
              {[1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeSpeed(s)}
                  className={`px-2 py-1 text-[10px] font-mono rounded font-bold transition ${
                    playbackSpeed === s 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => onChangeViewMode('mobile')}
              className={`p-1.5 rounded-lg transition text-xs flex items-center gap-1 ${
                viewMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Replica Widget Frame (400px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeViewMode('floating')}
              className={`p-1.5 rounded-lg transition text-xs flex items-center gap-1 ${
                viewMode === 'floating' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Floating Web Chat Widget"
            >
              <Layout className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeViewMode('full')}
              className={`p-1.5 rounded-lg transition text-xs flex items-center gap-1 ${
                viewMode === 'full' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Canvas Mode"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Widget Dark / Light Toggle */}
          <button
            onClick={onToggleWidgetTheme}
            className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white transition"
            title={`Switch Widget Theme (Current: ${widgetTheme})`}
          >
            {widgetTheme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition ${
              soundEnabled 
                ? 'bg-blue-950/50 border-blue-800 text-blue-400' 
                : 'bg-slate-950/80 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute Audio Effects' : 'Enable Audio Effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Technical Inspector Toggle */}
          <button
            onClick={onToggleInspector}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              inspectorOpen 
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20' 
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Inspector</span>
          </button>

        </div>

      </div>
    </header>
  );
};
