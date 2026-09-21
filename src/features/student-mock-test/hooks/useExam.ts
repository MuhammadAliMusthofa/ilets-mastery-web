"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examService } from "../services/exam.service";

export const EXAM_QUERY_KEY = ["exam"] as const;

export const useExamPackages = () =>
  useQuery({
    queryKey: [...EXAM_QUERY_KEY, "packages"],
    queryFn: examService.listPackages,
  });

export const useExamPackage = (id: number) =>
  useQuery({
    queryKey: [...EXAM_QUERY_KEY, "package", id],
    queryFn: () => examService.getPackage(id),
    enabled: Number.isFinite(id),
  });

export const useStartAttempt = () =>
  useMutation({
    mutationFn: (packageId: number) => examService.start(packageId),
  });

export const useAttemptSession = (attemptId: number) =>
  useQuery({
    queryKey: [...EXAM_QUERY_KEY, "session", attemptId],
    queryFn: () => examService.getSession(attemptId),
    enabled: Number.isFinite(attemptId),
    // Sesi ujian tidak boleh diambil ulang diam-diam: itu akan menimpa
    // jawaban lokal yang belum sempat tersimpan.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

export const useAttemptResult = (attemptId: number) =>
  useQuery({
    queryKey: [...EXAM_QUERY_KEY, "result", attemptId],
    queryFn: () => examService.getResult(attemptId),
    enabled: Number.isFinite(attemptId),
  });

export const useInvalidateExam = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEY });
};
