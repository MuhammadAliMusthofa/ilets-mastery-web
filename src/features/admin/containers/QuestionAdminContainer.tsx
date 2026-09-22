"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useQuestions, useCreateQuestion, useDeleteQuestion } from "../hooks/useQuestions";
import { usePassages } from "../hooks/usePassages";
import {
  QuestionTypeFields,
  blankDraftFor,
  type QuestionDraft,
} from "../components/QuestionTypeFields";
import {
  DIFFICULTIES,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  SKILLS,
  SKILL_LABELS,
  type Difficulty,
  type QuestionType,
  type Skill,
} from "@/src/models/ielts";
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
  FillLabel,
} from "@/src/_global/components/Board/Board";
import { SKILL_COLOR, type LabelColor } from "@/src/_global/design/tokens";
import { fieldClass, formPanelClass, labelClass, textareaClass } from "../components/fields";

const DIFFICULTY_LABEL: Record<Difficulty, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

const DIFFICULTY_COLOR: Record<Difficulty, LabelColor> = {
  EASY: { bg: "#d7f5e6", fg: "#323338" },
  MEDIUM: { bg: "#fff0d4", fg: "#323338" },
  HARD: { bg: "#fbe1e8", fg: "#323338" },
};

// Pesan dari backend ditampilkan apa adanya: validator per tipe sudah
// menyebut persis apa yang salah, dan menyembunyikannya membuat admin
// menebak-nebak.
const readErrorMessage = (error: unknown): string => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? "Couldn't save the question.";
};

export function QuestionAdminContainer() {
  const [filterSkill, setFilterSkill] = useState<Skill | "">("");
  const [showForm, setShowForm] = useState(false);

  const [skill, setSkill] = useState<Skill>("READING");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [passageId, setPassageId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [draft, setDraft] = useState<QuestionDraft>({
    question_type: "MULTIPLE_CHOICE",
    ...blankDraftFor("MULTIPLE_CHOICE"),
  });

  const filter = filterSkill ? { skill: filterSkill } : {};
  const { data: questions, isLoading, isError } = useQuestions(filter);
  const { data: passages } = usePassages(skill ? { skill } : {});
  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const changeType = (nextType: QuestionType) => {
    setDraft({ question_type: nextType, ...blankDraftFor(nextType) });
  };

  const resetForm = () => {
    setQuestionText("");
    setPassageId(null);
    setDraft({ question_type: "MULTIPLE_CHOICE", ...blankDraftFor("MULTIPLE_CHOICE") });
  };

  const handleSubmit = async () => {
    try {
      await createQuestion.mutateAsync({
        passage_id: passageId,
        skill,
        question_type: draft.question_type,
        question_text: questionText,
        column_answer: draft.column_answer,
        options: draft.options,
        attachments: draft.attachments,
        accepted_answers: draft.accepted_answers,
        explanation: null,
        difficulty,
        tags: [],
        order: 0,
      });

      resetForm();
      setShowForm(false);
    } catch {
      // Pesan kesalahan dirender dari state mutation di bawah.
    }
  };

  return (
    <>
      <PageHeader
        title="Question bank"
        description="IELTS General Training questions for all four skills."
        actions={
          <Button onClick={() => setShowForm((prev) => !prev)}>
            <Plus size={16} /> New question
          </Button>
        }
      />
      <PageBody>
        <div className="mb-6 flex items-center gap-3">
          <label htmlFor="filter-skill" className="text-[14px] text-slate-700">
            Filter by skill
          </label>
          <select
            id="filter-skill"
            value={filterSkill}
            onChange={(event) => setFilterSkill(event.target.value as Skill | "")}
            className={cn(fieldClass, "w-auto min-w-[160px]")}
          >
            <option value="">All</option>
            {SKILLS.map((item) => (
              <option key={item} value={item}>
                {SKILL_LABELS[item]}
              </option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className={formPanelClass}>
            <h2 className="mb-5 text-[16px] font-medium text-slate-800">New question</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="form-skill" className={labelClass}>
                  Skill
                </label>
                <select
                  id="form-skill"
                  value={skill}
                  onChange={(event) => setSkill(event.target.value as Skill)}
                  className={fieldClass}
                >
                  {SKILLS.map((item) => (
                    <option key={item} value={item}>
                      {SKILL_LABELS[item]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="form-type" className={labelClass}>
                  Question type
                </label>
                <select
                  id="form-type"
                  value={draft.question_type}
                  onChange={(event) => changeType(event.target.value as QuestionType)}
                  className={fieldClass}
                >
                  {QUESTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {QUESTION_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="form-difficulty" className={labelClass}>
                  Difficulty
                </label>
                <select
                  id="form-difficulty"
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value as Difficulty)}
                  className={fieldClass}
                >
                  {DIFFICULTIES.map((item) => (
                    <option key={item} value={item}>
                      {DIFFICULTY_LABEL[item]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="form-passage" className={labelClass}>
                Parent passage (optional)
              </label>
              <select
                id="form-passage"
                value={passageId ?? ""}
                onChange={(event) => setPassageId(event.target.value ? Number(event.target.value) : null)}
                className={fieldClass}
              >
                <option value="">No passage</option>
                {passages?.map((passage) => (
                  <option key={passage.id} value={passage.id}>
                    {passage.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label htmlFor="form-text" className={labelClass}>
                Question text
              </label>
              <textarea
                id="form-text"
                rows={3}
                value={questionText}
                onChange={(event) => setQuestionText(event.target.value)}
                className={textareaClass}
              />
            </div>

            <div className="mt-6">
              <QuestionTypeFields value={draft} onChange={setDraft} />
            </div>

            {createQuestion.isError && (
              <p role="alert" className="mt-4 text-[14px] text-[#b12a41]">
                {readErrorMessage(createQuestion.error)}
              </p>
            )}

            <div className="mt-6 flex gap-2">
              <Button onClick={handleSubmit} disabled={createQuestion.isPending}>
                Save
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading && <p className="text-sm text-slate-500">Loading questions…</p>}
        {isError && <p className="text-sm text-[#b12a41]">Couldn't load questions.</p>}

        {questions && (
          <BoardGroup title="All questions" color="#0073ea" meta={`${questions.length} questions`}>
            <BoardTable>
              <BoardHead>
                <BoardHeadCell first align="left" className="w-[44%]">
                  Question
                </BoardHeadCell>
                <BoardHeadCell className="w-[130px]">Skill</BoardHeadCell>
                <BoardHeadCell className="w-[190px]">Type</BoardHeadCell>
                <BoardHeadCell className="w-[120px]">Difficulty</BoardHeadCell>
                <BoardHeadCell className="w-[80px] rounded-tr-lg">
                  <span className="sr-only">Actions</span>
                </BoardHeadCell>
              </BoardHead>
              <BoardBody>
                {questions.map((item, index) => (
                  <BoardRow key={item.id}>
                    <BoardCell first last={index === questions.length - 1} align="left">
                      <span className="block truncate text-slate-800" title={item.question_text}>
                        {item.question_text}
                      </span>
                    </BoardCell>
                    <BoardCell flush>
                      <FillLabel color={SKILL_COLOR[item.skill]}>{SKILL_LABELS[item.skill]}</FillLabel>
                    </BoardCell>
                    <BoardCell className="text-slate-700">{QUESTION_TYPE_LABELS[item.question_type]}</BoardCell>
                    <BoardCell flush>
                      <FillLabel color={DIFFICULTY_COLOR[item.difficulty]}>{DIFFICULTY_LABEL[item.difficulty]}</FillLabel>
                    </BoardCell>
                    <BoardCell>
                      <button
                        type="button"
                        aria-label={`Delete question ${item.id}`}
                        onClick={() => deleteQuestion.mutate(item.id)}
                        className="flex size-8 items-center justify-center rounded-[4px] text-slate-500 hover:bg-[#fdeef1] hover:text-[#b12a41]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </BoardCell>
                  </BoardRow>
                ))}
                {questions.length === 0 && (
                  <BoardRow>
                    <BoardCell first last align="left" className="text-slate-500">
                      No questions yet.
                    </BoardCell>
                    <BoardCell />
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
