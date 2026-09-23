"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { basicAdminService, quotesAdminService } from "../services/content-admin.service";
import { QUOTE_TODAY_KEY } from "@/src/features/shared/hooks/useQuoteOfDay";
import type { LessonInput, MoveDirection, QuoteInput, UnitInput } from "@/src/models/admin-content";
import type { LevelKey } from "@/src/models/basic";

export { useQuoteOfDay } from "@/src/features/shared/hooks/useQuoteOfDay";

export const BASIC_ADMIN_KEY = ["admin", "basic"] as const;
export const QUOTES_KEY = ["admin", "quotes"] as const;

/** Konten Basic juga dibaca sisi siswa; segarkan keduanya setelah admin mengubah sesuatu. */
const useInvalidateBasic = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: BASIC_ADMIN_KEY });
    queryClient.invalidateQueries({ queryKey: ["basic"] });
  };
};

export const useAdminCurriculum = () =>
  useQuery({ queryKey: [...BASIC_ADMIN_KEY, "curriculum"], queryFn: basicAdminService.curriculum });

export const useAdminLesson = (id: number | null) =>
  useQuery({
    queryKey: [...BASIC_ADMIN_KEY, "lesson", id],
    queryFn: () => basicAdminService.lesson(id as number),
    enabled: id !== null,
  });

export const useUpdateLevel = () => {
  const invalidate = useInvalidateBasic();
  return useMutation({
    mutationFn: ({ key, input }: { key: LevelKey; input: { name?: string; description?: string } }) =>
      basicAdminService.updateLevel(key, input),
    onSuccess: invalidate,
  });
};

export const useSaveUnit = () => {
  const invalidate = useInvalidateBasic();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | null; input: UnitInput }) =>
      // Level unit tidak bisa dipindah lewat edit; hanya isinya yang dikirim.
      id === null
        ? basicAdminService.createUnit(input)
        : basicAdminService.updateUnit(id, { pillar: input.pillar, title: input.title, description: input.description }),
    onSuccess: invalidate,
  });
};

export const useRemoveUnit = () => {
  const invalidate = useInvalidateBasic();
  return useMutation({ mutationFn: basicAdminService.removeUnit, onSuccess: invalidate });
};

export const useMoveUnit = () => {
  const invalidate = useInvalidateBasic();
  return useMutation({
    mutationFn: ({ id, direction }: { id: number; direction: MoveDirection }) => basicAdminService.moveUnit(id, direction),
    onSuccess: invalidate,
  });
};

export const useSaveLesson = () => {
  const invalidate = useInvalidateBasic();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | null; input: LessonInput }) =>
      id === null ? basicAdminService.createLesson(input) : basicAdminService.updateLesson(id, input),
    onSuccess: invalidate,
  });
};

export const useRemoveLesson = () => {
  const invalidate = useInvalidateBasic();
  return useMutation({ mutationFn: basicAdminService.removeLesson, onSuccess: invalidate });
};

export const useMoveLesson = () => {
  const invalidate = useInvalidateBasic();
  return useMutation({
    mutationFn: ({ id, direction }: { id: number; direction: MoveDirection }) => basicAdminService.moveLesson(id, direction),
    onSuccess: invalidate,
  });
};

// ---------------------------------------------------------------------------
// Kutipan
// ---------------------------------------------------------------------------

const useInvalidateQuotes = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: QUOTES_KEY });
    queryClient.invalidateQueries({ queryKey: QUOTE_TODAY_KEY });
  };
};

export const useQuotes = () => useQuery({ queryKey: QUOTES_KEY, queryFn: quotesAdminService.list });

export const useSaveQuote = () => {
  const invalidate = useInvalidateQuotes();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | null; input: QuoteInput }) =>
      id === null ? quotesAdminService.create(input) : quotesAdminService.update(id, input),
    onSuccess: invalidate,
  });
};

export const useToggleQuote = () => {
  const invalidate = useInvalidateQuotes();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => quotesAdminService.update(id, { is_active }),
    onSuccess: invalidate,
  });
};

export const useRemoveQuote = () => {
  const invalidate = useInvalidateQuotes();
  return useMutation({ mutationFn: quotesAdminService.remove, onSuccess: invalidate });
};
