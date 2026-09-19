"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { modulesService } from "../services/modules.service";
import type { ModuleKey } from "@/src/models/module";

export const MODULES_QUERY_KEY = ["modules"] as const;

export const useModules = () => {
  return useQuery({
    queryKey: MODULES_QUERY_KEY,
    queryFn: modulesService.list,
  });
};

export const useEnrollModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: ModuleKey) => modulesService.enroll(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
    },
  });
};
