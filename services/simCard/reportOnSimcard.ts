import axios from "axios";
import { parseCookies } from "nookies";
import { Priority, ReportOnSimCard } from "../../models";

export type ResponseCreateReportOnSimCardService = ReportOnSimCard;
export type RequestCreateReportOnSimCardService = {
  type: string;
  description?: string;
  priority: Priority;
  simCardId: string;
};

export async function CreateReportOnSimCardService(
  request: RequestCreateReportOnSimCardService,
): Promise<ResponseCreateReportOnSimCardService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/simcard-reports`,
      data: {
        ...request,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return simcard.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseDeleteReportOnSimCardService = ReportOnSimCard;
export type RequestDeleteReportOnSimCardService = {
  reportOnSimCardId: string;
};

export async function DeleteReportOnSimCardService(
  request: RequestDeleteReportOnSimCardService,
): Promise<ResponseDeleteReportOnSimCardService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const simcard = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/simcard-reports/${request.reportOnSimCardId}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return simcard.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
