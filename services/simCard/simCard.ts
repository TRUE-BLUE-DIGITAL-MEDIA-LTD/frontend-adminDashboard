import axios from "axios";
import { parseCookies } from "nookies";
import { DeviceUser, Pagination, SimCard } from "../../models";

export type ResponseGetSimCardByDeviceUserIdService = SimCard[];

type InputGetSimCardByDeviceUserIdService = {
  deviceId: string;
};
export async function GetSimCardByDeviceUserIdService(
  input: InputGetSimCardByDeviceUserIdService,
): Promise<ResponseGetSimCardByDeviceUserIdService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-card/by-device`,
      params: {
        ...input,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return simcard.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetSimCardByPageService = Pagination<SimCard>;

type InputGetSimCardByPageService = {
  limit: number;
  page: number;
  searchField: string;
};
export async function GetSimCardByPageService(
  input: InputGetSimCardByPageService,
): Promise<ResponseGetSimCardByPageService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-card/by-page`,
      params: {
        ...input,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return simcard.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetSimCardByPartnerIdService = SimCard[];

export async function GetSimCardByPartnerIdService(): Promise<ResponseGetSimCardByPartnerIdService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-card`,

      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return simcard.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetSimCardByIdService = {
  simCard: SimCard & { deviceUser: DeviceUser };
  messages: {
    status: number;
    port: string;
    timeStamp: number;
    sender: string;
    recipient: string;
    message: string;
  }[];
};

type InputGetSimCardByIdService = {
  simCardId: string;
};
export async function GetSimCardByIdService(
  input: InputGetSimCardByIdService,
): Promise<ResponseGetSimCardByIdService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-card/${input.simCardId}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return simcard.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseUpdateSimCardService = SimCard;

type InputUpdateSimCardService = {
  simCardId: string;
  simCardNote: string;
};
export async function UpdateSimCardService(
  input: InputUpdateSimCardService,
): Promise<ResponseUpdateSimCardService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-card`,
      data: {
        ...input,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return simcard.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}