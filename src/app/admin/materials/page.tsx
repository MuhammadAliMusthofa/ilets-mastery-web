import { redirect } from "next/navigation";

// Halaman lama berisi data contoh; materi Basic English kini dikelola di /admin/basic.
export default function StudyMaterialsPage() {
  redirect("/admin/basic");
}
