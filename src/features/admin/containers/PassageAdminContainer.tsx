"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { usePassages, useCreatePassage, useDeletePassage } from "../hooks/usePassages";
import { SKILLS, SKILL_LABELS, type Skill } from "@/src/models/ielts";

// Dibatasi mengikuti format GT supaya admin tidak bisa membuat Reading
// section 4 yang pasti ditolak backend.
const MAX_SECTION: Record<Skill, number> = {
  LISTENING: 4,
  READING: 3,
  WRITING: 2,
  SPEAKING: 3,
};

const emptyForm = {
  skill: "READING" as Skill,
  section_no: 1,
  title: "",
  content: "",
  audio_url: "",
  instructions: "",
};

export function PassageAdminContainer() {
  const [filterSkill, setFilterSkill] = useState<Skill | "">("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: passages, isLoading, isError } = usePassages(
    filterSkill ? { skill: filterSkill } : {}
  );
  const createPassage = useCreatePassage();
  const deletePassage = useDeletePassage();

  const handleSkillChange = (skill: Skill) => {
    setForm((prev) => ({
      ...prev,
      skill,
      section_no: Math.min(prev.section_no, MAX_SECTION[skill]),
    }));
  };

  const handleSubmit = async () => {
    try {
      await createPassage.mutateAsync({
        skill: form.skill,
        section_no: form.section_no,
        title: form.title,
        content: form.content,
        image_url: null,
        audio_url: form.audio_url || null,
        transcript: null,
        instructions: form.instructions || null,
        is_published: false,
      });

      setForm(emptyForm);
      setShowForm(false);
    } catch {
      // Pesan kesalahan dirender dari state mutation di bawah.
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Passage</h2>
          <p className="mt-1 text-slate-500">
            Teks bacaan dan audio yang menjadi induk soal.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white"
        >
          <Plus size={18} /> Passage Baru
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
          {SKILLS.map((skill) => (
            <option key={skill} value={skill}>
              {SKILL_LABELS[skill]}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="form-skill" className="mb-1 block text-sm font-medium text-slate-700">
                Skill
              </label>
              <select
                id="form-skill"
                value={form.skill}
                onChange={(event) => handleSkillChange(event.target.value as Skill)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {SKILLS.map((skill) => (
                  <option key={skill} value={skill}>
                    {SKILL_LABELS[skill]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="form-section"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Section
              </label>
              <select
                id="form-section"
                value={form.section_no}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, section_no: Number(event.target.value) }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {Array.from({ length: MAX_SECTION[form.skill] }, (_unused, index) => index + 1).map(
                  (no) => (
                    <option key={no} value={no}>
                      Section {no}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="form-title" className="mb-1 block text-sm font-medium text-slate-700">
              Judul
            </label>
            <input
              id="form-title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="form-content" className="mb-1 block text-sm font-medium text-slate-700">
              Isi (HTML)
            </label>
            <textarea
              id="form-content"
              rows={6}
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="form-audio" className="mb-1 block text-sm font-medium text-slate-700">
              URL audio (khusus Listening)
            </label>
            <input
              id="form-audio"
              value={form.audio_url}
              onChange={(event) => setForm((prev) => ({ ...prev, audio_url: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {createPassage.isError && (
            <p className="mt-4 text-sm text-red-600">
              Gagal menyimpan passage. Periksa kembali isian Anda.
            </p>
          )}

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createPassage.isPending}
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

      {isLoading && <p className="text-sm text-slate-500">Memuat passage…</p>}
      {isError && <p className="text-sm text-red-600">Gagal memuat passage.</p>}

      <div className="space-y-3">
        {passages?.map((passage) => (
          <article
            key={passage.id}
            className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-800">{passage.title}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {SKILL_LABELS[passage.skill]} · Section {passage.section_no}
                </span>
                <span
                  className={
                    passage.is_published
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                      : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
                  }
                >
                  {passage.is_published ? "Terbit" : "Draft"}
                </span>
              </div>
            </div>

            <button
              type="button"
              aria-label={`Hapus ${passage.title}`}
              onClick={() => deletePassage.mutate(passage.id)}
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
