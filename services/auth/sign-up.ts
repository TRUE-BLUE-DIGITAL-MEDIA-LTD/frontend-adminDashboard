import axios from "axios";
import Error from "next/error";

interface ResponseSignUpService {
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
interface InputSignUpService {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}
export async function SignUpService(
  input: InputSignUpService,
): Promise<ResponseSignUpService> {
  try {
    const signUp = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/sign-up`,
      {
        ...input,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return signUp.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
