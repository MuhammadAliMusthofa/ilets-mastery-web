import type { Metadata } from "next";
import { LandingPage } from "@/src/features/landing/LandingPage";

export const metadata: Metadata = {
  title: { absolute: "IELTS Vibe — from foundations to your target band" },
  description: "IELTS General Training practice and mock tests for self-learners.",
};

export default function Page() {
  return <LandingPage />;
}
