export interface User {
  id: string;
  createAt: string;
  updateAt: string;
  email: string;
  name: string;
  partnerId: string;
  image: string; // Assuming this is a base64-encoded image string
  provider: Provider;
  role: Role;
  isDeleted: boolean;
  resetToken: string | null;
  resetTokenExpiresAt: string | null;
  IsResetPassword: boolean;
}

export type Role = "partner" | "manager" | "admin" | "user";
export type Provider = "email";
