"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, FolderArchive, Loader2, Plus, Trash2, X } from "lucide-react";
import {
  usePackages,
  usePackage,
  useCreatePackage,
  useDeletePackage,
  useSetSections,
  usePublishPackage,
} from "../hooks/usePackages";
import { useQuestions } from "../hooks/useQuestions";
import {
  QUESTION_TYPE_LABELS,
  SKILLS,
  SKILL_LABELS,
  type ExamPackage,
  type SectionInput,
  type Skill,
} from "@/src/models/ielts";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import { SKILL_COLOR } from "@/src/_global/design/tokens";
import {
  ConfirmDialog,
  Drawer,
  EmptyState,
  ErrorNotice,
  Field,
  IconAction,
  SearchInput,
  StatusBadge,
  TBody,
  THead,
  Table,
  TableCard,
  Td,
  Th,
  Tr,
  formatDate,
  readErrorMessage,
  stripHtml,
} from "../components/AdminUI";
import { fieldClass } from "../components/fields";

/** Jumlah soal yang diharapkan per skill di format General Training. */
const EXPECTED_ITEMS: Record<Skill, number> = { LISTENING: 40, READING: 40, WRITING: 2, SPEAKING: 3 };

const countFor = (pkg: ExamPackage, skill: Skill) => pkg.sections.find((section) => section.skill === skill)?.question_ids.length ?? 0;

// ---------------------------------------------------------------------------
// Daftar paket
// ---------------------------------------------------------------------------

function PackageCard({
  pkg,
  onBuild,
  onDelete,
}: {
  pkg: ExamPackage;
  onBuild: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-semibold text-slate-900">{pkg.title}</h3>
          <p className="mt-1 text-[13px] text-slate-500">
            {pkg.package_type === "FULL" ? "Full test · 4 skills" : "Single skill"} · updated {formatDate(pkg.updatedAt)}
          </p>
        </div>
        <StatusBadge published={pkg.is_published} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        {SKILLS.map((skill) => {
          const count = countFor(pkg, skill);
          const expected = EXPECTED_ITEMS[skill];
          const ready = count >= expected;
          return (
            <div key={skill} className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="flex items-center gap-1.5 text-[12px] text-slate-500">
                <span className="size-2 rounded-full" style={{ backgroundColor: SKILL_COLOR[skill].bg }} aria-hidden="true" />
                {SKILL_LABELS[skill]}
              </dt>
              <dd className={cn("tabular mt-0.5 text-[14px] font-medium", ready ? "text-slate-900" : "text-slate-500")}>
                {count}
                <span className="text-slate-400">/{expected}</span>
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <span className="tabular text-[13px] text-slate-500">{pkg.total_items} questions in total</span>
        <span className="flex items-center gap-1">
          <IconAction label={`Delete ${pkg.title}`} tone="danger" onClick={onDelete}>
            <Trash2 size={15} />
          </IconAction>
          <Button size="sm" variant="outline" aria-label={`Build ${pkg.title}`} onClick={onBuild}>
            Build
          </Button>
        </span>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Penyusun isi paket
// ---------------------------------------------------------------------------

function PackageBuilder({ pkg, onBack }: { pkg: ExamPackage; onBack: () => void }) {
  const [activeSkill, setActiveSkill] = useState<Skill>("READING");
  const [sections, setSections] = useState<SectionInput[]>(() =>
    pkg.sections.map((section) => ({ skill: section.skill, duration_minutes: section.duration_minutes, question_ids: section.question_ids }))
  );
  const [search, setSearch] = useState("");

  const { data: available } = useQuestions({ skill: activeSkill });
  const setSectionsMutation = useSetSections();
  const publishPackage = usePublishPackage();

  const currentSection = sections.find((section) => section.skill === activeSkill);
  const chosen = currentSection?.question_ids ?? [];
  const byId = useMemo(() => new Map((available ?? []).map((question) => [question.id, question])), [available]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (available ?? []).filter((question) => !term || stripHtml(question.question_text).toLowerCase().includes(term) || String(question.id) === term);
  }, [available, search]);

  const patchSection = (updater: (ids: number[]) => number[]) =>
    setSections((prev) => {
      const existing = prev.find((section) => section.skill === activeSkill);
      if (!existing) return [...prev, { skill: activeSkill, question_ids: updater([]) }];
      return prev.map((section) => (section.skill === activeSkill ? { ...section, question_ids: updater(section.question_ids) } : section));
    });

  const addQuestion = (id: number) => patchSection((ids) => (ids.includes(id) ? ids : [...ids, id]));
  const removeQuestion = (id: number) => patchSection((ids) => ids.filter((item) => item !== id));
  const moveQuestion = (index: number, direction: -1 | 1) =>
    patchSection((ids) => {
      const next = [...ids];
      const target = index + direction;
      if (target < 0 || target >= next.length) return ids;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const expected = EXPECTED_ITEMS[activeSkill];

  return (
    <>
      <div className="px-6 pt-4 lg:px-8">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900">
          <ArrowLeft size={14} /> All packages
        </button>
      </div>
      <PageHeader
        title={pkg.title}
        description={`${pkg.package_type === "FULL" ? "Full test" : "Single skill"} · ${pkg.total_items} questions · ${pkg.is_published ? "Published" : "Draft"}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setSectionsMutation.mutate({ id: pkg.id, sections })} disabled={setSectionsMutation.isPending}>
              Save structure
            </Button>
            <Button
              onClick={() => publishPackage.mutate({ id: pkg.id, isPublished: !pkg.is_published })}
              disabled={publishPackage.isPending}
              variant={pkg.is_published ? "outline" : "default"}
            >
              {pkg.is_published ? "Unpublish" : "Publish"}
            </Button>
          </>
        }
      >
        <div className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="Sections">
          {SKILLS.map((skill) => {
            const active = skill === activeSkill;
            const count = sections.find((section) => section.skill === skill)?.question_ids.length ?? 0;
            return (
              <button
                key={skill}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveSkill(skill)}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-[14px] transition-colors duration-150",
                  active ? "border-primary-500 font-medium text-slate-800" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <span className="size-2.5 rounded-[2px]" style={{ backgroundColor: SKILL_COLOR[skill].bg }} aria-hidden="true" />
                {SKILL_LABELS[skill]}
                <span className="tabular rounded-[4px] bg-slate-100 px-1.5 text-[12px] text-slate-700">
                  {count}/{EXPECTED_ITEMS[skill]}
                </span>
              </button>
            );
          })}
        </div>
      </PageHeader>

      <PageBody>
        {publishPackage.isError && <ErrorNotice>{readErrorMessage(publishPackage.error, "Couldn't publish the package.")}</ErrorNotice>}
        {setSectionsMutation.isError && <ErrorNotice>{readErrorMessage(setSectionsMutation.error, "Couldn't save the structure.")}</ErrorNotice>}
        {setSectionsMutation.isSuccess && !setSectionsMutation.isPending && (
          <p className="mb-4 rounded-lg border border-[#b7e7cf] bg-[#dcf7ea] px-4 py-3 text-[14px] text-[#00613a]">Structure saved.</p>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <TableCard
            title={`${SKILL_LABELS[activeSkill]} section`}
            count={`${chosen.length}/${expected}`}
            toolbar={
              chosen.length > 0 ? (
                <Button size="sm" variant="ghost" onClick={() => patchSection(() => [])}>
                  Clear section
                </Button>
              ) : undefined
            }
          >
            {chosen.length === 0 ? (
              <EmptyState
                title="This section is empty"
                text={`Add ${expected} ${SKILL_LABELS[activeSkill].toLowerCase()} questions from the bank on the right. Order here is the order students see.`}
              />
            ) : (
              <Table minWidth={420}>
                <THead>
                  <Th className="w-[52px]">No.</Th>
                  <Th>Question</Th>
                  <Th className="w-[120px]">
                    <span className="sr-only">Actions</span>
                  </Th>
                </THead>
                <TBody>
                  {chosen.map((questionId, index) => {
                    const question = byId.get(questionId);
                    return (
                      <Tr key={questionId}>
                        <Td className="tabular text-slate-400">{index + 1}</Td>
                        <Td>
                          <p className="line-clamp-2 text-slate-900">{question ? stripHtml(question.question_text) : `Question #${questionId}`}</p>
                          {question && <p className="mt-0.5 text-[12px] text-slate-500">{QUESTION_TYPE_LABELS[question.question_type]}</p>}
                        </Td>
                        <Td>
                          <span className="flex justify-end gap-0.5">
                            <IconAction label={`Move question ${index + 1} up`} disabled={index === 0} onClick={() => moveQuestion(index, -1)}>
                              <ArrowUp size={15} />
                            </IconAction>
                            <IconAction label={`Move question ${index + 1} down`} disabled={index === chosen.length - 1} onClick={() => moveQuestion(index, 1)}>
                              <ArrowDown size={15} />
                            </IconAction>
                            <IconAction label={`Remove question ${questionId}`} tone="danger" onClick={() => removeQuestion(questionId)}>
                              <X size={15} />
                            </IconAction>
                          </span>
                        </Td>
                      </Tr>
                    );
                  })}
                </TBody>
              </Table>
            )}
          </TableCard>

          <TableCard
            title="Available questions"
            count={filtered.length}
            toolbar={<SearchInput value={search} onChange={setSearch} placeholder="Search text or ID" label="Search the question bank" />}
          >
            {filtered.length === 0 ? (
              <EmptyState title="No questions found" text={`Add ${SKILL_LABELS[activeSkill].toLowerCase()} questions in the question bank first.`} />
            ) : (
              <Table minWidth={420}>
                <THead>
                  <Th className="w-[64px]">ID</Th>
                  <Th>Question</Th>
                  <Th className="w-[64px]">
                    <span className="sr-only">Actions</span>
                  </Th>
                </THead>
                <TBody>
                  {filtered.map((item) => {
                    const used = chosen.includes(item.id);
                    return (
                      <Tr key={item.id}>
                        <Td className="tabular text-slate-400">#{item.id}</Td>
                        <Td>
                          <p className={cn("line-clamp-2", used ? "text-slate-400" : "text-slate-900")}>{stripHtml(item.question_text)}</p>
                          <p className="mt-0.5 text-[12px] text-slate-500">
                            {QUESTION_TYPE_LABELS[item.question_type]}
                            {used && " · already added"}
                          </p>
                        </Td>
                        <Td>
                          <span className="flex justify-end">
                            <IconAction label={`Add question ${item.id}`} disabled={used} onClick={() => addQuestion(item.id)}>
                              <Plus size={16} />
                            </IconAction>
                          </span>
                        </Td>
                      </Tr>
                    );
                  })}
                </TBody>
              </Table>
            )}
          </TableCard>
        </div>
      </PageBody>
    </>
  );
}

// ---------------------------------------------------------------------------

export function PackageAdminContainer() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"FULL" | "SECTION">("FULL");
  const [deleting, setDeleting] = useState<ExamPackage | null>(null);

  const { data: packages, isLoading } = usePackages();
  const { data: selected } = usePackage(selectedId);
  const createPackage = useCreatePackage();
  const deletePackage = useDeletePackage();

  const handleCreate = async () => {
    try {
      await createPackage.mutateAsync({ title: newTitle, package_type: newType });
      setNewTitle("");
      setShowForm(false);
    } catch {
      // Pesan dirender dari state mutation.
    }
  };

  if (selectedId !== null && selected) {
    // key: paket yang datang kembali dari server setelah disimpan memuat ulang susunannya.
    return <PackageBuilder key={`${selected.id}-${selected.updatedAt}`} pkg={selected} onBack={() => setSelectedId(null)} />;
  }

  const published = packages?.filter((pkg) => pkg.is_published).length ?? 0;

  return (
    <>
      <PageHeader
        title="Test packages"
        description="Assemble questions into IELTS General Training simulations."
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> New package
          </Button>
        }
      />
      <PageBody>
        {isLoading && (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Loading packages…
          </p>
        )}

        {packages && packages.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300">
            <EmptyState
              icon={FolderArchive}
              title="No packages yet"
              text="A package is one mock test: four sections filled with questions from the bank."
              action={
                <Button onClick={() => setShowForm(true)}>
                  <Plus size={16} /> New package
                </Button>
              }
            />
          </div>
        )}

        {packages && packages.length > 0 && (
          <>
            <p className="mb-4 text-[14px] text-slate-500">
              <span className="tabular font-medium text-slate-900">{published}</span> published,{" "}
              <span className="tabular">{packages.length - published}</span> draft
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} onBuild={() => setSelectedId(pkg.id)} onDelete={() => setDeleting(pkg)} />
              ))}
            </div>
          </>
        )}
      </PageBody>

      <Drawer
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New package"
        subtitle="You can add questions right after creating it."
        width={480}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={newTitle.trim().length < 3 || createPackage.isPending}>
              {createPackage.isPending ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Package title" htmlFor="pkg-title" hint="e.g. GT Tryout 3">
            <input id="pkg-title" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} className={fieldClass} />
          </Field>
          <Field label="Package type" htmlFor="pkg-type">
            <select id="pkg-type" value={newType} onChange={(event) => setNewType(event.target.value as "FULL" | "SECTION")} className={fieldClass}>
              <option value="FULL">Full test (4 skills)</option>
              <option value="SECTION">Single section</option>
            </select>
          </Field>
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-[13px] text-slate-600">
            A full test can only be published once every section has enough questions: Listening 40, Reading 40, Writing 2, Speaking 3.
          </p>
          {createPackage.isError && <ErrorNotice>{readErrorMessage(createPackage.error, "Couldn't create the package.")}</ErrorNotice>}
        </div>
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this package?"
        message={
          <>
            <strong className="text-slate-900">{deleting?.title}</strong> and its structure will be deleted. The questions themselves stay in the bank.
            {deleting?.is_published && " It is published, so students lose access to this mock test."}
          </>
        }
        pending={deletePackage.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await deletePackage.mutateAsync(deleting.id).catch(() => undefined);
          setDeleting(null);
        }}
      />
    </>
  );
}
