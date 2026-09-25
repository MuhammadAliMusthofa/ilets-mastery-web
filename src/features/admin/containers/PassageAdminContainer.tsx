"use client";

import { useMemo, useState } from "react";
import { FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { usePassages, useCreatePassage, useDeletePassage, useUpdatePassage } from "../hooks/usePassages";
import { useQuestions } from "../hooks/useQuestions";
import { QUESTION_TYPE_LABELS, SKILLS, SKILL_LABELS, type Passage, type PassageInput, type Skill } from "@/src/models/ielts";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import { SKILL_COLOR } from "@/src/_global/design/tokens";
import {
  Card,
  ConfirmDialog,
  DetailList,
  Drawer,
  EmptyState,
  ErrorNotice,
  Field,
  FilterChips,
  IconAction,
  SearchInput,
  StatusBadge,
  TBody,
  THead,
  Table,
  TableCard,
  Td,
  Th,
  Toggle,
  Tr,
  formatDate,
  readErrorMessage,
  stripHtml,
} from "../components/AdminUI";
import { fieldClass, textareaClass } from "../components/fields";

// Dibatasi mengikuti format GT supaya admin tidak bisa membuat Reading
// section 4 yang pasti ditolak backend.
const MAX_SECTION: Record<Skill, number> = {
  LISTENING: 4,
  READING: 3,
  WRITING: 2,
  SPEAKING: 3,
};

type Form = {
  skill: Skill;
  section_no: number;
  title: string;
  content: string;
  audio_url: string;
  transcript: string;
  instructions: string;
  is_published: boolean;
};

const emptyForm: Form = {
  skill: "READING",
  section_no: 1,
  title: "",
  content: "",
  audio_url: "",
  transcript: "",
  instructions: "",
  is_published: false,
};

const toForm = (passage: Passage): Form => ({
  skill: passage.skill,
  section_no: passage.section_no,
  title: passage.title,
  content: passage.content,
  audio_url: passage.audio_url ?? "",
  transcript: passage.transcript ?? "",
  instructions: passage.instructions ?? "",
  is_published: passage.is_published,
});

export function SkillBadge({ skill }: { skill: Skill }) {
  const color = SKILL_COLOR[skill];
  return (
    <span className="inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-medium" style={{ backgroundColor: color.bg, color: color.fg }}>
      {SKILL_LABELS[skill]}
    </span>
  );
}

type Panel = { mode: "view"; passage: Passage } | { mode: "edit"; passage: Passage | null } | null;

export function PassageAdminContainer() {
  const [skill, setSkill] = useState<Skill | "ALL">("ALL");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [deleting, setDeleting] = useState<Passage | null>(null);

  const { data: passages, isLoading, isError } = usePassages();
  const { data: questions } = useQuestions();
  const createPassage = useCreatePassage();
  const updatePassage = useUpdatePassage();
  const deletePassage = useDeletePassage();
  const saving = createPassage.isPending || updatePassage.isPending;
  const saveError = createPassage.error ?? updatePassage.error;

  const questionsByPassage = useMemo(() => {
    const map = new Map<number, NonNullable<typeof questions>>();
    for (const question of questions ?? []) {
      if (question.passage_id === null) continue;
      map.set(question.passage_id, [...(map.get(question.passage_id) ?? []), question]);
    }
    return map;
  }, [questions]);

  const skillCounts = useMemo(
    () => Object.fromEntries(SKILLS.map((item) => [item, passages?.filter((passage) => passage.skill === item).length ?? 0])) as Record<Skill, number>,
    [passages]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (passages ?? []).filter((passage) => {
      if (skill !== "ALL" && passage.skill !== skill) return false;
      if (status === "published" && !passage.is_published) return false;
      if (status === "draft" && passage.is_published) return false;
      return !term || passage.title.toLowerCase().includes(term) || stripHtml(passage.content).toLowerCase().includes(term);
    });
  }, [passages, skill, status, search]);

  const openEdit = (passage: Passage | null) => {
    createPassage.reset();
    updatePassage.reset();
    setForm(passage ? toForm(passage) : emptyForm);
    setPanel({ mode: "edit", passage });
  };

  const changeSkill = (next: Skill) =>
    setForm((prev) => ({ ...prev, skill: next, section_no: Math.min(prev.section_no, MAX_SECTION[next]) }));

  const submit = async () => {
    if (panel?.mode !== "edit") return;
    const input: PassageInput = {
      skill: form.skill,
      section_no: form.section_no,
      title: form.title,
      content: form.content,
      image_url: panel.passage?.image_url ?? null,
      audio_url: form.audio_url || null,
      transcript: form.transcript || null,
      instructions: form.instructions || null,
      is_published: form.is_published,
    };
    try {
      const saved = panel.passage
        ? await updatePassage.mutateAsync({ id: panel.passage.id, input })
        : await createPassage.mutateAsync(input);
      setPanel(panel.passage && saved ? { mode: "view", passage: saved } : null);
    } catch {
      // Pesan dirender dari state mutation.
    }
  };

  const togglePublish = async (passage: Passage) => {
    const saved = await updatePassage.mutateAsync({ id: passage.id, input: { is_published: !passage.is_published } }).catch(() => null);
    if (saved && panel?.mode === "view") setPanel({ mode: "view", passage: saved });
  };

  const viewing = panel?.mode === "view" ? panel.passage : null;
  const linked = viewing ? questionsByPassage.get(viewing.id) ?? [] : [];

  return (
    <>
      <PageHeader
        title="Passages"
        description="Reading texts, listening audio and speaking prompts that questions are attached to."
        actions={
          <Button onClick={() => openEdit(null)}>
            <Plus size={16} /> New passage
          </Button>
        }
      />
      <PageBody>
        <div className="mb-4">
          <FilterChips
            label="Filter by skill"
            value={skill}
            onChange={setSkill}
            options={[
              { value: "ALL", label: "All skills", count: passages?.length ?? 0 },
              ...SKILLS.map((item) => ({ value: item, label: SKILL_LABELS[item], count: skillCounts[item] })),
            ]}
          />
        </div>

        <TableCard
          title="Passages"
          count={visible.length}
          toolbar={
            <>
              <select
                aria-label="Filter by status"
                value={status}
                onChange={(event) => setStatus(event.target.value as typeof status)}
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-[14px] text-slate-800 focus:border-primary-500 focus:outline-none"
              >
                <option value="all">Any status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <SearchInput value={search} onChange={setSearch} placeholder="Search title or text" label="Search passages" />
            </>
          }
        >
          {isLoading && (
            <p className="flex items-center gap-2 px-4 py-6 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Loading passages…
            </p>
          )}
          {isError && (
            <div className="p-4">
              <ErrorNotice>Couldn&apos;t load passages.</ErrorNotice>
            </div>
          )}
          {passages && visible.length === 0 && (
            <EmptyState
              icon={FileText}
              title={passages.length === 0 ? "No passages yet" : "No passages match"}
              text={passages.length === 0 ? "Add a reading text or listening script, then attach questions to it." : "Try another skill, status or search."}
            />
          )}
          {visible.length > 0 && (
            <Table minWidth={860}>
              <THead>
                <Th>Passage</Th>
                <Th className="w-[120px]">Skill</Th>
                <Th className="w-[90px]" align="center">
                  Section
                </Th>
                <Th className="w-[100px]" align="center">
                  Questions
                </Th>
                <Th className="w-[120px]">Status</Th>
                <Th className="w-[120px]">Updated</Th>
                <Th className="w-[88px]">
                  <span className="sr-only">Actions</span>
                </Th>
              </THead>
              <TBody>
                {visible.map((passage) => (
                  <Tr key={passage.id} onClick={() => setPanel({ mode: "view", passage })}>
                    <Td>
                      <p className="font-medium text-slate-900">{passage.title}</p>
                      <p className="line-clamp-1 max-w-[60ch] text-[13px] text-slate-500">{stripHtml(passage.content) || "No text yet"}</p>
                    </Td>
                    <Td>
                      <SkillBadge skill={passage.skill} />
                    </Td>
                    <Td align="center" className="tabular text-slate-700">
                      {passage.section_no}
                    </Td>
                    <Td align="center" className="tabular text-slate-700">
                      {questionsByPassage.get(passage.id)?.length ?? 0}
                    </Td>
                    <Td>
                      <StatusBadge published={passage.is_published} />
                    </Td>
                    <Td className="tabular text-slate-500">{formatDate(passage.updatedAt)}</Td>
                    <Td>
                      <span className="flex justify-end gap-1">
                        <IconAction label={`Edit ${passage.title}`} onClick={() => openEdit(passage)}>
                          <Pencil size={15} />
                        </IconAction>
                        <IconAction label={`Delete ${passage.title}`} tone="danger" onClick={() => setDeleting(passage)}>
                          <Trash2 size={15} />
                        </IconAction>
                      </span>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </TableCard>
      </PageBody>

      {/* Detail */}
      <Drawer
        open={viewing !== null}
        onClose={() => setPanel(null)}
        title={viewing?.title}
        subtitle={viewing && `${SKILL_LABELS[viewing.skill]} · Section ${viewing.section_no}`}
        width={640}
        footer={
          viewing && (
            <>
              <Button variant="ghost" className="mr-auto text-[#b12a41] hover:bg-[#fdeef1]" onClick={() => setDeleting(viewing)}>
                <Trash2 size={16} /> Delete
              </Button>
              <Button variant="outline" onClick={() => togglePublish(viewing)} disabled={updatePassage.isPending}>
                {viewing.is_published ? "Unpublish" : "Publish"}
              </Button>
              <Button onClick={() => openEdit(viewing)}>
                <Pencil size={16} /> Edit
              </Button>
            </>
          )
        }
      >
        {viewing && (
          <div className="space-y-5">
            <DetailList
              items={[
                { label: "Skill", value: <SkillBadge skill={viewing.skill} /> },
                { label: "Section", value: <span className="tabular">{viewing.section_no}</span> },
                { label: "Status", value: <StatusBadge published={viewing.is_published} /> },
                { label: "Questions", value: `${linked.length} attached` },
                { label: "Last updated", value: formatDate(viewing.updatedAt) },
              ]}
            />
            {viewing.instructions && (
              <Card title="Instructions" bodyClassName="text-[14px] text-slate-700">
                {viewing.instructions}
              </Card>
            )}
            {viewing.audio_url && (
              <Card title="Audio">
                <audio controls src={viewing.audio_url} className="w-full" />
                <p className="mt-2 truncate text-[12px] text-slate-500">{viewing.audio_url}</p>
              </Card>
            )}
            <Card title="Text as students see it">
              <div
                className="max-h-[360px] overflow-y-auto text-[14px] leading-relaxed text-slate-800 [&_h1]:text-[18px] [&_h1]:font-semibold [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: viewing.content }}
              />
            </Card>
            {viewing.transcript && (
              <Card title="Transcript" bodyClassName="max-h-[240px] overflow-y-auto whitespace-pre-line text-[14px] text-slate-700">
                {viewing.transcript}
              </Card>
            )}
            <Card title="Attached questions" description={linked.length ? undefined : "No questions use this passage yet."} bodyClassName={linked.length ? "p-0" : "hidden"}>
              <ol className="divide-y divide-slate-100">
                {linked.map((question, index) => (
                  <li key={question.id} className="flex items-start gap-3 px-5 py-3">
                    <span className="tabular w-5 shrink-0 pt-0.5 text-[12px] text-slate-400">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[14px] text-slate-900">{stripHtml(question.question_text)}</p>
                      <p className="mt-0.5 text-[12px] text-slate-500">{QUESTION_TYPE_LABELS[question.question_type]}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        )}
      </Drawer>

      {/* Buat / edit */}
      <Drawer
        open={panel?.mode === "edit"}
        onClose={() => setPanel(panel?.mode === "edit" && panel.passage ? { mode: "view", passage: panel.passage } : null)}
        title={panel?.mode === "edit" && panel.passage ? "Edit passage" : "New passage"}
        width={640}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPanel(null)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Save passage"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Skill" htmlFor="form-skill">
              <select id="form-skill" value={form.skill} onChange={(event) => changeSkill(event.target.value as Skill)} className={fieldClass}>
                {SKILLS.map((item) => (
                  <option key={item} value={item}>
                    {SKILL_LABELS[item]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Section" htmlFor="form-section" hint={`${SKILL_LABELS[form.skill]} GT has ${MAX_SECTION[form.skill]} sections.`}>
              <select
                id="form-section"
                value={form.section_no}
                onChange={(event) => setForm((prev) => ({ ...prev, section_no: Number(event.target.value) }))}
                className={fieldClass}
              >
                {Array.from({ length: MAX_SECTION[form.skill] }, (_unused, index) => index + 1).map((no) => (
                  <option key={no} value={no}>
                    Section {no}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Title" htmlFor="form-title">
            <input id="form-title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className={fieldClass} />
          </Field>
          <Field label="Content (HTML)" htmlFor="form-content" hint="Use <p>, <h2>, <ul> and <strong>. Students see it formatted.">
            <textarea
              id="form-content"
              rows={8}
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              className={cn(textareaClass, "font-mono text-[13px]")}
            />
          </Field>
          <Field label="Instructions (optional)" htmlFor="form-instructions" hint="e.g. Read the notice and answer questions 1–7.">
            <input
              id="form-instructions"
              value={form.instructions}
              onChange={(event) => setForm((prev) => ({ ...prev, instructions: event.target.value }))}
              className={fieldClass}
            />
          </Field>
          {form.skill === "LISTENING" && (
            <>
              <Field label="Audio URL" htmlFor="form-audio">
                <input id="form-audio" value={form.audio_url} onChange={(event) => setForm((prev) => ({ ...prev, audio_url: event.target.value }))} className={fieldClass} />
              </Field>
              <Field label="Transcript (optional)" htmlFor="form-transcript" hint="Shown after the test in the review.">
                <textarea
                  id="form-transcript"
                  rows={4}
                  value={form.transcript}
                  onChange={(event) => setForm((prev) => ({ ...prev, transcript: event.target.value }))}
                  className={textareaClass}
                />
              </Field>
            </>
          )}
          <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
            <span>
              <span className="block text-[14px] font-medium text-slate-900">Published</span>
              <span className="block text-[13px] text-slate-500">Drafts can be used while building a package but aren’t final.</span>
            </span>
            <Toggle checked={form.is_published} label="Published" onChange={(next) => setForm((prev) => ({ ...prev, is_published: next }))} />
          </label>
          {saveError && <ErrorNotice>{readErrorMessage(saveError, "Couldn't save the passage. Check your entries.")}</ErrorNotice>}
        </div>
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this passage?"
        message={
          <>
            <strong className="text-slate-900">{deleting?.title}</strong> will be deleted.
            {deleting && (questionsByPassage.get(deleting.id)?.length ?? 0) > 0 && (
              <> Its {questionsByPassage.get(deleting.id)?.length} questions stay in the question bank without a passage.</>
            )}
          </>
        }
        pending={deletePassage.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await deletePassage.mutateAsync(deleting.id).catch(() => undefined);
          if (panel?.mode === "view" && panel.passage.id === deleting.id) setPanel(null);
          setDeleting(null);
        }}
      />
    </>
  );
}
