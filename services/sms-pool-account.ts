import axios from "axios";
import { parseCookies } from "nookies";
import { SmsPoolAccount } from "../models";

export type ResponseGetSmsPoolAccountsService = SmsPoolAccount[];
export async function GetSmsPoolAccountsService(): Promise<ResponseGetSmsPoolAccountsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const smsPool = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pool-accounts`,

      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return smsPool.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseSwitchSmsPoolAccountsService = SmsPoolAccount[];
export type RequestSwitchSmsPoolAccountsService = {
  smsPoolAccountId: string;
};
export async function SwitchSmsPoolAccountsService(
  input: RequestSwitchSmsPoolAccountsService,
): Promise<ResponseSwitchSmsPoolAccountsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const smsPool = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pool-accounts/${input.smsPoolAccountId}/switch`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return smsPool.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
