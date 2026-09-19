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
      <div>
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600"
        >
          <ArrowLeft size={16} /> Kembali ke daftar paket
        </button>

        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800">{selected.title}</h2>
            <p className="mt-1 text-slate-500">
              {selected.package_type} · {selected.total_items} soal ·{" "}
              {selected.is_published ? "Terbit" : "Draft"}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSectionsMutation.mutate({ id: selected.id, sections })}
              disabled={setSectionsMutation.isPending}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              Simpan susunan
            </button>
            <button
              type="button"
              onClick={() => publishPackage.mutate({ id: selected.id, isPublished: true })}
              disabled={publishPackage.isPending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Terbitkan
            </button>
          </div>
        </div>

        {publishPackage.isError && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {readErrorMessage(publishPackage.error, "Gagal menerbitkan paket.")}
          </p>
        )}
        {setSectionsMutation.isError && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {readErrorMessage(setSectionsMutation.error, "Gagal menyimpan susunan.")}
          </p>
        )}

        <div className="mb-6 flex gap-2">
          {SKILLS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => setActiveSkill(skill)}
              className={
                skill === activeSkill
                  ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white"
                  : "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
              }
            >
              {SKILL_LABELS[skill]}
              <span className="ml-2 text-xs opacity-70">
                {sections.find((section) => section.skill === skill)?.question_ids.length ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 font-bold text-slate-700">Soal tersedia</h3>
            <div className="space-y-2">
              {available?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-3"
                >
                  <p className="text-sm text-slate-700">{item.question_text}</p>
                  <button
                    type="button"
                    aria-label={`Tambahkan soal ${item.id}`}
                    onClick={() => addQuestion(item.id)}
                    className="ml-3 shrink-0 text-slate-400 hover:text-slate-900"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-bold text-slate-700">
              Isi section {SKILL_LABELS[activeSkill]}
            </h3>
            <div className="space-y-2">
              {currentSection?.question_ids.map((questionId, index) => (
                <div
                  key={questionId}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
                >
                  <span className="text-sm text-slate-700">
                    {index + 1}. Soal #{questionId}
                  </span>
                  <button
                    type="button"
                    aria-label={`Keluarkan soal ${questionId}`}
                    onClick={() => removeQuestion(questionId)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {!currentSection?.question_ids.length && (
                <p className="text-sm text-slate-400">Belum ada soal di section ini.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Paket Ujian</h2>
          <p className="mt-1 text-slate-500">
            Rakit soal menjadi simulasi IELTS General Training.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white"
        >
          <Plus size={18} /> Paket Baru
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="pkg-title" className="mb-1 block text-sm font-medium text-slate-700">
                Judul paket
              </label>
              <input
                id="pkg-title"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="pkg-type" className="mb-1 block text-sm font-medium text-slate-700">
                Jenis paket
              </label>
              <select
                id="pkg-type"
                value={newType}
                onChange={(event) => setNewType(event.target.value as "FULL" | "SECTION")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="FULL">Full test (4 skill)</option>
                <option value="SECTION">Satu section saja</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={createPackage.isPending}
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

      {isLoading && <p className="text-sm text-slate-500">Memuat paket…</p>}

      <div className="space-y-3">
        {packages?.map((item) => (
          <article
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">{item.title}</h3>
                <span
                  className={
                    item.is_published
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                      : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
                  }
                >
                  {item.is_published ? "Terbit" : "Draft"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{item.package_type}</p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedId(item.id)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
            >
              Susun isi {item.title}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
