import { Suspense } from "react";
import MockSubmitReviewContainer from "@/src/features/student-mock-test/containers/MockSubmitReviewContainer";

export default function ExamReviewPage() {
  return (
    <Suspense fallback={null}>
      <MockSubmitReviewContainer />
    </Suspense>
  );
}
