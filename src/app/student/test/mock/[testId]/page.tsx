
import { WrapperDotBackground } from "@/src/_global/components/Background/WrapperDotBackground";
import MockTestDetailContainer from "@/src/features/student-mock-test/containers/MockTestDetailContainer";
import { notFound } from "next/navigation";

// Tipe data untuk params di Next.js 15
interface DetailPageProps {
    params: Promise<{ testId: string }>;
}

export default async function MockTestDetailPage({ params }: DetailPageProps) {
    // Await params-nya dulu (Wajib di Next.js 15)
    const resolvedParams = await params;
    const testId = resolvedParams.testId;

    // Validasi simpel, kalau nggak ada testId, lempar ke halaman 404
    if (!testId) {
        notFound();
    }

    return (
        <WrapperDotBackground>
            {/* Passing testId ke dalam container biar bisa dirender di UI */}
            <MockTestDetailContainer testId={testId} />
        </WrapperDotBackground>
    );
}