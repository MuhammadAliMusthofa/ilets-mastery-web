"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SubmitTestDialog } from "../components/Dialog/DialogSubmitTest";
import { ReviewUserInfoCard } from "../components/Card/ReviewUserInfoCard";
import { ReviewTimerBox } from "../components/Card/ReviewTimerBox";
import { ReviewWarningBox } from "../components/Card/ReviewWarningBox";
import { ReviewQuestionGrid } from "../components/Card/ReviewQuestionsGrid";
import { useAttemptSession, useInvalidateExam } from "../hooks/useExam";
import { examService } from "../services/exam.service";
import { MOCK_ROUTES } from "../constants/routes";
import { useExamStore, isAnswered } from "@/src/store/examStore";
import { useAuthStore } from "@/src/store/authStore";

const formatClock = (totalSeconds: number) => {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
};

export default function MockSubmitReviewContainer() {
  const router = useRouter();
  const params = useParams<{ testId: string }>();
  const searchParams = useSearchParams();
  const attemptId = Number(searchParams.get("attempt"));

  const { data: session, isLoading } = useAttemptSession(attemptId);
  const invalidateExam = useInvalidateExam();
  const user = useAuthStore((state) => state.user);

  const hydrate = useExamStore((state) => state.hydrate);
  const answers = useExamStore((state) => state.answers);
  const flagged = useExamStore((state) => state.flagged);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (session?.status === "SUBMITTED") {
      router.replace(MOCK_ROUTES.result(params.testId, session.attempt_id));
      return;
    }
    if (session) {
      hydrate(session);
    }
  }, [session, hydrate, router, params.testId]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Selisih jam server vs perangkat dihitung sekali saat sesi dimuat.
  const clockOffset = useMemo(
    () => (session ? new Date(session.server_time).getTime() - Date.now() : 0),
    [session]
  );

  const secondsLeft = session
    ? Math.floor((new Date(session.expires_at).getTime() - (now + clockOffset)) / 1000)
    : 0;

  const questions = useMemo(() => session?.questions ?? [], [session]);

  const questionStatuses = useMemo(
    () =>
      questions.map((question) => {
        if (flagged[question.id]) return "flagged" as const;
        return isAnswered(answers[question.id]) ? ("answered" as const) : ("unanswered" as const);
      }),
    [questions, answers, flagged]
  );

  const stats = useMemo(
    () => ({
      answered: questionStatuses.filter((status) => status === "answered").length,
      unanswered: questionStatuses.filter((status) => status === "unanswered").length,
      flagged: questionStatuses.filter((status) => status === "flagged").length,
    }),
    [questionStatuses]
  );

  const handleSubmit = async () => {
    if (!session) {
      return;
    }
    await examService.submit(session.attempt_id, useExamStore.getState().allAnswers());
    useExamStore.getState().reset();
    invalidateExam();
    router.replace(MOCK_ROUTES.result(params.testId, session.attempt_id));
  };

  // Grid memakai nomor urut tampilan (1..N), sama dengan indeks di halaman ujian.
  const handleQuestionClick = (displayNumber: number) => {
    router.push(`${MOCK_ROUTES.exam(params.testId, attemptId)}&q=${displayNumber}`);
  };

  if (isLoading || !session) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={20} /> Memuat ringkasan jawaban…
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] h-screen w-full bg-[#f8fafc] overflow-y-auto py-12 px-4 sm:px-6 lg:px-8 font-sans [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-cyan/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Siap untuk mengumpulkan?
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Cek kembali jawabanmu sebelum waktu habis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <ReviewUserInfoCard
              user={{
                name: user?.full_name ?? "Peserta",
                email: user?.email ?? "",
                testName: session.package.title,
              }}
            />

            <ReviewTimerBox timeLeftStr={formatClock(secondsLeft)} />

            <div className="space-y-3">
              <SubmitTestDialog onSubmit={handleSubmit} />
              <Button
                variant="outline"
                onClick={() => router.push(MOCK_ROUTES.exam(params.testId, attemptId))}
                className="w-full h-14 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="mr-2" size={18} />
                Kembali ke Lembar Soal
              </Button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <ReviewWarningBox unansweredCount={stats.unanswered} />

            <ReviewQuestionGrid
              statuses={questionStatuses}
              stats={stats}
              totalQuestions={questions.length}
              onQuestionClick={handleQuestionClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
