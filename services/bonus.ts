import axios from "axios";
import { parseCookies } from "nookies";
import { BonusRate } from "../models";

export type ResponseGetBonusRateByUserId = BonusRate[];
type InputGetBonusRateByUserId = {
  userId: string;
};
export async function GetBonusRateByUserId(
  input: InputGetBonusRateByUserId,
): Promise<ResponseGetBonusRateByUserId> {
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

export type ResponseCreateBonusRateByUserId = BonusRate;
type InputCreateBonusRateByUserId = {
  from: number;
  to: number;
  rate: number;
  userId: string;
};
export async function CreateBonusRateByUserId(
  input: InputCreateBonusRateByUserId,
): Promise<ResponseCreateBonusRateByUserId> {
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

export type ResponseUpdateBonusRateByUserId = BonusRate;
type InputUpdateBonusRateByUserId = {
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
export async function UpdateBonusRateByUserId(
  input: InputUpdateBonusRateByUserId,
): Promise<ResponseUpdateBonusRateByUserId> {
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

export type ResponseDeleteBonusRateByUserId = BonusRate;
type InputDeleteBonusRateByUserId = {
  bonusId: string;
};
export async function DeleteBonusRateByUserId(
  input: InputDeleteBonusRateByUserId,
): Promise<ResponseDeleteBonusRateByUserId> {
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
