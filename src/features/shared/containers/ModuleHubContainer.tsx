"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModules, useEnrollModule } from "../hooks/useModules";
import { MODULE_PATHS, type ModuleKey } from "@/src/models/module";
import { MODULE_TINT, STATUS_COLOR } from "@/src/_global/design/tokens";
import { Canvas, CharacterTile, Chip, PillLink } from "@/src/_global/components/Showcase/Showcase";

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;

const LEVELS = ["Beginner", "Elementary", "Intermediate", "Advanced"];

/** Visual khas tiap module di sudut kartu. */
function ModuleVisual({ moduleKey }: { moduleKey: ModuleKey }) {
  if (moduleKey === "IELTS_GT") {
    return (
      <div className="flex items-end -space-x-3" aria-hidden="true">
        {(["LISTENING", "READING", "WRITING", "SPEAKING"] as const).map((skill) => (
          <CharacterTile key={skill} skill={skill} size={64} className="rounded-2xl ring-4 ring-[#e1ecff]" />
        ))}
      </div>
    );
  }

  // Tangga jenjang: empat anak tangga naik dari Beginner ke Advanced.
  return (
    <div className="flex items-end gap-1.5" aria-hidden="true">
      {LEVELS.map((level, index) => (
        <span
          key={level}
          className="flex w-[74px] items-start justify-center rounded-t-2xl bg-white/80 pt-2 text-[11px] font-medium text-slate-700"
          style={{ height: 34 + index * 18 }}
        >
          {level}
        </span>
      ))}
    </div>
  );
}

/** Dua kartu module besar: status keikutsertaan dan pintu masuknya. */
export function ModuleHubContainer() {
  const { data: modules, isLoading, isError } = useModules();
  const enrollModule = useEnrollModule();

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-[15px] text-slate-500">
        <Loader2 size={16} className="animate-spin" /> Loading modules…
      </p>
    );
  }

  if (isError || !modules) {
    return <p className="text-[15px] text-[#b12a41]">Couldn't load the modules. Reload the page to try again.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {modules.map((module) => {
        const since = formatDate(module.started_at);
        return (
          <Canvas
            key={module.key}
            as="article"
            tint={MODULE_TINT[module.key]}
            className="flex min-h-[360px] flex-col p-7 sm:p-9"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Chip color={module.enrolled ? STATUS_COLOR.done : { bg: "#ffffff", fg: "#323338" }}>
                {module.enrolled ? "Active" : "Not started"}
              </Chip>
              {since && <span className="text-[13px] text-slate-600">since {since}</span>}
            </div>

            <h3 className="mt-5 max-w-[18ch] font-display text-[28px] font-normal leading-[1.15] text-slate-900 sm:text-[32px]">
              {module.name}
            </h3>
            <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-slate-700">{module.description}</p>

            <div className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-8">
              {module.enrolled ? (
                <PillLink href={MODULE_PATHS[module.key]}>Continue learning</PillLink>
              ) : (
                <Button
                  variant="dark"
                  shape="pill"
                  disabled={enrollModule.isPending}
                  onClick={() => enrollModule.mutate(module.key)}
                >
                  Start this module
                </Button>
              )}
              <ModuleVisual moduleKey={module.key} />
            </div>
          </Canvas>
        );
      })}
    </div>
  );
}
