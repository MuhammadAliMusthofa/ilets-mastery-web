import Navbar from "@/src/_global/components/Navbar/Navbar";
import { ModuleSwitcher } from "@/src/features/shared/components/ModuleSwitcher";

export default function IeltsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleSwitcher />
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
