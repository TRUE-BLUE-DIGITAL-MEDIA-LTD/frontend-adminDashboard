import axios from "axios";
import { parseCookies } from "nookies";
import { Pagination, SmsPva, User } from "../models";

export type ResponseGetServicePricePVAService = {
  price: number;
  service: string;
};
export type RequestGetServicePricePVAService = {
  country: string;
  service: string;
};
export async function GetServicePricePVAService(
  input: RequestGetServicePricePVAService,
): Promise<ResponseGetServicePricePVAService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pva = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pva/get-price`,
      params: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pva.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type RequestGetByPagePVAService = {
  limit: number;
  page: number;
  userId?: string;
  startDate?: string;
  endDate?: string;
  timezone: string;
};
export type ResponseGetByPagePVAService = Pagination<SmsPva & { user: User }>;
export async function GetByPagePVAService(
  input: RequestGetByPagePVAService,
): Promise<ResponseGetByPagePVAService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pva = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pva/page`,
      params: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pva.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCreateSMSPVAService = SmsPva;
export type RequestCreateSMSPVAService = {
  country: string;
  service: string;
  timezone: string;
};
export async function CreateSMSPVAService(
  input: RequestCreateSMSPVAService,
): Promise<ResponseCreateSMSPVAService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pva = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pva`,
      data: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pva.data;
  } catch (err: any) {
    throw err.response.data;
  }
}

export type ResponseCancelSMSPVAService = SmsPva;
export type RequestCancelSMSPVAService = {
  smsPvaId: string;
};
export async function CancelSMSPVAService(
  input: RequestCancelSMSPVAService,
): Promise<ResponseCancelSMSPVAService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pva = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pva/cancel/${input.smsPvaId}`,
      data: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pva.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseBlockSMSPVAService = SmsPva;
export type RequestBlockSMSPVAService = {
  smsPvaId: string;
};
export async function BlockSMSPVAService(
  input: RequestBlockSMSPVAService,
): Promise<ResponseBlockSMSPVAService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pva = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pva/block/${input.smsPvaId}`,
      data: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pva.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetSMSPVAsService = {
  sims: (SmsPva & {
    sms: {
      code: string | undefined;
      fullText: string | undefined;
      status: string;
    };
  })[];
  balance: number;
  totalUsage: number;
  limit: number;
};

export type RequestGetSMSPvaService = {
  timezone: string;
};

export async function GetSMSPVAsService(
  request: RequestGetSMSPvaService,
): Promise<ResponseGetSMSPVAsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pva = await axios({
      method: "GET",
      params: request,
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pva`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pva.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetAvailableNumberPVAService = {
  service: string;
  total: number;
}[];
export type RequestGetAvailableNumberPVAService = {
  country: string;
};
export async function GetAvailableNumberPVAService(
  input: RequestGetAvailableNumberPVAService,
): Promise<ResponseGetAvailableNumberPVAService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pva = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pva/available`,
      params: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pva.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetAllPricePVAService = {
  service: string;
  serviceDescription: string;
  country: string;
  price: number;
}[];

export async function GetAllPricePVAService(): Promise<ResponseGetAllPricePVAService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pva = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pva/all-price`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pva.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
