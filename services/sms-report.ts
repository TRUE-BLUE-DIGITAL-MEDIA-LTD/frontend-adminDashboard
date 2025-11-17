import {
  CreateSmsReportDto,
  FindAllSmsReportDto,
  SmsReport,
  UpdateSmsReportDto,
} from "@/models/sms-report.model";
import { Pagination } from "@/models/pagination.model";
import axios from "axios";
import { parseCookies } from "nookies";

export type ResponseFindAllSmsReport = Pagination<SmsReport>;

export async function createSmsReport(
  dto: CreateSmsReportDto,
): Promise<SmsReport> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const { data } = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-reports`,
      data: dto,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export async function findAllSmsReport(
  dto: FindAllSmsReportDto,
): Promise<ResponseFindAllSmsReport> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const { data } = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-reports`,
      params: dto,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export async function findOneSmsReport(id: string): Promise<SmsReport> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const { data } = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-reports/${id}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export async function updateSmsReport(
  id: string,
  dto: UpdateSmsReportDto,
): Promise<SmsReport> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const { data } = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-reports/${id}`,
      data: dto,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export async function removeSmsReport(id: string): Promise<SmsReport> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const { data } = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sms-reports/${id}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
