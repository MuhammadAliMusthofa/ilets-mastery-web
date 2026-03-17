import Navbar from "@/src/_global/components/Navbar/Navbar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Navbar global lu nangkring di sini */}
      <Navbar />
      
      {/* Konten dashboard (Siswa/Guru) bakal muncul di dalam tag main ini */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}