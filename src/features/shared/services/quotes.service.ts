import axiosInstance from "@/src/libs/axios";
import { API_ENDPOINTS } from "@/src/core/app";
import { localToday } from "@/src/models/basic";
import type { QuoteOfDay } from "@/src/models/admin-content";

interface ApiEnvelope<T> {
  status: string;
  data: T;
}

/** Kutipan hari ini menurut tanggal perangkat; null bila admin belum mengaktifkan kutipan. */
export const quoteOfDayService = {
  today: async (): Promise<QuoteOfDay | null> =>
    (
      await axiosInstance.get<ApiEnvelope<QuoteOfDay | null>>(API_ENDPOINTS.quotes.today, {
        params: { today: localToday() },
      })
    ).data.data,
};
