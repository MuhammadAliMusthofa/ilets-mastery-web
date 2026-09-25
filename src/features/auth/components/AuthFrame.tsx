import React from "react";
import { Wordmark } from "@/src/_global/components/Shell/Wordmark";
import { CharacterFigure, CharacterTile } from "@/src/_global/components/Showcase/Showcase";

type Skill = "LISTENING" | "READING" | "WRITING" | "SPEAKING";

/**
 * Kerangka halaman autentikasi: formulir di kiri, panggung gelap berkarakter
 * di kanan — seperti hero monday CRM dengan kartu info yang melayang.
 */
export function AuthFrame({
  title,
  description,
  skill = "SPEAKING",
  children,
}: {
  title: string;
  description?: React.ReactNode;
  skill?: Skill;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-6 py-6 sm:px-12">
        <Wordmark href="/" />
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[40px]">
            {title}
          </h1>
          {description && <p className="mt-3 text-[16px] leading-relaxed text-slate-600">{description}</p>}
          <div className="mt-9">{children}</div>
        </div>
      </div>

      <div className="hidden p-3 lg:block">
        <div className="relative h-full min-h-[640px] overflow-hidden rounded-4xl bg-slate-950">
          <CharacterFigure
            skill={skill}
            priority
            sizes="560px"
            className="absolute bottom-0 left-1/2 h-[78%] w-[82%] -translate-x-1/2"
          />

          <div className="absolute left-8 top-[48%] z-10 w-[230px] rounded-2xl bg-[#292f4c] p-4 text-white ring-1 ring-white/10">
            <p className="text-[13px] text-[#c3c6d4]">A crew for every skill</p>
            <div className="mt-3 flex -space-x-2">
              {(["LISTENING", "READING", "WRITING", "SPEAKING"] as const).map((item) => (
                <CharacterTile key={item} skill={item} size={40} className="rounded-xl ring-2 ring-[#292f4c]" />
              ))}
            </div>
          </div>

          <div className="absolute right-8 top-[30%] z-10 w-[220px] rounded-2xl bg-white p-4">
            <p className="text-[13px] text-slate-500">Estimated band</p>
            <p className="tabular mt-1 font-display text-[40px] leading-none text-slate-900">6.5</p>
            <div className="mt-3 h-1.5 rounded-full bg-slate-100">
              <div className="h-1.5 w-[72%] rounded-full bg-[#1f5fcc]" />
            </div>
            <p className="mt-2 text-[12px] text-slate-500">Sample result view</p>
          </div>

          <p className="absolute left-10 top-10 max-w-[24ch] font-display text-[28px] leading-tight text-white">
            IELTS General Training practice for self-learners.
          </p>
        </div>
      </div>
    </main>
  );
}

/** Kotak pesan di atas formulir. */
export function AuthNotice({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "rounded-2xl bg-[#fdeef1] px-4 py-3 text-[14px] text-[#8a1f33]"
          : "rounded-2xl bg-[#dcf7ea] px-4 py-3 text-[14px] text-[#00613a]"
      }
    >
      {children}
    </div>
  );
}
