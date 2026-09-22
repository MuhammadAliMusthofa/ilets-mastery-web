"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, useGSAP, useScrollReveal, prefersReducedMotion } from "@/src/_global/motion/gsap";
import Link from "next/link";
import { ArrowRight, Loader2, Play } from "lucide-react";
import { useAuthStore } from "@/src/store/authStore";
import { useExamPackages } from "@/src/features/student-mock-test/hooks/useExam";
import { MockCardGrid } from "@/src/features/student-mock-test/components/MockCard";
import { MOCK_ROUTES } from "@/src/features/student-mock-test/constants/routes";
import { GuideStack } from "@/src/_global/components/Board/Board";
import { ArrowLink, CharacterFigure, Chip, SectionTitle } from "@/src/_global/components/Showcase/Showcase";
import { SKILL_COLOR } from "@/src/_global/design/tokens";
import { SKILL_LABELS, type Skill, type StudentPackageSummary } from "@/src/models/ielts";
import { ModuleHubContainer } from "./ModuleHubContainer";
import { SkillCards } from "../components/SkillCards";
import { ProgressSection } from "../components/ProgressSection";
import { BasicTodayCard } from "@/src/features/basic/components/BasicTodayCard";

const greetingFor = (hour: number) => {
  if (hour < 11) return "Good morning";
  if (hour < 15) return "Good afternoon";
  if (hour < 19) return "Good afternoon";
  return "Good evening";
};

/** Pembulatan overall IELTS: rata-rata dibulatkan ke 0.5 terdekat. */
const overallOf = (bands: number[]) => Math.round((bands.reduce((a, b) => a + b, 0) / bands.length) * 2) / 2;

function latestResult(packages: StudentPackageSummary[]) {
  const submitted = packages
    .filter((pkg) => pkg.last_attempt?.status === "SUBMITTED" && pkg.last_attempt.submitted_at)
    .sort((a, b) => (b.last_attempt!.submitted_at! > a.last_attempt!.submitted_at! ? 1 : -1))[0];
  if (!submitted) return null;
  const bands = Object.entries(submitted.last_attempt!.band_scores ?? {}).filter(
    (entry): entry is [Skill, number] => typeof entry[1] === "number"
  );
  if (bands.length === 0) return null;
  return { pkg: submitted, bands, overall: overallOf(bands.map(([, band]) => band)) };
}

function FloatCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`absolute rounded-2xl p-4 ring-1 ring-white/10 ${className ?? ""}`}>{children}</div>;
}

export function DashboardContainer() {
  const user = useAuthStore((state) => state.user);
  const { data: packages, isLoading, isError } = useExamPackages();

  // Jam dibaca di klien supaya sapaan mengikuti waktu perangkat siswa.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const firstName = user?.full_name?.split(/\s+/)[0];
  const running = packages?.find((pkg) => pkg.last_attempt?.status === "IN_PROGRESS");
  const next = running ?? packages?.find((pkg) => !pkg.last_attempt) ?? packages?.[0];
  const result = useMemo(() => (packages ? latestResult(packages) : null), [packages]);

  const primary = running
    ? { label: "Resume test", href: MOCK_ROUTES.detail(running.id) }
    : next
      ? { label: "Start a mock test", href: MOCK_ROUTES.detail(next.id) }
      : { label: "Browse mock tests", href: MOCK_ROUTES.list };

  const featured = (packages ?? []).slice(0, 2);

  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef, [Boolean(packages)]);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // Intro sekali saat mount; hanya gerak, tanpa opacity, agar hero tidak pernah
      // tertinggal pudar bila data datang di tengah animasi.
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".dash-hero", { y: 24, duration: 0.8 })
        .from(".dash-figure", { yPercent: 18, duration: 1 }, "-=0.6");
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef}>
      {/* Hero gelap: sapaan, satu aksi utama, dan karakter kru dengan kartu info melayang. */}
      <div className="mx-auto max-w-[1320px] px-3 pt-3 sm:px-5 lg:px-8 lg:pt-6">
        <section className="dash-hero relative overflow-hidden rounded-4xl bg-slate-950 text-white">
          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            <div className="relative z-10 flex flex-col justify-center px-7 py-12 sm:px-12 lg:py-16 lg:pl-14">
              <p className="text-[15px] text-[#c3c6d4]">
                {now?.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) ?? " "}
              </p>
              <h1 className="mt-3 font-display text-[40px] font-normal leading-[1.05] tracking-[-0.02em] sm:text-[56px]">
                {now ? greetingFor(now.getHours()) : "Hello"}
                {firstName ? `, ${firstName}` : ""}
              </h1>
              <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-[#c3c6d4]">
                {running
                  ? `${running.title} is still running. The clock keeps ticking, so pick it up while you can.`
                  : "One mock test today beats ten strategy videos. The crew is ready to guide every skill."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={primary.href}
                  className="group/cta inline-flex h-12 items-center gap-2 rounded-full bg-[#b9e3ff] px-7 text-[15px] font-medium text-slate-900 transition-colors hover:bg-white"
                >
                  <Play size={16} className="fill-current" />
                  {primary.label}
                </Link>
                <Link
                  href="/ielts"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-7 text-[15px] font-medium text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Open IELTS space <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[320px] sm:min-h-[400px]">
              <CharacterFigure
                skill="READING"
                priority
                sizes="(min-width: 1024px) 420px, 70vw"
                className="dash-figure absolute bottom-0 left-1/2 h-[94%] w-[78%] -translate-x-1/2"
              />

              {result && (
                <FloatCard className="dash-float left-2 top-10 hidden w-[200px] bg-[#292f4c] sm:block lg:left-0">
                  <p className="text-[13px] text-[#c3c6d4]">Latest band</p>
                  <p className="tabular mt-1 font-display text-[40px] leading-none">{result.overall.toFixed(1)}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {result.bands.map(([skill, band]) => (
                      <Chip key={skill} color={SKILL_COLOR[skill]} className="h-5 px-2 text-[11px]">
                        {SKILL_LABELS[skill].slice(0, 1)} {band.toFixed(1)}
                      </Chip>
                    ))}
                  </div>
                </FloatCard>
              )}

              {next && (
                <FloatCard className="dash-float bottom-10 right-4 hidden w-[230px] bg-white text-slate-900 ring-slate-950/5 sm:block lg:right-8">
                  <p className="text-[13px] text-slate-500">{running ? "In progress" : "Up next"}</p>
                  <p className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug">{next.title}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <GuideStack skills={next.skills} size={26} />
                    <span className="tabular text-[13px] text-slate-600">{next.duration_minutes} mnt</span>
                  </div>
                </FloatCard>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-[1240px] space-y-20 px-5 pt-16 lg:px-8">
        <BasicTodayCard />

        {packages && (
          <div data-reveal>
            <ProgressSection packages={packages} />
          </div>
        )}

        <section data-reveal aria-labelledby="modules">
          <SectionTitle
            id="modules"
            title="Two tracks, one goal"
            description="Build your foundations in Basic to Hero, or go straight to IELTS General Training prep. You can run both at once."
          />
          <ModuleHubContainer />
        </section>

        <section data-reveal aria-labelledby="skills">
          <SectionTitle
            id="skills"
            title="A crew for every skill"
            description="Each skill has its own guide, complete with strategies and General Training question formats."
          />
          <SkillCards />
        </section>

        <section data-reveal aria-labelledby="mock">
          <SectionTitle
            id="mock"
            title="Featured mock tests"
            action={<ArrowLink href={MOCK_ROUTES.list}>All mock tests</ArrowLink>}
          />
          {isLoading && (
            <p className="flex items-center gap-2 text-[15px] text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Loading tests…
            </p>
          )}
          {isError && (
            <p className="text-[15px] text-[#b12a41]">Couldn't load the tests. Reload the page to try again.</p>
          )}
          {packages && <MockCardGrid packages={featured} emptyText="No tests have been published yet." />}
        </section>
      </div>
    </div>
  );
}
