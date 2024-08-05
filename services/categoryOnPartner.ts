import axios from "axios";
import { parseCookies } from "nookies";
import { CategoryOnPartner } from "../models";

type InputGetCategoryPartnerByPartnerIdService = {
  partnerId: string;
};

export type ResponseGetCategoryPartnerByPartnerIdService = CategoryOnPartner[];
export async function GetCategoryPartnerByPartnerIdService(
  input: InputGetCategoryPartnerByPartnerIdService,
): Promise<ResponseGetCategoryPartnerByPartnerIdService> {
  {
    try {
      const cookies = parseCookies();
      const access_token = cookies.access_token;
      const partner = await axios({
        method: "GET",
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/category-on-partners/partner/${input.partnerId}`,
        responseType: "json",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });

      return partner.data;
    } catch (err: any) {
      console.log(err);
      throw err.response.data;
    }
  }
}

type InputCreateCategoryOnPartnerService = {
  partnerId: string;
  categoryId: string;
};

export type ResponseCreateCategoryOnPartnerService = CategoryOnPartner;
export async function CreateCategoryOnPartnerService(
  input: InputCreateCategoryOnPartnerService,
): Promise<ResponseCreateCategoryOnPartnerService> {
  {
    try {
      const cookies = parseCookies();
      const access_token = cookies.access_token;
      const partner = await axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/category-on-partners`,
        data: input,
        responseType: "json",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });

      return partner.data;
    } catch (err: any) {
      console.log(err);
      throw err.response.data;
    }
  }
}

type InputDeleteCategoryOnPartnerService = {
  categoryOnPartnerId: string;
};

export type ResponseDeleteCategoryOnPartnerService = { message: string };
export async function DeleteCategoryOnPartnerService(
  input: InputDeleteCategoryOnPartnerService,
): Promise<ResponseDeleteCategoryOnPartnerService> {
  {
    try {
      const cookies = parseCookies();
      const access_token = cookies.access_token;
      const partner = await axios({
        method: "DELETE",
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/category-on-partners/${input.categoryOnPartnerId}`,
        responseType: "json",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });

      return partner.data;
    } catch (err: any) {
      console.log(err);
      throw err.response.data;
    }
  }
}
