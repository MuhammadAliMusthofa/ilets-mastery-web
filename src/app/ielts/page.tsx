import type { Metadata } from "next";
import { IeltsOverviewContainer } from "@/src/features/shared/containers/WorkspaceContainers";

export const metadata: Metadata = { title: "IELTS General Training" };

export default function IeltsOverviewPage() {
  return <IeltsOverviewContainer />;
}
