import axios from "axios";
import { parseCookies } from "nookies";

export type IntimateInfoContent = {
  id: string;
  createAt: string;
  updateAt: string;
  keyword?: string;
  title: string;
  status: "unpublish" | "publish";
  html?: string;
  content?: string;
  excerpt?: string;
  slug?: string;
  author?: string;
  category?: string;
  focusKeyword?: string;
  metaTitle?: string;
  permalink?: string;
  metaDescription?: string;
  qaCheck?: "Fail" | "Edit_Needed" | "Pass";
};

export async function getIntimateInfoContents(
  params: any,
): Promise<{ data: IntimateInfoContent[]; meta: any }> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/intimate-info-content`,
      params,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
}

export async function getIntimateInfoContent(
  id: string,
): Promise<IntimateInfoContent> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/intimate-info-content/${id}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
}

export async function createIntimateInfoContent(
  payload: any,
): Promise<IntimateInfoContent> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/intimate-info-content`,
      data: payload,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
}

export async function updateIntimateInfoContent({
  id,
  ...payload
}: any): Promise<IntimateInfoContent> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/intimate-info-content/${id}`,
      data: payload,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
}

export async function deleteIntimateInfoContent(id: string): Promise<any> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/intimate-info-content/${id}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
}

export async function generateHtmlForContent(dto: {
  title: string;
  keyword: string;
  excerpt: string;
}): Promise<string> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      data: dto,
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/intimate-info-content/generate-html`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
}

export async function uploadToWordpress(id: string): Promise<any> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/intimate-info-content/${id}/upload-to-wordpress`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
}

export async function getWordpressCategories(): Promise<any> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/intimate-info-content/wordpress/categories`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
}

export async function getWordpressAuthors(): Promise<any> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/intimate-info-content/wordpress/authors`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
}
