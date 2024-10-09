import axios from "axios";
import Error from "next/error";
import { User } from "../../models";

interface ResponseSignInService {
  access_token: string;
  user: User;
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
