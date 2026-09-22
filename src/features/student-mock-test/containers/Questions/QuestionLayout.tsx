"use client";

import React from "react";
import { cn } from "@/src/libs/utils";
import { HighlightableReading } from "@/src/components/ui/highlightable-reading";

interface Attachment {
  type: string;
  path: string;
}

interface QuestionLayoutProps {
  /** Teks bacaan/instruksi passage (HTML). */
  stimulusHtml?: string;
  stimulusImage?: string;
  /** Gambar khusus soal (bukan passage). */
  attachments?: Attachment[];
  children: React.ReactNode;
}

/**
 * Tata letak belah dua ujian: passage di kiri untuk dibaca lama, soal di
 * kanan. Tanpa passage, soal mengisi kolom tengah yang nyaman dibaca.
 */
export function QuestionLayout({ stimulusHtml, stimulusImage, attachments, children }: QuestionLayoutProps) {
  const hasStimulus = !!(stimulusHtml || stimulusImage);
  const images = (attachments ?? []).filter((item) => item?.type === "image" && item.path);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden lg:flex-row">
      {hasStimulus && (
        <section
          aria-label="Reading passage"
          className="h-[42vh] w-full overflow-y-auto border-b border-slate-200 bg-white lg:h-full lg:w-1/2 lg:border-b-0 lg:border-r"
        >
          <div className="mx-auto max-w-[68ch] px-6 py-8 lg:px-10">
            {stimulusImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={stimulusImage}
                alt="Gambar pendukung bacaan"
                className="mb-6 max-h-80 w-auto rounded-lg border border-slate-200 object-contain"
              />
            )}
            {stimulusHtml && (
              <HighlightableReading
                content={
                  <div
                    className="text-[17px] leading-[1.75] text-slate-800 [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_h3]:mb-3 [&_h3]:mt-0 [&_h3]:text-[20px] [&_h3]:font-semibold [&_li]:my-1 [&_p]:mb-4 [&_strong]:font-semibold [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: stimulusHtml }}
                  />
                }
              />
            )}
          </div>
        </section>
      )}

      <section
        aria-label="Questions"
        className={cn(
          "flex-1 overflow-y-auto bg-slate-50",
          hasStimulus ? "w-full lg:w-1/2" : "w-full"
        )}
      >
        <div className={cn("px-6 py-8 lg:px-10", !hasStimulus && "mx-auto max-w-3xl")}>
          {images.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-3">
              {images.map((item, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${item.path}-${index}`}
                  src={item.path}
                  alt={`Question attachment ${index + 1}`}
                  className="max-h-48 rounded-lg border border-slate-200 bg-white object-contain p-2"
                />
              ))}
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-6">{children}</div>
        </div>
      </section>
    </div>
  );
}
