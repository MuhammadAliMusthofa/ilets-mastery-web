import axiosInstance from "@/src/libs/axios";
import { API_ENDPOINTS } from "@/src/core/app";
import type {
  AdminCurriculum,
  AdminLesson,
  LessonInput,
  MoveDirection,
  Quote,
  QuoteInput,
  UnitInput,
} from "@/src/models/admin-content";
import type { LevelKey } from "@/src/models/basic";

interface ApiEnvelope<T> {
  status: string;
  data: T;
}

const unwrap = <T>(response: { data: ApiEnvelope<T> }): T => response.data.data;

const endpoints = API_ENDPOINTS.admin.basic;

export const basicAdminService = {
  curriculum: async (): Promise<AdminCurriculum> =>
    unwrap(await axiosInstance.get<ApiEnvelope<AdminCurriculum>>(endpoints.curriculum)),

  updateLevel: async (key: LevelKey, input: { name?: string; description?: string }) =>
    unwrap(await axiosInstance.patch<ApiEnvelope<{ key: LevelKey }>>(endpoints.level(key), input)),

  createUnit: async (input: UnitInput) =>
    unwrap(await axiosInstance.post<ApiEnvelope<{ id: number }>>(endpoints.units, input)),

  updateUnit: async (id: number, input: Partial<Omit<UnitInput, "level_key">>) =>
    unwrap(await axiosInstance.patch<ApiEnvelope<{ id: number }>>(endpoints.unit(id), input)),

  removeUnit: async (id: number) => unwrap(await axiosInstance.delete<ApiEnvelope<{ id: number }>>(endpoints.unit(id))),

  moveUnit: async (id: number, direction: MoveDirection) =>
    unwrap(await axiosInstance.post<ApiEnvelope<{ id: number }>>(endpoints.moveUnit(id), { direction })),

  lesson: async (id: number): Promise<AdminLesson> =>
    unwrap(await axiosInstance.get<ApiEnvelope<AdminLesson>>(endpoints.lesson(id))),

  createLesson: async (input: LessonInput): Promise<AdminLesson> =>
    unwrap(await axiosInstance.post<ApiEnvelope<AdminLesson>>(endpoints.lessons, input)),

  updateLesson: async (id: number, input: Partial<LessonInput>): Promise<AdminLesson> =>
    unwrap(await axiosInstance.patch<ApiEnvelope<AdminLesson>>(endpoints.lesson(id), input)),

  removeLesson: async (id: number) =>
    unwrap(await axiosInstance.delete<ApiEnvelope<{ id: number }>>(endpoints.lesson(id))),

  moveLesson: async (id: number, direction: MoveDirection) =>
    unwrap(await axiosInstance.post<ApiEnvelope<{ id: number }>>(endpoints.moveLesson(id), { direction })),
};

export const quotesAdminService = {
  list: async (): Promise<Quote[]> => unwrap(await axiosInstance.get<ApiEnvelope<Quote[]>>(API_ENDPOINTS.admin.quotes)),

  create: async (input: QuoteInput): Promise<Quote> =>
    unwrap(await axiosInstance.post<ApiEnvelope<Quote>>(API_ENDPOINTS.admin.quotes, input)),

  update: async (id: number, input: Partial<QuoteInput>): Promise<Quote> =>
    unwrap(await axiosInstance.patch<ApiEnvelope<Quote>>(API_ENDPOINTS.admin.quote(id), input)),

  remove: async (id: number) =>
    unwrap(await axiosInstance.delete<ApiEnvelope<{ id: number }>>(API_ENDPOINTS.admin.quote(id))),
};
