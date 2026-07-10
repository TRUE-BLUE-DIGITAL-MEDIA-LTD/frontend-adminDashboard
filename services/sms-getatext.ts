import axios from "axios";
import { parseCookies } from "nookies";
import {
  GetatextPrice,
  SmsGetatext,
  SmsGetatextAccount,
  SmsGetatextDelayedMessage,
  SmsGetatextMessage,
  SmsGetatextNoSmsRow,
} from "../models";

export const getActiveSmsGetatextNumbers = async (): Promise<
  (SmsGetatext & { messages: SmsGetatextMessage[] })[]
> => {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-getatext`,
    {
      withCredentials: true,
      headers: {
        Authorization: "Bearer " + access_token,
      },
    },
  );
  return response.data;
};

export const getSmsGetatextPrices = async (): Promise<any> => {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-getatext/prices-info`,
    {
      withCredentials: true,
      headers: {
        Authorization: "Bearer " + access_token,
      },
    },
  );
  return response.data;
};

export const buySmsGetatextNumber = async (dto: {
  service: string;
  max_price?: number;
  carrier?: string;
  keep_carrier?: boolean;
  lock_area_code?: boolean;
  area_codes?: string;
}): Promise<SmsGetatext> => {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-getatext/rent-a-number`,
      dto,
      {
        withCredentials: true,
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error("Error buying number from SmsGetatext", error);
    throw error.response.data;
  }
};

export const cancelSmsGetatextNumber = async (dto: {
  id: string;
}): Promise<any> => {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-getatext/cancel-rental`,
    dto,
    {
      withCredentials: true,
      headers: {
        Authorization: "Bearer " + access_token,
      },
    },
  );
  return response.data;
};

export const completeSmsGetatextNumber = async (id: string): Promise<any> => {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-getatext/rental-status/${id}/completed`,
    {},
    {
      withCredentials: true,
      headers: {
        Authorization: "Bearer " + access_token,
      },
    },
  );
  return response.data;
};

export const getSmsGetatextBalance = async (): Promise<{ balance: number }> => {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-getatext/balance`,
    {
      withCredentials: true,
      headers: {
        Authorization: "Bearer " + access_token,
      },
    },
  );
  return response.data;
};

export const getHistorySmsGetatext = async (dto: {
  limit: number;
  page: number;
}): Promise<{
  data: (SmsGetatext & { messages: SmsGetatextMessage[] })[];
  totalPage: number;
}> => {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-getatext/history?limit=${dto.limit}&page=${dto.page}`,
    {
      withCredentials: true,
      headers: {
        Authorization: "Bearer " + access_token,
      },
    },
  );
  return response.data;
};

export const getActiveSmsGetatextAccounts = async (): Promise<
  SmsGetatextAccount[]
> => {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-getatext-accounts`,
    {
      withCredentials: true,
      headers: {
        Authorization: "Bearer " + access_token,
      },
    },
  );
  return response.data;
};

export const setActiveSmsGetatextAccount = async (dto: {
  id: string;
}): Promise<any> => {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-getatext-accounts/active/${dto.id}`,
    {},
    {
      withCredentials: true,
      headers: {
        Authorization: "Bearer " + access_token,
      },
    },
  );
  return response.data;
};

export const getSmsGetatextDelayedReport = async (dto: {
  from: string;
  to: string;
}): Promise<SmsGetatextDelayedMessage[]> => {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-getatext/delayed-report?from=${encodeURIComponent(
      dto.from,
    )}&to=${encodeURIComponent(dto.to)}`,
    {
      withCredentials: true,
      headers: {
        Authorization: "Bearer " + access_token,
      },
    },
  );
  return response.data;
};

export const getSmsGetatextNoSmsReport = async (dto: {
  from: string;
  to: string;
  serviceCode?: string;
}): Promise<SmsGetatextNoSmsRow[]> => {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  const params = new URLSearchParams({ from: dto.from, to: dto.to });
  if (dto.serviceCode) {
    params.set("serviceCode", dto.serviceCode);
  }
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-getatext/no-sms-report?${params.toString()}`,
    {
      withCredentials: true,
      headers: {
        Authorization: "Bearer " + access_token,
      },
    },
  );
  return response.data;
};
