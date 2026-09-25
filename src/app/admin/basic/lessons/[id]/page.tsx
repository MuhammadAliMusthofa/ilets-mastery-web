import type { Metadata } from "next";
import { LessonEditorContainer } from "@/src/features/admin/containers/LessonEditorContainer";

export const metadata: Metadata = { title: "Edit lesson" };

/** /admin/basic/lessons/new?unit=12 membuat lesson baru di unit tersebut. */
export default async function AdminLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ unit?: string }>;
}) {
  const { id } = await params;
  const { unit } = await searchParams;
  const lessonId = id === "new" ? null : Number(id);
  return <LessonEditorContainer key={id} lessonId={lessonId} unitId={unit ? Number(unit) : undefined} />;
}
