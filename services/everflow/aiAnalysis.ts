import axios from "axios";
import moment from "moment";
import { parseCookies } from "nookies";

export type AiAnalysisLanguage = "en" | "th";

export type AiAnalysisResponse = {
  noData?: boolean;
  /** ISO 4217 code the payout figures are in; absent from older backends. */
  currency?: string;
  headline: string;
  leaders: { name: string; payout: number; note: string }[];
  countries: { country: string; note: string }[];
  bestHours: { range: string; country?: string; note: string }[];
  insights: string[];
};

export async function GetAiAnalysisService(input: {
  startDate: Date;
  endDate: Date;
  timezone?: string;
  language: AiAnalysisLanguage;
}): Promise<AiAnalysisResponse> {
  try {
    if (isNaN(input.startDate.getTime()) || isNaN(input.endDate.getTime())) {
      throw new Error("Invalid date");
    }
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/ai-analysis`,
      {
        startDate: moment(input.startDate).format("YYYY-MM-DD"),
        endDate: moment(input.endDate).format("YYYY-MM-DD"),
        timezone: input.timezone,
        language: input.language,
      },
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );
    return res.data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data ?? err;
  }
}
