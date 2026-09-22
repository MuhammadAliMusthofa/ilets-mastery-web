import axiosInstance from "@/src/libs/axios";
import { API_ENDPOINTS } from "@/src/core/app";
import {
  localToday,
  type CurriculumLevel,
  type LessonDetail,
  type LevelDetail,
  type LevelKey,
  type Plan,
  type PlanInput,
  type PlanPreview,
  type UnitDetail,
} from "@/src/models/basic";

interface ApiEnvelope<T> {
  status: string;
  data: T;
}

const unwrap = <T>(response: { data: ApiEnvelope<T> }): T => response.data.data;

export const basicService = {
  curriculum: async (): Promise<CurriculumLevel[]> =>
    unwrap(await axiosInstance.get<ApiEnvelope<CurriculumLevel[]>>(API_ENDPOINTS.basic.curriculum)),

  lesson: async (id: number): Promise<LessonDetail> =>
    unwrap(await axiosInstance.get<ApiEnvelope<LessonDetail>>(API_ENDPOINTS.basic.lesson(id))),

  completeLesson: async (id: number) =>
    unwrap(
      await axiosInstance.post<ApiEnvelope<{ lesson_id: number; completed: boolean }>>(API_ENDPOINTS.basic.completeLesson(id))
    ),

  unit: async (id: number): Promise<UnitDetail> =>
    unwrap(await axiosInstance.get<ApiEnvelope<UnitDetail>>(API_ENDPOINTS.basic.unit(id))),

  level: async (key: LevelKey): Promise<LevelDetail> =>
    unwrap(await axiosInstance.get<ApiEnvelope<LevelDetail>>(API_ENDPOINTS.basic.level(key))),

  // "today" dikirim dari perangkat supaya status terlambat/hari ini mengikuti zona waktu siswa.
  plan: async (): Promise<Plan | null> =>
    unwrap(await axiosInstance.get<ApiEnvelope<Plan | null>>(API_ENDPOINTS.basic.plan, { params: { today: localToday() } })),

  preview: async (input: PlanInput): Promise<PlanPreview> =>
    unwrap(await axiosInstance.post<ApiEnvelope<PlanPreview>>(API_ENDPOINTS.basic.planPreview, { ...input, today: localToday() })),

  create: async (input: PlanInput): Promise<Plan> =>
    unwrap(await axiosInstance.post<ApiEnvelope<Plan>>(API_ENDPOINTS.basic.plan, { ...input, today: localToday() })),

  archive: async () => unwrap(await axiosInstance.delete<ApiEnvelope<{ archived: number }>>(API_ENDPOINTS.basic.plan)),

  reschedule: async (): Promise<Plan> =>
    unwrap(await axiosInstance.post<ApiEnvelope<Plan>>(API_ENDPOINTS.basic.planReschedule, { today: localToday() })),

  completeTask: async (id: number): Promise<Plan> =>
    unwrap(await axiosInstance.post<ApiEnvelope<Plan>>(API_ENDPOINTS.basic.completeTask(id), { today: localToday() })),
};
