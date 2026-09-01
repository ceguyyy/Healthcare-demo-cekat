import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Video, Download, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Scenario } from '../types/scenario';

interface VideoExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  iphoneElement: HTMLElement | null;
  scenario: Scenario;
  onPlayScenarioForVideo: (onStepCaptured: (stepName: string) => Promise<void>) => Promise<void>;
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

  const captureIphoneCanvas = async (targetEl: HTMLElement): Promise<HTMLCanvasElement> => {
    // Scroll chat area to bottom before snapshot
    const scrollArea = targetEl.querySelector('.custom-scrollbar');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }

    return await html2canvas(targetEl, {
      scale: 2, // 2x HD Resolution (730x1380)
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#1c1c1e', // Dark iPhone case outer frame
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
      setProgressText('Menyiapkan perekaman video HD...');

      // 1. Capture initial frame to set exact 1:1 aspect ratio
      const firstSnap = await captureIphoneCanvas(iphoneElement);
      
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = firstSnap.width;
      outputCanvas.height = firstSnap.height;
      const ctx = outputCanvas.getContext('2d');

      if (!ctx) throw new Error('Context 2D error');

      ctx.drawImage(firstSnap, 0, 0);

      // 2. Setup 30 FPS Stream & MediaRecorder
      const stream = outputCanvas.captureStream(30);
      
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000 // 8 Mbps Crisp Quality
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
        setProgressText('Video HD 1080p berhasil direkam!');
      };

      mediaRecorder.start();

      // 3. Constant 30 FPS Draw Loop to maintain smooth video recording
      let activeSnap: HTMLCanvasElement = firstSnap;
      let isRecording = true;

      const renderLoop = () => {
        if (ctx && activeSnap) {
          ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
          ctx.drawImage(activeSnap, 0, 0);
        }
        if (isRecording) {
          requestAnimationFrame(renderLoop);
        }
      };

      requestAnimationFrame(renderLoop);

      // 4. Step-by-Step Scenario Playback with Controlled Frame Capture
      let stepCounter = 0;

      await onPlayScenarioForVideo(async (stepName: string) => {
        stepCounter++;
        setProgressText(`Merekam Step ${stepCounter}: ${stepName}...`);
        
        // Wait 350ms for React DOM & CSS fadeUp animations to finish
        await new Promise(r => setTimeout(r, 350));

        // Capture crisp new snapshot
        activeSnap = await captureIphoneCanvas(iphoneElement);

        // Hold frame for 2.2 seconds so user can comfortably read the chat
        await new Promise(r => setTimeout(r, 2200));
      });

      // Capture final screen state & hold for 2 seconds
      activeSnap = await captureIphoneCanvas(iphoneElement);
      await new Promise(r => setTimeout(r, 2000));

      // Stop MediaRecorder
      isRecording = false;
      await new Promise(r => setTimeout(r, 200));

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
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-xs text-slate-800 max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Video size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Export Video HD Simulator</h3>
              <p className="text-[11px] text-slate-400">Rekam video WhatsApp presisi 1:1 tanpa terpotong</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 text-center overflow-y-auto custom-scrollbar">
          
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-2xl mx-auto shadow-sm">
                <Video size={30} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Rekam Video Simulator HD</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm mx-auto">
                  Sistem akan merekam percakapan WhatsApp frame-by-frame dengan rasio aspek iPhone 1:1 sempurna, jernih, dan tanpa gepeng/terpotong.
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
                <p className="text-[11px] text-slate-500">Merekam alur percakapan WhatsApp. Mohon tunggu...</p>
              </div>
            </div>
          )}

          {status === 'done' && videoUrl && (
            <div className="space-y-4">
              {/* Full Uncropped 1:1 Aspect Ratio Video Player */}
              <div className="border border-slate-300 rounded-3xl overflow-hidden shadow-lg bg-slate-950 max-w-[280px] mx-auto p-1">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-auto rounded-2xl block object-contain"
                />
              </div>
              
              <div className="space-y-1">
                <p className="font-extrabold text-emerald-600 text-sm flex items-center justify-center gap-1">
                  <CheckCircle2 size={16} /> Video HD Sempurna Ready!
                </p>
                <p className="text-[11px] text-slate-500">Bentuk rasio iPhone utuh, header Cekat AI jernih, dan tidak gepeng.</p>
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
