import axios from "axios";
import { parseCookies } from "nookies";
import { Country, Service, SMSPool } from "../models";

export type ResponseGetCountrySMSPoolService = Country[];
export async function GetCountrySMSPoolService(): Promise<ResponseGetCountrySMSPoolService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const smsPool = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pools/country`,

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

export type ResponseGetServiceSMSPoolService = Service[];
export async function GetServiceSMSPoolService(): Promise<ResponseGetServiceSMSPoolService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const smsPool = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pools/service`,

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

export type ResponseGetStockNumberService = {
  success: 1 | 0;
  amount: number;
  message?: string;
};
export type RequestGetStockNumberService = {
  country: string;
  service: string;
  pool: string;
};
export async function GetStockNumberService(
  input: RequestGetStockNumberService,
): Promise<ResponseGetStockNumberService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const smsPool = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pools/stock`,
      data: input,
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

export type ResponseResendSMSPOOLService = SMSPool;
export type RequestResendSMSPOOLService = {
  id: string;
};
export async function ResendSMSPOOLService(
  input: RequestResendSMSPOOLService,
): Promise<ResponseResendSMSPOOLService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const smsPool = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pools/resend`,
      data: input,
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

export type ResponseReserveSMSPOOLNumberService = SMSPool;
export type RequestReserveSMSPOOLNumberService = {
  country: string;
  service: string;
  pool: string;
};
export async function ReserveSMSPOOLNumberService(
  input: RequestReserveSMSPOOLNumberService,
): Promise<ResponseReserveSMSPOOLNumberService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const smsPool = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pools`,
      data: input,
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

export type ResponseCencelSMSPoolService = SMSPool;
export type RequestCencelSMSPoolService = {
  id: string;
};
export async function CencelSMSPoolService(
  input: RequestCencelSMSPoolService,
): Promise<ResponseCencelSMSPoolService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const smsPool = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pools/cancel/${input.id}`,
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

export type ResponseGetSmsPoolService = {
  data: (SMSPool & {
    sms: {
      code: string;
      fullText: string;
      status: string;
    };
  })[];
  totalUsage: number;
  limit: number;
  balance: string;
};

export async function GetSmsPoolService(): Promise<ResponseGetSmsPoolService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const smsPool = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-pools`,
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
