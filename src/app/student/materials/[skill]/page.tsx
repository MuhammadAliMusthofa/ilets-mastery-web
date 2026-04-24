import { WrapperDotBackground } from "@/src/_global/components/Background/WrapperDotBackground";
import SkillDetailContainer from "@/src/features/student-materials/containers/SkillDetailContainer";
import { notFound } from "next/navigation";

const VALID_SKILLS = ["listening", "reading", "writing", "speaking", "idioms", "vocab", "tenses", "teleprompter"];

// 1. Tambahin 'async' di depan function, dan ubah tipe params jadi Promise
export default async function SkillPage({ params }: { params: Promise<{ skill: string }> }) {

  // 2. Kita tungguin (await) params-nya kebongkar dulu
  const resolvedParams = await params;

  // 3. Baru deh kita ambil isinya dengan aman
  const currentSkill = resolvedParams.skill.toLowerCase();

  if (!VALID_SKILLS.includes(currentSkill)) {
    notFound();
  }

  return (
    <WrapperDotBackground>
      <SkillDetailContainer skill={currentSkill} />
    </WrapperDotBackground>
  )

}