import axiosInstance from "@/src/libs/axios";
import { API_ENDPOINTS } from "@/src/core/app";
import type {
  Difficulty,
  ExamPackage,
  Passage,
  PassageInput,
  Question,
  QuestionInput,
  QuestionType,
  SectionInput,
  Skill,
} from "@/src/models/ielts";

interface ApiEnvelope<T> {
  status: string;
  data: T;
}

const unwrap = <T>(response: { data: ApiEnvelope<T> }): T => response.data.data;

export interface PassageFilter {
  skill?: Skill;
}

export interface QuestionFilter {
  skill?: Skill;
  question_type?: QuestionType;
  difficulty?: Difficulty;
  passage_id?: number;
}

export const ieltsAdminService = {
  passages: {
    list: async (filter: PassageFilter = {}): Promise<Passage[]> =>
      unwrap(
        await axiosInstance.get<ApiEnvelope<Passage[]>>(API_ENDPOINTS.admin.passages, {
          params: filter,
        })
      ),

    get: async (id: number): Promise<Passage> =>
      unwrap(await axiosInstance.get<ApiEnvelope<Passage>>(API_ENDPOINTS.admin.passage(id))),

    create: async (input: PassageInput): Promise<Passage> =>
      unwrap(await axiosInstance.post<ApiEnvelope<Passage>>(API_ENDPOINTS.admin.passages, input)),

    update: async (id: number, input: Partial<PassageInput>): Promise<Passage> =>
      unwrap(
        await axiosInstance.patch<ApiEnvelope<Passage>>(API_ENDPOINTS.admin.passage(id), input)
      ),

    remove: async (id: number): Promise<{ id: number }> =>
      unwrap(
        await axiosInstance.delete<ApiEnvelope<{ id: number }>>(API_ENDPOINTS.admin.passage(id))
      ),
  },

  questions: {
    list: async (filter: QuestionFilter = {}): Promise<Question[]> =>
      unwrap(
        await axiosInstance.get<ApiEnvelope<Question[]>>(API_ENDPOINTS.admin.questions, {
          params: filter,
        })
      ),

    get: async (id: number): Promise<Question> =>
      unwrap(await axiosInstance.get<ApiEnvelope<Question>>(API_ENDPOINTS.admin.question(id))),

    create: async (input: QuestionInput): Promise<Question> =>
      unwrap(
        await axiosInstance.post<ApiEnvelope<Question>>(API_ENDPOINTS.admin.questions, input)
      ),

    update: async (id: number, input: Partial<QuestionInput>): Promise<Question> =>
      unwrap(
        await axiosInstance.patch<ApiEnvelope<Question>>(API_ENDPOINTS.admin.question(id), input)
      ),

    remove: async (id: number): Promise<{ id: number }> =>
      unwrap(
        await axiosInstance.delete<ApiEnvelope<{ id: number }>>(API_ENDPOINTS.admin.question(id))
      ),
  },

  packages: {
    list: async (): Promise<ExamPackage[]> =>
      unwrap(await axiosInstance.get<ApiEnvelope<ExamPackage[]>>(API_ENDPOINTS.admin.packages)),

    get: async (id: number): Promise<ExamPackage> =>
      unwrap(await axiosInstance.get<ApiEnvelope<ExamPackage>>(API_ENDPOINTS.admin.package(id))),

    create: async (input: {
      title: string;
      description?: string | null;
      package_type?: "FULL" | "SECTION";
    }): Promise<ExamPackage> =>
      unwrap(
        await axiosInstance.post<ApiEnvelope<ExamPackage>>(API_ENDPOINTS.admin.packages, input)
      ),

    update: async (
      id: number,
      input: { title?: string; description?: string | null }
    ): Promise<ExamPackage> =>
      unwrap(
        await axiosInstance.patch<ApiEnvelope<ExamPackage>>(API_ENDPOINTS.admin.package(id), input)
      ),

    remove: async (id: number): Promise<{ id: number }> =>
      unwrap(
        await axiosInstance.delete<ApiEnvelope<{ id: number }>>(API_ENDPOINTS.admin.package(id))
      ),

    setSections: async (id: number, sections: SectionInput[]): Promise<ExamPackage> =>
      unwrap(
        await axiosInstance.put<ApiEnvelope<ExamPackage>>(
          API_ENDPOINTS.admin.packageSections(id),
          { sections }
        )
      ),

    publish: async (id: number, isPublished: boolean): Promise<ExamPackage> =>
      unwrap(
        await axiosInstance.post<ApiEnvelope<ExamPackage>>(
          API_ENDPOINTS.admin.packagePublish(id),
          { is_published: isPublished }
        )
      ),
  },
};
