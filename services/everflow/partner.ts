import axios from "axios";
import { parseCookies } from "nookies";

type RequestGetParterPerfomacesByDate = {
  startDate: string;
  endDate: string;
};
export type ResponseRequestGetParterPerfomacesByDate = {
  table: TableEntry[];
};

export interface TableEntry {
  columns: Column[];
  reporting: Reporting;
  usm_columns: any[]; // Replace 'any' with a more specific type if possible
  custom_metric_columns: any[]; // Replace 'any' with a more specific type if possible
}

interface Column {
  column_type: string;
  id: string;
  label: string;
}

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
  input: RequestGetParterPerfomacesByDate
): Promise<Reporting> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const summary = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/get-summary/by-date`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );

    return summary.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export async function GetParterPerfomacesByDate(
  input: RequestGetParterPerfomacesByDate
): Promise<ResponseRequestGetParterPerfomacesByDate> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const partner = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/get-all/by-date`,
      {
        params: {
          ...input,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );

    return partner.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}