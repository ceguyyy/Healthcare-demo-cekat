import React, { useState } from 'react';
import { Scenario, Category } from '../types/scenario';
import { SupabaseService } from '../services/supabase';
import { Lock, FileJson, Upload, Download, Copy, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: Category | null;
  onScenarioImported: (scenario: Scenario) => void;
}

const scenarioJsonTemplate = {
  name: "17. Contoh Skenario Import",
  title: "17. Contoh Skenario Use Case via JSON Import",
  tag: "Core Feature",
  triggerType: "INBOUND_USER",
  outboundPill: "🔔 OUTBOUND SYSTEM TRIGGER",
  description: "Deskripsi alur percakapan yang dapat di-import langsung secara instan.",
  initialText: "Halo, saya ingin mengajukan permohonan layanan ini.",
  cekatComponents: ["AI Agent", "WA Flows", "API Tools"],
  apiScopes: ["POST /api/v1/services/request"],
  ruleNote: "Data diproses dan disimpan secara terintegrasi.",
  stepsDetail: [
    "Step 1 — Intake permintaan user via WhatsApp",
    "Step 2 — Validasi identitas & persyaratan",
    "Step 3 — Penerbitan E-Tiket konfirmasi transaksi"
  ],
  steps: [
    {
      userReply: "Konfirmasi Layanan",
      aiResponse: "Permohonan Anda telah disetujui dan tercatat di sistem.",
      chips: ["📍 Lihat Detail", "Menu Utama"],
      enableCard: true,
      card: {
        title: "🎫 E-Tiket Struk Layanan",
        sub: "Cekat AI Enterprise System",
        status: "CONFIRMED & LOCKED",
        items: [
          { label: "Kode Transaksi", val: "#TRX-99801" },
          { label: "Tanggal", val: "Hari Ini" },
          { label: "Status", val: "SUCCESS" }
        ]
      }
    }
  ]
};

export const ImportJsonModal: React.FC<ImportJsonModalProps> = ({
  isOpen,
  onClose,
  activeCategory,
  onScenarioImported
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [jsonText, setJsonText] = useState('');
  const [parseError, setParseError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setJsonText(content);
        setParseError('');
      } catch (err) {
        setParseError('Gagal membaca file JSON. Pastikan format file benar!');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(JSON.stringify(scenarioJsonTemplate, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([JSON.stringify(scenarioJsonTemplate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cekat-scenario-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = async () => {
    if (!jsonText.trim()) {
      setParseError('Mohon upload file atau tempelkan JSON skenario!');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);

      // Validate required fields
      if (!parsed.name || !parsed.title || !parsed.initialText) {
        setParseError('JSON harus memiliki field: name, title, dan initialText!');
        return;
      }

      const categoryId = activeCategory ? activeCategory.id : (parsed.categoryId || 'healthcare');

      const scenarioToImport: Scenario = {
        id: generateUUID(),
        categoryId,
        name: parsed.name,
        title: parsed.title,
        tag: parsed.tag || 'Core Feature',
        saAuthor: parsed.saAuthor || 'SA Team Cekat',
        triggerType: parsed.triggerType === 'OUTBOUND_SYSTEM' ? 'OUTBOUND_SYSTEM' : 'INBOUND_USER',
        outboundPill: parsed.outboundPill,
        description: parsed.description || '',
        initialText: parsed.initialText,
        cekatComponents: Array.isArray(parsed.cekatComponents) ? parsed.cekatComponents : ['AI Agent', 'API Tools'],
        apiScopes: Array.isArray(parsed.apiScopes) ? parsed.apiScopes : ['GET /api/v1/status'],
        ruleNote: parsed.ruleNote || 'Data dibaca real-time dari backend sistem.',
        stepsDetail: Array.isArray(parsed.stepsDetail) ? parsed.stepsDetail : ['Step 1 — Process'],
        steps: Array.isArray(parsed.steps) ? parsed.steps : []
      };

      await SupabaseService.saveScenario(scenarioToImport);
      onScenarioImported(scenarioToImport);
      onClose();
    } catch (err: any) {
      setParseError(`JSON Syntax Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              <FileJson size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Import Scenario JSON</h3>
              <p className="text-[11px] text-slate-400">Import skenario kustom dari file atau struktur JSON</p>
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
              <p className="text-xs text-slate-500 max-w-sm mt-1">Masukkan password otorisasi SA Team untuk melakukan Import JSON skenario.</p>
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
              <ShieldCheck size={16} /> Buka JSON Importer
            </button>
          </form>
        ) : (
          /* Main Import & Template Form */
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-xs text-slate-800">
            
            {/* Download & Copy Template Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <FileJson size={15} className="text-blue-600" /> Template JSON Skenario
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyTemplate}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] px-3 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <Copy size={13} /> {copySuccess ? 'Copied!' : 'Copy Template'}
                  </button>
                  <button
                    onClick={handleDownloadTemplate}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer shadow-xs"
                  >
                    <Download size={13} /> Download .json
                  </button>
                </div>
              </div>
              <p className="text-[11.5px] text-slate-600">
                Gunakan template JSON di bawah sebagai referensi struktur skenario. Anda dapat mengunduh atau menyalinnya.
              </p>
            </div>

            {/* Upload File Section */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 hover:bg-slate-100/80 transition">
              <Upload size={24} className="text-blue-600" />
              <div>
                <span className="font-bold text-slate-900">Upload File JSON Skenario</span>
                <p className="text-[11px] text-slate-500">Pilih file .json dari komputer Anda</p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="text-xs cursor-pointer file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>

            {/* Raw JSON Code Editor Textarea */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">Atau Tempelkan (Paste) Kode JSON di Sini:</label>
              <textarea
                rows={9}
                placeholder="Paste JSON skenario di sini..."
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setParseError('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-slate-950 text-emerald-400 focus:outline-none focus:border-blue-600 leading-relaxed custom-scrollbar"
              />
            </div>

            {parseError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-center gap-2 font-semibold">
                <AlertCircle size={16} /> {parseError}
              </div>
            )}

            {/* Actions */}
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
                onClick={handleImportSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={16} /> Import Skenario Ke Supabase DB
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
