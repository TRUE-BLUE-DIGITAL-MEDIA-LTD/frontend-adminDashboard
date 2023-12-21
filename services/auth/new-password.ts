import axios from "axios";
import Error from "next/error";

interface InputNewPasswordService {
  id: string;
  createAt: string;
  updateAt: string;
  email: string;
  name: string;
  image: string; // Assuming this is a base64-encoded image string
  provider: string;
  role: string;
  isDeleted: boolean;
  resetToken: string | null;
  resetTokenExpiresAt: string | null;
  IsResetPassword: boolean;
}
interface InputNewPasswordService {
  userId: string;
  newPassword: string;
}

export async function NewPasswordService(input: InputNewPasswordService) {
  try {
    const resetPassword = await axios.put(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/new-password`,
      {
        ...input,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return resetPassword.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}
