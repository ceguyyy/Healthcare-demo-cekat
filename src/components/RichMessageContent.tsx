import React from 'react';
import { Calendar, CheckCircle2, ShieldAlert, FileText, Lock, ExternalLink, MapPin, Star, Clock, AlertTriangle } from 'lucide-react';
import { ScenarioStep } from '../types/scenario';

interface RichMessageContentProps {
  type?: ScenarioStep['richComponent'];
  onActionClick?: (action: string) => void;
}

export const RichMessageContent: React.FC<RichMessageContentProps> = ({ type, onActionClick }) => {
  if (!type) return null;

  switch (type) {
    case 'booking_success':
      return (
        <div className="mt-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-blue-200 dark:border-blue-800/60 rounded-xl p-3.5 shadow-sm text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-700/80 pb-2">
            <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> E-Tiket Janji Dokter
            </span>
            <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
              TERKONFIRMASI
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block">No. RM Pasien</span>
              <span className="font-mono font-semibold">RM-882910</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Kode Booking</span>
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">#BK-99201</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Dokter Spesialis</span>
              <span className="font-semibold">Dr. Anita, Sp.OG</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Jadwal Praktik</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Kamis, 14:00 WIB</span>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-100 dark:border-slate-700/80 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-500" /> Reminder H-1 via WA Automated
            </span>
            <button 
              onClick={() => onActionClick?.('Unduh Tiket PDF')}
              className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1 rounded-md transition shadow-xs"
            >
              Cetak Tiket
            </button>
          </div>
        </div>
      );

    case 'reschedule_success':
      return (
        <div className="mt-2.5 bg-amber-50/80 dark:bg-slate-800/90 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 shadow-xs text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Jadwal Kontrol Berhasil Diperbarui
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Jadwal lama <span className="line-through text-slate-400">Selasa 09:00</span> diubah menjadi <strong className="text-amber-700 dark:text-amber-300">Kamis, 10:00 WIB</strong> di SIMRS Poli Bedah.
          </p>
        </div>
      );

    case 'queue_status':
      return (
        <div className="mt-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">Antrian Poli Anak</span>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-mono">
              Live Updates
            </span>
          </div>

          <div className="flex items-center justify-around bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg text-center">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Nomor Anda</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">A-045</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Saat Ini</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">A-039</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Estimasi</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">20m lagi</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Progress Pemanggilan</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">86.6%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full w-[86.6%] rounded-full transition-all duration-500"></div>
            </div>
          </div>
        </div>
      );

    case 'emergency_alert':
      return (
        <div className="mt-2.5 bg-red-50 dark:bg-red-950/80 border-2 border-red-500 rounded-xl p-3.5 shadow-md text-xs space-y-2.5 animate-pulse-subtle">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-extrabold">
            <ShieldAlert className="w-5 h-5 text-red-600 animate-bounce" />
            <span className="text-sm tracking-wide">RED CODE EMERGENCY ACTIVATED</span>
          </div>

          <p className="text-[11px] text-red-900 dark:text-red-200 leading-relaxed font-medium">
            Sistem mendeteksi kata kunci gawat darurat. Jangan menunggu balasan chat! Segera hubungi ambulans / Tim Triage IGD kami.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button 
              onClick={() => onActionClick?.('Telepon 119')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition shadow-md"
            >
              <i className="fa-solid fa-phone"></i> Hubungi Hotline 119
            </button>
            <button 
              onClick={() => onActionClick?.('Rute IGD')}
              className="bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition"
            >
              <MapPin className="w-4 h-4 text-red-500" /> Lokasi IGD Terdekat
            </button>
          </div>
        </div>
      );

    case 'ocr_parsed':
      return (
        <div className="mt-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
            <span className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <FileText className="w-4 h-4" /> Hasil OCR Vision n8n
            </span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
              Valid 98%
            </span>
          </div>

          <div className="bg-white dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">No. Surat:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">12345/BPJS/2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Puskesmas:</span>
              <span className="text-slate-800 dark:text-slate-200">Puskesmas Menteng</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Spesialis:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">Poli Saraf</span>
            </div>
          </div>
        </div>
      );

    case 'lab_portal':
      return (
        <div className="mt-2.5 bg-indigo-50/70 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 rounded-xl p-3 text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300 font-bold">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Portal E-Lab Terenkripsi (PII Encrypted)
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Hasil pemeriksaan laboratorium No. <strong className="font-mono">LAB-88102</strong> siap diunduh. Token akses berlaku selama 60 menit.
          </p>
          <button 
            onClick={() => onActionClick?.('Buka Portal Lab')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow-xs text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Buka Secure Lab Portal
          </button>
        </div>
      );

    case 'verification_flow':
      return (
        <div className="mt-2.5 bg-slate-900 text-white border border-slate-700 rounded-xl p-3 text-xs space-y-2 shadow-md">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold">
            <Lock className="w-4 h-4" /> WA Flows Security Challenge
          </div>
          <p className="text-[11px] text-slate-300 leading-normal">
            Verifikasi identitas pasien diperlukan sebelum menampilkan berkas rekam medis.
          </p>
          <button 
            onClick={() => onActionClick?.('Verifikasi ID Form')}
            className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold py-2 rounded-lg transition text-xs shadow-sm"
          >
            Isi Form Verifikasi Pasien
          </button>
        </div>
      );

    case 'billing_breakdown':
      return (
        <div className="mt-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-2">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex justify-between items-center">
            <span>Estimasi Operasi ERACS</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">Termasuk Kamar & Dokter</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">Kelas 1</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Rp 16.5M - 19.5M</span>
            </div>
            <div className="flex justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">Kelas VIP</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Rp 22.0M - 26.0M</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 p-1.5 rounded border border-amber-200 dark:border-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>BPJS berlaku jika memenuhi rujukan berjenjang.</span>
          </div>
        </div>
      );

    case 'csat_form':
      return (
        <div className="mt-2.5 bg-amber-50/60 dark:bg-slate-800/80 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 text-xs text-center space-y-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">Berikan Penilaian Anda</span>
          <div className="flex justify-center gap-2">
            {['1', '2', '3', '4', '5'].map((star) => (
              <button
                key={star}
                onClick={() => onActionClick?.(`Rating ${star} Star`)}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-amber-400 text-amber-400 hover:scale-110 transition flex items-center justify-center shadow-xs"
              >
                <Star className="w-4 h-4 fill-amber-400" />
              </button>
            ))}
          </div>
        </div>
      );

    case 'clinic_list':
      return (
        <div className="mt-2.5 space-y-2 text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Klinik Sehat Menteng</span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-500" /> 2.1 KM • Jl. Cikini Raya 45
              </span>
            </div>
            <button 
              onClick={() => onActionClick?.('Maps Menteng')}
              className="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-blue-100 transition"
            >
              Rute
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
};
