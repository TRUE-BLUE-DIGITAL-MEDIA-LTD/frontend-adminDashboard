import axios from "axios";
import { parseCookies } from "nookies";
import { Customer, LandingPage, Pagination } from "../models";

export type ResponseGetCustomerByPageService = Pagination<
  Customer & { landingPage: LandingPage }
>;
export type RequestGetCustomerByPageService = {
  page: number;
  limit: number;
};
export async function GetCustomerByPageService(
  input: RequestGetCustomerByPageService,
): Promise<ResponseGetCustomerByPageService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const customer = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/customers`,
      params: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return customer.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
export type ResponseDeleteCustomerService = Customer;
export type RequestDeleteCustomerService = {
  customerId: string;
};
export async function DeleteCustomerService(
  input: RequestDeleteCustomerService,
): Promise<ResponseDeleteCustomerService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const customer = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/customers/${input.customerId}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return customer.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
