"use client";

import Link from "next/link";
import { useModules, useEnrollModule } from "../hooks/useModules";
import { MODULE_PATHS } from "@/src/models/module";

export function ModuleHubContainer() {
  const { data: modules, isLoading, isError } = useModules();
  const enrollModule = useEnrollModule();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Memuat module…</p>;
  }

  if (isError || !modules) {
    return <p className="text-sm text-red-600">Gagal memuat daftar module.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {modules.map((module) => (
        <article key={module.key} className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">{module.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{module.description}</p>

          <div className="mt-4">
            {module.enrolled ? (
              <Link
                href={MODULE_PATHS[module.key]}
                className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Lanjut belajar
              </Link>
            ) : (
              <button
                type="button"
                disabled={enrollModule.isPending}
                onClick={() => enrollModule.mutate(module.key)}
                className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
              >
                Mulai module ini
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
