import axios from "axios";
import moment from "moment";
import { parseCookies } from "nookies";

export type RequestGetParterPerformancesByDate = {
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
  | "campaign"
  | "advertiser";

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
  input: RequestGetParterPerformancesByDate,
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

export async function GetParterPerformanceByDate(
  input: RequestGetParterPerformancesByDate,
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
  input: RequestGetParterPerformancesByDate,
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
export type ResponseGetConversionParterReportService = ConversionRawData[];

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

export type ResponseGetCampaignsService = ResponseCampaign[];
export type ReqeustGetCampaignsService = {
  campaign_name: string;
};
export async function GetCampaignsService(
  input: ReqeustGetCampaignsService,
): Promise<ResponseGetCampaignsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const summary = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/campaigns`,
      params: input,
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

export interface ResponseGetPartnerSummaryStatsService {
  today: Reporting;
  yesterday: Reporting;
  thisMonth: Reporting;
  last30Days: Reporting;
  lastMonth: Reporting;
}

export async function GetPartnerSummaryStatsService(): Promise<ResponseGetPartnerSummaryStatsService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const summary = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/summary-stats`,
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

export type UpdateBulkExchangeRateDto = {
  startDate: string;
  endDate: string;
  country: string;
  target_currency: number;
  currency_id: string;
  currency_converted_id: string;
  campaign_id: number;
};

export async function UpdateBulkExchangeRateService(
  data: UpdateBulkExchangeRateDto,
): Promise<ConversionRawData[]> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/partner-report/update-bulk-exchange-rate`,
      data: data,
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCampaign = {
  network_campaign_id: number;
  network_id: number;
  campaign_name: string;
  campaign_status: string;
  network_tracking_domain_id: number;
  is_use_secure_link: boolean;
  redirect_routing_type: string;
  catch_all_network_offer_id: number;
  is_open_to_affiliates: boolean;
  run_frequency: string;
  metric: string;
  optimization_goal: number;
  data_lookback_window: string;
  data_collection_threshold: number;
  time_created: number;
  time_saved: number;
};

export interface ConversionRawData {
  update_timestamp: number;
  conversion_id: string;
  transaction_id: string;
  /** Format: YYYY-MM-DD HH:MM:SS */
  date: string;
  /** Format: YYYY-MM-DD HH:MM:SS */
  click_date: string;
  /** Float represented as string (e.g. "0.04") */
  delta_hours: string;
  network_id: string;
  network_affiliate_id: string;
  network_offer_id: string;
  network_offer_group_id: string;
  network_campaign_id: string;
  click_timestamp: number;
  affiliate_manager_id: string;
  network_advertiser_id: string;
  account_manager_id: string;
  network_offer_creative_id: string;
  category_id: string;
  previous_network_offer_id: string;
  network_offer_payout_revenue_id: string;
  exchange_rate?: string;
  currency_converted_id?: string;
  source_id: string;
  sub1: string;
  sub2: string;
  sub3: string;
  sub4: string;
  sub5: string;
  adv1: string;
  adv2: string;
  adv3: string;
  adv4: string;
  adv5: string;
  session_user_ip: string;
  conversion_user_ip: string;
  http_user_agent: string;
  project_id: string;
  payout_type: string;
  revenue_type: string;
  country: string;
  region: string;
  city: string;
  dma: string;
  carrier: string;
  platform: string;
  os_version: string;
  device_type: string;
  brand: string;
  browser: string;
  language: string;
  /** "0" or "1" representing boolean */
  is_cookie_based: "0" | "1";
  previous_transaction_id: string;
  conversion_status: "approved" | "pending" | "rejected" | string;
  /** "0" or "1" representing boolean */
  is_event_protected: "0" | "1";
  event_name: string;
  /** Decimal string (e.g. ".50") */
  payout: string;
  /** Decimal string (e.g. "1.00") */
  revenue: string;
  notes: string;
  /** "0" or "1" representing boolean */
  is_fired_pixel: "0" | "1";
  /** "0" or "1" representing boolean */
  is_scrub: "0" | "1";
  /** "0" or "1" representing boolean */
  is_view_through: "0" | "1";
  coupon_code: string;
  order_id: string;
  error_code: string;
  sale_amount: string;
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
  usm_data: string;
  /** UNIX timestamp (Actual number) */
  conversion_timestamp: number;
  network_offer_url_id: string;
  query_parameters: Record<string, string>;
}
