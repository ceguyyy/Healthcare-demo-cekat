import React, { useState } from 'react';
import { Category } from '../types/scenario';
import { Plus, Settings, ArrowRight, ShieldCheck, Database, Key } from 'lucide-react';
import { SupabaseService } from '../services/supabase';

interface LandingPageProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  categories,
  onSelectCategory,
  onAddCategory,
  onEditCategory
}) => {
  const [apiKey, setApiKey] = useState(SupabaseService.getApiKey());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const handleSaveApiKey = () => {
    SupabaseService.setApiKey(apiKey);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-start p-4 md:p-8 font-sans">
      
      <div className="w-full max-w-6xl space-y-8">
        
        {/* Navbar */}
        <div className="w-full bg-white text-slate-900 rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-black shadow-xs">
              C
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">Cekat.AI</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Key size={14} className="text-amber-600" />
              <span>Supabase REST API Key</span>
            </button>

            <button
              onClick={onAddCategory}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus size={15} /> Tambah Kategori (SA Team)
            </button>
          </div>
        </div>

        {/* Supabase API Key Drawer Panel */}
        {isSettingsOpen && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Database size={16} className="text-blue-600" /> Supabase Database Connection & REST API Key Config
              </div>
              <span className="text-[11px] font-mono text-slate-500">https://sxavoyplmlgzlctphnxb.supabase.co/rest/v1/</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Masukkan Supabase Anon API Key (`apikey`) Anda agar seluruh data skenario & kategori tersimpan permanen di database Supabase dan dapat diakses dari browser mana pun tanpa batas.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="Masukkan Supabase Anon API Key (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:border-blue-600"
              />
              <button
                onClick={handleSaveApiKey}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck size={15} /> Simpan API Key
              </button>
            </div>
            {apiKeySaved && (
              <p className="text-[11px] text-emerald-600 font-bold">✅ API Key berhasil disimpan ke browser state!</p>
            )}
          </div>
        )}

        {/* Hero Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 space-y-4 text-center shadow-lg relative overflow-hidden">
          <div className="inline-block bg-blue-600/30 border border-blue-500/40 text-blue-300 font-extrabold text-xs px-4 py-1 rounded-full uppercase tracking-wider">
            Enterprise Conversational AI Platform
          </div>
          <h1 className="font-black text-3xl md:text-5xl tracking-tight leading-tight">
            Pilih Kategori Showcase & Simulasi Use Case
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
            Eksplorasi alur percakapan otomatisasi AI interaktif, integrasi API sistem, dan arsitektur guardrail aman sesuai kebutuhan industri Anda.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              <span>Daftar Kategori Use Case</span>
              <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 font-bold px-2.5 py-0.5 rounded-full">
                {categories.length} Domain Available
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group cursor-pointer border-l-4 border-l-blue-600"
                onClick={() => onSelectCategory(cat)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl border border-blue-200 font-black">
                      <i className={`fa-solid ${cat.icon}`}></i>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-700 font-mono font-bold text-[10px] px-3 py-1 rounded-full border border-slate-200">
                        {cat.badge}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCategory(cat);
                        }}
                        className="text-slate-400 hover:text-blue-600 text-xs p-1 font-semibold"
                        title="Edit Kategori"
                      >
                        <Settings size={15} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                  <span>Buka Simulator & Alur Canvas</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
