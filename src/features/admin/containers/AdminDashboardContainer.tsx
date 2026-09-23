"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpenText, Database, FileText, FolderArchive, Loader2, Plus, Quote, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import { SKILLS, SKILL_LABELS } from "@/src/models/ielts";
import { LEVEL_LABELS } from "@/src/models/basic";
import { usePackages } from "../hooks/usePackages";
import { usePassages } from "../hooks/usePassages";
import { useQuestions } from "../hooks/useQuestions";
import { useAdminCurriculum, useQuoteOfDay, useQuotes } from "../hooks/useContentAdmin";
import { SkillBadge } from "./PassageAdminContainer";
import {
  Card,
  EmptyState,
  ErrorNotice,
  StatCard,
  StatusBadge,
  TBody,
  THead,
  Table,
  TableCard,
  Td,
  Th,
  Tr,
  formatDate,
} from "../components/AdminUI";

/** Angka yang bisa diklik menuju halaman pengelolanya. */
function CountLink({ href, value }: { href: string; value: number }) {
  return (
    <Link href={href} className="tabular rounded-md px-2 py-1 font-medium text-slate-800 hover:bg-primary-50 hover:text-primary-500">
      {value}
    </Link>
  );
}

export default function AdminDashboardContainer() {
  const passages = usePassages();
  const questions = useQuestions();
  const packages = usePackages();
  const curriculum = useAdminCurriculum();
  const quotes = useQuotes();
  const quoteToday = useQuoteOfDay();

  const loading = passages.isLoading || questions.isLoading || packages.isLoading;
  const failed = passages.isError || questions.isError || packages.isError;

  const published = packages.data?.filter((pkg) => pkg.is_published).length ?? 0;
  const activeQuotes = quotes.data?.filter((quote) => quote.is_active).length ?? 0;

  return (
    <>
      <PageHeader
        title="System overview"
        description="Everything students see: IELTS GT content, the Basic English curriculum and the daily quote."
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
        {failed && <ErrorNotice>Some data couldn’t be loaded. Reload the page to try again.</ErrorNotice>}

        {!loading && !failed && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <StatCard label="Passages" value={passages.data?.length ?? 0} icon={FileText} accent="#784bd1" />
              <StatCard label="Questions" value={questions.data?.length ?? 0} icon={Database} />
              <StatCard label="Test packages" value={packages.data?.length ?? 0} hint={`${published} published`} icon={FolderArchive} accent="#00a360" />
              <StatCard
                label="Basic lessons"
                value={curriculum.data?.stats.lessons ?? 0}
                hint={curriculum.data ? `${curriculum.data.stats.questions} quick check questions` : undefined}
                icon={BookOpenText}
                accent="#b86e00"
              />
              <StatCard label="Quotes" value={quotes.data?.length ?? 0} hint={`${activeQuotes} active`} icon={Quote} accent="#d83a52" />
            </div>

            {/* IELTS GT per skill */}
            <TableCard
              title="IELTS GT content by skill"
              count={`${questions.data?.length ?? 0} questions`}
              toolbar={
                <Link href="/admin/questions" className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-primary-500 hover:bg-primary-50">
                  Question bank <ArrowRight size={14} />
                </Link>
              }
            >
              <Table minWidth={640}>
                <THead>
                  <Th>Skill</Th>
                  <Th align="center" className="w-[130px]">
                    Passages
                  </Th>
                  <Th align="center" className="w-[150px]">
                    Published passages
                  </Th>
                  <Th align="center" className="w-[130px]">
                    Questions
                  </Th>
                </THead>
                <TBody>
                  {SKILLS.map((skill) => {
                    const skillPassages = passages.data?.filter((item) => item.skill === skill) ?? [];
                    const skillQuestions = questions.data?.filter((item) => item.skill === skill) ?? [];
                    return (
                      <Tr key={skill}>
                        <Td>
                          <span className="flex items-center gap-2">
                            <SkillBadge skill={skill} />
                            <span className="text-slate-500">{SKILL_LABELS[skill]} GT</span>
                          </span>
                        </Td>
                        <Td align="center">
                          <CountLink href="/admin/passages" value={skillPassages.length} />
                        </Td>
                        <Td align="center" className="tabular text-slate-700">
                          {skillPassages.filter((item) => item.is_published).length}
                        </Td>
                        <Td align="center">
                          <CountLink href="/admin/questions" value={skillQuestions.length} />
                        </Td>
                      </Tr>
                    );
                  })}
                </TBody>
              </Table>
            </TableCard>

            {/* Paket */}
            <TableCard
              title="Test packages"
              count={packages.data?.length ?? 0}
              toolbar={
                <Link href="/admin/packages" className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-primary-500 hover:bg-primary-50">
                  Manage packages <ArrowRight size={14} />
                </Link>
              }
              footer={
                (packages.data?.length ?? 0) > 0 ? (
                  <>
                    <span className="tabular font-medium text-slate-900">{published}</span> published,{" "}
                    <span className="tabular">{(packages.data?.length ?? 0) - published}</span> draft
                  </>
                ) : undefined
              }
            >
              {(packages.data ?? []).length === 0 ? (
                <EmptyState icon={FolderArchive} title="No packages yet" text="Build a mock test from questions in the bank." />
              ) : (
                <Table minWidth={640}>
                  <THead>
                    <Th>Package</Th>
                    <Th className="w-[130px]">Type</Th>
                    <Th align="center" className="w-[110px]">
                      Questions
                    </Th>
                    <Th className="w-[130px]">Status</Th>
                    <Th className="w-[130px]">Updated</Th>
                  </THead>
                  <TBody>
                    {(packages.data ?? []).map((pkg) => (
                      <Tr key={pkg.id}>
                        <Td>
                          <Link href="/admin/packages" className="font-medium text-slate-900 hover:text-primary-500">
                            {pkg.title}
                          </Link>
                        </Td>
                        <Td className="text-slate-700">{pkg.package_type === "FULL" ? "Full test" : "Single skill"}</Td>
                        <Td align="center" className="tabular text-slate-700">
                          {pkg.total_items}
                        </Td>
                        <Td>
                          <StatusBadge published={pkg.is_published} />
                        </Td>
                        <Td className="tabular text-slate-500">{formatDate(pkg.updatedAt)}</Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              )}
            </TableCard>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              {/* Basic English */}
              <TableCard
                title="Basic English curriculum"
                count={curriculum.data ? `${curriculum.data.stats.units} units` : undefined}
                toolbar={
                  <Link href="/admin/basic" className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-primary-500 hover:bg-primary-50">
                    Manage curriculum <ArrowRight size={14} />
                  </Link>
                }
              >
                {curriculum.isLoading ? (
                  <p className="px-4 py-6 text-sm text-slate-500">Loading curriculum…</p>
                ) : (
                  <Table minWidth={520}>
                    <THead>
                      <Th>Level</Th>
                      <Th align="center" className="w-[90px]">
                        Units
                      </Th>
                      <Th align="center" className="w-[100px]">
                        Lessons
                      </Th>
                      <Th align="center" className="w-[110px]">
                        Questions
                      </Th>
                    </THead>
                    <TBody>
                      {(curriculum.data?.levels ?? []).map((level) => {
                        const lessons = level.units.flatMap((unit) => unit.lessons);
                        return (
                          <Tr key={level.key}>
                            <Td>
                              <Link href="/admin/basic" className="font-medium text-slate-900 hover:text-primary-500">
                                {LEVEL_LABELS[level.key]}
                              </Link>
                            </Td>
                            <Td align="center" className="tabular text-slate-700">
                              {level.units.length}
                            </Td>
                            <Td align="center" className="tabular text-slate-700">
                              {lessons.length}
                            </Td>
                            <Td align="center" className="tabular text-slate-700">
                              {lessons.reduce((sum, lesson) => sum + lesson.question_count, 0)}
                            </Td>
                          </Tr>
                        );
                      })}
                    </TBody>
                  </Table>
                )}
              </TableCard>

              {/* Kutipan hari ini */}
              <Card
                title="Quote of the day"
                description={activeQuotes > 0 ? `${activeQuotes} active quotes in rotation` : "No active quotes"}
                actions={
                  <Link href="/admin/quotes" className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-primary-500 hover:bg-primary-50">
                    Manage <ArrowRight size={14} />
                  </Link>
                }
              >
                {quoteToday.data ? (
                  <figure>
                    <blockquote className="text-[15px] leading-relaxed text-slate-800">“{quoteToday.data.text}”</blockquote>
                    <figcaption className="mt-3 text-[13px] text-slate-500">
                      — {quoteToday.data.author}
                      {quoteToday.data.source && `, ${quoteToday.data.source}`}
                    </figcaption>
                  </figure>
                ) : (
                  <p className="text-[14px] text-slate-500">
                    Students don’t see a quote card until at least one quote is active.
                  </p>
                )}
              </Card>
            </div>

            <p className="flex items-center gap-2 text-[13px] text-slate-500">
              <Users size={14} /> Learner accounts are listed under{" "}
              <Link href="/admin/users" className="text-primary-500 hover:underline">
                Users
              </Link>
              .
            </p>
          </div>
        )}
      </PageBody>
    </>
  );
}
