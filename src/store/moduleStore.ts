import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MODULE_PATHS, type ModuleKey } from "@/src/models/module";

interface ModuleState {
  activeModule: ModuleKey;
  setActiveModule: (key: ModuleKey) => void;
  modulePath: (key: ModuleKey) => string;
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set) => ({
      activeModule: "IELTS_GT",

      setActiveModule: (key) => set({ activeModule: key }),

      modulePath: (key) => MODULE_PATHS[key],
    }),
    {
      name: "module-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeModule: state.activeModule }),
    }
  )
);
