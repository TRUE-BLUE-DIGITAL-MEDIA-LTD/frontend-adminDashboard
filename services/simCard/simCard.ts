import axios from "axios";
import { parseCookies } from "nookies";
import {
  DeviceUser,
  MessageOnSimcard,
  Pagination,
  Partner,
  SimCard,
  SimCardOnPartner,
  StatusPort,
  TagOnSimcard,
} from "../../models";
import { NativeEventSource, EventSourcePolyfill } from "event-source-polyfill";

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

export type ResponseGetSimCardByPageService = Pagination<
  SimCard & {
    simcardOnPartner: SimCardOnPartner & { partner: Partner };
    tag: TagOnSimcard[];
  }
>;

type InputGetSimCardByPageService = {
  limit: number;
  page: number;
  searchField: string;
  partnerId?: string;
  availability: "available" | "unavailable";
  deviceId?: string;
  isActive?: boolean;
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

export type ResponseGetSimCardActiveService = (SimCard & {
  messages?: MessageOnSimcard[];
})[];

export async function GetSimCardActiveService(): Promise<ResponseGetSimCardActiveService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-card/option/active`,
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

export function SSEGetSimCardActiveService(): EventSource {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  const eventSource = new EventSourcePolyfill(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-card/stream/active-sim-cards`,
    {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    },
  );
  return eventSource;
}

export type ResponseGetSimCardByIdService = {
  simCard: SimCard & {
    deviceUser: DeviceUser;
    tags: TagOnSimcard[];
    partner: SimCardOnPartner;
  };
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

export type ResponseGetSimCardMessageService = {
  simCard: SimCard & { deviceUser: DeviceUser };
  messages: MessageOnSimcard[];
  status: StatusPort;
};

type InputGetSimCardMessageService = {
  simCardId: string;
};
export async function GetSimCardMessageService(
  input: InputGetSimCardMessageService,
): Promise<ResponseGetSimCardMessageService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-card/${input.simCardId}/message`,
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
  simCardNote?: string | null;
  lastUsedAt?: string | null;
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

export type ResponseActiveSimCardService = SimCard;

type InputActiveSimCardService = {
  simCardId: string;
};
export async function ActiveSimCardService(
  input: InputActiveSimCardService,
): Promise<ResponseActiveSimCardService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-card/${input.simCardId}/active`,
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

export type ResponseDeactiveSimCardService = SimCard;

type InputDeactiveSimCardService = {
  simCardId: string;
};
export async function DeactiveSimCardService(
  input: InputDeactiveSimCardService,
): Promise<ResponseDeactiveSimCardService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-card/${input.simCardId}/deactive`,
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

export type ResponseAutoPopulateNumberService = {
  type: string;
  seq: number;
  expires: number;
  mac: string;
  ip: string;
  ver: string;
  "max-ports": number;
  "max-slot": number;
  status: {
    port: string;
    sim: string;
    seq: number;
    st: number;
    imei: string;
    active: number;
    inserted: number;
    slot_active: number;
    iccid: string;
    imsi: string;
    sn: string;
    opr: string;
    bal: string;
    sig: number;
  }[];
};

type InputAutoPopulateNumberService = {
  portServer: string;
};
export async function AutoPopulateNumberService(
  input: InputAutoPopulateNumberService,
): Promise<ResponseAutoPopulateNumberService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-card/populate-sn`,
      data: input,
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

export async function SyncSimCardService(): Promise<
  {
    deviceId: string;
    port: string;
    sim: string;
    seq: number;
    st: number;
    imei: string;
    active: number;
    inserted: number;
    slot_active: number;
    iccid: string;
    imsi: string;
    sn: string;
    opr: string;
    bal: string;
    sig: number;
  }[]
> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sim-card/sync`,
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
