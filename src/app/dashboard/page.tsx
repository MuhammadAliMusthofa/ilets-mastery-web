"use client";

import StudentContainer from "@/src/features/student-dashboard/containers/StudentContainer";


export default function DashboardPage() {
  // Nanti di sini kita bisa pasang logic buat ngecek role (Teacher vs Student)
  // Untuk sekarang, kita langsung tampilin Dashboard Siswa
  return <StudentContainer />;
}