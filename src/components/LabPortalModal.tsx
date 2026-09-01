import React from 'react';
import { X, Lock, FileCheck, Download } from 'lucide-react';

interface LabPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LabPortalModal: React.FC<LabPortalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Lock className="w-5 h-5 text-indigo-400" />
            <span>Secure Patient Lab Portal (Token: 88102a)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-sans text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Pemeriksaan:</span>
            <span className="font-bold text-slate-200">Hematologi Lengkap + Swab PCR</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Tanggal Tes:</span>
            <span className="font-mono text-slate-300">01 September 2026</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status Validasi:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <FileCheck className="w-4 h-4" /> Verifikasi Dokter Sp.PK
            </span>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex justify-between text-[11px] p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-300">Hemoglobin (Hb)</span>
              <span className="font-mono font-bold text-emerald-400">14.2 g/dL (Normal)</span>
            </div>
            <div className="flex justify-between text-[11px] p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-300">Leukosit</span>
              <span className="font-mono font-bold text-emerald-400">7.800 /µL (Normal)</span>
            </div>
            <div className="flex justify-between text-[11px] p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-300">Trombosit</span>
              <span className="font-mono font-bold text-emerald-400">285.000 /µL (Normal)</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-md text-xs"
          >
            <Download className="w-4 h-4" /> Download PDF Resmi Terenkripsi
          </button>
        </div>
      </div>
    </div>
  );
};
