"use client";

import React, { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { QuestionNumber, QuestionText } from "./QuestionNumber";

export interface IOption {
  id: string;
  text: string;
  file?: string | null;
}

interface IMultipleChoiceProps {
  questionId: number;
  questionText: string;
  options: IOption[];
  selectedValue: string | null;
  onSelect: (optionId: string) => void;
  /** Audio khusus soal ini (audio passage diputar dari header ujian). */
  soundFile?: string;
  soundKey?: string;
}

const LS_KEY = (k: string) => `audio_playCount_${k}`;
const readPlayCount = (key: string) => {
  if (typeof window === "undefined") return 0;
  const count = window.localStorage.getItem(LS_KEY(key));
  return count ? parseInt(count, 10) : 0;
};

const formatSeconds = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

/** Audio soal: maksimal dua kali putar, seperti aturan ujian. */
function QuestionAudio({ src, storageKey }: { src: string; storageKey: string }) {
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => setPlayCount(readPlayCount(storageKey)), [storageKey]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrent(audio.currentTime);
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setPlayCount((prev) => {
        const next = Math.min(prev + 1, 2);
        window.localStorage.setItem(LS_KEY(storageKey), String(next));
        return next;
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [storageKey]);

  const exhausted = playCount >= 2 && !isPlaying;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || exhausted) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <Headphones size={16} className="shrink-0 text-slate-500" />
      <button
        type="button"
        onClick={togglePlay}
        disabled={exhausted}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:bg-slate-200 disabled:text-slate-400"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="translate-x-px" />}
      </button>
      <div className="flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-primary-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="tabular mt-1 flex justify-between text-[12px] text-slate-500">
          <span>{formatSeconds(current)}</span>
          <span>{formatSeconds(duration)}</span>
        </div>
      </div>
      <span className="tabular shrink-0 text-[12px] text-slate-500">{playCount}/2 diputar</span>
    </div>
  );
}

export function MultipleChoice({
  questionId,
  questionText,
  options,
  selectedValue,
  onSelect,
  soundFile,
  soundKey = `question_${questionId}_audio`,
}: IMultipleChoiceProps) {
  return (
    <div className="space-y-5">
      {soundFile && <QuestionAudio src={soundFile} storageKey={soundKey} />}

      <div className="flex gap-3">
        <QuestionNumber value={questionId} className="mt-0.5" />
        <QuestionText html={questionText} className="[&>p:first-child]:mt-0" />
      </div>

      <fieldset className="space-y-2 sm:pl-9">
        <legend className="sr-only">Choose one answer for question {questionId}</legend>
        {options.map((opt) => {
          const isSelected = selectedValue === opt.id;

          return (
            <label
              key={opt.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-500",
                isSelected
                  ? "border-primary-500 bg-primary-50"
                  : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50"
              )}
            >
              <input
                type="radio"
                name={`question-${questionId}`}
                value={opt.id}
                className="sr-only"
                checked={isSelected}
                onChange={() => onSelect(opt.id)}
              />
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-[4px] border text-[13px] font-semibold",
                  isSelected ? "border-primary-500 bg-primary-500 text-white" : "border-slate-300 text-slate-700"
                )}
                aria-hidden="true"
              >
                {opt.id}
              </span>
              <span className={cn("pt-0.5 text-[15px] leading-relaxed", isSelected ? "text-slate-800" : "text-slate-700")}>
                {opt.file ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={opt.file} alt={`Option ${opt.id}`} className="max-h-32 rounded-[4px] object-contain" />
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                )}
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
