import axios from "axios";
import { parseCookies } from "nookies";
import { HistoryRecord, Pagination, User } from "../models";

export type ResponseGetHistoryRecordService = Pagination<
  HistoryRecord & { user: User }
> & {
  total_active_simcards: number;
};
type InputGetHistoryRecordService = {
  page: number;
  limit: number;
  filter: {
    action?: string;
    data?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    check_usage: "normal" | "oxy_sms";
  };
};
export async function GetHistoryRecordService(
  input: InputGetHistoryRecordService,
): Promise<ResponseGetHistoryRecordService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const history = await axios({
      method: "POST",
      data: { ...input },
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/history-records`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });
    return history.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
