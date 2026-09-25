import type { CheckQuestion, LessonContent, LevelKey, Pillar } from "./basic";

// ---------------------------------------------------------------------------
// Kurikulum Basic English (sisi admin)
// ---------------------------------------------------------------------------

export type CheckType = CheckQuestion["type"];

export const CHECK_TYPE_LABELS: Record<CheckType, string> = {
  choice: "Multiple choice",
  type: "Type the answer",
  order: "Build the sentence",
  sort: "Sort into groups",
};

export interface AdminLessonSummary {
  id: number;
  title: string;
  summary: string;
  estimated_minutes: number;
  order: number;
  question_count: number;
  question_types: Record<CheckType, number>;
  completions: number;
}

export interface AdminUnitSummary {
  id: number;
  pillar: Pillar;
  title: string;
  description: string;
  order: number;
  lessons: AdminLessonSummary[];
}

export interface AdminLevelSummary {
  key: LevelKey;
  name: string;
  description: string;
  units: AdminUnitSummary[];
}

export interface AdminCurriculum {
  stats: { levels: number; units: number; lessons: number; questions: number; learners: number };
  levels: AdminLevelSummary[];
}

export interface AdminLesson {
  id: number;
  unit_id: number;
  title: string;
  summary: string;
  estimated_minutes: number;
  order: number;
  content: LessonContent;
  completions: number;
  unit: { id: number; title: string; pillar: Pillar };
  level: { key: LevelKey; name: string };
}

export interface UnitInput {
  level_key: LevelKey;
  pillar: Pillar;
  title: string;
  description: string;
}

export interface LessonInput {
  unit_id: number;
  title: string;
  summary: string;
  estimated_minutes: number;
  content: LessonContent;
}

export type MoveDirection = "up" | "down";

// ---------------------------------------------------------------------------
// Kutipan motivasi
// ---------------------------------------------------------------------------

export interface Quote {
  id: number;
  text: string;
  author: string;
  source: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteInput {
  text: string;
  author: string;
  source?: string | null;
  is_active?: boolean;
}

export interface QuoteOfDay {
  id: number;
  text: string;
  author: string;
  source: string | null;
  date: string;
}
