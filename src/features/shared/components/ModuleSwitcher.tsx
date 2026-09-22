"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/src/libs/utils";
import { useModuleStore } from "@/src/store/moduleStore";
import { MODULE_KEYS, MODULE_LABELS, type ModuleKey } from "@/src/models/module";
import { MODULE_COLOR } from "@/src/_global/design/tokens";

/** Pengalih module: tab pill di atas lintasan abu-abu, seperti tab kategori monday. */
export function ModuleSwitcher() {
  const router = useRouter();
  const activeModule = useModuleStore((state) => state.activeModule);
  const setActiveModule = useModuleStore((state) => state.setActiveModule);
  const modulePath = useModuleStore((state) => state.modulePath);

  const handleSelect = (key: ModuleKey) => {
    setActiveModule(key);
    router.push(modulePath(key));
  };

  return (
    <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-slate-100 p-1.5" role="group" aria-label="Workspaces">
      {MODULE_KEYS.map((key) => {
        const isActive = key === activeModule;

        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleSelect(key)}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-[15px] transition-colors duration-200",
              isActive ? "bg-[#b9e3ff] font-medium text-slate-900" : "text-slate-700 hover:bg-white/70"
            )}
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: MODULE_COLOR[key].bg }}
              aria-hidden="true"
            />
            {MODULE_LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}
