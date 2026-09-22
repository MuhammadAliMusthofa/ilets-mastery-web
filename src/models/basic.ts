export const LEVEL_KEYS = ["BEGINNER", "ELEMENTARY", "INTERMEDIATE", "ADVANCED"] as const;
export type LevelKey = (typeof LEVEL_KEYS)[number];

export type Pillar = "GRAMMAR" | "VOCABULARY" | "CONVERSATION" | "PRONUNCIATION";
export type PlanMode = "GUIDED" | "SCHEDULED";
export type TaskType = "LESSON" | "UNIT_REVIEW" | "LEVEL_CHECKPOINT";

export const LEVEL_LABELS: Record<LevelKey, string> = {
  BEGINNER: "Beginner",
  ELEMENTARY: "Elementary",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const PILLAR_LABELS: Record<Pillar, string> = {
  GRAMMAR: "Grammar",
  VOCABULARY: "Vocabulary",
  CONVERSATION: "Conversation",
  PRONUNCIATION: "Pronunciation",
};

/** Durasi path terjadwal dalam minggu; paling singkat satu bulan. */
export const DURATION_OPTIONS = [
  { weeks: 4, label: "1 month" },
  { weeks: 8, label: "2 months" },
  { weeks: 12, label: "3 months" },
] as const;

export const MIN_STUDY_DAYS = 3;

export interface LessonContent {
  goal: string;
  explanation: string[];
  examples: Array<{ en: string; note?: string }>;
  tip: string | null;
  check: Array<{ question: string; options: string[]; answer: number; why: string }>;
}

export interface CurriculumLesson {
  id: number;
  title: string;
  summary: string;
  estimated_minutes: number;
  completed: boolean;
}

export interface CurriculumUnit {
  id: number;
  pillar: Pillar;
  title: string;
  description: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumLevel {
  key: LevelKey;
  name: string;
  description: string;
  units: CurriculumUnit[];
}

export interface LessonDetail {
  id: number;
  title: string;
  summary: string;
  estimated_minutes: number;
  content: LessonContent;
  completed: boolean;
  unit: { id: number; title: string; pillar: Pillar };
  level: { key: LevelKey; name: string };
  previous_lesson_id: number | null;
  next_lesson_id: number | null;
}

export interface UnitDetail {
  id: number;
  title: string;
  pillar: Pillar;
  description: string;
  level: { key: LevelKey; name: string };
  lessons: Array<{ id: number; title: string; summary: string; content: LessonContent; completed: boolean }>;
}

export interface LevelDetail {
  key: LevelKey;
  name: string;
  description: string;
  units: UnitDetail[];
}

export interface PlanTask {
  id: number;
  order: number;
  task_type: TaskType;
  title: string;
  lesson_id: number | null;
  unit_id: number | null;
  unit_title: string | null;
  pillar: Pillar | null;
  level_key: LevelKey | null;
  scheduled_date: string | null;
  estimated_minutes: number;
  status: "PENDING" | "DONE";
  completed_at: string | null;
}

export interface Plan {
  id: number;
  mode: PlanMode;
  start_level: LevelKey | null;
  start_date: string | null;
  end_date: string | null;
  duration_weeks: number | null;
  study_days: number[] | null;
  created_at: string;
  stats: {
    total_tasks: number;
    done_tasks: number;
    percent: number;
    total_minutes: number;
    done_minutes: number;
    overdue_tasks: number;
    today_tasks: number;
  };
  next_task: PlanTask | null;
  tasks: PlanTask[];
}

export interface PlanInput {
  mode: PlanMode;
  start_level: LevelKey;
  start_date?: string;
  duration_weeks?: number;
  study_days?: number[];
}

export interface PlanSummary {
  total_tasks: number;
  total_lessons: number;
  total_minutes: number;
  study_day_count: number | null;
  average_minutes_per_day: number | null;
  max_minutes_per_day: number | null;
  end_date: string | null;
  intensity: "LIGHT" | "STEADY" | "INTENSIVE" | null;
}

export interface PlanPreview {
  mode: PlanMode;
  start_level: LevelKey;
  start_date: string | null;
  end_date: string | null;
  summary: PlanSummary;
  tasks: Array<Omit<PlanTask, "id" | "status" | "completed_at">>;
}

/** Tanggal lokal perangkat sebagai YYYY-MM-DD. */
export const localToday = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const formatDay = (
  date: string,
  options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }
) => new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", options);

/** Tautan tujuan sebuah tugas di path. */
export const taskHref = (task: Pick<PlanTask, "task_type" | "lesson_id" | "unit_id" | "level_key"> & { id?: number }) => {
  const suffix = task.id ? `?task=${task.id}` : "";
  if (task.task_type === "LESSON" && task.lesson_id) return `/basic/lessons/${task.lesson_id}`;
  if (task.task_type === "UNIT_REVIEW" && task.unit_id) return `/basic/units/${task.unit_id}/review${suffix}`;
  return `/basic/levels/${task.level_key ?? "BEGINNER"}/checkpoint${suffix}`;
};

/** Geser tanggal YYYY-MM-DD sejumlah hari, dalam waktu lokal. */
export const addDaysLocal = (date: string, days: number) => {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
};
