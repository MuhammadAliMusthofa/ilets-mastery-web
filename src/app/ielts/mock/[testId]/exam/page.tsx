import { Suspense } from "react";
import MockExamTestContainer from "@/src/features/student-mock-test/containers/MockExamTestContainer";

// Container membaca ?attempt= lewat useSearchParams, yang di Next wajib
// dibungkus Suspense agar halaman tetap bisa di-render.
export default function ExamPage() {
  return (
    <Suspense fallback={null}>
      <MockExamTestContainer />
    </Suspense>
  );
}
