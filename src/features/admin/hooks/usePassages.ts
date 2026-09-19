"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ieltsAdminService, type PassageFilter } from "../services/ielts-admin.service";
import type { PassageInput } from "@/src/models/ielts";

export const PASSAGES_QUERY_KEY = ["admin", "passages"] as const;

export const usePassages = (filter: PassageFilter = {}) => {
  return useQuery({
    queryKey: [...PASSAGES_QUERY_KEY, filter],
    queryFn: () => ieltsAdminService.passages.list(filter),
  });
};

export const useCreatePassage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PassageInput) => ieltsAdminService.passages.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PASSAGES_QUERY_KEY });
    },
  });
};

export const useUpdatePassage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<PassageInput> }) =>
      ieltsAdminService.passages.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PASSAGES_QUERY_KEY });
    },
  });
};

export const useDeletePassage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ieltsAdminService.passages.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PASSAGES_QUERY_KEY });
    },
  });
};
