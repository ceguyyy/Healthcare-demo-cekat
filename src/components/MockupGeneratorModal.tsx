import React, { useState, useEffect } from 'react';
import { Scenario, Category, TriggerType, Step, FlowInputField, FlowData, generateUUID } from '../types/scenario';
import { SupabaseService } from '../services/supabase';
import { Lock, Database, Layers, ArrowRight, Plus, Trash2, CheckCircle2, ShieldCheck, CreditCard, Palette, FileText } from 'lucide-react';

interface MockupGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategoryId: string;
  categories: Category[];
  scenarioToEdit?: Scenario | null;
  onScenarioCreated: (newScenario: Scenario) => void;
  onScenarioUpdated: (updatedScenario: Scenario) => void;
}

export const MockupGeneratorModal: React.FC<MockupGeneratorModalProps> = ({
  isOpen,
  onClose,
  activeCategoryId,
  categories,
  scenarioToEdit,
  onScenarioCreated,
  onScenarioUpdated
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Target Category State
  const [targetCategoryId, setTargetCategoryId] = useState<string>(activeCategoryId);

  // Scenario Basic Info State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('Guardrail');
  const [triggerType, setTriggerType] = useState<TriggerType>('INBOUND_USER');
  const [outboundPill, setOutboundPill] = useState('');
  const [description, setDescription] = useState('');
  const [initialText, setInitialText] = useState('');
  const [saAuthor, setSaAuthor] = useState('Cekat AI Team');
  const [hideInitialMessage, setHideInitialMessage] = useState(false);
  const [startFromStepIdx, setStartFromStepIdx] = useState<number>(0);

  // Custom Branding Overrides State
  const [botName, setBotName] = useState('');
  const [botAvatarUrl, setBotAvatarUrl] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [headerColor, setHeaderColor] = useState('#075E54');

  // Specs Array String State
  const [cekatComponentsStr, setCekatComponentsStr] = useState('AI Agent, API Tools, WA Flows');
  const [apiScopesStr, setApiScopesStr] = useState('GET /api/v1/user');
  const [ruleNote, setRuleNote] = useState('POJK 22/2023 & UU PDP 27/2022');
  const [stepsDetailStr, setStepsDetailStr] = useState('Step 1 — Intake\nStep 2 — Process\nStep 3 — Complete');

  // Interactive Conversation Steps State
  const [steps, setSteps] = useState<Step[]>([
    {
      userReply: 'Rekomendasi Menu',
      aiResponse: 'Halo! Ada yang bisa kami bantu hari ini?',
      chips: ['Option 1', 'Option 2']
    }
  ]);

  // Load data when modal opens or scenarioToEdit changes
  useEffect(() => {
    if (scenarioToEdit) {
      setTargetCategoryId(scenarioToEdit.categoryId || activeCategoryId || 'healthcare');
      setName(scenarioToEdit.name);
      setTitle(scenarioToEdit.title);
      setTag(scenarioToEdit.tag);
      setTriggerType(scenarioToEdit.triggerType);
      setOutboundPill(scenarioToEdit.outboundPill || '');
      setDescription(scenarioToEdit.description);
      setInitialText(scenarioToEdit.initialText);
      setSaAuthor(scenarioToEdit.saAuthor || 'Cekat AI Team');
      setHideInitialMessage(Boolean(scenarioToEdit.hideInitialMessage));
      setStartFromStepIdx(scenarioToEdit.startFromStepIdx || 0);

      const b = scenarioToEdit.customBranding;
      setBotName(b?.botName || '');
      setBotAvatarUrl(b?.botAvatarUrl || '');
      setSubTitle(b?.subTitle || '');
      setHeaderColor(b?.headerColor || '#075E54');

      setCekatComponentsStr(scenarioToEdit.cekatComponents ? scenarioToEdit.cekatComponents.join(', ') : '');
      setApiScopesStr(scenarioToEdit.apiScopes ? scenarioToEdit.apiScopes.join(', ') : '');
      setRuleNote(scenarioToEdit.ruleNote || '');
      setStepsDetailStr(scenarioToEdit.stepsDetail ? scenarioToEdit.stepsDetail.join('\n') : '');
      setSteps(scenarioToEdit.steps && scenarioToEdit.steps.length > 0 ? scenarioToEdit.steps : [
        { userReply: 'Subjek', aiResponse: 'Teks balasan...', chips: [] }
      ]);
    } else {
      setTargetCategoryId(activeCategoryId || 'healthcare');
      setName('');
      setTitle('');
      setTag('Guardrail');
      setTriggerType('INBOUND_USER');
      setOutboundPill('');
      setDescription('');
      setInitialText('');
      setSaAuthor('Cekat AI Team');
      setHideInitialMessage(false);
      setStartFromStepIdx(0);

      setBotName('');
      setBotAvatarUrl('');
      setSubTitle('');
      setHeaderColor('#075E54');

      setCekatComponentsStr('AI Agent, API Tools, WA Flows');
      setApiScopesStr('GET /api/v1/user');
      setRuleNote('POJK 22/2023 & UU PDP 27/2022');
      setStepsDetailStr('Step 1 — Intake\nStep 2 — Process\nStep 3 — Complete');
      setSteps([
        {
          userReply: 'Lihat Layanan',
          aiResponse: 'Halo! Silakan pilih layanan di bawah ini.',
          chips: ['Option 1', 'Option 2']
        }
      ]);
    }
  }, [scenarioToEdit, activeCategoryId, isOpen]);

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

  const handleSaveScenario = async () => {
    if (!name || !title) {
      alert('Please fill in Scenario Short Name and Full Title!');
      return;
    }

    const cekatComponents = cekatComponentsStr.split(',').map(s => s.trim()).filter(Boolean);
    const apiScopes = apiScopesStr.split(',').map(s => s.trim()).filter(Boolean);
    const stepsDetail = stepsDetailStr.split('\n').map(s => s.trim()).filter(Boolean);

    const hasBranding = Boolean(botName || botAvatarUrl || subTitle || (headerColor && headerColor !== '#075E54'));
    const customBranding = hasBranding ? {
      botName: botName || undefined,
      botAvatarUrl: botAvatarUrl || undefined,
      subTitle: subTitle || undefined,
      headerColor: headerColor || '#075E54'
    } : undefined;

    const newScenario: Scenario = {
      id: scenarioToEdit ? scenarioToEdit.id : generateUUID(),
      categoryId: targetCategoryId || 'healthcare',
      name,
      title,
      tag,
      triggerType,
      outboundPill: triggerType === 'OUTBOUND_SYSTEM' ? (outboundPill || '🔔 OUTBOUND SYSTEM TRIGGER') : undefined,
      description,
      initialText,
      saAuthor,
      hideInitialMessage,
      startFromStepIdx,
      customBranding,
      cekatComponents,
      apiScopes,
      ruleNote,
      stepsDetail,
      steps
    };

    await SupabaseService.saveScenario(newScenario);

    if (scenarioToEdit) {
      onScenarioUpdated(newScenario);
    } else {
      onScenarioCreated(newScenario);
    }

    onClose();
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        userReply: 'Pilihan Lanjutan',
        aiResponse: 'Terima kasih, data Anda telah diperbarui.',
        chips: ['Menu Utama']
      }
    ]);
  };

  const removeStep = (idx: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const updateStepField = (idx: number, field: keyof Step, val: any) => {
    const newSteps = [...steps];
    (newSteps[idx] as any)[field] = val;
    setSteps(newSteps);
  };

  const toggleStepCard = (idx: number, enable: boolean) => {
    const newSteps = [...steps];
    newSteps[idx].enableCard = enable;
    if (enable && !newSteps[idx].card) {
      newSteps[idx].card = {
        title: '💳 Summary Card Title',
        sub: 'Verified · System Service',
        status: 'VERIFIED',
        items: [
          { label: 'Reference Code', val: 'REF-88912' },
          { label: 'Status', val: 'Completed' }
        ]
      };
    }
    setSteps(newSteps);
  };

  const addCardItem = (stepIdx: number) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].card) return;
    if (!newSteps[stepIdx].card!.items) newSteps[stepIdx].card!.items = [];
    newSteps[stepIdx].card!.items.push({ label: 'Label', val: 'Value' });
    setSteps(newSteps);
  };

  const removeCardItem = (stepIdx: number, itemIdx: number) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].card || !newSteps[stepIdx].card!.items) return;
    newSteps[stepIdx].card!.items = newSteps[stepIdx].card!.items.filter((_, i) => i !== itemIdx);
    setSteps(newSteps);
  };

  const updateCardItem = (stepIdx: number, itemIdx: number, key: 'label' | 'val', val: string) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].card || !newSteps[stepIdx].card!.items) return;
    newSteps[stepIdx].card!.items[itemIdx][key] = val;
    setSteps(newSteps);
  };

  // WhatsApp Flow Builder Handlers
  const toggleStepFlow = (stepIdx: number, enable: boolean) => {
    const newSteps = [...steps];
    newSteps[stepIdx].enableFlow = enable;
    if (enable && !newSteps[stepIdx].flow) {
      newSteps[stepIdx].flow = {
        title: '📋 Interactive WA Flow Form',
        description: 'Please complete the registration form below.',
        buttonText: '📋 Open Form',
        submitResponseText: 'Form Submitted Successfully',
        fields: [
          { id: 'f1', label: 'Full Name', type: 'text', placeholder: 'Enter your name...' },
          { id: 'f2', label: 'Preferred Option', type: 'select', options: ['Option A', 'Option B', 'Option C'] }
        ]
      };
    }
    setSteps(newSteps);
  };

  const addFlowField = (stepIdx: number) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].flow) return;
    if (!newSteps[stepIdx].flow!.fields) newSteps[stepIdx].flow!.fields = [];
    const fId = `field_${Date.now()}`;
    newSteps[stepIdx].flow!.fields.push({
      id: fId,
      label: 'New Field Label',
      type: 'text',
      placeholder: 'Enter answer...'
    });
    setSteps(newSteps);
  };

  const removeFlowField = (stepIdx: number, fieldIdx: number) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].flow || !newSteps[stepIdx].flow!.fields) return;
    newSteps[stepIdx].flow!.fields = newSteps[stepIdx].flow!.fields.filter((_, i) => i !== fieldIdx);
    setSteps(newSteps);
  };

  const updateFlowField = (stepIdx: number, fieldIdx: number, key: keyof FlowInputField, val: any) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].flow || !newSteps[stepIdx].flow!.fields) return;
    (newSteps[stepIdx].flow!.fields[fieldIdx] as any)[key] = val;
    setSteps(newSteps);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              AI
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {scenarioToEdit ? 'Edit Scenario' : 'Create New Scenario'}
              </h3>
              <p className="text-[11px] text-slate-400">Configure chat simulation, WA flows, custom branding, and jump step</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>

        {/* Auth Guard Form */}
        {!isAuthenticated ? (
          <form onSubmit={handlePasswordSubmit} className="p-8 flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl border border-blue-200 shadow-sm">
              <Lock size={24} />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-900 text-base">Authorization Required</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">Enter authorization password to edit or create scenario.</p>
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
              <ShieldCheck size={16} /> Open Scenario Form
            </button>
          </form>
        ) : (
          /* Main Generator Form */
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-xs text-slate-800">
            
            {/* Target Category Selector */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-2">
              <label className="block text-[11px] font-extrabold text-blue-900">
                📂 Target Industry Category (Move Category):
              </label>
              <select
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 text-xs bg-white font-bold text-blue-700 focus:outline-none focus:border-blue-600 shadow-xs"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Basic Info Section */}
            <div className="space-y-3">
              <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Database size={14} className="text-blue-600" /> Information & Metadata
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Scenario Short Name (Tab)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1. Ambiguous Symptoms"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Use Case Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 1. Ambiguous Symptoms Handling & Safety Gate"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tag / Category Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Guardrail / Compliance"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Trigger Type</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
                  >
                    <option value="INBOUND_USER">USER INBOUND CHAT</option>
                    <option value="OUTBOUND_SYSTEM">SYSTEM OUTBOUND TRIGGER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Author</label>
                  <input
                    type="text"
                    placeholder="e.g. Cekat AI Team"
                    value={saAuthor}
                    onChange={(e) => setSaAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              {triggerType === 'OUTBOUND_SYSTEM' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Outbound Pill Badge Text</label>
                  <input
                    type="text"
                    placeholder="🔔 OUTBOUND SYSTEM TRIGGER"
                    value={outboundPill}
                    onChange={(e) => setOutboundPill(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold text-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Scenario Description & Objective</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the business architecture and scenario goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Initial Welcome Message</label>
                <textarea
                  rows={2}
                  placeholder="First message sent by user/system..."
                  value={initialText}
                  onChange={(e) => setInitialText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold focus:outline-none focus:border-blue-600"
                />
                <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideInitialMessage}
                    onChange={(e) => setHideInitialMessage(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-[11px] text-slate-700 font-semibold">
                    🚫 Hide this initial welcome message when simulation starts
                  </span>
                </label>
              </div>
            </div>

            {/* Client Custom Branding Overrides Section */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-3">
              <div className="font-extrabold text-purple-900 text-xs flex items-center gap-1.5 border-b border-purple-200 pb-1.5">
                <Palette size={15} className="text-purple-600" /> Client Custom Branding Overrides (Demo Personalization)
              </div>
              <p className="text-[10.5px] text-purple-800">
                Customize bot name, avatar logo, header subtitle, and WhatsApp header color. Leave empty to use default Cekat AI branding.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10.5px] font-semibold text-purple-900 mb-1">Bot / Account Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Bank Mandiri Assistant"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-300 text-xs bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-semibold text-purple-900 mb-1">Avatar Logo URL / Path</label>
                  <input
                    type="text"
                    placeholder="e.g. /cekat-logo.png or Image URL"
                    value={botAvatarUrl}
                    onChange={(e) => setBotAvatarUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-300 text-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-semibold text-purple-900 mb-1">Header Status Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. Official Business Account"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-purple-900 mb-1">WhatsApp Header Theme Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    '#075E54', '#003366', '#005B9A', '#00805A', '#C41230', '#0F172A', '#2563EB', '#7C3AED', '#DB2777'
                  ].map((colorHex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHeaderColor(colorHex)}
                      className={`w-7 h-7 rounded-full transition flex items-center justify-center cursor-pointer border border-white/60 shadow-xs ${
                        headerColor === colorHex ? 'ring-2 ring-purple-600 ring-offset-2 scale-110' : 'hover:scale-105 opacity-90'
                      }`}
                      style={{ backgroundColor: colorHex }}
                      title={colorHex}
                    >
                      {headerColor === colorHex && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    className="w-8 h-7 rounded border border-purple-300 cursor-pointer bg-white"
                    title="Choose Custom Color (Hex Code)"
                  />
                  <span className="text-[11px] font-mono font-bold text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200">
                    {headerColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Specs Section */}
            <div className="space-y-3 pt-2">
              <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Layers size={14} className="text-blue-600" /> Technical Inspector Specs
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cekat AI Components (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="AI Agent, API Tools, n8n, WA Flows"
                    value={cekatComponentsStr}
                    onChange={(e) => setCekatComponentsStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">API Scopes (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="GET /api/v1/availability, POST /api/v1/booking"
                    value={apiScopesStr}
                    onChange={(e) => setApiScopesStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Rule Safeguard & Note</label>
                <input
                  type="text"
                  placeholder="Security rule notes and AI strict instructions..."
                  value={ruleNote}
                  onChange={(e) => setRuleNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white italic"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Flowchart Steps (One per line)</label>
                <textarea
                  rows={3}
                  placeholder="Step 1 — Intake&#10;Step 2 — Safety Gate&#10;Step 3 — Handoff"
                  value={stepsDetailStr}
                  onChange={(e) => setStepsDetailStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Conversation Step Sequence Builder */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ArrowRight size={14} className="text-blue-600" /> Conversation Flow (Interactive Steps)
                </div>
                <button
                  type="button"
                  onClick={addStep}
                  className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold text-[11px] px-3 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus size={13} /> Add Conversation Step
                </button>
              </div>

              {/* Start / Jump Step Selection inside Modal */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-extrabold text-blue-900 text-xs block">📍 Start Conversation From Step (Jump Step):</span>
                  <span className="text-[10.5px] text-slate-600 font-medium">Select initial step when simulation starts.</span>
                </div>
                <select
                  value={startFromStepIdx}
                  onChange={(e) => setStartFromStepIdx(Number(e.target.value))}
                  className="bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-700 focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                >
                  <option value={0}>Step 1 (Start of Conversation)</option>
                  {steps.map((st, i) => (
                    <option key={i} value={i + 1}>
                      Jump to Step {i + 2}: "{st.userReply.length > 20 ? st.userReply.slice(0, 20) + '...' : st.userReply}"
                    </option>
                  ))}
                </select>
              </div>

              {steps.map((st, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-blue-700 text-xs">Step #{idx + 1}</span>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        className="text-red-600 hover:text-red-700 text-xs flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 size={13} /> Delete Step
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">User Message</label>
                      <input
                        type="text"
                        placeholder="Message sent by user..."
                        value={st.userReply}
                        onChange={(e) => updateStepField(idx, 'userReply', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Quick Reply Chips (Comma separated)</label>
                      <input
                        type="text"
                        placeholder="Option 1, Option 2, Option 3"
                        value={st.chips ? st.chips.join(', ') : ''}
                        onChange={(e) => updateStepField(idx, 'chips', e.target.value.split(',').map(c => c.trim()).filter(Boolean))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">AI Assistant Response</label>
                    <textarea
                      rows={2}
                      placeholder="Automatic reply from Cekat AI bot..."
                      value={st.aiResponse}
                      onChange={(e) => updateStepField(idx, 'aiResponse', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Card Toggle */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={st.enableCard || false}
                        onChange={(e) => toggleStepCard(idx, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <CreditCard size={14} className="text-blue-600" /> Include Summary Card / Receipt on this step
                      </span>
                    </label>

                    {st.enableCard && st.card && (
                      <div className="mt-3 bg-white border border-blue-200 rounded-xl p-3 space-y-3">
                        <div className="font-bold text-blue-700 text-xs border-b border-slate-100 pb-1">
                          WA Receipt Card Configuration
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Card Title</label>
                            <input
                              type="text"
                              value={st.card.title}
                              onChange={(e) => {
                                const newSteps = [...steps];
                                newSteps[idx].card!.title = e.target.value;
                                setSteps(newSteps);
                              }}
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs font-bold text-emerald-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Status Subtitle</label>
                            <input
                              type="text"
                              value={st.card.sub}
                              onChange={(e) => {
                                const newSteps = [...steps];
                                newSteps[idx].card!.sub = e.target.value;
                                setSteps(newSteps);
                              }}
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Bottom Banner Status</label>
                            <input
                              type="text"
                              value={st.card.status}
                              onChange={(e) => {
                                const newSteps = [...steps];
                                newSteps[idx].card!.status = e.target.value;
                                setSteps(newSteps);
                              }}
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs font-bold uppercase"
                            />
                          </div>
                        </div>

                        {/* Card Key-Value Items */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-bold text-slate-700">Card Data Rows:</span>
                            <button
                              type="button"
                              onClick={() => addCardItem(idx)}
                              className="text-blue-600 hover:text-blue-800 font-bold text-[10.5px] cursor-pointer"
                            >
                              + Add Data Row
                            </button>
                          </div>

                          {st.card.items && st.card.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Label"
                                value={item.label}
                                onChange={(e) => updateCardItem(idx, itemIdx, 'label', e.target.value)}
                                className="flex-1 px-2 py-1 rounded border border-slate-300 text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Value"
                                value={item.val}
                                onChange={(e) => updateCardItem(idx, itemIdx, 'val', e.target.value)}
                                className="flex-1 px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => removeCardItem(idx, itemIdx)}
                                className="text-red-500 hover:text-red-700 font-bold text-xs p-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}
                  </div>

                  {/* WhatsApp Flow Form Toggle */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={st.enableFlow || false}
                        onChange={(e) => toggleStepFlow(idx, e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="font-bold text-purple-900 text-xs flex items-center gap-1">
                        <FileText size={14} className="text-purple-600" /> Include WhatsApp Flow Form on this step
                      </span>
                    </label>

                    {st.enableFlow && st.flow && (
                      <div className="mt-3 bg-purple-50/70 border border-purple-200 rounded-xl p-3 space-y-3">
                        <div className="font-extrabold text-purple-900 text-xs border-b border-purple-200 pb-1">
                          WhatsApp Flow Form Configuration
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-purple-900 mb-0.5">Flow Form Title</label>
                            <input
                              type="text"
                              value={st.flow.title}
                              onChange={(e) => {
                                const newSteps = [...steps];
                                newSteps[idx].flow!.title = e.target.value;
                                setSteps(newSteps);
                              }}
                              className="w-full px-2.5 py-1.5 rounded border border-purple-300 text-xs font-bold text-purple-900 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-purple-900 mb-0.5">Open Form Button Text</label>
                            <input
                              type="text"
                              value={st.flow.buttonText || ''}
                              onChange={(e) => {
                                const newSteps = [...steps];
                                newSteps[idx].flow!.buttonText = e.target.value;
                                setSteps(newSteps);
                              }}
                              className="w-full px-2.5 py-1.5 rounded border border-purple-300 text-xs bg-white font-semibold text-purple-700"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-purple-900 mb-0.5">Short Form Description</label>
                          <input
                            type="text"
                            value={st.flow.description || ''}
                            onChange={(e) => {
                              const newSteps = [...steps];
                              newSteps[idx].flow!.description = e.target.value;
                              setSteps(newSteps);
                            }}
                            className="w-full px-2.5 py-1.5 rounded border border-purple-300 text-xs bg-white"
                          />
                        </div>

                        {/* Fields List */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-extrabold text-purple-900">Form Input Fields:</span>
                            <button
                              type="button"
                              onClick={() => addFlowField(idx)}
                              className="text-purple-700 hover:text-purple-900 font-bold text-[10.5px] cursor-pointer"
                            >
                              + Add Input Field
                            </button>
                          </div>

                          {st.flow.fields && st.flow.fields.map((f, fieldIdx) => (
                            <div key={fieldIdx} className="bg-white border border-purple-200 rounded-lg p-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Input Field Label"
                                  value={f.label}
                                  onChange={(e) => updateFlowField(idx, fieldIdx, 'label', e.target.value)}
                                  className="flex-1 px-2 py-1 rounded border border-slate-300 text-xs font-semibold"
                                />
                                <select
                                  value={f.type}
                                  onChange={(e) => updateFlowField(idx, fieldIdx, 'type', e.target.value)}
                                  className="px-2 py-1 rounded border border-slate-300 text-xs bg-slate-50 font-bold"
                                >
                                  <option value="text">Text Field</option>
                                  <option value="select">Dropdown Select</option>
                                  <option value="date">Date</option>
                                  <option value="radio">Radio Buttons</option>
                                  <option value="checkbox">Checkbox</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => removeFlowField(idx, fieldIdx)}
                                  className="text-red-500 hover:text-red-700 font-bold text-xs p-1 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>

                              {(f.type === 'select' || f.type === 'radio' || f.type === 'checkbox') && (
                                <input
                                  type="text"
                                  placeholder="Options (Comma separated, e.g. Option A, Option B)"
                                  value={f.options ? f.options.join(', ') : ''}
                                  onChange={(e) => updateFlowField(idx, fieldIdx, 'options', e.target.value.split(',').map(o => o.trim()).filter(Boolean))}
                                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-mono bg-slate-50"
                                />
                              )}
                            </div>
                          ))}
                        </div>

                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveScenario}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={16} /> {scenarioToEdit ? 'Save Changes' : 'Save & Publish Scenario'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
