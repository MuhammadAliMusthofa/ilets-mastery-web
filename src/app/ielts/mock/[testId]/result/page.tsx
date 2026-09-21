import { Suspense } from "react";
import MockResultContainer from "@/src/features/student-mock-test/containers/MockResultContainer";

export default function ExamResultPage() {
  return (
    <Suspense fallback={null}>
      <MockResultContainer />
    </Suspense>
  );
}
