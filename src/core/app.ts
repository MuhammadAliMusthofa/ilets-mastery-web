export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    verifyOtp: "/auth/verify-otp",
    resendOtp: "/auth/resend-otp",
    logout: "/auth/logout",
  },
  modules: {
    list: "/modules",
    enroll: (key: string) => `/modules/${key}/enroll`,
  },
  admin: {
    passages: "/admin/passages",
    passage: (id: number) => `/admin/passages/${id}`,
    questions: "/admin/questions",
    question: (id: number) => `/admin/questions/${id}`,
    packages: "/admin/packages",
    package: (id: number) => `/admin/packages/${id}`,
    packageSections: (id: number) => `/admin/packages/${id}/sections`,
    packagePublish: (id: number) => `/admin/packages/${id}/publish`,
  },
  exam: {
    packages: "/ielts/packages",
    package: (id: number) => `/ielts/packages/${id}`,
    start: (packageId: number) => `/ielts/packages/${packageId}/attempts`,
    attempts: "/ielts/attempts",
    attempt: (id: number) => `/ielts/attempts/${id}`,
    answers: (id: number) => `/ielts/attempts/${id}/answers`,
    submit: (id: number) => `/ielts/attempts/${id}/submit`,
    result: (id: number) => `/ielts/attempts/${id}/result`,
  },
} as const;
