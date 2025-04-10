import axios from "axios";
import { parseCookies } from "nookies";
import { Country, Service, SmsPool } from "../models";

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

export type ResponseGetStockNumberService = { success: 1; amount: number };
export type RequestGetStockNumberService = {
  country: string;
  service: string;
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
      params: input,
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

export type ResponseReserveSMSPOOLNumberService = SmsPool;
export type RequestReserveSMSPOOLNumberService = {
  country: string;
  service: string;
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

export type ResponseCencelSMSPoolService = SmsPool;
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

export type ResponseGetSmsPoolService = (SmsPool & {
  sms: {
    code: string;
    fullText: string;
    status: string;
  };
})[];

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
