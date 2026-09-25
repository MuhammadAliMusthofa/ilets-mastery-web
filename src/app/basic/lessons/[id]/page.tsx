import type { Metadata } from "next";
import { LessonContainer } from "@/src/features/basic/containers/LessonContainer";

export const metadata: Metadata = { title: "Lesson" };

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // key: pindah lesson memulai ulang kuis dan skornya.
  return <LessonContainer key={id} lessonId={Number(id)} />;
}
