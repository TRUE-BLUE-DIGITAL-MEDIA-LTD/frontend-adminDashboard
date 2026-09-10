import { SmsBulkEmail, SmsBulkEmailDomainItem } from "../models";
import { callSmsBulk } from "./sms-bulk";

const BASE = `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-bulk-email`;

export type RequestCreateSmsBulkEmailService = { site: string; domain: string };
export function CreateSmsBulkEmailService(
  request: RequestCreateSmsBulkEmailService,
): Promise<SmsBulkEmail> {
  return callSmsBulk({ method: "POST", url: BASE, data: request });
}

export type ResponseGetSmsBulkEmailService = {
  data: SmsBulkEmail[];
  balance: number;
};
export function GetSmsBulkEmailService(): Promise<ResponseGetSmsBulkEmailService> {
  return callSmsBulk({ method: "GET", url: BASE });
}

export type RequestGetHistorySmsBulkEmailService = { limit: number; page: number };
export type ResponseGetHistorySmsBulkEmailService = {
  data: SmsBulkEmail[];
  totalPage: number;
};
export function GetHistorySmsBulkEmailService(
  request: RequestGetHistorySmsBulkEmailService,
): Promise<ResponseGetHistorySmsBulkEmailService> {
  return callSmsBulk({ method: "GET", url: `${BASE}/history`, params: request });
}

export type RequestGetDomainsSmsBulkEmailService = { site: string };
export function GetDomainsSmsBulkEmailService(
  request: RequestGetDomainsSmsBulkEmailService,
): Promise<SmsBulkEmailDomainItem[]> {
  return callSmsBulk({ method: "GET", url: `${BASE}/domains`, params: request });
}

export type RequestSmsBulkEmailIdService = { smsBulkEmailId: string };
export function CancelSmsBulkEmailService(
  request: RequestSmsBulkEmailIdService,
): Promise<SmsBulkEmail> {
  return callSmsBulk({ method: "DELETE", url: `${BASE}/${request.smsBulkEmailId}` });
}
export function CompleteSmsBulkEmailService(
  request: RequestSmsBulkEmailIdService,
): Promise<SmsBulkEmail> {
  return callSmsBulk({
    method: "PATCH",
    url: `${BASE}/${request.smsBulkEmailId}/complete`,
  });
}
export function ReorderSmsBulkEmailService(
  request: RequestSmsBulkEmailIdService,
): Promise<SmsBulkEmail> {
  return callSmsBulk({
    method: "POST",
    url: `${BASE}/${request.smsBulkEmailId}/reorder`,
  });
}
