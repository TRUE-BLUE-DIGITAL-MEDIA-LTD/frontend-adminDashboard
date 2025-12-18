import { parseCookies } from "nookies";
import {
  FlatPrice,
  SmsBower,
  SmsBowerAccount,
  SmsBowerMessage,
} from "../models";
import axios from "axios";

export type ResponseGetActiveSmsBowerNumbersService = (SmsBower & {
  messages: SmsBowerMessage[];
})[];

export async function GetActiveSmsBowerNumbersService(): Promise<ResponseGetActiveSmsBowerNumbersService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/1v/sms-bowers`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetSmsBowerBalanceService = string;
export async function GetSmsBowerBalanceService(): Promise<ResponseGetSmsBowerBalanceService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/1v/sms-bowers/balance`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseRequestAnotherCodeSmsBowerService = SmsBower;
export type RequestRequestAnotherCodeSmsBowerService = {
  id: string;
};
export async function RequestAnotherCodeSmsBowerService(
  request: RequestRequestAnotherCodeSmsBowerService,
): Promise<ResponseRequestAnotherCodeSmsBowerService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/1v/sms-bowers/request-another-code/${request.id}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetSmsBowerAccountsService = SmsBowerAccount[];
export async function GetSmsBowerAccountsService(): Promise<ResponseGetSmsBowerAccountsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-bower-accounts`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseActiveSmsBowerAccountService = SmsBowerAccount;
export type RequestActiveSmsBowerAccountService = {
  id: string;
};
export async function ActiveSmsBowerAccountService(
  request: RequestActiveSmsBowerAccountService,
): Promise<ResponseActiveSmsBowerAccountService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-bower-accounts/active/${request.id}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetSmsBowerPricesService = FlatPrice[];
export type RequestGetSmsBowerPricesService = {
  country: string;
  service: string;
};
export async function GetSmsBowerPricesService(
  request: RequestGetSmsBowerPricesService,
): Promise<ResponseGetSmsBowerPricesService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/1v/sms-bowers/prices`,
      params: request,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCreateSmsBowerService = SmsBower;
export type RequestCreateSmsBowerService = {
  service: string;
  country: string;
  providerId: number;
};
export async function CreateSmsBowerService(
  request: RequestCreateSmsBowerService,
): Promise<ResponseCreateSmsBowerService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/1v/sms-bowers`,
      data: request,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCancelSmsBowerService = SmsBower;
export type RequestCancelSmsBowerService = {
  id: string;
};
export async function CancelSmsBowerService(
  request: RequestCancelSmsBowerService,
): Promise<ResponseCancelSmsBowerService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/1v/sms-bowers/cancel/${request.id}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseReportSmsBowerService = SmsBower;
export type RequestReportSmsBowerService = {
  id: string;
};
export async function ReportSmsBowerService(
  request: RequestReportSmsBowerService,
): Promise<ResponseReportSmsBowerService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/1v/sms-bowers/report/${request.id}`,
      data: request,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
