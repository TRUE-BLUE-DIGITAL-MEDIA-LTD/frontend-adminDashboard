import axios from "axios";
import Error from "next/error";
import { parseCookies } from "nookies";

interface ResponseGetEmailsByPageService {
  emails: {
    id: string;
    createAt: string;
    updateAt: string;
    email: string;
    name: string | null;
    isValidate: boolean;
    landingPageId: string;
    landingPages: {
      name: string;
      id: string;
    };
  }[];
  totalPages: number;
  currentPage: number;
}

interface InputGetEmailsByPageService {
  page: number;
  orderBy: "email" | "createAt";
  isAsc: boolean;
}
export async function GetEmailsByPageService(
  input: InputGetEmailsByPageService,
): Promise<ResponseGetEmailsByPageService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const emails = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/email/get-all`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return emails.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface ResponseDeleteCustomerEmailService {
  message: string;
}

interface InputDeleteCustomerEmailService {
  emailId: string;
}
export async function DeleteCustomerEmailService(
  input: InputDeleteCustomerEmailService,
): Promise<ResponseDeleteCustomerEmailService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const emails = await axios.delete(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/email/delete`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return emails.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
