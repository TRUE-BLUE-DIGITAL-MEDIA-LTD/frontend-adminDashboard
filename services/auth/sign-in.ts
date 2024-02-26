import axios from "axios";
import Error from "next/error";

interface ResponseSignInService {
  access_token: string;
  user: {
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
  };
}
export interface InputSignInService {
  email: string;
  password: string;
}
export async function signInService(
  input: InputSignInService,
): Promise<ResponseSignInService> {
  try {
    const signIn = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/sign-in`,
      {
        ...input,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return signIn.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
