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

export interface Column {
  column_type: column_type;
  id: string;
  label: string;
}

export type column_type =
  | "affiliate"
  | "offer"
  | "country"
  | "sub1"
  | "campaign";

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
    const summary = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/get-summary/by-date`,
      {
        startDate: moment(input.startDate).format("YYYY-MM-DD"),
        endDate: moment(input.endDate).format("YYYY-MM-DD"),
        columns: input.columns,
      },
      {
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

/**
 * Represents the structure for an Offer.
 */
export interface Offer {
  network_offer_id: number;
  network_id: number;
  name: string;
  offer_status: string;
}

/**
 * Represents the structure for an Advertiser.
 */
export interface Advertiser {
  network_advertiser_id: number;
  network_id: number;
  name: string;
  account_status: string;
}

/**
 * Represents the structure for an Account Manager.
 */
export interface AccountManager {
  network_employee_id: number;
  network_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  account_status: string;
}

/**
 * Represents the structure for an Affiliate.
 */
export interface Affiliate {
  network_affiliate_id: number;
  network_id: number;
  name: string;
  account_status: string;
}

/**
 * Represents the structure for an Affiliate Manager.
 */
export interface AffiliateManager {
  network_employee_id: number;
  network_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  account_status: string;
}

/**
 * Represents the structure for a Campaign.
 */
export interface Campaign {
  network_campaign_id: number;
  network_id: number;
  campaign_name: string;
  campaign_status: string;
}

/**
 * Represents the nested relationship data within a Conversion.
 */
export interface Relationship {
  offer: Offer;
  advertiser: Advertiser;
  account_manager: AccountManager;
  affiliate: Affiliate;
  affiliate_manager: AffiliateManager;
  campaign: Campaign;
  query_parameters: Record<string, unknown>; // Represents an empty object {}
  events_count?: number; // This field is optional
  attribution_method: string;
  usm_data: null;
}

/**
 * Represents the main Conversion object.
 */
export interface Conversion {
  conversion_id: string;
  conversion_unix_timestamp: number;
  sub1: string;
  sub2: string;
  sub3: string;
  sub4: string;
  sub5: string;
  source_id: string;
  status: string;
  payout_type: string;
  revenue_type: string;
  payout: number;
  revenue: number;
  session_user_ip: string;
  conversion_user_ip: string;
  country: string;
  region: string;
  city: string;
  dma: number;
  carrier: string;
  platform: string;
  os_version: string;
  device_type: string;
  device_model: string;
  brand: string;
  browser: string;
  language: string;
  http_user_agent: string;
  adv1: string;
  adv2: string;
  adv3: string;
  adv4: string;
  adv5: string;
  is_event: boolean;
  event: string;
  notes: string;
  transaction_id: string;
  click_unix_timestamp: number;
  error_code: number;
  error_message: string;
  sale_amount: number;
  is_scrub: boolean;
  coupon_code: string;
  order_id: string;
  url: string;
  isp: string;
  referer: string;
  app_id: string;
  idfa: string;
  idfa_md5: string;
  idfa_sha1: string;
  google_ad_id: string;
  google_ad_id_md5: string;
  google_ad_id_sha1: string;
  android_id: string;
  android_id_md5: string;
  android_id_sha1: string;
  currency_id: string;
  email: string;
  is_view_through: boolean;
  previous_network_offer_id: number;
  relationship: Relationship;
  network_offer_payout_revenue_id: number;
}

/**
 * Represents the pagination information.
 */
export interface Paging {
  page: number;
  page_size: number;
  total_count: number;
}

/**
 * Represents the top-level API response structure.
 */
export interface ResponseGetConversionParterReportService {
  conversions: Conversion[];
  paging: Paging;
}

export type ReqeustGetConversionParterReportService = {
  startDate: string;
  endDate: string;
  resource_types: { resource_type: string; filter_id_value: string }[];
  page: number;
};
export async function GetConversionParterReportService(
  input: ReqeustGetConversionParterReportService,
): Promise<ResponseGetConversionParterReportService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const summary = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/conversions`,
      data: input,
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    return summary.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
