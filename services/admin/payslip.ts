import axios from "axios";
import { parseCookies } from "nookies";
import { Payslip, User } from "../../models";

export type ResponseGetAllPayslipByMonthsService = Payslip[];
type InputGetAllPayslipByMonthsService = {
  recordDate: string;
  accessToken?: string;
};

export async function GetAllPayslipByMonthsService(
  input: InputGetAllPayslipByMonthsService,
): Promise<ResponseGetAllPayslipByMonthsService> {
  try {
    let access_token;

    if (input.accessToken) {
      access_token = input.accessToken;
    } else {
      const cookies = parseCookies();
      access_token = cookies.access_token;
    }
    const payslip = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/payslip`,
      params: {
        ...input,
      },
      responseType: "json",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    return payslip.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCreatePaySlipService = Payslip;
type InputCreatePaySlipService = {
  recordDate: string;
  name: string;
  startDate: string;
  salary: number;
  socialSecurity: number;
  bonus: number;
  tax: number;
  deduction: number;
  note?: string;
};

export async function CreatePaySlipService(
  input: InputCreatePaySlipService,
): Promise<ResponseCreatePaySlipService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const payslip = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/payslip`,
      data: {
        ...input,
      },
      responseType: "json",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    return payslip.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseUpdatePayslipService = Payslip;
type InputUpdatePayslipService = {
  query: {
    payslipId: string;
  };
  body: {
    recordDate?: string;
    name?: string;
    startDate?: string;
    salary?: number;
    socialSecurity?: number;
    bonus?: number;
    tax?: number;
    deduction?: number;
    note?: string;
  };
};

export async function UpdatePayslipService(
  input: InputUpdatePayslipService,
): Promise<ResponseUpdatePayslipService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const payslip = await axios({
      method: "PATCH",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/payslip`,
      data: {
        ...input,
      },
      responseType: "json",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    return payslip.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseDeletePayslipService = Payslip;
type InputDeletePayslipService = {
  payslipId: string;
};

export async function DeletePayslipService(
  input: InputDeletePayslipService,
): Promise<ResponseDeletePayslipService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const payslip = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/payslip`,
      params: {
        ...input,
      },
      responseType: "json",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    return payslip.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
