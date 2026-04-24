"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, X, Type, Gauge } from "lucide-react";
import { TeleprompterScript } from "../../constants/teleprompter";

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: TeleprompterScript | null;
}

export default function TeleprompterModal({ isOpen, onClose, script }: TeleprompterModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(25);
  const [fontSize, setFontSize] = useState(36);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [isOpen, script]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && scrollRef.current) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += 1;
        }
      }, 100 - speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  if (!isOpen || !script) return null;

  return (
    // Overlay Modal
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md sm:p-8 animate-in fade-in duration-300">
      
      {/* Container - Fullscreen di HP, Modal di PC */}
      <div className="relative w-full h-full sm:max-w-5xl sm:h-auto sm:max-h-[90vh] bg-slate-900 sm:rounded-[32px] overflow-hidden shadow-2xl sm:border border-white/10 flex flex-col">
        
        {/* --- TOMBOL CLOSE (Pojok Kanan Atas) --- */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-3 bg-slate-800/80 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md border border-white/10 shadow-lg"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* --- AREA TEKS BERJALAN --- */}
        {/* Padding bottom dibesarin biar teks gak ketutup panel bawah pas di akhir */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto px-6 sm:px-[15%] py-[40vh] pb-[60vh] sm:pb-[40vh] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative scroll-smooth"
          style={{ fontSize: `${fontSize}px` }}
        >
          <div className="text-white font-bold leading-relaxed text-center opacity-70 transition-opacity duration-500 hover:opacity-100">
            {script.content}
          </div>
        </div>

        {/* --- GUIDE LINE (Fokus Mata) --- */}
        <div className="absolute top-1/3 sm:top-1/2 left-0 w-full h-[2px] bg-brand-cyan/20 pointer-events-none flex justify-between items-center px-2 sm:px-4">
          <div className="w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-brand-cyan rotate-45" />
          <div className="w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2 border-brand-cyan -rotate-45" />
        </div>

        {/* --- CONTROL BAR (Bottom Dock Thumb-Friendly) --- */}
        <div className="absolute bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-max sm:right-auto z-50">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-4 py-4 sm:px-6 sm:py-3 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-[24px] sm:rounded-full shadow-2xl shadow-black/50">
            
            {/* Top Row (Mobile) / Left Side (PC): Play & Restart */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-cyan hover:bg-brand-cyan/80 text-slate-900 rounded-full h-12 px-8 sm:w-14 sm:px-0 font-bold transition-transform active:scale-95"
              >
                {isPlaying ? (
                  <><Pause fill="currentColor" size={20} /> <span className="sm:hidden">Pause</span></>
                ) : (
                  <><Play fill="currentColor" size={20} className="ml-1" /> <span className="sm:hidden">Start</span></>
                )}
              </button>

              <button 
                onClick={() => {if(scrollRef.current) scrollRef.current.scrollTop = 0}} 
                className="p-3 sm:p-2 text-white/60 hover:text-white bg-white/5 sm:bg-transparent rounded-full sm:rounded-none transition-colors"
                title="Restart Text"
              >
                <RotateCcw size={22} />
              </button>
            </div>

            {/* Garis Pemisah (Cuma muncul di PC) */}
            <div className="hidden sm:block w-px h-8 bg-white/10"></div>

            {/* Bottom Row (Mobile) / Right Side (PC): Sliders */}
            <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-4 sm:gap-6">
              
              {/* Speed Slider */}
              <div className="flex items-center w-full sm:w-auto gap-3 text-white/80 bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                <Gauge size={18} className="shrink-0 text-brand-cyan" />
                <input 
                  type="range" min="10" max="90" step="5" 
                  value={speed} onChange={(e) => setSpeed(Number(e.target.value))} 
                  className="w-full sm:w-28 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
                />
              </div>

              {/* Font Size Slider */}
              <div className="flex items-center w-full sm:w-auto gap-3 text-white/80 bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                <Type size={18} className="shrink-0 text-brand-cyan" />
                <input 
                  type="range" min="20" max="80" step="4" 
                  value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} 
                  className="w-full sm:w-28 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
                />
              </div>

            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}