import { parseCookies } from "nookies";
import { SmsDaisy, SmsDaisyAccount, SmsDaisyMessage } from "../models";
import axios from "axios";

export type ResponseCreateSmsDaisyService = SmsDaisy;
export type RequestCreateSmsDaisyService = {
  service: string;
  areas?: string[];
  carriers?: ("tmo" | "vz" | "att")[];
};
export async function CreateSmsDaisyService(
  request: RequestCreateSmsDaisyService,
): Promise<ResponseCreateSmsDaisyService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-daisys`,
      data: request,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pinverify.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseResendSmsDaisyService = SmsDaisy;
export type RequestResendSmsDaisyService = {
  smsDaisyId: string;
};
export async function ResendSmsDaisyService(
  request: RequestResendSmsDaisyService,
): Promise<ResponseResendSmsDaisyService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-daisys/reused`,
      data: request,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pinverify.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetSmsDaisyService = {
  data: (SmsDaisy & { messages: SmsDaisyMessage[] })[];
  totalUsage: number;
  limit: number;
  balance: number;
};

export async function GetSmsDaisyService(): Promise<ResponseGetSmsDaisyService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-daisys`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pinverify.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetHistorySmsDaisyService = {
  data: SmsDaisy[];
  totalPage: number;
};
export type RequestGetHistorySmsDaisyService = {
  page: number;
  limit: number;
};
export async function GetHistorySmsDaisyService(
  request: RequestGetHistorySmsDaisyService,
): Promise<ResponseGetHistorySmsDaisyService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-daisys/history`,
      params: request,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pinverify.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCancelSmsDaisyService = SmsDaisy;
export type RequestCancelSmsDaisyService = {
  smsDaisyId: string;
};
export async function CancelSmsDaisyService(
  request: RequestCancelSmsDaisyService,
): Promise<ResponseCancelSmsDaisyService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-daisys/${request.smsDaisyId}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pinverify.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetSmsDaisyAccountsService = SmsDaisyAccount[];

export async function GetSmsDaisyAccountsService(): Promise<ResponseGetSmsDaisyAccountsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-daisy-accounts`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pinverify.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseUpdateSmsDaisyAccountsService = SmsDaisyAccount;
export type RequestUpdateSmsDaisyAccountsService = {
  query: {
    id: string;
  };
  body: {
    isActive?: boolean;
    apiKey?: string;
  };
};
export async function UpdateSmsDaisyAccountsService(
  request: RequestUpdateSmsDaisyAccountsService,
): Promise<ResponseUpdateSmsDaisyAccountsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-daisy-accounts`,
      data: request,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pinverify.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
