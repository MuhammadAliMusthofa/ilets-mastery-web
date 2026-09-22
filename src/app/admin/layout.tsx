import { AppShell } from "@/src/_global/components/Shell/AppShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppShell variant="admin">{children}</AppShell>;
}
