import axios from "axios";
import moment from "moment";
import { parseCookies } from "nookies";

type RequestGetParterPerfomacesByDate = {
  startDate: Date;
  endDate: Date;
  columns: ({ column: column_type } | undefined)[]; // columns can be undefined or an array of objects with a column property of column_type or undefined
};
export type ResponseGetParterPerfomacesByDate = {
  table: TableEntry[];
};

export interface TableEntry {
  columns: Column[];
  reporting: Reporting;
  usm_columns: any[]; // Replace 'any' with a more specific type if possible
  custom_metric_columns: any[]; // Replace 'any' with a more specific type if possible
}

interface Column {
  column_type: column_type;
  id: string;
  label: string;
}

export type column_type = "affiliate" | "offer" | "country" | "sub1";

export interface Reporting {
  imp: number;
  total_click: number;
  unique_click: number;
  invalid_click: number;
  duplicate_click: number;
  gross_click: number;
  ctr: number;
  cv: number;
  invalid_cv_scrub: number;
  view_through_cv: number;
  total_cv: number;
  event: number;
  cvr: number;
  evr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  epc: number;
  rpc: number;
  rpa: number;
  rpm: number;
  payout: number;
  revenue: number;
  event_revenue: number;
  gross_sales: number;
  profit: number;
  margin: number;
  roas: number;
  avg_sale_value: number;
  media_buying_cost: number;
}

export async function GetSummaryParterReportService(
  input: RequestGetParterPerfomacesByDate,
): Promise<Reporting> {
  try {
    if (isNaN(input.startDate.getTime()) || isNaN(input.endDate.getTime())) {
      throw new Error("Invalid date");
    }
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const summary = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/get-summary/by-date`,
      {
        params: {
          startDate: moment(input.startDate).format("YYYY-MM-DD"),
          endDate: moment(input.endDate).format("YYYY-MM-DD"),
          columns: input.columns,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      },
    );

    return summary.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export async function GetParterPerfomacesByDate(
  input: RequestGetParterPerfomacesByDate,
): Promise<{
  [key: string]: {
    summary: TableEntry;
    entries: TableEntry[];
  };
}> {
  try {
    if (isNaN(input.startDate.getTime()) || isNaN(input.endDate.getTime())) {
      throw new Error("Invalid date");
    }
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const partner = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/get-all/by-date`,
      data: {
        startDate: moment(input.startDate).format("YYYY-MM-DD"),
        endDate: moment(input.endDate).format("YYYY-MM-DD"),
        columns: input.columns,
      },
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

export async function GetParterPerfomacesByDayByDayService(
  input: RequestGetParterPerfomacesByDate,
): Promise<ResponseGetParterPerfomacesByDate[]> {
  try {
    if (isNaN(input.startDate.getTime()) || isNaN(input.endDate.getTime())) {
      throw new Error("Invalid date");
    }
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const partner = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/get-all/day-by-day`,
      data: {
        startDate: moment(input.startDate).format("YYYY-MM-DD"),
        endDate: moment(input.endDate).format("YYYY-MM-DD"),
        columns: input.columns,
      },
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
