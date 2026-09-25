import type { Metadata } from "next";
import { Suspense } from "react";
import MockResultContainer from "@/src/features/student-mock-test/containers/MockResultContainer";

export const metadata: Metadata = { title: "Test result" };

export default function ExamResultPage() {
  return (
    <Suspense fallback={null}>
      <MockResultContainer />
    </Suspense>
  );
}
