import type { Skill } from "@/src/models/ielts";

/** Ringkasan format IELTS GT per skill, dipakai di beranda dan ringkasan IELTS. */
export const SKILL_STORY: Array<{ skill: Skill; label: string; href: string; format: string; focus: string }> = [
  {
    skill: "LISTENING",
    label: "Listening",
    href: "/student/materials/listening",
    format: "4 sections · 40 questions · 30 min",
    focus: "Everyday conversations, monologues, discussions and talks.",
  },
  {
    skill: "READING",
    label: "Reading",
    href: "/student/materials/reading",
    format: "3 sections · 40 questions · 60 min",
    focus: "Notices, workplace documents and one long text.",
  },
  {
    skill: "WRITING",
    label: "Writing",
    href: "/student/materials/writing",
    format: "2 tasks · 60 min",
    focus: "Task 1 is a letter, Task 2 is an essay.",
  },
  {
    skill: "SPEAKING",
    label: "Speaking",
    href: "/student/materials/speaking",
    format: "3 parts · 11–14 min",
    focus: "Introduction, a cue card, then a two-way discussion.",
  },
];
