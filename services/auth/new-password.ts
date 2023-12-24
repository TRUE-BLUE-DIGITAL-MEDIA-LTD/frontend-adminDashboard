import axios from "axios";
import Error from "next/error";
import { User } from "../../models";

interface InputNewPasswordService {
  userId: string;
  newPassword: string;
}

export async function NewPasswordService(
  input: InputNewPasswordService
): Promise<User> {
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
