import axios from "axios";
import Error from "next/error";
import { parseCookies } from "nookies";

export interface ResponseGetAllCategories {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description: string;
  background: string;
  isDeleted: boolean;
}
export async function GetAllCategories(): Promise<ResponseGetAllCategories[]> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const categories = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/category/get-all`,
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return categories.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
