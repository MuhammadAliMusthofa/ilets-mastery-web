import type { Metadata } from "next";
import { BasicPathContainer } from "@/src/features/basic/containers/BasicPathContainer";

export const metadata: Metadata = { title: "English Basic to Hero" };

export default function BasicPage() {
  return <BasicPathContainer />;
}
