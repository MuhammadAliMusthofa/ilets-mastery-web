import type { Metadata } from "next";
import { BasicCurriculumAdminContainer } from "@/src/features/admin/containers/BasicCurriculumAdminContainer";

export const metadata: Metadata = { title: "Basic English curriculum" };

export default function AdminBasicPage() {
  return <BasicCurriculumAdminContainer />;
}
