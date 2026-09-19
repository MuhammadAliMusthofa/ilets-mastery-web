import { ModuleHubContainer } from "@/src/features/shared/containers/ModuleHubContainer";

export default function DashboardPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-2 text-slate-500">
        Pilih module yang mau kamu kerjakan hari ini.
      </p>

      <div className="mt-6">
        <ModuleHubContainer />
      </div>
    </section>
  );
}
