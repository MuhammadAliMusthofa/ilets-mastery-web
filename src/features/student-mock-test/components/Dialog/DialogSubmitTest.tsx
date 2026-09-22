"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitTestDialogProps {
  /** Bila diisi, dipanggil alih-alih simulasi; navigasi diurus pemanggil. */
  onSubmit?: () => Promise<void>;
  /** Jumlah soal kosong, disebut dalam konfirmasi. */
  unansweredCount?: number;
}

export function SubmitTestDialog({ onSubmit, unansweredCount = 0 }: SubmitTestDialogProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && !isSubmitting && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isSubmitting]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (onSubmit) {
        await onSubmit();
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 600));
      router.push(pathname.includes("mock") ? "/ielts/mock" : "/dashboard");
    } catch {
      setError("Your answers weren't sent. Check your connection and try submitting again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="dark" shape="pill" onClick={() => setIsOpen(true)}>
        <Send size={16} />
        Submit
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="submit-title"
            aria-describedby="submit-desc"
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 px-7 pt-7">
              <h2 id="submit-title" className="font-display text-[22px] font-normal text-slate-900">
                Submit your answers?
              </h2>
              <button
                type="button"
                onClick={() => !isSubmitting && setIsOpen(false)}
                disabled={isSubmitting}
                className="flex size-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                aria-label="Cancel"
              >
                <X size={18} />
              </button>
            </div>

            <div id="submit-desc" className="space-y-3 px-7 pb-2 pt-2 text-[14px] leading-relaxed text-slate-700">
              <p>Once submitted, answers can't be changed and your Listening &amp; Reading scores are calculated right away.</p>
              {unansweredCount > 0 && (
                <p className="rounded-2xl bg-[#fff3e0] px-4 py-3 text-slate-800">
                  You still have <span className="tabular font-semibold">{unansweredCount}</span> blank questions.
                </p>
              )}
              {error && (
                <p role="alert" className="rounded-2xl bg-[#fdeef1] px-4 py-3 text-slate-800">
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 px-7 pb-7 pt-5">
              <Button variant="ghost" shape="pill" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Keep reviewing
              </Button>
              <Button variant="dark" shape="pill" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? "Submitting…" : "Yes, submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
