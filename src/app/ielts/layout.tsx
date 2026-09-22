import { AppShell } from "@/src/_global/components/Shell/AppShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell variant="student">{children}</AppShell>;
}
