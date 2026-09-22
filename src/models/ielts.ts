export const SKILLS = ["LISTENING", "READING", "WRITING", "SPEAKING"] as const;
export type Skill = (typeof SKILLS)[number];

export const QUESTION_TYPES = [
  "MULTIPLE_CHOICE",
  "MULTIPLE_CHOICE_COMPLEX",
  "TRUE_FALSE_NOT_GIVEN",
  "SHORT_ANSWER",
  "LONG_ESSAY",
  "MAP_LABELING",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  MULTIPLE_CHOICE_COMPLEX: "Multiple choice (more than one answer)",
  TRUE_FALSE_NOT_GIVEN: "True / False / Not Given",
  SHORT_ANSWER: "Short answer",
  LONG_ESSAY: "Essay (Writing task)",
  MAP_LABELING: "Map labelling",
};

export const SKILL_LABELS: Record<Skill, string> = {
  LISTENING: "Listening",
  READING: "Reading",
  WRITING: "Writing",
  SPEAKING: "Speaking",
};

export interface Passage {
  id: number;
  skill: Skill;
  section_no: number;
  title: string;
  content: string;
  image_url: string | null;
  audio_url: string | null;
  transcript: string | null;
  instructions: string | null;
  is_published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionAttachment {
  type: "audio" | "image";
  path: string;
}

export interface Question {
  id: number;
  passage_id: number | null;
  skill: Skill;
  question_type: QuestionType;
  question_text: string;
  column_answer: number | null;
  options: QuestionOption[];
  attachments: QuestionAttachment[];
  accepted_answers: string[][];
  explanation: string | null;
  difficulty: Difficulty;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackageSection {
  id: number;
  skill: Skill;
  order: number;
  duration_minutes: number;
  question_ids: number[];
}

export interface ExamPackage {
  id: number;
  title: string;
  description: string | null;
  package_type: "FULL" | "SECTION";
  is_published: boolean;
  sections: PackageSection[];
  total_items: number;
  createdAt: string;
  updatedAt: string;
}

export type PassageInput = Omit<Passage, "id" | "createdAt" | "updatedAt">;
export type QuestionInput = Omit<Question, "id" | "createdAt" | "updatedAt">;
export type SectionInput = { skill: Skill; duration_minutes?: number; question_ids: number[] };

// ---------------------------------------------------------------------------
// Sisi siswa: ujian
// ---------------------------------------------------------------------------

export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED";

/** Soal untuk siswa. Tidak pernah membawa kunci jawaban sebelum dikumpulkan. */
export interface StudentQuestion {
  id: number;
  number: number;
  audio_url: string | null;
  type_question_id: string;
  question_type: QuestionType;
  skill: Skill;
  marks: number;
  text: string;
  text_image?: string;
  question_text: string;
  column_answer?: number;
  Options: QuestionOption[];
  AttachmentQuestion: QuestionAttachment[];
}

export interface StudentSection {
  skill: Skill;
  duration_minutes: number;
  total_marks: number;
  question_ids: number[];
}

export interface StudentPackageSummary {
  id: number;
  title: string;
  description: string | null;
  package_type: "FULL" | "SECTION";
  skills: Skill[];
  total_marks: number;
  duration_minutes: number;
  last_attempt: {
    id: number;
    status: AttemptStatus;
    band_scores: Partial<Record<Skill, number | null>> | null;
    submitted_at: string | null;
  } | null;
}

export interface StudentPackageDetail extends StudentPackageSummary {
  sections: StudentSection[];
}

export interface AttemptSession {
  attempt_id: number;
  package: { id: number; title: string; package_type: "FULL" | "SECTION" };
  status: AttemptStatus;
  started_at: string;
  expires_at: string;
  server_time: string;
  sections: StudentSection[];
  questions: StudentQuestion[];
  answers: Record<number, string[]>;
}

export interface SectionResult {
  skill: Skill;
  raw: number;
  max: number;
  scaled_raw: number | null;
  band: number | null;
  auto_scored: boolean;
}

export interface ReviewedQuestion {
  id: number;
  number: number;
  skill: Skill;
  question_type: QuestionType;
  question_text: string;
  options: QuestionOption[];
  answer: string[];
  accepted_answers: string[][];
  is_correct: boolean | null;
  awarded: number;
  max_marks: number;
  explanation: string | null;
}

export interface AttemptResult {
  attempt_id: number;
  package: { id: number; title: string; package_type: "FULL" | "SECTION" };
  status: AttemptStatus;
  started_at: string;
  submitted_at: string | null;
  sections: SectionResult[];
  overall_band: number | null;
  questions: ReviewedQuestion[];
}

export interface AnswerInput {
  question_id: number;
  answer: string[];
}
