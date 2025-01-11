import axios from "axios";
import { parseCookies } from "nookies";
import { Announcement, AnnouncementStatus, Pagination } from "../models";

export type ResponseGetByPageAnnouncementService = Pagination<Announcement>;
export type RequestGetByPageAnnouncementService = {
  page: number;
  limit: number;
};
export async function GetByPageAnnouncementService(
  input: RequestGetByPageAnnouncementService,
): Promise<ResponseGetByPageAnnouncementService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const announcement = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/announcements/by-page`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      params: input,
      responseType: "json",
    });
    return announcement.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseGetAnnouncementService = Announcement;

export async function GetAnnouncementService(): Promise<ResponseGetAnnouncementService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const announcement = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/announcements/latest`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return announcement.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCreateAnnouncementService = Announcement;
export type InputCreateAnnouncementService = {
  title: string;
  description: string;
  beginAt: string;
  expireAt: string;
  status: AnnouncementStatus;
};
export async function CreateAnnouncementService(
  input: InputCreateAnnouncementService,
): Promise<ResponseCreateAnnouncementService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const announcement = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/announcements`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      data: input,
      responseType: "json",
    });
    return announcement.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseDeleteAnnouncementService = Announcement;
export type InputDeleteAnnouncementService = {
  id: string;
};
export async function DeleteAnnouncementService(
  input: InputDeleteAnnouncementService,
): Promise<ResponseDeleteAnnouncementService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const announcement = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/announcements/${input.id}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return announcement.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
