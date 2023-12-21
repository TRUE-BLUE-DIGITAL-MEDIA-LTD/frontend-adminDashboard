import axios from "axios";
import Error from "next/error";
import { parseCookies } from "nookies";
import { LandingPage } from "../../interfaces";

interface InputCreateLandingPageService {
  title: string;
  domainId?: string | null;
  html: string;
  json: JSON;
  backgroundImage: string;
  language: "en" | "es" | "fr" | "de";
  mainButton: string;
  name: string;
  popUpUnder: string;
  icon: string;
  description: string;
}
export async function CreateLandingPageService(
  input: InputCreateLandingPageService
): Promise<LandingPage> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    const landingPage = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/landing-page/create`,
      {
        ...input,
      },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

interface InputUpdateLandingPageService {
  title: string;
  domainId?: string | null;
  html: string;
  json: JSON;
  backgroundImage: string;
  language: "en" | "es" | "fr" | "de";
  mainButton: string;
  name: string;
  popUpUnder: string;
  icon: string;
  description: string;
}
export async function UpdateLandingPageService(
  input: InputUpdateLandingPageService
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
      }
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

interface ResponseGetAllLandingPageService {
  landingPages: {
    id: string;
    createAt: string;
    updateAt: string;
    name: string;
    language: string;
    domain: {
      id: string;
      name: string;
    };
  }[];
  totalPages: number;
  currentPage: number;
}
interface InputGetAllLandingPageService {
  page: number;
}
export async function GetAllLandingPageService(
  input: InputGetAllLandingPageService
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
      }
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

interface ResponseGetLandingPageService {
  landingPages: {
    id: string;
    createAt: string;
    updateAt: string;
    name: string;
    language: string;
    html: string;
    domain: {
      id: string;
      name: string;
    };
  }[];
  totalPages: number;
  currentPage: number;
}
interface InputGetLandingPageService {
  landingPageId: string;
}
export async function GetLandingPageService(
  input: InputGetLandingPageService
): Promise<ResponseGetLandingPageService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const landingPage = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/landing-page/get`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
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
export async function UploadURLSingtureFavorIconService(
  input: InputUploadURLSingtureFavorIconService
): Promise<ResponseUploadURLSingtureFavorIconService> {
  try {
    const { formFiles } = input;
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
        }
      );
    await fetch(response.data.signURL, {
      method: "PUT",
      headers: {
        "Content-Type": `${response.data.contentType}`,
      },
      body: newFile.file,
    }).catch((err) => {
      throw new Error(err);
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

interface InputDuplicateLandingPageService {
  landingPageId: string;
}
export async function DuplicateLandingPageService(
  input: InputDuplicateLandingPageService
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
      }
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

interface ResponseDeleteLandingPageService {
  message: string;
}
interface InputDeleteLandingPageService {
  landingPageId: string;
}
export async function DeleteLandingPageService(
  input: InputDeleteLandingPageService
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
      }
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}

interface InputRemoveDomainNameFromLandingPageService {
  landingPageId: string;
}
export async function RemoveDomainNameFromLandingPageService(
  input: InputRemoveDomainNameFromLandingPageService
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
      }
    );

    return landingPage.data;
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
}
