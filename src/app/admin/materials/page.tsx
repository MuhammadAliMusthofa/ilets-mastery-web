"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/src/libs/utils";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import {
  BoardBody,
  BoardCell,
  BoardGroup,
  BoardHead,
  BoardHeadCell,
  BoardRow,
  BoardTable,
  StatusPill,
} from "@/src/_global/components/Board/Board";

type Category = "Vocabulary" | "Idiom" | "Grammar";

// Contoh data: materi belajar belum punya endpoint di backend.
const MATERIALS: Array<{ id: string; title: string; type: Category; published: boolean; date: string }> = [
  { id: "M001", title: "Essential Academic Words for Task 2", type: "Vocabulary", published: true, date: "12 Oct 2024" },
  { id: "M002", title: "10 Idioms for Band 8 Speaking", type: "Idiom", published: false, date: "15 Oct 2024" },
  { id: "M003", title: "Mastering Present Perfect", type: "Grammar", published: true, date: "18 Oct 2024" },
];

const GROUPS: Array<{ type: Category; title: string; color: string }> = [
  { type: "Vocabulary", title: "Vocabulary", color: "#1f5fcc" },
  { type: "Idiom", title: "Idioms", color: "#ff7a45" },
  { type: "Grammar", title: "Grammar & tenses", color: "#784bd1" },
];

const TABS: Array<{ id: Category | "all"; label: string }> = [
  { id: "all", label: "All" },
  ...GROUPS.map((group) => ({ id: group.type, label: group.title })),
];

export default function StudyMaterialsPage() {
  const [tab, setTab] = useState<Category | "all">("all");
  const groups = GROUPS.filter((group) => tab === "all" || group.type === tab);

  return (
    <>
      <PageHeader title="Study materials" description="Vocabulary, idioms and grammar for Basic to Hero.">
        <div className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="Material categories">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex h-10 shrink-0 items-center border-b-2 px-3 text-[14px] transition-colors duration-150",
                tab === item.id
                  ? "border-primary-500 font-medium text-slate-800"
                  : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </PageHeader>
      <PageBody>
        <p className="mb-6 flex items-start gap-2 rounded-lg bg-primary-50 px-4 py-3 text-[14px] text-slate-800">
          <Info size={16} className="mt-0.5 shrink-0 text-primary-500" />
          The data below is sample data. Study materials aren't connected to the backend yet.
        </p>

        {groups.map((group) => {
          const rows = MATERIALS.filter((item) => item.type === group.type);
          return (
            <BoardGroup key={group.type} title={group.title} color={group.color} meta={`${rows.length} materials`}>
              <BoardTable>
                <BoardHead>
                  <BoardHeadCell first align="left" className="w-[46%]">Title</BoardHeadCell>
                  <BoardHeadCell className="w-[150px]">Status</BoardHeadCell>
                  <BoardHeadCell>Created</BoardHeadCell>
                  <BoardHeadCell className="rounded-tr-lg">ID</BoardHeadCell>
                </BoardHead>
                <BoardBody>
                  {rows.map((item, index) => (
                    <BoardRow key={item.id}>
                      <BoardCell first last={index === rows.length - 1} align="left">
                        <span className="block truncate font-medium text-slate-800">{item.title}</span>
                      </BoardCell>
                      <BoardCell flush>
                        <StatusPill tone={item.published ? "done" : "working"}>
                          {item.published ? "Published" : "Draft"}
                        </StatusPill>
                      </BoardCell>
                      <BoardCell className="tabular text-slate-700">{item.date}</BoardCell>
                      <BoardCell className="tabular text-slate-500">{item.id}</BoardCell>
                    </BoardRow>
                  ))}
                </BoardBody>
              </BoardTable>
            </BoardGroup>
          );
        })}
      </PageBody>
    </>
  );
}
