"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ieltsAdminService } from "../services/ielts-admin.service";
import type { SectionInput } from "@/src/models/ielts";

export const PACKAGES_QUERY_KEY = ["admin", "packages"] as const;

export const usePackages = () => {
  return useQuery({
    queryKey: PACKAGES_QUERY_KEY,
    queryFn: ieltsAdminService.packages.list,
  });
};

export const usePackage = (id: number | null) => {
  return useQuery({
    queryKey: [...PACKAGES_QUERY_KEY, id],
    queryFn: () => ieltsAdminService.packages.get(id as number),
    enabled: id !== null,
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      title: string;
      description?: string | null;
      package_type?: "FULL" | "SECTION";
    }) => ieltsAdminService.packages.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
    },
  });
};

export const useSetSections = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, sections }: { id: number; sections: SectionInput[] }) =>
      ieltsAdminService.packages.setSections(id, sections),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
    },
  });
};

export const usePublishPackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) =>
      ieltsAdminService.packages.publish(id, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ieltsAdminService.packages.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
    },
  });
};
