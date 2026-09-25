import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckpointContainer } from "@/src/features/basic/containers/ReviewContainers";
import { LEVEL_KEYS, type LevelKey } from "@/src/models/basic";

export const metadata: Metadata = { title: "Level checkpoint" };

export default async function CheckpointPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ task?: string }>;
}) {
  const [{ key }, { task }] = await Promise.all([params, searchParams]);
  const levelKey = key.toUpperCase();
  if (!LEVEL_KEYS.includes(levelKey as LevelKey)) notFound();
  return <CheckpointContainer key={levelKey} levelKey={levelKey as LevelKey} taskId={task ? Number(task) : null} />;
}
