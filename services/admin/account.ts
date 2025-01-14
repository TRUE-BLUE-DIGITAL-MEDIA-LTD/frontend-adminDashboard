import axios from "axios";
import Error from "next/error";
import { parseCookies } from "nookies";
import { BonusCalculatePeriod, Partner, Role, User } from "../../models";

export interface ResponseGetAllAccountByPageService {
  accounts: (User & { partner: Partner | null })[];
  totalPages: number;
  currentPage: number;
}
interface InputGetAllAccountByPageService {
  page: number;
  limit: number;
}

export async function GetAllAccountByPageService(
  input: InputGetAllAccountByPageService,
): Promise<ResponseGetAllAccountByPageService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const users = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/account/get-all`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return users.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface ResponseCreateAccountService {
  id: string;
  createAt: Date;
  updateAt: Date;
  email: string;
  name: string;
  image: string;
  provider: string;
  role: string;
  isDeleted: boolean;
  resetToken: string;
  resetTokenExpiresAt: Date;
  IsResetPassword: boolean;
}
interface InputCreateAccountService {
  email: string;
  name: string;
  password: string;
  role: Role;
}
export async function CreateAccountService(
  input: InputCreateAccountService,
): Promise<ResponseCreateAccountService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const user = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/account/create`,
      { ...input },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return user.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface ResponseEditAccountService {
  id: string;
  createAt: Date;
  updateAt: Date;
  email: string;
  name: string;
  image: string;
  provider: string;
  role: string;
  isDeleted: boolean;
  resetToken: string;
  resetTokenExpiresAt: Date;
  IsResetPassword: boolean;
}
interface InputEditAccountService {
  email?: string;
  name?: string;
  role?: Role;
  bonusCalculatePeriod?: BonusCalculatePeriod;
  userId: string;
}
export async function EditAccountService(
  input: InputEditAccountService,
): Promise<ResponseEditAccountService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;

    const user = await axios.put(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/account/update`,
      { ...input },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return user.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface ResponseResetPasswordAccountService {
  id: string;
  createAt: Date;
  updateAt: Date;
  email: string;
  name: string;
  image: string;
  provider: string;
  role: string;
  isDeleted: boolean;
  resetToken: string;
  resetTokenExpiresAt: Date;
  IsResetPassword: boolean;
}
interface InputResetPasswordAccountService {
  newPassword: string;
  userId: string;
}
export async function ResetPasswordAccountService(
  input: InputResetPasswordAccountService,
): Promise<ResponseResetPasswordAccountService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const user = await axios.put(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/account/reset-password`,
      { ...input },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return user.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

interface ResponseDeleteAccountService {
  message: string;
}
interface InputDeleteAccountService {
  userId: string;
}
export async function DeleteAccountService(
  input: InputDeleteAccountService,
): Promise<ResponseDeleteAccountService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const user = await axios.delete(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/account/delete`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return user.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
