import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Video, Download, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const isRecordingRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setProgressText('');
      setVideoUrl(null);
    } else {
      isRecordingRef.current = false;
    }
  }, [isOpen]);

  const captureFullCanvas = async (targetEl: HTMLElement): Promise<HTMLCanvasElement> => {
    // Ensure scroll is at current bottom
    const scrollContainer = targetEl.querySelector('.custom-scrollbar');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }

    const rect = targetEl.getBoundingClientRect();

    return await html2canvas(targetEl, {
      scale: 2, // High resolution HD
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: rect.width,
      height: rect.height,
      scrollX: 0,
      scrollY: -window.scrollY, // Correct offset so header isn't cropped by page scroll
      logging: false
    });
  };

  const handleStartExport = async () => {
    if (!iphoneElement) {
      alert('Elemen iPhone Canvas tidak ditemukan!');
      return;
    }

    try {
      setStatus('recording');
      setProgressText('Menyiapkan rekaman video smooth 30 FPS...');

      // 1. Initial snapshot to set exact canvas dimensions
      const initialSnap = await captureFullCanvas(iphoneElement);
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = initialSnap.width;
      outputCanvas.height = initialSnap.height;
      const ctx = outputCanvas.getContext('2d');

      if (!ctx) throw new Error('Canvas Context 2D error');

      // Draw initial frame
      ctx.drawImage(initialSnap, 0, 0);

      // 2. Setup MediaRecorder at 30 FPS with VP9/WebM
      const stream = outputCanvas.captureStream(30);
      
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 6000000 // 6 Mbps Ultra HD
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setStatus('done');
        setProgressText('Video animasi smooth berhasil direkam!');
      };

      mediaRecorder.start();
      isRecordingRef.current = true;

      // 3. Continuous 25-30 FPS rendering loop during scenario playback
      const continuousCaptureLoop = async () => {
        while (isRecordingRef.current) {
          try {
            const snap = await captureFullCanvas(iphoneElement);
            if (ctx && isRecordingRef.current) {
              ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
              ctx.drawImage(snap, 0, 0);
            }
          } catch (e) {
            // ignore frame capture delay
          }
          await new Promise(r => setTimeout(r, 40)); // ~25 FPS continuous sampling
        }
      };

      // Start continuous screen capture loop in background
      continuousCaptureLoop();

      // 4. Run real-time scenario playback with typing animations
      setProgressText('Perekaman berlangsung: Alur percakapan simulasi live...');
      await onPlayScenarioForVideo();

      // Hold final screen state for 1.5 seconds
      await new Promise(r => setTimeout(r, 1500));

      // 5. Stop recorder
      isRecordingRef.current = false;
      await new Promise(r => setTimeout(r, 200));

      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }

    } catch (err: any) {
      console.error('Export Video error:', err);
      isRecordingRef.current = false;
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
    <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-xs text-slate-800 max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Video size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Export Smooth Simulator Video</h3>
              <p className="text-[11px] text-slate-400">Rekam animasi live WhatsApp tanpa terpotong</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-center overflow-y-auto custom-scrollbar">
          
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-2xl mx-auto shadow-sm">
                <Video size={30} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Rekam Video Live Animasi</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm mx-auto">
                  Sistem akan merekam percakapan WhatsApp secara live 30 FPS lengkap dengan efek ketik, scroll, dan tanpa terpotong pada bagian header Cekat AI.
                </p>
              </div>

              <button
                onClick={handleStartExport}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Video size={17} /> Mulai Rekam Video HD
              </button>
            </div>
          )}

          {status === 'recording' && (
            <div className="py-8 space-y-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center text-blue-600 animate-pulse">
                <Loader2 size={32} className="animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 text-sm">{progressText}</p>
                <p className="text-[11px] text-slate-500">Video sedang merekam pergerakan chat live secara real-time...</p>
              </div>
            </div>
          )}

          {status === 'done' && videoUrl && (
            <div className="space-y-4">
              {/* Full Uncropped Video Player Preview */}
              <div className="border border-slate-300 rounded-3xl overflow-hidden shadow-lg bg-slate-900 p-2 max-w-[320px] mx-auto">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-auto rounded-2xl block"
                  style={{ maxHeight: '460px', objectFit: 'contain' }}
                />
              </div>
              
              <div className="space-y-1">
                <p className="font-extrabold text-emerald-600 text-sm flex items-center justify-center gap-1">
                  <CheckCircle2 size={16} /> Video Live Chat Berhasil Direkam!
                </p>
                <p className="text-[11px] text-slate-500">Tampilan Fullscreen utuh, header Cekat AI tidak terpotong, dan animasi smooth.</p>
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
                className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
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
