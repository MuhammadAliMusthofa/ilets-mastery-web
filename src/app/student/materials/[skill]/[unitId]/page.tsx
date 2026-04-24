import { WrapperDotBackground } from "@/src/_global/components/Background/WrapperDotBackground";
import UnitDetailContainer from "@/src/features/student-dashboard/containers/UnitDetailContainer";
import { notFound } from "next/navigation";

export default async function UnitPage({
  params
}: {
  params: Promise<{ skill: string; unitId: string }>
}) {
  const resolvedParams = await params;
  const currentSkill = resolvedParams.skill.toLowerCase();
  const unitId = parseInt(resolvedParams.unitId, 10);

  // Validasi simpel kalau unitId bukan angka
  if (isNaN(unitId)) {
    notFound();
  }

  return (
    <WrapperDotBackground>
      <UnitDetailContainer skill={currentSkill} unitId={unitId} />
    </WrapperDotBackground>
  );
}