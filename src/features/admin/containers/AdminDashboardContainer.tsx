"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import {
  Battery,
  BoardBody,
  BoardCell,
  BoardGroup,
  BoardHead,
  BoardHeadCell,
  BoardRow,
  BoardTable,
  FillLabel,
  StatusPill,
} from "@/src/_global/components/Board/Board";
import { SKILL_COLOR } from "@/src/_global/design/tokens";
import { usePackages } from "../hooks/usePackages";
import { usePassages } from "../hooks/usePassages";
import { useQuestions } from "../hooks/useQuestions";
import { SKILLS, SKILL_LABELS } from "@/src/models/ielts";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function CountLink({ href, value }: { href: string; value: number }) {
  return (
    <Link href={href} className="tabular rounded-[4px] px-2 py-1 font-medium text-slate-800 hover:bg-primary-50 hover:text-primary-500">
      {value}
    </Link>
  );
}

export default function AdminDashboardContainer() {
  const passages = usePassages();
  const questions = useQuestions();
  const packages = usePackages();

  const loading = passages.isLoading || questions.isLoading || packages.isLoading;
  const failed = passages.isError || questions.isError || packages.isError;

  const published = packages.data?.filter((pkg) => pkg.is_published).length ?? 0;
  const drafts = (packages.data?.length ?? 0) - published;

  return (
    <>
      <PageHeader
        title="System overview"
        description="IELTS GT content per skill and the status of every test package."
        actions={
          <>
            <Link href="/admin/passages" className={buttonVariants({ variant: "outline" })}>
              <Plus size={16} /> Passage
            </Link>
            <Link href="/admin/packages" className={buttonVariants()}>
              <Plus size={16} /> Package
            </Link>
          </>
        }
      />
      <PageBody>
        {loading && (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Loading overview…
          </p>
        )}
        {failed && <p className="text-sm text-[#b12a41]">Some data couldn't be loaded. Reload the page to try again.</p>}

        {!loading && !failed && (
          <>
            <BoardGroup title="Content by skill" color="#784bd1" meta={`${questions.data?.length ?? 0} questions`}>
              <BoardTable>
                <BoardHead>
                  <BoardHeadCell first align="left" className="w-[26%]">Skill</BoardHeadCell>
                  <BoardHeadCell className="w-[140px]">Label</BoardHeadCell>
                  <BoardHeadCell>Passage</BoardHeadCell>
                  <BoardHeadCell>Published passages</BoardHeadCell>
                  <BoardHeadCell className="rounded-tr-lg">Questions</BoardHeadCell>
                </BoardHead>
                <BoardBody>
                  {SKILLS.map((skill, index) => {
                    const skillPassages = passages.data?.filter((item) => item.skill === skill) ?? [];
                    const skillQuestions = questions.data?.filter((item) => item.skill === skill) ?? [];
                    return (
                      <BoardRow key={skill}>
                        <BoardCell first last={index === SKILLS.length - 1} align="left">
                          <span className="font-medium text-slate-800">{SKILL_LABELS[skill]}</span>
                        </BoardCell>
                        <BoardCell flush>
                          <FillLabel color={SKILL_COLOR[skill]}>{SKILL_LABELS[skill]}</FillLabel>
                        </BoardCell>
                        <BoardCell>
                          <CountLink href="/admin/passages" value={skillPassages.length} />
                        </BoardCell>
                        <BoardCell className="tabular text-slate-700">
                          {skillPassages.filter((item) => item.is_published).length}
                        </BoardCell>
                        <BoardCell>
                          <CountLink href="/admin/questions" value={skillQuestions.length} />
                        </BoardCell>
                      </BoardRow>
                    );
                  })}
                </BoardBody>
              </BoardTable>
            </BoardGroup>

            <BoardGroup
              title="Test packages"
              color="#0073ea"
              meta={`${packages.data?.length ?? 0} packages`}
              actions={
                <Link
                  href="/admin/packages"
                  className="inline-flex h-8 items-center gap-1.5 rounded-[4px] px-3 text-[13px] font-medium text-primary-500 hover:bg-primary-50"
                >
                  Manage packages <ArrowRight size={14} />
                </Link>
              }
            >
              <BoardTable>
                <BoardHead>
                  <BoardHeadCell first align="left" className="w-[34%]">Package</BoardHeadCell>
                  <BoardHeadCell className="w-[130px]">Type</BoardHeadCell>
                  <BoardHeadCell className="w-[150px]">Status</BoardHeadCell>
                  <BoardHeadCell className="w-[140px] rounded-tr-lg">Updated</BoardHeadCell>
                </BoardHead>
                <BoardBody>
                  {(packages.data ?? []).map((pkg, index, list) => (
                    <BoardRow key={pkg.id}>
                      <BoardCell first last={index === list.length - 1} align="left">
                        <span className="block truncate font-medium text-slate-800" title={pkg.title}>
                          {pkg.title}
                        </span>
                      </BoardCell>
                      <BoardCell className="text-slate-700">{pkg.package_type === "FULL" ? "Full test" : "Single skill"}</BoardCell>
                      <BoardCell flush>
                        <StatusPill tone={pkg.is_published ? "done" : "working"}>
                          {pkg.is_published ? "Published" : "Draft"}
                        </StatusPill>
                      </BoardCell>
                      <BoardCell className="tabular text-slate-700">{formatDate(pkg.updatedAt)}</BoardCell>
                    </BoardRow>
                  ))}
                  {(packages.data ?? []).length === 0 && (
                    <BoardRow>
                      <BoardCell first last align="left" className="text-slate-500">
                        No packages yet.
                      </BoardCell>
                      <BoardCell />
                      <BoardCell />
                      <BoardCell />
                    </BoardRow>
                  )}
                </BoardBody>
              </BoardTable>
              {(packages.data?.length ?? 0) > 0 && (
                <div className="mt-2 flex items-center gap-3 pl-5">
                  <Battery
                    className="max-w-[240px]"
                    label="Test packages"
                    segments={[
                      { tone: "done", value: published, label: "published" },
                      { tone: "working", value: drafts, label: "draft" },
                    ]}
                  />
                  <span className="text-[13px] text-slate-500">
                    <span className="tabular font-medium text-slate-800">{published}</span> published,{" "}
                    <span className="tabular">{drafts}</span> draft
                  </span>
                </div>
              )}
            </BoardGroup>
          </>
        )}
      </PageBody>
    </>
  );
}
