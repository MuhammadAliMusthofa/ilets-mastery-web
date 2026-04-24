import MockExamTestContainer from "@/src/features/student-mock-test/containers/MockExamTestContainer";

export default function ExamPage() {
  return (
    // NGGAK PERLU dibungkus WrapperDotBackground karena halaman ini 
    // butuh full-screen dan punya background layout-nya sendiri (putih/abu-abu).
    
    // Z-index tinggi biar nutupin elemen global kalau ada.
    <div className="relative z-[100] w-full h-screen bg-slate-50">
      <MockExamTestContainer />
    </div>
  );
}