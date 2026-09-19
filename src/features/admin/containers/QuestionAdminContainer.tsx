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

// Pesan dari backend ditampilkan apa adanya: validator per tipe sudah
// menyebut persis apa yang salah, dan menyembunyikannya membuat admin
// menebak-nebak.
const readErrorMessage = (error: unknown): string => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? "Gagal menyimpan soal.";
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
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Bank Soal</h2>
          <p className="mt-1 text-slate-500">
            Soal IELTS General Training untuk keempat skill.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white"
        >
          <Plus size={18} /> Soal Baru
        </button>
      </div>

      <div className="mb-6">
        <label htmlFor="filter-skill" className="mr-2 text-sm font-medium text-slate-600">
          Filter skill
        </label>
        <select
          id="filter-skill"
          value={filterSkill}
          onChange={(event) => setFilterSkill(event.target.value as Skill | "")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Semua</option>
          {SKILLS.map((item) => (
            <option key={item} value={item}>
              {SKILL_LABELS[item]}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="form-skill" className="mb-1 block text-sm font-medium text-slate-700">
                Skill
              </label>
              <select
                id="form-skill"
                value={skill}
                onChange={(event) => setSkill(event.target.value as Skill)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {SKILLS.map((item) => (
                  <option key={item} value={item}>
                    {SKILL_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="form-type" className="mb-1 block text-sm font-medium text-slate-700">
                Tipe soal
              </label>
              <select
                id="form-type"
                value={draft.question_type}
                onChange={(event) => changeType(event.target.value as QuestionType)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {QUESTION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="form-difficulty"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Kesulitan
              </label>
              <select
                id="form-difficulty"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as Difficulty)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {DIFFICULTIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="form-passage" className="mb-1 block text-sm font-medium text-slate-700">
              Passage induk (opsional)
            </label>
            <select
              id="form-passage"
              value={passageId ?? ""}
              onChange={(event) =>
                setPassageId(event.target.value ? Number(event.target.value) : null)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Tanpa passage</option>
              {passages?.map((passage) => (
                <option key={passage.id} value={passage.id}>
                  {passage.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label htmlFor="form-text" className="mb-1 block text-sm font-medium text-slate-700">
              Teks pertanyaan
            </label>
            <textarea
              id="form-text"
              rows={3}
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-6">
            <QuestionTypeFields value={draft} onChange={setDraft} />
          </div>

          {createQuestion.isError && (
            <p className="mt-4 text-sm text-red-600">{readErrorMessage(createQuestion.error)}</p>
          )}

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createQuestion.isPending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-sm text-slate-500">Memuat soal…</p>}
      {isError && <p className="text-sm text-red-600">Gagal memuat soal.</p>}

      <div className="space-y-3">
        {questions?.map((item) => (
          <article
            key={item.id}
            className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {SKILL_LABELS[item.skill]}
                </span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                  {QUESTION_TYPE_LABELS[item.question_type]}
                </span>
                <span className="text-xs text-slate-400">{item.difficulty}</span>
              </div>
              <p className="text-slate-800">{item.question_text}</p>
            </div>

            <button
              type="button"
              aria-label={`Hapus soal ${item.id}`}
              onClick={() => deleteQuestion.mutate(item.id)}
              className="text-slate-400 hover:text-red-600"
            >
              <Trash2 size={18} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
