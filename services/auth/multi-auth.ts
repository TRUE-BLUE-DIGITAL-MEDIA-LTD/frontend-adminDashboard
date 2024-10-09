import axios from "axios";
import { parseCookies } from "nookies";
import { User } from "../../models";

export async function GenerateTOTPService(): Promise<{
  url: string;
}> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const totp = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/generate-totp`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return totp.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestVerifyTOTPService = {
  code: string;
};
export async function VerifyTOTPService(
  request: RequestVerifyTOTPService,
): Promise<{
  access_token: string;
  recoveryCode: string[];
  user: User;
}> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const totp = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/verify-totp`,
      data: request,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return totp.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestValidatePasscodeTOTPService = {
  code: string;
  email: string;
};
export async function ValidatePasscodeTOTPService(
  request: RequestValidatePasscodeTOTPService,
): Promise<{
  access_token: string;
  user: User;
}> {
  try {
    const totp = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/validate-passcode`,
      data: request,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return totp.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}

type RequestBackupTOTPService = {
  recoveryCode: string[];
  email: string;
};
export async function BackupTOTPService(
  request: RequestBackupTOTPService,
): Promise<{
  url: string;
}> {
  try {
    const totp = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/backup-totp`,
      data: request,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return totp.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
