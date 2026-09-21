import axiosInstance from "@/src/libs/axios";
import { API_ENDPOINTS } from "@/src/core/app";
import type {
  AnswerInput,
  AttemptResult,
  AttemptSession,
  StudentPackageDetail,
  StudentPackageSummary,
} from "@/src/models/ielts";

interface ApiEnvelope<T> {
  status: string;
  data: T;
}

const unwrap = <T>(response: { data: ApiEnvelope<T> }): T => response.data.data;

export const examService = {
  listPackages: async (): Promise<StudentPackageSummary[]> =>
    unwrap(await axiosInstance.get<ApiEnvelope<StudentPackageSummary[]>>(API_ENDPOINTS.exam.packages)),

  getPackage: async (id: number): Promise<StudentPackageDetail> =>
    unwrap(await axiosInstance.get<ApiEnvelope<StudentPackageDetail>>(API_ENDPOINTS.exam.package(id))),

  start: async (packageId: number): Promise<AttemptSession> =>
    unwrap(await axiosInstance.post<ApiEnvelope<AttemptSession>>(API_ENDPOINTS.exam.start(packageId))),

  getSession: async (attemptId: number): Promise<AttemptSession> =>
    unwrap(await axiosInstance.get<ApiEnvelope<AttemptSession>>(API_ENDPOINTS.exam.attempt(attemptId))),

  saveAnswers: async (
    attemptId: number,
    answers: AnswerInput[]
  ): Promise<{ saved: number; server_time: string }> =>
    unwrap(
      await axiosInstance.put<ApiEnvelope<{ saved: number; server_time: string }>>(
        API_ENDPOINTS.exam.answers(attemptId),
        { answers }
      )
    ),

  submit: async (attemptId: number, answers: AnswerInput[]): Promise<AttemptResult> =>
    unwrap(
      await axiosInstance.post<ApiEnvelope<AttemptResult>>(API_ENDPOINTS.exam.submit(attemptId), {
        answers,
      })
    ),

  getResult: async (attemptId: number): Promise<AttemptResult> =>
    unwrap(await axiosInstance.get<ApiEnvelope<AttemptResult>>(API_ENDPOINTS.exam.result(attemptId))),
};
