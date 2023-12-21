import axios from "axios";
import Error from "next/error";
import { parseCookies } from "nookies";

interface ResponseGetAllDomains {
  id: string;
  createAt: string;
  updateAt: string;
  name: string;
  googleAnalyticsId: string | null;
  landingPages: {
    id: string;
  }[];
}
export async function GetAllDomains(): Promise<ResponseGetAllDomains[]> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/domain/get-all`,
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );

    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

interface ResponseGetAllDomainsByPage {
  domains: {
    id: string;
    createAt: string;
    updateAt: string;
    name: string;
    googleAnalyticsId: string | null;
  }[];
  totalPages: number;
  currentPage: number;
}
interface InputGetAllDomainsByPage {
  page: number;
}
export async function GetAllDomainsByPage(
  input: InputGetAllDomainsByPage
): Promise<ResponseGetAllDomainsByPage> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/domain/page/get-all`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );

    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

interface ResponseGetDomainService {
  domain: {
    id: string;
    createAt: string;
    updateAt: string;
    name: string;
    googleAnalyticsId: string | null;
  };
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
  input: InputGetDomainService
): Promise<ResponseGetDomainService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/domain/get`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );

    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
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
  input: InputCreateDomainService
): Promise<ResponseCreateDomainService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/domain/create`,
      {
        ...input,
      },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );

    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
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
  name: string;
  domainNameId: string;
  landingPages: string;
  googleAnalyticsId?: string | null;
}
export async function UpdateDomainService(input: InputCreateDomainService) {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.put(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/domain/update`,
      {
        ...input,
      },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );

    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

interface ResponseDeleteDomainNameService {
  message: string;
}
interface InputDeleteDomainNameService {
  domainNameId: string;
}
export async function DeleteDomainNameService(
  input: InputDeleteDomainNameService
): Promise<ResponseDeleteDomainNameService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const domain = await axios.delete(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/domain/delete`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );

    return domain.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}
