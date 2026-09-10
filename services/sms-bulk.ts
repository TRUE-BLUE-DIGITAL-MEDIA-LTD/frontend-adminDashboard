import axios from "axios";
import { parseCookies } from "nookies";
import {
  SmsBulk,
  SmsBulkAccount,
  SmsBulkCountryItem,
  SmsBulkServiceItem,
} from "../models";

const BASE = `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-bulk`;
const ACCOUNTS = `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-bulk-accounts`;

function authHeaders() {
  const cookies = parseCookies();
  return { Authorization: "Bearer " + cookies.access_token };
}

export async function callSmsBulk<T>(config: {
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

export type RequestCreateSmsBulkService = { service: string; country: string };
export function CreateSmsBulkService(
  request: RequestCreateSmsBulkService,
): Promise<SmsBulk> {
  return callSmsBulk({ method: "POST", url: BASE, data: request });
}

export type ResponseGetSmsBulkService = {
  data: SmsBulk[];
  totalUsage: number;
  limit: number;
  balance: number;
};
export function GetSmsBulkService(): Promise<ResponseGetSmsBulkService> {
  return callSmsBulk({ method: "GET", url: BASE });
}

export type RequestGetHistorySmsBulkService = { limit: number; page: number };
export type ResponseGetHistorySmsBulkService = {
  data: SmsBulk[];
  totalPage: number;
};
export function GetHistorySmsBulkService(
  request: RequestGetHistorySmsBulkService,
): Promise<ResponseGetHistorySmsBulkService> {
  return callSmsBulk({ method: "GET", url: `${BASE}/history`, params: request });
}

export function GetServiceListSmsBulkService(): Promise<SmsBulkServiceItem[]> {
  return callSmsBulk({ method: "GET", url: `${BASE}/services` });
}

export type RequestGetCountryListSmsBulkService = { service: string };
export function GetCountryListSmsBulkService(
  request: RequestGetCountryListSmsBulkService,
): Promise<SmsBulkCountryItem[]> {
  return callSmsBulk({ method: "GET", url: `${BASE}/countries`, params: request });
}

export type RequestSmsBulkIdService = { smsBulkId: string };
export function CancelSmsBulkService(
  request: RequestSmsBulkIdService,
): Promise<SmsBulk> {
  return callSmsBulk({ method: "DELETE", url: `${BASE}/${request.smsBulkId}` });
}
export function CompleteSmsBulkService(
  request: RequestSmsBulkIdService,
): Promise<SmsBulk> {
  return callSmsBulk({
    method: "PATCH",
    url: `${BASE}/${request.smsBulkId}/complete`,
  });
}
export function ResendSmsBulkService(
  request: RequestSmsBulkIdService,
): Promise<SmsBulk> {
  return callSmsBulk({
    method: "PATCH",
    url: `${BASE}/${request.smsBulkId}/resend`,
  });
}

export function GetSmsBulkAccountsService(): Promise<SmsBulkAccount[]> {
  return callSmsBulk({ method: "GET", url: ACCOUNTS });
}

export type RequestCreateSmsBulkAccountService = {
  username: string;
  apiKey: string;
  webhookSecret?: string;
};
export function CreateSmsBulkAccountService(
  request: RequestCreateSmsBulkAccountService,
): Promise<SmsBulkAccount> {
  return callSmsBulk({ method: "POST", url: ACCOUNTS, data: request });
}

export type RequestUpdateSmsBulkAccountService = {
  query: { id: string };
  body: { apiKey?: string; webhookSecret?: string; isActive?: boolean };
};
export function UpdateSmsBulkAccountService(
  request: RequestUpdateSmsBulkAccountService,
): Promise<SmsBulkAccount> {
  return callSmsBulk({ method: "PATCH", url: ACCOUNTS, data: request });
}
