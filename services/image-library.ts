import axios from "axios";
import { parseCookies } from "nookies";
import { ImageLibrary, Pagination } from "../models";

export type ResponseGetImageLibraryService = Pagination<ImageLibrary>;
type InputGetImageLibraryService = {
  page: number;
  limit: number;
  searchField?: string;
};
export async function GetImageLibraryService(
  input: InputGetImageLibraryService,
): Promise<ResponseGetImageLibraryService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    if (input.searchField === "") {
      delete input.searchField;
    }
    const image = await axios({
      method: "GET",
      params: input,
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/image-library`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return image.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCreateImageLibraryService = ImageLibrary;
type InputCreateImageLibraryService = {
  title: string;
  category?: string;
  tag?: string;
  url: string;
  type: string;
  size: number;
  blurHash:string
};
export async function CreateImageLibraryService(
  input: InputCreateImageLibraryService,
): Promise<ResponseCreateImageLibraryService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const image = await axios({
      method: "POST",
      data: input,
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/image-library`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return image.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseUpdateImageLibraryService = ImageLibrary;
type InputUpdateImageLibraryService = {
  query: {
    imageLibraryId: string;
  };
  body: {
    title?: string;
    category?: string;
    tag?: string;
  };
};
export async function UpdateImageLibraryService(
  input: InputUpdateImageLibraryService,
): Promise<ResponseUpdateImageLibraryService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const image = await axios({
      method: "PATCH",
      data: input,
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/image-library`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return image.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseDeleteImageLibraryService = { message: string };
type InputDeleteImageLibraryService = {
  id: string;
};
export async function DeleteImageLibraryService(
  input: InputDeleteImageLibraryService,
): Promise<ResponseDeleteImageLibraryService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const image = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/image-library/${input.id}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return image.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
