"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flag, Loader2, Play, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody } from "@/src/_global/components/Shell/AppShell";
import { Canvas, CharacterFigure, CharacterTile, Chip } from "@/src/_global/components/Showcase/Showcase";
import { SKILL_COLOR, SKILL_TINT, STATUS_COLOR } from "@/src/_global/design/tokens";
import { useExamPackage, useStartAttempt } from "../hooks/useExam";
import { MOCK_ROUTES } from "../constants/routes";
import { SKILL_LABELS } from "@/src/models/ielts";

interface MockTestDetailProps {
  testId: string;
}

const readErrorMessage = (error: unknown): string => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? "Couldn't start the test. Check your connection and try again.";
};

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] text-slate-600">{label}</dt>
      <dd className="tabular mt-0.5 font-display text-[26px] leading-none text-slate-900">{value}</dd>
    </div>
  );
}

export default function MockTestDetailContainer({ testId }: MockTestDetailProps) {
  const router = useRouter();
  const packageId = Number(testId);
  const { data: pkg, isLoading, isError } = useExamPackage(packageId);
  const startAttempt = useStartAttempt();

  const inProgress = pkg?.last_attempt?.status === "IN_PROGRESS";
  const done = pkg?.last_attempt?.status === "SUBMITTED";

  const handleStart = async () => {
    try {
      const session = await startAttempt.mutateAsync(packageId);
      // Tidak perlu reset store: hydrate() di halaman ujian mengganti lembar
      // jawaban hanya bila attempt-nya berbeda, sehingga jawaban lokal yang
      // belum tersimpan pada attempt yang dilanjutkan tidak ikut terbuang.
      router.push(MOCK_ROUTES.exam(packageId, session.attempt_id));
    } catch {
      // Pesan dirender dari state mutation.
    }
  };

  if (isLoading) {
    return (
      <PageBody>
        <p className="flex items-center gap-2 text-[15px] text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Loading test…
        </p>
      </PageBody>
    );
  }

  if (isError || !pkg) {
    return (
      <PageBody>
        <p className="mb-5 text-[16px] text-slate-700">This test doesn't exist or hasn't been published yet.</p>
        <Button variant="outline" shape="pill" onClick={() => router.push(MOCK_ROUTES.list)}>
          <ArrowLeft size={16} /> Back to all tests
        </Button>
      </PageBody>
    );
  }

  const bands = Object.entries(pkg.last_attempt?.band_scores ?? {}).filter(
    (entry): entry is [keyof typeof SKILL_COLOR, number] => typeof entry[1] === "number"
  );
  const leadSkill = pkg.sections[0]?.skill ?? pkg.skills[0] ?? "READING";
  const tint = pkg.package_type === "FULL" ? "#f1e4fc" : SKILL_TINT[leadSkill];
  const statusTone = inProgress ? "working" : done ? "done" : "empty";

  return (
    <div className="mx-auto max-w-[1320px] px-3 pt-4 sm:px-5 lg:px-8">
      <Link
        href={MOCK_ROUTES.list}
        className="mb-3 ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[14px] text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <ArrowLeft size={15} /> All mock tests
      </Link>

      {/* Hero kanvas: judul, aksi, dan karakter pemandu skill pertama. */}
      <Canvas tint={tint} className="grid lg:grid-cols-[1.4fr_1fr]">
        <div className="relative z-10 px-7 py-10 sm:px-12 sm:py-14">
          <div className="flex flex-wrap gap-2">
            <Chip color={{ bg: "#ffffff", fg: "#323338" }}>
              {pkg.package_type === "FULL" ? "Full test · 4 skills" : `${SKILL_LABELS[leadSkill]} practice`}
            </Chip>
            <Chip color={STATUS_COLOR[statusTone]}>
              {inProgress ? "In progress" : done ? "Completed" : "Not started"}
            </Chip>
          </div>

          <h1 className="mt-5 font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[46px]">
            {pkg.title}
          </h1>
          {pkg.description && (
            <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-slate-700">{pkg.description}</p>
          )}

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <Stat label="Duration" value={<>{pkg.duration_minutes}<span className="text-[15px] text-slate-600"> minutes</span></>} />
            <Stat label="Questions" value={pkg.total_marks} />
            {bands.length > 0 && (
              <div>
                <dt className="text-[13px] text-slate-600">Latest band</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {bands.map(([skill, band]) => (
                    <Chip key={skill} color={SKILL_COLOR[skill]}>
                      {SKILL_LABELS[skill]} <span className="tabular">{band.toFixed(1)}</span>
                    </Chip>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              variant="dark"
              shape="pill"
              size="lg"
              onClick={handleStart}
              disabled={startAttempt.isPending || pkg.total_marks === 0}
            >
              {startAttempt.isPending ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} className="fill-current" />}
              {inProgress ? "Resume test" : done ? "Take it again" : "Start test"}
            </Button>
            {done && pkg.last_attempt && (
              <Button
                variant="outline"
                shape="pill"
                size="lg"
                className="border-slate-800 bg-transparent hover:bg-white/60"
                onClick={() => router.push(MOCK_ROUTES.result(pkg.id, pkg.last_attempt!.id))}
              >
                View latest results
              </Button>
            )}
          </div>

          {startAttempt.isError && (
            <p role="alert" className="mt-6 max-w-[52ch] rounded-2xl bg-white px-4 py-3 text-[14px] text-[#b12a41]">
              {readErrorMessage(startAttempt.error)}
            </p>
          )}
        </div>

        <div className="relative hidden min-h-[380px] lg:block">
          <CharacterFigure
            skill={leadSkill}
            priority
            sizes="420px"
            className="absolute bottom-0 left-1/2 h-[92%] w-[86%] -translate-x-1/2"
          />
        </div>
      </Canvas>

      {/* Susunan ujian sebagai alur, seperti alur otomasi di situs monday. */}
      <div className="mx-auto max-w-[1240px] px-2 pt-16 sm:px-0 lg:px-0">
        <Canvas tint="#ecedf5" className="grid gap-10 p-3 sm:p-4 lg:grid-cols-[1.1fr_1fr] lg:gap-0">
          <div className="rounded-3xl bg-white px-6 py-8 sm:px-10">
            <ol className="relative mx-auto max-w-[420px] space-y-4">
              <span className="absolute bottom-10 left-[31px] top-10 w-px bg-slate-300" aria-hidden="true" />
              {pkg.sections.map((section) => (
                <li
                  key={section.skill}
                  className="relative flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_6px_20px_-12px_rgb(24_27_52/0.25)]"
                >
                  <CharacterTile skill={section.skill} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] text-slate-900">
                      <span className="font-semibold">{SKILL_LABELS[section.skill]}</span> begins
                    </p>
                    <p className="tabular text-[13px] text-slate-600">
                      {section.total_marks} questions · {section.duration_minutes} min
                    </p>
                  </div>
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: SKILL_COLOR[section.skill].bg }}
                    aria-hidden="true"
                  />
                </li>
              ))}
              <li className="relative flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#00c875] text-slate-900">
                  <Flag size={18} aria-hidden="true" />
                </span>
                <p className="text-[15px] text-slate-900">
                  Submit, and your <span className="font-semibold">band estimate</span> appears
                </p>
              </li>
            </ol>
          </div>

          <div className="flex flex-col justify-center px-6 pb-8 sm:px-10 lg:py-10">
            <h2 className="font-display text-[30px] font-normal leading-[1.15] text-slate-900 sm:text-[38px]">
              Test structure
            </h2>
            <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-slate-700">
              Sections run in order, each with its own time limit. You can flag questions you're unsure about and
              come back to them before submitting.
            </p>
            <div className="mt-6 flex max-w-[46ch] gap-3 rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-700">
              <Timer size={18} className="mt-0.5 shrink-0 text-[#b86e00]" aria-hidden="true" />
              <p>
                The timer runs on the server from the moment you start. Answers save automatically, so you can continue
                on another device before time runs out.
              </p>
            </div>
          </div>
        </Canvas>
      </div>
    </div>
  );
}
