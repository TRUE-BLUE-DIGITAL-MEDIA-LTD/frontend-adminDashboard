import axios from "axios";
import { parseCookies } from "nookies";
import { LanderAnalyticsDetail, LanderAnalyticsRow } from "../../models";

const base = () => `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/analytics`;
const auth = () => {
  const access_token = parseCookies().access_token;
  return { headers: { Authorization: "Bearer " + access_token } };
};

export async function ListLanderAnalyticsService(params: {
  from?: string;
  to?: string;
  domainId?: string;
  search?: string;
}): Promise<{ rows: LanderAnalyticsRow[] }> {
  try {
    const { data } = await axios.get(`${base()}/landers`, {
      ...auth(),
      params,
    });
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data ?? err;
  }
}

export async function GetLanderAnalyticsDetailService(
  landingPageId: string,
  params: { from?: string; to?: string },
): Promise<LanderAnalyticsDetail> {
  try {
    const { data } = await axios.get(`${base()}/landers/${landingPageId}`, {
      ...auth(),
      params,
    });
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data ?? err;
  }
}
