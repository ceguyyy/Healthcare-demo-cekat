import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
// @ts-ignore
import gifshot from 'gifshot';
import { Film, Download, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Scenario } from '../types/scenario';

interface GifExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  iphoneElement: HTMLElement | null;
  scenario: Scenario;
}

export const GifExporterModal: React.FC<GifExporterModalProps> = ({
  isOpen,
  onClose,
  iphoneElement,
  scenario
}) => {
  const [status, setStatus] = useState<'idle' | 'capturing' | 'encoding' | 'done' | 'error'>('idle');
  const [progressText, setProgressText] = useState('');
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setProgressText('');
      setGifUrl(null);
    }
  }, [isOpen]);

  const handleStartExport = async () => {
    if (!iphoneElement) {
      alert('Elemen iPhone Canvas tidak ditemukan!');
      return;
    }

    try {
      setStatus('capturing');
      setProgressText('Mengambil screenshot frame Canvas iPhone...');

      const frames: string[] = [];
      const totalFrames = Math.max(3, scenario.steps ? scenario.steps.length + 1 : 3);

      for (let i = 0; i < totalFrames; i++) {
        setProgressText(`Merekam Frame ${i + 1} dari ${totalFrames}...`);
        
        // Render current iPhone DOM element to canvas
        const canvas = await html2canvas(iphoneElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        const frameDataUrl = canvas.toDataURL('image/png');
        frames.push(frameDataUrl);

        // Small delay between frame captures
        await new Promise(r => setTimeout(r, 600));
      }

      setStatus('encoding');
      setProgressText('Mengompres dan merender file GIF animasi...');

      gifshot.createGIF(
        {
          images: frames,
          gifWidth: 380,
          gifHeight: 720,
          interval: 1.2, // seconds per frame
          numWorkers: 2
        },
        (obj: any) => {
          if (!obj.error) {
            setGifUrl(obj.image);
            setStatus('done');
            setProgressText('Animated GIF berhasil dibuat!');
          } else {
            console.error('Gifshot error:', obj.error);
            setStatus('error');
            setProgressText('Gagal mengompres Animated GIF.');
          }
        }
      );

    } catch (err: any) {
      console.error('Export GIF error:', err);
      setStatus('error');
      setProgressText(`Error: ${err.message || 'Gagal merekam GIF'}`);
    }
  };

  const handleDownloadGif = () => {
    if (!gifUrl) return;
    const a = document.createElement('a');
    a.href = gifUrl;
    const filename = (scenario.name || 'cekat-ai-demo').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `${filename}.gif`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-xs text-slate-800">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              <Film size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Export Simulator as GIF</h3>
              <p className="text-[11px] text-slate-400">Rekam percakapan WhatsApp ke dalam Animated GIF</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-center">
          
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-2xl mx-auto shadow-sm">
                <Sparkles size={28} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Rekam Mockup Percakapan</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sistem akan mengambil screenshot frame demi frame dari layar iPhone WhatsApp dan merendernya menjadi file gambar animasi GIF.
                </p>
              </div>

              <button
                onClick={handleStartExport}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Film size={16} /> Mulai Proses Render GIF
              </button>
            </div>
          )}

          {(status === 'capturing' || status === 'encoding') && (
            <div className="py-8 space-y-4 flex flex-col items-center justify-center">
              <Loader2 size={36} className="text-indigo-600 animate-spin" />
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 text-sm">{progressText}</p>
                <p className="text-[11px] text-slate-500">Mohon tunggu beberapa detik, jangan tutup layar ini...</p>
              </div>
            </div>
          )}

          {status === 'done' && gifUrl && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-md max-w-[240px] mx-auto bg-slate-50">
                <img src={gifUrl} alt="Exported GIF Preview" className="w-full h-auto object-contain" />
              </div>
              
              <div className="space-y-1">
                <p className="font-extrabold text-emerald-600 text-sm flex items-center justify-center gap-1">
                  <CheckCircle2 size={16} /> Animated GIF Ready!
                </p>
                <p className="text-[11px] text-slate-500">GIF siap diunduh dan dibagikan ke presentasi/klien.</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={handleDownloadGif}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={15} /> Download GIF
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4 space-y-3">
              <p className="font-bold text-red-600 text-xs">{progressText}</p>
              <button
                onClick={handleStartExport}
                className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Coba Lagi
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
