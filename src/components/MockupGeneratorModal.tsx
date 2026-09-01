import React, { useState, useEffect } from 'react';
import { Scenario, Step, TriggerType, CardData, CardItem, Category, FlowData, FlowInputField, CustomBranding, generateUUID } from '../types/scenario';
import { SupabaseService } from '../services/supabase';
import { Lock, Plus, Trash2, CheckCircle2, ShieldCheck, Database, Layers, ArrowRight, CreditCard, Edit3, Palette, FileText } from 'lucide-react';

interface MockupGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioCreated: (newScenario: Scenario) => void;
  onScenarioUpdated?: (updatedScenario: Scenario) => void;
  scenarioToEdit?: Scenario | null;
  activeCategoryId?: string;
  categories?: Category[];
}

export const MockupGeneratorModal: React.FC<MockupGeneratorModalProps> = ({
  isOpen,
  onClose,
  onScenarioCreated,
  onScenarioUpdated,
  scenarioToEdit,
  activeCategoryId = 'healthcare',
  categories = []
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form State
  const [targetCategoryId, setTargetCategoryId] = useState(activeCategoryId);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('Core Feature');
  const [saAuthor, setSaAuthor] = useState('SA Team Cekat');
  const [triggerType, setTriggerType] = useState<TriggerType>('INBOUND_USER');
  const [outboundPill, setOutboundPill] = useState('🔔 OUTBOUND SYSTEM TRIGGER');
  const [description, setDescription] = useState('');
  const [initialText, setInitialText] = useState('');
  const [hideInitialMessage, setHideInitialMessage] = useState(false);
  const [startFromStepIdx, setStartFromStepIdx] = useState<number>(0);
  const [cekatComponentsStr, setCekatComponentsStr] = useState('AI Agent, API Tools, WA Flows');
  const [apiScopesStr, setApiScopesStr] = useState('GET /api/v1/status');
  const [ruleNote, setRuleNote] = useState('Data dibaca real-time dari backend sistem.');
  const [stepsDetailStr, setStepsDetailStr] = useState('Step 1 — Intake\nStep 2 — Processing\nStep 3 — Confirmation');

  // Custom Branding State
  const [botName, setBotName] = useState('');
  const [botAvatarUrl, setBotAvatarUrl] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [headerColor, setHeaderColor] = useState('#075E54');

  // Step Sequence Builder State
  const [steps, setSteps] = useState<Step[]>([
    {
      userReply: 'Konfirmasi Booking',
      aiResponse: 'Terima kasih, janji/transaksi Anda telah terkonfirmasi di sistem.',
      chips: ['📍 Lihat Detail', 'Menu Utama'],
      enableCard: true,
      card: {
        title: '🎫 E-Tiket / Struk Transaksi',
        sub: 'Cekat AI Enterprise System',
        items: [
          { label: 'Kode Transaksi', val: '#TRX-10029' },
          { label: 'Status', val: 'CONFIRMED' }
        ],
        status: 'SYSTEM LOCKED'
      }
    }
  ]);

  useEffect(() => {
    if (scenarioToEdit) {
      setTargetCategoryId(scenarioToEdit.categoryId || activeCategoryId);
      setName(scenarioToEdit.name || '');
      setTitle(scenarioToEdit.title || '');
      setTag(scenarioToEdit.tag || 'Core Feature');
      setSaAuthor(scenarioToEdit.saAuthor || 'SA Team Cekat');
      setTriggerType(scenarioToEdit.triggerType || 'INBOUND_USER');
      setOutboundPill(scenarioToEdit.outboundPill || '🔔 OUTBOUND SYSTEM TRIGGER');
      setDescription(scenarioToEdit.description || '');
      setInitialText(scenarioToEdit.initialText || '');
      setHideInitialMessage(Boolean(scenarioToEdit.hideInitialMessage));
      setStartFromStepIdx(scenarioToEdit.startFromStepIdx || 0);
      
      // Branding
      if (scenarioToEdit.customBranding) {
        setBotName(scenarioToEdit.customBranding.botName || '');
        setBotAvatarUrl(scenarioToEdit.customBranding.botAvatarUrl || '');
        setSubTitle(scenarioToEdit.customBranding.subTitle || '');
        setHeaderColor(scenarioToEdit.customBranding.headerColor || '#075E54');
      } else {
        setBotName('');
        setBotAvatarUrl('');
        setSubTitle('');
        setHeaderColor('#075E54');
      }

      setCekatComponentsStr(scenarioToEdit.cekatComponents ? scenarioToEdit.cekatComponents.join(', ') : '');
      setApiScopesStr(scenarioToEdit.apiScopes ? scenarioToEdit.apiScopes.join(', ') : '');
      setRuleNote(scenarioToEdit.ruleNote || '');
      setStepsDetailStr(scenarioToEdit.stepsDetail ? scenarioToEdit.stepsDetail.join('\n') : '');
      setSteps(scenarioToEdit.steps && scenarioToEdit.steps.length > 0 ? scenarioToEdit.steps : [
        {
          userReply: 'Konfirmasi Booking',
          aiResponse: 'Terima kasih, janji/transaksi Anda telah terkonfirmasi di sistem.',
          chips: ['📍 Lihat Detail', 'Menu Utama'],
          enableCard: false
        }
      ]);
    } else {
      setTargetCategoryId(activeCategoryId);
      setName('');
      setTitle('');
      setTag('Core Feature');
      setSaAuthor('SA Team Cekat');
      setTriggerType('INBOUND_USER');
      setOutboundPill('🔔 OUTBOUND SYSTEM TRIGGER');
      setDescription('');
      setInitialText('');
      setHideInitialMessage(false);
      setStartFromStepIdx(0);

      setBotName('');
      setBotAvatarUrl('');
      setSubTitle('');
      setHeaderColor('#075E54');

      setCekatComponentsStr('AI Agent, API Tools, WA Flows');
      setApiScopesStr('GET /api/v1/status');
      setRuleNote('Data dibaca real-time dari backend sistem.');
      setStepsDetailStr('Step 1 — Intake\nStep 2 — Processing\nStep 3 — Confirmation');
      setSteps([
        {
          userReply: 'Konfirmasi Booking',
          aiResponse: 'Terima kasih, janji/transaksi Anda telah terkonfirmasi di sistem.',
          chips: ['📍 Lihat Detail', 'Menu Utama'],
          enableCard: true,
          card: {
            title: '🎫 E-Tiket / Struk Transaksi',
            sub: 'Cekat AI Enterprise System',
            items: [
              { label: 'Kode Transaksi', val: '#TRX-10029' },
              { label: 'Status', val: 'CONFIRMED' }
            ],
            status: 'SYSTEM LOCKED'
          }
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
      setAuthError('Password SA Team tidak valid. Coba lagi!');
    }
  };

  const addStep = () => {
    setSteps(prev => [
      ...prev,
      {
        userReply: 'Lanjut',
        aiResponse: 'Informasi berhasil diproses.',
        chips: ['Menu Utama'],
        enableCard: false
      }
    ]);
  };

  const removeStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx));
  };

  const updateStepField = (idx: number, field: keyof Step, val: any) => {
    const newSteps = [...steps];
    newSteps[idx] = { ...newSteps[idx], [field]: val };
    setSteps(newSteps);
  };

  // Card Controls
  const toggleStepCard = (idx: number, enabled: boolean) => {
    const newSteps = [...steps];
    newSteps[idx].enableCard = enabled;
    if (enabled && !newSteps[idx].card) {
      newSteps[idx].card = {
        title: '💳 Saldo Rekening / Struk',
        sub: 'Verified · Real-time',
        items: [{ label: 'Status', val: 'SUCCESS' }],
        status: 'TERVERIFIKASI'
      };
    }
    setSteps(newSteps);
  };

  const addCardItem = (stepIdx: number) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].card) return;
    const items = newSteps[stepIdx].card!.items || [];
    newSteps[stepIdx].card!.items = [...items, { label: 'Label Baru', val: 'Nilai' }];
    setSteps(newSteps);
  };

  const updateCardItem = (stepIdx: number, itemIdx: number, field: 'label' | 'val', val: string) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].card || !newSteps[stepIdx].card!.items) return;
    const items = [...newSteps[stepIdx].card!.items];
    items[itemIdx] = { ...items[itemIdx], [field]: val };
    newSteps[stepIdx].card!.items = items;
    setSteps(newSteps);
  };

  const removeCardItem = (stepIdx: number, itemIdx: number) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].card || !newSteps[stepIdx].card!.items) return;
    newSteps[stepIdx].card!.items = newSteps[stepIdx].card!.items.filter((_, i) => i !== itemIdx);
    setSteps(newSteps);
  };

  // WhatsApp Flow Controls
  const toggleStepFlow = (idx: number, enabled: boolean) => {
    const newSteps = [...steps];
    newSteps[idx].enableFlow = enabled;
    if (enabled && !newSteps[idx].flow) {
      newSteps[idx].flow = {
        title: '📋 Form Registrasi / Booking Interaktif',
        description: 'Silakan isi data diri Anda di bawah ini.',
        buttonText: '📋 Buka Form Registrasi',
        submitResponseText: 'Formulir berhasil dikirimkan.',
        fields: [
          { id: generateUUID(), label: 'Nama Lengkap Pasien/Nasabah', type: 'text', placeholder: 'Masukkan nama lengkap...' },
          { id: generateUUID(), label: 'Poliklinik / Layanan', type: 'select', options: ['Poli Umum', 'Poli Anak', 'Poli Gigi'] }
        ]
      };
    }
    setSteps(newSteps);
  };

  const addFlowField = (stepIdx: number) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].flow) return;
    const fields = newSteps[stepIdx].flow!.fields || [];
    newSteps[stepIdx].flow!.fields = [
      ...fields,
      { id: generateUUID(), label: 'Field Input Baru', type: 'text', placeholder: 'Isi data...' }
    ];
    setSteps(newSteps);
  };

  const updateFlowField = (stepIdx: number, fieldIdx: number, key: keyof FlowInputField, val: any) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].flow || !newSteps[stepIdx].flow!.fields) return;
    const fields = [...newSteps[stepIdx].flow!.fields];
    fields[fieldIdx] = { ...fields[fieldIdx], [key]: val };
    newSteps[stepIdx].flow!.fields = fields;
    setSteps(newSteps);
  };

  const removeFlowField = (stepIdx: number, fieldIdx: number) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].flow || !newSteps[stepIdx].flow!.fields) return;
    newSteps[stepIdx].flow!.fields = newSteps[stepIdx].flow!.fields.filter((_, i) => i !== fieldIdx);
    setSteps(newSteps);
  };

  const handleSaveScenario = async () => {
    if (!name || !title || (!initialText && !hideInitialMessage)) {
      alert('Mohon lengkapi Nama, Judul, dan Pesan Awal Skenario!');
      return;
    }

    const cleanSteps = steps.map(s => {
      const stepObj: Step = { ...s };
      if (!stepObj.enableCard) {
        stepObj.card = undefined;
      }
      if (!stepObj.enableFlow) {
        stepObj.flow = undefined;
      }
      return stepObj;
    });

    const finalCatId = targetCategoryId || activeCategoryId || 'healthcare';

    const hasCustomBranding = botName || botAvatarUrl || subTitle || (headerColor && headerColor !== '#075E54');

    const finalScenario: Scenario = {
      id: scenarioToEdit ? scenarioToEdit.id : generateUUID(),
      categoryId: finalCatId,
      name,
      title,
      tag,
      saAuthor,
      triggerType,
      outboundPill: triggerType === 'OUTBOUND_SYSTEM' ? outboundPill : undefined,
      description,
      initialText,
      hideInitialMessage,
      startFromStepIdx,
      customBranding: hasCustomBranding ? {
        botName: botName.trim() || undefined,
        botAvatarUrl: botAvatarUrl.trim() || undefined,
        subTitle: subTitle.trim() || undefined,
        headerColor: headerColor || '#075E54'
      } : undefined,
      cekatComponents: cekatComponentsStr.split(',').map(s => s.trim()).filter(Boolean),
      apiScopes: apiScopesStr.split(',').map(s => s.trim()).filter(Boolean),
      ruleNote,
      stepsDetail: stepsDetailStr.split('\n').map(s => s.trim()).filter(Boolean),
      steps: cleanSteps
    };

    await SupabaseService.saveScenario(finalScenario);

    if (scenarioToEdit && onScenarioUpdated) {
      onScenarioUpdated(finalScenario);
    } else {
      onScenarioCreated(finalScenario);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {scenarioToEdit ? <Edit3 size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {scenarioToEdit ? 'Edit Skenario Use Case' : 'SA Mockup Generator (Create Scenario)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {scenarioToEdit ? 'Ubah parameter, alur WA Flow, branding client, dan langkah skenario' : 'Buat skenario baru dan simpan ke Supabase DB'}
              </p>
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
              <h4 className="font-bold text-slate-900 text-base">Otentikasi SA Team Required</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">Masukkan password otorisasi SA Team untuk membuat atau mengedit skenario.</p>
            </div>

            <div className="w-full max-w-xs space-y-2">
              <input
                type="password"
                placeholder="Masukkan Password (e.g. SAteamCekat@)"
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
              <ShieldCheck size={16} /> Buka Form Skenario
            </button>
          </form>
        ) : (
          /* Main Generator Form */
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-xs text-slate-800">
            
            {/* Target Category Selector */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-2">
              <label className="block text-[11px] font-extrabold text-blue-900">
                📂 Target Kategori Industri Skenario Ini (Pindahkan Kategori):
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Skenario (Tab Pill)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1. Gejala Ambigu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Judul Lengkap Use Case</label>
                  <input
                    type="text"
                    placeholder="e.g. 1. Penanganan Gejala Ambigu & Larangan Saran Poli"
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tipe Trigger</label>
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Author SA Team</label>
                  <input
                    type="text"
                    placeholder="e.g. SA Team Cekat"
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Deskripsi & Tujuan Skenario</label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan ringkas fungsi dan arsitektur skenario ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pesan Awal Chat (Initial Text)</label>
                <textarea
                  rows={2}
                  placeholder="Pesan pertama yang dikirimkan pasien/sistem..."
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
                    🚫 Sembunyikan Pesan Awal ini saat simulasi dimulai (Hide Welcome Message)
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
                Kustomisasi nama bot, logo avatar, status subtitle, dan warna header WhatsApp Simulator. Kosongkan jika ingin memakai standar Cekat AI.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10.5px] font-semibold text-purple-900 mb-1">Nama Bot / Akun WA</label>
                  <input
                    type="text"
                    placeholder="e.g. Bank Mandiri Assistant"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-300 text-xs bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-semibold text-purple-900 mb-1">URL / Path Logo Avatar</label>
                  <input
                    type="text"
                    placeholder="e.g. /cekat-logo.png atau URL Gambar"
                    value={botAvatarUrl}
                    onChange={(e) => setBotAvatarUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-300 text-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-semibold text-purple-900 mb-1">Sub-Title Status Header</label>
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
                <label className="block text-[10.5px] font-semibold text-purple-900 mb-1">Pilihan Warna Header WhatsApp Simulator</label>
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
                    title="Pilih Warna Custom (Hex Code)"
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Komponen Cekat AI (Pisahkan Koma)</label>
                  <input
                    type="text"
                    placeholder="AI Agent, API Tools, n8n, WA Flows"
                    value={cekatComponentsStr}
                    onChange={(e) => setCekatComponentsStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Scope API (Pisahkan Koma)</label>
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
                  placeholder="Catatan aturan keamanan / instruksi ketat AI..."
                  value={ruleNote}
                  onChange={(e) => setRuleNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white italic"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Langkah Alur / Flowchart (Satu per baris)</label>
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
                  <ArrowRight size={14} className="text-blue-600" /> Alur Percakapan (Interactive Steps)
                </div>
                <button
                  type="button"
                  onClick={addStep}
                  className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold text-[11px] px-3 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus size={13} /> Tambah Step Percakapan
                </button>
              </div>

              {/* Start / Jump Step Selection inside Modal */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-extrabold text-blue-900 text-xs block">📍 Mulai Percakapan Dari Step Mana Saat Dijalankan:</span>
                  <span className="text-[10.5px] text-slate-600 font-medium">Pilih step awal simulasi ketika skenario ini dibuka oleh presenter.</span>
                </div>
                <select
                  value={startFromStepIdx}
                  onChange={(e) => setStartFromStepIdx(Number(e.target.value))}
                  className="bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-700 focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                >
                  <option value={0}>Step 1 (Awal Percakapan)</option>
                  {steps.map((st, i) => (
                    <option key={i} value={i + 1}>
                      Jump ke Step {i + 2}: "{st.userReply.length > 20 ? st.userReply.slice(0, 20) + '...' : st.userReply}"
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
                        <Trash2 size={13} /> Hapus Step
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pesan Balasan User/Nasabah</label>
                      <input
                        type="text"
                        placeholder="Teks yang dikirim user..."
                        value={st.userReply}
                        onChange={(e) => updateStepField(idx, 'userReply', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Teks Opsi Chips (Pisahkan Koma)</label>
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jawaban AI Assistant</label>
                    <textarea
                      rows={2}
                      placeholder="Balasan otomatis dari bot Cekat AI..."
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
                        <CreditCard size={14} className="text-blue-600" /> Sertakan Kartu / E-Tiket Struk pada Step ini
                      </span>
                    </label>

                    {st.enableCard && st.card && (
                      <div className="mt-3 bg-white border border-blue-200 rounded-xl p-3 space-y-3">
                        <div className="font-bold text-blue-700 text-xs border-b border-slate-100 pb-1">
                          Konfigurasi Kartu Struk WA
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Judul Kartu</label>
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
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Sub-judul Status</label>
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
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Status Banner Bawah</label>
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
                            <span className="text-[10.5px] font-bold text-slate-700">Data Baris Kartu:</span>
                            <button
                              type="button"
                              onClick={() => addCardItem(idx)}
                              className="text-blue-600 hover:text-blue-800 font-bold text-[10.5px] cursor-pointer"
                            >
                              + Tambah Baris Data
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
                                placeholder="Nilai"
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
                        <FileText size={14} className="text-purple-600" /> Sertakan WhatsApp Flow (Form Interaktif) pada Step ini
                      </span>
                    </label>

                    {st.enableFlow && st.flow && (
                      <div className="mt-3 bg-purple-50/70 border border-purple-200 rounded-xl p-3 space-y-3">
                        <div className="font-extrabold text-purple-900 text-xs border-b border-purple-200 pb-1">
                          Konfigurasi WhatsApp Flow (Form Simulator)
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-purple-900 mb-0.5">Judul Form Flow</label>
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
                            <label className="block text-[10px] font-semibold text-purple-900 mb-0.5">Teks Tombol Buka Form WA</label>
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
                          <label className="block text-[10px] font-semibold text-purple-900 mb-0.5">Deskripsi Singkat Form</label>
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
                            <span className="text-[10.5px] font-extrabold text-purple-900">Input Fields Form:</span>
                            <button
                              type="button"
                              onClick={() => addFlowField(idx)}
                              className="text-purple-700 hover:text-purple-900 font-bold text-[10.5px] cursor-pointer"
                            >
                              + Tambah Input Field
                            </button>
                          </div>

                          {st.flow.fields && st.flow.fields.map((f, fieldIdx) => (
                            <div key={fieldIdx} className="bg-white border border-purple-200 rounded-lg p-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Label Input Field"
                                  value={f.label}
                                  onChange={(e) => updateFlowField(idx, fieldIdx, 'label', e.target.value)}
                                  className="flex-1 px-2 py-1 rounded border border-slate-300 text-xs font-semibold"
                                />
                                <select
                                  value={f.type}
                                  onChange={(e) => updateFlowField(idx, fieldIdx, 'type', e.target.value)}
                                  className="px-2 py-1 rounded border border-slate-300 text-xs bg-slate-50 font-bold"
                                >
                                  <option value="text">Teks Field</option>
                                  <option value="select">Dropdown Select</option>
                                  <option value="date">Tanggal</option>
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
                                  placeholder="Opsi Pilihan (Pisahkan Koma, e.g. Opsi A, Opsi B)"
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
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveScenario}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={16} /> {scenarioToEdit ? 'Simpan Perubahan Skenario' : 'Simpan & Publikasikan Skenario Baru'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
