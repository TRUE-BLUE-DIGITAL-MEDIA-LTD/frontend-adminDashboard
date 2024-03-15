import axios from "axios";
import Error from "next/error";
import { parseCookies } from "nookies";
import { Category, Domain, LandingPage, Language } from "../../models";

export interface InputCreateLandingPageService {
  title: string;
  domainId?: string | null;
  html: string;
  json: string;
  backgroundImage: string;
  language: Language;
  mainButton: string;
  categoryId?: string;
  directLink?: string;
  name: string;
  icon?: string | null;
  description: string;
  googleAnalyticsId?: string | null;
}
export async function CreateLandingPageService(
  input: InputCreateLandingPageService,
): Promise<LandingPage> {
  console.log(input);
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    if (input.directLink === "") delete input.directLink;
    const landingPage = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/landing-page/create`,
      {
        ...input,
      },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface InputUpdateLandingPageService {
  landingPageId: string;
  title: string;
  domainId?: string | null;
  html: string;
  json: string;
  backgroundImage: string;
  language: Language;
  mainButton: string;
  name: string;
  directLink?: string;
  categoryId: string;
  icon?: string | null;
  description: string;
  googleAnalyticsId: string;
}
export async function UpdateLandingPageService(
  input: InputUpdateLandingPageService,
): Promise<LandingPage> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const landingPage = await axios.put(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/landing-page/update`,
      {
        ...input,
      },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface ResponseGetAllLandingPageService {
  landingPages: {
    id: string;
    createAt: string;
    updateAt: string;
    name: string;
    language: Language;
    domain?: Domain | null;
    category?: Category | null;
  }[];
  totalPages: number;
  currentPage: number;
}
interface InputGetAllLandingPageService {
  page: number;
  query?: {
    categoryId?: string;
    domainId?: string;
    language?: Language | string;
  };
}
export async function GetAllLandingPageService(
  input: InputGetAllLandingPageService,
): Promise<ResponseGetAllLandingPageService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const landingPage = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/landing-page/get-all`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
interface ResponseGetLandingPageService extends LandingPage {
  domain: Domain;
}

interface InputGetLandingPageService {
  landingPageId: string;
}
export async function GetLandingPageService({
  landingPageId,
}: InputGetLandingPageService): Promise<ResponseGetLandingPageService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const landingPage = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/landing-page/get`,
      {
        params: {
          landingPageId,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface ResponseUploadURLSingtureFavorIconService {
  signURL: string;
  contentType: string;
  originalURL: string;
}
interface InputUploadURLSingtureFavorIconService {
  formFiles: FormData;
}
export async function UploadURLSingtureFavorIconService({
  formFiles,
}: InputUploadURLSingtureFavorIconService): Promise<ResponseUploadURLSingtureFavorIconService> {
  try {
    const heic2any = (await import("heic2any")).default;
    const filesOld: any = formFiles.get("file");
    let newFile: any = "";
    if (filesOld.type === "") {
      const blob: any = await heic2any({
        blob: filesOld,
        toType: "image/jpeg",
      });
      const convertFile = new File([blob], filesOld.name, {
        type: "image/jpeg",
      });
      newFile = {
        file: convertFile,
        fileName: convertFile.name,
        fileType: convertFile.type,
      };
    } else {
      newFile = {
        file: filesOld,
        fileName: filesOld.name,
        fileType: filesOld.type,
      };
    }

    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response =
      await axios.post<ResponseUploadURLSingtureFavorIconService>(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/landing-page/upload-signUrl`,
        { fileName: newFile.fileName, fileType: newFile.fileType },
        {
          headers: {
            Authorization: "Bearer " + access_token,
            "Content-Type": "application/json",
          },
        },
      );
    await fetch(response.data.signURL, {
      method: "PUT",
      headers: {
        "Content-Type": `${response.data.contentType}`,
      },
      body: newFile.file,
    }).catch((err) => {
      throw err.response.data;
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface InputDuplicateLandingPageService {
  landingPageId: string;
}
export async function DuplicateLandingPageService(
  input: InputDuplicateLandingPageService,
): Promise<LandingPage> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const landingPage = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/landing-page/duplicate`,
      { ...input },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface ResponseDeleteLandingPageService {
  message: string;
}
interface InputDeleteLandingPageService {
  landingPageId: string;
}
export async function DeleteLandingPageService(
  input: InputDeleteLandingPageService,
): Promise<ResponseDeleteLandingPageService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const landingPage = await axios.delete(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/landing-page/delete`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface InputRemoveDomainNameFromLandingPageService {
  landingPageId: string;
}
export async function RemoveDomainNameFromLandingPageService(
  input: InputRemoveDomainNameFromLandingPageService,
): Promise<LandingPage> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const landingPage = await axios.put(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/landing-page/remove-domain`,
      {
        ...input,
      },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
