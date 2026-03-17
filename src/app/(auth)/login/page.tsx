// src/app/(auth)/login/page.tsx

import LoginContainer from "@/src/features/auth/containers/LoginContainer";

export const metadata = {
  title: "Login | IELTS Platform",
  description: "Masuk ke platform ujian IELTS",
};

export default function LoginPage() {
  return <LoginContainer />;
}