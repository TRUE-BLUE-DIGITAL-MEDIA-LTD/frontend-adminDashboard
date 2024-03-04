import axios from "axios";
import { parseCookies } from "nookies";

type ResponseVerifyDomainService = {
  root: string;
  subdomain: string;
  results: {
    domain: string;
    result: boolean;
    cdnTier?: "regular";
    error?: string;
  }[];
};
export async function VerifyDomainService({
  domainName,
}: {
  domainName: string;
}): Promise<ResponseVerifyDomainService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const verify = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/netlify/verify-domain`,
      params: {
        domain: domainName,
      },
      responseType: "json",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + access_token,
      },
    });
    return verify.data;
  } catch (error: any) {
    console.log(error);
    throw error.response.data;
  }
}
