import { parseCookies } from "nookies";
import { MessageOnSimcard } from "../../models";
import axios from "axios";

export type ResponseUpdateMessageOnSimcardService = MessageOnSimcard;

type InputUpdateMessageOnSimcardService = {
  query: {
    messageOnSimcardId: string;
  };
  body: {
    isRead?: boolean;
  };
};
export async function UpdateMessageOnSimcardService(
  input: InputUpdateMessageOnSimcardService,
): Promise<ResponseUpdateMessageOnSimcardService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const message = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/message-on-simcards`,
      data: {
        ...input,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return message.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
