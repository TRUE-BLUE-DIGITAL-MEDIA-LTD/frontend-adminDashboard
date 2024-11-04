import axios from "axios";
import { parseCookies } from "nookies";
import { DeviceUser } from "../../models";

export type ResponseGetDeviceUsersService = DeviceUser[];
export async function GetDeviceUsersService(): Promise<ResponseGetDeviceUsersService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/device-user`,
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
export type ResponseCreateDeviceUserService = DeviceUser;

type InputCreateDeviceUserService = {
  portNumber: string;
  url: string;
  country: string;
  username: string;
  password: string;
};
export async function CreateDeviceUserService(
  input: InputCreateDeviceUserService,
): Promise<ResponseCreateDeviceUserService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/device-user`,
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

export type ResponseUpdateDeviceUserService = DeviceUser;

type InputUpdateDeviceUserService = {
  query: {
    deviceId: string;
  };
  body: {
    portNumber: string;
  };
};
export async function UpdateDeviceUserService(
  input: InputUpdateDeviceUserService,
): Promise<ResponseUpdateDeviceUserService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/device-user`,
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

export type ResponseDeleteDeviceUserService = { message: string };

type InputDeleteDeviceUserService = {
  deviceId: string;
};
export async function DeleteDeviceUserService(
  input: InputDeleteDeviceUserService,
): Promise<ResponseDeleteDeviceUserService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/device-user/${input.deviceId}`,
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
