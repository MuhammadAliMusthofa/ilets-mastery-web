import type { Metadata } from "next";
import { PathSetupContainer } from "@/src/features/basic/containers/PathSetupContainer";

export const metadata: Metadata = { title: "Build your learning path" };

export default function PathSetupPage() {
  return <PathSetupContainer />;
}
