import axios from "axios";
import { parseCookies } from "nookies";

export type AdjustLeadRate = {
  id: string;
  createAt: string;
  updateAt: string;
  rate: number;
  targetCurrency: string;
  convertedCurrency: string;
  campaignId: string;
  country: string;
};

export type ResponseFindAllAdjustLeadRateService = AdjustLeadRate[];

export async function FindAllAdjustLeadRateService(): Promise<ResponseFindAllAdjustLeadRateService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/adjust-lead-rates`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type CreateAdjustLeadRateDto = {
  rate: number;
  targetCurrency: string;
  convertedCurrency: string;
  campaignId: string;
  country: string;
};

export type ResponseCreateAdjustLeadRateService = AdjustLeadRate;

export async function CreateAdjustLeadRateService(
  input: CreateAdjustLeadRateDto,
): Promise<ResponseCreateAdjustLeadRateService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/adjust-lead-rates`,
      data: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type UpdateAdjustLeadRateDto = {
  id: string;
  rate?: number;
  targetCurrency?: string;
  convertedCurrency?: string;
  campaignId?: string;
  country?: string;
};

export type ResponseUpdateAdjustLeadRateService = AdjustLeadRate;

export async function UpdateAdjustLeadRateService(
  input: UpdateAdjustLeadRateDto,
): Promise<ResponseUpdateAdjustLeadRateService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const { id, ...data } = input;
    const response = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/adjust-lead-rates/${id}`,
      data: data,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type DeleteAdjustLeadRateDto = {
  id: string;
};

export type ResponseDeleteAdjustLeadRateService = AdjustLeadRate;

export async function DeleteAdjustLeadRateService(
  input: DeleteAdjustLeadRateDto,
): Promise<ResponseDeleteAdjustLeadRateService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/adjust-lead-rates/${input.id}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
