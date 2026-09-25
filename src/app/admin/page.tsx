// app/admin/page.tsx
import AdminDashboardContainer from "@/src/features/admin/containers/AdminDashboardContainer";

export default function AdminOverviewPage() {
  return (
    // Kita panggil container-nya aja, gak pusingin sidebar lagi
    <AdminDashboardContainer /> 
  );
}