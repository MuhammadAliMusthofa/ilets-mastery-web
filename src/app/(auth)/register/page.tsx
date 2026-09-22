import RegisterContainer from "@/src/features/auth/containers/RegisterContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create an IELTS Vibe account.",
};

export default function RegisterPage() {
  return <RegisterContainer />;
}
