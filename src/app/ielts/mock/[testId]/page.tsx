import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MockTestDetailContainer from "@/src/features/student-mock-test/containers/MockTestDetailContainer";

export const metadata: Metadata = { title: "Test details" };

interface DetailPageProps {
  params: Promise<{ testId: string }>;
}

export default async function MockTestDetailPage({ params }: DetailPageProps) {
  const { testId } = await params;

  if (!testId || !Number.isFinite(Number(testId))) {
    notFound();
  }

  return <MockTestDetailContainer testId={testId} />;
}
