import axios from "axios";
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
    const response = await axios({
      method: "GET",
      url: `https://onlinesim.io/api/getTariffs.php?apikey=${process.env.NEXT_PUBLIC_ONLINESIM_API_KEY}`,
      params: {
        ...input,
      },
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

export type ResponseRequestNumberSMSService = {
  response: string | number;
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
    const response = await axios({
      method: "GET",
      url: `https://onlinesim.io/api/getNum.php?apikey=${process.env.NEXT_PUBLIC_ONLINESIM_API_KEY}`,
      params: {
        ...input,
        dev_id: 6091301,
        number: true,
        lang: "en",
      },
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

export type ResponseGetActiveNumberSMSService = {
  response: "ERROR_NO_OPERATIONS" | string;
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
    const response = await axios({
      method: "GET",
      url: `https://onlinesim.io/api/getState.php?apikey=${process.env.NEXT_PUBLIC_ONLINESIM_API_KEY}`,
      params: {
        message_to_code: 0,
        orderby: "asc",
        msg_list: 1,
        clean: 0,
        lang: "en",
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    if (response.data instanceof Array) {
      return {
        response: "OK",
        data: response.data,
      };
    } else {
      return {
        response: response.data.response,
        data: [],
      };
    }
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCancelNumberSMSService = {
  response: string | number;
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
    const response = await axios({
      method: "GET",
      url: `https://onlinesim.io/api/setOperationOk.php?apikey=${process.env.NEXT_PUBLIC_ONLINESIM_API_KEY}`,
      params: {
        ...input,
        ban: 1,
        lang: "en",
      },
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

export type ResponseGetBalacneSMSService = {
  response: string;
  balance: string;
  zbalance: number;
};

export async function GetBalacneSMSService(): Promise<ResponseGetBalacneSMSService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `https://onlinesim.io/api/getBalance.php?apikey=${process.env.NEXT_PUBLIC_ONLINESIM_API_KEY}`,
      params: {
        income: true,
        lang: "en",
      },
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
