import axios from 'axios';
import { parseCookies } from 'nookies';

export type TrustedDeviceItem = {
  id: string;
  browser: string | null;
  os: string | null;
  lastSeenAt: string;
  lastIp: string | null;
  country: string | null;
  city: string | null;
  expiresAt: string;
  isCurrent: boolean;
};

export async function ListTrustedDevicesService(): Promise<TrustedDeviceItem[]> {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  try {
    const res = await axios({
      method: 'GET',
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/trusted-devices`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error: any) {
    console.error(error?.response?.data);
    throw error?.response?.data;
  }
}

export async function RevokeTrustedDeviceService(id: string): Promise<void> {
  const cookies = parseCookies();
  const access_token = cookies.access_token;
  try {
    await axios({
      method: 'DELETE',
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/trusted-devices/${id}`,
      headers: { Authorization: `Bearer ${access_token}` },
      withCredentials: true,
    });
  } catch (error: any) {
    console.error(error?.response?.data);
    throw error?.response?.data;
  }
}
