import axios from "axios";
import { parseCookies } from "nookies";
import {
  Domain,
  LandingPage,
  Partner,
  ResponsibilityOnPartner,
  SiteBuild,
} from "../../models";
import { siteVerification_v1, webmasters_v3 } from "googleapis";

export type DomainWithLandingPage = Domain & {
  landingPages: {
    id: string;
  }[];
};
export type ResponseGetAllDomains = DomainWithLandingPage[];
export async function GetAllDomains(): Promise<ResponseGetAllDomains> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/domain/get-all`,
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export interface ResponseGetAllDomainsByPage {
  domains: (Domain & {
    siteBuild?: SiteBuild | null;
    partner: Partner | null;
    partnerOnDomain: ResponsibilityOnPartner | null;
    landingPages: LandingPage[];
  })[];
  totalPages: number;
  totalNoPartnerDomain: number;
  currentPage: number;
  totalDomain: number;
}
export interface InputGetAllDomainsByPage {
  page: number;
  searchField?: string;
  partnerId?: string;
  filter?: "all" | "no-partner";
}
export async function GetAllDomainsByPage(
  input: InputGetAllDomainsByPage,
): Promise<ResponseGetAllDomainsByPage> {
  try {
    if (input.partnerId === "all" || input.partnerId === "no-partner")
      delete input.partnerId;
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/domain/page/get-all`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export interface ResponseGetDomainService {
  domain: Domain;
  landingPages: {
    id: string;
    name: string;
    percent: number;
  }[];
}
interface InputGetDomainService {
  domainId: string;
}
export async function GetDomainService(
  input: InputGetDomainService,
): Promise<ResponseGetDomainService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/domain/get`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface ResponseCreateDomainService {
  id: string;
  createAt: string;
  updateAt: string;
  name: string;
  googleAnalyticsId: string | null;
}
interface InputCreateDomainService {
  domainName: string;
}
export async function CreateDomainService(
  input: InputCreateDomainService,
): Promise<ResponseCreateDomainService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/domain/create`,
      {
        ...input,
      },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

type ResponseUpdateDomainService = Domain;
export interface InputUpdateDomainService {
  name: string;
  domainNameId: string;
  googleAnalyticsId?: string | null;
  note?: string;
  landingPages: {
    name?: string;
    id: string;
    percent: number;
  }[];
}
export async function UpdateDomainService(
  input: InputUpdateDomainService,
): Promise<ResponseUpdateDomainService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.put(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/domain/update`,
      {
        ...input,
      },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface ResponseDeleteDomainNameService {
  message: string;
}
interface InputDeleteDomainNameService {
  domainNameId: string;
}
export async function DeleteDomainNameService(
  input: InputDeleteDomainNameService,
): Promise<ResponseDeleteDomainNameService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.delete(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/domain/delete`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseVerifyDomainOnGoogleService = Domain;
export interface InputVerifyDomainOnGoogleService {
  domainId: string;
}
export async function VerifyDomainOnGoogleService(
  input: InputVerifyDomainOnGoogleService,
): Promise<ResponseVerifyDomainOnGoogleService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.patch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/domain/${input.domainId}/verify-google`,
      {},
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );
    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseSummitSitemapDomainService = {
  verified: siteVerification_v1.Schema$SiteVerificationWebResourceResource;
  site: webmasters_v3.Schema$WmxSite;
  sitemap: webmasters_v3.Schema$WmxSitemap;
  domain: Domain;
};
export interface InputSummitSitemapDomainService {
  domainId: string;
}
export async function SummitSitemapDomainService(
  input: InputSummitSitemapDomainService,
): Promise<ResponseSummitSitemapDomainService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.patch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/domain/${input.domainId}/sitemap`,
      {},
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );
    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
