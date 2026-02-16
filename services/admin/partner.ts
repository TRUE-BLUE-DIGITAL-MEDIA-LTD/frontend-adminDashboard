import axios from "axios";
import { parseCookies } from "nookies";
import {
  Domain,
  Pagination,
  Partner,
  ResponsibilityOnPartner,
  SimCardOnPartner,
  User,
} from "../../models";

export async function GetPartnerByMangegerService(): Promise<
  (Partner & {
    responsibilityOnPartner: ResponsibilityOnPartner[];
    simCardOnPartner: SimCardOnPartner[];
    account: null;
  })[]
> {
  {
    try {
      const cookies = parseCookies();
      const access_token = cookies.access_token;
      const partner = await axios({
        method: "GET",
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner/by-manager`,
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
}

export type InputGetPartnerByPageService = {
  limit: number;
  page: number;
  searchField?: string;
};
export async function GetPartnerByPageService(
  input: InputGetPartnerByPageService,
): Promise<
  Pagination<
    Partner & {
      manager: User;
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
  managerId: string;
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
    managerId?: string;
    affiliateId?: string;
    currency_id?: string;
    name?: string;
    isAllowUsingSMSPVA?: boolean;
    isAllowUsingSMSPOOL?: boolean;
    isAllowUsingSMS_TEXTVERIFIED?: boolean;
    isAllowSmsPoolAccount?: boolean;
    isAllowManageSmsOxy?: boolean;
    isAllowManageAssignPhoneNumber?: boolean;
    isAllowManageAssignDomain?: boolean;
    isAllowManageAssginCategory?: boolean;
    refill_oxyclick_points?: number;
    smartLink?: string;
    isAllowUsingSMS_Pinverify?: boolean;
    isAllowSmsPinverifyAccount?: boolean;
    isAllowUsingSMS_Daisy?: boolean;
    isAllowSmsDaisyAccount?: boolean;
    isAllowManagePartner?: boolean;
    isAllowBonuSystem?: boolean;
    isAllowCloudPhone?: boolean;
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

type ResponseGetTotalResponsibilityOnPartnerService = number;

type RequestGetTotalResponsibilityOnPartnerService = {
  partnerId: string;
};
export async function GetTotalResponsibilityOnPartnerService(
  input: RequestGetTotalResponsibilityOnPartnerService,
): Promise<ResponseGetTotalResponsibilityOnPartnerService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const partnerOnDomain = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/responsibility-partner/${input.partnerId}/total`,
      responseType: "json",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });
    return partnerOnDomain.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

type ResponseGetResponsibilityOnPartnerService = (ResponsibilityOnPartner & {
  domain: Domain;
})[];

type RequestGetResponsibilityOnPartnerService = {
  partnerId: string;
};
export async function GetResponsibilityOnPartnerService(
  input: RequestGetResponsibilityOnPartnerService,
): Promise<ResponseGetResponsibilityOnPartnerService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const user = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/responsibility-partner`,
      params: {
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
      params: {
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

type ResponseGetPartnerLeagueTableService = {
  affiliateInfo: {
    country: string;
    event: number;
    cv: number;
    cvr: number;
    evr: number;
    click: number;
  }[];
  partnerName: string;
  partnerId: string;
  sumEvent: number;
  sumCv: number;
  sumClick: number;
}[];

export type RequestGetPartnerLeagueTableService = {
  startDate: string;
  endDate: string;
  country?: string;
};
export async function GetPartnerLeagueTableService(
  input: RequestGetPartnerLeagueTableService,
): Promise<ResponseGetPartnerLeagueTableService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const user = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/league-table`,
      params: {
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
type ResponseGetNewsPartnerLeagueTableService = {
  country: string;
  evr_list: { region: string; number: number; percent: number }[];
  cvr_list: { region: string; number: number; percent: number }[];
  combine_list: { region: string; number: number; percent: number }[];
}[];

export async function GetNewsPartnerLeagueTableService(): Promise<ResponseGetNewsPartnerLeagueTableService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const user = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/league-table/news`,
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
