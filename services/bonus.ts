import axios from "axios";
import { parseCookies } from "nookies";
import { BonusRate } from "../models";

export type ResponseGetBonusRateByUserIdService = BonusRate[];
type InputGetBonusRateByUserIdService = {
  userId: string;
};
export async function GetBonusRateByUserIdService(
  input: InputGetBonusRateByUserIdService,
): Promise<ResponseGetBonusRateByUserIdService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const bonus = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/bonus-rates/userId/${input.userId}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return bonus.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseResetBonusRateService = BonusRate[];
type InputResetBonusRateService = {
  userId: string;
};
export async function ResetBonusRateService(
  input: InputResetBonusRateService,
): Promise<ResponseResetBonusRateService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const bonus = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/bonus-rates/reset`,
      data: {
        ...input,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return bonus.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCreateBonusRateService = BonusRate;
type InputCreateBonusRateService = {
  from: number;
  to: number;
  rate: number;
  userId: string;
};
export async function CreateBonusRateService(
  input: InputCreateBonusRateService,
): Promise<ResponseCreateBonusRateService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const bonus = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/bonus-rates`,
      data: {
        ...input,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return bonus.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseUpdateBonusRateService = BonusRate;
type InputUpdateBonusRateService = {
  query: {
    bonusId: string;
  };
  body: {
    from?: number;
    to?: number;
    rate?: number;
    userId?: string;
  };
};
export async function UpdateBonusRateService(
  input: InputUpdateBonusRateService,
): Promise<ResponseUpdateBonusRateService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const bonus = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/bonus-rates`,
      data: {
        ...input,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return bonus.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseDeleteBonusRateService = BonusRate;
type InputDeleteBonusRateService = {
  bonusId: string;
};
export async function DeleteBonusRateService(
  input: InputDeleteBonusRateService,
): Promise<ResponseDeleteBonusRateService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const bonus = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/bonus-rates/${input.bonusId}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return bonus.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
