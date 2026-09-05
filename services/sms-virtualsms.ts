import axios from "axios";
import { parseCookies } from "nookies";
import {
  SmsVirtualsms,
  SmsVirtualsmsAccount,
  SmsVirtualsmsCountryItem,
  SmsVirtualsmsServiceItem,
} from "../models";

const BASE = `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-virtualsms`;
const ACCOUNTS = `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-virtualsms-accounts`;

function authHeaders() {
  const cookies = parseCookies();
  return { Authorization: "Bearer " + cookies.access_token };
}

async function call<T>(config: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  data?: unknown;
  params?: unknown;
}): Promise<T> {
  try {
    const res = await axios({
      ...config,
      headers: authHeaders(),
      responseType: "json",
    });
    return res.data as T;
  } catch (err: any) {
    const data = err?.response?.data;
    console.log(err?.response?.status, data);
    throw (
      data ?? {
        message: "Network error, please try again.",
        error: "Network error",
        statusCode: 0,
      }
    );
  }
}

export type RequestCreateSmsVirtualsmsService = {
  service: string;
  country: string;
};
export function CreateSmsVirtualsmsService(
  request: RequestCreateSmsVirtualsmsService,
): Promise<SmsVirtualsms> {
  return call({ method: "POST", url: BASE, data: request });
}

export type ResponseGetSmsVirtualsmsService = {
  data: SmsVirtualsms[];
  totalUsage: number;
  limit: number;
  balance: number;
};
export function GetSmsVirtualsmsService(): Promise<ResponseGetSmsVirtualsmsService> {
  return call({ method: "GET", url: BASE });
}

export type RequestGetHistorySmsVirtualsmsService = {
  limit: number;
  page: number;
};
export type ResponseGetHistorySmsVirtualsmsService = {
  data: SmsVirtualsms[];
  totalPage: number;
};
export function GetHistorySmsVirtualsmsService(
  request: RequestGetHistorySmsVirtualsmsService,
): Promise<ResponseGetHistorySmsVirtualsmsService> {
  return call({ method: "GET", url: `${BASE}/history`, params: request });
}

export function GetServiceListSmsVirtualsmsService(): Promise<
  SmsVirtualsmsServiceItem[]
> {
  return call({ method: "GET", url: `${BASE}/services` });
}

export type RequestGetCountryListSmsVirtualsmsService = { service: string };
export function GetCountryListSmsVirtualsmsService(
  request: RequestGetCountryListSmsVirtualsmsService,
): Promise<SmsVirtualsmsCountryItem[]> {
  return call({ method: "GET", url: `${BASE}/countries`, params: request });
}

export type RequestCancelSmsVirtualsmsService = { smsVirtualsmsId: string };
export function CancelSmsVirtualsmsService(
  request: RequestCancelSmsVirtualsmsService,
): Promise<SmsVirtualsms> {
  return call({
    method: "DELETE",
    url: `${BASE}/${request.smsVirtualsmsId}`,
  });
}

export function GetSmsVirtualsmsAccountsService(): Promise<
  SmsVirtualsmsAccount[]
> {
  return call({ method: "GET", url: ACCOUNTS });
}

export type RequestCreateSmsVirtualsmsAccountService = {
  username: string;
  apiKey: string;
  webhookSecret?: string;
};
export function CreateSmsVirtualsmsAccountService(
  request: RequestCreateSmsVirtualsmsAccountService,
): Promise<SmsVirtualsmsAccount> {
  return call({ method: "POST", url: ACCOUNTS, data: request });
}

export type RequestUpdateSmsVirtualsmsAccountService = {
  query: { id: string };
  body: { apiKey?: string; webhookSecret?: string; isActive?: boolean };
};
export function UpdateSmsVirtualsmsAccountService(
  request: RequestUpdateSmsVirtualsmsAccountService,
): Promise<SmsVirtualsmsAccount> {
  return call({ method: "PATCH", url: ACCOUNTS, data: request });
}
