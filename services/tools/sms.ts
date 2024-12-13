import axios from "axios";
import Error from "next/error";
import { parseCookies } from "nookies";
import { LanguageSMS } from "../../models";

export type ResponseGetTraficSMSService = {
  response: string;
  countries: {
    [country_code: string]: {
      name: string;
      original: string;
      code: number;
      pos: number;
      other: boolean;
      new: boolean;
      enable: boolean;
    };
  };
  services: {
    [service_name: string]: {
      id: number;
      count: number;
      price: string;
      service: string;
      slug: string;
    };
  };
  favorite_countries: {};
  favorite_services: [{}];
  page: number;
  country: number;
  filter: string;
  end: boolean;
  favorites: {};
};

type InputGetTraficSMSService = {
  country: number;
  filter_country?: string;
  filter_service?: string;
  page: number;
  lang: LanguageSMS;
};
export async function GetTraficSMSService(
  input: InputGetTraficSMSService,
): Promise<ResponseGetTraficSMSService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const provinces = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/onlinesim/tariffs`,
      params: {
        ...input,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return provinces.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseRequestNumberSMSService = {
  response: string;
  tzid: number;
};

type InputRequestNumberSMSService = {
  service: string;
  country: number;
};
export async function RequestNumberSMSService(
  input: InputRequestNumberSMSService,
): Promise<ResponseRequestNumberSMSService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const provinces = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/onlinesim/request-number`,
      params: {
        ...input,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return provinces.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetActiveNumberSMSService = {
  response: "ERROR_NO_OPERATIONS";
  data: {
    country: number;
    sum: number;
    service: string;
    number: string;
    response: string;
    tzid: number;
    time: number;
    form: string;
    msg?: {
      service: string;
      msg: string;
    }[];
  }[];
};

export async function GetActiveNumberSMSService(): Promise<ResponseGetActiveNumberSMSService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const provinces = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/onlinesim/active-number`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return provinces.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCancelNumberSMSService = {
  response: string;
  tzid: number;
};

type InputCancelNumberSMSService = {
  tzid: number;
};
export async function CancelNumberSMSService(
  input: InputCancelNumberSMSService,
): Promise<ResponseCancelNumberSMSService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const provinces = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/onlinesim/cancel-number`,
      params: {
        ...input,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return provinces.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetBalacneSMSService = {
  response: string;
  balance: string;
  zbalance: number;
};

export async function GetBalacneSMSService(): Promise<ResponseGetBalacneSMSService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const provinces = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/onlinesim/balance`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return provinces.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
