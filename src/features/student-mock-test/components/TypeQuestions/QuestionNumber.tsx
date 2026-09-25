import { cn } from "@/src/libs/utils";

/** Kotak nomor soal ala ujian IELTS berbasis komputer. */
export function QuestionNumber({ value, className }: { value: number | string; className?: string }) {
  return (
    <span
      className={cn(
        "tabular inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-[4px] bg-slate-800 px-1.5 text-[13px] font-semibold leading-none text-white",
        className
      )}
    >
      {value}
    </span>
  );
}

/** Teks pertanyaan HTML dengan ukuran baca yang nyaman untuk sesi panjang. */
export function QuestionText({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-[70ch] text-[16px] leading-relaxed text-slate-800 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
