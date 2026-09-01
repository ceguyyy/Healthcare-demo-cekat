import React, { useState } from 'react';
import { X, ShieldCheck, Lock } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rmNo: string, dob: string) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [rmNo, setRmNo] = useState('RM-882910');
  const [dob, setDob] = useState('1992-08-14');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rmNo, dob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <span>Form Verifikasi Privasi Pasien (SIMRS)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Sesuai standar Permenkes & Keamanan Data Medis, masukkan Rekam Medis & Tanggal Lahir untuk memverifikasi akses EMR.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Nomor Rekam Medis (No. RM)</label>
            <input 
              type="text" 
              value={rmNo} 
              onChange={(e) => setRmNo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              required 
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Tanggal Lahir (Pasien)</label>
            <input 
              type="date" 
              value={dob} 
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              required 
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-lg transition"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="w-1/2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <Lock className="w-3.5 h-3.5" /> Verifikasi Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
