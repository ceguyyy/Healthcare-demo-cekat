import React, { useState, useEffect } from 'react';
import { Scenario, Step, TriggerType, CardData, CardItem, Category, generateUUID } from '../types/scenario';
import { SupabaseService } from '../services/supabase';
import { Lock, Plus, Trash2, CheckCircle2, ShieldCheck, Database, Layers, ArrowRight, CreditCard, Edit3 } from 'lucide-react';

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
  const [cekatComponentsStr, setCekatComponentsStr] = useState('AI Agent, API Tools, WA Flows');
  const [apiScopesStr, setApiScopesStr] = useState('GET /api/v1/status');
  const [ruleNote, setRuleNote] = useState('Data dibaca real-time dari backend sistem.');
  const [stepsDetailStr, setStepsDetailStr] = useState('Step 1 — Intake\nStep 2 — Processing\nStep 3 — Confirmation');

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

  const handleSaveScenario = async () => {
    if (!name || !title || !initialText) {
      alert('Mohon lengkapi Nama, Judul, dan Pesan Awal Skenario!');
      return;
    }

    const cleanSteps = steps.map(s => {
      if (!s.enableCard) {
        return { ...s, card: undefined };
      }
      return s;
    });

    const finalCatId = targetCategoryId || activeCategoryId || 'healthcare';

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
                {scenarioToEdit ? 'Ubah parameter dan langkah skenario' : 'Buat skenario baru dan simpan ke Supabase DB'}
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
              <label className="block text-[11px] font-bold text-blue-900">Target Kategori Industri Skenario Ini:</label>
              <select
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-blue-300 text-xs bg-white font-bold text-blue-700 focus:outline-none focus:border-blue-600 shadow-xs"
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
                    placeholder="AI Agent, API Tools, n8n"
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
