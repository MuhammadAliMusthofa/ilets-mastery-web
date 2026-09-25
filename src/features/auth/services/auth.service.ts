import axiosInstance from "@/src/libs/axios";
import { LoginFormValues, RegisterFormValues } from "../validator/validation";

export const authService = {
  login: async (data: LoginFormValues) => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  register: async (data: Omit<RegisterFormValues, "confirmPassword">) => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  },

  verifyOtp: async (data: { email: string; otp: string }) => {
    const response = await axiosInstance.post("/auth/verify-otp", data);
    return response.data;
  },

  resendOtp: async (data: { email: string }) => {
    const response = await axiosInstance.post("/auth/resend-otp", data);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },
};
