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
} as const;
