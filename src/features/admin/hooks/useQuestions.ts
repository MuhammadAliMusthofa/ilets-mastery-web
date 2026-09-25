"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ieltsAdminService, type QuestionFilter } from "../services/ielts-admin.service";
import type { QuestionInput } from "@/src/models/ielts";

export const QUESTIONS_QUERY_KEY = ["admin", "questions"] as const;

export const useQuestions = (filter: QuestionFilter = {}) => {
  return useQuery({
    queryKey: [...QUESTIONS_QUERY_KEY, filter],
    queryFn: () => ieltsAdminService.questions.list(filter),
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: QuestionInput) => ieltsAdminService.questions.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<QuestionInput> }) =>
      ieltsAdminService.questions.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ieltsAdminService.questions.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
    },
  });
};
