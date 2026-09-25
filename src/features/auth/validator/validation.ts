// src/features/auth/validator/validation.ts
import * as z from "zod";

/*
 * Aturan pendaftaran. Password minimal 8 karakter dan wajib memuat huruf
 * besar, huruf kecil, dan angka. Semua input ditolak bila mengandung
 * karakter penyusun HTML (< > " ' ` &) supaya tidak ada markup yang ikut
 * tersimpan; React sudah meng-escape saat render, ini lapisan di input.
 */

export const HTML_CHARS = /[<>"'`&]/;

/** Nama orang: huruf (termasuk beraksen), spasi, tanda hubung, dan titik. */
export const NAME_PATTERN = /^[\p{L}\p{M} .'-]+$/u;

export const PASSWORD_MIN = 8;
// bcrypt hanya membaca 72 byte pertama; lebih dari itu menyesatkan.
export const PASSWORD_MAX = 72;

/** Syarat password yang ditampilkan sebagai checklist di form. */
export const PASSWORD_RULES = [
  { label: `At least ${PASSWORD_MIN} characters`, test: (value: string) => value.length >= PASSWORD_MIN },
  { label: "One uppercase letter (A–Z)", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One lowercase letter (a–z)", test: (value: string) => /[a-z]/.test(value) },
  { label: "One number (0–9)", test: (value: string) => /\d/.test(value) },
] as const;

const password = z
  .string()
  .min(PASSWORD_MIN, { message: `Password must be at least ${PASSWORD_MIN} characters.` })
  .max(PASSWORD_MAX, { message: `Password must be at most ${PASSWORD_MAX} characters.` })
  .regex(/[A-Z]/, { message: "Password must include an uppercase letter." })
  .regex(/[a-z]/, { message: "Password must include a lowercase letter." })
  .regex(/\d/, { message: "Password must include a number." })
  .refine((value) => !HTML_CHARS.test(value), {
    message: "Password can’t contain < > \" ' ` or &.",
  })
  .refine((value) => !/\s/.test(value), { message: "Password can’t contain spaces." });

const email = z
  .string()
  .trim()
  .max(160, { message: "Email is too long." })
  .email({ message: "Enter a valid email address." })
  .refine((value) => !HTML_CHARS.test(value), { message: "Email can’t contain < > \" ' ` or &." });

export const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address." }),
  password: z.string().min(1, { message: "Enter your password." }),
});

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(3, { message: "Name must be at least 3 characters." })
      .max(80, { message: "Name must be at most 80 characters." })
      .regex(NAME_PATTERN, { message: "Use letters only, plus spaces, hyphens or apostrophes." }),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
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
