import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Video, Download, CheckCircle2, Loader2, Sparkles, AlertCircle, Play } from 'lucide-react';
import { Scenario } from '../types/scenario';

interface VideoExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  iphoneElement: HTMLElement | null;
  scenario: Scenario;
  onPlayScenarioForVideo: () => Promise<void>;
}

export const VideoExporterModal: React.FC<VideoExporterModalProps> = ({
  isOpen,
  onClose,
  iphoneElement,
  scenario,
  onPlayScenarioForVideo
}) => {
  const [status, setStatus] = useState<'idle' | 'recording' | 'done' | 'error'>('idle');
  const [progressText, setProgressText] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setProgressText('');
      setVideoUrl(null);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isOpen]);

  const handleStartExport = async () => {
    if (!iphoneElement) {
      alert('Elemen iPhone Canvas tidak ditemukan!');
      return;
    }

    try {
      setStatus('recording');
      setProgressText('Memulai rekaman video 30 FPS...');

      // 1. Initial screenshot to get dimensions
      const initialCanvas = await html2canvas(iphoneElement, { scale: 1.5 });
      const recordCanvas = document.createElement('canvas');
      recordCanvas.width = initialCanvas.width;
      recordCanvas.height = initialCanvas.height;
      const ctx = recordCanvas.getContext('2d');

      // 2. Setup Canvas Capture Stream & MediaRecorder
      const stream = recordCanvas.captureStream(30); // 30 FPS
      
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setStatus('done');
        setProgressText('Video percakapan berhasil direkam!');
      };

      mediaRecorder.start();

      // 3. Continuous frame loop drawing iPhone element onto recordCanvas
      let isCapturing = true;

      const drawLoop = async () => {
        if (!isCapturing) return;
        try {
          const cv = await html2canvas(iphoneElement, {
            scale: 1.2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });
          if (ctx) {
            ctx.clearRect(0, 0, recordCanvas.width, recordCanvas.height);
            ctx.drawImage(cv, 0, 0);
          }
        } catch (e) {
          // ignore minor capture frame drops
        }
        if (isCapturing) {
          animationFrameRef.current = requestAnimationFrame(drawLoop);
        }
      };

      drawLoop();

      // 4. Play through the scenario steps automatically
      await onPlayScenarioForVideo();

      // 5. Stop recording after scenario finishes
      await new Promise(r => setTimeout(r, 1200));
      isCapturing = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }

    } catch (err: any) {
      console.error('Export Video error:', err);
      setStatus('error');
      setProgressText(`Error: ${err.message || 'Gagal merekam video'}`);
    }
  };

  const handleDownloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    const filename = (scenario.name || 'cekat-ai-demo').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `${filename}.webm`;
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
              <Video size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Export Simulator as Video</h3>
              <p className="text-[11px] text-slate-400">Rekam percakapan WhatsApp ke format Video</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-center">
          
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-2xl mx-auto shadow-sm">
                <Video size={28} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Rekam Video Simulator</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sistem akan otomatis merekam animasi alur percakapan WhatsApp dari awal hingga akhir dalam format Video MP4/WebM berdurasi nyata.
                </p>
              </div>

              <button
                onClick={handleStartExport}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Video size={16} /> Mulai Rekam Video Simulator
              </button>
            </div>
          )}

          {status === 'recording' && (
            <div className="py-8 space-y-4 flex flex-col items-center justify-center">
              <div className="relative">
                <Loader2 size={36} className="text-indigo-600 animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center font-bold text-[10px] text-indigo-700">REC</span>
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 text-sm">{progressText}</p>
                <p className="text-[11px] text-slate-500">Simulasi sedang berjalan & merekam layar. Mohon tunggu...</p>
              </div>
            </div>
          )}

          {status === 'done' && videoUrl && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-md max-w-[260px] mx-auto bg-slate-950">
                <video src={videoUrl} controls autoPlay loop className="w-full h-auto object-contain" />
              </div>
              
              <div className="space-y-1">
                <p className="font-extrabold text-emerald-600 text-sm flex items-center justify-center gap-1">
                  <CheckCircle2 size={16} /> Video Berhasil Direkam!
                </p>
                <p className="text-[11px] text-slate-500">Video siap diunduh dan diputar di berbagai media player.</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={handleDownloadVideo}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={15} /> Download Video (.webm)
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
