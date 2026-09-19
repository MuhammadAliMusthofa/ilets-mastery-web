"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/src/libs/utils";
import { useModuleStore } from "@/src/store/moduleStore";
import { MODULE_KEYS, MODULE_LABELS, type ModuleKey } from "@/src/models/module";

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
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1" role="group">
      {MODULE_KEYS.map((key) => {
        const isActive = key === activeModule;

        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleSelect(key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            {MODULE_LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}
