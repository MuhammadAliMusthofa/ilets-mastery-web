import type { Metadata } from "next";
import { DashboardContainer } from "@/src/features/shared/containers/DashboardContainer";

export const metadata: Metadata = { title: "Home" };

export default function DashboardPage() {
  return <DashboardContainer />;
}
