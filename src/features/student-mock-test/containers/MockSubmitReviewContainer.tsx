"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import { Battery } from "@/src/_global/components/Board/Board";
import { Canvas, CharacterTile } from "@/src/_global/components/Showcase/Showcase";
import { SKILL_TINT } from "@/src/_global/design/tokens";
import { SubmitTestDialog } from "../components/Dialog/DialogSubmitTest";
import { ButtonNumber } from "../components/Button/ButtonNumber";
import { useAttemptSession, useInvalidateExam } from "../hooks/useExam";
import { examService } from "../services/exam.service";
import { MOCK_ROUTES } from "../constants/routes";
import { useExamStore, isAnswered } from "@/src/store/examStore";
import { useAuthStore } from "@/src/store/authStore";
import { SKILL_LABELS } from "@/src/models/ielts";

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

  const statuses = useMemo(
    () =>
      questions.map((question) => {
        if (flagged[question.id]) return "flagged" as const;
        return isAnswered(answers[question.id]) ? ("answered" as const) : ("unanswered" as const);
      }),
    [questions, answers, flagged]
  );

  const stats = {
    answered: statuses.filter((status) => status === "answered").length,
    flagged: statuses.filter((status) => status === "flagged").length,
    unanswered: statuses.filter((status) => status === "unanswered").length,
  };

  const handleSubmit = async () => {
    if (!session) return;
    await examService.submit(session.attempt_id, useExamStore.getState().allAnswers());
    useExamStore.getState().reset();
    invalidateExam();
    router.replace(MOCK_ROUTES.result(params.testId, session.attempt_id));
  };

  // Nomor tampilan (1..N) sama dengan indeks di halaman ujian.
  const jumpTo = (displayNumber: number) =>
    router.push(`${MOCK_ROUTES.exam(params.testId, attemptId)}&q=${displayNumber}`);

  if (isLoading || !session) {
    return (
      <PageBody>
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Loading your answer summary…
        </p>
      </PageBody>
    );
  }

  const critical = secondsLeft <= 300;

  // Kelompokkan nomor per skill agar full test tetap terbaca.
  const groups = session.sections.map((section) => ({
    skill: section.skill,
    indexes: questions
      .map((question, index) => ({ question, index }))
      .filter(({ question }) => question.skill === section.skill),
  }));

  return (
    <>
      <PageHeader
        title="Review before you submit"
        description={session.package.title}
        actions={
          <>
            <Button variant="outline" shape="pill" onClick={() => router.push(MOCK_ROUTES.exam(params.testId, attemptId))}>
              <ArrowLeft size={16} /> Back to questions
            </Button>
            <SubmitTestDialog onSubmit={handleSubmit} unansweredCount={stats.unanswered} />
          </>
        }
      />

      <PageBody>
        <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 p-6">
              <Battery
                label="Answer summary"
                segments={[
                  { tone: "done", value: stats.answered, label: "answered" },
                  { tone: "working", value: stats.flagged, label: "flagged" },
                  { tone: "empty", value: stats.unanswered, label: "blank" },
                ]}
              />
              <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[14px] text-slate-700">
                <span><span className="tabular font-semibold">{stats.answered}</span> answered</span>
                <span><span className="tabular font-semibold">{stats.flagged}</span> flagged</span>
                <span><span className="tabular font-semibold">{stats.unanswered}</span> blank</span>
              </p>
            </div>

            {groups.map((group) => (
              <Canvas key={group.skill} tint={SKILL_TINT[group.skill]} className="p-3 sm:p-4">
                <div className="flex items-center gap-3 px-2 pb-4 pt-1">
                  <CharacterTile skill={group.skill} size={40} />
                  <h2 className="font-display text-[20px] font-normal text-slate-900">{SKILL_LABELS[group.skill]}</h2>
                  <span className="tabular ml-auto text-[14px] text-slate-600">{group.indexes.length} questions</span>
                </div>
                <div className="grid grid-cols-6 gap-2 rounded-3xl bg-white p-4 sm:grid-cols-10 lg:grid-cols-12">
                  {group.indexes.map(({ index }) => (
                    <ButtonNumber
                      key={index}
                      number={index + 1}
                      status={statuses[index]}
                      onClick={() => jumpTo(index + 1)}
                    />
                  ))}
                </div>
              </Canvas>
            ))}
          </div>

          <aside className="self-start rounded-4xl bg-slate-950 p-6 text-white xl:sticky xl:top-24">
            <p className="text-[13px] text-[#c3c6d4]">Time left</p>
            <p
              className={cn(
                "tabular mt-2 flex items-center gap-2 font-display text-[40px] leading-none",
                critical ? "text-[#ff8a9b]" : "text-white"
              )}
            >
              <Clock size={24} className={critical ? "text-[#ff8a9b]" : "text-[#b9e3ff]"} />
              {secondsLeft > 0 ? formatClock(secondsLeft) : "Time's up"}
            </p>

            <dl className="mt-6 space-y-3 border-t border-white/15 pt-5 text-[14px]">
              <div>
                <dt className="text-[13px] text-[#c3c6d4]">Candidate</dt>
                <dd className="text-white">{user?.full_name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-[#c3c6d4]">Email</dt>
                <dd className="truncate text-white">{user?.email ?? "—"}</dd>
              </div>
            </dl>

            {stats.unanswered > 0 && (
              <p className="mt-5 rounded-2xl bg-[#fff3e0] px-4 py-3 text-[13px] leading-relaxed text-slate-800">
                Blank answers are marked wrong. Click a number to go back and fill it in.
              </p>
            )}
          </aside>
        </div>
      </PageBody>
    </>
  );
}
