import axiosInstance from "@/src/libs/axios";
import { API_ENDPOINTS } from "@/src/core/app";
import type { ModuleKey, ModuleSummary } from "@/src/models/module";

interface ApiEnvelope<T> {
  status: string;
  data: T;
}

export const modulesService = {
  list: async (): Promise<ModuleSummary[]> => {
    const response = await axiosInstance.get<ApiEnvelope<ModuleSummary[]>>(
      API_ENDPOINTS.modules.list
    );
    return response.data.data;
  },

  enroll: async (key: ModuleKey): Promise<ModuleSummary> => {
    const response = await axiosInstance.post<ApiEnvelope<ModuleSummary>>(
      API_ENDPOINTS.modules.enroll(key)
    );
    return response.data.data;
  },
};
