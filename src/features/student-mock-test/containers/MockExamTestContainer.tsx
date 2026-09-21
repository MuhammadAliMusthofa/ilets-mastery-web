"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Maximize, Minimize, CheckCircle2, Flag, Loader2, CloudOff, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";
import { RenderQuestions } from "./Render/RenderQuestions";
import { DialogShowAllNumber } from "../components/Dialog/DialogShowAllNumber";
import { ExamTimer } from "../components/Timer/ExamTimer";
import { useAttemptSession, useInvalidateExam } from "../hooks/useExam";
import { examService } from "../services/exam.service";
import { MOCK_ROUTES } from "../constants/routes";
import { useExamStore, isAnswered } from "@/src/store/examStore";
import { SKILL_LABELS } from "@/src/models/ielts";

const AUTOSAVE_INTERVAL_MS = 5000;

type SaveState = "idle" | "saving" | "saved" | "error";

const errorCode = (error: unknown): string | undefined =>
  (error as { response?: { data?: { code?: string } } })?.response?.data?.code;

const exitFullscreen = () => {
  if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => undefined);
  }
};

export default function MockExamTestContainer() {
  const router = useRouter();
  const params = useParams<{ testId: string }>();
  const searchParams = useSearchParams();
  const attemptId = Number(searchParams.get("attempt"));
  const jumpTo = Number(searchParams.get("q"));

  const { data: session, isLoading, isError } = useAttemptSession(attemptId);
  const invalidateExam = useInvalidateExam();

  const hydrate = useExamStore((state) => state.hydrate);
  const answers = useExamStore((state) => state.answers);
  const flagged = useExamStore((state) => state.flagged);
  const toggleFlag = useExamStore((state) => state.toggleFlag);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const questions = session?.questions ?? [];
  const current = questions[activeIndex];
  const isLastQuestion = activeIndex === questions.length - 1;

  // --- Muat sesi ke store -------------------------------------------------
  useEffect(() => {
    if (!session) {
      return;
    }
    if (session.status === "SUBMITTED") {
      router.replace(MOCK_ROUTES.result(params.testId, session.attempt_id));
      return;
    }
    hydrate(session);
  }, [session, hydrate, router, params.testId]);

  // Kembali dari halaman review ke nomor tertentu.
  useEffect(() => {
    if (Number.isFinite(jumpTo) && jumpTo > 0 && questions.length > 0) {
      setActiveIndex(Math.min(jumpTo - 1, questions.length - 1));
    }
  }, [jumpTo, questions.length]);

  // Sisa waktu dihitung dari jam server, bukan jam perangkat: siswa tidak
  // bisa menambah waktu dengan memundurkan jam komputernya.
  const initialSeconds = useMemo(() => {
    if (!session) {
      return 0;
    }
    const remaining =
      new Date(session.expires_at).getTime() - new Date(session.server_time).getTime();
    return Math.max(0, Math.floor(remaining / 1000));
  }, [session]);

  // --- Submit ---------------------------------------------------------------
  const submit = useCallback(async () => {
    if (submittingRef.current || !session) {
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    exitFullscreen();

    try {
      await examService.submit(session.attempt_id, useExamStore.getState().allAnswers());
      useExamStore.getState().reset();
      invalidateExam();
      router.replace(MOCK_ROUTES.result(params.testId, session.attempt_id));
    } catch {
      submittingRef.current = false;
      setIsSubmitting(false);
      setSaveState("error");
    }
  }, [session, invalidateExam, router, params.testId]);

  // --- Autosave -------------------------------------------------------------
  const flush = useCallback(async () => {
    if (!session || submittingRef.current) {
      return;
    }
    const dirty = useExamStore.getState().takeDirty();
    if (dirty.length === 0) {
      return;
    }

    setSaveState("saving");
    try {
      await examService.saveAnswers(session.attempt_id, dirty);
      setSaveState("saved");
    } catch (error) {
      useExamStore.getState().restoreDirty(dirty);
      const code = errorCode(error);

      // Waktu habis di server atau sudah dikumpulkan dari perangkat lain.
      if (code === "ATTEMPT_EXPIRED" || code === "ATTEMPT_CLOSED") {
        await submit();
        return;
      }
      setSaveState("error");
    }
  }, [session, submit]);

  useEffect(() => {
    if (!session || session.status !== "IN_PROGRESS") {
      return;
    }
    const timer = window.setInterval(flush, AUTOSAVE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [session, flush]);

  // --- Fullscreen -----------------------------------------------------------
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
    } else {
      exitFullscreen();
    }
  };

  const goToReview = async () => {
    await flush();
    exitFullscreen();
    router.push(MOCK_ROUTES.review(params.testId, attemptId));
  };

  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    if (!question) {
      return "unanswered" as const;
    }
    if (flagged[question.id]) {
      return "flagged" as const;
    }
    return isAnswered(answers[question.id]) ? ("answered" as const) : ("unanswered" as const);
  };

  // --- Render ---------------------------------------------------------------
  if (!Number.isFinite(attemptId)) {
    return (
      <div className="flex h-screen items-center justify-center p-8 text-center text-slate-600">
        Sesi ujian tidak valid. Mulai ujian dari halaman detail tes.
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
        <p className="font-medium text-slate-600">Sesi ujian tidak ditemukan.</p>
        <Button variant="outline" onClick={() => router.push(MOCK_ROUTES.list)}>
          Kembali ke daftar tes
        </Button>
      </div>
    );
  }

  if (isLoading || !session || session.status === "SUBMITTED") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={20} /> Menyiapkan lembar soal…
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <header className="h-16 bg-slate-900 flex items-center justify-between gap-4 px-6 shrink-0 shadow-md">
        <h1 className="truncate font-bold text-slate-200">{session.package.title}</h1>

        <ExamTimer initialSeconds={initialSeconds} onTimeUp={submit} />

        <div className="flex items-center gap-3">
          <span
            className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:flex"
            aria-live="polite"
          >
            {saveState === "saving" && (
              <>
                <Loader2 size={14} className="animate-spin" /> Menyimpan…
              </>
            )}
            {saveState === "saved" && (
              <>
                <Cloud size={14} /> Tersimpan
              </>
            )}
            {saveState === "error" && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <CloudOff size={14} /> Belum tersimpan, mencoba lagi
              </span>
            )}
          </span>
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className="bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            {isFullscreen ? <Minimize size={16} className="mr-2" /> : <Maximize size={16} className="mr-2" />}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
          <Button onClick={goToReview} variant="destructive" size="sm">
            Akhiri Tes
          </Button>
        </div>
      </header>

      <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3 font-bold text-slate-600">
          {current && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-black uppercase tracking-wider text-slate-500">
              {SKILL_LABELS[current.skill]}
            </span>
          )}
          <span>
            Soal {current?.number ?? "-"}
            <span className="ml-2 font-medium text-slate-400">
              ({activeIndex + 1} dari {questions.length})
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {current && (
            <button
              type="button"
              onClick={() => toggleFlag(current.id)}
              aria-pressed={!!flagged[current.id]}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors",
                flagged[current.id]
                  ? "bg-amber-100 text-amber-700"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <Flag size={14} /> {flagged[current.id] ? "Ditandai" : "Tandai"}
            </button>
          )}
          <DialogShowAllNumber
            totalQuestions={questions.length}
            activeQuestionIndex={activeIndex}
            getQuestionStatus={getQuestionStatus}
            onQuestionSelect={(index) => setActiveIndex(index)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {current && (
          <RenderQuestions
            key={current.id}
            questionData={current}
            questionNumber={current.number}
          />
        )}
      </div>

      <footer className="h-16 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0">
        <Button
          variant="outline"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((prev) => prev - 1)}
        >
          Soal Sebelumnya
        </Button>

        <Button
          disabled={isSubmitting}
          className={
            isLastQuestion
              ? "bg-gradient-to-r from-brand-cyan to-brand-purple text-white shadow-md hover:scale-[1.02] transition-all font-bold"
              : "bg-slate-900 text-white hover:bg-brand-purple font-bold"
          }
          onClick={isLastQuestion ? goToReview : () => setActiveIndex((prev) => prev + 1)}
        >
          {isLastQuestion ? (
            <>
              Selesai & Review <CheckCircle2 className="ml-2" size={18} />
            </>
          ) : (
            "Soal Selanjutnya"
          )}
        </Button>
      </footer>
    </div>
  );
}
