export const USER_ROLES = ["STUDENT", "ADMIN", "SUPER_ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  createdAt?: string;
  /** Belum dikirim backend; disediakan agar UI bisa menampilkannya saat nanti ada. */
  avatar?: string;
}

export const isAdminRole = (role: UserRole | undefined): boolean => {
  return role === "ADMIN" || role === "SUPER_ADMIN";
};
