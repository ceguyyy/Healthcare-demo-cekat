import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Video, Download, CheckCircle2, Loader2, Sparkles, AlertCircle, Play, Monitor } from 'lucide-react';
import { Scenario } from '../types/scenario';

interface VideoExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  iphoneElement: HTMLElement | null;
  scenario: Scenario;
  onPlayScenarioForVideo: (onStepCallback: () => Promise<void>) => Promise<void>;
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

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setProgressText('');
      setVideoUrl(null);
    }
  }, [isOpen]);

  const captureCanvasFrame = async (targetEl: HTMLElement): Promise<HTMLCanvasElement> => {
    // Force scroll container to bottom before capture
    const scrollContainer = targetEl.querySelector('.custom-scrollbar');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }

    return await html2canvas(targetEl, {
      scale: 2, // High DPI HD rendering
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // Transparent to preserve phone case background
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
      setProgressText('Menyiapkan perekam video HD 60 FPS...');

      // Get exact element dimensions
      const rect = iphoneElement.getBoundingClientRect();
      const canvasWidth = rect.width * 2;
      const canvasHeight = rect.height * 2;

      // 1. Create High-Res Offscreen Rendering Canvas
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = canvasWidth;
      outputCanvas.height = canvasHeight;
      const ctx = outputCanvas.getContext('2d');

      if (!ctx) throw new Error('Canvas 2D Context tidak tersedia.');

      // 2. Setup 60 FPS MediaRecorder Stream
      const stream = outputCanvas.captureStream(60);
      
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000 // 5 Mbps HD Quality
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
        setProgressText('Video HD 60 FPS Fullscreen berhasil direkam!');
      };

      mediaRecorder.start();

      // Smooth Frame Interpolation Loop (Draws current snapshot smoothly onto outputCanvas)
      let currentSnapshot: HTMLCanvasElement | null = null;
      let isRecording = true;

      const renderLoop = () => {
        if (ctx && currentSnapshot) {
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          ctx.drawImage(currentSnapshot, 0, 0, canvasWidth, canvasHeight);
        }
        if (isRecording) {
          requestAnimationFrame(renderLoop);
        }
      };

      requestAnimationFrame(renderLoop);

      // 3. Play Scenario & Capture Frames on Each Chat Step
      let stepCount = 0;

      await onPlayScenarioForVideo(async () => {
        stepCount++;
        setProgressText(`Merekam Alur Chat Step ${stepCount}...`);
        
        // Short delay for CSS animations to complete
        await new Promise(r => setTimeout(r, 400));
        currentSnapshot = await captureCanvasFrame(iphoneElement);
        
        // Hold frame for 1.8 seconds so viewer can read chat comfortably
        await new Promise(r => setTimeout(r, 1800));
      });

      // Capture final resting state
      currentSnapshot = await captureCanvasFrame(iphoneElement);
      await new Promise(r => setTimeout(r, 1500));

      // Stop Recording
      isRecording = false;
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
    <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-xs text-slate-800 max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Video size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Export Simulator HD Video</h3>
              <p className="text-[11px] text-slate-400">Rekam percakapan WhatsApp Fullscreen 60 FPS HD</p>
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
                <h4 className="font-extrabold text-slate-900 text-base">Rekam Video Simulator HD Fullscreen</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm mx-auto">
                  Sistem akan secara otomatis merekam animasi alur percakapan WhatsApp dari frame awal hingga akhir dengan kualitas HD 60 FPS tanpa terpotong.
                </p>
              </div>

              <button
                onClick={handleStartExport}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Video size={17} /> Mulai Rekam Video HD 60 FPS
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
                <p className="text-[11px] text-slate-500">Simulasi sedang merekam alur chat WhatsApp. Mohon tunggu...</p>
              </div>
            </div>
          )}

          {status === 'done' && videoUrl && (
            <div className="space-y-4">
              {/* Full Uncropped Video Player Preview */}
              <div className="border border-slate-300 rounded-3xl overflow-hidden shadow-lg bg-slate-950 max-w-[340px] mx-auto p-1">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-auto max-h-[480px] object-contain rounded-2xl"
                />
              </div>
              
              <div className="space-y-1">
                <p className="font-extrabold text-emerald-600 text-sm flex items-center justify-center gap-1">
                  <CheckCircle2 size={16} /> Video HD 60 FPS Ready!
                </p>
                <p className="text-[11px] text-slate-500">Tampilan Fullscreen utuh & animasi pergerakan chat sangat smooth.</p>
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
