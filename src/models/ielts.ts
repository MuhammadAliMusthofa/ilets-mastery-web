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
  MULTIPLE_CHOICE: "Pilihan Ganda",
  MULTIPLE_CHOICE_COMPLEX: "Pilihan Ganda (jawaban lebih dari satu)",
  TRUE_FALSE_NOT_GIVEN: "True / False / Not Given",
  SHORT_ANSWER: "Isian Singkat",
  LONG_ESSAY: "Esai (Writing Task)",
  MAP_LABELING: "Pelabelan Denah",
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
