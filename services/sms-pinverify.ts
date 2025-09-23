import { parseCookies } from "nookies";
import { SmsPinverify, SmsPinverifyAccount } from "../models";
import axios from "axios";

export type ResponseCreateSMSPinverifyService = SmsPinverify;
export type RequestCreateSMSPinverifyService = {
  service: string;
  country: string;
};
export async function CreateSMSPinverifyService(
  request: RequestCreateSMSPinverifyService,
): Promise<ResponseCreateSMSPinverifyService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pinverifys`,
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

export type ResponseReusedSMSPinverifyService = SmsPinverify;
export type RequestReusedSMSPinverifyService = {
  smsPinverifyId: string;
};
export async function ReusedSMSPinverifyService(
  request: RequestReusedSMSPinverifyService,
): Promise<ResponseReusedSMSPinverifyService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pinverifys/reused`,
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

export type ResponseGetServiceListSMSPinverifyService = {
  app: string;
  business_code: string;
  rate: string;
}[];

export type RequestGetServiceListSMSPinverifyService = {
  country: string;
};

export async function GetServiceListSMSPinverifyService(
  request: RequestGetServiceListSMSPinverifyService,
): Promise<ResponseGetServiceListSMSPinverifyService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pinverifys/services`,
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

export type ResponseGetHistorySMSPinverifyService = {
  data: SmsPinverify[];
  totalPage: number;
};
export type RequestGetHistorySMSPinverifyService = {
  limit: number;
  page: number;
};

export async function GetHistorySMSPinverifyService(
  request: RequestGetHistorySMSPinverifyService,
): Promise<ResponseGetHistorySMSPinverifyService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pinverifys/history`,
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
export type ResponseGetSMSPinverifyService = {
  data: SmsPinverify[];
  totalUsage: number;
  limit: number;
  balance: number;
};

export async function GetSMSPinverifyService(): Promise<ResponseGetSMSPinverifyService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pinverifys`,
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

export type ResponseCancelSMSPinverifyService = SmsPinverify;
export type RequestCancelSMSPinverifyService = {
  smsPinverifyId: string;
};
export async function CancelSMSPinverifyService(
  request: RequestCancelSMSPinverifyService,
): Promise<ResponseCancelSMSPinverifyService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pinverifys/${request.smsPinverifyId}`,
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

export type ResponseGetSMSPinverifyAccountsService = SmsPinverifyAccount[];

export async function GetSMSPinverifyAccountsService(): Promise<ResponseGetSMSPinverifyAccountsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pinverify-accounts`,
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
export type RequestUpdateSMSPinverifyAccountService = {
  query: {
    id: string;
  };
  body: {
    apiKey?: string;
    isActive?: boolean;
  };
};

export type ResponseUpdateSMSPinverifyAccountService = SmsPinverifyAccount;
export async function UpdateSMSPinverifyAccountService(
  request: RequestUpdateSMSPinverifyAccountService,
): Promise<ResponseUpdateSMSPinverifyAccountService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pinverify-accounts`,
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
