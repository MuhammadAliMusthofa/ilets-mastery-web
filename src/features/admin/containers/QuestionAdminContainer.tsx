"use client";

import { useMemo, useState } from "react";
import { Check, Database, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useQuestions, useCreateQuestion, useDeleteQuestion, useUpdateQuestion } from "../hooks/useQuestions";
import { usePassages } from "../hooks/usePassages";
import { QuestionTypeFields, blankDraftFor, type QuestionDraft } from "../components/QuestionTypeFields";
import {
  DIFFICULTIES,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  SKILLS,
  SKILL_LABELS,
  type Difficulty,
  type Question,
  type QuestionType,
  type Skill,
} from "@/src/models/ielts";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import {
  Badge,
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
  TBody,
  THead,
  Table,
  TableCard,
  Td,
  Th,
  Tr,
  readErrorMessage,
  stripHtml,
  type BadgeTone,
} from "../components/AdminUI";
import { SkillBadge } from "./PassageAdminContainer";
import { fieldClass, textareaClass } from "../components/fields";

const DIFFICULTY_LABEL: Record<Difficulty, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
const DIFFICULTY_TONE: Record<Difficulty, BadgeTone> = { EASY: "green", MEDIUM: "amber", HARD: "red" };

const TFNG_LABEL: Record<string, string> = { TRUE: "True", FALSE: "False", NOT_GIVEN: "Not given" };

/** Kunci jawaban dalam satu baris pendek untuk kolom tabel. */
export const answerSummary = (question: Pick<Question, "question_type" | "accepted_answers">): string => {
  const first = question.accepted_answers[0] ?? [];
  switch (question.question_type) {
    case "MULTIPLE_CHOICE":
    case "MULTIPLE_CHOICE_COMPLEX":
      return first.length ? first.join(", ") : "Not set";
    case "TRUE_FALSE_NOT_GIVEN":
      return first[0] ? TFNG_LABEL[first[0]] ?? first[0] : "Not set";
    case "SHORT_ANSWER":
    case "MAP_LABELING": {
      const blanks = question.accepted_answers.length;
      return blanks === 1 ? first.join(" / ") || "Not set" : `${blanks} blanks`;
    }
    case "LONG_ESSAY":
      return "Self-assessed";
  }
};

type Form = {
  skill: Skill;
  difficulty: Difficulty;
  passage_id: number | null;
  question_text: string;
  explanation: string;
  draft: QuestionDraft;
};

const emptyForm = (): Form => ({
  skill: "READING",
  difficulty: "MEDIUM",
  passage_id: null,
  question_text: "",
  explanation: "",
  draft: { question_type: "MULTIPLE_CHOICE", ...blankDraftFor("MULTIPLE_CHOICE") },
});

const toForm = (question: Question): Form => ({
  skill: question.skill,
  difficulty: question.difficulty,
  passage_id: question.passage_id,
  question_text: question.question_text,
  explanation: question.explanation ?? "",
  draft: {
    question_type: question.question_type,
    column_answer: question.column_answer,
    options: question.options,
    accepted_answers: question.accepted_answers,
    attachments: question.attachments,
  },
});

/** Kunci jawaban lengkap untuk panel detail. */
function AnswerKey({ question }: { question: Question }) {
  const correct = question.accepted_answers[0] ?? [];

  if (question.question_type === "LONG_ESSAY") {
    return <p className="text-[14px] text-slate-600">No answer key. Students assess their own writing against the band descriptors.</p>;
  }

  if (question.question_type === "MULTIPLE_CHOICE" || question.question_type === "MULTIPLE_CHOICE_COMPLEX") {
    return (
      <ul className="space-y-2">
        {question.options.map((option) => {
          const right = correct.includes(option.id);
          return (
            <li
              key={option.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 text-[14px]",
                right ? "border-[#00c875] bg-[#dcf7ea] text-slate-900" : "border-slate-200 text-slate-700"
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md text-[12px] font-semibold",
                  right ? "bg-[#00c875] text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {right ? <Check size={14} strokeWidth={3} /> : option.id}
              </span>
              <span dangerouslySetInnerHTML={{ __html: option.text }} />
            </li>
          );
        })}
      </ul>
    );
  }

  if (question.question_type === "TRUE_FALSE_NOT_GIVEN") {
    return (
      <div className="flex gap-2">
        {["TRUE", "FALSE", "NOT_GIVEN"].map((value) => (
          <Badge key={value} tone={correct.includes(value) ? "green" : "neutral"}>
            {correct.includes(value) && <Check size={12} strokeWidth={3} />}
            {TFNG_LABEL[value]}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <table className="w-full text-[14px]">
      <thead>
        <tr className="border-b border-slate-200 text-left text-[12px] uppercase tracking-[0.04em] text-slate-500">
          <th className="py-2 pr-3 font-medium">Blank</th>
          <th className="py-2 font-medium">Accepted answers</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {question.accepted_answers.map((variants, index) => (
          <tr key={index}>
            <td className="tabular py-2 pr-3 text-slate-500">{index + 1}</td>
            <td className="py-2">
              <span className="flex flex-wrap gap-1.5">
                {variants.length ? variants.map((variant) => <Badge key={variant}>{variant}</Badge>) : <span className="text-slate-400">Not set</span>}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type Panel = { mode: "view"; question: Question } | { mode: "edit"; question: Question | null } | null;

export function QuestionAdminContainer() {
  const [skill, setSkill] = useState<Skill | "ALL">("ALL");
  const [type, setType] = useState<QuestionType | "">("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [deleting, setDeleting] = useState<Question | null>(null);

  const { data: questions, isLoading, isError } = useQuestions();
  const { data: passages } = usePassages();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const saving = createQuestion.isPending || updateQuestion.isPending;
  const saveError = createQuestion.error ?? updateQuestion.error;

  const passageTitle = useMemo(() => new Map((passages ?? []).map((passage) => [passage.id, passage.title])), [passages]);

  const skillCounts = useMemo(
    () => Object.fromEntries(SKILLS.map((item) => [item, questions?.filter((question) => question.skill === item).length ?? 0])) as Record<Skill, number>,
    [questions]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (questions ?? []).filter((question) => {
      if (skill !== "ALL" && question.skill !== skill) return false;
      if (type && question.question_type !== type) return false;
      if (difficulty && question.difficulty !== difficulty) return false;
      return !term || stripHtml(question.question_text).toLowerCase().includes(term) || String(question.id) === term;
    });
  }, [questions, skill, type, difficulty, search]);

  const openEdit = (question: Question | null) => {
    createQuestion.reset();
    updateQuestion.reset();
    setForm(question ? toForm(question) : emptyForm());
    setPanel({ mode: "edit", question });
  };

  const submit = async () => {
    if (panel?.mode !== "edit") return;
    const input = {
      passage_id: form.passage_id,
      skill: form.skill,
      question_type: form.draft.question_type,
      question_text: form.question_text,
      column_answer: form.draft.column_answer,
      options: form.draft.options,
      attachments: form.draft.attachments,
      accepted_answers: form.draft.accepted_answers,
      explanation: form.explanation.trim() || null,
      difficulty: form.difficulty,
      tags: panel.question?.tags ?? [],
      order: panel.question?.order ?? 0,
    };
    try {
      const saved = panel.question
        ? await updateQuestion.mutateAsync({ id: panel.question.id, input })
        : await createQuestion.mutateAsync(input);
      setPanel(panel.question && saved ? { mode: "view", question: saved } : null);
    } catch {
      // Pesan dari backend dirender dari state mutation.
    }
  };

  const viewing = panel?.mode === "view" ? panel.question : null;
  const formPassages = (passages ?? []).filter((passage) => passage.skill === form.skill);

  return (
    <>
      <PageHeader
        title="Question bank"
        description="IELTS General Training questions for all four skills. Click a row to see the full question and answer key."
        actions={
          <Button onClick={() => openEdit(null)}>
            <Plus size={16} /> New question
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
              { value: "ALL", label: "All skills", count: questions?.length ?? 0 },
              ...SKILLS.map((item) => ({ value: item, label: SKILL_LABELS[item], count: skillCounts[item] })),
            ]}
          />
        </div>

        <TableCard
          title="Questions"
          count={visible.length}
          toolbar={
            <>
              <select
                aria-label="Filter by type"
                value={type}
                onChange={(event) => setType(event.target.value as QuestionType | "")}
                className="h-9 max-w-[200px] rounded-md border border-slate-300 bg-white px-2 text-[14px] text-slate-800 focus:border-primary-500 focus:outline-none"
              >
                <option value="">Any type</option>
                {QUESTION_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {QUESTION_TYPE_LABELS[item]}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by difficulty"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as Difficulty | "")}
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-[14px] text-slate-800 focus:border-primary-500 focus:outline-none"
              >
                <option value="">Any difficulty</option>
                {DIFFICULTIES.map((item) => (
                  <option key={item} value={item}>
                    {DIFFICULTY_LABEL[item]}
                  </option>
                ))}
              </select>
              <SearchInput value={search} onChange={setSearch} placeholder="Search text or ID" label="Search questions" />
            </>
          }
        >
          {isLoading && (
            <p className="flex items-center gap-2 px-4 py-6 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Loading questions…
            </p>
          )}
          {isError && (
            <div className="p-4">
              <ErrorNotice>Couldn&apos;t load questions.</ErrorNotice>
            </div>
          )}
          {questions && visible.length === 0 && (
            <EmptyState
              icon={Database}
              title={questions.length === 0 ? "The question bank is empty" : "No questions match"}
              text={questions.length === 0 ? "Add questions here, then put them into test packages." : "Try another skill, type, difficulty or search."}
            />
          )}
          {visible.length > 0 && (
            <Table minWidth={960}>
              <THead>
                <Th className="w-[64px]">ID</Th>
                <Th>Question</Th>
                <Th className="w-[120px]">Skill</Th>
                <Th className="w-[190px]">Type</Th>
                <Th className="w-[110px]">Difficulty</Th>
                <Th className="w-[130px]">Answer</Th>
                <Th className="w-[88px]">
                  <span className="sr-only">Actions</span>
                </Th>
              </THead>
              <TBody>
                {visible.map((item) => (
                  <Tr key={item.id} onClick={() => setPanel({ mode: "view", question: item })}>
                    <Td className="tabular text-slate-400">#{item.id}</Td>
                    <Td>
                      <p className="line-clamp-2 max-w-[56ch] text-slate-900" title={stripHtml(item.question_text)}>
                        {stripHtml(item.question_text)}
                      </p>
                      {item.passage_id !== null && (
                        <p className="mt-0.5 truncate text-[12px] text-slate-500">Passage: {passageTitle.get(item.passage_id) ?? `#${item.passage_id}`}</p>
                      )}
                    </Td>
                    <Td>
                      <SkillBadge skill={item.skill} />
                    </Td>
                    <Td className="text-slate-700">{QUESTION_TYPE_LABELS[item.question_type]}</Td>
                    <Td>
                      <Badge tone={DIFFICULTY_TONE[item.difficulty]}>{DIFFICULTY_LABEL[item.difficulty]}</Badge>
                    </Td>
                    <Td className="truncate text-slate-700">{answerSummary(item)}</Td>
                    <Td>
                      <span className="flex justify-end gap-1">
                        <IconAction label={`Edit question ${item.id}`} onClick={() => openEdit(item)}>
                          <Pencil size={15} />
                        </IconAction>
                        <IconAction label={`Delete question ${item.id}`} tone="danger" onClick={() => setDeleting(item)}>
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
        title={viewing ? `Question #${viewing.id}` : ""}
        subtitle={viewing && `${SKILL_LABELS[viewing.skill]} · ${QUESTION_TYPE_LABELS[viewing.question_type]}`}
        width={620}
        footer={
          viewing && (
            <>
              <Button variant="ghost" className="mr-auto text-[#b12a41] hover:bg-[#fdeef1]" onClick={() => setDeleting(viewing)}>
                <Trash2 size={16} /> Delete
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
            <div
              className="rounded-xl bg-slate-50 p-4 text-[15px] leading-relaxed text-slate-900 [&_p]:mb-2"
              dangerouslySetInnerHTML={{ __html: viewing.question_text }}
            />
            <DetailList
              items={[
                { label: "Skill", value: <SkillBadge skill={viewing.skill} /> },
                { label: "Type", value: QUESTION_TYPE_LABELS[viewing.question_type] },
                { label: "Difficulty", value: <Badge tone={DIFFICULTY_TONE[viewing.difficulty]}>{DIFFICULTY_LABEL[viewing.difficulty]}</Badge> },
                {
                  label: "Passage",
                  value: viewing.passage_id !== null ? passageTitle.get(viewing.passage_id) ?? `#${viewing.passage_id}` : <span className="text-slate-400">None</span>,
                },
                ...(viewing.tags.length
                  ? [{ label: "Tags", value: <span className="flex flex-wrap gap-1">{viewing.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</span> }]
                  : []),
              ]}
            />
            <Card title="Answer key">
              <AnswerKey question={viewing} />
            </Card>
            {viewing.explanation && (
              <Card title="Explanation" bodyClassName="text-[14px] leading-relaxed text-slate-700">
                {viewing.explanation}
              </Card>
            )}
            {viewing.attachments.length > 0 && (
              <Card title="Attachments">
                <ul className="space-y-3">
                  {viewing.attachments.map((attachment) => (
                    <li key={attachment.path}>
                      {attachment.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={attachment.path} alt="Question attachment" className="max-h-60 rounded-lg border border-slate-200" />
                      ) : (
                        <audio controls src={attachment.path} className="w-full" />
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* Buat / edit */}
      <Drawer
        open={panel?.mode === "edit"}
        onClose={() => setPanel(panel?.mode === "edit" && panel.question ? { mode: "view", question: panel.question } : null)}
        title={panel?.mode === "edit" && panel.question ? `Edit question #${panel.question.id}` : "New question"}
        width={640}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPanel(null)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Save question"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Skill" htmlFor="form-skill">
              <select
                id="form-skill"
                value={form.skill}
                onChange={(event) => setForm((prev) => ({ ...prev, skill: event.target.value as Skill, passage_id: null }))}
                className={fieldClass}
              >
                {SKILLS.map((item) => (
                  <option key={item} value={item}>
                    {SKILL_LABELS[item]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Question type" htmlFor="form-type">
              <select
                id="form-type"
                value={form.draft.question_type}
                onChange={(event) => {
                  const next = event.target.value as QuestionType;
                  setForm((prev) => ({ ...prev, draft: { question_type: next, ...blankDraftFor(next) } }));
                }}
                className={fieldClass}
              >
                {QUESTION_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {QUESTION_TYPE_LABELS[item]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Difficulty" htmlFor="form-difficulty">
              <select
                id="form-difficulty"
                value={form.difficulty}
                onChange={(event) => setForm((prev) => ({ ...prev, difficulty: event.target.value as Difficulty }))}
                className={fieldClass}
              >
                {DIFFICULTIES.map((item) => (
                  <option key={item} value={item}>
                    {DIFFICULTY_LABEL[item]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Parent passage (optional)" htmlFor="form-passage" hint={`Only ${SKILL_LABELS[form.skill]} passages are listed.`}>
            <select
              id="form-passage"
              value={form.passage_id ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, passage_id: event.target.value ? Number(event.target.value) : null }))}
              className={fieldClass}
            >
              <option value="">No passage</option>
              {formPassages.map((passage) => (
                <option key={passage.id} value={passage.id}>
                  Section {passage.section_no} · {passage.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Question text" htmlFor="form-text" hint="HTML is allowed, e.g. <strong>.">
            <textarea
              id="form-text"
              rows={3}
              value={form.question_text}
              onChange={(event) => setForm((prev) => ({ ...prev, question_text: event.target.value }))}
              className={textareaClass}
            />
          </Field>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="mb-3 text-[13px] font-medium text-slate-700">Answer key</p>
            <QuestionTypeFields
              key={`${panel?.mode === "edit" ? panel.question?.id ?? "new" : "none"}-${form.draft.question_type}`}
              value={form.draft}
              onChange={(draft) => setForm((prev) => ({ ...prev, draft }))}
            />
          </div>

          <Field label="Explanation (optional)" htmlFor="form-explanation" hint="Shown to students in the review after the test.">
            <textarea
              id="form-explanation"
              rows={2}
              value={form.explanation}
              onChange={(event) => setForm((prev) => ({ ...prev, explanation: event.target.value }))}
              className={textareaClass}
            />
          </Field>

          {saveError && <ErrorNotice>{readErrorMessage(saveError, "Couldn't save the question.")}</ErrorNotice>}
        </div>
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete question #${deleting?.id}?`}
        message={
          <>
            “{deleting && stripHtml(deleting.question_text).slice(0, 120)}” will be removed from the bank. Packages that use it lose this question, and students’ saved answers to it are deleted too.
          </>
        }
        pending={deleteQuestion.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await deleteQuestion.mutateAsync(deleting.id).catch(() => undefined);
          if (panel?.mode === "view" && panel.question.id === deleting.id) setPanel(null);
          setDeleting(null);
        }}
      />
    </>
  );
}
