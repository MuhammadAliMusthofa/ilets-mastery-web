import type { Metadata } from "next";
import { UnitReviewContainer } from "@/src/features/basic/containers/ReviewContainers";

export const metadata: Metadata = { title: "Unit review" };

export default async function UnitReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ task?: string }>;
}) {
  const [{ id }, { task }] = await Promise.all([params, searchParams]);
  return <UnitReviewContainer key={id} unitId={Number(id)} taskId={task ? Number(task) : null} />;
}
