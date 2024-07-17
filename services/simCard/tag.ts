import axios from "axios";
import { parseCookies } from "nookies";
import { DeviceUser, TagOnSimcard } from "../../models";

export type ResponseCreateTagOnSimcardService = TagOnSimcard;
export type RequestCreateTagOnSimcardService = {
  simCardId: string;
  tag: string;
  icon: string;
};
export async function CreateTagOnSimcardService(
  input: RequestCreateTagOnSimcardService,
): Promise<ResponseCreateTagOnSimcardService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const tag = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/tag-simcards`,
      data: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return tag.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseDeleteTagOnSimcardService = TagOnSimcard;
export type RequestDeleteTagOnSimcardService = {
  tagOnSimCardId: string;
};
export async function DeleteTagOnSimcardService(
  input: RequestDeleteTagOnSimcardService,
): Promise<ResponseDeleteTagOnSimcardService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const tag = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/tag-simcards/${input.tagOnSimCardId}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return tag.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
