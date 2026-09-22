// src/features/auth/validator/validation.ts
import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const registerSchema = z.object({
  full_name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

// Export typenya juga biar gampang dipake di komponen
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  otp: z.string().length(6, { message: "The PIN must be 6 digits." }),
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;