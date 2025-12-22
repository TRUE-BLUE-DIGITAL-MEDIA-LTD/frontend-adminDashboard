import axios from "axios";
import { parseCookies } from "nookies";
import {
  CheckProxyResponseData,
  CloudPhone,
  CloudPhoneWithDetails,
  CreateCloudPhoneDto,
  CreateProxyDto,
  DeleteProxyDto,
  GetGpsDto,
  GetProxiesDto,
  ProxyItem,
  SetGpsDto,
  UpdateCloudPhoneDto,
  UpdateProxyDto,
} from "../models/cloud-phone.model";
import { Pagination } from "../models/pagination.model";

export async function CreateCloudPhoneService(
  data: CreateCloudPhoneDto,
): Promise<CloudPhone> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/cloud-phones`,
      data,
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

export async function UpdateCloudPhoneService(
  data: UpdateCloudPhoneDto,
): Promise<any> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "PUT",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/cloud-phones`,
      data,
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

export async function GetGpsService(dto: GetGpsDto): Promise<any> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/cloud-phones/gps/get`,
      data: dto,
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

export async function SetGpsService(dto: SetGpsDto): Promise<any> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/cloud-phones/gps/set`,
      data: dto,
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

export async function GetCloudPhonesService(): Promise<
  CloudPhoneWithDetails[]
> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/cloud-phones`,
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

export async function StartCloudPhoneService(
  id: string,
): Promise<{ url: string }> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/cloud-phones/start/${id}`,
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

export async function StopCloudPhoneService(id: string): Promise<void> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/cloud-phones/stop/${id}`,
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

export async function DeleteCloudPhoneService(id: string): Promise<void> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/cloud-phones/${id}`,
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

export async function GetProxiesService(
  dto: GetProxiesDto,
): Promise<Pagination<ProxyItem & { data: CheckProxyResponseData }>> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/cloud-phones/proxies`,
      params: dto,
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

export async function CreateProxyService(
  data: CreateProxyDto,
): Promise<ProxyItem> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/cloud-phones/proxies`,
      data,
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

export async function UpdateProxyService(
  data: UpdateProxyDto,
): Promise<ProxyItem> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "PUT",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/cloud-phones/proxies`,
      data,
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

export async function DeleteProxyService(dto: DeleteProxyDto): Promise<void> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/cloud-phones/proxies/${dto.id}`,
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
