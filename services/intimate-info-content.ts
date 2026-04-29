import axios from "axios";
import { parseCookies } from "nookies";

export interface GetIntimateInfoContentsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
}

export type IntimateInfoContent = {
  id: string;
  createAt: string;
  updateAt: string;
  title: string;
  status: "unpublish" | "publish";
  html?: string;
  content?: string;
  excerpt?: string;
  slug?: string;
  author?: string;
  category?: string;
  featuredImage?: string;
  focusKeyword?: string;
  metaTitle?: string;
  permalink?: string;
  metaDescription?: string;
  qaCheck?: "Fail" | "Edit_Needed" | "Pass";
};

export async function getIntimateInfoContents(
  params: GetIntimateInfoContentsParams,
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

export function parseGeneratedText(text: string) {
  const thoughtRegex = /---THOUGHT---\n([\s\S]*?)(?:\n---END_THOUGHT---|$)/g;
  let thoughts = "";
  let match;
  while ((match = thoughtRegex.exec(text)) !== null) {
    thoughts += match[1] + "\n\n";
  }

  const cleanText = text.replace(
    /---THOUGHT---\n[\s\S]*?(?:\n---END_THOUGHT---\n?|$)/g,
    "",
  );

  const slugMatch = cleanText.match(/---SLUG---\n([\s\S]*?)(?=\n---|$)/);
  const metaTitleMatch = cleanText.match(
    /---META_TITLE---\n([\s\S]*?)(?=\n---|$)/,
  );
  const metaDescMatch = cleanText.match(
    /---META_DESCRIPTION---\n([\s\S]*?)(?=\n---|$)/,
  );
  const htmlMatch = cleanText.match(/---HTML---\n([\s\S]*)$/);

  return {
    thought: thoughts.trim(),
    slug: slugMatch ? slugMatch[1].trim() : "",
    metaTitle: metaTitleMatch ? metaTitleMatch[1].trim() : "",
    metaDescription: metaDescMatch ? metaDescMatch[1].trim() : "",
    html: htmlMatch ? htmlMatch[1].trim() : "",
    cleanText,
  };
}

export async function generateHtmlForContent(
  dto: {
    title: string;
    keyword: string;
    excerpt: string;
  },
  onChunk?: (text: string) => void,
): Promise<{
  slug: string;
  metaTitle: string;
  metaDescription: string;
  html: string;
}> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/intimate-info-content/generate-html`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token,
        },
        body: JSON.stringify(dto),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        if (onChunk) onChunk(fullText);
      }
    }

    return parseGeneratedText(fullText);
  } catch (err: any) {
    throw err;
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
