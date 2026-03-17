// src/features/auth/validations.ts
import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Format email belum bener nih!" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter bro." }),
});

// Export typenya juga biar gampang dipake di komponen
export type LoginFormValues = z.infer<typeof loginSchema>;