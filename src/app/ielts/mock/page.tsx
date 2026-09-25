import type { Metadata } from "next";
import MockTestListContainer from "@/src/features/student-mock-test/containers/MockTestListContainers";

export const metadata: Metadata = { title: "Mock test" };

export default function MockTestListPage() {
  return <MockTestListContainer />;
}
