import { parseCookies } from "nookies";
import { SmsBerry, SmsBerryBalance, SmsBerryMessage } from "../models";
import axios from "axios";

export type ResponseGetActiveSmsBerryNumbersService = (SmsBerry & {
  messages: SmsBerryMessage[];
})[];

export async function GetActiveSmsBerryNumbersService(): Promise<ResponseGetActiveSmsBerryNumbersService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-berrys`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data || err;
  }
}

export type ResponseGetSmsBerryBalanceService = SmsBerryBalance[];

export async function GetSmsBerryBalanceService(): Promise<ResponseGetSmsBerryBalanceService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-berrys/balance`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data || err;
  }
}

export type ResponseCreateSmsBerryService = SmsBerry;
export type RequestCreateSmsBerryService = {
  note?: string;
  requestedNumberOfSim: number;
  ratePlan: number;
  autoRenew: boolean;
  callbackUrl?: string;
  timeoutSec?: number;
  applications: number[];
};

export async function CreateSmsBerryService(
  request: RequestCreateSmsBerryService,
): Promise<ResponseCreateSmsBerryService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-berrys`,
      data: request,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data || err;
  }
}
