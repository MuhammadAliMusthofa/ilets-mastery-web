import { redirect } from "next/navigation";

// Beranda siswa kini di /dashboard; rute lama diarahkan ke sana.
export default function StudentPage() {
  redirect("/dashboard");
}
