import axios from "axios";
import { parseCookies } from "nookies";
import { Partner } from "../../models";

type InputGetPartnerByUserIdService = {
  userId: string;
};
export async function GetPartnerByUserIdService(
  input: InputGetPartnerByUserIdService,
): Promise<Partner> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const partner = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner`,
      params: {
        ...input,
      },
      responseType: "json",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    return partner.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

type InputCreatePartnerService = {
  userId: string;
  affiliateId: string;
};
export async function CreatePartnerService(
  input: InputCreatePartnerService,
): Promise<Partner> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const partner = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner`,
      params: {
        ...input,
      },
      responseType: "json",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    return partner.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

type InputUpdatePartnerService = {
  query: {
    partnerId: string;
  };
  body: {
    userId?: string;
    affiliateId?: string;
  };
};
export async function UpdatePartnerService(
  input: InputUpdatePartnerService,
): Promise<Partner> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const partner = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner`,
      params: {
        ...input,
      },
      responseType: "json",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    return partner.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

type InputDeletePartnerService = {
  partnerId: string;
};
export async function DeletePartnerService(
  input: InputDeletePartnerService,
): Promise<Partner> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const partner = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner`,
      params: {
        ...input,
      },
      responseType: "json",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    return partner.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
