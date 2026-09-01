import React, { useState, useEffect, useRef } from 'react';
import { Scenario, Category } from './types/scenario';
import { initialWorkflows } from './data/scenarios';
import { defaultCategories } from './data/categories';
import { SupabaseService } from './services/supabase';
import { LandingPage } from './components/LandingPage';
import { MockupGeneratorModal } from './components/MockupGeneratorModal';
import { CategoryModal } from './components/CategoryModal';
import { ImportJsonModal } from './components/ImportJsonModal';
import { MoveScenarioModal } from './components/MoveScenarioModal';
import { 
  Play, Pause, RotateCcw, VolumeX, Volume2, Plus, 
  Wifi, Battery, ChevronLeft, Phone, MoreVertical, 
  Smile, Paperclip, Send, CheckCheck, Info, Workflow, Cpu, 
  Network, ShieldCheck, ListOrdered, PhoneOff, Lock, CheckCircle2, ArrowLeft, Trash2, FileJson, FolderOutput, Edit3, Eye, EyeOff, ChevronDown, ChevronUp
} from 'lucide-react';

export function App() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [allScenarios, setAllScenarios] = useState<Scenario[]>(initialWorkflows);
  const [currentScenario, setCurrentScenario] = useState<Scenario>(initialWorkflows[0]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; role: 'rs-bot' | 'patient'; text: string; time: string; card?: any }>>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Controls Bar Collapse / Expand State
  const [isControlsExpanded, setIsControlsExpanded] = useState<boolean>(true);

  // Jump Step & Hide Welcome Message State
  const [hideInitialMsgState, setHideInitialMsgState] = useState<boolean>(false);
  const [startFromStepIdx, setStartFromStepIdx] = useState<number>(0);

  // Modals State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [scenarioToEdit, setScenarioToEdit] = useState<Scenario | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isImportJsonOpen, setIsImportJsonOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  // Call Modal State
  const [isCallActive, setIsCallActive] = useState(false);
  const [callContactName, setCallContactName] = useState('Dr. Budi, Sp.A');
  const [callTypeLabel, setCallTypeLabel] = useState('WhatsApp Voice Call');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const iphoneRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const callTimerRef = useRef<any>(null);

  // Parse URL Hash Route (e.g., #/category/healthcare/scenario/diag1_ambiguous)
  const syncFromUrlHash = (catList = categories, scList = allScenarios) => {
    const hash = window.location.hash;
    if (!hash || hash === '#/' || hash === '#') {
      setSelectedCategory(null);
      return;
    }

    const categoryMatch = hash.match(/#\/category\/([^/]+)/);
    if (categoryMatch) {
      const catId = categoryMatch[1];
      const targetCat = catList.find(c => c.id === catId);
      if (targetCat) {
        setSelectedCategory(targetCat);

        const scenarioMatch = hash.match(/scenario\/([^/]+)/);
        if (scenarioMatch) {
          const scId = scenarioMatch[1];
          const targetSc = scList.find(s => s.id === scId);
          if (targetSc) {
            setCurrentScenario(targetSc);
          }
        }
      }
    }
  };

  // Load Categories & Scenarios from Supabase / localStorage
  useEffect(() => {
    async function loadRemoteData() {
      let finalCats = defaultCategories;
      const remoteCats = await SupabaseService.fetchCategories();
      if (remoteCats && remoteCats.length > 0) {
        const customOnly = remoteCats.filter(rc => !defaultCategories.some(p => p.id === rc.id));
        finalCats = [...defaultCategories, ...customOnly];
        setCategories(finalCats);
      }

      let finalScenarios = initialWorkflows;
      const remoteScenarios = await SupabaseService.fetchScenarios();
      if (remoteScenarios && remoteScenarios.length > 0) {
        const merged = [...initialWorkflows];
        remoteScenarios.forEach(rs => {
          const idx = merged.findIndex(m => m.id === rs.id);
          if (idx >= 0) {
            merged[idx] = rs;
          } else {
            merged.push(rs);
          }
        });
        finalScenarios = merged;
        setAllScenarios(finalScenarios);
      }

      syncFromUrlHash(finalCats, finalScenarios);
    }
    loadRemoteData();

    const handleHashChange = () => {
      syncFromUrlHash();
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Filter scenarios by active category
  const activeCategoryScenarios = selectedCategory
    ? allScenarios.filter(s => {
        const sCatId = (s.categoryId || 'healthcare').toLowerCase().trim();
        const curCatId = selectedCategory.id.toLowerCase().trim();
        return sCatId === curCatId;
      })
    : [];

  // Synchronize current scenario when selected category or scenarios list changes
  useEffect(() => {
    if (selectedCategory) {
      const activeScs = allScenarios.filter(s => {
        const sCatId = (s.categoryId || 'healthcare').toLowerCase().trim();
        const curCatId = selectedCategory.id.toLowerCase().trim();
        return sCatId === curCatId;
      });

      if (activeScs.length > 0) {
        const isBelongs = activeScs.some(s => s.id === currentScenario?.id);
        if (!isBelongs) {
          setCurrentScenario(activeScs[0]);
          window.location.hash = `#/category/${selectedCategory.id}/scenario/${activeScs[0].id}`;
        }
      }
    }
  }, [selectedCategory, allScenarios]);

  // Sync hideInitialMsgState & reset startFromStepIdx when scenario changes
  useEffect(() => {
    if (currentScenario) {
      setHideInitialMsgState(Boolean(currentScenario.hideInitialMessage));
      setStartFromStepIdx(0);
    }
  }, [currentScenario]);

  // Update URL Hash when selecting Category
  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    const catScenarios = allScenarios.filter(s => s.categoryId === cat.id || (!s.categoryId && cat.id === 'healthcare'));
    const initialSc = catScenarios.length > 0 ? catScenarios[0] : null;
    if (initialSc) {
      setCurrentScenario(initialSc);
      window.location.hash = `#/category/${cat.id}/scenario/${initialSc.id}`;
    } else {
      window.location.hash = `#/category/${cat.id}`;
    }
  };

  // Update URL Hash when selecting Scenario
  const handleSelectScenario = (sc: Scenario) => {
    setCurrentScenario(sc);
    if (selectedCategory) {
      window.location.hash = `#/category/${selectedCategory.id}/scenario/${sc.id}`;
    }
  };

  // Back to Landing Page
  const handleBackToLanding = () => {
    setSelectedCategory(null);
    window.location.hash = '#/';
  };

  // Scroll canvas to bottom
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.scrollTop = canvasRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  // Jump to specific step or restart scenario
  const handleJumpToStep = (jumpStepIdx: number, hideInitial = hideInitialMsgState, scenario = currentScenario) => {
    clearTimeout(timerRef.current);
    setIsTyping(false);
    if (!scenario) return;

    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const history: Array<{ id: string; role: 'rs-bot' | 'patient'; text: string; time: string; card?: any }> = [];

    // 1. Initial Welcome Message (if not hidden)
    if (!hideInitial && scenario.initialText) {
      if (scenario.triggerType === 'OUTBOUND_SYSTEM') {
        history.push({ id: 'init', role: 'rs-bot', text: scenario.initialText, time: nowStr });
      } else {
        history.push({ id: 'init', role: 'patient', text: scenario.initialText, time: nowStr });
      }
    }

    // 2. Pre-fill chat history up to jumpStepIdx - 1
    if (scenario.steps && scenario.steps.length > 0 && jumpStepIdx > 0) {
      const limit = Math.min(jumpStepIdx, scenario.steps.length);
      for (let i = 0; i < limit; i++) {
        const s = scenario.steps[i];
        history.push({ id: `hist_user_${i}`, role: 'patient', text: s.userReply, time: nowStr });
        history.push({ id: `hist_bot_${i}`, role: 'rs-bot', text: s.aiResponse, time: nowStr, card: s.card });
      }
    }

    setChatHistory(history);
    setCurrentStepIdx(jumpStepIdx);

    // Continue playback from jumpStepIdx if playing
    if (isPlaying && scenario.steps && jumpStepIdx < scenario.steps.length) {
      timerRef.current = setTimeout(() => {
        runStep(jumpStepIdx, scenario.steps[jumpStepIdx].userReply, scenario);
      }, 2000 / playbackSpeed);
    }
  };

  const restartScenario = (scenario = currentScenario) => {
    handleJumpToStep(startFromStepIdx, hideInitialMsgState, scenario);
  };

  useEffect(() => {
    if (currentScenario) {
      restartScenario(currentScenario);
    }
  }, [currentScenario]);

  const handleDeleteScenario = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus skenario ini?')) {
      await SupabaseService.deleteScenario(id);
      setAllScenarios(prev => prev.filter(s => s.id !== id));
      const remaining = activeCategoryScenarios.filter(s => s.id !== id);
      if (remaining.length > 0) {
        handleSelectScenario(remaining[0]);
      }
    }
  };

  const runStep = (stepIdx: number, userText: string, scenario = currentScenario) => {
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    setChatHistory(prev => [
      ...prev,
      { id: `user_${Date.now()}`, role: 'patient', text: userText, time: nowStr }
    ]);

    setIsTyping(true);

    timerRef.current = setTimeout(() => {
      setIsTyping(false);
      const step = scenario.steps ? scenario.steps[stepIdx] : null;
      const botResponse = step ? step.aiResponse : 'Terima kasih! Ada hal lain yang bisa Cekat AI bantu?';

      setChatHistory(prev => [
        ...prev,
        { id: `bot_${Date.now()}`, role: 'rs-bot', text: botResponse, time: nowStr, card: step?.card }
      ]);

      const nextIdx = stepIdx + 1;
      setCurrentStepIdx(nextIdx);

      if (isPlaying && scenario.steps && nextIdx < scenario.steps.length) {
        timerRef.current = setTimeout(() => {
          runStep(nextIdx, scenario.steps[nextIdx].userReply, scenario);
        }, 3000 / playbackSpeed);
      }
    }, 2000 / playbackSpeed);
  };

  const handleChipClick = (txt: string) => {
    clearTimeout(timerRef.current);
    if (txt.includes('Telepon') || txt.includes('Panggilan')) {
      let contact = 'Dr. Budi, Sp.A';
      if (txt.includes('119') || txt.includes('Hotline')) contact = 'Hotline IGD 119';
      startCall(contact, 'WhatsApp Voice Call');
      return;
    }
    if (currentScenario.steps && currentStepIdx < currentScenario.steps.length) {
      runStep(currentStepIdx, txt);
    }
  };

  const handleManualSend = () => {
    const val = userInput.trim();
    if (val) {
      handleChipClick(val);
      setUserInput('');
    }
  };

  // Call Handlers
  const startCall = (contactName = 'Dr. Budi, Sp.A', type = 'WhatsApp Voice Call') => {
    setCallContactName(contactName);
    setCallTypeLabel(type);
    setCallSeconds(0);
    setIsCallActive(true);

    clearInterval(callTimerRef.current);
    callTimerRef.current = setInterval(() => {
      setCallSeconds(prev => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    clearInterval(callTimerRef.current);
    setIsCallActive(false);

    const mins = String(Math.floor(callSeconds / 60)).padStart(2, '0');
    const secs = String(callSeconds % 60).padStart(2, '0');
    const durationStr = `${mins}:${secs}`;
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    setChatHistory(prev => [
      ...prev,
      { id: `call_end_${Date.now()}`, role: 'rs-bot', text: `📞 Panggilan WhatsApp Selesai (Durasi: ${durationStr})`, time: nowStr }
    ]);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      restartScenario();
    } else {
      clearTimeout(timerRef.current);
    }
  };

  // Render Landing Page if no Category selected
  if (!selectedCategory) {
    return (
      <>
        <LandingPage
          categories={categories}
          onSelectCategory={handleSelectCategory}
          onAddCategory={() => {
            setCategoryToEdit(null);
            setIsCategoryModalOpen(true);
          }}
          onEditCategory={(cat) => {
            setCategoryToEdit(cat);
            setIsCategoryModalOpen(true);
          }}
        />

        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categoryToEdit={categoryToEdit}
          onCategorySaved={(savedCat) => {
            setCategories(prev => {
              const idx = prev.findIndex(p => p.id === savedCat.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = savedCat;
                return updated;
              }
              return [...prev, savedCat];
            });
          }}
          onCategoryDeleted={(deletedId) => {
            setCategories(prev => prev.filter(p => p.id !== deletedId));
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-start p-4 md:p-6 font-sans">
      
      <div className="w-full max-w-7xl flex flex-col items-center gap-4">
        
        {/* Clean Solid White Navbar */}
        <div className="w-full max-w-6xl bg-white text-slate-900 rounded-2xl px-6 py-3.5 shadow-sm flex items-center justify-between border border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToLanding}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-300 transition cursor-pointer"
              title="Kembali ke Landing Page"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2.5">
              <img src="/cekat-logo.png" alt="Cekat.AI Logo" className="w-9 h-9 object-contain rounded-xl shadow-xs" />
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none block">Cekat.AI</span>
                <span className="text-[10.5px] font-bold text-blue-600 block">{selectedCategory.title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportJsonOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileJson size={14} /> Import JSON
            </button>
            <button
              onClick={() => {
                setScenarioToEdit(null);
                setIsGeneratorOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus size={14} /> Create Mockup (SA Team)
            </button>
          </div>
        </div>

        {/* Top Tabs Carousel */}
        <div className="w-full max-w-6xl flex items-center justify-between gap-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
            {activeCategoryScenarios.map(wf => (
              <button
                key={wf.id}
                onClick={() => handleSelectScenario(wf)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border cursor-pointer ${
                  currentScenario && wf.id === currentScenario.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {wf.name}
              </button>
            ))}

            {activeCategoryScenarios.length === 0 && (
              <p className="text-xs text-slate-500 italic py-1">Belum ada skenario untuk kategori ini. Klik "+ Create Mockup" atau "Import JSON" untuk menambahkan skenario!</p>
            )}
          </div>
        </div>

        {/* Collapsible Controls Bar */}
        {isControlsExpanded ? (
          <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs text-slate-700 shadow-xs animate-fade-up">
            <button
              onClick={togglePlayPause}
              className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-semibold transition hover:bg-amber-100 cursor-pointer"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            
            <div className="h-3 w-px bg-slate-200"></div>
            
            <div className="flex items-center gap-1">
              {[1, 1.5, 2].map(sp => (
                <button
                  key={sp}
                  onClick={() => setPlaybackSpeed(sp)}
                  className={`px-2 py-0.5 rounded font-mono font-bold text-xs transition cursor-pointer ${
                    playbackSpeed === sp
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>

            <div className="h-3 w-px bg-slate-200"></div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              {soundEnabled ? <Volume2 size={13} className="text-blue-600" /> : <VolumeX size={13} />}
              <span>Audio</span>
            </button>

            <div className="h-3 w-px bg-slate-200"></div>

            <button
              onClick={() => restartScenario()}
              className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-semibold transition cursor-pointer"
              title="Reset Simulasi"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            {currentScenario && (
              <>
                <div className="h-3 w-px bg-slate-200"></div>
                <button
                  onClick={() => {
                    setScenarioToEdit(currentScenario);
                    setIsGeneratorOpen(true);
                  }}
                  className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 font-bold px-2.5 py-0.5 rounded-full transition cursor-pointer"
                  title="Edit Skenario, Pindah Kategori, & Jump Step"
                >
                  <Edit3 size={13} />
                  <span>Edit Skenario</span>
                </button>
                <div className="h-3 w-px bg-slate-200"></div>
                <button
                  onClick={() => handleDeleteScenario(currentScenario.id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold transition cursor-pointer"
                  title="Hapus Skenario Ini"
                >
                  <Trash2 size={13} />
                  <span>Hapus Skenario</span>
                </button>
              </>
            )}

            <div className="h-3 w-px bg-slate-200"></div>

            {/* Collapse Arrow Button */}
            <button
              onClick={() => setIsControlsExpanded(false)}
              className="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Sembunyikan Controls Bar"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        ) : (
          /* Compact Collapsed Button */
          <button
            onClick={() => setIsControlsExpanded(true)}
            className="bg-white border border-slate-200 shadow-xs hover:bg-slate-50 text-slate-700 font-bold px-4 py-1.5 rounded-full text-xs flex items-center gap-2 transition cursor-pointer animate-fade-up"
            title="Tampilkan Controls Bar"
          >
            <ChevronDown size={15} className="text-blue-600" />
            <span>Tampilkan Controls Bar</span>
          </button>
        )}

        {/* Main Workspace (iPhone Canvas + Inspector Panel) */}
        {currentScenario ? (
          <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 mt-1">
            
            {/* iPhone Frame Canvas */}
            <div ref={iphoneRef} className="iphone-case">
              <div className="iphone-screen">
                
                {/* Dynamic Island Notch */}
                <div className="dynamic-island">
                  <div className="camera-lens"></div>
                </div>

                {/* Status Bar */}
                <div className="bg-[#075E54] pt-11 pb-1 px-5 flex items-center justify-between text-white text-[11px] font-bold shrink-0">
                  <span>09:41</span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Wifi size={12} />
                    <Battery size={12} />
                  </div>
                </div>

                {/* WhatsApp Chat Header with Official Cekat AI Avatar */}
                <div className="bg-[#075E54] px-4 py-2.5 flex items-center gap-3 text-white shrink-0">
                  <ChevronLeft size={16} className="opacity-80 cursor-pointer" />
                  <img src="/cekat-logo.png" alt="Cekat AI Avatar" className="w-9 h-9 rounded-full object-cover shrink-0 border border-emerald-400 shadow-xs bg-white p-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs leading-tight truncate">Cekat AI Assistant</div>
                    <div className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1 leading-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm opacity-90">
                    <Phone onClick={() => startCall('Dr. Budi, Sp.A', 'WhatsApp Voice Call')} size={15} className="cursor-pointer hover:text-emerald-200 transition" />
                    <MoreVertical size={15} className="cursor-pointer" />
                  </div>
                </div>

                {/* Chat Canvas Area */}
                <div ref={canvasRef} className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  <div className="flex items-center gap-2 my-2 animate-fade-up">
                    <div className="h-px bg-slate-300 flex-1"></div>
                    <span className="text-[10px] text-slate-500 font-semibold bg-[#ECE5DD] px-2">HARI INI</span>
                    <div className="h-px bg-slate-300 flex-1"></div>
                  </div>

                  {currentScenario.triggerType === 'OUTBOUND_SYSTEM' && currentScenario.outboundPill && (
                    <div className="flex justify-center my-1 animate-fade-up">
                      <span className="bg-white text-blue-700 border border-blue-200 text-[10px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                        {currentScenario.outboundPill}
                      </span>
                    </div>
                  )}

                  {chatHistory.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'rs-bot' ? 'items-start' : 'items-end'} mb-2 animate-fade-up`}
                    >
                      <div
                        className={`px-3 py-2 text-xs leading-relaxed max-w-[85%] whitespace-pre-line rounded-2xl ${
                          msg.role === 'rs-bot'
                            ? 'bg-white text-slate-900 rounded-tl-none border border-slate-100 shadow-xs'
                            : 'bg-[#d9fdd3] text-slate-900 rounded-tr-none border border-[#c7f3be] shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {msg.card && (
                        <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200 w-full max-w-[90%] text-xs mt-1.5">
                          <div className="p-3">
                            <div className="font-extrabold text-[#075E54] text-xs flex items-center gap-1.5 mb-0.5">
                              <CheckCircle2 size={14} /> {msg.card.title}
                            </div>
                            <div className="text-[10px] text-slate-400 mb-2 font-medium">{msg.card.sub}</div>
                            {msg.card.items && msg.card.items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center py-1 border-t border-slate-100 text-[11px] gap-4">
                                <span className="text-slate-500 font-medium">{item.label}</span>
                                <span className="text-slate-900 font-bold text-right">{item.val}</span>
                              </div>
                            ))}
                          </div>
                          <div className="bg-[#075E54] text-white text-[10px] font-bold py-1.5 px-3 text-center tracking-wide uppercase">
                            {msg.card.status}
                          </div>
                        </div>
                      )}

                      <span className="text-[9.5px] text-slate-400 mt-0.5 font-medium px-1 flex items-center gap-1">
                        {msg.time} {msg.role === 'patient' && <CheckCheck size={12} className="text-sky-500" />}
                      </span>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex flex-col items-start mb-2 animate-fade-up">
                      <div className="bg-white rounded-2xl rounded-tl-none px-3.5 py-2 shadow-xs border border-slate-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#075E54] dot-1"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#075E54] dot-2"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#075E54] dot-3"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Chat Input Bar */}
                <div className="bg-[#f0ece8] border-t border-slate-300 px-3 py-2 flex items-center gap-2 shrink-0">
                  <Smile size={18} className="text-[#075E54] cursor-pointer" />
                  <input
                    type="text"
                    placeholder="Ketik pesan..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSend()}
                    className="flex-1 bg-white rounded-full px-3.5 py-1.5 text-xs text-slate-800 focus:outline-none border border-slate-200 shadow-inner"
                  />
                  <Paperclip size={18} className="text-[#075E54] cursor-pointer" />
                  <button
                    onClick={handleManualSend}
                    className="w-8 h-8 rounded-full bg-[#075E54] hover:bg-[#064e46] text-white flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition cursor-pointer"
                  >
                    <Send size={12} />
                  </button>
                </div>

                {/* Dummy WA Call Overlay Modal */}
                {isCallActive && (
                  <div className="absolute inset-0 bg-[#0f172a] z-50 flex flex-col justify-between p-6 text-white animate-fade-up">
                    <div className="flex flex-col items-center pt-8 space-y-2 text-center">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                        <Lock size={11} /> End-to-end encrypted
                      </div>
                      <h3 className="font-extrabold text-xl tracking-tight text-white">{callContactName}</h3>
                      <p className="text-xs text-slate-400 font-medium">{callTypeLabel}</p>
                      <p className="font-mono text-sm font-bold text-emerald-400">
                        {String(Math.floor(callSeconds / 60)).padStart(2, '0')}:{String(callSeconds % 60).padStart(2, '0')}
                      </p>
                    </div>

                    <div className="flex items-center justify-center relative my-auto">
                      <div className="w-28 h-28 rounded-full bg-blue-600/30 border border-blue-500/40 absolute call-ripple"></div>
                      <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-emerald-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-2xl relative z-10">
                        {callContactName.startsWith('Hotline') ? '119' : 'AI'}
                      </div>
                    </div>

                    <div className="flex items-center justify-around pb-6 pt-4 px-2">
                      <button
                        onClick={() => setIsCallMuted(!isCallMuted)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-md cursor-pointer ${
                          isCallMuted ? 'bg-red-600/20 text-red-500 border border-red-500/40' : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        <PhoneOff size={18} />
                      </button>
                      
                      <button
                        onClick={endCall}
                        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl active:scale-95 transition cursor-pointer"
                        title="End Call"
                      >
                        <PhoneOff size={22} />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right Side Inspector Panel */}
            <div className="w-full lg:flex-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm h-[690px] overflow-y-auto custom-scrollbar space-y-4 text-xs text-slate-800">
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="font-extrabold text-sm text-blue-700 flex items-center gap-2">
                  <Workflow size={16} /> {currentScenario.title}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                    currentScenario.triggerType === 'OUTBOUND_SYSTEM' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {currentScenario.triggerType === 'OUTBOUND_SYSTEM' ? 'SYSTEM OUTBOUND TRIGGER' : 'USER INBOUND CHAT'}
                  </span>
                  <span className="bg-slate-200 text-slate-700 font-mono font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-slate-300">
                    {currentScenario.tag}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
                <div className="font-bold text-amber-700 flex items-center gap-2 text-xs">
                  <Info size={15} /> Deskripsi Skenario & Tujuan
                </div>
                <p className="text-slate-700 leading-relaxed text-[11.5px]">{currentScenario.description}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="font-bold text-blue-700 flex items-center gap-2 text-xs mb-1">
                  <ListOrdered size={15} /> Alur Percakapan & Flowchart
                </div>
                <div className="space-y-2">
                  {currentScenario.stepsDetail && currentScenario.stepsDetail.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                        {idx + 1}
                      </div>
                      <div className="leading-relaxed text-[11.5px] text-slate-700 font-medium">
                        {s}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="font-bold text-blue-700 flex items-center gap-2 text-xs">
                  <Cpu size={15} /> Komponen Cekat AI
                </div>
                <div>
                  {currentScenario.cekatComponents && currentScenario.cekatComponents.map((c, i) => (
                    <span key={i} className="bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[11px] px-2.5 py-1 rounded-md inline-block mr-1 mb-1 font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="font-bold text-blue-700 flex items-center gap-2 text-xs">
                  <Network size={15} /> Scope API & Integrasi
                </div>
                <div>
                  {currentScenario.apiScopes && currentScenario.apiScopes.map((a, i) => (
                    <span key={i} className="bg-blue-50 border border-blue-200 text-blue-800 font-mono text-[11px] px-2.5 py-1 rounded-md inline-block mr-1 mb-1 font-semibold">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <div className="font-bold text-blue-700 flex items-center gap-2 text-xs">
                  <ShieldCheck size={15} /> Key Architecture Safeguard & Rule
                </div>
                <p className="text-slate-700 italic text-[11.5px] leading-relaxed">{currentScenario.ruleNote}</p>
              </div>

            </div>

          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center space-y-3 w-full max-w-3xl">
            <h3 className="font-bold text-slate-800 text-lg">Belum Ada Skenario</h3>
            <p className="text-xs text-slate-500">Kategori ini belum memiliki skenario use case. Klik tombol "+ Create Mockup" atau "Import JSON" untuk menambahkan skenario baru!</p>
          </div>
        )}

      </div>

      {/* Modals */}
      <MockupGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => {
          setIsGeneratorOpen(false);
          setScenarioToEdit(null);
        }}
        activeCategoryId={selectedCategory ? selectedCategory.id : 'healthcare'}
        categories={categories}
        scenarioToEdit={scenarioToEdit}
        onScenarioCreated={(newSc) => {
          setAllScenarios(prev => [...prev, newSc]);
          const targetCat = categories.find(c => c.id === newSc.categoryId) || selectedCategory;
          if (targetCat) {
            setSelectedCategory(targetCat);
          }
          handleSelectScenario(newSc);
        }}
        onScenarioUpdated={(updatedSc) => {
          setAllScenarios(prev => {
            const idx = prev.findIndex(s => s.id === updatedSc.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = updatedSc;
              return updated;
            }
            return prev;
          });
          const targetCat = categories.find(c => c.id === updatedSc.categoryId) || selectedCategory;
          if (targetCat) {
            setSelectedCategory(targetCat);
          }
          setCurrentScenario(updatedSc);
        }}
      />

      <ImportJsonModal
        isOpen={isImportJsonOpen}
        onClose={() => setIsImportJsonOpen(false)}
        activeCategory={selectedCategory}
        onScenarioImported={(importedScs) => {
          const scList = Array.isArray(importedScs) ? importedScs : [importedScs];
          setAllScenarios(prev => [...prev, ...scList]);
          if (scList.length > 0) {
            const firstSc = scList[0];
            const targetCat = categories.find(c => c.id === firstSc.categoryId) || selectedCategory;
            if (targetCat) {
              setSelectedCategory(targetCat);
            }
            handleSelectScenario(firstSc);
          }
        }}
      />

      <MoveScenarioModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        scenario={currentScenario}
        categories={categories}
        onScenarioMoved={(updatedSc) => {
          setAllScenarios(prev => {
            const idx = prev.findIndex(s => s.id === updatedSc.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = updatedSc;
              return updated;
            }
            return prev;
          });
          const targetCat = categories.find(c => c.id === updatedSc.categoryId);
          if (targetCat) {
            setSelectedCategory(targetCat);
          }
          setCurrentScenario(updatedSc);
          window.location.hash = `#/category/${updatedSc.categoryId}/scenario/${updatedSc.id}`;
        }}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
        onCategorySaved={(savedCat) => {
          setCategories(prev => {
            const idx = prev.findIndex(p => p.id === savedCat.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = savedCat;
              return updated;
            }
            return [...prev, savedCat];
          });
        }}
        onCategoryDeleted={(deletedId) => {
          setCategories(prev => prev.filter(p => p.id !== deletedId));
          if (selectedCategory && selectedCategory.id === deletedId) {
            handleBackToLanding();
          }
        }}
      />

    </div>
  );
}

export default App;
