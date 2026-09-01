import React, { useState } from 'react';
import { Scenario, Category, generateUUID } from '../types/scenario';
import { SupabaseService } from '../services/supabase';
import { Lock, FileJson, Upload, Download, Copy, CheckCircle2, ShieldCheck, AlertCircle, Bot, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: Category | null;
  onScenarioImported: (scenarios: Scenario[]) => void;
}

// Full Variable Dictionary Prompt for AI Generators
const aiPromptPromptGuide = `PROMPT INSTRUCTION UNTUK AI GENERATOR (ChatGPT / Claude / Gemini / DeepSeek):
-----------------------------------------------------------------------------------
Buatkan skenario Cekat.AI dalam format JSON Array sesuai dengan KAMUS VARIABEL berikut.
Output WAJIB berupa JSON Array valid tanpa teks tambahan di luar JSON.

KAMUS VARIABEL (JSON SCHEMA SPECIFICATION):
-----------------------------------------------------------------------------------
1. "name" (string, Wajib): Nama singkat skenario untuk tombol tab pill di atas simulator (maksimal 30 karakter). Example: "1. Cek Saldo & Mutasi"
2. "title" (string, Wajib): Judul lengkap use case untuk Inspector Panel kanan. Example: "1. Pengecekan Saldo / Mutasi Rekening (Verifikasi PII Ketat)"
3. "tag" (string, Wajib): Label kategori fitur (contoh: "Security · PII", "Fraud · SLA Urgent", "Outbound · Collection")
4. "triggerType" (string, Wajib): Tipe pemicu awal. Harus "INBOUND_USER" (diawali pesan user) atau "OUTBOUND_SYSTEM" (diawali pesan otomatis sistem).
5. "outboundPill" (string, Opsional): Teks badge pemberitahuan jika triggerType = "OUTBOUND_SYSTEM". Example: "🔔 OUTBOUND SYSTEM TRIGGER"
6. "description" (string, Wajib): Penjelasan lengkap tujuan skenario, alur bisnis, dan manfaat otomatisasi AI.
7. "initialText" (string, Wajib): Pesan pertama yang dikirimkan user/sistem di WhatsApp saat simulasi dimulai.
8. "cekatComponents" (array of string, Wajib): Daftar komponen Cekat.AI. Example: ["AI Agent", "API Tools", "Automation", "WA Flows"]
9. "apiScopes" (array of string, Wajib): Daftar endpoint API backend terintegrasi. Example: ["POST /otp/send", "GET /account/balance"]
10. "ruleNote" (string, Wajib): Catatan regulasi & guardrail arsitektur (contoh: "POJK 22/2023 & UU PDP 27/2022").
11. "stepsDetail" (array of string, Wajib): Langkah-langkah penjelas alur flowchart di Inspector Panel.
12. "steps" (array of object, Wajib): Array giliran percakapan interaktif:
    - "userReply" (string): Teks balasan dari user.
    - "aiResponse" (string): Teks jawaban balasan dari Cekat AI Assistant.
    - "chips" (array of string): Tombol pilihan opsi cepat di bawah pesan AI.
    - "enableCard" (boolean): true jika menampilkan kartu E-Tiket/Struk; false jika pesan teks biasa.
    - "card" (object, Opsional jika enableCard=true):
        * "title" (string): Judul kartu (contoh: "💳 Saldo Rekening").
        * "sub" (string): Sub-judul status (contoh: "Verified · Masked").
        * "status" (string): Status banner bawah kartu (contoh: "TERVERIFIKASI", "SUCCESS", "FROZEN").
        * "items" (array of { "label": string, "val": string }): Pasangan data label & nilai pada kartu.

CONTOH FORMAT STUKTUR OUTPUT JSON ARRAY:
-----------------------------------------------------------------------------------
[
  {
    "name": "1. Cek Saldo & Mutasi",
    "title": "1. Pengecekan Saldo / Mutasi Rekening (Verifikasi PII Ketat)",
    "tag": "Security · PII",
    "triggerType": "INBOUND_USER",
    "description": "Cek saldo dengan verifikasi OTP.",
    "initialText": "Saya mau cek saldo tabungan saya.",
    "cekatComponents": ["AI Agent", "API Tools", "WA Flows"],
    "apiScopes": ["POST /otp/send", "GET /account/balance"],
    "ruleNote": "POJK 22/2023 & UU PDP 27/2022",
    "stepsDetail": ["Step 1 — Intake", "Step 2 — Verifikasi OTP"],
    "steps": [
      {
        "userReply": "Cek saldo tabungan",
        "aiResponse": "Masukkan 6 digit OTP untuk melanjutkan.",
        "chips": ["Masukkan OTP ••••••"],
        "enableCard": false
      },
      {
        "userReply": "••••••",
        "aiResponse": "Verifikasi berhasil. Berikut ringkasan rekening Anda.",
        "chips": ["Lihat mutasi", "Menu Utama"],
        "enableCard": true,
        "card": {
          "title": "💳 Saldo Rekening",
          "sub": "Verified · Masked",
          "status": "TERVERIFIKASI",
          "items": [
            { "label": "Rekening", "val": "•••• 1234" },
            { "label": "Saldo Aktif", "val": "Rp 12.480.000" }
          ]
        }
      }
    ]
  }
]`;

const variableDictionary = [
  { field: "name", type: "string", req: "Wajib", desc: "Nama singkat skenario untuk tombol tab di atas simulator (maksimal 30 karakter). Example: '1. Cek Saldo & Mutasi'" },
  { field: "title", type: "string", req: "Wajib", desc: "Judul lengkap use case untuk Inspector Panel kanan. Example: '1. Pengecekan Saldo / Mutasi Rekening (Verifikasi PII Ketat)'" },
  { field: "tag", type: "string", req: "Wajib", desc: "Label tag kategori fitur. Example: 'Security · PII', 'Fraud · SLA Urgent', 'Outbound · Collection'" },
  { field: "triggerType", type: "string", req: "Wajib", desc: "Tipe pemicu awal percapakan: wajib 'INBOUND_USER' atau 'OUTBOUND_SYSTEM'." },
  { field: "outboundPill", type: "string", req: "Opsional", desc: "Teks badge pemberitahuan jika triggerType = 'OUTBOUND_SYSTEM'. Example: '🔔 OUTBOUND SYSTEM TRIGGER'" },
  { field: "description", type: "string", req: "Wajib", desc: "Penjelasan lengkap mengenai tujuan skenario, alur bisnis, dan manfaat otomatisasi AI bagi klien." },
  { field: "initialText", type: "string", req: "Wajib", desc: "Pesan pertama yang dikirimkan user/sistem di WhatsApp saat simulasi dimulai." },
  { field: "cekatComponents", type: "string[]", req: "Wajib", desc: "Daftar komponen Cekat.AI yang digunakan. Example: ['AI Agent', 'API Tools', 'Automation', 'WA Flows']" },
  { field: "apiScopes", type: "string[]", req: "Wajib", desc: "Daftar endpoint API backend terintegrasi. Example: ['POST /otp/send', 'GET /account/balance']" },
  { field: "ruleNote", type: "string", req: "Wajib", desc: "Catatan regulasi resmi & guardrail arsitektur. Example: 'POJK 22/2023 & UU PDP 27/2022'" },
  { field: "stepsDetail", type: "string[]", req: "Wajib", desc: "Langkah-langkah penjelas alur flowchart di Inspector Panel kanan." },
  { field: "steps", type: "Step[]", req: "Wajib", desc: "Array giliran percakapan interaktif (tiap step berisi userReply, aiResponse, chips, enableCard, & card)." }
];

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
  const [copyPromptSuccess, setCopyPromptSuccess] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);

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
    navigator.clipboard.writeText(aiPromptPromptGuide);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCopyAiPrompt = () => {
    navigator.clipboard.writeText(aiPromptPromptGuide);
    setCopyPromptSuccess(true);
    setTimeout(() => setCopyPromptSuccess(false), 2000);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([aiPromptPromptGuide], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cekat-ai-prompt-dictionary.txt';
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
      const itemsToProcess = Array.isArray(parsed) ? parsed : [parsed];

      if (itemsToProcess.length === 0) {
        setParseError('JSON Array kosong!');
        return;
      }

      // Validate all items
      for (let i = 0; i < itemsToProcess.length; i++) {
        const item = itemsToProcess[i];
        if (!item.name || !item.title || !item.initialText) {
          setParseError(`Elemen ke-${i + 1} harus memiliki field wajib: name, title, dan initialText!`);
          return;
        }
      }

      const importedScenarios: Scenario[] = [];

      for (const item of itemsToProcess) {
        const categoryId = activeCategory ? activeCategory.id : (item.categoryId || 'healthcare');

        const scenario: Scenario = {
          id: generateUUID(),
          categoryId,
          name: item.name,
          title: item.title,
          tag: item.tag || 'Core Feature',
          saAuthor: item.saAuthor || 'SA Team Cekat',
          triggerType: item.triggerType === 'OUTBOUND_SYSTEM' ? 'OUTBOUND_SYSTEM' : 'INBOUND_USER',
          outboundPill: item.outboundPill,
          description: item.description || '',
          initialText: item.initialText,
          hideInitialMessage: Boolean(item.hideInitialMessage),
          startFromStepIdx: item.startFromStepIdx || 0,
          customBranding: item.customBranding ? {
            botName: item.customBranding.botName,
            botAvatarUrl: item.customBranding.botAvatarUrl,
            subTitle: item.customBranding.subTitle,
            headerColor: item.customBranding.headerColor
          } : undefined,
          cekatComponents: Array.isArray(item.cekatComponents) ? item.cekatComponents : ['AI Agent', 'API Tools'],
          apiScopes: Array.isArray(item.apiScopes) ? item.apiScopes : ['GET /api/v1/status'],
          ruleNote: item.ruleNote || 'Data dibaca real-time dari backend sistem.',
          stepsDetail: Array.isArray(item.stepsDetail) ? item.stepsDetail : ['Step 1 — Process'],
          steps: Array.isArray(item.steps) ? item.steps.map((st: any) => ({
            userReply: st.userReply || '',
            aiResponse: st.aiResponse || '',
            chips: Array.isArray(st.chips) ? st.chips : [],
            enableCard: Boolean(st.enableCard),
            card: st.card,
            enableFlow: Boolean(st.enableFlow),
            flow: st.flow
          })) : []
        };

        await SupabaseService.saveScenario(scenario);
        importedScenarios.push(scenario);
      }

      onScenarioImported(importedScenarios);
      onClose();
    } catch (err: any) {
      setParseError(`JSON Syntax Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              <FileJson size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Import & Bulk Upload Scenario JSON</h3>
              <p className="text-[11px] text-slate-400">Import satu atau banyak (Bulk) skenario JSON sekaligus</p>
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
              <p className="text-xs text-slate-500 max-w-sm mt-1">Masukkan password otorisasi SA Team untuk melakukan Bulk Import JSON skenario.</p>
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
            
            {/* AI Generator Prompt Guide & Variable Dictionary Buttons */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Bot size={16} className="text-indigo-600" /> Panduan Prompt & Kamus Variabel AI Generator
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAiPrompt}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    title="Copy Prompt Lengkap Beserta Kamus Variabel ke AI lain"
                  >
                    <Bot size={14} /> {copyPromptSuccess ? 'Copied Prompt AI!' : 'Copy Prompt untuk AI'}
                  </button>
                  <button
                    onClick={handleDownloadTemplate}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <Download size={13} /> Download Panduan .txt
                  </button>
                </div>
              </div>
              
              <p className="text-[11.5px] text-slate-600 leading-relaxed">
                Klik **`Copy Prompt untuk AI`** di atas lalu tempelkan ke **ChatGPT / Claude / Gemini / DeepSeek**. Prompt tersebut sudah berisi penjelasan lengkap setiap variabel dan instruksi pembuatan JSON Array otomatis.
              </p>

              {/* Toggleable Variable Dictionary Table */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDictionary(!showDictionary)}
                  className="flex items-center gap-1.5 font-extrabold text-blue-700 hover:text-blue-800 text-xs cursor-pointer"
                >
                  <BookOpen size={14} />
                  <span>{showDictionary ? 'Sembunyikan Kamus Variabel JSON' : 'Lihat Kamus Variabel JSON Skenario (12 Field)'}</span>
                  {showDictionary ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showDictionary && (
                  <div className="mt-3 space-y-2 overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
                      <thead>
                        <tr className="bg-slate-200/80 text-slate-800 font-bold border-b border-slate-300">
                          <th className="p-2 border-r border-slate-300">Variabel</th>
                          <th className="p-2 border-r border-slate-300">Tipe</th>
                          <th className="p-2 border-r border-slate-300">Status</th>
                          <th className="p-2">Fungsi & Penjelasan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {variableDictionary.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-blue-700 border-r border-slate-200">{item.field}</td>
                            <td className="p-2 font-mono text-slate-600 border-r border-slate-200">{item.type}</td>
                            <td className="p-2 border-r border-slate-200">
                              <span className={`font-bold px-1.5 py-0.5 rounded text-[9.5px] ${item.req === 'Wajib' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                {item.req}
                              </span>
                            </td>
                            <td className="p-2 text-slate-700 leading-normal">{item.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Upload File Section */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 hover:bg-slate-100/80 transition">
              <Upload size={24} className="text-blue-600" />
              <div>
                <span className="font-bold text-slate-900">Upload File JSON Skenario</span>
                <p className="text-[11px] text-slate-500">Pilih file .json single atau bulk array dari komputer Anda</p>
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
              <label className="block text-[11px] font-semibold text-slate-700">Atau Tempelkan (Paste) Kode JSON di Sini (Single Object / Bulk Array):</label>
              <textarea
                rows={10}
                placeholder="Paste JSON single object {...} atau bulk array [{...}, {...}] hasil generasi AI di sini..."
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
