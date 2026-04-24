"use client";

import React, { useEffect, useRef, useState } from "react";
import { Headphones, PlayCircle, PauseCircle } from "lucide-react";
import { cn } from "@/src/libs/utils";

// --- INTERFACES ---
export interface IOption {
  id: string;
  text: string;
  file?: string | null; // Untuk support gambar di opsi kalau ada
}

interface IMultipleChoiceProps {
  questionId: number;
  questionText: string;
  options: IOption[];
  selectedValue: string | null;
  onSelect: (optionId: string) => void;
  // Audio Props (Opsional)
  soundFile?: string;
  soundKey?: string; 
}

// --- HELPER UNTUK LOCAL STORAGE (AUDIO) ---
const LS_KEY = (k: string) => `audio_playCount_${k}`;
const readPlayCount = (key: string) => {
  if (typeof window === "undefined") return 0;
  const count = window.localStorage.getItem(LS_KEY(key));
  return count ? parseInt(count, 10) : 0;
};

export function MultipleChoice({
  questionId,
  questionText,
  options,
  selectedValue,
  onSelect,
  soundFile,
  soundKey = `question_${questionId}_audio`,
}: IMultipleChoiceProps) {
  
  // --- AUDIO LOGIC ---
  const [playCount, setPlayCount] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync play count dari local storage pas pertama render
  useEffect(() => {
    setPlayCount(readPlayCount(soundKey));
  }, [soundKey]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };

    const onLoadedMetadata = () => setDuration(audio.duration);
    
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setPlayCount((prev) => {
        const newCount = Math.min(prev + 1, 2); // Maksimal 2x play (Aturan IELTS/TOEFL)
        if (typeof window !== "undefined") {
          window.localStorage.setItem(LS_KEY(soundKey), String(newCount));
        }
        return newCount;
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [soundKey]);

  const togglePlay = () => {
    if (!audioRef.current || playCount >= 2) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- RENDER UI ---
  return (
    <div className="space-y-6">
      
      {/* 1. AUDIO PLAYER SECTION (Tampil kalau soundFile ada) */}
      {soundFile && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Headphones size={18} className="text-brand-purple" />
            <h4 className="text-sm font-bold text-slate-700">Listening Audio</h4>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <audio ref={audioRef} src={soundFile} preload="metadata" className="hidden" />
            
            <button
              onClick={togglePlay}
              disabled={playCount >= 2 && !isPlaying}
              className={cn(
                "h-10 w-10 flex shrink-0 items-center justify-center rounded-full transition-all",
                playCount >= 2 && !isPlaying 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : "bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-white"
              )}
            >
              {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
            </button>

            <div className="flex-1">
              {/* Custom Progress Bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                <div 
                  className="h-full bg-brand-cyan transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{audioRef.current ? formatSeconds(audioRef.current.currentTime) : "0:00"}</span>
                <span>{formatSeconds(duration)}</span>
              </div>
            </div>

            <div className="shrink-0 text-center px-3 py-1 bg-slate-50 rounded-lg">
              <span className="text-xs font-bold text-slate-600">{playCount}/2 Play</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. QUESTION TEXT */}
      <div className="font-semibold text-slate-800 text-base leading-relaxed flex gap-3">
        <span className="font-black text-brand-purple shrink-0">{questionId}.</span> 
        {/* Nanti bisa pakai dangerouslySetInnerHTML kalau questionText dari CKEditor */}
        <span dangerouslySetInnerHTML={{ __html: questionText }} />
      </div>

      {/* 3. OPTIONS LIST */}
      <div className="space-y-3 pl-2 sm:pl-7">
        {options.map((opt) => {
          const isSelected = selectedValue === opt.id;
          
          return (
            <label 
              key={opt.id}
              className={cn(
                "group flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                isSelected 
                  ? "border-brand-purple bg-brand-purple/5 shadow-sm" 
                  : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {/* Custom Radio Icon */}
              <div className={cn(
                "mt-0.5 flex shrink-0 items-center justify-center h-5 w-5 rounded-full border-2 transition-colors",
                isSelected ? "border-brand-purple" : "border-slate-300 group-hover:border-slate-400"
              )}>
                <div className={cn(
                  "h-2.5 w-2.5 rounded-full bg-brand-purple transition-transform duration-200",
                  isSelected ? "scale-100" : "scale-0"
                )} />
              </div>
              
              {/* Hidden Native Input */}
              <input 
                type="radio" 
                name={`question-${questionId}`} 
                value={opt.id}
                className="hidden"
                checked={isSelected}
                onChange={() => onSelect(opt.id)}
              />
              
              {/* Option Content */}
              <div className="flex gap-3 text-sm sm:text-base w-full">
                <span className="font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                  {opt.id}.
                </span>
                <div className={cn("w-full", isSelected ? "text-slate-900 font-medium" : "text-slate-600")}>
                  {opt.file ? (
                    // Kalau opsi berupa gambar
                    <img src={opt.file} alt={`Option ${opt.id}`} className="max-h-32 rounded-md object-contain" />
                  ) : (
                    // Kalau opsi berupa teks (support HTML parsing)
                    <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

    </div>
  );
}