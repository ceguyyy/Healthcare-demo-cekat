import React, { useState } from 'react';
import { Scenario, Step, TriggerType, CardData, CardItem } from '../types/scenario';
import { SupabaseService } from '../services/supabase';
import { Lock, Plus, Trash2, CheckCircle2, ShieldCheck, Database, Layers, ArrowRight, CreditCard } from 'lucide-react';

interface MockupGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioCreated: (newScenario: Scenario) => void;
}

export const MockupGeneratorModal: React.FC<MockupGeneratorModalProps> = ({
  isOpen,
  onClose,
  onScenarioCreated
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('Core HIS');
  const [saAuthor, setSaAuthor] = useState('SA Team Cekat');
  const [triggerType, setTriggerType] = useState<TriggerType>('INBOUND_USER');
  const [outboundPill, setOutboundPill] = useState('🔔 OUTBOUND SYSTEM TRIGGER');
  const [description, setDescription] = useState('');
  const [initialText, setInitialText] = useState('');
  const [cekatComponentsStr, setCekatComponentsStr] = useState('AI Agent, API Tools, n8n');
  const [apiScopesStr, setApiScopesStr] = useState('GET /api/v1/availability, POST /api/v1/booking');
  const [ruleNote, setRuleNote] = useState('Data dibaca real-time dari SIMRS.');
  const [stepsDetailStr, setStepsDetailStr] = useState('Step 1 — Intake\nStep 2 — Processing\nStep 3 — Confirmation');

  // Step Sequence Builder State
  const [steps, setSteps] = useState<Step[]>([
    {
      userReply: 'Konfirmasi Booking',
      aiResponse: 'Terima kasih, janji temu Anda telah terkonfirmasi di SIMRS.',
      chips: ['📍 Petunjuk Lokasi', 'Menu Utama'],
      enableCard: true,
      card: {
        title: '🎫 E-Tiket Janji Dokter',
        sub: 'RS Sehat Utama',
        items: [
          { label: 'Kode Booking', val: '#BK-10029' },
          { label: 'Status', val: 'CONFIRMED' }
        ],
        status: 'SIMRS LOCKED'
      }
    }
  ]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'SAteamCekat@') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Password SA Team tidak valid. Coba lagi!');
    }
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        userReply: `Langkah ${steps.length + 1}`,
        aiResponse: 'Respons otomatis dari AI Bot...',
        chips: ['Lanjut', 'Batal'],
        enableCard: false
      }
    ]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof Step, val: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: val };
    setSteps(newSteps);
  };

  const toggleCardForStep = (stepIdx: number, enable: boolean) => {
    const newSteps = [...steps];
    newSteps[stepIdx].enableCard = enable;
    if (enable && !newSteps[stepIdx].card) {
      newSteps[stepIdx].card = {
        title: '🎫 E-Tiket Janji Dokter',
        sub: 'RS Sehat Utama',
        items: [
          { label: 'Kode Booking', val: `#BK-${Math.floor(10000 + Math.random() * 90000)}` },
          { label: 'Status', val: 'CONFIRMED' }
        ],
        status: 'SIMRS LOCKED'
      };
    }
    setSteps(newSteps);
  };

  const updateCardField = (stepIdx: number, field: keyof CardData, val: any) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].card) {
      newSteps[stepIdx].card = {
        title: '🎫 E-Tiket Janji Dokter',
        sub: 'RS Sehat Utama',
        items: [],
        status: 'SIMRS LOCKED'
      };
    }
    newSteps[stepIdx].card = { ...newSteps[stepIdx].card!, [field]: val };
    setSteps(newSteps);
  };

  const addCardItem = (stepIdx: number) => {
    const newSteps = [...steps];
    if (!newSteps[stepIdx].card) return;
    const currentItems = newSteps[stepIdx].card!.items || [];
    newSteps[stepIdx].card!.items = [...currentItems, { label: 'Field Baru', val: 'Nilai' }];
    setSteps(newSteps);
  };

  const updateCardItem = (stepIdx: number, itemIdx: number, field: keyof CardItem, val: string) => {
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

    const newScenario: Scenario = {
      id: `custom_${Date.now()}`,
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

    await SupabaseService.saveScenario(newScenario);
    onScenarioCreated(newScenario);
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
              SA
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">SA Mockup Generator & Flow Builder</h3>
              <p className="text-[11px] text-slate-400">Buat skenario kustom & urutan percakapan Inbound/Outbound</p>
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
              <p className="text-xs text-slate-500 max-w-sm mt-1">Masukkan password otorisasi SA Team untuk membuka Mockup Generator & Supabase DB Sync.</p>
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
              <ShieldCheck size={16} /> Buka Mockup Generator
            </button>
          </form>
        ) : (
          /* Main Generator Form */
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 text-xs text-slate-800">
            
            {/* Basic Scenario Properties */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-blue-700 flex items-center gap-2 text-xs">
                <Layers size={16} /> 1. Metadata Skenario & Trigger
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Tab Carousel</label>
                  <input
                    type="text"
                    placeholder="e.g. 17. Booking Radiologi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Judul Skenario Lengkap</label>
                  <input
                    type="text"
                    placeholder="e.g. 17. Booking Radiologi Real-Time SIMRS"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tipe Trigger Percakapan</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600 font-bold text-blue-700"
                  >
                    <option value="INBOUND_USER">📥 INBOUND USER CHAT (Mulai dari Pasien)</option>
                    <option value="OUTBOUND_SYSTEM">🔔 OUTBOUND SYSTEM TRIGGER (Mulai dari RS)</option>
                  </select>
                </div>

                {triggerType === 'OUTBOUND_SYSTEM' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Label Outbound System Pill</label>
                    <input
                      type="text"
                      placeholder="e.g. 🔔 OUTBOUND REMINDER H-1"
                      value={outboundPill}
                      onChange={(e) => setOutboundPill(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tag / Kategori</label>
                  <input
                    type="text"
                    placeholder="e.g. Core HIS / Broadcast / Routing"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Deskripsi Skenario & Tujuan</label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan tujuan dan konteks skenario ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pesan Awal (Initial Chat Text)</label>
                <textarea
                  rows={2}
                  placeholder={triggerType === 'INBOUND_USER' ? 'Pertanyaan pertama pasien...' : 'Pesan outbound otomatis dari RS...'}
                  value={initialText}
                  onChange={(e) => setInitialText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>
            </div>

            {/* Step Sequence Builder */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-blue-700 flex items-center gap-2 text-xs">
                  <ArrowRight size={16} /> 2. Urutan Step Percakapan (Flow Steps)
                </h4>
                <button
                  type="button"
                  onClick={addStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus size={14} /> Tambah Step
                </button>
              </div>

              {steps.map((step, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-xs relative">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-extrabold text-blue-700 text-xs flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">{idx + 1}</span> Step {idx + 1}
                    </span>
                    {steps.length > 1 && (
                      <button onClick={() => removeStep(idx)} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 font-semibold cursor-pointer">
                        <Trash2 size={13} /> Hapus Step
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Balasan Pasien (Pesan Kanan)</label>
                      <input
                        type="text"
                        value={step.userReply}
                        onChange={(e) => updateStep(idx, 'userReply', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Respons AI Bot (Pesan Kiri)</label>
                      <textarea
                        rows={2}
                        value={step.aiResponse}
                        onChange={(e) => updateStep(idx, 'aiResponse', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* 💳 E-Tiket / Payload Card Customizer per Step */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-emerald-700">
                        <input
                          type="checkbox"
                          checked={step.enableCard || false}
                          onChange={(e) => toggleCardForStep(idx, e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <CreditCard size={15} /> Lampirkan Kartu E-Tiket / Payload SIMRS pada Step ini
                      </label>
                      {step.enableCard && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          CARD ACTIVE
                        </span>
                      )}
                    </div>

                    {step.enableCard && step.card && (
                      <div className="space-y-2.5 pt-1">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9.5px] font-semibold text-slate-600 mb-0.5">Judul Kartu</label>
                            <input
                              type="text"
                              placeholder="e.g. 🎫 E-Tiket Janji Dokter"
                              value={step.card.title}
                              onChange={(e) => updateCardField(idx, 'title', e.target.value)}
                              className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-semibold text-slate-600 mb-0.5">Sub-Judul / Keterangan</label>
                            <input
                              type="text"
                              placeholder="e.g. RS Sehat Utama"
                              value={step.card.sub}
                              onChange={(e) => updateCardField(idx, 'sub', e.target.value)}
                              className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-semibold text-slate-600 mb-0.5">Footer Status Banner</label>
                            <input
                              type="text"
                              placeholder="e.g. SIMRS LOCKED"
                              value={step.card.status}
                              onChange={(e) => updateCardField(idx, 'status', e.target.value)}
                              className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white font-mono uppercase"
                            />
                          </div>
                        </div>

                        {/* Dynamic Key-Value Pairs List */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-700">Daftar Baris Data (Key - Value):</span>
                            <button
                              type="button"
                              onClick={() => addCardItem(idx)}
                              className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={12} /> Tambah Row Data
                            </button>
                          </div>

                          {step.card.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center gap-2 bg-white p-1.5 rounded border border-slate-200">
                              <input
                                type="text"
                                placeholder="Label (e.g. Kode Booking)"
                                value={item.label}
                                onChange={(e) => updateCardItem(idx, itemIdx, 'label', e.target.value)}
                                className="flex-1 px-2 py-1 rounded border border-slate-200 text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Value (e.g. #BK-10029)"
                                value={item.val}
                                onChange={(e) => updateCardItem(idx, itemIdx, 'val', e.target.value)}
                                className="flex-1 px-2 py-1 rounded border border-slate-200 text-xs font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => removeCardItem(idx, itemIdx)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              >
                                <Trash2 size={13} />
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

            {/* Technical Architecture Specs */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-blue-700 flex items-center gap-2 text-xs">
                <Database size={16} /> 3. Komponen Cekat & API Scope SIMRS
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Komponen Cekat AI (Pisahkan koma)</label>
                  <input
                    type="text"
                    value={cekatComponentsStr}
                    onChange={(e) => setCekatComponentsStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Scope API SIMRS (Pisahkan koma)</label>
                  <input
                    type="text"
                    value={apiScopesStr}
                    onChange={(e) => setApiScopesStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Rules & Safeguard Note</label>
                <input
                  type="text"
                  value={ruleNote}
                  onChange={(e) => setRuleNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white italic"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Step-by-Step Flowchart Nodes (Per baris)</label>
                <textarea
                  rows={3}
                  value={stepsDetailStr}
                  onChange={(e) => setStepsDetailStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                />
              </div>
            </div>

            {/* Save Action Button */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
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
                <CheckCircle2 size={16} /> Simpan Skenario Ke Supabase DB
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
