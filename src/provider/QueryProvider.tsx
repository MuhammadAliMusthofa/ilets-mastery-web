"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Kita taruh QueryClient di dalam useState biar nggak ke-recreate terus 
  // tiap kali ada re-render di Next.js App Router. Ini best practice-nya!
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data dianggap "fresh" selama 1 menit, gak bakal fetch ulang walau ganti komponen
            refetchOnWindowFocus: false, // Biar pas user pindah tab Chrome terus balik lagi, gak auto-fetch API
            retry: 1, // Kalau gagal nge-fetch, coba ulang 1 kali aja
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}