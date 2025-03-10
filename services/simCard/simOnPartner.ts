import axios from "axios";
import { parseCookies } from "nookies";
import { Partner, SimCard, SimCardOnPartner } from "../../models";

export type ResponseGetTotalSimOnPartnersByPartnerIdService = number;

type InputGetTotalSimOnPartnersByPartnerIdService = {
  partnerId: string;
};
export async function GetTotalSimOnPartnersByPartnerIdService(
  input: InputGetTotalSimOnPartnersByPartnerIdService,
): Promise<ResponseGetTotalSimOnPartnersByPartnerIdService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-partner/${input.partnerId}/total`,
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

export type ResponseBulkSimcardOnPartnerService = SimCardOnPartner[];

export type RequestBulkSimcardOnPartnerService = {
  partnerId: string;
  deviceUserId: string;
  number: number;
  action: "assign" | "unassign";
};
export async function BulkSimcardOnPartnerService(
  input: RequestBulkSimcardOnPartnerService,
): Promise<ResponseBulkSimcardOnPartnerService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcardOnPartner = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-partner/bulk`,
      data: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return simcardOnPartner.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetSimOnPartnersByPartnerIdService = (SimCardOnPartner & {
  partner: Partner;
  simCard: SimCard;
})[];

export type InputGetSimOnPartnersByPartnerIdService = {
  partnerId: string;
};
export async function GetSimOnPartnersByPartnerIdService(
  input: InputGetSimOnPartnersByPartnerIdService,
): Promise<ResponseGetSimOnPartnersByPartnerIdService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-partner/${input.partnerId}`,
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

export type ResponseGetSimOnPartnerUserService = SimCardOnPartner[];

export async function GetSimOnPartnerUserService(): Promise<ResponseGetSimOnPartnerUserService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-partner/options/get-by-user`,
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

export type ResponseCreateSimOnPartnerService = SimCardOnPartner;
type InputCreateSimOnPartnerService = {
  partnerId: string;
  simId: string;
};
export async function CreateSimOnPartnerService(
  input: InputCreateSimOnPartnerService,
): Promise<ResponseCreateSimOnPartnerService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-partner`,
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

export type ResponseDeleteSimOnPartnerService = { message: string };
export type InputDeleteSimOnPartnerService = {
  simOnPartnerId: string;
};
export async function DeleteSimOnPartnerService(
  input: InputDeleteSimOnPartnerService,
): Promise<ResponseDeleteSimOnPartnerService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-partner/${input.simOnPartnerId}`,
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
