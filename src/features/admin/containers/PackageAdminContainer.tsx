"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";
import {
  usePackages,
  usePackage,
  useCreatePackage,
  useSetSections,
  usePublishPackage,
} from "../hooks/usePackages";
import { useQuestions } from "../hooks/useQuestions";
import { SKILLS, SKILL_LABELS, type Skill, type SectionInput } from "@/src/models/ielts";
import { Button } from "@/components/ui/button";
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
import { SKILL_COLOR } from "@/src/_global/design/tokens";
import { fieldClass, formPanelClass, labelClass } from "../components/fields";

const readErrorMessage = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? fallback;
};

export function PackageAdminContainer() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"FULL" | "SECTION">("FULL");
  const [activeSkill, setActiveSkill] = useState<Skill>("READING");
  const [sections, setSections] = useState<SectionInput[]>([]);

  const { data: packages, isLoading } = usePackages();
  const { data: selected } = usePackage(selectedId);
  const { data: available } = useQuestions({ skill: activeSkill });

  const createPackage = useCreatePackage();
  const setSectionsMutation = useSetSections();
  const publishPackage = usePublishPackage();

  useEffect(() => {
    if (selected) {
      setSections(
        selected.sections.map((section) => ({
          skill: section.skill,
          duration_minutes: section.duration_minutes,
          question_ids: section.question_ids,
        }))
      );
    }
  }, [selected]);

  const currentSection = sections.find((section) => section.skill === activeSkill);

  // Susunan ditahan di state lokal selama admin menyusun, lalu dikirim
  // sekaligus. Mengirim tiap klik ke server membuat penyusunan 40 soal
  // menghasilkan 40 request.
  const addQuestion = (questionId: number) => {
    setSections((prev) => {
      const existing = prev.find((section) => section.skill === activeSkill);

      if (!existing) {
        return [...prev, { skill: activeSkill, question_ids: [questionId] }];
      }

      if (existing.question_ids.includes(questionId)) {
        return prev;
      }

      return prev.map((section) =>
        section.skill === activeSkill
          ? { ...section, question_ids: [...section.question_ids, questionId] }
          : section
      );
    });
  };

  const removeQuestion = (questionId: number) => {
    setSections((prev) =>
      prev.map((section) =>
        section.skill === activeSkill
          ? { ...section, question_ids: section.question_ids.filter((id) => id !== questionId) }
          : section
      )
    );
  };

  const handleCreate = async () => {
    await createPackage.mutateAsync({ title: newTitle, package_type: newType });
    setNewTitle("");
    setShowForm(false);
  };

  if (selectedId !== null && selected) {
    return (
      <>
        <div className="px-6 pt-4 lg:px-8">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="inline-flex items-center gap-1.5 rounded-[4px] py-1 pr-2 text-[13px] text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={14} /> Back to packages
          </button>
        </div>
        <PageHeader
          title={selected.title}
          description={`${selected.package_type === "FULL" ? "Full test" : "Single skill"} · ${selected.total_items} questions · ${
            selected.is_published ? "Published" : "Draft"
          }`}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => setSectionsMutation.mutate({ id: selected.id, sections })}
                disabled={setSectionsMutation.isPending}
              >
                Save structure
              </Button>
              <Button
                onClick={() => publishPackage.mutate({ id: selected.id, isPublished: true })}
                disabled={publishPackage.isPending}
              >
                Publish
              </Button>
            </>
          }
        >
          <div className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="Sections">
            {SKILLS.map((skill) => {
              const active = skill === activeSkill;
              return (
                <button
                  key={skill}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveSkill(skill)}
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-[14px] transition-colors duration-150",
                    active
                      ? "border-primary-500 font-medium text-slate-800"
                      : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <span className="size-2.5 rounded-[2px]" style={{ backgroundColor: SKILL_COLOR[skill].bg }} aria-hidden="true" />
                  {SKILL_LABELS[skill]}
                  <span className="tabular rounded-[4px] bg-slate-100 px-1.5 text-[12px] text-slate-700">
                    {sections.find((section) => section.skill === skill)?.question_ids.length ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </PageHeader>

        <PageBody>
          {publishPackage.isError && (
            <p role="alert" className="mb-4 rounded-lg border border-[#d83a52] bg-[#fdeef1] px-4 py-3 text-[14px] text-slate-800">
              {readErrorMessage(publishPackage.error, "Couldn't publish the package.")}
            </p>
          )}
          {setSectionsMutation.isError && (
            <p role="alert" className="mb-4 rounded-lg border border-[#d83a52] bg-[#fdeef1] px-4 py-3 text-[14px] text-slate-800">
              {readErrorMessage(setSectionsMutation.error, "Couldn't save the structure.")}
            </p>
          )}

          <div className="grid gap-8 xl:grid-cols-2">
            <BoardGroup title="Available questions" color="#c4c4c4" meta={`${available?.length ?? 0} questions`}>
              <BoardTable className="min-w-[420px]">
                <BoardHead>
                  <BoardHeadCell first align="left">
                    Question
                  </BoardHeadCell>
                  <BoardHeadCell className="w-[64px] rounded-tr-lg">
                    <span className="sr-only">Actions</span>
                  </BoardHeadCell>
                </BoardHead>
                <BoardBody>
                  {available?.map((item, index) => {
                    const used = currentSection?.question_ids.includes(item.id);
                    return (
                      <BoardRow key={item.id}>
                        <BoardCell first last={index === available.length - 1} align="left">
                          <span className={cn("block truncate", used ? "text-slate-400" : "text-slate-800")} title={item.question_text}>
                            {item.question_text}
                          </span>
                        </BoardCell>
                        <BoardCell>
                          <button
                            type="button"
                            aria-label={`Add question ${item.id}`}
                            onClick={() => addQuestion(item.id)}
                            disabled={used}
                            className="flex size-8 items-center justify-center rounded-[4px] text-primary-500 hover:bg-primary-50 disabled:text-slate-300 disabled:hover:bg-transparent"
                          >
                            <Plus size={16} />
                          </button>
                        </BoardCell>
                      </BoardRow>
                    );
                  })}
                </BoardBody>
              </BoardTable>
            </BoardGroup>

            <BoardGroup
              title={`${SKILL_LABELS[activeSkill]} section`}
              color={SKILL_COLOR[activeSkill].bg}
              meta={`${currentSection?.question_ids.length ?? 0} questions`}
            >
              <BoardTable className="min-w-[420px]">
                <BoardHead>
                  <BoardHeadCell first align="left" className="w-[70px]">
                    No.
                  </BoardHeadCell>
                  <BoardHeadCell align="left">Question</BoardHeadCell>
                  <BoardHeadCell className="w-[64px] rounded-tr-lg">
                    <span className="sr-only">Actions</span>
                  </BoardHeadCell>
                </BoardHead>
                <BoardBody>
                  {currentSection?.question_ids.map((questionId, index, list) => (
                    <BoardRow key={questionId}>
                      <BoardCell first last={index === list.length - 1} align="left" className="tabular text-slate-500">
                        {index + 1}
                      </BoardCell>
                      <BoardCell align="left" className="text-slate-800">
                        Question #{questionId}
                      </BoardCell>
                      <BoardCell>
                        <button
                          type="button"
                          aria-label={`Remove question ${questionId}`}
                          onClick={() => removeQuestion(questionId)}
                          className="flex size-8 items-center justify-center rounded-[4px] text-slate-500 hover:bg-[#fdeef1] hover:text-[#b12a41]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </BoardCell>
                    </BoardRow>
                  ))}
                  {!currentSection?.question_ids.length && (
                    <BoardRow>
                      <BoardCell first last align="left" className="text-slate-500">
                        —
                      </BoardCell>
                      <BoardCell align="left" className="text-slate-500">
                        No questions in this section yet.
                      </BoardCell>
                      <BoardCell />
                    </BoardRow>
                  )}
                </BoardBody>
              </BoardTable>
            </BoardGroup>
          </div>
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Test packages"
        description="Assemble questions into IELTS General Training simulations."
        actions={
          <Button onClick={() => setShowForm((prev) => !prev)}>
            <Plus size={16} /> New package
          </Button>
        }
      />
      <PageBody>
        {showForm && (
          <div className={formPanelClass}>
            <h2 className="mb-5 text-[16px] font-medium text-slate-800">New package</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="pkg-title" className={labelClass}>
                  Package title
                </label>
                <input
                  id="pkg-title"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="pkg-type" className={labelClass}>
                  Package type
                </label>
                <select
                  id="pkg-type"
                  value={newType}
                  onChange={(event) => setNewType(event.target.value as "FULL" | "SECTION")}
                  className={fieldClass}
                >
                  <option value="FULL">Full test (4 skills)</option>
                  <option value="SECTION">Single section</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button onClick={handleCreate} disabled={createPackage.isPending}>
                Save
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading && <p className="text-sm text-slate-500">Loading packages…</p>}

        {packages && (
          <BoardGroup title="All packages" color="#0073ea" meta={`${packages.length} packages`}>
            <BoardTable>
              <BoardHead>
                <BoardHeadCell first align="left" className="w-[42%]">
                  Package
                </BoardHeadCell>
                <BoardHeadCell className="w-[130px]">Type</BoardHeadCell>
                <BoardHeadCell className="w-[140px]">Status</BoardHeadCell>
                <BoardHeadCell className="w-[130px] rounded-tr-lg">
                  <span className="sr-only">Actions</span>
                </BoardHeadCell>
              </BoardHead>
              <BoardBody>
                {packages.map((item, index) => (
                  <BoardRow key={item.id}>
                    <BoardCell first last={index === packages.length - 1} align="left">
                      <span className="block truncate font-medium text-slate-800">{item.title}</span>
                    </BoardCell>
                    <BoardCell className="text-slate-700">{item.package_type === "FULL" ? "Full test" : "Single skill"}</BoardCell>
                    <BoardCell flush>
                      <StatusPill tone={item.is_published ? "done" : "working"}>
                        {item.is_published ? "Published" : "Draft"}
                      </StatusPill>
                    </BoardCell>
                    <BoardCell>
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={`Build ${item.title}`}
                        onClick={() => setSelectedId(item.id)}
                      >
                        Build
                      </Button>
                    </BoardCell>
                  </BoardRow>
                ))}
                {packages.length === 0 && (
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
          </BoardGroup>
        )}
      </PageBody>
    </>
  );
}
