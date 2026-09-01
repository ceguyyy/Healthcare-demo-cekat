import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { scenarios } from './data/scenarios';
import { Scenario } from './types/scenario';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWidget } from './components/ChatWidget';
import { InspectorPanel } from './components/InspectorPanel';
import { VerificationModal } from './components/VerificationModal';
import { LabPortalModal } from './components/LabPortalModal';
import { playSound } from './utils/sound';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  richComponent?: Scenario['steps'][0]['richComponent'];
}

export function App() {
  const [currentScenario, setCurrentScenario] = useState<Scenario>(scenarios[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([]);
  const [availableChips, setAvailableChips] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>('light');
  const [viewMode, setViewMode] = useState<'mobile' | 'floating' | 'full'>('mobile');
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  
  // Modals state
  const [isVerificationOpen, setIsVerificationOpen] = useState<boolean>(false);
  const [isLabPortalOpen, setIsLabPortalOpen] = useState<boolean>(false);

  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // Clear pending timers
  const clearAutoTimer = () => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  };

  // Reset simulation for current scenario
  const initScenario = (scenario: Scenario, shouldAutoPlay: boolean = isPlaying) => {
    clearAutoTimer();
    setCurrentScenario(scenario);
    setCurrentStepIndex(0);
    setIsTyping(false);

    const initialMsg: ChatMessage = {
      id: `msg-init-${Date.now()}`,
      sender: 'user',
      text: scenario.initialUser,
      timestamp: getFormattedTime(),
    };

    setDisplayedMessages([initialMsg]);
    playSound('send', soundEnabled);

    const firstStep = scenario.steps[0];
    const initialChips = firstStep ? firstStep.chips : ["Menu Utama", "Customer Service"];
    setAvailableChips(initialChips);

    if (shouldAutoPlay && scenario.steps.length > 0) {
      const delay = 1800 / playbackSpeed;
      autoTimerRef.current = setTimeout(() => {
        executeStep(scenario, 0, firstStep.userReply);
      }, delay);
    }
  };

  // Execute scenario step
  const executeStep = (scenario: Scenario, stepIdx: number, userText: string) => {
    clearAutoTimer();

    // Append User Reply
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: getFormattedTime(),
    };

    setDisplayedMessages((prev) => [...prev, userMsg]);
    playSound('send', soundEnabled);
    setIsTyping(true);

    const botDelay = 2200 / playbackSpeed;

    autoTimerRef.current = setTimeout(() => {
      setIsTyping(false);

      const step = scenario.steps[stepIdx];
      const botResponseText = step ? step.aiResponse : "Terima kasih! Ada hal lain yang bisa Cekat AI bantu?";
      
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: getFormattedTime(),
        richComponent: step?.richComponent,
      };

      setDisplayedMessages((prev) => [...prev, botMsg]);

      // Sound triggers
      if (step?.richComponent === 'emergency_alert') {
        playSound('emergency', soundEnabled);
      } else {
        playSound('receive', soundEnabled);
      }

      // Update chips & step index
      const nextChips = step?.chips || ["Terima Kasih", "Menu Utama"];
      setAvailableChips(nextChips);
      const nextStepIdx = stepIdx + 1;
      setCurrentStepIndex(nextStepIdx);

      // Trigger Confetti on booking completion
      if (step?.richComponent === 'booking_success') {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        playSound('complete', soundEnabled);
      }

      // Auto play next step if available
      if (isPlaying && nextStepIdx < scenario.steps.length) {
        const nextStep = scenario.steps[nextStepIdx];
        const loopDelay = 3200 / playbackSpeed;
        autoTimerRef.current = setTimeout(() => {
          executeStep(scenario, nextStepIdx, nextStep.userReply);
        }, loopDelay);
      }
    }, botDelay);
  };

  // Handle user manual chip click or message submission
  const handleUserSendMessage = (userText: string) => {
    clearAutoTimer();
    playSound('chip', soundEnabled);

    if (currentStepIndex < currentScenario.steps.length) {
      executeStep(currentScenario, currentStepIndex, userText);
    } else {
      // Loop or restart scenario
      executeStep(currentScenario, 0, userText);
    }
  };

  // Handle rich component action buttons (e.g. Open Lab Portal, Verify ID)
  const handleActionClick = (actionName: string) => {
    playSound('chip', soundEnabled);
    if (actionName === 'Buka Portal Lab') {
      setIsLabPortalOpen(true);
    } else if (actionName === 'Verifikasi ID Form') {
      setIsVerificationOpen(true);
    } else {
      handleUserSendMessage(actionName);
    }
  };

  // Initialize on mount
  useEffect(() => {
    initScenario(scenarios[0], true);
    return () => clearAutoTimer();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Header Controls */}
      <Header 
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isPlaying={isPlaying}
        onTogglePlay={() => {
          const nextState = !isPlaying;
          setIsPlaying(nextState);
          if (nextState) {
            initScenario(currentScenario, true);
          } else {
            clearAutoTimer();
          }
        }}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={(speed) => {
          setPlaybackSpeed(speed);
          if (isPlaying) {
            initScenario(currentScenario, true);
          }
        }}
        widgetTheme={widgetTheme}
        onToggleWidgetTheme={() => setWidgetTheme(widgetTheme === 'light' ? 'dark' : 'light')}
        viewMode={viewMode}
        onChangeViewMode={(mode) => setViewMode(mode)}
        inspectorOpen={inspectorOpen}
        onToggleInspector={() => setInspectorOpen(!inspectorOpen)}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-x-hidden">
        
        <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-6">
          
          {/* Left Sidebar Scenario Explorer */}
          <Sidebar 
            scenarios={scenarios}
            currentScenario={currentScenario}
            currentStepIndex={currentStepIndex}
            onSelectScenario={(id) => {
              const sc = scenarios.find((s) => s.id === id) || scenarios[0];
              initScenario(sc, isPlaying);
            }}
            onRestartScenario={() => initScenario(currentScenario, isPlaying)}
          />

          {/* Center Chat Widget Simulator */}
          <div className="flex-1 flex justify-center items-center w-full">
            <ChatWidget 
              scenario={currentScenario}
              currentStepIndex={currentStepIndex}
              displayedMessages={displayedMessages}
              availableChips={availableChips}
              isTyping={isTyping}
              onSendUserMessage={handleUserSendMessage}
              onRestartScenario={() => initScenario(currentScenario, isPlaying)}
              widgetTheme={widgetTheme}
              onToggleWidgetTheme={() => setWidgetTheme(widgetTheme === 'light' ? 'dark' : 'light')}
              viewMode={viewMode}
              onActionClick={handleActionClick}
            />
          </div>

          {/* Right Technical Inspector (Drawer or Inline) */}
          {inspectorOpen && (
            <InspectorPanel 
              isOpen={inspectorOpen}
              onClose={() => setInspectorOpen(false)}
              scenario={currentScenario}
              currentStepIndex={currentStepIndex}
            />
          )}

        </div>

      </main>

      {/* Interactive Modals */}
      <VerificationModal 
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        onSubmit={(rmNo, dob) => {
          handleUserSendMessage(`✅ Verifikasi Berhasil (RM: ${rmNo}, Tgl Lahir: ${dob})`);
        }}
      />

      <LabPortalModal 
        isOpen={isLabPortalOpen}
        onClose={() => setIsLabPortalOpen(false)}
      />

    </div>
  );
}

export default App;
