import axios from "axios";
import Error from "next/error";
import { parseCookies } from "nookies";
import { User } from "../../models";
type ResponseGetUser = User;
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
        },
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
        },
      );

      return user.data;
    }
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

type ResponseSignInAsAnoterUserService = { access_token: string; user: User };
type RequestSignInAsAnoterUserService = { email: string };
export async function SignInAsAnoterUserService(
  input: RequestSignInAsAnoterUserService,
): Promise<ResponseSignInAsAnoterUserService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const user = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/sign-in-as-another-user`,
      params: {
        ...input,
      },
      responseType: "json",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });
    return user.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
