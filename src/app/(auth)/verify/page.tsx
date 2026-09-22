import VerifyOtpContainer from "@/src/features/auth/containers/VerifyOtpContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify account",
  description: "Verify your account with the PIN from your email.",
};

export default function VerifyPage() {
  return <VerifyOtpContainer />;
}
