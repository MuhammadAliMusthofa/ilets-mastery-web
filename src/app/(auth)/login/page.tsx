// src/app/(auth)/login/page.tsx

import LoginContainer from "@/src/features/auth/containers/LoginContainer";

export const metadata = {
  title: "Sign in",
  description: "Sign in to IELTS Vibe.",
};

export default function LoginPage() {
  return <LoginContainer />;
}