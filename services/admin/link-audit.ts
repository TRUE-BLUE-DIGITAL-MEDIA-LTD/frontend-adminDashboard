import axios from "axios";
import { parseCookies } from "nookies";
import { DomainAudit, LinkAuditResult } from "../../models";

const base = () => `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/link-audit`;
const auth = () => {
  const access_token = parseCookies().access_token;
  return { headers: { Authorization: "Bearer " + access_token } };
};

export interface ListLinkAuditResponse {
  results: LinkAuditResult[];
  totalPages: number;
  currentPage: number;
}

export async function ListLinkAuditService(params: {
  status?: string;
  search?: string;
  page: number;
}): Promise<ListLinkAuditResponse> {
  try {
    const { data } = await axios.get(base(), { ...auth(), params });
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data ?? err;
  }
}

export async function ScanDomainAuditService(
  domainId: string,
): Promise<DomainAudit> {
  try {
    const { data } = await axios.get(`${base()}/domain/${domainId}`, auth());
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data ?? err;
  }
}

export async function RescanLinkAuditService(): Promise<{ scanned: number }> {
  try {
    const { data } = await axios.post(`${base()}/rescan`, {}, auth());
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data ?? err;
  }
}

export async function FixLinkService(
  landingPageId: string,
): Promise<DomainAudit> {
  try {
    const { data } = await axios.post(
      `${base()}/fix`,
      { landingPageId },
      auth(),
    );
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data ?? err;
  }
}
