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
  TOTPsecret: string | null;
  TOTPenable: boolean;
  TOTPhashRecovery: string | null;
  TOTPexpireAt: string | null;
  TOTPurl?: string | null;
}

export type Role = "partner" | "manager" | "admin" | "user";
export type Provider = "email";
