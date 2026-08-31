import axios from "axios";
import { parseCookies } from "nookies";
import {
  InboundEmailDetail,
  InboundEmailRow,
  InboxDomainGroup,
} from "../../models";

const base = () => `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/inbound-mail`;
const auth = () => {
  const access_token = parseCookies().access_token;
  return { headers: { Authorization: "Bearer " + access_token } };
};

export async function ListMailboxesService(params: {
  domainId?: string;
}): Promise<{ domains: InboxDomainGroup[] }> {
  try {
    const { data } = await axios.get(`${base()}/mailboxes`, {
      ...auth(),
      params,
    });
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data ?? err;
  }
}

export async function ListInboundEmailsService(params: {
  mailboxId: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: InboundEmailRow[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    prev: number | null;
    next: number | null;
  };
}> {
  try {
    const { data } = await axios.get(`${base()}/emails`, {
      ...auth(),
      params,
    });
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data ?? err;
  }
}

export async function GetInboundEmailService(
  emailId: string,
): Promise<InboundEmailDetail> {
  try {
    const { data } = await axios.get(`${base()}/emails/${emailId}`, auth());
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data ?? err;
  }
}

export async function MarkEmailReadService(
  emailId: string,
): Promise<InboundEmailRow> {
  try {
    const { data } = await axios.patch(
      `${base()}/emails/${emailId}/read`,
      {},
      auth(),
    );
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data ?? err;
  }
}

export async function EnableMailService(input: {
  domainId: string;
}): Promise<{ mailEnabled: boolean }> {
  try {
    const { data } = await axios.patch(
      `${base()}/domains/${input.domainId}/enable`,
      {},
      auth(),
    );
    return data;
  } catch (err: any) {
    console.log(err);
    throw err.response?.data ?? err;
  }
}
