"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Maximize,
  Minimize,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  CloudOff,
  Cloud,
  Headphones,
} from "lucide-react";
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
import { SkillTag } from "@/src/_global/components/Board/Board";
import { VibeMark } from "@/src/_global/components/Shell/Wordmark";

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
        Invalid test session. Start the test from its detail page.
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
        <p className="font-medium text-slate-600">Test session not found.</p>
        <Button variant="outline" onClick={() => router.push(MOCK_ROUTES.list)}>
          Back to all tests
        </Button>
      </div>
    );
  }

  if (isLoading || !session || session.status === "SUBMITTED") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={20} /> Preparing your question paper…
      </div>
    );
  }

  const answeredCount = questions.filter((question) => isAnswered(answers[question.id])).length;
  const numberRange = current
    ? current.marks > 1
      ? `${current.number}–${current.number + current.marks - 1}`
      : `${current.number}`
    : "-";

  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-full flex-col overflow-hidden bg-white">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <VibeMark size={20} />
          <h1 className="truncate text-[15px] font-medium text-slate-800">{session.package.title}</h1>
        </div>

        <ExamTimer initialSeconds={initialSeconds} onTimeUp={submit} />

        <div className="flex flex-1 items-center justify-end gap-2">
          <span className="hidden items-center gap-1.5 text-[13px] text-slate-500 md:flex" aria-live="polite">
            {saveState === "saving" && (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            )}
            {saveState === "saved" && (
              <>
                <Cloud size={14} /> Saved
              </>
            )}
            {saveState === "error" && (
              <span className="flex items-center gap-1.5 text-[#b12a41]">
                <CloudOff size={14} /> Not saved, retrying
              </span>
            )}
          </span>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit full screen" : "Full screen"}>
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            <span className="hidden lg:inline">{isFullscreen ? "Exit full screen" : "Full screen"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={goToReview}>
            Finish test
          </Button>
        </div>
      </header>

      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3 text-[14px]">
          {current && <SkillTag skill={current.skill}>{SKILL_LABELS[current.skill]}</SkillTag>}
          <span className="tabular font-medium text-slate-800">Question {numberRange}</span>
          <span className="tabular hidden text-slate-500 sm:inline">
            {activeIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {current && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFlag(current.id)}
              aria-pressed={!!flagged[current.id]}
              className={cn(flagged[current.id] && "bg-[#fff3e0] text-[#8a5200] hover:bg-[#ffe8c7]")}
            >
              <Flag size={14} className={cn(flagged[current.id] && "fill-current")} />
              {flagged[current.id] ? "Flagged" : "Flag"}
            </Button>
          )}
          <DialogShowAllNumber
            totalQuestions={questions.length}
            activeQuestionIndex={activeIndex}
            getQuestionStatus={getQuestionStatus}
            onQuestionSelect={(index) => setActiveIndex(index)}
          />
        </div>
      </div>

      {/* Audio milik passage: key = URL, jadi pemutaran tidak berhenti saat
          berpindah nomor di dalam passage yang sama. */}
      {current?.audio_url && (
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-2 lg:px-6">
          <Headphones size={16} className="shrink-0 text-slate-500" />
          <audio
            key={current.audio_url}
            src={current.audio_url}
            controls
            preload="auto"
            controlsList="nodownload noplaybackrate"
            className="h-9 w-full"
          >
            Your browser doesn't support the audio player.
          </audio>
        </div>
      )}

      <div className="relative flex-1 overflow-hidden">
        {current && (
          <RenderQuestions key={current.id} questionData={current} questionNumber={current.number} />
        )}
      </div>

      <footer className="flex h-16 shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 lg:px-6">
        <Button variant="outline" disabled={activeIndex === 0} onClick={() => setActiveIndex((prev) => prev - 1)}>
          <ChevronLeft size={16} /> Previous
        </Button>

        <span className="hidden text-[13px] text-slate-500 sm:inline">
          <span className="tabular font-medium text-slate-800">{answeredCount}</span> of{" "}
          <span className="tabular">{questions.length}</span> answered
        </span>

        <Button
          disabled={isSubmitting}
          onClick={isLastQuestion ? goToReview : () => setActiveIndex((prev) => prev + 1)}
        >
          {isLastQuestion ? (
            <>
              Finish &amp; review <CheckCircle2 size={16} />
            </>
          ) : (
            <>
              Next <ChevronRight size={16} />
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}
