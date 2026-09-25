import type { Metadata } from "next";
import { Suspense } from "react";
import MockSubmitReviewContainer from "@/src/features/student-mock-test/containers/MockSubmitReviewContainer";

export const metadata: Metadata = { title: "Review answers" };

export default function ExamReviewPage() {
  return (
    <Suspense fallback={null}>
      <MockSubmitReviewContainer />
    </Suspense>
  );
}
