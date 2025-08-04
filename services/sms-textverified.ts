import axios from "axios";
import { parseCookies } from "nookies";
import { Sms, SmsTextVerified, VerificationDetails } from "../models";

export type ResponseGetListServiceOnTextVerifiedService = {
  serviceName: string;
  capability: string;
}[];
export type RequestGetListServiceOnTextVerifiedService = {
  numberType: "mobile" | "voip" | "landline";
  reservationType: "renewable" | "nonrenewable" | "verification";
};
export async function GetListServiceOnTextVerifiedService(
  input: RequestGetListServiceOnTextVerifiedService,
): Promise<ResponseGetListServiceOnTextVerifiedService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const services = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-textverifieds/list/services`,
      params: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return services.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetListAearCodeOnTextVerifiedService = {
  areaCode: string;
  state: string;
}[];

export async function GetListAearCodeOnTextVerifiedService(): Promise<ResponseGetListAearCodeOnTextVerifiedService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const services = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-textverifieds/list/area-code`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return services.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetPriceOnTextVerifiedService = number;
export type RequestGetPriceOnTextVerifiedService = {
  serviceName: string;
  areaCode: boolean;
  carrier: boolean;
  numberType: "mobile" | "voip" | "landline";
  capability: "sms" | "voice" | "smsAndVoiceCombo";
};
export async function GetPriceOnTextVerifiedService(
  input: RequestGetPriceOnTextVerifiedService,
): Promise<ResponseGetPriceOnTextVerifiedService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const services = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-textverifieds/check/price`,
      data: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return services.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCreateTextVerifiedService = SmsTextVerified;
export type RequestCreateTextVerifiedService = {
  areaCodeSelectOption?: string;
  serviceName: string;
  capability: "sms" | "voice" | "smsAndVoiceCombo";
};
export async function CreateTextVerifiedService(
  input: RequestCreateTextVerifiedService,
): Promise<ResponseCreateTextVerifiedService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const services = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-textverifieds`,
      data: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return services.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetTextVerifiedsService = {
  data: (SmsTextVerified & {
    sms: Sms[];
  })[];
  totalUsage: number;
  limit: number;
  balance: number;
  totalPage?: number;
};
export type RequestGetTextVerifiedsService = {
  isComplete: "complete" | "non-complete";
  limit?: number;
  page?: number;
};
export async function GetTextVerifiedsService(
  input: RequestGetTextVerifiedsService,
): Promise<ResponseGetTextVerifiedsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const services = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-textverifieds`,
      params: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return services.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetTextVerifiedService = SmsTextVerified & {
  detail: VerificationDetails;
};
export type RequestGetTextVerifiedService = {
  smsTextVerifiedId: string;
};
export async function GetTextVerifiedService(
  input: RequestGetTextVerifiedService,
): Promise<ResponseGetTextVerifiedService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const services = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-textverifieds/${input.smsTextVerifiedId}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return services.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCancelTextVerifiedService = SmsTextVerified;
export type RequestCancelTextVerifiedService = {
  smsTextVerifiedId: string;
};
export async function CancelTextVerifiedService(
  input: RequestCancelTextVerifiedService,
): Promise<ResponseCancelTextVerifiedService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const services = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-textverifieds/${input.smsTextVerifiedId}/cancel`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return services.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseReportTextVerifiedService = SmsTextVerified;
export type RequestReportTextVerifiedService = {
  smsTextVerifiedId: string;
};
export async function ReportTextVerifiedService(
  input: RequestReportTextVerifiedService,
): Promise<ResponseReportTextVerifiedService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const services = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-textverifieds/${input.smsTextVerifiedId}/report`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return services.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseReactiveTextVerifiedService = SmsTextVerified;
export type RequestReactiveTextVerifiedService = {
  smsTextVerifiedId: string;
};
export async function ReactiveTextVerifiedService(
  input: RequestReactiveTextVerifiedService,
): Promise<ResponseReactiveTextVerifiedService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const services = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-textverifieds/${input.smsTextVerifiedId}/reactive`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return services.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseReusedTextVerifiedService = SmsTextVerified;
export type RequestReusedTextVerifiedService = {
  smsTextVerifiedId: string;
};
export async function ReusedTextVerifiedService(
  input: RequestReusedTextVerifiedService,
): Promise<ResponseReusedTextVerifiedService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const services = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-textverifieds/${input.smsTextVerifiedId}/reused`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return services.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
