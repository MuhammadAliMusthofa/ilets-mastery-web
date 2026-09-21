import Link from "next/link";
import { ArrowRight, BookCheck } from "lucide-react";

export default function IeltsOverviewPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-900">
        English for IELTS General Training
      </h1>
      <p className="mt-2 text-slate-500">
        Materi strategi, latihan per skill, dan mock test format General Training.
      </p>

      <Link
        href="/ielts/mock"
        className="group mt-8 flex max-w-xl items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-brand-purple/40 hover:shadow-md"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
          <BookCheck size={22} />
        </span>
        <span className="flex-1">
          <span className="block font-bold text-slate-800">Mock Test</span>
          <span className="block text-sm text-slate-500">
            Simulasi ujian dengan waktu nyata dan estimasi band.
          </span>
        </span>
        <ArrowRight
          size={18}
          className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-purple"
        />
      </Link>
    </section>
  );
}
