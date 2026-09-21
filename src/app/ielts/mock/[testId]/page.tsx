import { notFound } from "next/navigation";
import MockTestDetailContainer from "@/src/features/student-mock-test/containers/MockTestDetailContainer";

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
