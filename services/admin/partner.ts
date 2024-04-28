import axios from "axios";
import { parseCookies } from "nookies";
import {
  Pagination,
  Partner,
  ResponsibilityOnPartner,
  User,
} from "../../models";

type InputGetPartnerByPageService = {
  limit: number;
  page: number;
  searchField?: string;
};
export async function GetPartnerByPageService(
  input: InputGetPartnerByPageService,
): Promise<
  Pagination<
    Partner & {
      user: User;
      responsibilityOnPartner: ResponsibilityOnPartner[];
    }
  >
> {
  try {
    if (
      input.searchField === undefined ||
      input.searchField === "" ||
      input.searchField === null
    ) {
      delete input.searchField;
    }
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
  name: string;
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
      data: {
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
    name?: string;
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
      data: {
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

type ResponseCreateResponsibilityOnPartnerService = ResponsibilityOnPartner;
type RequestCreateResponsibilityOnPartnerService = {
  domainId: string;
  partnerId: string;
};
export async function CreateResponsibilityOnPartnerService(
  input: RequestCreateResponsibilityOnPartnerService,
): Promise<ResponseCreateResponsibilityOnPartnerService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const user = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/responsibility-partner`,
      data: {
        ...input,
      },
      responseType: "json",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });
    return user.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

type ResponseDeleteResponsibilityOnPartnerService = ResponsibilityOnPartner;
type RequestDeleteResponsibilityOnPartnerService = {
  responsibilityPartnerId: string;
};
export async function DeleteResponsibilityOnPartnerService(
  input: RequestDeleteResponsibilityOnPartnerService,
): Promise<ResponseDeleteResponsibilityOnPartnerService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const user = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/responsibility-partner`,
      data: {
        ...input,
      },
      responseType: "json",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });
    return user.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
