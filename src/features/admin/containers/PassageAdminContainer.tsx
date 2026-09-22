"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { usePassages, useCreatePassage, useDeletePassage } from "../hooks/usePassages";
import { SKILLS, SKILL_LABELS, type Skill } from "@/src/models/ielts";
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
  StatusPill,
} from "@/src/_global/components/Board/Board";
import { SKILL_COLOR } from "@/src/_global/design/tokens";
import { fieldClass, formPanelClass, labelClass, textareaClass } from "../components/fields";

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

  const { data: passages, isLoading, isError } = usePassages(filterSkill ? { skill: filterSkill } : {});
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
    <>
      <PageHeader
        title="Passage"
        description="Reading texts and audio that questions are attached to."
        actions={
          <Button onClick={() => setShowForm((prev) => !prev)}>
            <Plus size={16} /> New passage
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
            {SKILLS.map((skill) => (
              <option key={skill} value={skill}>
                {SKILL_LABELS[skill]}
              </option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className={formPanelClass}>
            <h2 className="mb-5 text-[16px] font-medium text-slate-800">New passage</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="form-skill" className={labelClass}>
                  Skill
                </label>
                <select
                  id="form-skill"
                  value={form.skill}
                  onChange={(event) => handleSkillChange(event.target.value as Skill)}
                  className={fieldClass}
                >
                  {SKILLS.map((skill) => (
                    <option key={skill} value={skill}>
                      {SKILL_LABELS[skill]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="form-section" className={labelClass}>
                  Section
                </label>
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
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="form-title" className={labelClass}>
                Title
              </label>
              <input
                id="form-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className={fieldClass}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="form-content" className={labelClass}>
                Content (HTML)
              </label>
              <textarea
                id="form-content"
                rows={6}
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                className={cn(textareaClass, "font-mono")}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="form-audio" className={labelClass}>
                Audio URL (Listening only)
              </label>
              <input
                id="form-audio"
                value={form.audio_url}
                onChange={(event) => setForm((prev) => ({ ...prev, audio_url: event.target.value }))}
                className={fieldClass}
              />
            </div>

            {createPassage.isError && (
              <p role="alert" className="mt-4 text-[14px] text-[#b12a41]">
                Couldn't save the passage. Check your entries.
              </p>
            )}

            <div className="mt-6 flex gap-2">
              <Button onClick={handleSubmit} disabled={createPassage.isPending}>
                Save
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading && <p className="text-sm text-slate-500">Loading passages…</p>}
        {isError && <p className="text-sm text-[#b12a41]">Couldn't load passages.</p>}

        {passages && (
          <BoardGroup title="All passages" color="#784bd1" meta={`${passages.length} passages`}>
            <BoardTable>
              <BoardHead>
                <BoardHeadCell first align="left" className="w-[44%]">
                  Title
                </BoardHeadCell>
                <BoardHeadCell className="w-[140px]">Skill</BoardHeadCell>
                <BoardHeadCell className="w-[110px]">Section</BoardHeadCell>
                <BoardHeadCell className="w-[140px]">Status</BoardHeadCell>
                <BoardHeadCell className="w-[80px] rounded-tr-lg">
                  <span className="sr-only">Actions</span>
                </BoardHeadCell>
              </BoardHead>
              <BoardBody>
                {passages.map((passage, index) => (
                  <BoardRow key={passage.id}>
                    <BoardCell first last={index === passages.length - 1} align="left">
                      <span className="block truncate font-medium text-slate-800">{passage.title}</span>
                    </BoardCell>
                    <BoardCell flush>
                      <FillLabel color={SKILL_COLOR[passage.skill]}>{SKILL_LABELS[passage.skill]}</FillLabel>
                    </BoardCell>
                    <BoardCell className="tabular text-slate-700">{passage.section_no}</BoardCell>
                    <BoardCell flush>
                      <StatusPill tone={passage.is_published ? "done" : "working"}>
                        {passage.is_published ? "Published" : "Draft"}
                      </StatusPill>
                    </BoardCell>
                    <BoardCell>
                      <button
                        type="button"
                        aria-label={`Delete ${passage.title}`}
                        onClick={() => deletePassage.mutate(passage.id)}
                        className="flex size-8 items-center justify-center rounded-[4px] text-slate-500 hover:bg-[#fdeef1] hover:text-[#b12a41]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </BoardCell>
                  </BoardRow>
                ))}
                {passages.length === 0 && (
                  <BoardRow>
                    <BoardCell first last align="left" className="text-slate-500">
                      No passages yet.
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
