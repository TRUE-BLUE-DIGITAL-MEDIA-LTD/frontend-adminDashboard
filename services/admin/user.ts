import axios from "axios";
import Error from "next/error";
import { parseCookies } from "nookies";
interface ResponseGetUser {
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
interface InputGetUser {
  access_token?: string;
}
export async function GetUser(input: InputGetUser): Promise<ResponseGetUser> {
  try {
    if (input?.access_token) {
      const user = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/get-me`,
        {
          headers: {
            Authorization: "Bearer " + input.access_token,
          },
        }
      );

      return user.data;
    } else {
      const cookies = parseCookies();
      const access_token = cookies.access_token;
      const user = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/get-me`,
        {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        }
      );

      return user.data;
    }
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}
