"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { basicService } from "../services/basic.service";
import type { LevelKey, PlanInput } from "@/src/models/basic";

export const BASIC_QUERY_KEY = ["basic"] as const;

export const useCurriculum = () =>
  useQuery({ queryKey: [...BASIC_QUERY_KEY, "curriculum"], queryFn: basicService.curriculum });

export const useLesson = (id: number) =>
  useQuery({
    queryKey: [...BASIC_QUERY_KEY, "lesson", id],
    queryFn: () => basicService.lesson(id),
    enabled: Number.isFinite(id),
  });

export const useUnit = (id: number) =>
  useQuery({
    queryKey: [...BASIC_QUERY_KEY, "unit", id],
    queryFn: () => basicService.unit(id),
    enabled: Number.isFinite(id),
  });

export const useLevel = (key: LevelKey | null) =>
  useQuery({
    queryKey: [...BASIC_QUERY_KEY, "level", key],
    queryFn: () => basicService.level(key as LevelKey),
    enabled: key !== null,
  });

export const useBasicPlan = () => useQuery({ queryKey: [...BASIC_QUERY_KEY, "plan"], queryFn: basicService.plan });

export const usePlanPreview = () => useMutation({ mutationFn: (input: PlanInput) => basicService.preview(input) });

/** Setiap perubahan progres menyegarkan seluruh data Basic (plan, kurikulum, lesson) dan daftar module. */
const useInvalidateBasic = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: BASIC_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["modules"] });
  };
};

export const useCreatePlan = () => {
  const invalidate = useInvalidateBasic();
  return useMutation({ mutationFn: (input: PlanInput) => basicService.create(input), onSuccess: invalidate });
};

export const useArchivePlan = () => {
  const invalidate = useInvalidateBasic();
  return useMutation({ mutationFn: () => basicService.archive(), onSuccess: invalidate });
};

export const useReschedulePlan = () => {
  const invalidate = useInvalidateBasic();
  return useMutation({ mutationFn: () => basicService.reschedule(), onSuccess: invalidate });
};

export const useCompleteLesson = () => {
  const invalidate = useInvalidateBasic();
  return useMutation({ mutationFn: (id: number) => basicService.completeLesson(id), onSuccess: invalidate });
};

export const useCompleteTask = () => {
  const invalidate = useInvalidateBasic();
  return useMutation({ mutationFn: (id: number) => basicService.completeTask(id), onSuccess: invalidate });
};
