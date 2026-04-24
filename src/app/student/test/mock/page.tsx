import { WrapperDotBackground } from "@/src/_global/components/Background/WrapperDotBackground";
import MockTestListContainer from "@/src/features/student-mock-test/containers/MockTestListContainers";


export default function MockTestListPage() {
  return (
    // Kita bungkus pakai dot background biar UI-nya seragam dan premium
    <WrapperDotBackground>
      <MockTestListContainer />
    </WrapperDotBackground>
  );
}