export const MODULE_KEYS = ["BASIC", "IELTS_GT"] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export interface ModuleSummary {
  key: ModuleKey;
  name: string;
  description: string;
  enrolled: boolean;
  status: "ACTIVE" | "PAUSED" | null;
  started_at: string | null;
}

export const MODULE_PATHS: Record<ModuleKey, string> = {
  BASIC: "/basic",
  IELTS_GT: "/ielts",
};

export const MODULE_LABELS: Record<ModuleKey, string> = {
  BASIC: "English Basic to Hero",
  IELTS_GT: "IELTS General Training",
};
