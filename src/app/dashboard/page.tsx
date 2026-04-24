"use function";
import { WrapperGridBackground } from "@/src/_global/components/Background/WrapperGridBackground";
import StudentContainer from "@/src/features/student-dashboard/containers/StudentContainer";

 // pakai "use client" ya kalau di file lu pakai ini


export default function DashboardPage() {
  return (
   <WrapperGridBackground>
        <StudentContainer />
    </WrapperGridBackground>
  
  );
}