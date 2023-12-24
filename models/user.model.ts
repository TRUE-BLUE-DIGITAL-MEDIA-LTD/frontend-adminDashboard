export interface User {
  id: string;
  createAt: string;
  updateAt: string;
  email: string;
  name: string;
  image: string; // Assuming this is a base64-encoded image string
  provider: string;
  role: "admin" | "editor";
  isDeleted: boolean;
  resetToken: string | null;
  resetTokenExpiresAt: string | null;
  IsResetPassword: boolean;
}
