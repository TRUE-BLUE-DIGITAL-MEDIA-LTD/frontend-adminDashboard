import axios from "axios";
import { parseCookies } from "nookies";
import { Transaction, User } from "../models";

export type ResponseTopupOxyPointService = string;
export type RequestTopupOxyPointService = {
  amount: number;
};
export async function TopupOxyPointService(
  request: RequestTopupOxyPointService,
): Promise<ResponseTopupOxyPointService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/oxyclick-points/top-up`,
      data: request,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pinverify.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseTopupWithOutCreditOxyPointService = User;
export type RequestTopupWithOutCreditOxyPointService = {
  amount: number;
  partnerId: string;
};
export async function TopupWithOutCreditOxyPointService(
  request: RequestTopupWithOutCreditOxyPointService,
): Promise<ResponseTopupWithOutCreditOxyPointService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/oxyclick-points/top-up-without-credit`,
      data: request,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pinverify.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetTransactionOxyPointsService = {
  data: Transaction[];
  totalPage: number;
};
export type RequestGetTransactionOxyPointsService = {
  page: number;
  limit: number;
};
export async function GetTransactionOxyPointsService(
  request: RequestGetTransactionOxyPointsService,
): Promise<ResponseGetTransactionOxyPointsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/oxyclick-points/transactions`,
      params: request,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pinverify.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
export type ResponseRefundOxyPointService = { message: string };

export async function RefundOxyPointService(): Promise<ResponseRefundOxyPointService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const sms_pinverify = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/oxyclick-points/refund`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return sms_pinverify.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
