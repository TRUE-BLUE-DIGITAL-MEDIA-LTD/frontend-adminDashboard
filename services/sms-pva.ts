import axios from "axios";
import { parseCookies } from "nookies";
import { SmsPva } from "../models";

export type ResponseCreateSMSPVAService = SmsPva;
export type RequestCreateSMSPVAService = {
  country: string;
  service: string;
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
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetSMSPVAsService = (SmsPva & {
  sms: {
    code?: string | undefined;
    fullText?: string | undefined;
    status: string;
  };
})[];

export async function GetSMSPVAsService(): Promise<ResponseGetSMSPVAsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pva = await axios({
      method: "GET",
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
