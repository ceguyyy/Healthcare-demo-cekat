import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
// @ts-ignore
import gifshot from 'gifshot';
import { Film, Download, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Scenario } from '../types/scenario';

interface GifExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  iphoneElement: HTMLElement | null;
  scenario: Scenario;
  onRecordFrames: (captureFrame: (stepLabel: string) => Promise<string>) => Promise<string[]>;
}

export const GifExporterModal: React.FC<GifExporterModalProps> = ({
  isOpen,
  onClose,
  iphoneElement,
  scenario,
  onRecordFrames
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

  const captureSingleFrame = async (stepLabel: string): Promise<string> => {
    if (!iphoneElement) throw new Error('Elemen iPhone tidak ditemukan!');
    setProgressText(`Merekam Frame: ${stepLabel}...`);
    
    // Scroll canvas to bottom before capturing
    const scrollContainer = iphoneElement.querySelector('.custom-scrollbar');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }

    const canvas = await html2canvas(iphoneElement, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    return canvas.toDataURL('image/png');
  };

  const handleStartExport = async () => {
    if (!iphoneElement) {
      alert('Elemen iPhone Canvas tidak ditemukan!');
      return;
    }

    try {
      setStatus('capturing');
      setProgressText('Memulai rekaman animasi percakapan...');

      const frames = await onRecordFrames(captureSingleFrame);

      if (!frames || frames.length === 0) {
        throw new Error('Gagal mengambil frame rekaman.');
      }

      setStatus('encoding');
      setProgressText(`Mengompres ${frames.length} frame menjadi Animated GIF...`);

      gifshot.createGIF(
        {
          images: frames,
          gifWidth: 380,
          gifHeight: 720,
          interval: 1.5, // 1.5s delay per frame for readability
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
              <h3 className="font-extrabold text-base leading-tight">Export Animated GIF</h3>
              <p className="text-[11px] text-slate-400">Rekam percakapan WhatsApp bergerak ke GIF</p>
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
                <h4 className="font-extrabold text-slate-900 text-base">Rekam Animasi Chat</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sistem akan mensimulasikan alur chat dari awal hingga akhir, mengambil screenshot di setiap balasan, dan menggabungkannya menjadi Animated GIF.
                </p>
              </div>

              <button
                onClick={handleStartExport}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Film size={16} /> Mulai Proses Render GIF Animasi
              </button>
            </div>
          )}

          {(status === 'capturing' || status === 'encoding') && (
            <div className="py-8 space-y-4 flex flex-col items-center justify-center">
              <Loader2 size={36} className="text-indigo-600 animate-spin" />
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 text-sm">{progressText}</p>
                <p className="text-[11px] text-slate-500">Simulasi sedang berjalan & merekam frame. Jangan tutup modal ini...</p>
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
                  <CheckCircle2 size={16} /> Animated GIF Berhasil Dibuat!
                </p>
                <p className="text-[11px] text-slate-500">GIF bergerak sempurna sesuai alur percakapan.</p>
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
              <p className="font-bold text-red-600 text-xs flex items-center justify-center gap-1">
                <AlertCircle size={15} /> {progressText}
              </p>
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
